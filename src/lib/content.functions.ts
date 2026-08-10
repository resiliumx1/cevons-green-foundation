import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Content string reads for the public site.
 *
 * `getPageContent` is deliberately public and deliberately unbreakable: any
 * failure resolves to an EMPTY map, which makes every <Editable> fall back to
 * the hardcoded copy in the component tree. The live site must never depend on
 * this table having rows.
 */

export type ContentMap = Record<string, string>;
export type PageContent = { preview: boolean; strings: ContentMap };

export const getPageContent = createServerFn({ method: "GET" })
  .inputValidator((data: { page: string; token?: string | null }) => ({
    page: String(data?.page ?? ""),
    token: data?.token ? String(data.token) : null,
  }))
  .handler(async ({ data }): Promise<PageContent> => {
    const empty: PageContent = { preview: false, strings: {} };
    if (!data.page) return empty;

    try {
      const { verifyPreviewToken } = await import("@/lib/contentPreview.server");
      const previewUser = await verifyPreviewToken(data.token);

      if (previewUser) {
        // Staff preview: draft wins, published is the fallback.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rows, error } = await supabaseAdmin
          .from("content_strings")
          .select("key, published_value, draft_value")
          .eq("page", data.page);
        if (error) return empty;
        const strings: ContentMap = {};
        for (const r of rows ?? []) {
          const v = r.draft_value ?? r.published_value;
          if (typeof v === "string" && v.length > 0) strings[r.key] = v;
        }
        return { preview: true, strings };
      }

      // Public read. Goes through the published-only view; anon has no access
      // to the base table, so draft_value cannot leak here.
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(
        process.env["SUPABASE_URL"]!,
        process.env["SUPABASE_PUBLISHABLE_KEY"]!,
        { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
      );
      const { data: rows, error } = await client
        .from("public_content_strings")
        .select("key, published_value")
        .like("key", `${data.page}.%`);
      if (error) return empty;
      const strings: ContentMap = {};
      for (const r of (rows ?? []) as Array<{ key: string; published_value: string | null }>) {
        if (typeof r.published_value === "string" && r.published_value.length > 0) {
          strings[r.key] = r.published_value;
        }
      }
      return { preview: false, strings };
    } catch {
      return empty;
    }
  });

/** Staff-only. Mints a signed, one-hour preview token for the calling user. */
export const createPreviewToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ token: string }> => {
    const { data, error } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (error || data !== true) throw new Error("Staff access required");
    const { mintPreviewToken } = await import("@/lib/contentPreview.server");
    return { token: await mintPreviewToken(context.userId) };
  });
