import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Check, MessageCircle, RefreshCw, Search, FileText, Phone, ShieldCheck, Clock, Award } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/request-service/confirmation")({
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

function generateRef() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(100000 + Math.random() * 899999)).padStart(6, "0");
  return `CEV-${year}-${num}`;
}

const CEVONS_COLORS = ["#006B35", "#FFD200", "#E31B23", "#FFFFFF"];

function fireConfetti() {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const defaults = {
    spread: 70, ticks: 220, gravity: 0.9, scalar: 1,
    colors: CEVONS_COLORS, disableForReducedMotion: true,
  };
  confetti({ ...defaults, particleCount: 80, startVelocity: 45, origin: { x: 0.5, y: 0.3 } });
  setTimeout(() => confetti({ ...defaults, particleCount: 55, angle: 60, startVelocity: 55, origin: { x: 0, y: 0.6 } }), 180);
  setTimeout(() => confetti({ ...defaults, particleCount: 55, angle: 120, startVelocity: 55, origin: { x: 1, y: 0.6 } }), 360);
}

function ConfirmationPage() {
  const [ref] = useState(() => generateRef());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    const c = setTimeout(() => fireConfetti(), 250);
    return () => { clearTimeout(t); clearTimeout(c); };
  }, []);

  const steps = [
    "Our team reviews your request.",
    "We contact you by WhatsApp or phone.",
    "We confirm service details and scheduling.",
  ];

  const trustItems = [
    { icon: ShieldCheck, label: "Licensed & Insured" },
    { icon: Clock, label: "Same-Day Response" },
    { icon: Award, label: "Trusted Across Guyana" },
    { icon: Phone, label: "24/7 Support" },
  ];

  return (
    <SiteLayout>
      {/* Main Confirmation Card */}
      <section className="bg-[var(--cevons-cream)]">
        <div className="container-cevons px-4 pt-24 md:pt-28 pb-12 md:pb-20">
          <div
            className={cn(
              "max-w-2xl mx-auto rounded-2xl border border-[var(--cevons-border)] bg-white p-8 md:p-12 shadow-[0_12px_40px_rgba(16,24,32,0.06)] text-center transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            {/* Decorative confetti dots */}
            <div className="relative flex justify-center mb-2">
              <div className="absolute -top-4 -left-2 md:left-8 size-3 rounded-full bg-[var(--cevons-red)] opacity-60" />
              <div className="absolute -top-6 right-4 md:right-12 size-2.5 rounded-full bg-[var(--cevons-yellow)] opacity-70" />
              <div className="absolute top-2 -left-4 md:left-4 size-2 rounded-full bg-[var(--cevons-green)] opacity-40" />
              <div className="absolute top-0 -right-5 md:right-6 size-3.5 rounded-full bg-[var(--cevons-yellow)] opacity-50" />
              <div className="absolute -top-3 left-1/2 size-2 rounded-full bg-[var(--cevons-red)] opacity-30" />

              {/* Green circle with white check */}
              <div
                className={cn(
                  "size-20 md:size-24 rounded-full bg-[#006B35] flex items-center justify-center shadow-[0_8px_24px_rgba(0,107,53,0.35)] transition-transform duration-700",
                  mounted ? "scale-100" : "scale-50"
                )}
              >
                <Check className="size-10 md:size-12 text-white stroke-[3]" />
              </div>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--cevons-dark)]">
              Request Received!
            </h1>
            <p className="mt-3 text-[var(--cevons-muted)] text-lg max-w-lg mx-auto">
              Your CEVON'S service request has been submitted successfully.
            </p>

            {/* Reference Number */}
            <div className="mt-8 inline-block rounded-xl border border-dashed border-[var(--cevons-border)] bg-[var(--cevons-cream)] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cevons-muted)]">
                Your Request Reference
              </p>
              <p className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-[var(--cevons-dark)] font-mono">
                {ref}
              </p>
              <p className="mt-2 text-sm text-[var(--cevons-muted)]">
                Save this reference number to track your request.
              </p>
            </div>

            {/* Next Steps */}
            <div className="mt-10 text-left max-w-md mx-auto">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--cevons-muted)] mb-4 text-center">
                What happens next
              </h2>
              <ol className="space-y-3">
                {steps.map((text, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border border-[var(--cevons-border)] bg-white p-3 transition-all duration-500",
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}
                    style={{ transitionDelay: `${400 + i * 120}ms` }}
                  >
                    <span className="mt-0.5 shrink-0 size-6 rounded-full bg-[#006B35]/10 flex items-center justify-center">
                      <Check className="size-4 text-[#006B35] stroke-[3]" />
                    </span>
                    <span className="text-[15px] text-[var(--cevons-dark)] leading-relaxed">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action Buttons */}
            <div
              className={cn(
                "mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-500",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: "800ms" }}
            >
              <Link
                to="/track-request"
                className="btn-base btn-green w-full sm:w-auto"
              >
                <Search className="size-4" />
                Track Your Request
              </Link>
              <a
                href="/contact"
                className="btn-base btn-outline-green w-full sm:w-auto"
              >
                <MessageCircle className="size-4" />
                WhatsApp Us
              </a>
              <Link
                to="/request-service"
                className="btn-base btn-yellow w-full sm:w-auto"
              >
                <RefreshCw className="size-4" />
                Submit Another Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Immediate Assistance Box */}
      <section className="bg-white border-b border-[var(--cevons-border)]">
        <div className="container-cevons px-4 py-10 md:py-14">
          <div
            className={cn(
              "max-w-2xl mx-auto rounded-2xl border border-[var(--cevons-border)] bg-[var(--cevons-cream)] p-8 md:p-10 text-center transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: "500ms" }}
          >
            <div className="mx-auto size-12 rounded-full bg-[#006B35]/10 flex items-center justify-center">
              <MessageCircle className="size-6 text-[#006B35]" />
            </div>
            <h2 className="mt-4 text-xl md:text-2xl font-bold text-[var(--cevons-dark)]">
              Need Immediate Assistance?
            </h2>
            <p className="mt-2 text-[var(--cevons-muted)] max-w-md mx-auto">
              Chat with our team on WhatsApp for urgent support or real-time updates.
            </p>
            <a
              href="/contact"
              className="mt-5 inline-flex btn-base btn-green"
            >
              <MessageCircle className="size-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Related Actions */}
      <section className="bg-[var(--cevons-cream)]">
        <div className="container-cevons px-4 py-10 md:py-14">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-[var(--cevons-muted)] mb-8">
            You may also be interested in
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {
                title: "Our Services",
                body: "Browse the full range of CEVON'S environmental services.",
                to: "/services",
                icon: FileText,
              },
              {
                title: "Service Areas",
                body: "See where we operate across Georgetown, Linden & Berbice.",
                to: "/locations",
                icon: Search,
              },
              {
                title: "About CEVON'S",
                body: "Learn more about our mission and commitment to Guyana.",
                to: "/about",
                icon: ShieldCheck,
              },
            ].map((card, i) => (
              <Link
                key={card.title}
                to={card.to}
                className={cn(
                  "group rounded-xl border border-[var(--cevons-border)] bg-white p-6 text-left transition-all duration-500 hover:border-[#006B35] hover:shadow-[0_8px_24px_rgba(0,63,39,0.08)]",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                )}
                style={{ transitionDelay: `${700 + i * 100}ms` }}
              >
                <div className="size-10 rounded-lg bg-[#006B35]/10 flex items-center justify-center group-hover:bg-[#006B35] transition-colors">
                  <card.icon className="size-5 text-[#006B35] group-hover:text-white transition-colors" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[var(--cevons-dark)]">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--cevons-muted)] leading-relaxed">
                  {card.body}
                </p>
              </Link>
            ))}
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
