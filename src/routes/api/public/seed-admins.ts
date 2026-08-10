import { createFileRoute } from "@tanstack/react-router";

const EMAILS = [
  "r.softleigh@cevons.com",
  "n.crosse@cevons.com",
  "nakayla@cevons.com",
];

export const Route = createFileRoute("/api/public/seed-admins")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-seed-token") !== "cevons-seed-2026") {
          return new Response("Forbidden", { status: 403 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const results: Record<string, string> = {};
        for (const email of EMAILS) {
          const created = await supabaseAdmin.auth.admin.createUser({
            email,
            password: "cevons123",
            email_confirm: true,
          });
          let userId = created.data?.user?.id;
          if (!userId) {
            const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
            userId = list.data?.users.find((u) => u.email?.toLowerCase() === email)?.id;
            if (userId) {
              await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: "cevons123",
                email_confirm: true,
              });
            }
          }
          if (!userId) {
            results[email] = `failed: ${created.error?.message ?? "unknown"}`;
            continue;
          }
          const { error } = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
          results[email] = error ? `role failed: ${error.message}` : "ok";
        }
        return Response.json(results);
      },
    },
  },
});
