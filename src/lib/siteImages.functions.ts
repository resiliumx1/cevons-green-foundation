import { createServerFn } from "@tanstack/react-start";
import type { SiteImageData, SiteImageRow } from "@/lib/siteImages";

const PUBLIC_COLUMNS = "slot, image_path, image_w, image_h, alt, updated_at";
const STAFF_COLUMNS = `${PUBLIC_COLUMNS}, updated_by, draft_image_path, draft_image_w, draft_image_h, draft_alt`;
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

/**
 * Signed links for PUBLISHED photos are reused for up to an hour inside a warm
 * server instance (they stay valid for 7 days), so most page requests skip the
 * storage round trip. The database read still runs every request, so a newly
 * published photo appears immediately: a changed path is simply a cache miss.
 * Draft (preview) links are never cached.
 */
const PUBLIC_URL_CACHE_MS = 60 * 60 * 1000;
const publicSignedUrls = new Map<string, { url: string; expires: number }>();

/**
 * Loads every published replacement before SSR paints the page. Draft columns
 * are included only after the staff preview token has been verified.
 */
export const getSiteImageData = createServerFn({ method: "GET" })
  .inputValidator((data: { token?: string | null }) => ({
    token: data?.token ? String(data.token) : null,
  }))
  .handler(async ({ data }): Promise<SiteImageData> => {
    try {
      const { verifyPreviewToken } = await import("@/lib/contentPreview.server");
      const previewUser = await verifyPreviewToken(data.token);
      const preview = Boolean(previewUser);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: result, error } = await supabaseAdmin
        .from("site_images")
        .select(preview ? STAFF_COLUMNS : (PUBLIC_COLUMNS as never));

      if (error) return { preview: false, rows: [] };
      const rows = (result ?? []) as unknown as SiteImageRow[];
      const paths = Array.from(
        new Set(
          rows.flatMap((row) =>
            [row.image_path, preview ? row.draft_image_path : null].filter(
              (path): path is string => Boolean(path),
            ),
          ),
        ),
      );

      if (paths.length === 0) return { preview, rows };

      const now = Date.now();
      const urls = new Map<string, string>();
      const missing: string[] = [];
      for (const path of paths) {
        const hit = preview ? undefined : publicSignedUrls.get(path);
        if (hit && hit.expires > now) urls.set(path, hit.url);
        else missing.push(path);
      }

      if (missing.length > 0) {
        const { data: signed } = await supabaseAdmin.storage
          .from("media")
          .createSignedUrls(missing, SIGNED_URL_TTL);
        const publishedPaths = new Set(rows.map((row) => row.image_path).filter(Boolean));
        for (const item of signed ?? []) {
          if (!item.path || !item.signedUrl) continue;
          urls.set(item.path, item.signedUrl);
          if (publishedPaths.has(item.path)) {
            publicSignedUrls.set(item.path, { url: item.signedUrl, expires: now + PUBLIC_URL_CACHE_MS });
          }
        }
        if (publicSignedUrls.size > 500) {
          for (const [key, entry] of publicSignedUrls) if (entry.expires <= now) publicSignedUrls.delete(key);
        }
      }

      return {
        preview,
        rows: rows.map((row) => ({
          ...row,
          resolved_url: row.image_path ? urls.get(row.image_path) ?? null : null,
          draft_resolved_url:
            preview && row.draft_image_path ? urls.get(row.draft_image_path) ?? null : null,
        })),
      };
    } catch {
      return { preview: false, rows: [] };
    }
  });