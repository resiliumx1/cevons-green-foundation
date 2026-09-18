import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children outside the animated page container.
 *
 * Admin pages are wrapped in a framer-motion container with
 * `will-change: transform`, which makes that element the containing block for
 * `position: fixed` children. Without this portal a full-screen dialog is
 * centred inside the (very tall) page instead of the viewport, so it appears
 * far below the fold while its backdrop covers the screen.
 *
 * The target is the admin theme root (`[data-crm-theme]`) rather than <body>,
 * so the dialog keeps the admin colour variables. Falls back to <body>.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(
      (document.querySelector("[data-crm-theme]") as HTMLElement | null) ?? document.body,
    );
  }, []);

  if (!target) return null;
  return createPortal(children, target);
}
