/**
 * Google review follow-ups.
 *
 * A follow-up row is queued by a database trigger the moment a service request
 * is marked Won (job completed). This module sends the due ones by email and,
 * when the ManyChat bridge is switched on, also as a WhatsApp message through
 * ManyChat. It never invents customer details and never sends unless an admin
 * has switched the automation on and saved a real Google review link.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { renderReviewRequestEmail } from "@/lib/email-templates/review-request";
import { sendRawEmail } from "@/lib/email-templates/send-email";
import { EMAIL_REPLY_TO } from "@/lib/notify/config";
import { normalizeReviewFollowup, type ReviewFollowupSettings } from "@/lib/reviews/config";
import { normalizePhone, type ManyChatSettings } from "@/lib/manychat/config";
import { loadManyChatSettings } from "@/lib/manychat/intake.server";

export async function loadReviewFollowupSettings(): Promise<ReviewFollowupSettings> {
  const { data } = await supabaseAdmin
    .from("crm_settings")
    .select("value")
    .eq("key", "review_followup")
    .maybeSingle();
  return normalizeReviewFollowup(data?.value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SELECT_COLUMNS =
  "id, reference, recipient_email, recipient_name, service, attempts, recipient_phone, manychat_subscriber_id, whatsapp_status, whatsapp_attempts";

interface FollowupRow {
  id: string;
  reference: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  service: string | null;
  attempts: number;
  recipient_phone: string | null;
  manychat_subscriber_id: string | null;
  whatsapp_status: string | null;
  whatsapp_attempts: number | null;
}

export interface ReviewFollowupDrainResult {
  configured: boolean;
  attempted: number;
  sent: number;
  skipped: number;
  failed: number;
  whatsappSent: number;
}

/** Plain, honest WhatsApp wording — only facts already on the request. */
function whatsappText(row: FollowupRow, reviewUrl: string): string {
  const first = (row.recipient_name ?? "").trim().split(/\s+/)[0];
  const greeting = first ? `Hi ${first},` : "Hello,";
  const job = row.service ? ` with your ${row.service}` : "";
  return `${greeting} thank you for choosing CEVONS${job}. If you have a moment, a short Google review would help our team a lot: ${reviewUrl}\n\nIf anything was not right, just reply here and we will look into it.`;
}

/**
 * Sends the WhatsApp copy through ManyChat, so the team's existing ManyChat
 * inbox stays the single place the conversation lives. Never throws.
 */
