/**
 * Edge cache policy for every response leaving the worker.
 *
 * Applied in `src/server.ts` around the SSR handler, so there is exactly one
 * place that decides caching. Nothing here changes what is rendered — only the
 * `Cache-Control` header attached to it.
 *
 * Rules:
 *  - Only content-versioned URLs are cached forever (`immutable`): Vite build
 *    output with a hash in its filename, and the externalised asset store
 *    whose URL contains a content id.
 *  - Files under `public/` (images, fonts, hero frames, /assets/brand…) keep
 *    their filename across deploys, so they get a week in the browser plus a
 *    month of stale-while-revalidate. Changing one means giving it a new name.
 *  - Public HTML is cached at the CDN only (`s-maxage`), never in the browser,
 *    with a day of stale-while-revalidate so a slow origin never blocks a
 *    visitor.
 *  - Anything staff-facing (admin, preview tokens, authenticated or
 *    cookie-setting responses) is explicitly `private, no-store`.
 */

const IMMUTABLE = "public, max-age=31536000, immutable";
const STATIC = "public, max-age=604800, stale-while-revalidate=2592000";
const PUBLIC_HTML = "public, s-maxage=300, stale-while-revalidate=86400";
const PRIVATE = "private, no-store";

/** Directories whose URLs are content-versioned. */
const IMMUTABLE_PREFIXES = [
  "/_build/", // Vite build output (hashed filenames)
  "/__l5e/", // externalised asset store (URL contains a content id)
];

/** Directories of unversioned static files copied from public/. */
const STATIC_PREFIXES = ["/vendor/", "/fonts/", "/hero/", "/assets/"];

const STATIC_EXT = /\.(webp|avif|png|svg|jpe?g|gif|ico|woff2?|ttf|otf)$/i;

/**
 * A Vite-hashed filename such as `main-DtK3p9Qa.js`: exactly eight hash
 * characters, at least one uppercase. Plain names like `open-sans-var.woff2`
 * or `admin-icon-192.png` never match.
 */
export const HASHED_FILE = /-(?=[A-Za-z0-9_-]*[A-Z])[A-Za-z0-9_-]{8}\.(js|mjs|css|woff2?|ttf|otf|webp|avif|png|svg|jpe?g|gif|ico)$/;

/** Public pages that are safe to serve from a shared cache. */
const PUBLIC_HTML_PATHS = new Set([
  "/",
  "/about",
  "/contact",
  "/careers",
  "/news-media",
  "/request-service",
]);

function isPublicHtmlPath(pathname: string): boolean {
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (PUBLIC_HTML_PATHS.has(p || "/")) return true;
  return p.startsWith("/services/") || p === "/services";
}

function isPrivatePath(url: URL): boolean {
  return (
    url.pathname === "/admin" ||
    url.pathname.startsWith("/admin/") ||
    url.searchParams.has("preview")
  );
}

/**
 * The `Cache-Control` value for this request/response pair, or `null` to leave
 * whatever the handler already set (e.g. the sitemap's own one-hour policy).
 */
export function cacheControlFor(request: Request, response: Response): string | null {
  let url: URL;
  try {
    url = new URL(request.url);
  } catch {
    return null;
  }

  if (isPrivatePath(url)) return PRIVATE;

  const pathname = url.pathname;

  // Static files are safe to cache regardless of method-agnostic handlers.
  if (IMMUTABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || HASHED_FILE.test(pathname)) {
    return IMMUTABLE;
  }
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || STATIC_EXT.test(pathname)) {
    return STATIC;
  }

  // Anything else only gets a policy when it is a public HTML document.
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (response.headers.has("set-cookie")) return PRIVATE;
  if (request.headers.has("authorization")) return PRIVATE;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return null;

  if (response.status === 404) return PUBLIC_HTML;
  if (response.status !== 200) return null;
  if (!isPublicHtmlPath(pathname)) return null;

  return PUBLIC_HTML;
}

/**
 * Returns the response with a cache policy applied. The handler always wins:
 * a route that already set `Cache-Control` keeps it.
 */
export function withCacheHeaders(request: Request, response: Response): Response {
  const value = cacheControlFor(request, response);
  if (!value) return response;
  if (response.headers.has("cache-control") && value !== PRIVATE) return response;

  // Headers on a streamed SSR response are mutable in workerd, but guard
  // against an immutable Headers instance rather than dropping the body.
  try {
    response.headers.set("cache-control", value);
    return response;
  } catch {
    const headers = new Headers(response.headers);
    headers.set("cache-control", value);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}
