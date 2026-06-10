import logoMark from "@/assets/cevons-logo-transparent.png";

type Variant = "full" | "mark";
type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { h: string; text: string }> = {
  sm: { h: "h-8", text: "text-base" },
  md: { h: "h-11", text: "text-lg" },
  lg: { h: "h-14", text: "text-2xl" },
  xl: { h: "h-20", text: "text-3xl" },
};

export interface CevonsLogoProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  priority?: boolean;
  /** Override text color for the wordmark (full variant only). */
  textClassName?: string;
}

/**
 * Single source of truth for the CEVON'S brand mark.
 * - "mark"  → circular C logo only.
 * - "full"  → circular C logo + "CEVON'S" wordmark.
 */
export function CevonsLogo({
  variant = "mark",
  size = "md",
  className = "",
  priority = false,
  textClassName = "text-cevons-dark",
}: CevonsLogoProps) {
  const { h, text } = sizeMap[size];

  const img = (
    <img
      src={logoMark}
      alt="CEVON'S Environmental Services logo"
      className={`${h} w-auto object-contain shrink-0`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={512}
      height={512}
      draggable={false}
    />
  );

  if (variant === "mark") {
    return <span className={`inline-flex items-center ${className}`}>{img}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {img}
      <span className={`font-extrabold tracking-tight leading-none ${text} ${textClassName}`}>
        CEVON&rsquo;S
      </span>
    </span>
  );
}

export default CevonsLogo;
