import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

interface Props {
  icon: ComponentType<LucideProps>;
  /** Optional small uppercase eyebrow above the title. */
  eyebrow?: string;
  /** @deprecated no longer used — kept for backward compatibility. */
  flankIcon?: boolean;
  title: string;
  subtitle?: ReactNode;
  /** Buttons / action content that renders inside the white action card. */
  children: ReactNode;
  /** @deprecated no longer used — the new banner uses a single restrained arc. */
  texture?: "dots" | "diagonal" | "flame";
  /** Optional heading override in the white action card. */
  actionEyebrow?: string;
  /** Optional intro copy in the white action card. */
  actionIntro?: string;
  className?: string;
}

/**
 * Reusable orange CTA banner.
 *
 * Contrast rule (non-negotiable): text on the orange field is ALWAYS
 * charcoal (var(--text-on-orange) = #1A1A1A, 6.0:1). White on orange
 * fails AA (2.87:1) and is banned.
 *
 * Layout: split (icon + eyebrow + Playfair heading + subtitle on the
 * left; a solid white action card on the right). Stacks on mobile.
 *
 * Decoration: one restrained semi-circle arc anchored bottom-right,
 * low opacity yellow — the guide's "circles for softness". No dot
 * grids, no diagonals, no radial glows.
 */
export function OrangeCTABanner({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  children,
  actionEyebrow = "Get Started",
  actionIntro = "Choose how you'd like to reach us.",
  className = "",
}: Props) {
  return (
    <section className={`bg-[var(--surface-page)] py-12 md:py-20 ${className}`}>
      <div className="container-cevons px-4">
        <div
          className="relative overflow-hidden rounded-[28px] shadow-[0_24px_60px_-28px_rgba(0,0,64,0.55)] ring-1 ring-black/5"
          style={{
            /* FIXED navy fill — does not flip in dark mode. All text on
               this band MUST use fixed / fill-relative tokens (white,
               grey-light, yellow), NEVER mode-aware tokens like
               --text-heading / --text-body / --text-eyebrow, or they will
               drop out in one mode. White on navy = 16:1; grey-light on
               navy ≈ 11.7:1; yellow on navy ≈ 12.8:1. */
            backgroundColor: "var(--brand-navy)",
          }}
        >
          {/* One restrained arc — low-opacity orange on navy, per guide. */}
          <svg
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 w-[420px] h-[420px] pointer-events-none"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="100" fill="var(--brand-orange)" opacity="0.18" />
          </svg>
          {/* Smaller balancing arc top-left, very subtle yellow. */}
          <svg
            aria-hidden="true"
            className="absolute -top-16 -left-16 w-[220px] h-[220px] pointer-events-none"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="100" fill="var(--brand-yellow)" opacity="0.08" />
          </svg>

          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center p-8 sm:p-10 md:p-12 lg:p-14">
            {/* LEFT: copy — fixed light values for navy field. */}
            <div style={{ color: "var(--text-on-navy)" }}>
              {eyebrow && (
                <p
                  className="inline-flex items-center gap-2 rounded-full ring-1 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    color: "var(--brand-yellow)",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    borderColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  {eyebrow}
                </p>
              )}

              <div className={`flex items-start gap-5 ${eyebrow ? "mt-5" : ""}`}>
                <span
                  className="hidden sm:flex shrink-0 size-16 items-center justify-center rounded-2xl ring-1"
                  style={{
                    backgroundColor: "var(--brand-white)",
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "var(--brand-green)",
                  }}
                >
                  <Icon className="size-8" strokeWidth={2.25} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2
                    className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]"
                    style={{ color: "var(--text-on-navy)" }}
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p
                      className="mt-4 text-base md:text-lg leading-relaxed max-w-xl"
                      style={{ color: "var(--brand-grey-light)" }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: solid white action card.
                This card is DELIBERATELY white in BOTH light and dark modes
                because it sits on the navy brand field, which does not
                flip. Its text must therefore use FIXED brand values, not
                mode-aware semantic tokens (var(--text-eyebrow),
                var(--text-heading), var(--text-body)) — those tokens flip
                and become invisible on the white surface. */}

            <div
              className="relative rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)]"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--brand-red)" }}
              >
                {actionEyebrow}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--brand-grey-dark)" }}>
                {actionIntro}
              </p>
              <div className="mt-5 flex flex-col gap-3">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrangeCTABanner;
