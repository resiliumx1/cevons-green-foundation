import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  Send,
  RotateCcw,
  Loader2,
  Leaf,
  MapPin,
  Calendar,
  Wrench,
  Lock,
  Compass,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { whatsappHref } from "@/data/cevonsContact";

const LOGO_MARK = "/assets/brand/cevons-logo-mark.webp";
const WHATSAPP_URL = whatsappHref;

const BRAND_ORANGE = "#EF7700";
const BRAND_ORANGE_DEEP = "#d96b00";
const BRAND_GREEN = "#2E7D32";
const BRAND_GREEN_DEEP = "#1e3a24";
const CHARCOAL = "#1A1A1A";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

type Chip = {
  label: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "orange" | "green";
};

const CHIPS: Chip[] = [
  { label: "What services do you offer?", prompt: "What services do you offer?", icon: Compass, tone: "orange" },
  { label: "Do you serve my area?",       prompt: "Do you serve my area?",        icon: MapPin,  tone: "green"  },
  { label: "Book a skip bin",             prompt: "Book a skip bin",              icon: Calendar, tone: "orange" },
  { label: "Schedule a Service",          prompt: "I'd like to schedule a service.", icon: Wrench, tone: "green"  },
];

const WELCOME_BOLD = "Hey, I'm Cev — CEVONS assistant.";
const WELCOME_BODY =
  "Ask me about our services, your area, or how to book a pickup. I can also point you to the right team.";
const WELCOME_TEXT = `${WELCOME_BOLD} ${WELCOME_BODY}`;

function detectBookingIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /\b(book|schedule|pickup|whatsapp|talk to|speak to|contact|call|agent|representative|person|quote|request|skip bin|dumpster)\b/.test(
    t,
  );
}

