/**
 * ManyChat inbound intake — SERVER ONLY.
 *
 * Turns a verified ManyChat webhook delivery into CRM records: the chat is
 * logged, and the customer appears in the Requests table (matched onto their
 * open request when they already have one, so a conversation never creates
 * duplicates). Nothing here invents customer details: only the values ManyChat
 * actually sent are stored.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  DEFAULT_MANYCHAT_SETTINGS,
  normalizeManyChatSettings,
  normalizePhone,
  type ManyChatSettings,
} from "./config";

export async function loadManyChatSettings(): Promise<ManyChatSettings> {
  const { data } = await supabaseAdmin
    .from("crm_settings")
    .select("value")
    .eq("key", "manychat")
    .maybeSingle();
  return data?.value ? normalizeManyChatSettings(data.value) : DEFAULT_MANYCHAT_SETTINGS;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max = 500): string {
  return String(value ?? "").trim().slice(0, max);
}

export interface ManyChatContactPayload {
  subscriberId: string;
  phone: string;
  name: string;
  email: string;
  service: string;
  message: string;
  location: string;
}

/** Reads the fields ManyChat's External Request block sends, in any casing. */
export function readContactPayload(body: Record<string, unknown>): ManyChatContactPayload {
  const pick = (...keys: string[]): unknown => {
    for (const key of keys) {
      const found = Object.entries(body).find(
        ([k]) => k.toLowerCase().replace(/[^a-z]/g, "") === key,
      );
      if (found && found[1] !== null && found[1] !== undefined && found[1] !== "") return found[1];
    }
    return undefined;
  };

  const email = str(pick("email", "useremail"), 320).toLowerCase();
  return {
    subscriberId: str(pick("subscriberid", "id", "contactid"), 64),
    phone: normalizePhone(pick("phone", "whatsappphone", "phonenumber")),
    name: str(pick("name", "fullname", "firstname"), 200),
    email: EMAIL_RE.test(email) ? email : "",
    service: str(pick("service", "servicerequested", "interest"), 120),
    message: str(pick("message", "text", "lastinputtext", "question"), 4000),
    location: str(pick("location", "address", "area"), 300),
  };
}

export interface IntakeResult {
  serviceRequestId: string | null;
  created: boolean;
  reason?: string;
}

/**
 * Matches or creates the request, then logs the inbound chat line.
 * Safe to run twice for the same delivery: the caller dedupes on delivery id
 * and the message log is only written once the request is resolved.
 */
export async function intakeManyChatContact(
  payload: ManyChatContactPayload,
  settings: ManyChatSettings,
): Promise<IntakeResult> {
  if (!settings.inboundEnabled) {
    return { serviceRequestId: null, created: false, reason: "inbound_disabled" };
  }
  if (!payload.subscriberId && !payload.phone) {
    return { serviceRequestId: null, created: false, reason: "no_contact_identity" };
  }

  // Look for an open request from the same person in the last 30 days.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let existingId: string | null = null;

  if (payload.subscriberId) {
    const { data } = await supabaseAdmin
      .from("service_requests")
      .select("id")
      .eq("manychat_subscriber_id", payload.subscriberId)
      .not("status", "in", "(won,lost)")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);
    existingId = data?.[0]?.id ?? null;
  }

  if (!existingId && payload.phone) {
    const { data } = await supabaseAdmin
      .from("service_requests")
      .select("id, phone")
      .not("status", "in", "(won,lost)")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);
    const match = (data ?? []).find((r) => normalizePhone(r.phone) === payload.phone);
    existingId = match?.id ?? null;
  }

  let created = false;

  if (existingId) {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.subscriberId) patch["manychat_subscriber_id"] = payload.subscriberId;
    await supabaseAdmin.from("service_requests").update(patch).eq("id", existingId);
  } else {
    const { data, error } = await supabaseAdmin
      .from("service_requests")
      .insert({
        name: payload.name || null,
        phone: payload.phone || null,
        email: payload.email || null,
        service: payload.service || settings.defaultService || null,
        message: payload.message || null,
        region: payload.location || null,
        status: "new",
        contact_method: "whatsapp",
        source_channel: "whatsapp",
        manychat_subscriber_id: payload.subscriberId || null,
        landing_page: "ManyChat",
        details: {
          source: "manychat",
          received_at: new Date().toISOString(),
          location: payload.location || null,
        } as never,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    existingId = data.id;
    created = true;
  }

  if (payload.message) {
    await supabaseAdmin.from("manychat_messages").insert({
      service_request_id: existingId,
      subscriber_id: payload.subscriberId || null,
      phone: payload.phone || null,
      direction: "inbound",
      body: payload.message,
      kind: "chat",
      status: "logged",
    });
  }

  return { serviceRequestId: existingId, created };
}
