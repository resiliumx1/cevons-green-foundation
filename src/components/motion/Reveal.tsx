import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const reducedItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "header";
  amount?: number;
  once?: boolean;
};

export function Reveal({ children, className, as = "div", amount = 0.2, once = true }: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={container}
    >
      {Array.isArray(children) ? (
        children.map((child, i) => (
          <motion.div key={i} variants={reduce ? reducedItem : item} style={{ willChange: "transform, opacity" }}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={reduce ? reducedItem : item} style={{ willChange: "transform, opacity" }}>
          {children}
        </motion.div>
      )}
    </Comp>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={reduce ? reducedItem : item}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
