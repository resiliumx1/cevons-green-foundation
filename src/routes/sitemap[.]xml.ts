import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { SITE_URL as BASE_URL } from "@/lib/seo/site";

const paths = [
  "/",
  "/about",
  "/services",
  "/industries",
  "/locations",
  "/contact",
  "/resources",
  
  "/request-service",
  "/track-request",
  "/services/biohazardous-disposal",
  "/services/compactor-rental",
  "/services/contaminated-soil",
  "/services/document-shredding",
  "/services/dumpster-rental",
  "/services/general-trash-collection",
  "/services/general-waste-management",
  "/services/grease-trap-septic-tank",
  "/services/hazardous-waste",
  "/services/landfill-operations",
  "/services/material-recovery-facility",
  "/services/plastic-recycling",
  "/services/portable-toilet",
  "/services/product-destruction",
  "/services/road-sweeping",
  "/services/scrap-metal-recycling",
  "/services/septic-services",
  "/services/skip-bin-dumpster-rental",
  "/services/tank-cleaning",
  "/services/used-cooking-oil",
  "/services/used-waste-oil",
  "/services/wastewater",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = paths
          .map(
            (p) =>
              `  <url>\n    <loc>${BASE_URL}${p}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p === "/" ? "1.0" : "0.7"}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
