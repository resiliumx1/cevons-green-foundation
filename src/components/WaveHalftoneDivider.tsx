import { memo, useMemo } from "react";

export interface WaveHalftoneDividerProps {
  /** Color used for the area BELOW the wave (should match the next section's bg). */
  underFill?: string;
  className?: string;
  /** Height of the divider in px (controls aspect via viewBox scaling). */
  height?: number;
}

// Slim, level wave centered around y=40 in a 1440x100 viewBox.
// Gentle undulation, no diagonal climb left-to-right.
const WAVE_BASE_Y = 40;
const WAVE_TOP_D =
  "M0,40 C180,28 360,54 540,40 C720,28 900,52 1080,40 C1260,28 1380,50 1440,40 L1440,100 L0,100 Z";
const WAVE_HIGHLIGHT_D =
  "M0,40 C180,28 360,54 540,40 C720,28 900,52 1080,40 C1260,28 1380,50 1440,40";

interface Dot {
  cx: number;
  cy: number;
  r: number;
  o: number;
  delay: number;
}

function generateDots(): Dot[] {
  // Field above the wave: x in [180, 1440], y in [0, 32]
  const dots: Dot[] = [];
  const cols = 46;
  const rows = 8;
  const xStart = 180;
  const xEnd = 1440;
  const yStart = 0;
  const yEnd = 32;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = c / (cols - 1);
      const ty = r / (rows - 1);
      const jitterX = (Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
      const jitterY = (Math.cos(c * 39.346 + r * 11.135) * 24634.6345) % 1;
      const x = xStart + tx * (xEnd - xStart) + jitterX * 14;
      const y = yStart + ty * (yEnd - yStart) + jitterY * 6;

      // density: denser/larger toward bottom-right, sparser toward top-left
      const d = Math.pow(tx, 1.15) * 0.55 + Math.pow(ty, 1.25) * 0.55;
      const weight = Math.min(1, d);

      const keepProb = 0.15 + weight * 0.95;
      const rng = Math.abs(Math.sin(c * 1.37 + r * 7.91)) % 1;
      if (rng > keepProb) continue;

      const waveY = approxWaveY(x);
      if (y > waveY - 3) continue;

      const r0 = 0.5 + weight * 2.6;
      const o0 = 0.08 + weight * 0.85;

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

// Approximate y of the wave's top curve at x in [0,1440]. Level baseline ~40 with mild ripple.
function approxWaveY(x: number): number {
  const t = x / 1440;
  return WAVE_BASE_Y + Math.sin(t * Math.PI * 4) * 10;
}

function WaveHalftoneDividerImpl({
  className = "",
  height = 90,
}: WaveHalftoneDividerProps) {
  const dots = useMemo(generateDots, []);

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
          vectorEffect="non-scaling-stroke"
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
