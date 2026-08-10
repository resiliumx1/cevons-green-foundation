import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { formatGeorgetown } from "@/components/admin/theme";

/* ── Docket strip ────────────────────────────────────────────────────────
   One continuous weighbridge-style ticket. Cells are separated by dashed
   tear lines, not by gaps between cards.                                  */

export type DocketCell = {
  code: string;
  label: string;
  /** Real value, already computed from a query. */
  value?: string | number;
  /** Delta line, e.g. "+3 vs previous 30 days". Only ever real. */
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  /** When set, the tile renders this honest explanation instead of a number. */
  unavailable?: string;
};

export function DocketStrip({ cells, loading }: { cells: DocketCell[]; loading?: boolean }) {
  return (
    <div className="docket" role="group" aria-label="Key figures">
      {cells.map((c, i) => (
        <div key={c.code} className={`docket-cell ${i > 0 ? "docket-cell-divided" : ""}`}>
          <div className="docket-head">
            <span className="admin-mono docket-label">{c.label}</span>
            <span className="admin-mono docket-code">{c.code}</span>
          </div>
          {c.unavailable ? (
            <p className="docket-unavailable">{c.unavailable}</p>
          ) : (
            <>
              <div className="admin-display docket-figure">
                {loading ? <span className="docket-skeleton" aria-hidden /> : (c.value ?? "—")}
              </div>
              {c.delta && (
                <p className={`docket-delta docket-delta-${c.deltaDirection ?? "flat"}`}>{c.delta}</p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Panels and their three honest states ──────────────────────────────── */

export function Panel({
  title,
  code,
  action,
  children,
}: {
  title: string;
  code: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <header className="admin-panel-head">
        <div>
          <span className="admin-mono admin-panel-code">{code}</span>
          <h2 className="admin-display admin-panel-title">{title}</h2>
        </div>
        {action}
      </header>
      <div className="admin-panel-body">{children}</div>
    </section>
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="admin-skel" style={{ width: `${100 - i * 8}%` }} />
      ))}
    </div>
  );
}

export function PanelError({ what, error }: { what: string; error: unknown }) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return (
    <div role="alert" className="admin-state admin-state-error">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">Couldn't load {what}.</p>
        <p className="admin-state-detail">{message}</p>
      </div>
    </div>
  );
}

export function PanelEmpty({ headline, action }: { headline: string; action?: ReactNode }) {
  return (
    <div className="admin-state admin-state-empty">
      <div>
        <p className="font-semibold">{headline}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function PanelBusy() {
  return (
    <span className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-2)" }}>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Working…
    </span>
  );
}

/* ── Time helpers — everything is stored UTC, displayed Georgetown ─────── */

export function georgetownStamp(value: string | Date): string {
  return `${formatGeorgetown(value)} GYT`;
}

/** "3 hours ago" — coarse and honest; no fake precision. */
export function timeAgo(value: string | Date): string {
  const then = value instanceof Date ? value : new Date(value);
  const secs = Math.max(0, (Date.now() - then.getTime()) / 1000);
  if (secs < 90) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}
