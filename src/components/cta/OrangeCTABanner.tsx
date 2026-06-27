import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

interface Props {
  icon: ComponentType<LucideProps>;
  /** Optional small uppercase eyebrow above the title. */
  eyebrow?: string;
  /** @deprecated kept for backward compatibility (no visual effect in new layout). */
  flankIcon?: boolean;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Decorative texture variant. */
  texture?: "dots" | "diagonal" | "flame";
  className?: string;
}

/**
 * Reusable orange CTA banner — premium two-column layout.
 *
 * Layout:
 *  - Left: large icon halo, optional eyebrow, Playfair title, supporting copy.
 *  - Right: frosted white "action card" wrapping the CTA buttons for contrast.
 *
 * Stacks to a single column on mobile while preserving identical content.
 */
export function OrangeCTABanner({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  children,
  texture = "dots",
  className = "",
}: Props) {
  const textureStyle =
    texture === "diagonal"
      ? {
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 16px)",
        }
      : texture === "flame"
        ? {
            backgroundImage:
              "radial-gradient(circle at 92% 70%, rgba(255,255,255,0.10) 0, transparent 38%), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
            backgroundSize: "auto, 22px 22px",
          }
        : {
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          };

  return (
    <section className={`bg-white dark:bg-[#0b0b0b] py-12 md:py-20 ${className}`}>
      <div className="container-cevons px-4">
        <div
          className="relative overflow-hidden rounded-[28px] shadow-[0_30px_60px_-25px_rgba(239,119,0,0.55)] ring-1 ring-black/5"
          style={{
            background:
              "linear-gradient(120deg, #C45F00 0%, #EF7700 45%, #FF8A2A 100%)",
          }}
        >
          {/* Texture */}
          <div aria-hidden className="absolute inset-0 opacity-[0.18] pointer-events-none mix-blend-overlay" style={textureStyle} />
          {/* Soft corner glows */}
          <div aria-hidden className="absolute -left-28 -bottom-28 size-[420px] rounded-full pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(255,210,0,0.30) 0%, transparent 65%)" }} />
          <div aria-hidden className="absolute -right-32 -top-32 size-[480px] rounded-full pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 60%)" }} />

          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center p-8 sm:p-10 md:p-12 lg:p-14">
            {/* LEFT: copy */}
            <div className="text-white">
              {eyebrow && (
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]">
                  {eyebrow}
                </p>
              )}

              <div className={`flex items-start gap-5 ${eyebrow ? "mt-5" : ""}`}>
                <span className="hidden sm:flex shrink-0 size-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <Icon className="size-8 text-white drop-shadow" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-4 text-white/90 text-base md:text-lg leading-relaxed max-w-xl">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: frosted action card */}
            <div className="relative rounded-2xl bg-white/95 dark:bg-white/95 backdrop-blur-sm p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/60">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EF7700]">Get Started</p>
              <p className="mt-1 text-sm text-[#64748B]">Choose how you'd like to reach us.</p>
              <div className="mt-5 flex flex-col gap-3">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrangeCTABanner;
