import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();

  // Suppress the wrapper's own enter animation on first mount ONLY.
  // We deliberately do NOT set `initial={false}` on <AnimatePresence>,
  // because that propagates through PresenceContext and suppresses the
  // `initial` of every descendant motion component (defeating <Reveal />).
  // Setting `initial={false}` on this motion.div itself is scoped to this
  // element and does not leak to children.
  const isFirst = useRef(true);
  useEffect(() => {
    isFirst.current = false;
  }, []);

  const enterInitial = reduce ? { opacity: 0 } : { opacity: 0, y: 16 };

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
    >
      <motion.div
        key={pathname}
        initial={isFirst.current ? false : enterInitial}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: reduce ? 0.2 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
