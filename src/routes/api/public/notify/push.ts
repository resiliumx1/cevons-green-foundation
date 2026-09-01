/**
 * Push fan-out for admin notifications.
 *
 * Called server-to-server by an AFTER INSERT trigger on `public.notifications`
 * (via pg_net) with the project service-role key as bearer token. It sends one
 * Firebase Cloud Messaging message per registered admin device and prunes any
 * token FCM reports as dead.
 *
 * Never callable from a browser. Always answers 200 for authorised callers so
 * a push problem can never break the notification itself.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

type Payload = {
  id?: string;
  type?: string;
  title?: string;
  body?: string | null;
  link?: string | null;
};

export const Route = createFileRoute("/api/public/notify/push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        const supabaseUrl = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
        if (!serviceKey || !supabaseUrl) {
          console.error("notify/push: missing server configuration");
          return Response.json({ ok: false, reason: "server_misconfigured" }, { status: 500 });
        }

        const dispatchSecret = process.env["NOTIFY_DISPATCH_SECRET"];
        const auth = request.headers.get("Authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        const authorized = (!!dispatchSecret && token === dispatchSecret) || token === serviceKey;
        if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401 });

        let payload: Payload;
        try {
          payload = (await request.json()) as Payload;
        } catch {
          return Response.json({ ok: false, reason: "invalid_json" });
        }

        const title = String(payload.title ?? "").trim() || "CEVONS Admin";
        const body = String(payload.body ?? "").trim().slice(0, 300);
        const path = String(payload.link ?? "/admin").trim() || "/admin";

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const connectionKey = process.env["FIREBASE_MESSAGING_API_KEY"];
        if (!lovableKey || !connectionKey) {
          console.warn("notify/push: Firebase Cloud Messaging is not connected — skipping push");
          return Response.json({ ok: true, skipped: "push_not_configured" });
        }

        const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
        const { data: rows, error } = await supabase
          .from("admin_push_tokens")
          .select("token")
          .limit(500);
        if (error) {
          console.error("notify/push: token lookup failed", error.message);
          return Response.json({ ok: false, reason: "token_lookup_failed" });
        }
        const tokens = (rows ?? []).map((r) => r.token as string).filter(Boolean);
        if (tokens.length === 0) return Response.json({ ok: true, sent: 0 });

        const headers = {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connectionKey,
          "Content-Type": "application/json",
        };

        let sent = 0;
        const stale: string[] = [];

        await Promise.all(
          tokens.map(async (deviceToken) => {
            try {
              const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  message: {
                    token: deviceToken,
                    notification: { title, body: body || undefined },
                    data: { path, type: String(payload.type ?? "system") },
                    webpush: {
                      fcm_options: { link: `https://cevons.com${path}` },
                      notification: {
                        icon: "https://cevons.com/assets/brand/admin-icon-192.png",
                        badge: "https://cevons.com/assets/brand/admin-icon-192.png",
                        tag: String(payload.id ?? path),
                      },
                    },
                  },
                }),
              });
              if (res.ok) {
                sent += 1;
                return;
              }
              const text = await res.text();
              console.error(`notify/push: FCM send failed [${res.status}]: ${text}`);
              if (res.status === 404 || (res.status === 400 && text.includes("INVALID_ARGUMENT"))) {
                stale.push(deviceToken);
              }
            } catch (err) {
              console.error("notify/push: FCM request threw", err);
            }
          }),
        );

        if (stale.length) {
          await supabase.from("admin_push_tokens").delete().in("token", stale);
        }

        return Response.json({ ok: true, sent, pruned: stale.length });
      },
    },
  },
});
