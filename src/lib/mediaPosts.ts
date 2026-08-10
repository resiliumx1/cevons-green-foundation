import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMediaUrl } from "@/lib/mediaUrl";

/**
 * Public (anon) reads of CRM-managed media.
 *
 * The anon SELECT policy on `media_posts` is exactly `published = true`, so
 * drafts can never reach these helpers. We still filter explicitly for clarity.
 */

export type MediaKind = "slide" | "gallery" | "announcement";

export type MediaPost = {
  id: string;
  kind: MediaKind;
  title: string;
  caption: string | null;
  image_path: string | null;
  image_w: number | null;
  image_h: number | null;
  sort_order: number;
};

/** A media post with its storage path already resolved to a URL. */
export type ResolvedMediaPost = MediaPost & { url: string | null };

async function fetchPublished(kind: MediaKind): Promise<ResolvedMediaPost[]> {
  const { data, error } = await supabase
    .from("media_posts")
    .select("id, kind, title, caption, image_path, image_w, image_h, sort_order")
    .eq("kind", kind)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as MediaPost[];
  return Promise.all(
    rows.map(async (row) => ({ ...row, url: await getMediaUrl(row.image_path) })),
  );
}

export function usePublishedMedia(kind: MediaKind) {
  return useQuery({
    queryKey: ["published_media", kind],
    queryFn: () => fetchPublished(kind),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/** True when the stored native dimensions describe a portrait image. */
export function isPortrait(w: number | null, h: number | null) {
  return !!w && !!h && h > w;
}

/** Aspect ratio string for a CSS `aspect-ratio` box, with a safe default. */
export function aspectRatio(w: number | null, h: number | null, fallback = "4 / 3") {
  return w && h ? `${w} / ${h}` : fallback;
}
