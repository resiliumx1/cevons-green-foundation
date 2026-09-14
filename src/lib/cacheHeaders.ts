/**
 * Edge cache policy for every response leaving the worker.
 *
 * Applied in `src/server.ts` around the SSR handler, so there is exactly one
 * place that decides caching. Nothing here changes what is rendered — only the
 * `Cache-Control` header attached to it.
 *
 * Rules:
 *  - Build output, bundled assets and fonts are content-hashed / content-keyed,
 *    so they are safe to cache forever (`immutable`).
 *  - Plain images under `public/` keep their filename across deploys, so they
 *    get a month rather than a year.
 *  - Public HTML is cached at the CDN only (`s-maxage`), never in the browser,
 *    with a day of stale-while-revalidate so a slow origin never blocks a
 *    visitor.
 *  - Anything staff-facing (admin, preview tokens, authenticated or
 *    cookie-setting responses) is explicitly `private, no-store`.
 */

const IMMUTABLE = "public, max-age=31536000, immutable";
const IMAGES = "public, max-age=2592000";
const PUBLIC_HTML = "public, s-maxage=300, stale-while-revalidate=86400";
const PRIVATE = "private, no-store";

/** Directories whose contents are content-hashed or content-keyed. */
const IMMUTABLE_PREFIXES = [
  "/_build/", // Vite build output (hashed filenames)
  "/assets/", // hashed bundle assets
  "/fonts/", // self-hosted font files
  "/hero/", // hero slideshow frames (versioned by filename on change)
  "/__l5e/", // externalised asset store (URL contains a content id)
];

/** Files that keep their name across deploys but rarely change. */
const VENDOR_PREFIX = "/vendor/"; // third-party CSS/JS copied at a pinned version

const IMAGE_EXT = /\.(webp|avif|png|svg|jpe?g|gif|ico)$/i;

/** A hashed filename such as `main-DtK3p9Qa.js`. */
const HASHED_FILE = /-[A-Za-z0-9_-]{8,}\.(js|mjs|css|woff2?|ttf|otf)$/i;

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
  if (pathname.startsWith(VENDOR_PREFIX)) return IMAGES;
  if (IMMUTABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || HASHED_FILE.test(pathname)) {
    return IMMUTABLE;
  }
  if (IMAGE_EXT.test(pathname)) return IMAGES;

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
