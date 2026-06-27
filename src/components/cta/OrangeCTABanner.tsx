import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

interface Props {
  icon: ComponentType<LucideProps>;
  /** Show thin horizontal lines flanking the icon badge. */
  flankIcon?: boolean;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Decorative texture variant. */
  texture?: "dots" | "diagonal" | "flame";
  className?: string;
}

/**
 * Reusable centered orange CTA banner.
 * - Brand orange (#EF7700 → #C45F00) gradient background
 * - Circular outline icon badge at top, optional flanking divider lines
 * - Playfair Display heading via font-display, Open Sans body
 * - Subtle CSS-only texture overlay
 */
export function OrangeCTABanner({
  icon: Icon,
  flankIcon = false,
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
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 14px)",
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
          className="relative overflow-hidden rounded-2xl px-6 py-12 md:px-16 md:py-20 text-center shadow-[0_18px_60px_-20px_rgba(239,119,0,0.45)]"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, #EF7700 0%, #EF7700 55%, #C45F00 100%)",
          }}
        >
          {/* Texture */}
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] pointer-events-none" style={textureStyle} />
          {/* Soft corner glows */}
          <div aria-hidden="true" className="absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Icon badge */}
            <div className="mx-auto mb-6 flex items-center justify-center gap-4 max-w-md">
              {flankIcon && <span aria-hidden className="hidden sm:block h-px flex-1 bg-white/40" />}
              <span className="inline-flex size-14 items-center justify-center rounded-full border border-white/70 bg-white/10 backdrop-blur-sm shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
                <Icon className="size-6 text-white" strokeWidth={2} aria-hidden="true" />
              </span>
              {flankIcon && <span aria-hidden className="hidden sm:block h-px flex-1 bg-white/40" />}
            </div>

            <h2 className="font-display text-white text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-5 text-white/90 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrangeCTABanner;
