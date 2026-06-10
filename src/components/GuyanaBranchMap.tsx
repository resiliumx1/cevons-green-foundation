import { lazy, Suspense, useEffect, useState } from "react";
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
  useEffect(() => setMounted(true), []);

  return (
    <div className={className} style={{ position: "relative" }}>
      {mounted ? (
        <Suspense
          fallback={
            <div className="size-full flex items-center justify-center bg-[var(--cevons-cream,#FBF7EE)] text-xs text-[var(--cevons-deep-green,#006B35)]/60">
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
