export type CevonsIconEntry = {
  title: string;
  src: string;
  alt: string;
};

export const cevonsIcons = {
  categories: {
    residential: {
      title: "Residential",
      src: "/assets/cevon-icons/categories/residential.webp",
      alt: "Residential waste services icon",
    },
    commercial: {
      title: "Commercial",
      src: "/assets/cevon-icons/categories/commercial.webp",
      alt: "Commercial waste services icon",
    },
    industrial: {
      title: "Industrial",
      src: "/assets/cevon-icons/categories/industrial.webp",
      alt: "Industrial environmental services icon",
    },
    facilities: {
      title: "Facilities",
      src: "/assets/cevon-icons/categories/facilities.webp",
      alt: "Facilities and environmental infrastructure icon",
    },
  },
  services: {
    "general-trash-collection": {
      title: "General Trash Collection",
      src: "/assets/cevon-icons/solid_waste/general-trash-collection.webp",
      alt: "General trash collection icon",
    },
    "general-waste-management": {
      title: "General Waste Management",
      src: "/assets/cevon-icons/solid_waste/general-waste-management.webp",
      alt: "General commercial waste management icon",
    },
    "dumpster-rental": {
      title: "Dumpster Rental",
      src: "/assets/cevon-icons/solid_waste/dumpster-rental.webp",
      alt: "Dumpster rental icon",
    },
    "skip-bin": {
      title: "Skip Bin Rental",
      src: "/assets/cevon-icons/solid_waste/skip-bin.webp",
      alt: "Skip bin rental icon",
    },
    "portable-toilet": {
      title: "Portable Toilet",
      src: "/assets/cevon-icons/special_services/portable-toilet.webp",
      alt: "Portable toilet rental icon",
    },
    "septic-services": {
      title: "Septic Services",
      src: "/assets/cevon-icons/liquid_waste/septic-services.webp",
      alt: "Septic services icon",
    },
    "grease-trap": {
      title: "Grease Trap / Septic Tank",
      src: "/assets/cevon-icons/liquid_waste/grease-trap.webp",
      alt: "Grease trap and septic tank icon",
    },
    "document-shredding": {
      title: "Document Shredding",
      src: "/assets/cevon-icons/special_services/document-shredding.webp",
      alt: "Document shredding icon",
    },
    "hazardous-waste": {
      title: "Hazardous Waste",
      src: "/assets/cevon-icons/liquid_waste/hazardous-waste.webp",
      alt: "Hazardous waste icon",
    },
    "liquid-wastewater": {
      title: "Wastewater",
      src: "/assets/cevon-icons/liquid_waste/liquid-wastewater.webp",
      alt: "Wastewater treatment icon",
    },
    "used-waste-oil": {
      title: "Used Waste Oil",
      src: "/assets/cevon-icons/liquid_waste/used-waste-oil.webp",
      alt: "Used waste oil disposal icon",
    },
    "contaminated-soil": {
      title: "Contaminated Soil",
      src: "/assets/cevon-icons/solid_waste/contaminated-soil.webp",
      alt: "Contaminated soil disposal icon",
    },
    "tank-cleaning": {
      title: "Tank Cleaning",
      src: "/assets/cevon-icons/special_services/tank-cleaning.webp",
      alt: "Industrial tank cleaning icon",
    },
    "product-destruction": {
      title: "Product Destruction",
      src: "/assets/cevon-icons/special_services/product-destruction.webp",
      alt: "Product destruction icon",
    },
    "biohazardous-disposal": {
      title: "Biohazardous Disposal",
      src: "/assets/cevon-icons/special_services/biohazardous-disposal.webp",
      alt: "Biohazardous disposal icon",
    },
    "material-recovery": {
      title: "Material Recovery Facility",
      src: "/assets/cevon-icons/recycling/material-recovery.webp",
      alt: "Material recovery facility icon",
    },
    "landfill-operations": {
      title: "Landfill Operations",
      src: "/assets/cevon-icons/solid_waste/landfill-operations.webp",
      alt: "Landfill operations icon",
    },
    "road-sweeping": {
      title: "Road Sweeping",
      src: "/assets/cevon-icons/special_services/road-sweeping.webp",
      alt: "Road sweeping icon",
    },
    "compactor-rental": {
      title: "Compactor Rental",
      src: "/assets/cevon-icons/solid_waste/compactor-rental.webp",
      alt: "Compactor rental icon",
    },
    "scrap-metal-recycling": {
      title: "Scrap Metal Recycling",
      src: "/assets/cevon-icons/recycling/scrap-metal-recycling.webp",
      alt: "Scrap metal recycling icon",
    },
    "cooking-oil-recycling": {
      title: "Cooking Oil Recycling",
      src: "/assets/cevon-icons/recycling/cooking-oil-recycling.webp",
      alt: "Cooking oil recycling icon",
    },
    "plastic-shredding": {
      title: "Plastic Shredding",
      src: "/assets/cevon-icons/recycling/plastic-shredding.webp",
      alt: "Plastic shredding icon",
    },
  },
  ui: {
    requestService: {
      title: "Request Service",
      src: "/assets/cevon-icons/ui_helpers/ui-request-service.webp",
      alt: "Request service icon",
    },
    trackRequest: {
      title: "Track Request",
      src: "/assets/cevon-icons/ui_helpers/ui-track-request.webp",
      alt: "Track request icon",
    },
    contactSupport: {
      title: "Contact Support",
      src: "/assets/cevon-icons/ui_helpers/ui-contact-support.webp",
      alt: "Contact support icon",
    },
  },
} as const;

export type CevonsCategoryKey = keyof typeof cevonsIcons.categories;
export type CevonsServiceKey = keyof typeof cevonsIcons.services;
export type CevonsUiKey = keyof typeof cevonsIcons.ui;

export function getCevonsIcon(
  group: "categories" | "services" | "ui",
  key: string,
): CevonsIconEntry | undefined {
  const bucket = cevonsIcons[group] as Record<string, CevonsIconEntry>;
  return bucket?.[key];
}
