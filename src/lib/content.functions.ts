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

/** Editing metadata. Only ever sent to a verified staff preview session. */
export type ContentMeta = {
  label: string;
  section: string;
  maxLength: number | null;
  multiline: boolean;
  published: string | null;
  draft: string | null;
};

export type PageContent = {
  preview: boolean;
  strings: ContentMap;
  /** Present in preview mode only. */
  meta?: Record<string, ContentMeta>;
  /** Present in preview mode only — drives the Publish button. */
  canPublish?: boolean;
};

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
          .select("key, section, label, published_value, draft_value, max_length, multiline")
          .eq("page", data.page);
        if (error) return empty;

        const strings: ContentMap = {};
        const meta: Record<string, ContentMeta> = {};
        for (const r of rows ?? []) {
          const v = r.draft_value ?? r.published_value;
          if (typeof v === "string" && v.length > 0) strings[r.key] = v;
          meta[r.key] = {
            label: r.label,
            section: r.section,
            maxLength: r.max_length,
            multiline: !!r.multiline,
            published: r.published_value,
            draft: r.draft_value,
          };
        }

        const { data: mayPublish } = await supabaseAdmin.rpc("can_publish", { _user_id: previewUser });
        return { preview: true, strings, meta, canPublish: mayPublish === true };
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

/* ── Click-to-edit writes ────────────────────────────────────────────────── */

export type SavedString = {
  key: string;
  published: string | null;
  draft: string | null;
};

/**
 * Every write below goes through `context.supabase`, i.e. the caller's own
 * session with RLS applied: only `is_staff` may update a row at all, and the
 * `tg_content_strings_guard` trigger rejects a `published_value` change from
 * anyone without `can_publish`. The UI hides the Publish button for
 * contributors, but the database is what actually enforces it.
 */

const validateKeyValue = (data: { key: string; value: string }) => ({
  key: String(data?.key ?? ""),
  value: String(data?.value ?? ""),
});

export const saveContentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateKeyValue)
  .handler(async ({ data, context }): Promise<SavedString> => {
    if (!data.key) throw new Error("Missing content key");
    const { data: row, error } = await context.supabase
      .from("content_strings")
      .update({ draft_value: data.value })
      .eq("key", data.key)
      .select("key, published_value, draft_value")
      .single();
    if (error) throw new Error(error.message);
    return { key: row.key, published: row.published_value, draft: row.draft_value };
  });

/** Publishes the current draft (or an explicit value) and clears the draft. */
export const publishContentString = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateKeyValue)
  .handler(async ({ data, context }): Promise<SavedString> => {
    if (!data.key) throw new Error("Missing content key");
    const { data: row, error } = await context.supabase
      .from("content_strings")
      .update({ published_value: data.value, draft_value: null })
      .eq("key", data.key)
      .select("key, published_value, draft_value")
      .single();
    if (error) throw new Error(error.message);
    return { key: row.key, published: row.published_value, draft: row.draft_value };
  });

/** Throws the draft away and goes back to what the public site is showing. */
export const discardContentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { key: string }) => ({ key: String(data?.key ?? "") }))
  .handler(async ({ data, context }): Promise<SavedString> => {
    if (!data.key) throw new Error("Missing content key");
    const { data: row, error } = await context.supabase
      .from("content_strings")
      .update({ draft_value: null })
      .eq("key", data.key)
      .select("key, published_value, draft_value")
      .single();
    if (error) throw new Error(error.message);
    return { key: row.key, published: row.published_value, draft: row.draft_value };
  });
