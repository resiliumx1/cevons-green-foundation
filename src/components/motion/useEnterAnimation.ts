import { useEffect, useState } from "react";

/**
 * When a page hydrates while the tab/iframe is hidden, requestAnimationFrame is
 * paused, so entrance animations never start and elements stay stuck at their
 * `hidden` variant — the page looks blank. In that case we skip the entrance
 * animation entirely and render the final state.
 */
export function useSkipEnterAnimation(): boolean {
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.visibilityState === "hidden") setSkip(true);
  }, []);

  return skip;
}