async function sendWhatsAppFollowup(
  row: FollowupRow,
  reviewUrl: string,
  manychat: ManyChatSettings,
): Promise<boolean> {
  if (row.whatsapp_status && row.whatsapp_status !== "pending") return false;

  const finish = async (
    status: "sent" | "skipped" | "failed",
    error: string | null,
  ): Promise<boolean> => {
    await supabaseAdmin
      .from("review_followups")
      .update({
        whatsapp_status: status,
        whatsapp_sent_at: status === "sent" ? new Date().toISOString() : null,
        whatsapp_error: error,
        whatsapp_attempts: (row.whatsapp_attempts ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return status === "sent";
  };

  if (!manychat.reviewWhatsappEnabled) return finish("skipped", "WhatsApp follow-ups are off");

  const { manychatConfigured, findSubscriberByPhone, sendFlow, sendText } = await import(
    "@/lib/manychat/client.server"
  );
  if (!manychatConfigured()) return finish("skipped", "ManyChat is not connected");

  const phone = normalizePhone(row.recipient_phone);
  let subscriberId = (row.manychat_subscriber_id ?? "").trim();

  try {
    if (!subscriberId && phone) {
      const found = await findSubscriberByPhone(phone);
      subscriberId = found?.id ?? "";
      if (subscriberId) {
        await supabaseAdmin
          .from("review_followups")
          .update({ manychat_subscriber_id: subscriberId })
          .eq("id", row.id);
      }
    }
    if (!subscriberId) return finish("skipped", "No WhatsApp contact in ManyChat");

    if (manychat.reviewFlowNs) {
      await sendFlow(subscriberId, manychat.reviewFlowNs);
    } else {
      await sendText(subscriberId, whatsappText(row, reviewUrl));
    }

    await supabaseAdmin.from("manychat_messages").insert({
      subscriber_id: subscriberId,
      phone: phone || null,
      direction: "outbound",
      body: manychat.reviewFlowNs
        ? `Review follow-up flow ${manychat.reviewFlowNs}`
        : whatsappText(row, reviewUrl),
      kind: "review_followup",
      status: "sent",
      external_id: `review-followup:${row.id}`,
    });

    return finish("sent", null);
  } catch (err) {
    return finish("failed", String((err as Error)?.message ?? err).slice(0, 300));
  }
}

/** Sends one queued follow-up row. Returns the resulting email status. */
async function sendOne(
  row: FollowupRow,
  reviewUrl: string,
  manychat: ManyChatSettings,
): Promise<{ status: "sent" | "skipped" | "failed"; whatsappSent: boolean }> {
  const whatsappSent = await sendWhatsAppFollowup(row, reviewUrl, manychat);

  const email = (row.recipient_email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    await supabaseAdmin
      .from("review_followups")
      .update({
        status: whatsappSent ? "sent" : "skipped",
        sent_at: whatsappSent ? new Date().toISOString() : null,
        last_error: whatsappSent ? null : "No email address on the request",
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { status: whatsappSent ? "sent" : "skipped", whatsappSent };
  }

  const { subject, html, text } = renderReviewRequestEmail({
    name: row.recipient_name,
    service: row.service,
    reference: row.reference,
    reviewUrl,
  });

  try {
    const result = await sendRawEmail({
      to: email,
      subject,
      html,
      text,
      label: "review-followup",
      replyTo: EMAIL_REPLY_TO,
      idempotencyKey: `review-followup:${row.id}`,
    });
    await supabaseAdmin
      .from("review_followups")
      .update({
        status: result.sent || whatsappSent ? "sent" : "skipped",
        sent_at: result.sent || whatsappSent ? new Date().toISOString() : null,
        attempts: row.attempts + 1,
        last_error: result.sent ? null : "Recipient is suppressed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { status: result.sent || whatsappSent ? "sent" : "skipped", whatsappSent };
  } catch (err) {
    const attempts = row.attempts + 1;
    await supabaseAdmin
      .from("review_followups")
      .update({
        status: attempts >= 5 ? "failed" : "pending",
        attempts,
        last_error: String((err as Error)?.message ?? err).slice(0, 300),
        due_at: new Date(Date.now() + attempts * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { status: "failed", whatsappSent };
  }
}

/** Sends every follow-up that is due. Safe to call repeatedly. */
export async function drainReviewFollowups(limit = 25): Promise<ReviewFollowupDrainResult> {
  const settings = await loadReviewFollowupSettings();
  if (!settings.enabled || !settings.reviewUrl) {
    return { configured: false, attempted: 0, sent: 0, skipped: 0, failed: 0, whatsappSent: 0 };
  }

  const manychat = await loadManyChatSettings();

  const { data, error } = await supabaseAdmin
    .from("review_followups")
    .select(SELECT_COLUMNS)
    .eq("status", "pending")
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) throw new Error(error.message);

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  let whatsappSent = 0;
  for (const row of (data ?? []) as FollowupRow[]) {
    const outcome = await sendOne(row, settings.reviewUrl, manychat);
    if (outcome.whatsappSent) whatsappSent += 1;
    if (outcome.status === "sent") sent += 1;
    else if (outcome.status === "skipped") skipped += 1;
    else failed += 1;
  }

  return { configured: true, attempted: data?.length ?? 0, sent, skipped, failed, whatsappSent };
}

/** Sends a single follow-up immediately, ignoring its scheduled time. */
export async function sendReviewFollowupNow(
  followupId: string,
): Promise<{ status: "sent" | "skipped" | "failed"; reason?: string }> {
  const settings = await loadReviewFollowupSettings();
  if (!settings.reviewUrl) {
    return { status: "skipped", reason: "Add your Google review link in Settings first." };
  }

  const { data, error } = await supabaseAdmin
    .from("review_followups")
    .select(SELECT_COLUMNS)
    .eq("id", followupId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { status: "failed", reason: "Follow-up not found." };

  const manychat = await loadManyChatSettings();
  const outcome = await sendOne(data as FollowupRow, settings.reviewUrl, manychat);
  return { status: outcome.status };
}
