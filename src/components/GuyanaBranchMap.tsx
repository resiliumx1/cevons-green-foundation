import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { BranchPoint } from "./GuyanaBranchMapInner";

const MapInner = lazy(() => import("./GuyanaBranchMapInner"));

interface Props {
  branches: BranchPoint[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export type { BranchPoint };

export function GuyanaBranchMap({ branches, selectedId, onSelect, className }: Props) {
  const [mounted, setMounted] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Leaflet (CSS + library) is only fetched once the map scrolls into view.
  useEffect(() => {
    if (mounted) return;
    const el = hostRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div ref={hostRef} className={className} style={{ position: "relative" }}>
      {mounted ? (
        <Suspense
          fallback={
            <div className="size-full flex items-center justify-center bg-[var(--cevons-cream,#FBF7EE)] text-xs text-[var(--cevons-deep-green,#EF7700)]/60">
              Loading map…
            </div>
          }
        >
          <MapInner branches={branches} selectedId={selectedId} onSelect={onSelect} />
        </Suspense>
      ) : (
        <div className="size-full bg-[var(--cevons-cream,#FBF7EE)]" />
      )}
    </div>
  );
}
