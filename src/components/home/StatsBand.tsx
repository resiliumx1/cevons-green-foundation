import { Award, Home, MapPin, Recycle, type LucideIcon } from "lucide-react";
import marketLeaderBadge from "@/assets/market-leader-badge.png.asset.json";

export type StatItem = { value: string; label: string; icon?: LucideIcon };

const DEFAULT_ICONS: LucideIcon[] = [Award, Home, Recycle, MapPin];

/** Impact stats band — shared by the hardcoded and CRM-driven homepage. */
export function StatsBand({ items }: { items: StatItem[] }) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "var(--surface-dark-alt)" }}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: "var(--brand-orange)" }} />
      <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-[38%] hidden md:block">
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="size-full">
          <path d="M40,0 L400,0 L400,200 L0,200 Z" fill="var(--brand-orange)" />
          <path d="M110,0 L400,0 L400,200 L70,200 Z" fill="var(--brand-orange-dark)" />
          <path d="M170,0 L400,0 L400,200 L130,200 Z" fill="var(--brand-yellow)" opacity="0.28" />
        </svg>
      </div>
      <div className="container-cevons py-14 md:py-16 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white w-full lg:w-auto">
            {items.map((s, i) => {
              const Icon = s.icon ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length];
              return (
                <li key={`${s.label}-${i}`} className="flex items-center gap-4">
                  <Icon className="size-7 text-white shrink-0" />
                  <div>
                    <p className="text-2xl md:text-3xl font-extrabold leading-tight text-white">{s.value}</p>
                    <p className="text-xs md:text-sm text-white/80 mt-1.5 font-medium">{s.label}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="relative z-10 flex-shrink-0 w-full flex justify-center lg:w-auto">
            <img
              src={marketLeaderBadge.url}
              alt="Market Leader - Trusted Since 1997"
              className="h-auto w-[280px] md:w-[320px] rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
