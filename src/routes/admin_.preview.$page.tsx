import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { HomeSections } from "@/components/page/HomeSections";
import { supabase } from "@/integrations/supabase/client";
import type { PageSection } from "@/lib/pageSections";

/**
 * Draft preview. Renders the page from `draft_payload`, including sections that
 * are still hidden, so an editor can see exactly what "Publish" would produce.
 * Staff-only by RLS: anon cannot read unpublished rows.
 */
export const Route = createFileRoute("/admin_/preview/$page")({
  head: () => ({
    meta: [{ title: "Draft preview | CEVONS Website Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: DraftPreview,
});

function DraftPreview() {
  const { page } = Route.useParams();

  const q = useQuery({
    queryKey: ["admin", "page_sections_draft", page],
    queryFn: async (): Promise<PageSection[]> => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("id, page, kind, position, payload, draft_payload, published, updated_at, updated_by")
        .eq("page", page)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PageSection[];
    },
  });

  const sections = q.data ?? [];

  return (
    <SiteLayout>
      <div
        className="px-4 py-3 text-sm font-bold"
        style={{ backgroundColor: "#FCE722", color: "#1A1A1A" }}
        role="status"
      >
        Draft preview of the {page} page — this is not what visitors see. Hidden sections are included.
      </div>
      {q.isLoading ? (
        <div className="container-cevons section-y">Loading the draft…</div>
      ) : sections.length === 0 ? (
        <div className="container-cevons section-y">
          This page has no managed sections yet, so the live site renders its built-in layout.
        </div>
      ) : (
        <HomeSections sections={sections} source="draft_payload" />
      )}
    </SiteLayout>
  );
}
