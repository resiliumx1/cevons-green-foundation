/**
 * Public (published-only) content-string reads, cached per worker instance.
 *
 * Preview/draft reads NEVER come through here — they go straight to the admin
 * client in `content.functions.ts`, so staff always see drafts immediately.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const TTL_MS = 30_000;

type Entry = { at: number; strings: Record<string, string> };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<Record<string, string>>>();

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}

async function fetchPage(page: string): Promise<Record<string, string>> {
  const { data: rows, error } = await getClient()
    .from("public_content_strings")
    .select("key, published_value")
    .like("key", `${page}.%`);
  if (error) throw error;
  const strings: Record<string, string> = {};
  for (const r of (rows ?? []) as Array<{ key: string; published_value: string | null }>) {
    if (typeof r.published_value === "string" && r.published_value.length > 0) {
      strings[r.key] = r.published_value;
    }
  }
  return strings;
}

/**
 * How long SSR is willing to wait for the copy table before rendering the
 * hardcoded defaults instead. A slow or unreachable database must never show
 * up as time-to-first-byte.
 */
const READ_TIMEOUT_MS = 700;

/** Cached published strings for a page. Returns `null` on any read failure. */
export async function getPublishedStrings(page: string): Promise<Record<string, string> | null> {
  const hit = cache.get(page);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.strings;

  // Collapse concurrent misses into one query.
  let pending = inflight.get(page);
  if (!pending) {
    pending = fetchPage(page)
      .then((strings) => {
        // Keep warming the cache even if this request already gave up waiting.
        cache.set(page, { at: Date.now(), strings });
        return strings;
      })
      .finally(() => inflight.delete(page));
    inflight.set(page, pending);
  }
  // Never reject: a failed shared promise must not become an unhandled
  // rejection for the requests that stopped awaiting it.
  pending.catch(() => {});

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), READ_TIMEOUT_MS));
  try {
    const strings = await Promise.race([pending, timeout]);
    if (strings === null) return hit ? hit.strings : null;
    return strings;
  } catch {
    return hit ? hit.strings : null;
  }
}

/** Called after a publish so the next render sees fresh copy. */
export function invalidatePublishedStrings(page?: string) {
  if (page) cache.delete(page);
  else cache.clear();
}
