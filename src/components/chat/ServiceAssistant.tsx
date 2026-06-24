import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Send, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WhatsApp } from "@/components/icons/WhatsApp";
import logoMark from "@/assets/cevons-logo-transparent.png";
import { whatsappHref } from "@/data/cevonsContact";

const WHATSAPP_URL = whatsappHref;

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const SUGGESTED_CHIPS = [
  "What services do you offer?",
  "Do you serve my area?",
  "Book a skip bin",
  "Talk to a person",
];

const WELCOME_TEXT =
  "Hey, I'm Cev — CEVON'S assistant. Ask me about our services, your area, or how to book a pickup. I can also point you to the right team.";

function detectBookingIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /\b(book|schedule|pickup|whatsapp|talk to|speak to|contact|call|agent|representative|person|quote|request|skip bin|dumpster)\b/.test(t);
}

export function ServiceAssistant() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: uid(), role: "assistant", text: WELCOME_TEXT },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduce = useReducedMotion();

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
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", text: reply }]);
      } catch (e) {
        console.error("Cev assistant error", e);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: "I couldn't reach the assistant right now. Please try again, or reach us on WhatsApp.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, sessionId],
  );

  const reset = () => {
    setMessages([{ id: uid(), role: "assistant", text: WELCOME_TEXT }]);
  };

  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.text ?? "";
  const showWhatsAppCta = detectBookingIntent(lastUserText) && !loading;

  const panelTransition = reduce
    ? { duration: 0.2 }
    : { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <>
      {/* Floating bubble */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open CEVON'S Assistant"
        className={`fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full pl-3 pr-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#EF7700]/40 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        } ${open ? "pointer-events-none opacity-0" : ""}`}
        style={{ background: "linear-gradient(135deg, #EF7700, #1A1A1A)" }}
      >
        <span className="relative grid place-items-center h-9 w-9 rounded-full bg-white/15 overflow-hidden">
          <img src={logoMark} alt="" className="h-7 w-7 object-contain" draggable={false} />
          <span
            className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#1A1A1A]"
            style={{ background: "#FFD200" }}
          />
        </span>
        <span className="hidden sm:inline">Ask CEVON&apos;S</span>
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
              aria-label="CEVON'S Assistant"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 24 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
              transition={panelTransition}
              style={{ transformOrigin: "bottom right" }}
              className="fixed z-[70] bg-white shadow-2xl flex flex-col overflow-hidden
                         inset-x-0 bottom-0 top-12 rounded-t-3xl
                         md:inset-auto md:bottom-5 md:right-5 md:top-auto md:w-[400px] md:h-[600px] md:max-h-[80vh] md:rounded-3xl
                         border border-[#E5E7EB]"
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 text-white"
                style={{ background: "linear-gradient(135deg, #EF7700, #1A1A1A)" }}
              >
                <div className="h-10 w-10 rounded-full bg-white grid place-items-center overflow-hidden shrink-0">
                  <img src={logoMark} alt="CEVON'S" className="h-8 w-8 object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate text-[15px]">Cev — CEVON&apos;S Assistant</p>
                  <p className="text-[11px] text-white/85 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7CE2A0] animate-pulse" />
                    Online · replies in seconds
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="rounded-md p-1.5 hover:bg-white/10 transition"
                  aria-label="Reset conversation"
                  title="Reset"
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
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBF9]">
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} />
                ))}

                {/* Suggested chips only when fresh conversation */}
                {messages.length === 1 && !loading && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTED_CHIPS.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="rounded-full border border-[#EF7700]/25 bg-white px-3 py-1.5 text-xs font-medium text-[#EF7700] hover:bg-[#EF7700] hover:text-white transition"
                      >
                        {c}
                      </button>
                    ))}
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

              {/* Input */}
              <div className="border-t border-[#E5E7EB] bg-white px-3 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
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
                    className="flex-1 resize-none rounded-2xl border border-[#E5E7EB] bg-[#FAFBF9] px-4 py-2.5 text-sm leading-snug max-h-28 focus:outline-none focus:ring-2 focus:ring-[#EF7700]/30 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    aria-label="Send"
                    className="h-10 w-10 grid place-items-center rounded-full bg-[#EF7700] text-white hover:bg-[#005a2c] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-[#94A3B8] text-center">
                  AI assistant. For urgent help, reach us on WhatsApp.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#EF7700] px-3.5 py-2 text-sm text-white whitespace-pre-wrap shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div className="h-7 w-7 rounded-full bg-white border border-[#E5E7EB] grid place-items-center overflow-hidden shrink-0 mt-0.5">
        <img src={logoMark} alt="" className="h-5 w-5 object-contain" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white border border-[#E5E7EB] px-3.5 py-2 text-sm text-[#101820] leading-relaxed whitespace-pre-wrap shadow-sm">
        {message.text}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-start gap-2">
      <div className="h-7 w-7 rounded-full bg-white border border-[#E5E7EB] grid place-items-center overflow-hidden shrink-0 mt-0.5">
        <img src={logoMark} alt="" className="h-5 w-5 object-contain" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-white border border-[#E5E7EB] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF7700] animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF7700] animate-bounce" style={{ animationDelay: "120ms" }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#EF7700] animate-bounce" style={{ animationDelay: "240ms" }} />
        </div>
      </div>
    </div>
  );
}