/* ------------------------------------------------------------------ */
/*  Logo emblem — white circular badge, code-drawn orbital ring + AI  */
/* ------------------------------------------------------------------ */
function EmblemBadge({
  size = 40,
  ring = true,
  aiBadge = true,
}: {
  size?: number;
  ring?: boolean;
  aiBadge?: boolean;
}) {
  const reduce = useReducedMotion();
  const ringSize = size + 10;
  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: ringSize, height: ringSize }}
      aria-hidden
    >
      {ring && (
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0"
          width={ringSize}
          height={ringSize}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={reduce ? undefined : { duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <circle cx="50" cy="4" r="2.4" fill="#FCE722" />
          <circle cx="96" cy="50" r="1.6" fill="#ffffff" opacity="0.9" />
        </motion.svg>
      )}
      <span
        className="absolute grid place-items-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
        style={{
          width: size,
          height: size,
          top: (ringSize - size) / 2,
          left: (ringSize - size) / 2,
        }}
      >
        <img
          src={LOGO_MARK}
          alt=""
          className="object-contain"
          style={{ width: "100%", height: "100%" }}
          draggable={false}
        />
      </span>
      {aiBadge && (
        <span
          className="absolute rounded-full px-1.5 py-[1px] text-[8px] font-bold tracking-wider text-white shadow-md"
          style={{
            background: CHARCOAL,
            bottom: 0,
            right: 0,
            lineHeight: 1.2,
            border: "1.5px solid #fff",
          }}
        >
          AI
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
const STORAGE_KEY_MESSAGES = "cev-assistant-messages";
const STORAGE_KEY_OPEN = "cev-assistant-open";
const MAX_PERSISTED_MESSAGES = 50;

function loadPersistedMessages(): Message[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Message[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.filter(
      (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string",
    );
  } catch {
    return null;
  }
}

function loadPersistedOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_OPEN) === "1";
  } catch {
    return false;
  }
}

export function ServiceAssistant() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<boolean>(() => loadPersistedOpen());
  const [messages, setMessages] = useState<Message[]>(() => {
    const persisted = loadPersistedMessages();
    return persisted && persisted.length > 0
      ? persisted
      : [{ id: uid(), role: "assistant", text: WELCOME_TEXT }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduce = useReducedMotion();

  const autosizeInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 140);
    el.style.height = `${next}px`;
  }, []);

  const resetInputHeight = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
  }, []);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return uid();
    const k = "cev-assistant-session";
    let s = window.localStorage.getItem(k);
    if (!s) {
      s = uid() + uid();
      window.localStorage.setItem(k, s);
    }
    return s;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Persist messages (cap to recent N to keep storage small)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const trimmed = messages.slice(-MAX_PERSISTED_MESSAGES);
      window.localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(trimmed));
    } catch {
      /* ignore quota errors */
    }
  }, [messages]);

  // Persist open/closed state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY_OPEN, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open]);



  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || loading) return;
      if (text.length > 1500) {
        toast.error("Message too long — please shorten it.");
        return;
      }
      const userMsg: Message = { id: uid(), role: "user", text };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      resetInputHeight();
      setLoading(true);

      try {
        const apiMessages = next.slice(-10).map((m) => ({
          role: m.role,
          content: m.text,
        }));
        const { data, error } = await supabase.functions.invoke("ai-assistant", {
          body: { mode: "public", sessionId, messages: apiMessages },
        });
        if (error) throw error;
        const reply: string =
          (data as { reply?: string })?.reply ??
          (data as { error?: string })?.error ??
          "Sorry, I couldn't generate a response.";
        const replyId = uid();
        setMessages((prev) => [...prev, { id: replyId, role: "assistant", text: reply }]);
        setStreamingId(replyId);
      } catch (e) {
        console.error("Cev assistant error", e);
        const errId = uid();
        setMessages((prev) => [
          ...prev,
          {
            id: errId,
            role: "assistant",
            text: "I couldn't reach the assistant right now. Please try again, or reach us on WhatsApp.",
          },
        ]);
        setStreamingId(errId);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, sessionId, resetInputHeight],
  );

  const handleResetClick = () => {
    if (messages.length > 1) {
      setConfirmReset(true);
      return;
    }
    setMessages([{ id: uid(), role: "assistant", text: WELCOME_TEXT }]);
    setStreamingId(null);
  };

  const confirmClearChat = () => {
    setMessages([{ id: uid(), role: "assistant", text: WELCOME_TEXT }]);
    setStreamingId(null);
    setConfirmReset(false);
  };

  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.text ?? "";
  const showWhatsAppCta = detectBookingIntent(lastUserText) && !loading;
  const showChips = messages.length === 1 && !loading;

  const panelTransition = reduce
    ? { duration: 0.2 }
    : { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const };

  const orangeGradient = `linear-gradient(135deg, ${BRAND_ORANGE} 0%, ${BRAND_ORANGE_DEEP} 100%)`;

  return (
    <>
      {/* ============ LAUNCHER ============ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open CEVONS Assistant"
        className={`group fixed bottom-5 right-5 z-[60] flex items-center gap-1.5 sm:gap-2 rounded-full pl-1.5 pr-1.5 sm:pr-3 py-1 text-left text-white shadow-[0_10px_24px_-12px_rgba(239,119,0,0.55),0_3px_8px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(239,119,0,0.65),0_5px_12px_rgba(0,0,0,0.22)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#EF7700]/40 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        } ${open ? "pointer-events-none opacity-0" : ""}`}
        style={{ background: orangeGradient, minHeight: 40 }}
      >
        <EmblemBadge size={22} />
        <span className="hidden sm:flex flex-col leading-tight pr-0.5">
          <span
            className="text-[13px] font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ask CEVONS
          </span>
          <span
            className="flex items-center gap-1 text-[8px] font-semibold uppercase text-white/80"
            style={{ fontFamily: "'Open Sans', system-ui, sans-serif", letterSpacing: "0.16em" }}
          >
            <Leaf className="h-2 w-2" style={{ color: "#A8E6A0" }} />
            AI Assistant
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="CEVONS Assistant"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 24 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
              transition={panelTransition}
              style={{ transformOrigin: "bottom right" }}
              className="fixed z-[70] bg-white shadow-2xl flex flex-col overflow-hidden
                         inset-x-0 bottom-0 top-12 rounded-t-[18px]
                         md:inset-auto md:bottom-5 md:right-5 md:top-auto md:w-[400px] md:h-[640px] md:max-h-[85vh] md:rounded-[18px]
                         border border-black/5"
            >
              {/* ============ HEADER ============ */}
              <div
                className="relative flex items-center gap-3 px-4 pt-3 pb-4 text-white"
                style={{ background: orangeGradient }}
              >
                <EmblemBadge size={42} />
                <div className="min-w-0 flex-1">
                  <p
                    className="font-bold truncate text-[15px] leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Cev — CEVONS Assistant
                  </p>
                  <p
                    className="text-[11px] text-white/90 flex items-center gap-1.5 mt-0.5"
                    style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}
                  >
                    <span className="relative inline-flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#7CE2A0] opacity-70 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3DDC84]" />
                    </span>
                    Online · Replies in seconds
                  </p>
                </div>
                <button
                  onClick={handleResetClick}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 hover:bg-white/25 transition"
                  aria-label="Start a new conversation"
                  title="New conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 hover:bg-white/25 transition"
                  aria-label="Minimize chat"
                  title="Minimize"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 hover:bg-white/25 transition"
                  aria-label="Close chat"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* curved green hairline along the bottom edge */}
                <svg
                  className="pointer-events-none absolute inset-x-0 -bottom-px h-3 w-full"
                  viewBox="0 0 400 12"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M0,8 Q200,-4 400,8 L400,12 L0,12 Z"
                    fill="#FAF7F1"
                  />
                  <path
                    d="M0,7 Q200,-5 400,7"
                    fill="none"
                    stroke={BRAND_GREEN}
                    strokeOpacity="0.45"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* ============ MESSAGES ============ */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                style={{
                  background:
                    "radial-gradient(circle at 20% 0%, rgba(239,119,0,0.04), transparent 60%), #FAF7F1",
                }}
              >
                {messages.map((m, i) => (
                  <Bubble
                    key={m.id}
                    message={m}
                    isFirst={i === 0}
                    streaming={m.id === streamingId}
                    onStreamDone={() => setStreamingId((id) => (id === m.id ? null : id))}
                    onStreamTick={() => {
                      const el = scrollRef.current;
                      if (el) el.scrollTop = el.scrollHeight;
                    }}
                  />
                ))}

                {showChips && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {CHIPS.map((c) => {
                      const Icon = c.icon;
                      const tone = c.tone === "orange" ? BRAND_ORANGE : BRAND_GREEN;
                      const toneSoft =
                        c.tone === "orange" ? "rgba(239,119,0,0.10)" : "rgba(46,125,50,0.10)";
                      return (
                        <button
                          key={c.label}
                          onClick={() => send(c.prompt)}
                          className="group flex items-center gap-2.5 rounded-xl border border-black/8 bg-white px-3 py-2.5 text-left text-[12.5px] font-medium text-[#1A1A1A] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-black/15 hover:shadow-[0_6px_14px_rgba(0,0,0,0.08)]"
                        >
                          <span
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                            style={{ background: toneSoft, color: tone }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="leading-tight">{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {loading && <TypingDots />}

                {showWhatsAppCta && !loading && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
                    >
                      <WhatsApp className="h-3.5 w-3.5" />
                      Chat on WhatsApp
                    </a>
                    <Link
                      to="/request-service"
                      className="inline-flex items-center rounded-full border border-[#EF7700] px-3 py-1.5 text-xs font-semibold text-[#EF7700] hover:bg-[#EF7700] hover:text-white transition"
                    >
                      Open request form
                    </Link>
                  </div>
                )}
              </div>

              {/* ============ INPUT ============ */}
              <div className="bg-white px-3 pt-3 pb-2 border-t border-black/5">
                <div className="flex items-center gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      autosizeInput();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={1}
                    disabled={loading}
                    placeholder={loading ? "Cev is replying…" : "Message Cev…"}
                    aria-label="Type your message"
                    className="flex-1 resize-none rounded-2xl border border-black/10 bg-[#FAF7F1] px-4 py-2.5 text-sm leading-snug placeholder:text-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#EF7700]/30 focus:border-[#EF7700]/40 disabled:opacity-60"
                    style={{ maxHeight: 140, overflowY: "auto" }}
                  />
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    aria-label="Send"
                    title="Send message"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow-[0_4px_12px_rgba(239,119,0,0.45)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    style={{ background: orangeGradient }}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px] text-[#7A7A7A]">
                  <Lock className="h-3 w-3" />
                  AI assistant. For urgent help, reach us on{" "}
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#1B7F3A] hover:underline"
                  >
                    WhatsApp
                  </a>
                  .
                </p>
              </div>

              {/* ============ FOOTER ============ */}
              <div
                className="flex items-center justify-center gap-1.5 py-2 text-[10px] tracking-[0.18em]"
                style={{ background: BRAND_GREEN_DEEP }}
              >
                <Leaf className="h-3 w-3" style={{ color: "#A8E6A0" }} />
                <span className="font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  CEVONS
                </span>
                <span className="font-semibold" style={{ color: "#A8E6A0" }}>
                  ENVIRONMENTAL
                </span>
              </div>

              {/* ============ IN-PANEL RESET CONFIRM ============ */}
              <AnimatePresence>
                {confirmReset && (
                  <motion.div
                    className="absolute inset-0 z-10 grid place-items-center bg-black/30 backdrop-blur-[2px] p-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setConfirmReset(false)}
                  >
                    <motion.div
                      role="alertdialog"
                      aria-modal="true"
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="w-full max-w-[300px] rounded-2xl bg-white p-5 shadow-2xl border border-black/5"
                    >
                      <p className="text-[15px] font-bold text-[#0F0F0F]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Start a new conversation?
                      </p>
                      <p className="mt-1.5 text-[13px] text-[#4B5563] leading-relaxed">
                        This will clear your current chat.
                      </p>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#1A1A1A] hover:bg-black/[0.03] transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={confirmClearChat}
                          className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-white hover:brightness-110 transition"
                          style={{ background: orangeGradient }}
                        >
                          Clear chat
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({
  message,
  isFirst,
  streaming = false,
  onStreamDone,
  onStreamTick,
}: {
  message: Message;
  isFirst?: boolean;
  streaming?: boolean;
  onStreamDone?: () => void;
  onStreamTick?: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#EF7700] px-3.5 py-2 text-sm text-white whitespace-pre-wrap shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }

  // Assistant — split first message into bold lead + body
  const isWelcome = isFirst && message.text.startsWith(WELCOME_BOLD);
  const body = isWelcome ? message.text.slice(WELCOME_BOLD.length).trim() : message.text;

  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">
        <EmblemBadge size={28} ring={false} aiBadge={false} />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white border border-black/5 px-3.5 py-2.5 text-[14.5px] text-[#0F0F0F] leading-relaxed whitespace-pre-wrap shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        {isWelcome && (
          <p className="font-bold mb-1">{WELCOME_BOLD}</p>
        )}
        {streaming ? (
          <Typewriter text={body} onDone={onStreamDone} onTick={onStreamTick} />
        ) : (
          body
        )}
      </div>
    </div>
  );
}

function Typewriter({
  text,
  onDone,
  onTick,
  charsPerTick = 2,
  tickMs = 16,
}: {
  text: string;
  onDone?: () => void;
  onTick?: () => void;
  charsPerTick?: number;
  tickMs?: number;
}) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? text.length : 0);
  const onDoneRef = useRef(onDone);
  const onTickRef = useRef(onTick);
  onDoneRef.current = onDone;
  onTickRef.current = onTick;

  useEffect(() => {
    if (reduce) {
      onDoneRef.current?.();
      return;
    }
    if (count >= text.length) {
      onDoneRef.current?.();
      return;
    }
    const id = window.setTimeout(() => {
      setCount((c) => Math.min(text.length, c + charsPerTick));
      onTickRef.current?.();
    }, tickMs);
    return () => window.clearTimeout(id);
  }, [count, text, charsPerTick, tickMs, reduce]);

  const shown = text.slice(0, count);
  const done = count >= text.length;
  return (
    <>
      {shown}
      {!done && (
        <span
          aria-hidden
          className="inline-block w-[2px] h-[1em] align-[-2px] ml-[1px] bg-[#EF7700] animate-pulse"
        />
      )}
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">
        <EmblemBadge size={28} ring={false} aiBadge={false} />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-white border border-black/5 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF7700] animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF7700] animate-bounce" style={{ animationDelay: "120ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF7700] animate-bounce" style={{ animationDelay: "240ms" }} />
        </div>
      </div>
    </div>
  );
}
