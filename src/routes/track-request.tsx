import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search, MessageCircle, Phone, ShieldCheck, Clock, Award,
  Check, Package, FileText, User, MapPin, Calendar, Truck,
  ChevronRight, ClipboardList, PhoneCall, ClipboardCheck,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CevonsIcon } from "@/components/CevonsIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track-request")({
  head: () => ({
    meta: [
      { title: "Track Your Request | CEVON'S Guyana" },
      { name: "description", content: "Track the status of your CEVON'S service request. Enter your reference number to get real-time updates." },
      { property: "og:title", content: "Track Your Request | CEVON'S Guyana" },
      { property: "og:description", content: "Track the status of your CEVON'S service request." },
    ],
    links: [{ rel: "canonical", href: "/track-request" }],
  }),
  component: TrackRequestPage,
});

/* ------------------------------------------------------------------ */
/*  Types & demo data                                                  */
/* ------------------------------------------------------------------ */

type StatusKey =
  | "New"
  | "Under Review"
  | "Contacted"
  | "Quote Sent"
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled";

interface TimelineItem {
  status: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_META: Record<
  StatusKey,
  { color: string; text: string; bg: string; border?: string }
> = {
  New: { color: "text-slate-700", text: "text-slate-700", bg: "bg-slate-100" },
  "Under Review": { color: "text-amber-700", text: "text-amber-700", bg: "bg-amber-100" },
  Contacted: { color: "text-emerald-700", text: "text-emerald-700", bg: "bg-emerald-50", border: "border border-emerald-200" },
  "Quote Sent": { color: "text-amber-700", text: "text-amber-700", bg: "bg-amber-100" },
  Scheduled: { color: "text-white", text: "text-emerald-700", bg: "bg-[#006B35]" },
  "In Progress": { color: "text-white", text: "text-[#003F27]", bg: "bg-[#003F27]" },
  Completed: { color: "text-white", text: "text-emerald-700", bg: "bg-emerald-600" },
  Cancelled: { color: "text-white", text: "text-red-700", bg: "bg-red-600" },
};

const DEMO_TIMELINE: TimelineItem[] = [
  { status: "Submitted", description: "Request received successfully.", timestamp: "May 15, 2026 10:24 AM", icon: ClipboardList },
  { status: "Under Review", description: "Our team is reviewing your request details.", timestamp: "May 15, 2026 11:05 AM", icon: FileText },
  { status: "Contacted", description: "We reached out via WhatsApp to confirm details.", timestamp: "May 15, 2026 02:18 PM", icon: PhoneCall },
  { status: "Quote Sent", description: "A quote was provided for your approval.", timestamp: "May 15, 2026 04:42 PM", icon: FileText },
  { status: "Scheduled", description: "Service confirmed for May 17, morning window.", timestamp: "May 16, 2026 09:00 AM", icon: Calendar },
  { status: "In Progress", description: "Service is currently being performed.", timestamp: "—", icon: Truck },
  { status: "Completed", description: "Service completed and site cleared.", timestamp: "—", icon: ClipboardCheck },
];

const trustItems = [
  { icon: ShieldCheck, label: "Licensed & Insured" },
  { icon: Clock, label: "Same-Day Response" },
  { icon: Award, label: "Trusted Across Guyana" },
  { icon: Phone, label: "24/7 Support" },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

function TrackRequestPage() {
  const [mounted, setMounted] = useState(false);
  const [refInput, setRefInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showDemo] = useState(true); // placeholder toggle for future real data

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const visibleResult = submitted || showDemo;

  return (
    <SiteLayout>
      {/* Hero / Title */}
      <section className="bg-[var(--cevons-cream)] border-b border-[var(--cevons-border)]">
        <div className="container-cevons px-4 py-12 md:py-16 text-center">
          <nav className="text-sm text-[var(--cevons-muted)] mb-3">
            <Link to="/" className="hover:text-[var(--cevons-dark)] transition-colors">Home</Link>
            <span className="mx-2 text-[var(--cevons-border)]">/</span>
            <span className="text-[var(--cevons-dark)]">Track Request</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--cevons-dark)]">
            Track Your Request
          </h1>
          <p className="mt-3 text-lg text-[var(--cevons-muted)] max-w-xl mx-auto">
            Enter your details to check the status of your service request.
          </p>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="bg-white">
        <div className="container-cevons px-4 py-10 md:py-14">
          <div
            className={cn(
              "max-w-lg mx-auto rounded-2xl border border-[var(--cevons-border)] bg-white p-6 md:p-8 shadow-[0_8px_32px_rgba(16,24,32,0.06)] transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <form onSubmit={handleTrack} className="space-y-5">
              <div>
                <Label htmlFor="ref" className="text-sm font-semibold text-[var(--cevons-dark)]">
                  Reference Number
                </Label>
                <Input
                  id="ref"
                  placeholder="e.g. CEV-2026-000124"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  className="mt-1.5 h-12 rounded-[10px] border-[var(--cevons-border)] focus-visible:ring-[#006B35]"
                />
              </div>
              <div>
                <Label htmlFor="contact" className="text-sm font-semibold text-[var(--cevons-dark)]">
                  Email or Phone Number
                </Label>
                <Input
                  id="contact"
                  placeholder="Email or phone used during request"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="mt-1.5 h-12 rounded-[10px] border-[var(--cevons-border)] focus-visible:ring-[#006B35]"
                />
              </div>
              <button type="submit" className="btn-base btn-green w-full">
                <Search className="size-4" />
                Track Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Result Card + Timeline */}
      {visibleResult && (
        <section className="bg-[var(--cevons-cream)] border-t border-[var(--cevons-border)]">
          <div className="container-cevons px-4 py-10 md:py-16">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Status Result Card */}
              <div
                className={cn(
                  "rounded-2xl border border-[var(--cevons-border)] bg-white p-6 md:p-8 shadow-[0_8px_32px_rgba(16,24,32,0.06)] transition-all duration-700",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: "200ms" }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-bold text-[var(--cevons-dark)]">
                        Request Details
                      </h2>
                      <StatusBadge status="Scheduled" />
                    </div>
                    <p className="mt-1 text-sm text-[var(--cevons-muted)]">
                      Reference: <span className="font-mono font-semibold text-[var(--cevons-dark)]">CEV-2026-000124</span>
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cevons-muted)]">Service</p>
                    <p className="text-base font-bold text-[var(--cevons-dark)]">Dumpster Rental</p>
                  </div>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DetailTile icon={Package} label="Service" value="Dumpster Rental" />
                  <DetailTile icon={MapPin} label="Location" value="Georgetown, Guyana" />
                  <DetailTile icon={Calendar} label="Submitted" value="May 15, 2026 10:24 AM" />
                  <DetailTile icon={Clock} label="Service Window" value="May 17, 2026, 8:00 AM – 12:00 PM" />
                </div>

                <div className="mt-5 pt-5 border-t border-[var(--cevons-border)] flex items-center gap-2 text-sm text-[var(--cevons-muted)]">
                  <User className="size-4 text-[#006B35]" />
                  <span>Assigned Team:</span>
                  <span className="font-semibold text-[var(--cevons-dark)]">CEVON’S Operations</span>
                </div>
              </div>

              {/* Timeline */}
              <div
                className={cn(
                  "rounded-2xl border border-[var(--cevons-border)] bg-white p-6 md:p-8 shadow-[0_8px_32px_rgba(16,24,32,0.06)] transition-all duration-700",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: "400ms" }}
              >
                <h3 className="text-lg font-bold text-[var(--cevons-dark)] mb-6">Request Timeline</h3>
                <div className="relative">
                  {/* vertical connector line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[var(--cevons-border)]" />
                  <ol className="space-y-6">
                    {DEMO_TIMELINE.map((item, i) => {
                      const isCompleted = i < 5;
                      const isActive = i === 4;
                      const Icon = item.icon;
                      return (
                        <li
                          key={item.status}
                          className={cn(
                            "relative flex items-start gap-4 transition-all duration-500",
                            mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                          )}
                          style={{ transitionDelay: `${500 + i * 100}ms` }}
                        >
                          {/* Circle */}
                          <div className="relative z-10 shrink-0">
                            <div
                              className={cn(
                                "size-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                isCompleted || isActive
                                  ? "bg-[#006B35] border-[#006B35] text-white"
                                  : "bg-white border-[var(--cevons-border)] text-[var(--cevons-muted)]"
                              )}
                            >
                              {isCompleted ? (
                                <Check className="size-5" />
                              ) : (
                                <Icon className="size-5" />
                              )}
                            </div>
                          </div>
                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <span
                                className={cn(
                                  "text-base font-semibold",
                                  isCompleted || isActive ? "text-[var(--cevons-dark)]" : "text-[var(--cevons-muted)]"
                                )}
                              >
                                {item.status}
                              </span>
                              <span className="text-xs text-[var(--cevons-muted)] font-medium">
                                {item.timestamp}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "mt-0.5 text-sm leading-relaxed",
                                isCompleted || isActive ? "text-[var(--cevons-muted)]" : "text-[var(--cevons-border)]"
                              )}
                            >
                              {item.description}
                            </p>
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
      )}

      {/* Need Help CTA */}
      <section className="bg-white border-t border-[var(--cevons-border)]">
        <div className="container-cevons px-4 py-10 md:py-14">
          <div
            className={cn(
              "max-w-2xl mx-auto rounded-2xl border border-[var(--cevons-border)] bg-[var(--cevons-cream)] p-8 md:p-10 text-center transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: "600ms" }}
          >
            <div className="mx-auto size-12 rounded-full bg-[#006B35]/10 flex items-center justify-center">
              <MessageCircle className="size-6 text-[#006B35]" />
            </div>
            <h2 className="mt-4 text-xl md:text-2xl font-bold text-[var(--cevons-dark)]">Need Help?</h2>
            <p className="mt-2 text-[var(--cevons-muted)] max-w-md mx-auto">
              Contact our support team for assistance with your request.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/contact" className="btn-base btn-green w-full sm:w-auto">
                <MessageCircle className="size-4" />
                WhatsApp Us
              </a>
              <a href="/contact" className="btn-base btn-outline-green w-full sm:w-auto">
                <Phone className="size-4" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Trust Strip */}
      <section className="bg-white border-t border-[var(--cevons-border)]">
        <div className="container-cevons px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-[var(--cevons-muted)]">
                <item.icon className="size-4 text-[#006B35]" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: StatusKey }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
        meta.bg,
        meta.text,
        meta.border
      )}
    >
      {status}
    </span>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--cevons-border)] bg-[var(--cevons-cream)] p-4">
      <div className="flex items-center gap-2 text-[var(--cevons-muted)] mb-1">
        <Icon className="size-4 text-[#006B35]" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--cevons-dark)] leading-snug">{value}</p>
    </div>
  );
}
