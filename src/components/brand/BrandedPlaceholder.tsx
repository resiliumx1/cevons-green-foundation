import logoMark from "@/assets/cevons-logo.png";

type Aspect = "video" | "square" | "card" | "wide";
const aspectMap: Record<Aspect, string> = {
  video: "aspect-video",
  square: "aspect-square",
  card: "aspect-[4/3]",
  wide: "aspect-[21/9]",
};

export interface BrandedPlaceholderProps {
  label?: string;
  category?: string;
  aspect?: Aspect;
  className?: string;
}

/**
 * Branded fallback card for missing service / news / fleet images.
 * Deep green background, brand swoosh accent, centered logo mark.
 */
export function BrandedPlaceholder({
  label,
  category,
  aspect = "card",
  className = "",
}: BrandedPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label ? `CEVON'S — ${label}` : "CEVON'S Environmental Services"}
      className={`relative overflow-hidden rounded-2xl bg-cevons-deep-green text-white ${aspectMap[aspect]} ${className}`}
    >
      {/* Soft radial highlight */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(0,107,53,0.5) 0%, transparent 60%)",
        }}
      />
      {/* Brand swoosh accent */}
      <svg
        aria-hidden
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        className="absolute -bottom-px left-0 right-0 w-full h-[40%]"
      >
        <path d="M0,140 C180,80 380,60 600,30 L600,200 L0,200 Z" fill="#FFD200" opacity="0.95" />
        <path d="M0,120 C200,70 400,55 600,10 L600,90 C400,60 200,80 0,150 Z" fill="#E31B23" opacity="0.9" />
      </svg>

      <div className="relative h-full w-full flex flex-col items-center justify-center text-center p-5">
        {category && (
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-cevons-yellow mb-3">
            {category}
          </p>
        )}
        <img
          src={logoMark}
          alt=""
          className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
          loading="lazy"
          decoding="async"
          width={160}
          height={160}
          draggable={false}
        />
        {label && (
          <p className="mt-3 text-sm sm:text-base font-semibold text-white/95 max-w-[80%]">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

export default BrandedPlaceholder;
