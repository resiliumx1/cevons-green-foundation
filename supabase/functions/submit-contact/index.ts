// Public submit endpoint for the contact form.
// - Deduplicates against recent (last 7 days) submissions
// - Inserts the message with a short MSG-XXXXX reference
// - Notifications are created by a DB trigger
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

function normPhone(s: string | null | undefined): string {
  return (s ?? "").replace(/[^\d]/g, "");
}

function normText(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

interface Payload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  attachment_url?: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Payload;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? "").trim();
  const subject = (body.subject ?? "").trim() || "General Inquiry";
  const message = (body.message ?? "").trim();

  if (!name || name.length > 200) return json({ error: "Invalid name" }, 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320)
    return json({ error: "Invalid email" }, 400);
  if (!message || message.length > 5000) return json({ error: "Invalid message" }, 400);
  if (phone && phone.length > 40) return json({ error: "Invalid phone" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Duplicate check: same email or phone, within 7 days, with same subject OR same message text.
  const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const phoneDigits = normPhone(phone);
  const msgNorm = normText(message);

  const orParts: string[] = [`email.eq.${email}`];
  if (phoneDigits) orParts.push(`phone.eq.${phone}`);

  const { data: recent } = await supabase
    .from("contact_messages")
    .select("id, reference, subject, message, email, phone, created_at")
    .gte("created_at", sinceIso)
    .or(orParts.join(","))
    .order("created_at", { ascending: false })
    .limit(25);

  const dup = (recent ?? []).find((r) => {
    const sameEmail = (r.email ?? "").toLowerCase() === email;
    const samePhone = phoneDigits && normPhone(r.phone) === phoneDigits;
    if (!sameEmail && !samePhone) return false;
    const sameSubject = normText(r.subject) === normText(subject);
    const sameMessage = normText(r.message) === msgNorm;
    return sameSubject || sameMessage;
  });

  if (dup) {
    return json({
      result: "duplicate",
      reference: dup.reference,
      received_at: dup.created_at,
    });
  }

  // Generate reference
  const { data: refData, error: refErr } = await supabase
    .rpc("generate_contact_message_reference");
  if (refErr) return json({ error: "Could not generate reference" }, 500);
  const reference = refData as string;

  const insertRow = {
    reference,
    name,
    email,
    phone: phone || null,
    subject,
    message,
    attachment_url: body.attachment_url || null,
    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
    utm_term: body.utm_term || null,
    utm_content: body.utm_content || null,
    referrer: body.referrer || null,
    landing_page: body.landing_page || null,
  };

  const { error: insErr } = await supabase.from("contact_messages").insert(insertRow);
  if (insErr) return json({ error: "Failed to save message" }, 500);

  return json({ result: "received", reference });
});
