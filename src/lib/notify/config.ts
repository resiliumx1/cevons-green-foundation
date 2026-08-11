/**
 * Single place where the outbound notification identity is configured.
 * Change the sender domain here and every notification follows.
 */

/** Verified (or pending) Lovable sending subdomain. */
export const EMAIL_SENDER_DOMAIN = "notify.cevons.com";

/** Local part of the envelope sender. */
export const EMAIL_FROM_LOCAL = "no-reply";

/** Display name shown in the inbox. */
export const EMAIL_FROM_NAME = "CEVONS Waste Management";

/** Real, monitored Bluehost inbox that replies must land in. */
export const EMAIL_REPLY_TO = "info@cevons.com";

/** Public site base, used to build "Open in CRM" links. */
export const SITE_URL = "https://cevons.com";

export const EMAIL_FROM_ADDRESS = `${EMAIL_FROM_LOCAL}@${EMAIL_SENDER_DOMAIN}`;
export const EMAIL_FROM = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;

/** Shape stored in crm_settings under the key `notification_recipients`. */
export interface NotificationRecipients {
  enabled: boolean;
  serviceRequests: string[];
  contactMessages: string[];
  whatsapp: { enabled: boolean; numbers: string[] };
}

export const DEFAULT_NOTIFICATION_RECIPIENTS: NotificationRecipients = {
  enabled: true,
  serviceRequests: ["sales@cevons.com"],
  contactMessages: ["sales@cevons.com"],
  whatsapp: { enabled: false, numbers: [] },
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeRecipients(value: unknown): NotificationRecipients {
  const v = (value ?? {}) as Partial<NotificationRecipients>;
  const list = (input: unknown): string[] =>
    Array.isArray(input)
      ? Array.from(
          new Set(
            input
              .map((e) => String(e ?? "").trim().toLowerCase())
              .filter((e) => EMAIL_RE.test(e))
          )
        )
      : [];
  return {
    enabled: v.enabled !== false,
    serviceRequests: list(v.serviceRequests),
    contactMessages: list(v.contactMessages),
    whatsapp: {
      enabled: Boolean(v.whatsapp?.enabled),
      numbers: Array.isArray(v.whatsapp?.numbers)
        ? v.whatsapp.numbers.map((n) => String(n ?? "").trim()).filter(Boolean)
        : [],
    },
  };
}
