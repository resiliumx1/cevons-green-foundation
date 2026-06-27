import { useState, type FormEvent } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Variant = "footer" | "section" | "card";

interface Props {
  source: string;
  variant?: Variant;
  heading?: string;
  subheading?: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function subscribeEmail(email: string, source: string) {
  const value = email.trim().toLowerCase();
  if (!value || value.length > 320 || !EMAIL_RE.test(value)) {
    return { ok: false as const, error: "Please enter a valid email address." };
  }
  const { error } = await (supabase as any)
    .from("newsletter_subscribers")
    .insert({ email: value, source, consent: true });
  if (error) {
    // Unique violation → treat as success (already subscribed)
    if ((error as any).code === "23505") return { ok: true as const, already: true };
    return { ok: false as const, error: "Couldn't subscribe right now. Please try again." };
  }
  return { ok: true as const, already: false };
}

export function NewsletterSignup({
  source,
  variant = "section",
  heading = "Stay in the loop",
  subheading = "Tips, service updates, and news from CEVONS — straight to your inbox.",
}: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await subscribeEmail(email, source);
    if (res.ok) {
      setState("success");
      setMessage(res.already ? "You're already subscribed — thanks!" : "Thanks! You're on the list.");
      setEmail("");
    } else {
      setState("error");
      setMessage(res.error);
    }
  }

  if (variant === "footer") {
    return (
      <form onSubmit={onSubmit} className="w-full" noValidate aria-label="Newsletter signup">
        <label htmlFor="nl-footer" className="block text-white text-sm font-bold uppercase tracking-wider mb-3">
          Newsletter
        </label>
        <p className="text-white/70 text-xs leading-relaxed mb-3">
          Get CEVONS news, tips and service updates.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/60" />
            <input
              id="nl-footer"
              type="email"
              required
              autoComplete="email"
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={state === "loading"}
              className="w-full h-11 pl-9 pr-3 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-cevons-yellow"
            />
          </div>
          <button
            type="submit"
            disabled={state === "loading"}
            className="h-11 px-4 rounded-lg bg-cevons-yellow text-cevons-dark text-sm font-bold hover:brightness-105 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Subscribe"}
          </button>
        </div>
        <StatusLine state={state} message={message} tone="dark" />
      </form>
    );
  }

  // section variant
  return (
    <section className="bg-cevons-cream border-y border-cevons-deep-green/10">
      <div className="container-cevons py-12 md:py-14">
        <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-cevons-deep-green/10 shadow-sm p-6 md:p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-2 inline-flex items-center gap-2">
            <Mail className="size-4" /> Newsletter
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-cevons-deep-green">{heading}</h2>
          <p className="mt-2 text-sm md:text-base text-cevons-muted">{subheading}</p>
          <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Newsletter signup"
            className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-cevons-muted" />
              <input
                type="email"
                required
                autoComplete="email"
                maxLength={320}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={state === "loading"}
                aria-label="Email address"
                className="w-full h-12 pl-9 pr-3 rounded-lg bg-white border border-cevons-deep-green/15 text-cevons-dark placeholder:text-cevons-muted text-sm focus:outline-none focus:ring-2 focus:ring-cevons-green"
              />
            </div>
            <button
              type="submit"
              disabled={state === "loading"}
              className="h-12 px-5 rounded-lg bg-cevons-deep-green text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Subscribe"}
            </button>
          </form>
          <StatusLine state={state} message={message} tone="light" />
          <p className="mt-3 text-[11px] text-cevons-muted">
            We respect your privacy. Unsubscribe any time.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatusLine({
  state,
  message,
  tone,
}: {
  state: "idle" | "loading" | "success" | "error";
  message: string;
  tone: "dark" | "light";
}) {
  if (state !== "success" && state !== "error") return null;
  const isSuccess = state === "success";
  const base = tone === "dark" ? (isSuccess ? "text-cevons-yellow" : "text-red-200") : isSuccess ? "text-cevons-green" : "text-red-600";
  return (
    <p role="status" aria-live="polite" className={`mt-3 text-xs inline-flex items-center gap-1.5 ${base}`}>
      {isSuccess ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
      {message}
    </p>
  );
}
