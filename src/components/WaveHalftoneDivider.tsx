import { memo, useMemo } from "react";

export interface WaveHalftoneDividerProps {
  /** Color used for the area BELOW the wave (should match the next section's bg). */
  underFill?: string;
  className?: string;
  /** Height of the divider in px (controls aspect via viewBox scaling). */
  height?: number;
}

// Wave path tuned to a smooth S-like double curve across a 1440x220 viewBox.
// Crest dips on the left, rises toward the right.
const WAVE_TOP_D =
  "M0,150 C220,90 420,200 720,150 C980,108 1180,40 1440,90 L1440,220 L0,220 Z";
// Thin highlight line along the very top edge of the wave (slightly above the fill top).
const WAVE_HIGHLIGHT_D =
  "M0,150 C220,90 420,200 720,150 C980,108 1180,40 1440,90";

interface Dot {
  cx: number;
  cy: number;
  r: number;
  o: number;
  delay: number;
}

function generateDots(): Dot[] {
  // Field roughly above-right of the wave: x in [200, 1440], y in [0, 170]
  const dots: Dot[] = [];
  const cols = 46;
  const rows = 16;
  const xStart = 180;
  const xEnd = 1440;
  const yStart = 0;
  const yEnd = 175;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Base grid position with mild jitter for organic feel.
      const tx = c / (cols - 1);
      const ty = r / (rows - 1);
      const jitterX = (Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
      const jitterY = (Math.cos(c * 39.346 + r * 11.135) * 24634.6345) % 1;
      const x = xStart + tx * (xEnd - xStart) + jitterX * 14;
      const y = yStart + ty * (yEnd - yStart) + jitterY * 10;

      // Halftone weight: denser/larger toward bottom-right, sparser/smaller toward top-left.
      // density factor 0..1
      const d = Math.pow(tx, 1.15) * 0.55 + Math.pow(ty, 1.25) * 0.55;
      const weight = Math.min(1, d);

      // Probability of keeping the dot — rarefy upper-left.
      const keepProb = 0.15 + weight * 0.95;
      const rng = Math.abs(Math.sin(c * 1.37 + r * 7.91)) % 1;
      if (rng > keepProb) continue;

      // Avoid drawing dots that would land beneath the visible wave fill.
      // Approximate wave y(x) using the same control shape (cheap polyline sample).
      const waveY = approxWaveY(x);
      if (y > waveY - 4) continue;

      const r0 = 0.6 + weight * 4.2; // radius 0.6 → ~4.8
      const o0 = 0.08 + weight * 0.85; // opacity 0.08 → ~0.93

      dots.push({
        cx: x,
        cy: y,
        r: r0,
        o: Math.min(1, o0),
        delay: (rng * 6 + tx * 2) % 6,
      });
    }
  }
  return dots;
}

// Cheap analytic approximation of the wave's top curve y(x) for x in [0,1440].
function approxWaveY(x: number): number {
  // Sample the cubic-ish curve with a closed form blend of 3 sinusoids tuned to match WAVE_TOP_D.
  const t = x / 1440;
  // Mix that visually tracks: dip near t~0.25 (y high ~ 180 visually low), peak near t~0.85 (y low ~ 50)
  const y =
    150 +
    Math.sin(t * Math.PI * 1.0) * -10 + // mild base
    Math.sin(t * Math.PI * 2.0 + 0.4) * 38 + // double-curve component
    (t - 0.5) * -90; // overall rise to the right
  return y;
}

function WaveHalftoneDividerImpl({
  underFill = "#ffffff",
  className = "",
  height = 220,
}: WaveHalftoneDividerProps) {
  const dots = useMemo(generateDots, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 1440 220"
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

        {/* Under-wave fill matches next section bg (prevents seam). */}
        <rect x="0" y="0" width="1440" height="220" fill={underFill} />

        {/* Halftone dot field — drifts subtly. Wave drawn on top so dots tuck behind crest. */}
        <g className="whd-dots" fill="#F26F1C">
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              opacity={d.o}
              style={{ animationDelay: `${d.delay}s` }}
              className="whd-dot"
            />
          ))}
        </g>

        {/* Orange wave crest */}
        <path d={WAVE_TOP_D} fill="url(#whd-wave)" />
        {/* Thin glossy highlight along the crest */}
        <path
          d={WAVE_HIGHLIGHT_D}
          fill="none"
          stroke="url(#whd-highlight)"
          strokeWidth="1.25"
        />
      </svg>

      <style>{`
        .whd-dots {
          animation: whd-drift 18s ease-in-out infinite alternate;
          transform-box: fill-box;
        }
        .whd-dot {
          animation: whd-twinkle 5.5s ease-in-out infinite;
        }
        @keyframes whd-drift {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(-14px); }
        }
        @keyframes whd-twinkle {
          0%, 100% { opacity: var(--o, 1); filter: none; }
          50%      { opacity: calc(var(--o, 1) * 0.55); }
        }
        @media (prefers-reduced-motion: reduce) {
          .whd-dots, .whd-dot { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

export const WaveHalftoneDivider = memo(WaveHalftoneDividerImpl);
export default WaveHalftoneDivider;
