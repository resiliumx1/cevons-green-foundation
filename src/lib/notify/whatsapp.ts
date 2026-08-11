/**
 * Provider-agnostic WhatsApp notification hook.
 *
 * SHIPPED AS A NO-OP ON PURPOSE. It never performs an outbound call and it
 * carries no provider SDK or credential. It exists so the send path is wired
 * and can be switched on from /admin/settings later.
 *
 * TODO (real implementation, when the client is ready):
 *   1. Choose a provider - Twilio WhatsApp API or the WhatsApp Business Cloud
 *      API (Meta).
 *   2. Add provider credentials as project secrets, e.g.
 *      TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM, or
 *      WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN.
 *   3. Register and get approval for a message template - WhatsApp does not
 *      allow free-form business-initiated messages outside the 24h window.
 *   4. Replace the no-op branch below with the provider call, keeping the
 *      `enabled` guard and the caller's try/catch intact.
 */

export interface WhatsAppNotificationPayload {
  kind: "service_request" | "contact_message";
  reference: string;
  /** Short human-readable summary line. */
  summary: string;
  /** Destination numbers in E.164 format. */
  numbers: string[];
  /** Master switch, read from crm_settings.notification_recipients.whatsapp. */
  enabled: boolean;
}

export interface WhatsAppNotificationResult {
  sent: boolean;
  reason: "disabled" | "no_numbers" | "no_provider";
}

export async function sendWhatsAppNotification(
  payload: WhatsAppNotificationPayload
): Promise<WhatsAppNotificationResult> {
  if (!payload.enabled) {
    console.log("WhatsApp notification skipped (disabled)", {
      kind: payload.kind,
      reference: payload.reference,
    });
    return { sent: false, reason: "disabled" };
  }

  if (!payload.numbers.length) {
    console.log("WhatsApp notification skipped (no numbers configured)", {
      kind: payload.kind,
      reference: payload.reference,
    });
    return { sent: false, reason: "no_numbers" };
  }

  // No provider configured yet: still a no-op, never an outbound call.
  console.log("WhatsApp notification skipped (no provider configured)", {
    kind: payload.kind,
    reference: payload.reference,
    recipients: payload.numbers.length,
  });
  return { sent: false, reason: "no_provider" };
}
