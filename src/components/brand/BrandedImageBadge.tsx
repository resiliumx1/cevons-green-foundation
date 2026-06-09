import logoMark from "@/assets/cevons-logo.png";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Variant = "mark" | "full";
type Tone = "glass" | "solid" | "light";
type Size = "sm" | "md" | "lg";

const positionMap: Record<Position, string> = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

const sizeMap: Record<Size, { wrap: string; img: string; text: string }> = {
  sm: { wrap: "px-2 py-1.5 gap-1.5 rounded-lg", img: "h-5 w-5", text: "text-[10px]" },
  md: { wrap: "px-2.5 py-2 gap-2 rounded-xl", img: "h-7 w-7", text: "text-[11px]" },
  lg: { wrap: "px-3 py-2.5 gap-2.5 rounded-2xl", img: "h-9 w-9", text: "text-xs" },
};

const toneMap: Record<Tone, string> = {
  glass:
    "bg-white/15 backdrop-blur-md ring-1 ring-white/25 shadow-[0_6px_20px_rgba(0,0,0,0.25)] text-white",
  solid: "bg-cevons-deep-green text-white ring-1 ring-white/10 shadow-lg",
  light: "bg-white/95 backdrop-blur-sm ring-1 ring-black/5 shadow-md text-cevons-dark",
};

export interface BrandedImageBadgeProps {
  position?: Position;
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  className?: string;
  /** Optional small label rendered next to the mark. Kept short for premium feel. */
  label?: string;
}

/**
 * Subtle, premium logo badge to overlay on hero/photo cards.
 * Use sparingly — only where it improves brand trust.
 */
export function BrandedImageBadge({
  position = "bottom-right",
  variant = "mark",
  tone = "glass",
  size = "md",
  className = "",
  label,
}: BrandedImageBadgeProps) {
  const s = sizeMap[size];
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-10 inline-flex items-center ${s.wrap} ${toneMap[tone]} ${positionMap[position]} ${className}`}
    >
      <img
        src={logoMark}
        alt=""
        className={`${s.img} object-contain shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]`}
        loading="lazy"
        decoding="async"
        width={64}
        height={64}
        draggable={false}
      />
      {variant === "full" && (
        <span className={`font-extrabold tracking-tight uppercase leading-none ${s.text}`}>
          {label ?? "CEVON\u2019S"}
        </span>
      )}
      {variant === "mark" && label && (
        <span className={`font-semibold tracking-wide uppercase leading-none opacity-90 ${s.text}`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default BrandedImageBadge;
