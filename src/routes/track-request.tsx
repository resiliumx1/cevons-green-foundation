import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Search, MessageCircle, Phone, ShieldCheck, Clock, Award,
  Check, FileText, MapPin, Calendar, Truck,
  ClipboardList, PhoneCall, ClipboardCheck, AlertCircle, Loader2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { cevonsContact, primaryTelHref, primaryMailtoHref, whatsappHref } from "@/data/cevonsContact";

const searchSchema = z.object({ ref: z.string().optional() });

export const Route = createFileRoute("/track-request")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Track Your Request | CEVON'S Guyana" },
      { name: "description", content: "Enter your reference and contact to check the live status of your CEVON'S service request." },
      { property: "og:title", content: "Track Your Request | CEVON'S Guyana" },
      { property: "og:description", content: "Track the status of your CEVON'S service request." },
    ],
    links: [{ rel: "canonical", href: "/track-request" }],
  }),
  component: TrackRequestPage,
});

/* Status mapping: internal -> customer-friendly stage */
const STAGES = [
  { key: "new", label: "Received", icon: ClipboardList },
  { key: "contacted", label: "Contacted", icon: PhoneCall },
  { key: "quoted", label: "Quote Sent", icon: FileText },
  { key: "scheduled", label: "Scheduled", icon: Calendar },
  { key: "won", label: "Completed", icon: ClipboardCheck },
] as const;

const TERMINAL_LOST = "lost";

function stageIndexFor(status: string): number {
  if (status === TERMINAL_LOST) return -2;
  const i = STAGES.findIndex((s) => s.key === status);
  return i;
}

type TrackResult = {
  request: {
    reference: string;
    service: string | null;
    category: string | null;
    status: string;
    region: string | null;
    created_at: string;
    preferred_date: string | null;
    preferred_time: string | null;
  };
  events: { status: string; note: string | null; created_at: string }[];
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch { return iso; }
}

