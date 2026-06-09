import { Clock, Leaf, ShieldCheck } from "lucide-react";
import { WhatsApp } from "./icons/WhatsApp";

const items = [
  { icon: WhatsApp, title: "WhatsApp Us Anytime", sub: "Fastest way to reach us" },
  { icon: Clock, title: "Fast Response", sub: "Same business day follow-up" },
  { icon: ShieldCheck, title: "Trusted & Certified", sub: "EPA Certified & Compliant" },
  { icon: Leaf, title: "Eco-Focused", sub: "Sustainable for a better Guyana" },
];

export function TrustStrip() {
  return (
    <section className="relative overflow-hidden bg-cevons-yellow">
      {/* Red diagonal swoosh accent */}
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-10 h-[200%] w-40 bg-cevons-red opacity-90 rotate-[18deg]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-12 -top-10 h-[200%] w-3 bg-white/40 rotate-[18deg]"
      />
      <div className="container-cevons relative py-6 md:py-7">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map(({ icon: Icon, title, sub }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="shrink-0 flex items-center justify-center size-11 rounded-full bg-cevons-dark text-cevons-yellow">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold text-cevons-dark leading-tight">{title}</p>
                <p className="text-xs md:text-sm text-cevons-dark/75 leading-snug">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
