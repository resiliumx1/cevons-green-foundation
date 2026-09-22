/**
 * Google review follow-ups.
 *
 * A follow-up row is queued by a database trigger the moment a service request
 * is marked Won (job completed). This module sends the due ones. It never
 * invents customer details and never sends unless an admin has switched the
 * automation on and saved a real Google review link.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { renderReviewRequestEmail } from "@/lib/email-templates/review-request";
import { sendRawEmail } from "@/lib/email-templates/send-email";
import { EMAIL_REPLY_TO } from "@/lib/notify/config";
import { normalizeReviewFollowup, type ReviewFollowupSettings } from "@/lib/reviews/config";

export async function loadReviewFollowupSettings(): Promise<ReviewFollowupSettings> {
  const { data } = await supabaseAdmin
    .from("crm_settings")
    .select("value")
    .eq("key", "review_followup")
    .maybeSingle();
  return normalizeReviewFollowup(data?.value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ReviewFollowupDrainResult {
  configured: boolean;
  attempted: number;
  sent: number;
  skipped: number;
  failed: number;
}

/** Sends one queued follow-up row. Returns the resulting status. */
async function sendOne(
  row: {
    id: string;
    reference: string | null;
    recipient_email: string | null;
    recipient_name: string | null;
    service: string | null;
    attempts: number;
  },
  reviewUrl: string
): Promise<"sent" | "skipped" | "failed"> {
  const email = (row.recipient_email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    await supabaseAdmin
      .from("review_followups")
      .update({
        status: "skipped",
        last_error: "No email address on the request",
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return "skipped";
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
        status: result.sent ? "sent" : "skipped",
        sent_at: result.sent ? new Date().toISOString() : null,
        attempts: row.attempts + 1,
        last_error: result.sent ? null : "Recipient is suppressed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return result.sent ? "sent" : "skipped";
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
    return "failed";
  }
}

/** Sends every follow-up that is due. Safe to call repeatedly. */
export async function drainReviewFollowups(limit = 25): Promise<ReviewFollowupDrainResult> {
  const settings = await loadReviewFollowupSettings();
  if (!settings.enabled || !settings.reviewUrl) {
    return { configured: false, attempted: 0, sent: 0, skipped: 0, failed: 0 };
  }

  const { data, error } = await supabaseAdmin
    .from("review_followups")
    .select("id, reference, recipient_email, recipient_name, service, attempts")
    .eq("status", "pending")
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) throw new Error(error.message);

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const row of data ?? []) {
    const outcome = await sendOne(row, settings.reviewUrl);
    if (outcome === "sent") sent += 1;
    else if (outcome === "skipped") skipped += 1;
    else failed += 1;
  }

  return { configured: true, attempted: data?.length ?? 0, sent, skipped, failed };
}

/** Sends a single follow-up immediately, ignoring its scheduled time. */
export async function sendReviewFollowupNow(
  followupId: string
): Promise<{ status: "sent" | "skipped" | "failed"; reason?: string }> {
  const settings = await loadReviewFollowupSettings();
  if (!settings.reviewUrl) {
    return { status: "skipped", reason: "Add your Google review link in Settings first." };
  }

  const { data, error } = await supabaseAdmin
    .from("review_followups")
    .select("id, reference, recipient_email, recipient_name, service, attempts")
    .eq("id", followupId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { status: "failed", reason: "Follow-up not found." };

  const status = await sendOne(data, settings.reviewUrl);
  return { status };
}
