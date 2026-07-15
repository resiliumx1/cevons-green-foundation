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

export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  const reduce = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const firstCircleRef = useRef<HTMLDivElement>(null);
  const lastCircleRef = useRef<HTMLDivElement>(null);
  const [vLine, setVLine] = useState<{ top: number; height: number }>({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const compute = () => {
      const c = containerRef.current;
      const f = firstCircleRef.current;
      const l = lastCircleRef.current;
      if (!c || !f || !l) return;
      const cRect = c.getBoundingClientRect();
      const fRect = f.getBoundingClientRect();
      const lRect = l.getBoundingClientRect();
      const top = fRect.top - cRect.top + fRect.height / 2;
      const bottom = lRect.top - cRect.top + lRect.height / 2;
      setVLine({ top, height: Math.max(0, bottom - top) });
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [steps.length]);

  return (
    <div ref={containerRef} className="relative">
      {/* Horizontal connector — lg+ only */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-8 pointer-events-none"
        style={{
          zIndex: 0,
          left: `calc(100% / 12)`,
          right: `calc(100% / 12)`,
          height: 2,
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

      {/* Vertical connector — mobile (<sm) only */}
      <div
        aria-hidden="true"
        className="block sm:hidden absolute left-1/2 -translate-x-1/2 w-[2px] pointer-events-none"
        style={{ zIndex: 0, top: vLine.top, height: vLine.height }}
      >
        <div className="absolute inset-0 bg-[var(--border-hairline)]" />
        <motion.div
          className="absolute inset-0 bg-[var(--brand-orange)] origin-top"
          initial={reduce ? { scaleY: 1 } : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduce ? 0 : 1.2, ease: EASE }}
        />
      </div>

      <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-2 gap-y-10" style={{ zIndex: 1 }}>
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isFirst = i === 0;
          const isLast = i === steps.length - 1;
          return (
            <motion.li
              key={s.key}
              className="relative text-center"
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
              variants={reduce ? itemVariantsReduced : itemVariants}
            >
              <div
                ref={isFirst ? firstCircleRef : isLast ? lastCircleRef : undefined}
                className="mx-auto size-16 rounded-full flex items-center justify-center shadow-soft"
                style={{ background: "var(--brand-orange)", color: "var(--text-on-orange)" }}
              >
                <Icon className="size-7" />
              </div>
              <p className="mt-3 text-[11px] font-bold tracking-wider text-[var(--text-eyebrow)] uppercase">
                {s.step} {s.index}
              </p>
              <h3 className="text-base font-bold mt-0.5 text-cevons-dark">{s.title}</h3>
              <p className="text-xs text-cevons-muted mt-1.5 leading-relaxed px-2">{s.body}</p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
