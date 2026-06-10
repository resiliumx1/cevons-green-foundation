import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import logoMark from "@/assets/cevons-logo.png";
import { WaveDivider, type WaveVariant } from "@/components/WaveDivider";

type Crumb = { label: string; href?: string };
type Height = "compact" | "standard" | "large";
type Align = "left" | "center";

export interface PageHeroProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  imageSrc: string;
  imageAlt: string;
  align?: Align;
  height?: Height;
  showSwoosh?: boolean;
  /** Variant of the animated brand wave shown at the bottom of the hero. */
  waveVariant?: WaveVariant;
  showLogoBadge?: boolean;
  /** CSS object-position for the background image. Defaults to "center center". */
  imagePosition?: string;
  /** Mark <img> as fetchpriority=high + eager. Use only for the homepage above-the-fold hero. */
  priority?: boolean;
  children?: ReactNode;
}

const heightClass: Record<Height, string> = {
  compact: "min-h-[260px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[340px]",
  standard: "min-h-[300px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[440px]",
  large: "min-h-[560px] md:min-h-[620px] lg:min-h-[78vh]",
};

function LogoBadge() {

  return (
    <div
      aria-hidden
      className="hidden md:inline-flex absolute top-5 right-5 lg:top-6 lg:right-6 z-20 items-center gap-2 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/25 shadow-[0_6px_20px_rgba(0,0,0,0.25)] text-white"
    >
      <img
        src={logoMark}
        alt=""
        width={48}
        height={48}
        className="h-7 w-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
      />
      <span className="text-[11px] font-extrabold tracking-tight uppercase leading-none">
        CEVON&rsquo;S
      </span>
    </div>
  );
}

export function PageHero({
  title,
  eyebrow,
  subtitle,
  breadcrumb,
  imageSrc,
  imageAlt,
  align = "left",
  height = "standard",
  showSwoosh = true,
  showLogoBadge = false,
  imagePosition = "center center",
  priority = false,
  children,
}: PageHeroProps) {
  const overlay =
    align === "center"
      ? "linear-gradient(180deg, rgba(0,63,39,0.78) 0%, rgba(0,63,39,0.52) 60%, rgba(0,0,0,0.20) 100%)"
      : "linear-gradient(90deg, rgba(0,63,39,0.90) 0%, rgba(0,63,39,0.66) 45%, rgba(0,0,0,0.20) 100%)";

  return (
    <section
      className={`relative overflow-hidden ${heightClass[height]} flex items-center`}
      aria-label={title}
    >
      <div className="absolute inset-0">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          {...(priority ? { fetchPriority: "high" as const } : {})}
          width={1920}
          height={1080}
          className="size-full object-cover"
          style={{ objectPosition: imagePosition }}
        />
        <div className="absolute inset-0" style={{ background: overlay }} aria-hidden />
      </div>

      {showLogoBadge && <LogoBadge />}

      <div
        className={`container-cevons relative z-10 py-14 md:py-20 ${
          align === "center" ? "text-center mx-auto" : ""
        }`}
      >
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol
              className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 ${
                align === "center" ? "justify-center" : ""
              }`}
            >
              {breadcrumb.map((c, i) => {
                const last = i === breadcrumb.length - 1;
                return (
                  <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                    {c.href && !last ? (
                      <Link
                        to={c.href}
                        className="hover:text-[#FFD200] transition-colors"
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={last ? "page" : undefined}
                        className={last ? "text-[#FFD200] font-semibold" : ""}
                      >
                        {c.label}
                      </span>
                    )}
                    {!last && <ChevronRight className="size-3.5 text-white/50" aria-hidden />}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <p className="mb-3 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#FFD200]">
            {eyebrow}
          </p>
        )}

        <h1
          className={`text-white font-extrabold tracking-tight ${
            height === "large"
              ? "text-4xl md:text-6xl lg:text-7xl"
              : "text-3xl md:text-5xl lg:text-6xl"
          } ${align === "center" ? "mx-auto max-w-4xl" : "max-w-3xl"}`}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={`mt-4 md:mt-5 text-white/90 text-base md:text-xl leading-relaxed ${
              align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
            }`}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-7">{children}</div>}
      </div>

      {showSwoosh && <Swoosh />}
    </section>
  );
}

export default PageHero;
