import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Copy,
  StickyNote,
  MessageSquare,
  ListPlus,
  AlertTriangle,
} from "lucide-react";

/**
 * Growth Command Assistant — internal CRM helper
 *
 * Front-end only. Deterministic, canned responses with intent routing
 * over CEVON'S service taxonomy. No live AI / CRM / messaging APIs.
 *
 * FUTURE INTEGRATION POINTS (do not wire today):
 *   - readSelectedLead()              → pass current selection into prompt context
 *   - summarizeLiveConversation()     → real conversation summary from CRM
 *   - draftReplyFromHistory(leadId)   → personalize reply with customer history
 *   - createTask(payload)             → push task into CRM
 *   - addInternalNote(leadId, text)   → append note to a lead/request
 *   - updatePipelineStage(leadId, s)  → move record between stages
 *   - sendOutboundMessage(channel)    → WhatsApp / email / SMS
 *   - fetchMarketingMetrics()         → replace demo insights with real data
 */

type Intent =
  | "followup"
  | "priority"
  | "classify"
  | "missing"
  | "specialist"
  | "draft_reply"
  | "summarize"
  | "stage"
  | "marketing"
  | "daily"
  | "reviews"
  | "internal_note"
  | "quote_checklist"
  | "explain_services"
  | "escalation"
  | "unknown";

type Action =
  | { kind: "copy"; text: string }
  | { kind: "note"; text: string }
  | { kind: "whatsapp"; text: string }
  | { kind: "task"; text: string }
  | { kind: "link"; label: string; to: string };

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  actions?: Action[];
  chips?: string[];
};

const uid = () => Math.random().toString(36).slice(2, 10);

const QUICK_PROMPTS = [
  "What needs follow-up today?",
  "Which leads are highest priority?",
  "Classify a new customer request",
  "Which requests need specialist review?",
  "Draft a WhatsApp reply",
  "Summarize this request",
  "What information is missing?",
  "Suggest next pipeline stage",
  "Show marketing insights",
  "Help with quote follow-up",
  "Draft an internal note",
  "Explain CEVON's service categories",
];

const WELCOME: Message = {
  id: uid(),
  role: "bot",
  text:
    "Hi — I'm the Growth Command Assistant. I can help you triage leads, classify requests, draft replies, and summarize work across the dashboard. Pick a quick prompt or ask me something.",
  chips: QUICK_PROMPTS.slice(0, 6),
};

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));
  if (has("daily", "briefing", "today's numbers", "today summary")) return "daily";
  if (has("follow-up", "follow up", "needs follow", "what needs")) return "followup";
  if (has("priority", "highest priority", "important leads", "top leads")) return "priority";
  if (has("classify", "categorize", "what category", "what service")) return "classify";
  if (has("missing", "what info", "checklist", "what do we need")) return "missing";
  if (has("specialist", "specialist review", "needs review", "regulated")) return "specialist";
  if (has("whatsapp", "reply", "draft", "message", "respond")) return "draft_reply";
  if (has("summarize", "summary of", "summarise")) return "summarize";
  if (has("stage", "pipeline", "next stage", "move to")) return "stage";
  if (has("marketing", "insight", "source", "channel performance")) return "marketing";
  if (has("review", "feedback", "rating", "testimonial")) return "reviews";
  if (has("internal note", "note for the team", "leave a note")) return "internal_note";
  if (has("quote checklist", "before quoting", "need to quote", "quote follow")) return "quote_checklist";
  if (has("explain service", "service categories", "what services", "service structure")) return "explain_services";
  if (has("escalat", "flag", "attention", "red flag")) return "escalation";
  return "unknown";
}

