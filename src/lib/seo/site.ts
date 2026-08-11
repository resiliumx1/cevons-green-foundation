/**
 * Single source of truth for the public site origin.
 * sitemap.xml, robots.txt, canonicals, og:url and JSON-LD all derive from here.
 */
export const SITE_URL = "https://cevons.com";

/** Absolute URL for a site-relative path ("/about" -> "https://cevons.com/about"). */
export function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`;
}

/** Default social share image, absolute. */
export const OG_IMAGE = absUrl("/assets/brand/cevons-og-2026.jpg");
export const OG_IMAGE_WIDTH = "1216";
export const OG_IMAGE_HEIGHT = "640";
