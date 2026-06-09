import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageCircle,
  X,
  Send,
  RotateCcw,
  Paperclip,
  Phone,
  AlertTriangle,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { cevonsIcons } from "@/data/cevonsIconRegistry";
import { cevonsContact, hasConfirmedWhatsApp, whatsappHref, primaryTelHref, primaryMailtoHref } from "@/data/cevonsContact";

const ASSISTANT_AVATAR = cevonsIcons.ui.contactSupport.src;

/**
 * Cevon's Service Assistant — public website chat widget
 *
 * Front-end-only deterministic assistant. All responses are canned and
 * routed via keyword/intent matching. No external API calls.
 *
 * FUTURE INTEGRATION POINTS (do not wire today):
 *   - sendLeadToCrm(payload)        → push captured leads to backend
 *   - handoffToWhatsApp(summary)    → open WhatsApp deep link with summary
 *   - attachConversationToRequest() → prefill /request-service with chat
 *   - fetchRequestStatus(ref)       → live request status lookup
 *   - askAiKnowledgeBase(query)     → real model fallback for FLOW 15
 */

// Confirm official WhatsApp number with CEVON'S before launch.
const WHATSAPP_URL = whatsappHref;
const PHONE_HREF = primaryTelHref;
const EMAIL_HREF = primaryMailtoHref;

type CtaKind = "link" | "external" | "intent";
type Cta = {
  label: string;
  kind: CtaKind;
  to?: string;
  href?: string;
  intent?: string;
  tone?: "primary" | "yellow" | "outline" | "danger";
};

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  ctas?: Cta[];
  chips?: string[];
  alert?: boolean;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const PRIMARY_QUICK_ACTIONS: Cta[] = [
  { label: "Find the right service", kind: "intent", intent: "find" },
  { label: "Request a service", kind: "link", to: "/request-service", tone: "primary" },
  { label: "Get pricing guidance", kind: "intent", intent: "pricing" },
  { label: "Track my request", kind: "intent", intent: "track" },
  { label: "WhatsApp CEVON'S", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
  { label: "See locations", kind: "intent", intent: "locations" },
  { label: "Industrial / hazardous waste", kind: "intent", intent: "industrial" },
  { label: "Prepare for a request", kind: "intent", intent: "prepare" },
];

const WELCOME_TEXT =
  "Hi, I'm the Cevon's Service Assistant. I can help you find the right waste management or environmental service. Tell me what you need help with today.";

function welcomeMessage(): Message {
  return {
    id: uid(),
    role: "bot",
    text: WELCOME_TEXT,
    ctas: PRIMARY_QUICK_ACTIONS,
  };
}

// ============================================================
// Intent / keyword routing
// ============================================================
type Intent =
  | "find"
  | "residential"
  | "commercial"
  | "dumpster"
  | "portable"
  | "septic"
  | "industrial"
  | "facilities"
  | "locations"
  | "contact"
  | "pricing"
  | "track"
  | "urgent"
  | "prepare"
  | "feedback"
  | "grease"
  | "shredding"
  | "lead"
  | "unknown";

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  const has = (...words: string[]) => words.some((w) => t.includes(w));

  if (has("emergency", "overflow", "spill", "dangerous", "urgent", "immediate", "hazard leak"))
    return "urgent";
  if (has("complaint", "missed", "feedback", "issue", "problem with service")) return "feedback";
  if (has("track", "reference", "status of my", "where is my request")) return "track";
  if (has("price", "cost", "quote", "how much", "rate", "pricing")) return "pricing";
  if (has("phone", "call", "telephone", "email", "mail", "contact info", "hours", "open", "whatsapp number"))
    return "contact";
  if (has("location", "where do you", "areas", "berbice", "linden", "georgetown", "coverage", "address", "office"))
    return "locations";
  if (has("prepare", "what do i need", "what info", "before i book", "what to send"))
    return "prepare";
  if (has("grease", "kitchen waste", "fryer")) return "grease";
  if (has("shred", "document", "confidential", "records destruction", "files")) return "shredding";
  if (
    has(
      "hazardous",
      "wastewater",
      "waste oil",
      "used oil",
      "contaminated soil",
      "tank cleaning",
      "product destruction",
      "biohazard",
      "regulated",
      "industrial waste",
    )
  )
    return "industrial";
  if (has("recycling facility", "material recovery", "mrf", "landfill")) return "facilities";
  if (has("portable toilet", "porta", "event toilet", "site toilet")) return "portable";
  if (has("septic", "sewage", "tank pumping")) return "septic";
  if (has("dumpster", "skip bin", "skip", "construction debris", "renovation cleanup", "bin rental"))
    return "dumpster";
  if (has("office", "business", "restaurant", "hotel", "school", "plaza", "commercial")) return "commercial";
  if (has("home", "house", "residential", "household", "trash pickup", "garbage")) return "residential";
  if (has("find", "right service", "which service", "what service")) return "find";
  if (has("contact me", "call me", "submit my", "book me")) return "lead";
  return "unknown";
}