function botResponse(intent: Intent): Message {
  switch (intent) {
    case "daily":
    case "followup":
      return {
        id: uid(),
        role: "bot",
        text:
          intent === "daily"
            ? "Today's demo briefing: 24 new leads, 18 scheduled jobs, 32 open quotes, and 15 completed jobs. Focus areas: follow up with 4 leads, review 3 quotes, confirm 5 bookings, and send 4 invoices."
            : "You have demo tasks for 4 lead follow-ups, 3 quote reviews, 5 booking confirmations, and 4 invoices to send. Highest priority should be specialist review requests, high-value commercial leads, and quote requests older than 24 hours.",
        actions: [
          { kind: "link", label: "View Leads / Requests", to: "/crm/leads" },
          { kind: "link", label: "View Quotes", to: "/crm/quotes" },
          { kind: "link", label: "View Calendar", to: "/crm/calendar" },
        ],
      };

    case "priority":
      return {
        id: uid(),
        role: "bot",
        text:
          "Prioritize high-value commercial or industrial requests, urgent service needs, specialist review items, and leads with complete booking information. In the current demo data, requests like Used Waste Oil, Wastewater, and high-priority Dumpster Rental should be reviewed first.",
        actions: [{ kind: "link", label: "Open Leads", to: "/crm/leads" }],
      };

    case "classify": {
      const example =
        "Category: Commercial\nLikely Service: Grease Trap / Septic Tank\nReview Type: Routine unless unusual waste or access issues\nMissing Info: location, tank/grease trap type, urgency, preferred date\nSuggested Stage: Details Needed";
      return {
        id: uid(),
        role: "bot",
        text:
          "Paste the customer message or describe the service needed, waste type, location, and customer type. Here is an example classification format:\n\n" +
          example,
        actions: [{ kind: "copy", text: example }],
        chips: ["Classify residential trash request", "Classify hazardous waste request", "Classify dumpster rental"],
      };
    }

    case "missing":
      return {
        id: uid(),
        role: "bot",
        text:
          "Standard missing-information checklist:\n• Customer name\n• Phone\n• Email\n• Company name\n• Service location & region\n• Service needed\n• Waste type\n• Estimated quantity / volume\n• Preferred date / time\n• Uploads, photos, documents\n• Urgency\n• Site access notes\n• Documentation required\n\nTailor by service type — industrial requests also need source of waste, SDS / safety documents, and contact person on site.",
        actions: [
          {
            kind: "note",
            text:
              "Missing info — confirm: location, waste type, estimated volume, preferred date, photos, urgency, and site access notes.",
          },
        ],
      };

    case "specialist":
      return {
        id: uid(),
        role: "bot",
        text:
          "Specialist review applies to: Hazardous Waste, Wastewater, Used Waste Oil, Contaminated Soil, Tank Cleaning, Product Destruction, Biohazardous Disposal, Material Recovery Facility, Landfill Operations, and any unknown industrial / specialized waste request — plus anything involving safety documents, regulated waste, large volume, unusual waste stream, or unclear waste type.\n\nCollect: waste type, estimated volume, location, source of waste, photos, SDS / safety documents if available, urgency, and on-site contact.",
        actions: [
          { kind: "link", label: "Open Leads", to: "/crm/leads" },
          {
            kind: "note",
            text:
              "Routed to Specialist Review. Awaiting waste type, estimated volume, source, photos, SDS documents, urgency, and site contact.",
          },
        ],
      };

    case "draft_reply": {
      const defaultMsg =
        "Thanks for contacting CEVON'S. We received your request and our team will review the details. Please share your service location, the service needed, and any photos or documents that can help us prepare.";
      const missingMsg =
        "Thanks for reaching out to CEVON'S. To help us route your request correctly, please send your location, service needed, estimated waste quantity, preferred date, and any photos if available.";
      const specialistMsg =
        "Thanks for contacting CEVON'S. This request may require specialist review. Please send the waste type, estimated quantity, site location, urgency, and any relevant photos or documents. Our team will review and advise on next steps.";
      const quoteMsg =
        "Hi, this is CEVON'S following up on your service request. Would you like us to proceed with preparing or confirming your quote? Please let us know if any details have changed.";
      return {
        id: uid(),
        role: "bot",
        text:
          "Pick the tone and copy/use the draft:\n\n— Default —\n" +
          defaultMsg +
          "\n\n— Missing Info —\n" +
          missingMsg +
          "\n\n— Specialist Review —\n" +
          specialistMsg +
          "\n\n— Quote Follow-up —\n" +
          quoteMsg,
        actions: [
          { kind: "copy", text: defaultMsg },
          { kind: "whatsapp", text: defaultMsg },
          { kind: "copy", text: specialistMsg },
          { kind: "copy", text: quoteMsg },
        ],
      };
    }

    case "summarize":
      return {
        id: uid(),
        role: "bot",
        text:
          "Demo summary format:\n• Customer: [name]\n• Service: [service]\n• Location: [region]\n• Urgency: [standard/urgent]\n• Current status: [stage]\n• Missing info: [list]\n• Next action: [action]\n• Suggested owner: [team member]\n• Suggested pipeline stage: [stage]\n\nThis is a demo summary format. Select or connect a real request later to generate live summaries.",
        actions: [{ kind: "link", label: "Open Leads", to: "/crm/leads" }],
      };

    case "stage":
      return {
        id: uid(),
        role: "bot",
        text:
          "Pipeline stages, in order:\n1. New Inquiry\n2. Auto-Reply Sent\n3. Contacted\n4. Details Needed\n5. Qualified\n6. Specialist Review Required\n7. Quote Needed\n8. Quote Sent\n9. Approval Required\n10. Scheduled\n11. Dispatched\n12. Service Completed\n13. Invoiced\n14. Review Requested\n15. Closed\n\nIf core info is still missing → Details Needed. If a specialist/regulated service is involved → Specialist Review Required. If priced and waiting on customer → Quote Sent.",
      };

    case "marketing":
      return {
        id: uid(),
        role: "bot",
        text:
          "Based on demo dashboard data:\n• Website is the largest source of inbound leads.\n• WhatsApp is a major secondary source.\n• Georgetown is the strongest region; Linden and Berbice are growing.\n• Dumpster Rental and Skip Bin Rental are high-demand services.\n• Used Waste Oil and other industrial services may need faster follow-up due to longer review cycles.",
        actions: [
          { kind: "link", label: "Open Marketing", to: "/crm/marketing" },
          { kind: "link", label: "Open Reports", to: "/crm/reports" },
        ],
      };

    case "reviews": {
      const requestMsg =
        "Thank you for choosing CEVON'S. We hope you were satisfied with our service. Your feedback helps us continue improving. Would you be willing to leave a review?";
      const positiveMsg =
        "Thank you for the kind words — it means a lot to the CEVON'S team. We'll be ready whenever you need us again.";
      const neutralMsg =
        "Thanks for the feedback. We'd love to learn more about what we could have done better — could you share any specifics with our team?";
      const negativeInternal =
        "Negative feedback received. Confirm service date, location, and team on-site. Reach out to the customer within 24 hours, log the issue, and recommend a resolution path.";
      return {
        id: uid(),
        role: "bot",
        text:
          "Review templates:\n\n— Review request —\n" +
          requestMsg +
          "\n\n— Positive thank-you —\n" +
          positiveMsg +
          "\n\n— Neutral follow-up —\n" +
          neutralMsg +
          "\n\n— Negative feedback (internal) —\n" +
          negativeInternal,
        actions: [
          { kind: "copy", text: requestMsg },
          { kind: "copy", text: positiveMsg },
          { kind: "copy", text: neutralMsg },
          { kind: "note", text: negativeInternal },
          { kind: "link", label: "Open Reviews", to: "/crm/reviews" },
        ],
      };
    }

    case "internal_note": {
      const note =
        "Customer requested pricing before scheduling. Needs confirmation of location, waste type, estimated volume, and preferred service date. Follow up by WhatsApp.";
      return {
        id: uid(),
        role: "bot",
        text: "Draft internal note:\n\n" + note,
        actions: [
          { kind: "copy", text: note },
          { kind: "note", text: note },
        ],
      };
    }

    case "quote_checklist":
      return {
        id: uid(),
        role: "bot",
        text:
          "Quote checklists by service type:\n\n— Dumpster / Skip Bin —\n• Waste type\n• Container size or estimated volume\n• Rental duration\n• Delivery / pickup dates\n• Location\n• Site access\n\n— Industrial / Specialized —\n• Waste type\n• Quantity\n• Source\n• Safety documents (SDS)\n• Photos\n• Location\n• Urgency\n• Documentation needs",
        actions: [{ kind: "link", label: "Open Quotes", to: "/crm/quotes" }],
      };

    case "explain_services":
      return {
        id: uid(),
        role: "bot",
        text:
          "CEVON'S service structure:\n\n• Residential — General Trash Collection, Dumpster Rental, Septic Services, Portable Toilet.\n• Commercial — General Waste Management, Skip Bin & Dumpster Rental, Portable Toilet, Grease Trap / Septic Tank, Document Shredding.\n• Industrial — Hazardous Waste, Wastewater, Used Waste Oil, Contaminated Soil, Tank Cleaning, Product Destruction, Biohazardous Disposal.\n• Facilities — Material Recovery Facility, Landfill Operations.\n\nLocations: Georgetown, Linden, Berbice.",
      };

    case "escalation":
      return {
        id: uid(),
        role: "bot",
        text:
          "Demo escalation flags — open a record for attention when:\n• Urgent language is used\n• Hazardous, biohazard, or industrial terms appear\n• Customer asks for same-day service\n• Critical info is missing\n• Quote has been open too long\n• Customer has not responded after follow-ups\n• Negative feedback appears\n• Large commercial or government account appears",
      };

    case "unknown":
    default:
      return {
        id: uid(),
        role: "bot",
        text:
          "I can help with lead triage, classifications, missing-info checks, drafting replies, summarizing requests, suggesting pipeline stages, and marketing insights. Try one of the quick prompts or describe what you need.",
        chips: QUICK_PROMPTS.slice(0, 8),
      };
  }
}

