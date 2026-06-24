import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  Check, MessageCircle, Search, FileText, Phone, ShieldCheck, Clock, Award,
  Copy, CheckCircle2, ClipboardList, PhoneCall, Truck, Calendar, MapPin, Home,
} from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { cn } from "@/lib/utils";
import { cevonsContact, primaryTelHref, primaryMailtoHref, whatsappHref } from "@/data/cevonsContact";

const searchSchema = z.object({ ref: z.string().optional() });

export const Route = createFileRoute("/request-service/confirmation")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Request Received | CEVON'S Guyana" },
      { name: "description", content: "Your CEVON'S service request has been received. We'll be in touch shortly." },
      { property: "og:title", content: "Request Received | CEVON'S Guyana" },
      { property: "og:description", content: "Your CEVON'S service request has been received. We'll be in touch shortly." },
    ],
    links: [{ rel: "canonical", href: "/request-service/confirmation" }],
  }),
  component: ConfirmationPage,
});

const CEVONS_COLORS = ["#EF7700", "#FFD200", "#E31B23", "#FFFFFF"];

function fireConfetti() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const defaults = { spread: 70, ticks: 220, gravity: 0.9, scalar: 1, colors: CEVONS_COLORS, disableForReducedMotion: true };
  confetti({ ...defaults, particleCount: 80, startVelocity: 45, origin: { x: 0.5, y: 0.3 } });
  setTimeout(() => confetti({ ...defaults, particleCount: 55, angle: 60, startVelocity: 55, origin: { x: 0, y: 0.6 } }), 180);
  setTimeout(() => confetti({ ...defaults, particleCount: 55, angle: 120, startVelocity: 55, origin: { x: 1, y: 0.6 } }), 360);
}

type Summary = {
  reference: string;
  name?: string;
  email?: string;
  phone?: string;
  contact?: string;
  service?: string;
  region?: string;
  preferred_date?: string;
  preferred_time?: string;
  address?: string;
};

