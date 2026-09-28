import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, ArrowUp } from "lucide-react";

/**
 * Full "Jump to" chooser that sits in the page normally. Once it scrolls out
 * of view, a slim sticky pill takes its place: tap it to open the choices in a
 * small panel, or tap the arrow to go back up to the full chooser.
 */
export function CollapsingJumpNav({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: (close: () => void) => ReactNode;
}) {
  const fullRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = fullRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        const out = !e.isIntersecting && e.boundingClientRect.top < 0;
        setCollapsed(out);
        if (!out) setOpen(false);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [top, setTop] = useState(72);
  useEffect(() => {
    if (!collapsed) return;
    const h = document.querySelector("header");
    setTop(Math.max(8, (h?.getBoundingClientRect().bottom ?? 64) + 8));
  }, [collapsed]);

  const close = () => setOpen(false);
  const backUp = () => {
    setOpen(false);
    fullRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <nav
        ref={fullRef}
        aria-label={label}
        className={`flex flex-wrap gap-2 rounded-xl border p-3 ${className}`}
        style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider self-center mr-1"
          style={{ color: "var(--crm-text-muted)" }}
        >
          Jump to
        </span>
        {children(close)}
      </nav>

      {collapsed && typeof document !== "undefined" && createPortal(
        <div data-crm-theme className="fixed inset-x-0 z-40 flex justify-center px-3 pointer-events-none" style={{ top }}>
          <div className="pointer-events-auto w-full max-w-xl">
            <div
              className="flex items-center gap-1 rounded-full border p-1 shadow-lg mx-auto w-fit"
              style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
            >
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
                style={{ color: "var(--crm-text)" }}
              >
                Jump to
                {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              <button
                type="button"
                onClick={backUp}
                aria-label="Back up to all sections"
                className="grid size-10 place-items-center rounded-full"
                style={{ background: "var(--brand-orange, #EF7700)", color: "var(--brand-charcoal, #1f2937)" }}
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
            {open && (
              <div
                className="mt-2 flex max-h-[50vh] flex-wrap gap-2 overflow-y-auto rounded-2xl border p-3 shadow-xl"
                style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
              >
                {children(close)}
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
