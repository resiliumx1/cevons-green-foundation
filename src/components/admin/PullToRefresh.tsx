import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

/**
 * Touch-only pull-to-refresh wrapper for admin screens.
 * Activates only when the page is already scrolled to the top and the
 * pointer is a coarse (touch) device, so desktop behaviour is untouched.
 */

const THRESHOLD = 72;
const MAX_PULL = 120;

export function PullToRefresh({
  onRefresh,
  children,
  className,
}: {
  onRefresh: () => Promise<unknown> | unknown;
  children: React.ReactNode;
  className?: string;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const active = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const scrollTop = useCallback(() => {
    let el: HTMLElement | null = hostRef.current;
    while (el) {
      const style = window.getComputedStyle(el);
      if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) {
        return el.scrollTop;
      }
      el = el.parentElement;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia?.("(pointer: coarse)").matches) return;
    const node = hostRef.current;
    if (!node) return;

    const onStart = (e: TouchEvent) => {
      if (refreshing || e.touches.length !== 1) return;
      if (scrollTop() > 2) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active.current || startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPull(0);
        return;
      }
      if (scrollTop() > 2) {
        active.current = false;
        setPull(0);
        return;
      }
      // resistance curve
      const eased = Math.min(MAX_PULL, dy * 0.5);
      if (eased > 4 && e.cancelable) e.preventDefault();
      setPull(eased);
    };

    const onEnd = async () => {
      if (!active.current) return;
      active.current = false;
      startY.current = null;
      const shouldRefresh = pull >= THRESHOLD;
      if (!shouldRefresh) {
        setPull(0);
        return;
      }
      setRefreshing(true);
      setPull(THRESHOLD);
      try {
        if (navigator.vibrate) navigator.vibrate(8);
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    };

    node.addEventListener("touchstart", onStart, { passive: true });
    node.addEventListener("touchmove", onMove, { passive: false });
    node.addEventListener("touchend", onEnd, { passive: true });
    node.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchmove", onMove);
      node.removeEventListener("touchend", onEnd);
      node.removeEventListener("touchcancel", onEnd);
    };
  }, [onRefresh, pull, refreshing, scrollTop]);

  const visible = pull > 0 || refreshing;
  const progress = Math.min(1, pull / THRESHOLD);

  return (
    <div ref={hostRef} className={className} style={{ touchAction: pull > 0 ? "none" : undefined }}>
      <div
        aria-hidden={!visible}
        className="pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          height: visible ? Math.max(pull, refreshing ? THRESHOLD : 0) : 0,
          transition: active.current ? "none" : "height 200ms ease",
        }}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
          style={{
            borderColor: "rgba(255,210,0,0.35)",
            background: "rgba(255,210,0,0.10)",
            color: "#FFD200",
            opacity: refreshing ? 1 : 0.4 + progress * 0.6,
          }}
        >
          <RefreshCw
            className="h-3.5 w-3.5"
            style={{
              animation: refreshing ? "spin 0.9s linear infinite" : undefined,
              transform: refreshing ? undefined : `rotate(${progress * 270}deg)`,
            }}
          />
          {refreshing ? "Refreshing…" : progress >= 1 ? "Release to refresh" : "Pull to refresh"}
        </span>
      </div>
      <div
        style={{
          transform: visible ? undefined : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;
