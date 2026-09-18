import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into <body>.
 *
 * Admin pages are wrapped in a framer-motion container with
 * `will-change: transform`, which makes that element the containing block for
 * `position: fixed` children. Without this portal a full-screen dialog is
 * centred inside the (very tall) page instead of the viewport, so it appears
 * far below the fold while its backdrop covers the screen.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