// ============================================================
// Flow responses
// ============================================================
function botResponse(intent: Intent): Message {
  switch (intent) {
    case "find":
      return {
        id: uid(),
        role: "bot",
        text: "Is this for a home, business, industrial site, or facility / infrastructure request?",
        ctas: [
          { label: "Home / Residential", kind: "intent", intent: "residential" },
          { label: "Business / Commercial", kind: "intent", intent: "commercial" },
          { label: "Industrial Site", kind: "intent", intent: "industrial" },
          { label: "Facility / Infrastructure", kind: "intent", intent: "facilities" },
          { label: "Not Sure", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "residential":
      return {
        id: uid(),
        role: "bot",
        text:
          "For home or household waste, the best fit is Residential General Trash Collection. You can submit a request online or contact the team on WhatsApp. If this is for a cleanup, renovation, or larger project, a Dumpster Rental may be a better fit.",
        ctas: [
          { label: "Request Residential Service", kind: "link", to: "/request-service", tone: "primary" },
          { label: "View Trash Collection", kind: "link", to: "/services/general-trash-collection" },
          { label: "Dumpster Rental", kind: "link", to: "/services/dumpster-rental" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
        chips: ["Septic services", "Portable toilet", "Pricing guidance"],
      };

    case "commercial":
      return {
        id: uid(),
        role: "bot",
        text:
          "For business or commercial properties, CEVON'S can help with scheduled waste management, skip bins, portable toilets, grease trap / septic, and document shredding depending on your operation.",
        ctas: [
          { label: "Request Commercial Service", kind: "link", to: "/request-service", tone: "primary" },
          { label: "General Waste Management", kind: "link", to: "/services/general-waste-management" },
          { label: "Skip Bin & Dumpster", kind: "link", to: "/services/skip-bin-dumpster-rental" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
        chips: ["Grease trap / septic", "Document shredding", "Portable toilet"],
      };

    case "grease":
      return {
        id: uid(),
        role: "bot",
        text:
          "For restaurants and commercial kitchens, CEVON'S offers Grease Trap and Septic Tank servicing on a scheduled or on-call basis.",
        ctas: [
          { label: "Request Grease Trap / Septic Service", kind: "link", to: "/request-service", tone: "primary" },
          { label: "View Service Page", kind: "link", to: "/services/grease-trap-septic-tank" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "shredding":
      return {
        id: uid(),
        role: "bot",
        text:
          "For confidential papers, files, or records, CEVON'S offers secure Document Shredding for offices and commercial clients.",
        ctas: [
          { label: "Request Document Shredding", kind: "link", to: "/request-service", tone: "primary" },
          { label: "View Service Page", kind: "link", to: "/services/document-shredding" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "dumpster":
      return {
        id: uid(),
        role: "bot",
        text:
          "Cevon's can help with dumpster or skip bin rental depending on your project size, waste type, location, and rental duration. Please share your location, waste type, approximate volume, preferred date, and any site access notes.",
        ctas: [
          { label: "Request Dumpster / Skip Bin", kind: "link", to: "/request-service", tone: "primary" },
          { label: "Residential Dumpster", kind: "link", to: "/services/dumpster-rental" },
          { label: "Commercial Skip Bin", kind: "link", to: "/services/skip-bin-dumpster-rental" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "portable":
      return {
        id: uid(),
        role: "bot",
        text:
          "For Portable Toilet rental, please share how many units you need, the site location, and the dates required so the team can recommend the right setup.",
        ctas: [
          { label: "Request Portable Toilet Rental", kind: "link", to: "/request-service", tone: "primary" },
          { label: "View Service Page", kind: "link", to: "/services/portable-toilet" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "septic":
      return {
        id: uid(),
        role: "bot",
        text:
          "Is this for a home, restaurant, commercial site, or industrial facility? For homes use Septic Services. For restaurants and commercial properties, Grease Trap / Septic Tank servicing is usually the right fit.",
        ctas: [
          { label: "Residential Septic", kind: "link", to: "/services/septic-services" },
          { label: "Commercial Grease Trap / Septic", kind: "link", to: "/services/grease-trap-septic-tank" },
          { label: "Request Septic Service", kind: "link", to: "/request-service", tone: "primary" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "industrial":
      return {
        id: uid(),
        role: "bot",
        text:
          "This type of request may require specialist review before scheduling. CEVON'S will need details such as waste type, estimated quantity, location, urgency, and any available photos or documents.",
        // FUTURE: prefill /request-service with category=Industrial when prefill is supported
        ctas: [
          { label: "Request Specialist Review", kind: "link", to: "/request-service", tone: "primary" },
          { label: "Hazardous Waste", kind: "link", to: "/services/hazardous-waste" },
          { label: "Wastewater", kind: "link", to: "/services/wastewater" },
          { label: "Used Waste Oil", kind: "link", to: "/services/used-waste-oil" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
        chips: ["Contaminated soil", "Tank cleaning", "Product destruction", "Biohazardous disposal"],
      };

    case "facilities":
      return {
        id: uid(),
        role: "bot",
        text:
          "For facility or infrastructure-related services, CEVON'S can route your request to the right team. Please share your organization, location, and the type of facility support needed.",
        ctas: [
          { label: "Request Facility Review", kind: "link", to: "/request-service", tone: "primary" },
          { label: "Material Recovery Facility", kind: "link", to: "/services/material-recovery-facility" },
          { label: "Landfill Operations", kind: "link", to: "/services/landfill-operations" },
          { label: "Contact CEVON'S", kind: "link", to: "/contact" },
        ],
      };

    case "locations":
      return {
        id: uid(),
        role: "bot",
        text:
          `CEVON'S has three offices:\n` +
          `\u2022 Georgetown Head Office \u2014 ${cevonsContact.regions[0].addressLine1}, ${cevonsContact.regions[0].addressLine2}.\n` +
          `\u2022 Linden Branch Office \u2014 ${cevonsContact.regions[1].addressLine1}, ${cevonsContact.regions[1].addressLine2}.\n` +
          `\u2022 Berbice Branch Office \u2014 ${cevonsContact.regions[2].addressLine1}, ${cevonsContact.regions[2].addressLine2}.\n` +
          `All offices are open ${cevonsContact.hours}.`,
        ctas: [
          { label: "View Locations", kind: "link", to: "/locations", tone: "primary" },
          { label: "Request Service", kind: "link", to: "/request-service" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "contact": {
      const waLine = hasConfirmedWhatsApp
        ? `WhatsApp: tap the WhatsApp button below.`
        : `WhatsApp: please use the WhatsApp button or contact page \u2014 the official WhatsApp number should be confirmed before launch.`;
      return {
        id: uid(),
        role: "bot",
        text:
          `Here\u2019s how to reach CEVON'S:\n` +
          `\u2022 Georgetown: ${cevonsContact.regions[0].phones.join(" / ")}\n` +
          `\u2022 Linden: ${cevonsContact.regions[1].phones.join(" / ")}\n` +
          `\u2022 Berbice: ${cevonsContact.regions[2].phones.join(" / ")}\n` +
          `\u2022 Email: ${cevonsContact.email}\n` +
          `\u2022 Hours: ${cevonsContact.hours}\n` +
          waLine,
        ctas: [
          { label: `Call ${cevonsContact.primaryPhone}`, kind: "external", href: PHONE_HREF, tone: "primary" },
          { label: "Email CEVON'S", kind: "external", href: EMAIL_HREF },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
          { label: "View Locations", kind: "link", to: "/locations" },
        ],
      };
    }

    case "pricing":
      return {
        id: uid(),
        role: "bot",
        text:
          "Pricing depends on the service type, location, waste type, volume, schedule, access requirements, and any special handling needs. The fastest way to get accurate pricing is to submit a request or message the team on WhatsApp.",
        ctas: [
          { label: "Request a Quote", kind: "link", to: "/request-service", tone: "primary" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "track":
      return {
        id: uid(),
        role: "bot",
        text:
          "Do you have your request reference number? If yes, you can track it directly. If not, you can still reach the team on WhatsApp with your name, phone number, service requested, and location.",
        ctas: [
          { label: "Track Request", kind: "link", to: "/track-request", tone: "primary" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "urgent":
      return {
        id: uid(),
        role: "bot",
        alert: true,
        text:
          "If this is urgent, contact CEVON'S directly on WhatsApp or by phone so the team can review the situation quickly.",
        ctas: [
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
          { label: "Call CEVON'S", kind: "external", href: PHONE_HREF, tone: "danger" },
          { label: "Request Urgent Review", kind: "link", to: "/request-service", tone: "primary" },
        ],
      };

    case "prepare":
      return {
        id: uid(),
        role: "bot",
        text:
          "To help the team respond faster, prepare: service location, service type, photos if available, estimated waste quantity, preferred date and time, and any documents for specialized waste.",
        ctas: [
          { label: "Start Request", kind: "link", to: "/request-service", tone: "primary" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
        chips: ["Upload guidance", "Pricing guidance", "Find the right service"],
      };

    case "feedback":
      return {
        id: uid(),
        role: "bot",
        text:
          "I'm sorry to hear that. The best next step is to contact CEVON'S with your name, service location, date of service, and a short description of the issue.",
        ctas: [
          { label: "Contact CEVON'S", kind: "link", to: "/contact", tone: "primary" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };

    case "lead":
      return {
        id: uid(),
        role: "bot",
        text: "Great — I can help collect a few details to get you started.",
        ctas: [{ label: "Open quick lead form", kind: "intent", intent: "__open_lead__", tone: "primary" }],
      };

    case "unknown":
    default:
      return {
        id: uid(),
        role: "bot",
        text:
          "I can help route your request. Please tell me the service you need, your location, and whether this is residential, commercial, industrial, or facility-related.",
        ctas: [
          { label: "Find the right service", kind: "intent", intent: "find", tone: "primary" },
          { label: "Request Service", kind: "link", to: "/request-service" },
          { label: "View Services", kind: "link", to: "/services" },
          { label: "WhatsApp Us", kind: "external", href: WHATSAPP_URL, tone: "yellow" },
        ],
      };
  }
}

// ============================================================
// Component
// ============================================================
type LeadDraft = {
  name: string;
  phone: string;
  email: string;
  location: string;
  service: string;
  message: string;
  urgency: "Standard" | "Urgent";
  contact: "WhatsApp" | "Phone" | "Email";
};

const EMPTY_LEAD: LeadDraft = {
  name: "",
  phone: "",
  email: "",
  location: "",
  service: "",
  message: "",
  urgency: "Standard",
  contact: "WhatsApp",
};

export function ServiceAssistant() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage()]);
  const [input, setInput] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
  const [lead, setLead] = useState<LeadDraft>(EMPTY_LEAD);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fade in floating button after 1s
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open, leadOpen]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // ESC to close + focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pushBot = useCallback((m: Message) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const handleIntent = useCallback(
    (intent: string) => {
      if (intent === "__open_lead__") {
        setLeadOpen(true);
        return;
      }
      pushBot(botResponse(intent as Intent));
    },
    [pushBot],
  );

  const handleSend = useCallback(
    (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text) return;
      const userMsg: Message = { id: uid(), role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      const intent = detectIntent(text);
      // small delay for natural feel
      setTimeout(() => pushBot(botResponse(intent)), 250);
    },
    [input, pushBot],
  );

  const handleReset = () => {
    setMessages([welcomeMessage()]);
    setLeadOpen(false);
    setLead(EMPTY_LEAD);
    setLeadSubmitted(false);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FUTURE: sendLeadToCrm(lead); attachConversationToRequest(messages);
    setLeadSubmitted(true);
  };

  const leadValid = lead.name.trim() && lead.phone.trim() && lead.location.trim() && lead.service.trim();

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open CEVON'S Service Assistant"
        className={`assistant-fab fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full pl-4 pr-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD200]/40 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        } ${open ? "pointer-events-none opacity-0" : ""}`}
        style={{ background: "linear-gradient(135deg, #006B35, #003F27)" }}
      >
        <span className="relative grid place-items-center h-8 w-8 rounded-full bg-white/15">
          <MessageCircle className="h-4 w-4" />
          <span
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#003F27]"
            style={{ background: "#FFD200" }}
          />
        </span>
        <span className="hidden sm:inline">Ask CEVON&apos;S</span>
      </button>

      {/* Chat panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Cevon's Service Assistant"
            className="assistant-panel fixed z-[70] bg-white shadow-2xl flex flex-col overflow-hidden
                       inset-x-0 bottom-0 top-12 rounded-t-3xl
                       md:inset-auto md:bottom-5 md:right-5 md:top-auto md:w-[420px] md:max-h-[75vh] md:rounded-3xl
                       border border-[#E5E7EB]"
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 text-white"
              style={{ background: "linear-gradient(135deg, #006B35, #003F27)" }}
            >
              <div className="h-10 w-10 rounded-full bg-white grid place-items-center overflow-hidden shrink-0">
                <img src={ASSISTANT_AVATAR} alt="CEVON'S" className="h-8 w-8 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">Cevon&apos;s Service Assistant</p>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-90">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFD200] animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-xs text-white/80 truncate">Find the right service or get help fast</p>
              </div>
              <button
                onClick={handleReset}
                className="rounded-md p-1.5 hover:bg-white/10 transition"
                aria-label="Reset conversation"
                title="Reset conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 hover:bg-white/10 transition"
                aria-label="Close assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFBF9]"
            >
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onIntent={handleIntent} onSend={handleSend} />
              ))}

              {leadOpen && !leadSubmitted && (
                <form
                  onSubmit={handleLeadSubmit}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm space-y-3"
                >
                  <p className="text-sm font-semibold text-[#101820]">Quick lead form</p>
                  <p className="text-xs text-[#64748B]">
                    Share a few details and someone will follow up. This is a preview form — please also continue to the official request page below.
                  </p>
                  <LeadField label="Name *" value={lead.name} onChange={(v) => setLead({ ...lead, name: v })} />
                  <LeadField label="Phone *" value={lead.phone} onChange={(v) => setLead({ ...lead, phone: v })} type="tel" />
                  <LeadField label="Email (optional)" value={lead.email} onChange={(v) => setLead({ ...lead, email: v })} type="email" />
                  <LeadField label="Location *" value={lead.location} onChange={(v) => setLead({ ...lead, location: v })} />
                  <LeadField label="Service needed *" value={lead.service} onChange={(v) => setLead({ ...lead, service: v })} />
                  <div>
                    <label className="text-xs font-medium text-[#101820]">Message</label>
                    <textarea
                      value={lead.message}
                      onChange={(e) => setLead({ ...lead, message: e.target.value })}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B35]/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-[#101820]">Urgency</label>
                      <select
                        value={lead.urgency}
                        onChange={(e) => setLead({ ...lead, urgency: e.target.value as LeadDraft["urgency"] })}
                        className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-2 py-2 text-sm"
                      >
                        <option>Standard</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#101820]">Preferred contact</label>
                      <select
                        value={lead.contact}
                        onChange={(e) => setLead({ ...lead, contact: e.target.value as LeadDraft["contact"] })}
                        className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-2 py-2 text-sm"
                      >
                        <option>WhatsApp</option>
                        <option>Phone</option>
                        <option>Email</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!leadValid}
                      className="flex-1 rounded-lg bg-[#006B35] px-3 py-2 text-sm font-semibold text-white hover:bg-[#005a2c] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit details
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadOpen(false)}
                      className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#101820] hover:bg-[#F1F5F2]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {leadSubmitted && (
                <div className="rounded-2xl border border-[#006B35]/30 bg-[#E8F5EE] p-4 shadow-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#006B35] shrink-0 mt-0.5" />
                    <div className="text-sm text-[#101820]">
                      Thanks. This chat lead capture is currently a front-end preview. Please continue by submitting the official request form or contacting CEVON&apos;S on WhatsApp.
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          to="/request-service"
                          className="rounded-md bg-[#006B35] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#005a2c]"
                        >
                          Continue to Request Form
                        </Link>
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md bg-[#FFD200] px-3 py-1.5 text-xs font-semibold text-[#101820] hover:brightness-95"
                        >
                          WhatsApp Us
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[#E5E7EB] bg-white px-3 py-3">
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  aria-label="Attachments (coming soon)"
                  title="Attachments — coming soon"
                  className="h-9 w-9 grid place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F2]"
                  onClick={() => pushBot(botResponse("prepare"))}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Ask about services, pricing, locations..."
                  aria-label="Type your question"
                  className="flex-1 resize-none rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm leading-snug max-h-28 focus:outline-none focus:ring-2 focus:ring-[#006B35]/30"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="h-9 w-9 grid place-items-center rounded-lg bg-[#006B35] text-white hover:bg-[#005a2c] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[#94A3B8] text-center">
                Cevon&apos;s Service Assistant • Helps route your request. Not a live agent.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ============================================================
// Subcomponents
// ============================================================
function MessageBubble({
  message,
  onIntent,
  onSend,
}: {
  message: Message;
  onIntent: (intent: string) => void;
  onSend: (text: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2 text-sm text-white shadow-sm"
          style={{ background: "#006B35" }}
        >
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="h-8 w-8 rounded-full bg-white border border-[#E5E7EB] grid place-items-center overflow-hidden shrink-0">
        <img src={ASSISTANT_AVATAR} alt="" className="h-6 w-6 object-contain" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div
          className={`rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed shadow-sm border ${
            message.alert
              ? "bg-[#FFF4D6] border-[#FFD200] text-[#101820]"
              : "bg-[#F1F5F2] border-[#E5E7EB] text-[#101820]"
          }`}
        >
          {message.alert && (
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#E31B23]">
              <AlertTriangle className="h-3.5 w-3.5" />
              Urgent
            </div>
          )}
          {message.text}
        </div>

        {message.ctas && message.ctas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.ctas.map((cta, i) => (
              <CtaButton key={i} cta={cta} onIntent={onIntent} />
            ))}
          </div>
        )}

        {message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.chips.map((chip) => (
              <button
                key={chip}
                onClick={() => onSend(chip)}
                className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs text-[#64748B] hover:border-[#006B35] hover:text-[#006B35] transition"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CtaButton({ cta, onIntent }: { cta: Cta; onIntent: (i: string) => void }) {
  const tone = cta.tone ?? "outline";
  const cls = (() => {
    switch (tone) {
      case "primary":
        return "bg-[#006B35] text-white hover:bg-[#005a2c] border-[#006B35]";
      case "yellow":
        return "bg-[#FFD200] text-[#101820] hover:brightness-95 border-[#FFD200]";
      case "danger":
        return "bg-[#E31B23] text-white hover:brightness-95 border-[#E31B23]";
      case "outline":
      default:
        return "bg-white text-[#006B35] hover:bg-[#F1F5F2] border-[#006B35]/30";
    }
  })();

  const base = `inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${cls}`;
  const icon =
    cta.kind === "external" && cta.href === PHONE_HREF ? (
      <Phone className="h-3 w-3" />
    ) : cta.label.toLowerCase().includes("location") ? (
      <MapPin className="h-3 w-3" />
    ) : null;

  if (cta.kind === "link" && cta.to) {
    return (
      <Link to={cta.to as "/"} className={base}>
        {icon}
        {cta.label}
      </Link>
    );
  }
  if (cta.kind === "external" && cta.href) {
    return (
      <a href={cta.href} target="_blank" rel="noreferrer" className={base}>
        {icon}
        {cta.label}
      </a>
    );
  }
  return (
    <button type="button" onClick={() => cta.intent && onIntent(cta.intent)} className={base}>
      {icon}
      {cta.label}
    </button>
  );
}

function LeadField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#101820]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B35]/30"
      />
    </div>
  );
}
