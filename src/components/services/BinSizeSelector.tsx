import { useState } from "react";
import { Check } from "lucide-react";

export type BinSizeOption = {
  id: string;
  label: string;
  tagline: string;
  dimensions: string;
  capacity: string;
  bestFor: string[];
  image: string;
  imageAlt: string;
};

export function BinSizeSelector({ options, eyebrow, heading, intro }: {
  options: BinSizeOption[];
  eyebrow?: string;
  heading: string;
  intro?: string;
}) {
  const [activeId, setActiveId] = useState(options[0]?.id);
  const active = options.find((o) => o.id === activeId) ?? options[0];
  if (!active) return null;

  return (
    <section className="py-12 md:py-16 bg-[var(--surface-page)]">
      <div className="container-cevons">
        <div className="max-w-3xl mb-10 md:mb-12">
          {eyebrow && (
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.22em] text-[var(--brand-orange)] mb-3">
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-[var(--text-heading)]">
            {heading}
          </h2>
          {intro && (
            <p className="mt-4 text-base md:text-lg text-[var(--text-body)] leading-relaxed">
              {intro}
            </p>
          )}
        </div>

        {/* Size chip selector */}
        <div
          role="tablist"
          aria-label="Choose a bin size"
          className="flex flex-wrap gap-3 mb-8"
        >
          {options.map((o) => {
            const isActive = o.id === activeId;
            return (
              <button
                key={o.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(o.id)}
                className={[
                  "group relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm md:text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2",
                  isActive
                    ? "bg-[var(--brand-orange)] text-[var(--brand-charcoal)] shadow-[0_8px_24px_-8px_rgba(239,119,0,0.55)]"
                    : "bg-[var(--surface-emphasis)] text-[var(--text-heading)] border-2 border-[var(--border-hairline,#e5e7eb)] hover:border-[var(--brand-orange)]",
                ].join(" ")}
              >
                {isActive && <Check className="size-4" strokeWidth={3} />}
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-stretch">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--brand-grey-light,#f4f4f5)] ring-1 ring-black/5">
            <img
              key={active.id}
              src={active.image}
              alt={active.imageAlt}
              loading="lazy"
              className="block w-full h-auto animate-in fade-in duration-300"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-orange)] mb-3">
              {active.label}
            </p>
            <h3 className="text-xl md:text-2xl font-extrabold text-[var(--text-heading)] mb-4 leading-tight">
              {active.tagline}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-[var(--surface-emphasis)] ring-1 ring-black/5 p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-body)]">Dimensions</dt>
                <dd className="mt-1 text-base font-semibold text-[var(--text-heading)]">{active.dimensions}</dd>
              </div>
              <div className="rounded-xl bg-[var(--surface-emphasis)] ring-1 ring-black/5 p-4">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-body)]">Capacity</dt>
                <dd className="mt-1 text-base font-semibold text-[var(--text-heading)]">{active.capacity}</dd>
              </div>
            </dl>
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-body)] mb-3">Best for</p>
            <ul className="space-y-2">
              {active.bestFor.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[var(--text-heading)]">
                  <Check className="size-5 shrink-0 text-[var(--brand-orange)] mt-0.5" strokeWidth={2.5} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
