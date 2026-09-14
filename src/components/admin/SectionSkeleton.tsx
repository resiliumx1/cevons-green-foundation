/**
 * Placeholder shown in the admin content area while a section is opening.
 *
 * It exists so a click in the sidebar produces an immediate visible change
 * instead of leaving the previous section on screen. Sidebar, header and all
 * section designs are untouched — this only fills the main column.
 */
export function AdminSectionSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading section…</span>

      <div className="space-y-3">
        <Bar className="h-7 w-56" />
        <Bar className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="h-24" />
        ))}
      </div>

      <Card className="h-72" />
    </div>
  );
}

function Card({ className = "" }: { className?: string }) {
  return (
    <div
      className={`admin-skeleton-block rounded-2xl border ${className}`}
      style={{
        background: "var(--crm-surface)",
        borderColor: "var(--crm-border)",
      }}
    />
  );
}

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`admin-skeleton-block rounded-lg ${className}`}
      style={{ background: "var(--crm-surface-muted)" }}
    />
  );
}
