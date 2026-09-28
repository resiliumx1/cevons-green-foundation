import { createServerFn } from "@tanstack/react-start";
import type { SiteImageData, SiteImageRow } from "@/lib/siteImages";

const PUBLIC_COLUMNS = "slot, image_path, image_w, image_h, alt, updated_at";
const STAFF_COLUMNS = `${PUBLIC_COLUMNS}, updated_by, draft_image_path, draft_image_w, draft_image_h, draft_alt`;
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

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

      const { data: signed } = await supabaseAdmin.storage
        .from("media")
        .createSignedUrls(paths, SIGNED_URL_TTL);
      const urls = new Map(
        (signed ?? []).flatMap((item) =>
          item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : [],
        ),
      );

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