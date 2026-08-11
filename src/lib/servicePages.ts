/**
 * The 22 service detail pages.
 *
 * They all render through `ServicePageTemplate`, so their editable copy is
 * keyed off the slug rather than hand-wrapped per route:
 *
 *   page  = `service.<slug>`      (one editable "page" per service)
 *   key   = `service.<slug>.<section>.<field>`
 *
 * The list also drives the "Service pages" group in the admin page picker.
 */

export type ServicePageEntry = { slug: string; label: string };

export const SERVICE_PAGES: ServicePageEntry[] = [
  { slug: "biohazardous-disposal", label: "Biohazardous Disposal" },
  { slug: "compactor-rental", label: "Compactor Rental" },
  { slug: "contaminated-soil", label: "Contaminated Soil" },
  { slug: "document-shredding", label: "Document Shredding" },
  { slug: "dumpster-rental", label: "Dumpster Rental" },
  { slug: "general-trash-collection", label: "General Trash Collection" },
  { slug: "general-waste-management", label: "General Waste Management" },
  { slug: "grease-trap-septic-tank", label: "Grease Trap / Septic Tank" },
  { slug: "hazardous-waste", label: "Hazardous Waste" },
  { slug: "landfill-operations", label: "Landfill Operations" },
  { slug: "material-recovery-facility", label: "Material Recovery Facility" },
  { slug: "plastic-recycling", label: "Plastic Recycling" },
  { slug: "portable-toilet", label: "Portable Toilet" },
  { slug: "product-destruction", label: "Product Destruction" },
  { slug: "road-sweeping", label: "Road Sweeping" },
  { slug: "scrap-metal-recycling", label: "Scrap Metal Recycling" },
  { slug: "septic-services", label: "Septic Services" },
  { slug: "skip-bin-dumpster-rental", label: "Skip Bin & Dumpster Rental" },
  { slug: "tank-cleaning", label: "Tank Cleaning" },
  { slug: "used-cooking-oil", label: "Used Cooking Oil" },
  { slug: "used-waste-oil", label: "Used Waste Oil" },
  { slug: "wastewater", label: "Wastewater" },
];

const SLUGS = new Set(SERVICE_PAGES.map((s) => s.slug));

/** Content page identifier for a service slug. */
export function servicePageId(slug: string): string {
  return `service.${slug}`;
}

/**
 * Content page identifier for a URL, or null when the path is not one of the
 * 22 service detail pages (e.g. `/services` itself).
 */
export function servicePageIdForPath(pathname: string): string | null {
  const m = /^\/services\/([^/?#]+)\/?$/.exec(pathname);
  if (!m) return null;
  const slug = m[1];
  return SLUGS.has(slug) ? servicePageId(slug) : null;
}
