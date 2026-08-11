import type { CevonsServiceKey } from "@/data/cevonsIconRegistry";

export type ServiceCategory =
  | "residential"
  | "commercial"
  | "industrial"
  | "facilities"
  | "recycling";

export type Service = {
  slug: string;
  path: string;
  title: string;
  shortBody: string;
  iconKey: CevonsServiceKey;
  categories: ServiceCategory[];
  specialist: boolean;
  /** Badge-only entry: shown in grids, but has no detail page, no CTA. */
  comingSoon?: boolean;
  /** Retired from the category grids; detail page redirects elsewhere. */
  retired?: boolean;
};

function svc(
  slug: string,
  title: string,
  iconKey: CevonsServiceKey,
  categories: ServiceCategory[],
  shortBody: string,
  specialist = false,
): Service {
  return { slug, path: `/services/${slug}`, title, iconKey, categories, shortBody, specialist };
}

export const services: Service[] = [
  // Residential
  svc("general-trash-collection", "General Trash Collection", "general-trash-collection", ["residential"], "Reliable household waste pickup on a schedule that fits your community."),
  svc("dumpster-rental", "Dumpster Rental", "dumpster-rental", [], "Short or long term dumpster rentals for home projects and cleanouts."),
  svc("septic-services", "Septic Services", "septic-services", ["residential"], "Safe, efficient septic tank pumping and clearance for homes."),
  svc("portable-toilet", "Portable Toilet", "portable-toilet", ["residential", "commercial"], "Clean, hygienic portable toilet rentals for residential events and projects."),

  // Commercial-only (portable-toilet already above)
  svc("general-waste-management", "General Waste Management", "general-waste-management", ["commercial"], "Scheduled collection and waste programs for businesses and properties."),
  svc("skip-bin-dumpster-rental", "Skip Bin & Dumpster Rental", "skip-bin", ["residential", "commercial"], "Multiple sizes for construction, renovation, and ongoing site needs."),
  svc("grease-trap-septic-tank", "Grease Trap / Septic Tank", "grease-trap", ["commercial"], "Grease trap and septic servicing for restaurants and facilities."),
  svc("document-shredding", "Document Shredding", "document-shredding", ["commercial"], "Secure on-site or off-site document destruction with chain-of-custody."),

  // Industrial (all specialist)
  svc("hazardous-waste", "Hazardous Waste", "hazardous-waste", ["industrial"], "Regulated handling, transport, and disposal of hazardous waste streams.", true),
  svc("wastewater", "Wastewater", "liquid-wastewater", ["industrial"], "Industrial wastewater collection and treatment coordination.", true),
  svc("used-waste-oil", "Used Waste Oil", "used-waste-oil", ["industrial"], "Compliant collection and responsible recycling of used waste oil.", true),
  svc("contaminated-soil", "Contaminated Soil", "contaminated-soil", ["industrial"], "Excavation, transport, and treatment of contaminated solid waste.", true),
  svc("tank-cleaning", "Tank Cleaning", "tank-cleaning", ["industrial"], "Industrial tank cleaning with safety controls and proper waste disposal.", true),
  svc("product-destruction", "Product Destruction", "product-destruction", ["commercial"], "Certified product destruction with auditable documentation.", true),
  svc("biohazardous-disposal", "Biohazardous Disposal", "biohazardous-disposal", ["industrial"], "Safe biohazardous waste collection and compliant disposal.", true),

  // Facilities
  svc("material-recovery-facility", "Material Recovery Facility", "material-recovery", ["facilities"], "Sorting and recovery infrastructure that turns waste into resources.", true),
  svc("landfill-operations", "Landfill Operations", "landfill-operations", ["facilities"], "Managed landfill operations with environmental safeguards."),

  // New services
  svc("scrap-metal-recycling", "Scrap Metal Recycling", "scrap-metal-recycling", ["recycling", "commercial"], "Licensed scrap metal collection, processing, and export for ferrous and non-ferrous streams."),
  svc("used-cooking-oil", "Used Cooking Oil Collection", "cooking-oil-recycling", ["recycling", "commercial"], "Scheduled collection of used cooking oil from restaurants and commercial kitchens."),
  svc("plastic-recycling", "Plastic Recycling", "plastic-shredding", ["recycling", "commercial"], "Business plastics recycling programs with verified, transparent end destinations."),
  svc("road-sweeping", "Road Sweeping", "road-sweeping", ["commercial"], "Mechanical road sweeper hire for streets, sites, and events across Guyana."),
  svc("compactor-rental", "Compactor Rental", "compactor-rental", ["commercial"], "Commercial waste compactor rental that shrinks volume and cuts collection frequency."),
];

/** Retired from grids — kept for the 301 redirect and reversibility. */
const retiredSlugs = new Set(["dumpster-rental"]);
for (const s of services) if (retiredSlugs.has(s.slug)) s.retired = true;

/** Badge-only "coming soon" entries: no detail page, no CTA, no search entry. */
export const comingSoonServices: Service[] = [
  {
    slug: "cardboard-recycling",
    path: "",
    title: "Cardboard Recycling",
    shortBody: "Efficient collection and recycling of cardboard to support a circular economy.",
    iconKey: "document-shredding",
    categories: ["commercial", "recycling"],
    specialist: false,
    comingSoon: true,
  },
];

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return services.filter((s) => s.categories.includes(category));
}

export function getServiceBySlug(slug: string): Service | undefined {
  return [...services, ...comingSoonServices].find((s) => s.slug === slug);
}

export const categorySectionOrder: Record<ServiceCategory, string[]> = {
  residential: [
    "general-trash-collection",
    "skip-bin-dumpster-rental",
    "septic-services",
    "portable-toilet",
  ],
  commercial: [
    "general-waste-management",
    "skip-bin-dumpster-rental",
    "portable-toilet",
    "grease-trap-septic-tank",
    "document-shredding",
    "compactor-rental",
    "road-sweeping",
    "scrap-metal-recycling",
    "used-cooking-oil",
    "plastic-recycling",
    "product-destruction",
    "cardboard-recycling",
  ],
  industrial: [
    "hazardous-waste",
    "wastewater",
    "used-waste-oil",
    "contaminated-soil",
    "tank-cleaning",
    "biohazardous-disposal",
  ],
  facilities: [
    "material-recovery-facility",
    "landfill-operations",
  ],
  recycling: [
    "scrap-metal-recycling",
    "used-cooking-oil",
    "plastic-recycling",
    "cardboard-recycling",
  ],
};

export function getServicesForSection(category: ServiceCategory): Service[] {
  return categorySectionOrder[category]
    .map((slug) => getServiceBySlug(slug))
    .filter((s): s is Service => Boolean(s));
}
