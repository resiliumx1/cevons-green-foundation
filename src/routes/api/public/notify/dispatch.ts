/**
 * Internal notification dispatcher.
 *
 * Called server-to-server by the public submit Edge Functions right after a
 * lead row is written. It renders the staff notification email and pushes one
 * message per recipient onto the `transactional_emails` pgmq queue, which the
 * queue processor drains.
 *
 * Auth: caller must present the project service-role key as a bearer token.
 * It is never callable from a browser.
 *
 * This endpoint always answers 200 for authorized callers, even when it skips
 * or fails, so a mail problem can never turn into a failed lead capture.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { renderServiceRequestEmail } from "@/lib/email-templates/service-request";
import { renderContactMessageEmail } from "@/lib/email-templates/contact-message";
import {
  DEFAULT_NOTIFICATION_RECIPIENTS,
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  EMAIL_SENDER_DOMAIN,
  SITE_URL,
  normalizeRecipients,
} from "@/lib/notify/config";
import { sendWhatsAppNotification } from "@/lib/notify/whatsapp";

type Kind = "service_request" | "contact_message";

export const Route = createFileRoute("/api/public/notify/dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        const supabaseUrl = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];

        if (!serviceKey || !supabaseUrl) {
          console.error("notify/dispatch: missing server configuration");
          return Response.json({ ok: false, reason: "server_misconfigured" }, { status: 500 });
        }

        const dispatchSecret = process.env["NOTIFY_DISPATCH_SECRET"];
        const auth = request.headers.get("Authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        const authorized =
          (!!dispatchSecret && token === dispatchSecret) || token === serviceKey;
        if (!authorized) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: { kind?: Kind; reference?: string; data?: Record<string, unknown> };
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, reason: "invalid_json" });
        }

        const kind = body.kind;
        const reference = String(body.reference ?? "").trim();
        const data = (body.data ?? {}) as Record<string, any>;

        if ((kind !== "service_request" && kind !== "contact_message") || !reference) {
          return Response.json({ ok: false, reason: "invalid_payload" });
        }

        try {
          const supabase = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
          });

          const { data: settingRow } = await supabase
            .from("crm_settings")
            .select("value")
            .eq("key", "notification_recipients")
            .maybeSingle();

          const settings = settingRow?.value
            ? normalizeRecipients(settingRow.value)
            : DEFAULT_NOTIFICATION_RECIPIENTS;

          // WhatsApp runs on the same trigger, guarded by its own switch.
          // It is a logging no-op until a provider is configured.
          await sendWhatsAppNotification({
            kind,
            reference,
            summary:
              kind === "service_request"
                ? `New service request ${reference}`
                : `New contact message ${reference}`,
            numbers: settings.whatsapp.numbers,
            enabled: settings.whatsapp.enabled,
          });

          if (!settings.enabled) {
            console.log("Email notification skipped (sending disabled in settings)", {
              kind,
              reference,
            });
            return Response.json({ ok: true, skipped: "disabled" });
          }

          const recipients =
            kind === "service_request" ? settings.serviceRequests : settings.contactMessages;

          if (!recipients.length) {
            console.log("Email notification skipped (no recipients configured)", {
              kind,
              reference,
            });
            return Response.json({ ok: true, skipped: "no_recipients" });
          }

          const rendered =
            kind === "service_request"
              ? renderServiceRequestEmail({
                  reference,
                  service: data.service ?? null,
                  category: data.category ?? null,
                  customerType: data.customer_type ?? null,
                  name: data.name ?? null,
                  email: data.email ?? null,
                  phone: data.phone ?? null,
                  company: data.company ?? null,
                  region: data.region ?? null,
                  preferredDate: data.preferred_date ?? null,
                  preferredTime: data.preferred_time ?? null,
                  contactMethod: data.contact_method ?? null,
                  message: data.message ?? null,
                  details: (data.details ?? null) as Record<string, unknown> | null,
                  fileUrls: Array.isArray(data.file_urls) ? data.file_urls : [],
                  crmUrl: `${SITE_URL}/admin/leads?q=${encodeURIComponent(reference)}`,
                })
              : renderContactMessageEmail({
                  reference,
                  name: data.name ?? null,
                  email: data.email ?? null,
                  phone: data.phone ?? null,
                  subject: data.subject ?? null,
                  message: data.message ?? null,
                  attachmentUrl: data.attachment_url ?? null,
                  crmUrl: `${SITE_URL}/admin/messages?q=${encodeURIComponent(reference)}`,
                });

          const queuedAt = new Date().toISOString();
          const attempt = Date.now().toString(36);
          const queued: number[] = [];

          /** One stable unsubscribe token per address; the send API requires it. */
          const unsubscribeTokenFor = async (email: string): Promise<string> => {
            const { data: existing } = await supabase
              .from("email_unsubscribe_tokens")
              .select("token")
              .eq("email", email)
              .maybeSingle();
            if (existing?.token) return existing.token;

            const token = crypto.randomUUID().replace(/-/g, "");
            const { error: insErr } = await supabase
              .from("email_unsubscribe_tokens")
              .insert({ email, token });
            if (insErr) {
              const { data: raced } = await supabase
                .from("email_unsubscribe_tokens")
                .select("token")
                .eq("email", email)
                .maybeSingle();
              if (raced?.token) return raced.token;
              throw insErr;
            }
            return token;
          };

          for (const to of recipients) {
            // Stable per submission + recipient + dispatch attempt: queue retries
            // reuse it (no double send), while a fresh dispatch is not rejected
            // by the provider as a previously failed idempotency key.
            const idempotencyKey = `${kind}:${reference}:${to}:${attempt}`;
            const unsubscribeToken = await unsubscribeTokenFor(to);
            const { data: msgId, error } = await supabase.rpc("enqueue_email", {
              queue_name: "transactional_emails",
              payload: {
                to,
                from: EMAIL_FROM,
                reply_to: EMAIL_REPLY_TO,
                sender_domain: EMAIL_SENDER_DOMAIN,
                subject: rendered.subject,
                html: rendered.html,
                text: rendered.text,
                purpose: "transactional",
                label: kind === "service_request" ? "service-request-notification" : "contact-message-notification",
                idempotency_key: idempotencyKey,
                unsubscribe_token: unsubscribeToken,
                message_id: idempotencyKey,
                queued_at: queuedAt,
              } as never,
            });

            if (error) {
              console.error("Failed to enqueue notification email", { kind, reference, to, error });
              await supabase.from("email_send_log").insert({
                message_id: idempotencyKey,
                template_name: kind,
                recipient_email: to,
                status: "failed",
                error_message: String(error.message ?? error).slice(0, 1000),
              });
              continue;
            }
            queued.push(Number(msgId));
          }

          console.log("Notification emails enqueued", { kind, reference, queued: queued.length });
          return Response.json({ ok: true, queued: queued.length });
        } catch (err) {
          // Never propagate: the caller must still return the customer's reference.
          console.error("notify/dispatch failed", err);
          return Response.json({ ok: false, reason: "dispatch_error" });
        }
      },
    },
  },
});
