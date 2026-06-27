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

// Slim, level wave centered around y=40 in a 1440x100 viewBox.
const WAVE_TOP_D =
  "M0,40 C180,28 360,54 540,40 C720,28 900,52 1080,40 C1260,28 1380,50 1440,40 L1440,100 L0,100 Z";
const WAVE_HIGHLIGHT_D =
  "M0,40 C180,28 360,54 540,40 C720,28 900,52 1080,40 C1260,28 1380,50 1440,40";

function WaveHalftoneDividerImpl({
  className = "",
  height = 90,
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
        <defs>
          <linearGradient id="whd-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F26F1C" />
            <stop offset="100%" stopColor="#FF8A2A" />
          </linearGradient>
          <linearGradient id="whd-highlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Orange wave crest */}
        <path d={WAVE_TOP_D} fill="url(#whd-wave)" />
        {/* Thin glossy highlight along the crest */}
        <path
          d={WAVE_HIGHLIGHT_D}
          fill="none"
          stroke="url(#whd-highlight)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export const WaveHalftoneDivider = memo(WaveHalftoneDividerImpl);
export default WaveHalftoneDivider;