function ConfirmationPage() {
  const { ref } = Route.useSearch();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    const c = setTimeout(() => fireConfetti(), 250);
    if (ref && typeof window !== "undefined") {
      const raw = sessionStorage.getItem(`cev:req:${ref}`);
      if (raw) {
        try { setSummary(JSON.parse(raw)); } catch { /* ignore */ }
      } else {
        setSummary({ reference: ref });
      }
    }
    return () => { clearTimeout(t); clearTimeout(c); };
  }, [ref]);

  const displayRef = summary?.reference ?? ref ?? "";
  const firstName = summary?.name?.trim().split(/\s+/)[0];

  const waMessage = useMemo(() => {
    const text = `Hi CEVON'S, I just submitted a service request. My reference is ${displayRef}.`;
    return whatsappHref.includes("?")
      ? `${whatsappHref}&text=${encodeURIComponent(text)}`
      : `${whatsappHref}?text=${encodeURIComponent(text)}`;
  }, [displayRef]);

  function handleCopy() {
    if (!displayRef || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(displayRef).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const steps = [
    { icon: ClipboardList, text: "Our team reviews your request." },
    { icon: PhoneCall, text: "We confirm details via WhatsApp or phone." },
    { icon: Truck, text: "Service scheduled and delivered." },
  ];

  return (
    <SiteLayout>
      <section className="bg-[var(--cevons-cream)]">
        <div className="container-cevons px-4 pt-24 md:pt-28 pb-12 md:pb-20">
          <div className={cn("max-w-2xl mx-auto rounded-2xl border border-[var(--cevons-border)] bg-white p-8 md:p-12 shadow-[0_12px_40px_rgba(16,24,32,0.06)] text-center transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>

            <div className="relative flex justify-center mb-2">
              <div className="absolute -top-4 -left-2 md:left-8 size-3 rounded-full bg-[var(--cevons-red)] opacity-60" />
              <div className="absolute -top-6 right-4 md:right-12 size-2.5 rounded-full bg-[var(--cevons-yellow)] opacity-70" />
              <div className="absolute top-2 -left-4 md:left-4 size-2 rounded-full bg-[var(--cevons-green)] opacity-40" />
              <div className="absolute top-0 -right-5 md:right-6 size-3.5 rounded-full bg-[var(--cevons-yellow)] opacity-50" />
              <div className={cn("size-20 md:size-24 rounded-full bg-[#EF7700] flex items-center justify-center shadow-[0_8px_24px_rgba(0,107,53,0.35)] transition-transform duration-700",
                mounted ? "scale-100" : "scale-50")}>
                <Check className={cn("size-10 md:size-12 text-white stroke-[3] transition-all duration-700", mounted ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
              </div>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--cevons-dark)]">
              Request Received!
            </h1>
            <p className="mt-3 text-[var(--cevons-muted)] text-lg max-w-lg mx-auto">
              {firstName ? `Thank you ${firstName} — your request is with our team.` : "Thank you — your request is with our team."}
            </p>

            {/* Reference Card */}
            <div className="mt-8 rounded-2xl border-2 border-[var(--cevons-yellow)] bg-[var(--cevons-cream)] px-6 py-6 shadow-[0_8px_24px_rgba(255,210,0,0.15)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cevons-muted)]">
                Your Request Reference
              </p>
              <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
                <p className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--cevons-dark)] font-mono">
                  {displayRef || "—"}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                    copied
                      ? "border-[#EF7700] bg-[#EF7700] text-white"
                      : "border-[var(--cevons-border)] bg-white text-[var(--cevons-dark)] hover:border-[#EF7700] hover:text-[#EF7700]"
                  )}
                  aria-label="Copy reference number"
                >
                  {copied ? <><CheckCircle2 className="size-3.5" />Copied</> : <><Copy className="size-3.5" />Copy</>}
                </button>
              </div>
              <p className="mt-2 text-sm text-[var(--cevons-muted)]">
                Save this number to track your request.
              </p>
            </div>

            {/* Summary */}
            {summary && (summary.service || summary.region || summary.preferred_date) && (
              <div className="mt-6 grid sm:grid-cols-2 gap-3 text-left">
                {summary.service && <SummaryTile icon={FileText} label="Service" value={summary.service} />}
                {summary.region && <SummaryTile icon={MapPin} label="Location" value={summary.region} />}
                {summary.preferred_date && (
                  <SummaryTile
                    icon={Calendar}
                    label="Preferred Date"
                    value={`${summary.preferred_date}${summary.preferred_time ? ` · ${summary.preferred_time}` : ""}`}
                  />
                )}
                {summary.contact && <SummaryTile icon={Phone} label="Contact" value={summary.contact} />}
              </div>
            )}

            {/* Next steps */}
            <div className="mt-8 text-left max-w-md mx-auto">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--cevons-muted)] mb-4 text-center">
                What happens next
              </h2>
              <ol className="space-y-3">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border border-[var(--cevons-border)] bg-white p-3 transition-all duration-500",
                        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      )}
                      style={{ transitionDelay: `${400 + i * 120}ms` }}
                    >
                      <span className="mt-0.5 shrink-0 size-8 rounded-full bg-[#EF7700]/10 flex items-center justify-center">
                        <Icon className="size-4 text-[#EF7700]" />
                      </span>
                      <span className="text-[15px] text-[var(--cevons-dark)] leading-relaxed pt-1">{s.text}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Actions */}
            <div className={cn("mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: "800ms" }}>
              <Link
                to="/track-request"
                search={{ ref: displayRef } as any}
                className="btn-base btn-green w-full sm:w-auto"
              >
                <Search className="size-4" />
                Track Your Request
              </Link>
              <a
                href={waMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base btn-outline-green w-full sm:w-auto"
              >
                <MessageCircle className="size-4" />
                WhatsApp Us
              </a>
              <Link to="/" className="btn-base btn-yellow w-full sm:w-auto">
                <Home className="size-4" />
                Back to Home
              </Link>
            </div>

            <p className="mt-6 text-xs text-[var(--cevons-muted)]">
              Same-business-day response during working hours.
            </p>
          </div>
        </div>
      </section>

      {/* Immediate Assistance */}
      <section className="bg-white border-y border-[var(--cevons-border)]">
        <div className="container-cevons px-4 py-10 md:py-14">
          <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--cevons-border)] bg-[var(--cevons-cream)] p-8 md:p-10 text-center">
            <div className="mx-auto size-12 rounded-full bg-[#EF7700]/10 flex items-center justify-center">
              <MessageCircle className="size-6 text-[#EF7700]" />
            </div>
            <h2 className="mt-4 text-xl md:text-2xl font-bold text-[var(--cevons-dark)]">
              Need help with your request?
            </h2>
            <p className="mt-2 text-[var(--cevons-muted)] max-w-md mx-auto">
              Call <a href={primaryTelHref} className="font-semibold text-[#EF7700] hover:underline">{cevonsContact.primaryPhone}</a>{" "}
              or email{" "}
              <a href={primaryMailtoHref} className="font-semibold text-[#EF7700] hover:underline">{cevonsContact.email}</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-cevons px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[ShieldCheck, Clock, Award, Phone].map((I, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[var(--cevons-muted)]">
                <I className="size-4 text-[#EF7700]" />
                <span className="font-medium">{["Licensed & Insured","Same-Day Response","Trusted Across Guyana","24/7 Support"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SummaryTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--cevons-border)] bg-white p-3">
      <div className="flex items-center gap-2 text-[var(--cevons-muted)] mb-0.5">
        <Icon className="size-3.5 text-[#EF7700]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--cevons-dark)] leading-snug">{value}</p>
    </div>
  );
}
