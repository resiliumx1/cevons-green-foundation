import { createFileRoute, redirect } from "@tanstack/react-router";

/** Permanent redirect: the CRM was renamed to CEVONS Website Admin at /admin. */
export const Route = createFileRoute("/crm/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
});