// ============================================================
// Component
// ============================================================
export function CrmAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text) return;
      const userMsg: Message = { id: uid(), role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      const reply = botResponse(detectIntent(text));
      setTimeout(() => setMessages((prev) => [...prev, reply]), 200);
    },
    [input],
  );

  const reset = () => setMessages([WELCOME]);

  const runAction = (a: Action) => {
    switch (a.kind) {
      case "copy":
        // FUTURE INTEGRATION: capture which template was copied for analytics
        navigator.clipboard?.writeText(a.text).catch(() => {});
        toast.success("Copied to clipboard");
        break;
      case "note":
        // FUTURE INTEGRATION: addInternalNote(selectedLeadId, a.text)
        toast("Preview only — integration will be connected later.", { description: "Insert as note" });
        break;
      case "whatsapp":
        // FUTURE INTEGRATION: sendOutboundMessage('whatsapp', a.text)
        toast("Preview only — integration will be connected later.", { description: "Draft WhatsApp" });
        break;
      case "task":
        // FUTURE INTEGRATION: createTask({ title: a.text })
        toast("Preview only — integration will be connected later.", { description: "Create task" });
        break;
    }
  };

  return (
    <>
      {/* Trigger button — mounted inside CRM header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, var(--crm-primary-bright), var(--crm-primary))",
          borderColor: "var(--crm-primary)",
          color: "#fff",
        }}
        aria-label="Open Growth Command Assistant"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Assistant
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden h-9 w-9 grid place-items-center rounded-lg border"
        style={{
          background: "var(--crm-surface-muted)",
          borderColor: "var(--crm-border)",
          color: "var(--crm-text)",
        }}
        aria-label="Open Growth Command Assistant"
      >
        <Sparkles className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Growth Command Assistant"
            className="crm-assistant-drawer fixed z-[80] flex flex-col shadow-2xl overflow-hidden
                       inset-x-0 bottom-0 top-0 md:inset-auto md:top-0 md:bottom-0 md:right-0
                       md:w-[440px] md:max-w-[95vw] border-l"
            style={{
              background: "var(--crm-surface)",
              borderColor: "var(--crm-border)",
              color: "var(--crm-text)",
            }}
          >
            <header
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: "var(--crm-border)" }}
            >
              <div
                className="h-9 w-9 rounded-lg grid place-items-center text-white shrink-0"
                style={{ background: "linear-gradient(135deg, var(--crm-primary-bright), var(--crm-primary))" }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight" style={{ color: "var(--crm-text)" }}>
                  Growth Command Assistant
                </p>
                <p className="text-xs leading-tight" style={{ color: "var(--crm-text-muted)" }}>
                  Ask about leads, requests, services, or next actions.
                </p>
              </div>
              <button
                onClick={reset}
                className="rounded-md p-1.5 hover:opacity-80 transition"
                aria-label="Reset conversation"
                title="Reset conversation"
                style={{ color: "var(--crm-text-muted)" }}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 hover:opacity-80 transition"
                aria-label="Close assistant"
                style={{ color: "var(--crm-text-muted)" }}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div
              className="px-4 py-2 text-[11px] border-b flex items-center gap-1.5"
              style={{
                borderColor: "var(--crm-border)",
                background: "var(--crm-surface-muted)",
                color: "var(--crm-text-muted)",
              }}
            >
              <AlertTriangle className="h-3 w-3" />
              Front-end preview using demo CRM data.
            </div>

            {/* Quick prompts */}
            <div
              className="px-3 py-2 border-b flex gap-1.5 overflow-x-auto"
              style={{ borderColor: "var(--crm-border)" }}
            >
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="shrink-0 rounded-full border px-2.5 py-1 text-xs transition hover:-translate-y-0.5"
                  style={{
                    borderColor: "var(--crm-border)",
                    background: "var(--crm-surface)",
                    color: "var(--crm-text)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ background: "var(--crm-bg)" }}
            >
              {messages.map((m) => (
                <Bubble key={m.id} message={m} onAction={runAction} onSend={send} />
              ))}
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 border-t flex items-end gap-2"
              style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask about leads, requests, services..."
                aria-label="Type your question"
                className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm leading-snug max-h-28 focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: "var(--crm-border)",
                    background: "var(--crm-surface-muted)",
                    color: "var(--crm-text)",
                    "--tw-ring-color": "var(--crm-primary)",
                  } as React.CSSProperties
                }
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim()}
                aria-label="Send"
                className="h-9 w-9 grid place-items-center rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--crm-primary)" }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function Bubble({
  message,
  onAction,
  onSend,
}: {
  message: Message;
  onAction: (a: Action) => void;
  onSend: (text: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm text-white shadow-sm whitespace-pre-wrap"
          style={{ background: "var(--crm-primary)" }}
        >
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div
        className="h-7 w-7 rounded-lg grid place-items-center text-white shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, var(--crm-primary-bright), var(--crm-primary))" }}
      >
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="max-w-[88%] space-y-2">
        <div
          className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed shadow-sm border whitespace-pre-wrap"
          style={{
            background: "var(--crm-surface)",
            borderColor: "var(--crm-border)",
            color: "var(--crm-text)",
          }}
        >
          {message.text}
        </div>
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.actions.map((a, i) => (
              <ActionButton key={i} action={a} onAction={onAction} />
            ))}
          </div>
        )}
        {message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.chips.map((c) => (
              <button
                key={c}
                onClick={() => onSend(c)}
                className="rounded-full border px-2.5 py-1 text-xs transition hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--crm-border)",
                  background: "var(--crm-surface)",
                  color: "var(--crm-text-muted)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  action,
  onAction,
}: {
  action: Action;
  onAction: (a: Action) => void;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition hover:-translate-y-0.5";
  if (action.kind === "link") {
    return (
      <Link
        to={action.to as "/crm"}
        className={base}
        style={{
          background: "var(--crm-primary)",
          borderColor: "var(--crm-primary)",
          color: "#fff",
        }}
      >
        {action.label}
      </Link>
    );
  }
  const meta = {
    copy: { label: "Copy", icon: <Copy className="h-3 w-3" /> },
    note: { label: "Insert as note", icon: <StickyNote className="h-3 w-3" /> },
    whatsapp: { label: "Draft WhatsApp", icon: <MessageSquare className="h-3 w-3" /> },
    task: { label: "Create task", icon: <ListPlus className="h-3 w-3" /> },
  }[action.kind];
  return (
    <button
      type="button"
      onClick={() => onAction(action)}
      className={base}
      style={{
        background: "var(--crm-surface)",
        borderColor: "var(--crm-border)",
        color: "var(--crm-text)",
      }}
    >
      {meta.icon}
      {meta.label}
    </button>
  );
}
