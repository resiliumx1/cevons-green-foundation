import { memo } from "react";

export interface WaveHalftoneDividerProps {
  /** Color used for the area BELOW the wave (should match the next section's bg). */
  underFill?: string;
  className?: string;
  /** Height of the divider in px (controls aspect via viewBox scaling). */
  height?: number;
  /** Render the subtle halftone dot field. Defaults to false (clean divider). */
  showDots?: boolean;
}

// Calmer two-crest curve centred on y=50 in a 1440x100 viewBox.
const WAVE_TOP_D =
  "M0,50 C360,36 720,64 1080,50 C1260,43 1380,46 1440,44 L1440,100 L0,100 Z";
const WAVE_HIGHLIGHT_D =
  "M0,50 C360,36 720,64 1080,50 C1260,43 1380,46 1440,44";

function WaveHalftoneDividerImpl({
  className = "",
  height = 56,
  underFill = "var(--surface-page)",
}: WaveHalftoneDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="block w-full h-full"
      >
        {/* Wave body reads as the NEXT section rising over the hero photo. */}
        <path d={WAVE_TOP_D} fill={underFill} />
        {/* Orange hairline crest — a line that guides the eye, not a slab. */}
        <path
          d={WAVE_HIGHLIGHT_D}
          fill="none"
          stroke="var(--brand-orange)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export const WaveHalftoneDivider = memo(WaveHalftoneDividerImpl);
export default WaveHalftoneDivider;
