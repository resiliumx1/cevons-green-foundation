import { memo } from "react";

export type WaveVariant =
  | "home"
  | "flow"
  | "steady"
  | "drift"
  | "breeze"
  | "heritage"
  | "minimal";

interface VariantConfig {
  /** ribbons rendered top→bottom; "red" is the top accent, "green" the base */
  ribbons: Array<"green" | "gold" | "red">;
  /** seconds for each ribbon's undulation (green, gold, red) */
  undulate: [number, number, number?];
  /** seconds for vertical drift (0 disables) */
  drift: number;
  /** vertical drift amplitude in px (peak translateY) */
  driftAmp: number;
  /** seconds between sheen sweeps (0 disables) */
  sheen: number;
  /** sheen opacity (0–1) */
  sheenOpacity: number;
  /** mobile-friendly ribbon height in % of container */
  ribbonOpacity?: number;
}

const VARIANTS: Record<WaveVariant, VariantConfig> = {
  home:     { ribbons: ["green", "gold", "red"], undulate: [18, 14, 10], drift: 11, driftAmp: 8,  sheen: 8,  sheenOpacity: 0.85 },
  flow:     { ribbons: ["green", "gold", "red"], undulate: [12, 9, 7],   drift: 0,  driftAmp: 0,  sheen: 8,  sheenOpacity: 0.7 },
  steady:   { ribbons: ["green", "gold", "red"], undulate: [26, 22, 18], drift: 0,  driftAmp: 0,  sheen: 18, sheenOpacity: 0.35 },
  drift:    { ribbons: ["green", "gold", "red"], undulate: [22, 18, 14], drift: 7,  driftAmp: 14, sheen: 14, sheenOpacity: 0.55 },
  breeze:   { ribbons: ["green", "gold", "red"], undulate: [14, 11, 9],  drift: 9,  driftAmp: 5,  sheen: 10, sheenOpacity: 0.6, ribbonOpacity: 0.92 },
  heritage: { ribbons: ["green", "gold", "red"], undulate: [28, 24, 20], drift: 18, driftAmp: 6,  sheen: 12, sheenOpacity: 0.7 },
  minimal:  { ribbons: ["green", "gold"],        undulate: [20, 16],     drift: 0,  driftAmp: 0,  sheen: 0,  sheenOpacity: 0 },
};

const RIBBON_PATHS: Record<"green" | "gold" | "red", string> = {
  green: "M0,92 C360,70 720,58 1080,54 C1440,50 1800,58 2160,72 C2520,84 2700,88 2880,90 L2880,120 L0,120 Z",
  gold:  "M0,80 C420,50 880,38 1320,34 C1760,30 2200,42 2520,58 C2700,66 2820,70 2880,72 L2880,96 C2520,82 1760,70 1320,72 C880,74 420,84 0,104 Z",
  red:   "M0,62 C480,28 960,16 1440,14 C1920,12 2400,24 2880,46 L2880,68 C2400,50 1920,40 1440,42 C960,44 480,56 0,84 Z",
};

export interface WaveDividerProps {
  variant?: WaveVariant;
  className?: string;
}

/**
 * Animated tri-color brand wave. Pure SVG + CSS, GPU-friendly, respects prefers-reduced-motion.
 * Replaces the legacy `.brand-ribbon` static stripe under page heroes.
 */
function WaveDividerImpl({ variant = "minimal", className = "" }: WaveDividerProps) {
  const cfg = VARIANTS[variant];
  const style = {
    "--wave-undulate-a": `${cfg.undulate[0]}s`,
    "--wave-undulate-b": `${cfg.undulate[1]}s`,
    "--wave-undulate-c": `${cfg.undulate[2] ?? cfg.undulate[1]}s`,
    "--wave-drift": cfg.drift > 0 ? `${cfg.drift}s` : "0s",
    "--wave-drift-amp": `${cfg.driftAmp}px`,
    "--wave-sheen": cfg.sheen > 0 ? `${cfg.sheen}s` : "0s",
    "--wave-sheen-opacity": String(cfg.sheenOpacity),
    "--wave-ribbon-opacity": String(cfg.ribbonOpacity ?? 1),
  } as React.CSSProperties;

  return (
    <div
      aria-hidden="true"
      data-variant={variant}
      className={`wave-divider pointer-events-none absolute left-0 right-0 bottom-0 z-[5] h-[56px] w-full sm:h-[64px] md:h-[80px] ${className}`}
      style={style}
    >
      <div className="wave-divider__drift">
        {cfg.ribbons.includes("green") && (
          <svg className="wave-divider__ribbon wave-divider__ribbon--green" viewBox="0 0 2880 120" preserveAspectRatio="none">
            <path d={RIBBON_PATHS.green} />
          </svg>
        )}
        {cfg.ribbons.includes("gold") && (
          <svg className="wave-divider__ribbon wave-divider__ribbon--gold" viewBox="0 0 2880 120" preserveAspectRatio="none">
            <path d={RIBBON_PATHS.gold} />
          </svg>
        )}
        {cfg.ribbons.includes("red") && (
          <svg className="wave-divider__ribbon wave-divider__ribbon--red" viewBox="0 0 2880 120" preserveAspectRatio="none">
            <path d={RIBBON_PATHS.red} />
          </svg>
        )}
        {cfg.sheen > 0 && <div className="wave-divider__sheen" />}
      </div>
    </div>
  );
}

export const WaveDivider = memo(WaveDividerImpl);
export default WaveDivider;
