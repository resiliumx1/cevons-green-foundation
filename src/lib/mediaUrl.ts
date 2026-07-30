import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for turning a `media_posts.image_path` into a
 * renderable URL.
 *
 * The `media` bucket is currently PRIVATE (the workspace policy blocks public
 * buckets), so we mint long-lived signed URLs and cache them in memory.
 *
 * TODO: when the `media` bucket becomes public, replace the body of
 * `resolve()` with the one-liner below and delete the cache logic:
 *   return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
 */
export const MEDIA_BUCKET = "media";

/** 7 days, in seconds. */
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;
/** Re-sign a little before expiry so cached URLs never go stale mid-session. */
const CACHE_TTL_MS = (SIGNED_URL_TTL - 60 * 60) * 1000;

type CacheEntry = { url: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string | null>>();

async function resolve(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Resolve a storage path to a displayable URL.
 * Returns `null` when the path is empty or cannot be resolved.
 */
export async function getMediaUrl(
  image_path: string | null | undefined,
): Promise<string | null> {
  if (!image_path) return null;

  const hit = cache.get(image_path);
  if (hit && hit.expiresAt > Date.now()) return hit.url;

  const pending = inflight.get(image_path);
  if (pending) return pending;

  const p = resolve(image_path)
    .then((url) => {
      if (url) cache.set(image_path, { url, expiresAt: Date.now() + CACHE_TTL_MS });
      return url;
    })
    .finally(() => {
      inflight.delete(image_path);
    });

  inflight.set(image_path, p);
  return p;
}

/** Drop a cached URL (call after deleting/replacing an object). */
export function invalidateMediaUrl(image_path: string | null | undefined) {
  if (image_path) cache.delete(image_path);
}
