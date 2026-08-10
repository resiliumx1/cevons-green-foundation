import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Permanent redirect for every legacy /crm/* path to its /admin/* equivalent,
 * so existing bookmarks keep working.
 */
export const Route = createFileRoute("/crm/$")({
  beforeLoad: ({ params }) => {
    const rest = params._splat ?? "";
    throw redirect({ href: `/admin${rest ? `/${rest}` : ""}`, replace: true });
  },
});
