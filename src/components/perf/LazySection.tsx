import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts its children only once the placeholder scrolls near the viewport.
 * Paired with React.lazy children this keeps below-the-fold JavaScript out of
 * the first paint without changing layout: the wrapper is a plain block-level
 * div and renders nothing until the trigger fires.
 */
export function LazySection({
  children,
  rootMargin = "400px",
  className,
}: {
  children: ReactNode;
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

export default LazySection;
