import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ContentProvider } from "@/components/Editable";
import { getPageContent } from "@/lib/content.functions";
import { servicePageIdForPath } from "@/lib/servicePages";

/**
 * Layout for /services and the 22 service detail pages.
 *
 * The detail pages are all rendered by the same template, so instead of
 * wrapping 22 route files this layout loads the editable copy for whichever
 * service is being viewed (page id `service.<slug>`) and provides it to the
 * tree. `/services` itself loads nothing here — its index route brings its own
 * content provider.
 */
export const Route = createFileRoute("/services")({
  validateSearch: (search: Record<string, unknown>): { preview?: string } =>
    typeof search.preview === "string" ? { preview: search.preview } : {},
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  shouldReload: true,
  loader: async ({ deps, location }) => {
    const page = servicePageIdForPath(location.pathname);
    if (!page) return null;
    return await getPageContent({ data: { page, token: deps.preview ?? null } });
  },
  component: ServicesLayout,
});

function ServicesLayout() {
  const content = Route.useLoaderData();
  return (
    <ContentProvider value={content}>
      <Outlet />
    </ContentProvider>
  );
}
