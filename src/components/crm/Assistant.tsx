import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Loader2,
} from "lucide-react";

type Message = {
  id: string;
  role: "bot" | "user";
  text: string;
  routes?: string[];
};

const uid = () => Math.random().toString(36).slice(2, 10);

const ROUTE_LABELS: Record<string, string> = {
  "/crm": "Open Dashboard",
  "/crm/leads": "Open Leads",
  "/crm/conversations": "Open Conversations",
  "/crm/customers": "Open Customers",
  "/crm/marketing": "Open Marketing",
  "/crm/reports": "Open Reports",
  "/crm/reviews": "Open Reviews",
  "/crm/settings": "Open Settings",
};
const routeLabel = (to: string) => ROUTE_LABELS[to] ?? `Open ${to}`;

const SUGGESTED_CHIPS = [
  "How do I add a lead?",
  "Where's campaign ROI?",
  "Import customers",
  "Explain the pipeline",
];

const WELCOME_TEXT =
  "Hey — I'm your Growth Command Assistant. I can walk you through any part of the CRM: leads, campaigns, reports, settings. What do you need?";

export function CrmAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: uid(), role: "bot", text: WELCOME_TEXT },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reduce = useReducedMotion();

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return uid();
    const k = "crm-assistant-session";
    let s = window.localStorage.getItem(k);
    if (!s) {
      s = uid() + uid();
      window.localStorage.setItem(k, s);
    }
    return s;
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
      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      setLoading(true);

      try {
        const apiMessages = history.slice(-10).map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));
        const { data, error } = await supabase.functions.invoke("ai-assistant", {
          body: { mode: "crm", sessionId, messages: apiMessages },
        });
        if (error) throw error;
        const replyText: string =
          (data as { reply?: string })?.reply ??
          (data as { error?: string })?.error ??
          "Sorry, I couldn't generate a response.";

        const routeMatches = Array.from(replyText.matchAll(/\/crm(?:\/[a-z-]+)?/gi))
          .map((m) => m[0].toLowerCase());
        const uniqueRoutes = Array.from(new Set(routeMatches)).slice(0, 4);

        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "bot",
            text: replyText,
            routes: uniqueRoutes.length ? uniqueRoutes : undefined,
          },
        ]);
      } catch (e) {
        console.error("CRM assistant error", e);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "bot",
            text: "I couldn't reach the assistant right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, sessionId],
  );

  const reset = () => setMessages([{ id: uid(), role: "bot", text: WELCOME_TEXT }]);

  const panelTransition = reduce
    ? { duration: 0.2 }
    : { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <>
      {/* Trigger buttons */}
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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Growth Command Assistant"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
              transition={panelTransition}
              style={{
                background: "var(--crm-surface)",
                borderColor: "var(--crm-border)",
                color: "var(--crm-text)",
                boxShadow: "-24px 0 60px -20px rgba(0,0,0,0.35), -8px 0 18px -8px rgba(0,0,0,0.2)",
                transformOrigin: "top right",
              }}
              className="fixed z-[80] flex flex-col overflow-hidden
                         inset-x-0 bottom-0 top-0
                         md:inset-auto md:top-4 md:bottom-4 md:right-4
                         md:w-[440px] md:max-w-[95vw] md:rounded-2xl border"
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
                  <p className="font-semibold leading-tight text-[14px]" style={{ color: "var(--crm-text)" }}>
                    Growth Command Assistant
                  </p>
                  <p className="text-[11px] leading-tight flex items-center gap-1.5" style={{ color: "var(--crm-text-muted)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    Online · replies in seconds
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="rounded-md p-1.5 hover:opacity-80 transition"
                  aria-label="Reset conversation"
                  title="Reset"
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

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ background: "var(--crm-bg)" }}
              >
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} />
                ))}

                {messages.length === 1 && !loading && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTED_CHIPS.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5"
                        style={{
                          borderColor: "var(--crm-primary)",
                          background: "var(--crm-surface)",
                          color: "var(--crm-primary)",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}

                {loading && <TypingDots />}
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
                  disabled={loading}
                  placeholder={loading ? "Thinking…" : "Ask about leads, campaigns, reports…"}
                  aria-label="Type your message"
                  className="flex-1 resize-none rounded-2xl border px-4 py-2.5 text-sm leading-snug max-h-28 focus:outline-none focus:ring-2 disabled:opacity-60"
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
                  disabled={!input.trim() || loading}
                  aria-label="Send"
                  className="h-10 w-10 grid place-items-center rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  style={{ background: "var(--crm-primary)" }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </motion.aside>
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
        <div
          className="max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm text-white shadow-sm whitespace-pre-wrap"
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
          className="rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm leading-relaxed shadow-sm border whitespace-pre-wrap"
          style={{
            background: "var(--crm-surface)",
            borderColor: "var(--crm-border)",
            color: "var(--crm-text)",
          }}
        >
          {message.text}
        </div>
        {message.routes && message.routes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.routes.map((to) => (
              <Link
                key={to}
                to={to as "/crm"}
                className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold transition hover:-translate-y-0.5"
                style={{
                  background: "var(--crm-primary)",
                  borderColor: "var(--crm-primary)",
                  color: "#fff",
                }}
              >
                {routeLabel(to)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-start gap-2">
      <div
        className="h-7 w-7 rounded-lg grid place-items-center text-white shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, var(--crm-primary-bright), var(--crm-primary))" }}
      >
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div
        className="rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border"
        style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
      >
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: "var(--crm-primary)", animationDelay: "0ms" }} />
          <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: "var(--crm-primary)", animationDelay: "120ms" }} />
          <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: "var(--crm-primary)", animationDelay: "240ms" }} />
        </div>
      </div>
    </div>
  );
}
