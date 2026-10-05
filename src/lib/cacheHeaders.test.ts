import { describe, expect, it } from "vitest";
import { cacheControlFor, withCacheHeaders } from "./cacheHeaders";

const html = (status = 200) =>
  new Response("<html></html>", {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });

const get = (path: string) => new Request(`https://cevons.com${path}`);

describe("cacheControlFor", () => {
  it("caches only content-versioned files forever", () => {
    for (const p of [
      "/_build/assets/main-DtK3p9Qa.js",
      "/assets/index-BxYz12Ab.css",
      "/assets/logo-Ck3dP9qA.webp",
      "/__l5e/assets-v1/abc/x.webp",
    ]) {
      expect(cacheControlFor(get(p), new Response("x"))).toBe(
        "public, max-age=31536000, immutable",
      );
    }
  });

  it("gives unversioned public files a week plus revalidation", () => {
    const STATIC = "public, max-age=604800, stale-while-revalidate=2592000";
    for (const p of [
      "/fonts/open-sans-var.woff2",
      "/hero/hero-skip-640.webp",
      "/assets/brand/cevons-logo-correct.webp",
      "/assets/brand/admin-icon-192.png",
      "/partners/saipem.png",
      "/favicon.svg",
      "/vendor/leaflet.css",
    ]) {
      expect(cacheControlFor(get(p), new Response("x"))).toBe(STATIC);
    }
  });

  it("caches public pages at the edge only", () => {
    for (const p of [
      "/",
      "/about",
      "/contact",
      "/careers",
      "/news-media",
      "/request-service",
      "/services/skip-bin-dumpster-rental",
    ]) {
      expect(cacheControlFor(get(p), html())).toBe(
        "public, s-maxage=300, stale-while-revalidate=86400",
      );
    }
  });

  it("caches the 404 page", () => {
    expect(cacheControlFor(get("/nope"), html(404))).toBe(
      "public, s-maxage=300, stale-while-revalidate=86400",
    );
  });

  it("never caches admin or preview-token responses", () => {
    expect(cacheControlFor(get("/admin"), html())).toBe("private, no-store");
    expect(cacheControlFor(get("/admin/requests"), html())).toBe("private, no-store");
    expect(cacheControlFor(get("/?preview=abc"), html())).toBe("private, no-store");
    expect(cacheControlFor(get("/admin/app.js"), new Response("x"))).toBe("private, no-store");
  });

  it("never caches authenticated or cookie-setting responses", () => {
    const res = html();
    res.headers.set("set-cookie", "sb=1");
    expect(cacheControlFor(get("/"), res)).toBe("private, no-store");
    const authed = new Request("https://cevons.com/", { headers: { authorization: "Bearer x" } });
    expect(cacheControlFor(authed, html())).toBe("private, no-store");
  });

  it("leaves non-HTML and unlisted responses alone", () => {
    expect(cacheControlFor(get("/api/public/ces/drain"), new Response("{}"))).toBeNull();
    expect(cacheControlFor(get("/some-other-page"), html())).toBeNull();
    expect(
      cacheControlFor(new Request("https://cevons.com/", { method: "POST" }), html()),
    ).toBeNull();
  });
});

describe("withCacheHeaders", () => {
  it("does not override a handler's own policy", () => {
    const res = new Response("<x/>", {
      headers: { "content-type": "text/html", "cache-control": "public, max-age=3600" },
    });
    expect(withCacheHeaders(get("/"), res).headers.get("cache-control")).toBe(
      "public, max-age=3600",
    );
  });

  it("forces no-store even when the handler set a policy", () => {
    const res = new Response("<x/>", {
      headers: { "content-type": "text/html", "cache-control": "public, max-age=60" },
    });
    expect(withCacheHeaders(get("/admin"), res).headers.get("cache-control")).toBe(
      "private, no-store",
    );
  });

  it("preserves the body and status", async () => {
    const out = withCacheHeaders(get("/"), html());
    expect(out.status).toBe(200);
    expect(await out.text()).toBe("<html></html>");
  });
});
