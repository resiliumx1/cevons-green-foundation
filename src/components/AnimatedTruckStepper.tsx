import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUCK_SRC = "/assets/cevons-orange-truck.png";

const COLORS = {
  orange: "#F97316",
  orangeSoft: "rgba(249, 115, 22, 0.18)",
  green: "#2E9B3F",
  greenSoft: "rgba(46, 155, 63, 0.16)",
  gray: "#D1D5DB",
  graySoft: "#E5E7EB",
  charcoal: "#1F2937",
  muted: "#6B7280",
};

export type AnimatedTruckStepperProps = {
  /** Zero-indexed active step */
  currentStep: number;
  /** Step labels — order matters */
  steps: string[];
  /** Optional explicit completed set. Defaults to all indices < currentStep */
  completedSteps?: number[];
  /** Called when a previously-completed step is clicked */
  onStepClick?: (index: number) => void;
  className?: string;
};

export function AnimatedTruckStepper({
  currentStep,
  steps,
  completedSteps,
  onStepClick,
  className,
}: AnimatedTruckStepperProps) {
  const total = steps.length;
  const clampedStep = Math.max(0, Math.min(currentStep, total - 1));
  const prefersReduced = useReducedMotion();

  const completed = useMemo(() => {
    if (completedSteps && completedSteps.length) return new Set(completedSteps);
    const s = new Set<number>();
    for (let i = 0; i < clampedStep; i++) s.add(i);
    return s;
  }, [completedSteps, clampedStep]);

  // Measure the road so the truck translates in real pixels
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const ro = new ResizeObserver(() => setTrackWidth(el.clientWidth));
    ro.observe(el);
    setTrackWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const progress = total > 1 ? clampedStep / (total - 1) : 0;
  // Position of the step center along the track
  const stepX = (i: number) =>
    total > 1 ? (i / (total - 1)) * trackWidth : trackWidth / 2;

  const truckCenter = stepX(clampedStep);
  // Filled road width — to current step center
  const filledWidth = truckCenter;

  const isFinal = clampedStep === total - 1;

  // Detect motion: animate wheels/dust briefly when step changes
  const [moving, setMoving] = useState(false);
  const lastStepRef = useRef(clampedStep);
  useEffect(() => {
    if (lastStepRef.current !== clampedStep) {
      lastStepRef.current = clampedStep;
      if (prefersReduced) return;
      setMoving(true);
      const t = setTimeout(() => setMoving(false), 1100);
      return () => clearTimeout(t);
    }
  }, [clampedStep, prefersReduced]);

  const truckSpring = prefersReduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 90, damping: 18, mass: 0.9 };

  return (
    <div
      className={cn("w-full", className)}
      role="group"
      aria-label="Booking progress"
    >
      <div className="sr-only" aria-live="polite">
        Step {clampedStep + 1} of {total}: {steps[clampedStep]}
      </div>

      {/* Mobile compact header */}
      <div className="md:hidden mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold" style={{ color: COLORS.charcoal }}>
          Step {clampedStep + 1} of {total}
        </span>
        <span className="font-semibold" style={{ color: COLORS.orange }}>
          {steps[clampedStep]}
        </span>
      </div>

      {/* Scrollable wrapper for very small screens */}
      <div className="relative -mx-1 overflow-x-auto overflow-y-visible pb-1">
        <div className="min-w-[520px] md:min-w-0 px-3 md:px-2">
          {/* TRUCK LANE */}
          <div className="relative" style={{ height: 64 }}>
            {/* Truck — translated by step progress */}
            <motion.div
              className="absolute top-0 will-change-transform"
              style={{ left: 0, height: 64 }}
              initial={false}
              animate={{
                x: Math.max(0, truckCenter - 56), // center the 112px truck on the step
              }}
              transition={truckSpring}
              aria-hidden="true"
            >
              <div className="relative" style={{ width: 112, height: 64 }}>
                {/* soft shadow */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    bottom: -4,
                    width: 92,
                    height: 10,
                    background:
                      "radial-gradient(ellipse at center, rgba(15,23,42,0.28) 0%, rgba(15,23,42,0) 70%)",
                    filter: "blur(1px)",
                  }}
                />
                <img
                  src={TRUCK_SRC}
                  alt=""
                  width={112}
                  height={64}
                  className="block h-16 w-28 object-contain select-none"
                  draggable={false}
                />

                {/* Wheel spin overlay — two tiny orange dots that rotate while moving */}
                {!prefersReduced && (
                  <>
                    <WheelSpin moving={moving} style={{ left: 30, bottom: 4 }} />
                    <WheelSpin moving={moving} style={{ left: 50, bottom: 4 }} />
                    <WheelSpin moving={moving} style={{ right: 14, bottom: 4 }} />
                  </>
                )}

                {/* Dust/leaf trail */}
                {!prefersReduced && moving && (
                  <DustTrail />
                )}

                {/* Final step "All Set!" badge with confetti */}
                {isFinal && (
                  <FinalBadge prefersReduced={!!prefersReduced} />
                )}
              </div>
            </motion.div>
          </div>

          {/* ROAD + STEP CIRCLES */}
          <div className="relative pt-1">
            {/* Track */}
            <div
              ref={trackRef}
              className="relative mx-auto"
              style={{ height: 20 }}
            >
              {/* Future (dotted gray) line */}
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  height: 4,
                  backgroundImage: `repeating-linear-gradient(to right, ${COLORS.gray} 0 8px, transparent 8px 14px)`,
                }}
              />
              {/* Filled (solid orange) line up to the truck */}
              <motion.div
                aria-hidden="true"
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  height: 4,
                  background: `linear-gradient(90deg, ${COLORS.green} 0%, ${COLORS.orange} 100%)`,
                  boxShadow: `0 0 0 1px rgba(249,115,22,0.08)`,
                }}
                initial={false}
                animate={{ width: filledWidth }}
                transition={truckSpring}
              />

              {/* Step circles, positioned absolutely along the track */}
              {steps.map((label, i) => {
                const isDone = completed.has(i);
                const isActive = i === clampedStep;
                const cx = stepX(i);
                const clickable = !!onStepClick && isDone && !isActive;
                return (
                  <div
                    key={label}
                    className="absolute top-1/2"
                    style={{
                      left: cx,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <StepCircle
                      index={i}
                      label={label}
                      isDone={isDone}
                      isActive={isActive}
                      clickable={clickable}
                      onClick={() => clickable && onStepClick?.(i)}
                      prefersReduced={!!prefersReduced}
                    />
                  </div>
                );
              })}
            </div>

            {/* Labels row — desktop */}
            <div className="relative mt-9 hidden md:block" style={{ height: 32 }}>
              {steps.map((label, i) => {
                const isActive = i === clampedStep;
                const isDone = completed.has(i);
                const cx = stepX(i);
                return (
                  <div
                    key={label}
                    className="absolute top-0 text-center"
                    style={{
                      left: cx,
                      transform: "translateX(-50%)",
                      width: 110,
                    }}
                  >
                    <span
                      className={cn(
                        "block text-xs leading-tight font-medium",
                      )}
                      style={{
                        color: isActive
                          ? COLORS.charcoal
                          : isDone
                          ? COLORS.green
                          : COLORS.muted,
                        fontWeight: isActive ? 700 : isDone ? 600 : 500,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Labels row — mobile (just current step label is shown above) */}
            <div className="md:hidden mt-6 flex justify-between px-1">
              {steps.map((label, i) => {
                const isActive = i === clampedStep;
                const isDone = completed.has(i);
                return (
                  <span
                    key={label}
                    className="text-[10px] leading-tight text-center"
                    style={{
                      color: isActive
                        ? COLORS.charcoal
                        : isDone
                        ? COLORS.green
                        : COLORS.muted,
                      fontWeight: isActive ? 700 : 500,
                      maxWidth: 64,
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Step circle ---------------- */

function StepCircle({
  index,
  label,
  isDone,
  isActive,
  clickable,
  onClick,
  prefersReduced,
}: {
  index: number;
  label: string;
  isDone: boolean;
  isActive: boolean;
  clickable: boolean;
  onClick: () => void;
  prefersReduced: boolean;
}) {
  const bg = isDone ? COLORS.green : isActive ? COLORS.orange : "#FFFFFF";
  const border = isDone ? COLORS.green : isActive ? COLORS.orange : COLORS.gray;
  const fg = isDone || isActive ? "#FFFFFF" : COLORS.muted;
  const ring = isActive ? `0 0 0 6px ${COLORS.orangeSoft}` : isDone ? `0 0 0 4px ${COLORS.greenSoft}` : "none";

  const Comp: any = clickable ? "button" : "div";
  return (
    <Comp
      type={clickable ? "button" : undefined}
      onClick={clickable ? onClick : undefined}
      aria-label={`${label}${isActive ? " (current step)" : isDone ? " (completed)" : ""}`}
      aria-current={isActive ? "step" : undefined}
      className={cn(
        "relative grid place-items-center rounded-full border-2 transition-shadow",
        clickable && "cursor-pointer hover:scale-105 transition-transform",
      )}
      style={{
        width: 36,
        height: 36,
        background: bg,
        borderColor: border,
        color: fg,
        boxShadow: ring,
      }}
    >
      {isActive && !prefersReduced && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: COLORS.orange,
            opacity: 0.35,
            animation: "truckstepper-ping 1.6s cubic-bezier(0,0,0.2,1) infinite",
          }}
        />
      )}
      <span className="relative z-10 grid place-items-center" style={{ width: 18, height: 18 }}>
        {isDone ? (
          <motion.span
            key="check"
            initial={prefersReduced ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 18 }}
            className="grid place-items-center"
          >
            <Check className="size-4" strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            key="num"
            initial={prefersReduced ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-bold"
          >
            {index + 1}
          </motion.span>
        )}
      </span>

      {/* keyframes — scoped inline once */}
      <style>{`@keyframes truckstepper-ping {
        0% { transform: scale(1); opacity: 0.35; }
        80%, 100% { transform: scale(1.9); opacity: 0; }
      }`}</style>
    </Comp>
  );
}

/* ---------------- Wheel spin micro-detail ---------------- */

function WheelSpin({
  moving,
  style,
}: {
  moving: boolean;
  style: React.CSSProperties;
}) {
  return (
    <motion.span
      aria-hidden="true"
      className="absolute rounded-full"
      style={{
        width: 4,
        height: 4,
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
        ...style,
      }}
      animate={moving ? { rotate: 360 } : { rotate: 0 }}
      transition={moving ? { repeat: Infinity, duration: 0.35, ease: "linear" } : { duration: 0 }}
    />
  );
}

/* ---------------- Dust trail ---------------- */

function DustTrail() {
  const puffs = [0, 1, 2, 3];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute" style={{ left: -8, bottom: 2 }}>
      {puffs.map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: 8 + i,
            height: 8 + i,
            background: "rgba(148, 163, 184, 0.55)",
            filter: "blur(2px)",
          }}
          initial={{ x: 0, y: 0, opacity: 0.75, scale: 0.6 }}
          animate={{ x: -28 - i * 6, y: -4 - i * 2, opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ---------------- Final badge with subtle confetti ---------------- */

function FinalBadge({ prefersReduced }: { prefersReduced: boolean }) {
  const confetti = [
    { c: "#F97316", x: -22, y: -28, d: 0 },
    { c: "#2E9B3F", x: 14, y: -32, d: 0.08 },
    { c: "#F59E0B", x: 30, y: -18, d: 0.16 },
    { c: "#2E9B3F", x: -14, y: -16, d: 0.22 },
    { c: "#F97316", x: 6, y: -38, d: 0.3 },
  ];
  return (
    <>
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
        style={{
          top: -22,
          background: "linear-gradient(135deg, #F97316 0%, #2E9B3F 100%)",
          color: "#fff",
          boxShadow: "0 6px 14px -6px rgba(15,23,42,0.35)",
        }}
        initial={prefersReduced ? false : { y: 6, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
      >
        All Set!
      </motion.div>
      {!prefersReduced &&
        confetti.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute left-1/2 top-0 block rounded-[2px]"
            style={{
              width: 5,
              height: 8,
              background: p.c,
            }}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [0, 1, 1, 0],
              rotate: 180,
            }}
            transition={{ duration: 1.1, delay: p.d, ease: "easeOut" }}
          />
        ))}
    </>
  );
}

export default AnimatedTruckStepper;
