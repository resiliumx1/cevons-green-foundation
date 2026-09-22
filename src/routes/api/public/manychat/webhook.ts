/**
 * ManyChat → CEVONS webhook.
 *
 * ManyChat's "External Request" action posts here whenever a chat should reach
 * the CRM. Every delivery is authorised with a shared secret, stored in the
 * manychat_events inbox before anything else happens, then processed. A failed
 * write or a failed processing step answers 5xx so ManyChat retries with the
 * same delivery id; duplicates never create a second request.
 */
import { createFileRoute } from "@tanstack/react-router";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/manychat/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["MANYCHAT_WEBHOOK_SECRET"];
        if (!secret) {
          console.error("manychat webhook: MANYCHAT_WEBHOOK_SECRET is not configured");
          return Response.json({ ok: false, reason: "server_misconfigured" }, { status: 500 });
        }

        const header =
          request.headers.get("x-manychat-secret") ??
          (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!timingSafeEqual(header.trim(), secret)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, reason: "invalid_json" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { readContactPayload, intakeManyChatContact, loadManyChatSettings } = await import(
          "@/lib/manychat/intake.server"
        );

        const payload = readContactPayload(body);
        const event = String(body["event"] ?? "manychat.message").slice(0, 80);
        const deliveryId =
          String(
            request.headers.get("x-manychat-delivery") ??
              body["delivery_id"] ??
              body["message_id"] ??
              "",
          ).trim() ||
          `${payload.subscriberId || payload.phone || "unknown"}:${
            payload.message ? payload.message.slice(0, 80) : Date.now()
          }`;

        // 1. Durable receipt first — never process an unstored delivery.
        const { data: stored, error: storeError } = await supabaseAdmin
          .from("manychat_events")
          .upsert(
            {
              delivery_id: deliveryId,
              event,
              subscriber_id: payload.subscriberId || null,
              phone: payload.phone || null,
              payload: body as never,
            },
            { onConflict: "delivery_id" },
          )
          .select("id, processed_at, service_request_id, attempts")
          .single();

        if (storeError || !stored) {
          console.error("manychat webhook: inbox write failed");
          return Response.json({ ok: false, reason: "inbox_write_failed" }, { status: 500 });
        }

        if (stored.processed_at) {
          return Response.json({ ok: true, duplicate: true, request_id: stored.service_request_id });
        }

        // 2. Process once, recording the outcome on the same row.
        try {
          const settings = await loadManyChatSettings();
          const result = await intakeManyChatContact(payload, settings);
          await supabaseAdmin
            .from("manychat_events")
            .update({
              processed_at: new Date().toISOString(),
              processing_error: result.reason ?? null,
              service_request_id: result.serviceRequestId,
              attempts: (stored.attempts ?? 0) + 1,
            })
            .eq("id", stored.id);

          return Response.json({
            ok: true,
            created: result.created,
            request_id: result.serviceRequestId,
            skipped: result.reason ?? null,
          });
        } catch (err) {
          const message = String((err as Error)?.message ?? err).slice(0, 300);
          console.error("manychat webhook: processing failed", message);
          await supabaseAdmin
            .from("manychat_events")
            .update({ processing_error: message, attempts: (stored.attempts ?? 0) + 1 })
            .eq("id", stored.id);
          return Response.json({ ok: false, reason: "processing_failed" }, { status: 500 });
        }
      },
    },
  },
});