function TrackRequestPage() {
  const { ref: prefillRef } = Route.useSearch();
  const [refInput, setRefInput] = useState(prefillRef ?? "");
  const [contactInput, setContactInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!refInput.trim() || !contactInput.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error: fnErr } = await supabase.functions.invoke("track-request", {
        body: { reference: refInput.trim(), contact: contactInput.trim() },
      });
      if (fnErr || !data) {
        // supabase-js sets fnErr for non-2xx responses
        setError("not_found");
        return;
      }
      if ((data as any).error) {
        setError((data as any).error);
        return;
      }
      setResult(data as TrackResult);
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <PageHero
        title="Track Your Request"
        subtitle="Enter your reference and contact to check the status of your service request."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Track Request" }]}
        imageSrc="/assets/heroes/hero-track-request.webp"
        imageAlt="Customer tracking a CEVON'S service request online"
        height="standard"
        waveVariant="minimal"
      />


      {/* Lookup form */}
      <section className="bg-white">
        <div className="container-cevons px-4 py-10 md:py-14">
          <div className={cn("max-w-lg mx-auto rounded-2xl border border-[var(--cevons-border)] bg-white p-6 md:p-8 shadow-[0_8px_32px_rgba(16,24,32,0.06)] transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
            <form onSubmit={handleTrack} className="space-y-5">
              <div>
                <Label htmlFor="ref" className="text-sm font-semibold text-[var(--cevons-dark)]">Reference Number</Label>
                <Input
                  id="ref"
                  placeholder="e.g. CEV-2026-AB3K9"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                  className="mt-1.5 h-12 rounded-[10px] border-[var(--cevons-border)] focus-visible:ring-[#EF7700] font-mono"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact" className="text-sm font-semibold text-[var(--cevons-dark)]">Email or Phone Number</Label>
                <Input
                  id="contact"
                  placeholder="Email or phone used on your request"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="mt-1.5 h-12 rounded-[10px] border-[var(--cevons-border)] focus-visible:ring-[#EF7700]"
                  required
                />
                <p className="mt-1.5 text-xs text-[var(--cevons-muted)]">
                  We verify this against the contact used at submission to protect your request privacy.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-base btn-green w-full disabled:opacity-60">
                {loading ? <><Loader2 className="size-4 animate-spin" />Looking up…</> : <><Search className="size-4" />Track Request</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* States */}
      {loading && (
        <section className="bg-[var(--cevons-cream)] border-t border-[var(--cevons-border)]">
          <div className="container-cevons px-4 py-10 md:py-16 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[var(--cevons-border)] bg-white p-8 animate-pulse">
              <div className="h-6 w-48 bg-[var(--cevons-border)] rounded mb-3" />
              <div className="h-4 w-64 bg-[var(--cevons-border)] rounded mb-6" />
              <div className="space-y-3">
                {[0,1,2,3,4].map((i) => <div key={i} className="h-12 bg-[var(--cevons-border)]/60 rounded" />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="bg-[var(--cevons-cream)] border-t border-[var(--cevons-border)]">
          <div className="container-cevons px-4 py-10 md:py-16 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-[var(--cevons-border)] bg-white p-8 text-center">
              <div className="mx-auto size-12 rounded-full bg-[#E31B23]/10 flex items-center justify-center">
                <AlertCircle className="size-6 text-[#E31B23]" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[var(--cevons-dark)]">
                {error === "network" ? "We couldn't reach our servers" : "Request not found"}
              </h3>
              <p className="mt-2 text-[var(--cevons-muted)]">
                {error === "network"
                  ? "Check your connection and try again."
                  : "Double-check your reference and the email or phone you used. If you still can't find it, contact us and we'll help."}
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-base btn-green">
                  <MessageCircle className="size-4" />WhatsApp Us
                </a>
                <a href={primaryTelHref} className="btn-base btn-outline-green">
                  <Phone className="size-4" />Call {cevonsContact.primaryPhone}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && !error && result && <ResultView result={result} />}

      {/* Need help */}
      <section className="bg-white border-t border-[var(--cevons-border)]">
        <div className="container-cevons px-4 py-10 md:py-14">
          <div className="max-w-2xl mx-auto rounded-2xl border border-[var(--cevons-border)] bg-[var(--cevons-cream)] p-8 md:p-10 text-center">
            <div className="mx-auto size-12 rounded-full bg-[#EF7700]/10 flex items-center justify-center">
              <MessageCircle className="size-6 text-[#EF7700]" />
            </div>
            <h2 className="mt-4 text-xl md:text-2xl font-bold text-[var(--cevons-dark)]">Having trouble finding your request?</h2>
            <p className="mt-2 text-[var(--cevons-muted)] max-w-md mx-auto">
              Call <a href={primaryTelHref} className="font-semibold text-[#EF7700] hover:underline">{cevonsContact.primaryPhone}</a>{" "}
              or email <a href={primaryMailtoHref} className="font-semibold text-[#EF7700] hover:underline">{cevonsContact.email}</a>{" "}
              and our team will help you locate it.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-base btn-green w-full sm:w-auto">
                <MessageCircle className="size-4" />WhatsApp Us
              </a>
              <a href={primaryTelHref} className="btn-base btn-outline-green w-full sm:w-auto">
                <Phone className="size-4" />Call {cevonsContact.primaryPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-[var(--cevons-border)]">
        <div className="container-cevons px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: ShieldCheck, label: "Licensed & Insured" },
              { icon: Clock, label: "Same-Day Response" },
              { icon: Award, label: "Trusted Across Guyana" },
              { icon: Phone, label: "24/7 Support" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-[var(--cevons-muted)]">
                <item.icon className="size-4 text-[#EF7700]" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ResultView({ result }: { result: TrackResult }) {
  const { request, events } = result;
  const currentIdx = stageIndexFor(request.status);
  const isLost = request.status === TERMINAL_LOST;

  // Find latest event timestamp per stage key
  const stageTimestamps = new Map<string, string>();
  for (const ev of events) {
    stageTimestamps.set(ev.status, ev.created_at);
  }

  const statusLabel = isLost
    ? "Closed"
    : (STAGES.find((s) => s.key === request.status)?.label ?? "Received");

  const badgeClass = isLost
    ? "bg-[#E31B23]/10 text-[#E31B23]"
    : request.status === "won"
    ? "bg-emerald-600 text-white"
    : "bg-[#EF7700] text-white";

  return (
    <section className="bg-[var(--cevons-cream)] border-t border-[var(--cevons-border)]">
      <div className="container-cevons px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Summary card */}
          <div className="rounded-2xl border border-[var(--cevons-border)] bg-white p-6 md:p-8 shadow-[0_8px_32px_rgba(16,24,32,0.06)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--cevons-dark)]">Request Details</h2>
                  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", badgeClass)}>
                    {statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--cevons-muted)]">
                  Reference: <span className="font-mono font-semibold text-[var(--cevons-dark)]">{request.reference}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailTile icon={FileText} label="Service" value={request.service ?? "—"} />
              <DetailTile icon={MapPin} label="Location" value={request.region ?? "—"} />
              <DetailTile icon={Calendar} label="Submitted" value={formatDateTime(request.created_at)} />
              <DetailTile
                icon={Clock}
                label="Preferred Window"
                value={request.preferred_date
                  ? `${request.preferred_date}${request.preferred_time ? ` · ${request.preferred_time}` : ""}`
                  : "To be confirmed"}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-[var(--cevons-border)] bg-white p-6 md:p-8 shadow-[0_8px_32px_rgba(16,24,32,0.06)]">
            <h3 className="text-lg font-bold text-[var(--cevons-dark)] mb-6">Request Timeline</h3>

            {isLost && (
              <p className="mb-6 text-sm text-[var(--cevons-muted)]">
                This request has been closed. If this was unexpected, please contact us.
              </p>
            )}

            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[var(--cevons-border)]" />
              <ol className="space-y-6">
                {STAGES.map((stage, i) => {
                  const isCompleted = !isLost && i < currentIdx;
                  const isActive = !isLost && i === currentIdx;
                  const isFuture = isLost || i > currentIdx;
                  const Icon = stage.icon;
                  const ts = stageTimestamps.get(stage.key);
                  return (
                    <li key={stage.key} className="relative flex items-start gap-4">
                      <div className="relative z-10 shrink-0">
                        <div className={cn(
                          "size-10 rounded-full flex items-center justify-center border-2 transition-colors",
                          isCompleted && "bg-[#EF7700] border-[#EF7700] text-white",
                          isActive && "bg-[#EF7700] border-[#EF7700] text-white",
                          isFuture && "bg-white border-[var(--cevons-border)] text-[var(--cevons-muted)]",
                        )}>
                          {isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
                        </div>
                        {isActive && (
                          <span className="absolute inset-0 rounded-full bg-[#EF7700] opacity-30 animate-ping" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className={cn(
                            "text-base font-semibold",
                            (isCompleted || isActive) ? "text-[var(--cevons-dark)]" : "text-[var(--cevons-muted)]"
                          )}>
                            {stage.label}
                            {isActive && <span className="ml-2 text-xs font-bold uppercase text-[#EF7700]">Current</span>}
                          </span>
                          {ts && (
                            <span className="text-xs text-[var(--cevons-muted)] font-medium">{formatDateTime(ts)}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--cevons-border)] bg-[var(--cevons-cream)] p-4">
      <div className="flex items-center gap-2 text-[var(--cevons-muted)] mb-1">
        <Icon className="size-4 text-[#EF7700]" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--cevons-dark)] leading-snug">{value}</p>
    </div>
  );
}
