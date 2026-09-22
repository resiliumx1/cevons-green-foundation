/**
 * ManyChat bridge — shared, client-safe settings and helpers.
 *
 * CEVONS keeps ManyChat as the place the team actually chats with customers.
 * This bridge only mirrors those conversations into the CRM and asks ManyChat
 * to send messages back out. It never connects to WhatsApp directly, so the
 * team's existing ManyChat inbox keeps working exactly as it does today.
 */

/** Stored in crm_settings under the key `manychat`. */
export interface ManyChatSettings {
  /** Mirror incoming ManyChat chats into the Requests table. */
  inboundEnabled: boolean;
  /** Send the Google review follow-up over WhatsApp as well as by email. */
  reviewWhatsappEnabled: boolean;
  /** ManyChat flow id (ns-...) used for the review follow-up. Optional. */
  reviewFlowNs: string;
  /** Service recorded on requests that arrive from a chat. */
  defaultService: string;
}

export const DEFAULT_MANYCHAT_SETTINGS: ManyChatSettings = {
  inboundEnabled: true,
  reviewWhatsappEnabled: false,
  reviewFlowNs: "",
  defaultService: "",
};

export function normalizeManyChatSettings(value: unknown): ManyChatSettings {
  const v = (value ?? {}) as Partial<ManyChatSettings>;
  const ns = String(v.reviewFlowNs ?? "").trim();
  return {
    inboundEnabled: v.inboundEnabled !== false,
    reviewWhatsappEnabled: Boolean(v.reviewWhatsappEnabled),
    reviewFlowNs: /^(content|ns)[\w-]*$/i.test(ns) || ns === "" ? ns : "",
    defaultService: String(v.defaultService ?? "").trim().slice(0, 120),
  };
}

/** Digits-only E.164 form (no plus), or "" when the input is not usable. */
export function normalizePhone(input: unknown): string {
  const digits = String(input ?? "").replace(/[^\d]/g, "");
  if (digits.length < 7 || digits.length > 15) return "";
  return digits;
}

/** Deep link that opens this customer's live chat inside ManyChat. */
export function manychatThreadUrl(subscriberId: string | null | undefined): string | null {
  const id = String(subscriberId ?? "").trim();
  if (!/^\d+$/.test(id)) return null;
  return `https://app.manychat.com/subscriber/${id}`;
}
