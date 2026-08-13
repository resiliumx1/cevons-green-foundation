import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useRevealWhenHidden } from "@/components/motion/useEnterAnimation";

/**
 * Safety net: in some embedded/hidden-iframe situations the IntersectionObserver
 * behind `whileInView` never reports, leaving SSR content stuck at opacity 0
 * (a blank-looking page). Shortly after mount we check whether the element is
 * already within the viewport and, if so, force the reveal.
 */
function useVisibilityFallback<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    // Hidden tab/iframe: rAF is paused, so no animation can run — show at once.
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      setForced(true);
      return;
    }
    const t = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh && r.bottom > 0) setForced(true);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return {
    ref,
    initial: forced ? ("show" as const) : ("hidden" as const),
    animate: forced ? ("show" as const) : undefined,
  };
}

type MotionTag = "div" | "section" | "article" | "ul" | "ol" | "li" | "header" | "p" | "h1" | "h2" | "h3" | "span";

function getMotionComponent(tag: MotionTag) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (motion as any)[tag] as ComponentType<HTMLMotionProps<"div">>;
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
  const fallback = useVisibilityFallback<HTMLDivElement>();

  return (
    <Comp
      ref={fallback.ref}
      className={className}
      initial={fallback.initial}
      whileInView="show"
      animate={fallback.animate}
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
  const fallback = useVisibilityFallback<HTMLDivElement>();
  return (
    <Comp
      ref={fallback.ref}
      className={className}
      initial={fallback.initial}
      whileInView="show"
      animate={fallback.animate}
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
