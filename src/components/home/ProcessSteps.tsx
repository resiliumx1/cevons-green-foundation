import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type ProcessStep = {
  icon: LucideIcon;
  key: string;
  step: string; // "STEP" label
  index: number; // 1-based
  title: string;
  body: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.5, ease: EASE },
  }),
};

const itemVariantsReduced: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

/**
 * Professional multi-breakpoint step layout:
 *   • Mobile  (<md):  Left-rail vertical timeline. Rail sits at the circle
 *                     column center, text lives in its own right column —
 *                     the line never crosses the text.
 *   • Tablet  (md–lg): 2-up card grid with centered icon + text. No
 *                     connector lines (grid gaps make them look broken).
 *   • Desktop (lg+):  Horizontal spine behind the circle row only, with
 *                     an animated orange progress fill.
 */
export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  const reduce = useReducedMotion() ?? false;

  // --- Mobile rail geometry (measured so it starts/ends at circle centers) ---
  const mobileWrapRef = useRef<HTMLOListElement>(null);
  const firstMobileCircle = useRef<HTMLDivElement>(null);
  const lastMobileCircle = useRef<HTMLDivElement>(null);
  const [rail, setRail] = useState<{ top: number; height: number }>({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const compute = () => {
      const c = mobileWrapRef.current;
      const f = firstMobileCircle.current;
      const l = lastMobileCircle.current;
      if (!c || !f || !l) return;
      const cRect = c.getBoundingClientRect();
      const fRect = f.getBoundingClientRect();
      const lRect = l.getBoundingClientRect();
      const top = fRect.top - cRect.top + fRect.height / 2;
      const bottom = lRect.top - cRect.top + lRect.height / 2;
      setRail({ top, height: Math.max(0, bottom - top) });
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (mobileWrapRef.current) ro.observe(mobileWrapRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [steps.length]);

  const CIRCLE = "size-14 md:size-16";
  const CIRCLE_HALF_MOBILE = 28; // size-14 = 56 / 2

  return (
    <div className="relative">
      {/* ============================================================
          MOBILE (<md): Left-rail vertical timeline
          ============================================================ */}
      <ol
        ref={mobileWrapRef}
        className="md:hidden relative flex flex-col gap-8"
      >
        {/* Rail track + progress fill, positioned inside the circle column */}
        <div
          aria-hidden="true"
          className="absolute w-[2px] pointer-events-none"
          style={{
            top: rail.top,
            height: rail.height,
            left: CIRCLE_HALF_MOBILE - 1, // center of the 56px circle column
            zIndex: 0,
          }}
        >
          <div className="absolute inset-0 bg-[var(--border-hairline)]" />
          <motion.div
            className="absolute inset-0 bg-[var(--brand-orange)] origin-top"
            initial={reduce ? { scaleY: 1 } : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reduce ? 0 : 1.2, ease: EASE }}
          />
        </div>

        {steps.map((s, i) => {
          const Icon = s.icon;
          const isFirst = i === 0;
          const isLast = i === steps.length - 1;
          return (
            <motion.li
              key={s.key}
              className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-4 items-start"
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3, margin: "0px 0px -60px 0px" }}
              variants={reduce ? itemVariantsReduced : itemVariants}
            >
              <div
                ref={isFirst ? firstMobileCircle : isLast ? lastMobileCircle : undefined}
                className="relative size-14 rounded-full flex items-center justify-center shadow-soft"
                style={{
                  background: "var(--brand-orange)",
                  color: "var(--text-on-orange)",
                  zIndex: 1,
                }}
              >
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-[11px] font-bold tracking-wider text-[var(--text-eyebrow)] uppercase">
                  {s.step} {s.index}
                </p>
                <h3 className="text-base font-bold mt-0.5 text-cevons-dark">
                  {s.title}
                </h3>
                <p className="text-sm text-cevons-muted mt-1 leading-relaxed">
                  {s.body}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>

      {/* ============================================================
          TABLET (md to <lg): 2-up centered cards, NO connectors
          ============================================================ */}
      <ol className="hidden md:grid lg:hidden grid-cols-2 gap-x-6 gap-y-10">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li
              key={s.key}
              className="relative flex flex-col items-center text-center px-2"
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={reduce ? itemVariantsReduced : itemVariants}
            >
              <div
                className={`relative ${CIRCLE} rounded-full flex items-center justify-center shadow-soft`}
                style={{
                  background: "var(--brand-orange)",
                  color: "var(--text-on-orange)",
                }}
              >
                <Icon className="size-7" />
              </div>
              <p className="mt-3 text-[11px] font-bold tracking-wider text-[var(--text-eyebrow)] uppercase">
                {s.step} {s.index}
              </p>
              <h3 className="text-base font-bold mt-1 text-cevons-dark">{s.title}</h3>
              <p className="text-sm text-cevons-muted mt-1.5 leading-relaxed max-w-[28ch]">
                {s.body}
              </p>
            </motion.li>
          );
        })}
      </ol>

      {/* ============================================================
          DESKTOP (lg+): Horizontal spine + step columns
          ============================================================ */}
      <div className="hidden lg:block relative">
        {/* Horizontal connector aligned with circle centers (top-8 = 32px = half of size-16) */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: 32,
            left: `calc(100% / ${steps.length} / 2)`,
            right: `calc(100% / ${steps.length} / 2)`,
            height: 2,
            zIndex: 0,
          }}
        >
          <div className="absolute inset-0 bg-[var(--border-hairline)]" />
          <motion.div
            className="absolute inset-0 bg-[var(--brand-orange)] origin-left"
            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduce ? 0 : 1.2, ease: EASE }}
          />
        </div>

        <ol
          className="relative grid gap-x-4"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, zIndex: 1 }}
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.key}
                className="flex flex-col items-center text-center px-2"
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                variants={reduce ? itemVariantsReduced : itemVariants}
              >
                <div
                  className="relative size-16 rounded-full flex items-center justify-center shadow-soft"
                  style={{
                    background: "var(--brand-orange)",
                    color: "var(--text-on-orange)",
                  }}
                >
                  <Icon className="size-7" />
                </div>
                <p className="mt-3 text-[11px] font-bold tracking-wider text-[var(--text-eyebrow)] uppercase">
                  {s.step} {s.index}
                </p>
                <h3 className="text-base font-bold mt-1 text-cevons-dark">{s.title}</h3>
                <p className="text-xs text-cevons-muted mt-1.5 leading-relaxed max-w-[22ch]">
                  {s.body}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
