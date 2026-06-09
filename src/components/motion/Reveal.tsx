import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

type MotionTag = "div" | "section" | "article" | "ul" | "ol" | "li" | "header" | "p" | "h1" | "h2" | "h3" | "span";

function getMotionComponent(tag: MotionTag) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (motion as any)[tag] as React.ComponentType<HTMLMotionProps<"div">>;
}

/**
 * Cohesive scroll-reveal system for the public site.
 *
 * - <Reveal variant="..."> wraps a block in a single motion element that
 *   reveals once when it enters the viewport.
 * - <Stagger> + <StaggerItem> wrap a grid/list so children cascade in.
 * - Respects prefers-reduced-motion: reduces to a short opacity fade with
 *   no translate/scale and effectively no stagger delay.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -80px 0px" } as const;

type RevealVariant = "up" | "fade" | "scale" | "left" | "right";

function getRevealVariants(variant: RevealVariant, reduce: boolean): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.2, ease: EASE } },
    };
  }

  switch (variant) {
    case "fade":
      return {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
      };
    case "scale":
      return {
        hidden: { opacity: 0, scale: 1.04 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE } },
      };
    case "left":
      return {
        hidden: { opacity: 0, x: -24 },
        show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
      };
    case "right":
      return {
        hidden: { opacity: 0, x: 24 },
        show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
      };
    case "up":
    default:
      return {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
      };
  }
}

type AnyMotionProps = HTMLMotionProps<"div">;

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: MotionTag;
} & Omit<AnyMotionProps, "children" | "className" | "variants" | "initial" | "whileInView" | "viewport">;

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as = "div",
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion() ?? false;
  const base = getRevealVariants(variant, reduce);
  const variants: Variants = {
    hidden: base.hidden,
    show: {
      ...(base.show as object),
      transition: {
        ...((base.show as { transition?: object }).transition ?? {}),
        delay: reduce ? 0 : delay,
      },
    },
  };

  const Comp = getMotionComponent(as);

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={variants}
      {...rest}
    >
      {children}
    </Comp>
  );
}

const STAGGER_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const STAGGER_CONTAINER_REDUCED: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0, delayChildren: 0 } },
};

const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const STAGGER_ITEM_REDUCED: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: EASE } },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
} & Omit<AnyMotionProps, "children" | "className" | "variants" | "initial" | "whileInView" | "viewport">;

export function Stagger({ children, className, as = "div", ...rest }: StaggerProps) {
  const reduce = useReducedMotion() ?? false;
  const Comp = getMotionComponent(as);
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={reduce ? STAGGER_CONTAINER_REDUCED : STAGGER_CONTAINER}
      {...rest}
    >
      {children}
    </Comp>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
} & Omit<AnyMotionProps, "children" | "className" | "variants">;

export function StaggerItem({ children, className, as = "div", ...rest }: StaggerItemProps) {
  const reduce = useReducedMotion() ?? false;
  const Comp = getMotionComponent(as);
  return (
    <Comp
      className={className}
      variants={reduce ? STAGGER_ITEM_REDUCED : STAGGER_ITEM}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Backward-compat alias for the previous helper used elsewhere.
export const RevealItem = StaggerItem;
