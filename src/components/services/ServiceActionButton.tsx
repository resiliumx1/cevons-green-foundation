import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "learn" | "request";
type Size = "sm" | "md";
type Tone = "light" | "dark";

export interface ServiceActionButtonProps {
  to: string;
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  children: ReactNode;
  ariaLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Reusable CTA used on every service card / listing.
 * - `learn`   → outlined pill (adapts to light/dark surfaces)
 * - `request` → filled brand-orange pill with sheen + arrow slide
 *
 * Keeps typography, height, ring, and motion identical everywhere.
 */
export function ServiceActionButton({
  to,
  variant = "learn",
  size = "md",
  tone = "light",
  children,
  ariaLabel,
  icon: Icon = ArrowRight,
  className = "",
}: ServiceActionButtonProps) {
  const sizeCls =
    size === "sm"
      ? "h-9 px-3 text-[11.5px]"
      : "h-11 px-4 text-[12.5px]";

  const base =
    "group/btn relative inline-flex w-full items-center justify-center gap-1.5 rounded-xl font-bold uppercase tracking-[0.06em] " +
    "overflow-hidden isolate select-none whitespace-nowrap " +
    "transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-out " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    (tone === "dark" ? "focus-visible:ring-offset-[var(--brand-charcoal)] " : "focus-visible:ring-offset-white ") +
    "active:translate-y-0 active:scale-[0.98]";

  const learnLight = [
    "bg-white text-[var(--cevons-deep-green)]",
    "border border-[var(--cevons-deep-green)]/25 shadow-[0_1px_0_rgba(16,24,32,0.03)]",
    "hover:-translate-y-0.5 hover:bg-[var(--cevons-deep-green)] hover:text-white hover:border-[var(--cevons-deep-green)]",
    "hover:shadow-[0_12px_24px_-14px_rgba(0,60,30,0.55)]",
    "focus-visible:ring-[var(--cevons-deep-green)]",
  ].join(" ");

  const learnDark = [
    "bg-white/5 text-white",
    "border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    "hover:-translate-y-0.5 hover:bg-white hover:text-[var(--brand-charcoal)] hover:border-white",
    "hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.6)]",
    "focus-visible:ring-white",
  ].join(" ");

  const requestCls = [
    /* Flat brand-orange keeps charcoal text at 6.06:1 (AA) across the entire fill.
       A gradient to #C45F00 would drop charcoal to 4.13:1 — banned. */
    "text-[var(--text-on-orange)] shadow-[0_6px_18px_-8px_rgba(239,119,0,0.55)]",
    "bg-[var(--brand-orange)]",
    "ring-1 ring-inset ring-black/10",
    "hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(239,119,0,0.7)] hover:brightness-[1.04]",
    "focus-visible:ring-[var(--brand-orange)]",
  ].join(" ");

  const variantCls =
    variant === "request" ? requestCls : tone === "dark" ? learnDark : learnLight;

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={`${base} ${sizeCls} ${variantCls} ${className}`}
    >
      {/* Sheen sweep on hover (primary only) */}
      {variant === "request" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_35%,rgba(26,26,26,0.18)_50%,transparent_65%)] transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
        />
      )}
      <span className="relative z-[1] inline-flex items-center gap-1.5">
        {children}
        <Icon className="size-3.5 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5" />
      </span>
    </Link>
  );
}

/**
 * Standard row of both CTAs used on every service card.
 * Ensures identical spacing + alignment across all listings.
 */
export function ServiceActionRow({
  learnTo,
  learnLabel = "Learn more",
  requestTo = "/request-service",
  requestLabel = "Request",
  ariaTitle,
  size,
  tone = "light",
  className = "",
}: {
  learnTo: string;
  learnLabel?: string;
  requestTo?: string;
  requestLabel?: string;
  ariaTitle: string;
  size?: Size;
  tone?: Tone;
  className?: string;
}) {
  const border =
    tone === "dark"
      ? "border-white/10"
      : "border-[var(--cevons-deep-green)]/10";
  return (
    <div
      className={`grid grid-cols-2 gap-2.5 pt-4 border-t ${border} ${className}`}
    >
      <ServiceActionButton
        to={learnTo}
        variant="learn"
        size={size}
        tone={tone}
        ariaLabel={`Learn more about ${ariaTitle}`}
      >
        {learnLabel}
      </ServiceActionButton>
      <ServiceActionButton
        to={requestTo}
        variant="request"
        size={size}
        tone={tone}
        ariaLabel={`Request ${ariaTitle}`}
      >
        {requestLabel}
      </ServiceActionButton>
    </div>
  );
}
