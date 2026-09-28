import { CevonsLoader, PageLoader } from "@/components/cevons-loader";

/** Shown in the admin content area while a section is opening. */
export function AdminSectionSkeleton() {
  return <PageLoader label="Loading section" />;
}

/** Shown while the admin shell itself is opening (sign-in check + first load). */
export function AdminBootScreen() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4"
      style={{ background: "var(--crm-bg, #f4f6fb)" }}
    >
      <CevonsLoader size={160} decorative />
      <p className="text-sm font-medium" style={{ color: "var(--crm-text-muted, #5b6780)" }}>
        Loading admin
      </p>
    </div>
  );
}
