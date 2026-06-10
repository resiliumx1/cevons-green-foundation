// Shared AI assistant edge function for CEVON'S
// Modes:
//   - "public" → Cev (customer-facing site assistant)
//   - "crm"    → Growth Command Assistant (internal CRM helper)
//
// Uses Lovable AI Gateway (google/gemini-3-flash-preview). LOVABLE_API_KEY
// is auto-provisioned in the Supabase secrets.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGES = 10;
const MAX_INPUT_CHARS = 2000;
const MAX_TOKENS = 400;

// In-memory rate limits (per isolate; best-effort)
const sessionHits = new Map<string, { count: number; reset: number }>();
const ipHits = new Map<string, { count: number; reset: number }>();
const SESSION_LIMIT = 15; // per session lifetime window
const SESSION_WINDOW_MS = 60 * 60 * 1000; // 1h
const IP_LIMIT = 30;
const IP_WINDOW_MS = 60 * 60 * 1000;

function bump(map: Map<string, { count: number; reset: number }>, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const cur = map.get(key);
  if (!cur || now > cur.reset) {
    map.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}

const PUBLIC_SYSTEM = `You are Cev, the friendly assistant on cevons.com — CEVON'S Waste Management & Industrial Services (Guyana).

Help website visitors understand services, get quotes, schedule pickups, and reach the right team. Services span Residential (trash, dumpster, septic, portable toilets), Commercial (waste mgmt, skip/dumpster, grease trap, document shredding), Industrial (hazardous waste, wastewater, used waste oil, contaminated soil, tank cleaning, product destruction, biohazardous), and Facilities (MRF, landfill). Branches: Georgetown, Linden, Berbice. ISO 9001:2015 and EPA-certified. Founded 1997.

Rules:
- Be concise, warm, professional. 2–4 short sentences typical.
- For pricing, scheduling, or specialist/industrial inquiries, recommend submitting a service request or contacting via WhatsApp.
- Never invent prices, capacities, or guaranteed timelines.
- If unsafe (regulated/hazardous), advise specialist review and ask for waste type, volume, location, urgency, and SDS docs if available.
- When WhatsApp would help, end with a brief suggestion like: "Reach us on WhatsApp for fastest response."`;

const CRM_SYSTEM = `You are the Growth Command Assistant inside CEVON'S Growth Command (the marketing CRM). You help internal staff navigate and use the CRM.

Modules and what each does:
- Dashboard (/crm) — overview KPIs: new leads, conversion rate, WhatsApp/contact clicks, revenue from won leads.
- Leads / Requests (/crm/leads) — incoming service requests with pipeline stages: New → Contacted → Quoted → Scheduled → Won / Lost. Segmented by Residential, Commercial, Industrial, Specialty. Open a lead to update status, add notes, or convert to customer.
- Conversations (/crm/conversations) — call/message/note log per lead.
- Customers (/crm/customers) — customer records.
- Marketing (/crm/marketing) — attribution, channels, campaigns, CPL, ROI, UTM link builder.
- Reports (/crm/reports) — trends, conversion, area performance, CSV export.
- Reviews (/crm/reviews) — reputation and review responses.
- Settings (/crm/settings) — company profile, service catalog, pipeline config.

Rules:
- Only help with using this CRM. Do not discuss unrelated topics.
- Do NOT fabricate live numbers, counts, revenue, or lead data — you have no live data access yet. If asked, tell the user which page shows it (e.g. "Open /crm/marketing for ROI") and note that data-aware answers can be added later.
- Give clear step-by-step instructions when asked how to do something (e.g. "To change a lead's status: open Leads, click the lead, use the status dropdown").
- When suggesting a destination, include the route path inline like /crm/leads so the UI can render it as a clickable link.
- Tone: concise, helpful, internal-tool voice. Usually 2–5 short sentences or a tight bulleted list.`;

interface InMsg { role: "user" | "assistant"; content: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === "crm" ? "crm" : "public";
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.slice(0, 100) : "anon";
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

    // Validate + trim messages
    const messages: InMsg[] = rawMessages
      .filter((m: unknown): m is InMsg =>
        !!m && typeof m === "object"
        && (((m as InMsg).role === "user") || ((m as InMsg).role === "assistant"))
        && typeof (m as InMsg).content === "string"
      )
      .map((m: InMsg) => ({ role: m.role, content: m.content.slice(0, MAX_INPUT_CHARS) }))
      .slice(-MAX_MESSAGES);

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limits
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const friendlyLimitReply = mode === "crm"
      ? "You've hit the assistant limit for now. Please try again in an hour."
      : "I've reached my message limit for this session. Please reach us on WhatsApp for fastest response.";

    if (!bump(sessionHits, `${mode}:${sessionId}`, SESSION_LIMIT, SESSION_WINDOW_MS)
        || !bump(ipHits, `${mode}:${ip}`, IP_LIMIT, IP_WINDOW_MS)) {
      return new Response(JSON.stringify({ reply: friendlyLimitReply, rateLimited: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = mode === "crm" ? CRM_SYSTEM : PUBLIC_SYSTEM;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        max_tokens: MAX_TOKENS,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ reply: friendlyLimitReply, rateLimited: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Gateway error", res.status, errText);
      return new Response(JSON.stringify({ error: "Assistant temporarily unavailable." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ reply }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error", e);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
