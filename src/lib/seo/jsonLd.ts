/**
 * Centralized JSON-LD builders for CEVONS site SEO.
 * Use with TanStack head().scripts:
 *   scripts: [{ type: "application/ld+json", children: JSON.stringify(orgJsonLd()) }]
 */
import { cevonsContact } from "@/data/cevonsContact";
import { SITE_URL } from "@/lib/seo/site";

export { SITE_URL };

const branchGeo: Record<string, { lat: number; lng: number; locality: string }> = {
  georgetown: { lat: 6.8013, lng: -58.1551, locality: "Georgetown" },
  linden:     { lat: 6.0064, lng: -58.3018, locality: "Linden" },
  berbice:    { lat: 6.2485, lng: -57.5170, locality: "New Amsterdam" },
};

const OPENING_HOURS_SPEC = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "08:00",
    closes: "17:00",
  },
];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: cevonsContact.companyName,
    legalName: "CEVONS Environmental Services Inc.",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/brand/cevons-logo-correct.webp`,
    email: cevonsContact.email,
    telephone: cevonsContact.primaryPhone,
    foundingDate: "1997",
    areaServed: ["Georgetown", "Linden", "Berbice", "Guyana"],
    sameAs: [] as string[],
    contactPoint: [{
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: cevonsContact.primaryPhone,
      email: cevonsContact.email,
      areaServed: "GY",
      availableLanguage: ["en"],
    }],
  };
}

/**
 * Homepage graph. Emitted as a single typed Organization node (so the block
 * always carries an explicit @type) whose branches hang off `subOrganization`.
 */
export function localBusinessGraphJsonLd() {
  return {
    ...organizationJsonLd(),
    subOrganization: [
      ...cevonsContact.regions.map((r) => {

        const geo = branchGeo[r.id];
        return {
          "@type": "LocalBusiness",
          "@id": `${SITE_URL}/locations#${r.id}`,
          name: `${cevonsContact.companyName} – ${r.name} ${r.officeType}`,
          parentOrganization: { "@id": `${SITE_URL}/#organization` },
          url: `${SITE_URL}/locations`,
          image: `${SITE_URL}/assets/brand/cevons-logo-correct.webp`,
          email: r.email,
          telephone: r.phones[0],
          address: {
            "@type": "PostalAddress",
            streetAddress: r.addressLine1,
            addressLocality: geo.locality,
            addressRegion: r.name,
            addressCountry: "GY",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: geo.lat,
            longitude: geo.lng,
          },
          openingHoursSpecification: OPENING_HOURS_SPEC,
          areaServed: r.name,
        };
      }),
    ],
  };
}

/**
 * WebSite node for the homepage. Helps search engines associate the site name
 * with the domain.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: cevonsContact.companyName,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

/**
 * Primary navigation destinations, in the order we want search engines to
 * consider them for sitelinks. "Request a Service" leads deliberately.
 */
export const PRIMARY_NAV: { name: string; path: string; description: string }[] = [
  { name: "Request a Service", path: "/request-service", description: "Book waste collection, skip bins, septic and recycling services online." },
  { name: "Services", path: "/services", description: "Residential, commercial, industrial and facilities waste services." },
  { name: "Locations", path: "/locations", description: "Georgetown, Linden and Berbice branches and service areas." },
  { name: "Septic Services", path: "/services/septic-services", description: "Septic tank emptying and maintenance across Guyana." },
  { name: "Industries", path: "/industries", description: "Sectors CEVONS serves across Guyana." },
  { name: "Careers", path: "/careers", description: "Open roles at CEVONS Environmental Services." },
  { name: "About", path: "/about", description: "Who we are and how we work." },
  { name: "Resources & Insights", path: "/resources", description: "Guides, downloads and useful waste management information." },
  { name: "Contact", path: "/contact", description: "Phone, WhatsApp and email — talk to the team." },
];

export function siteNavigationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/#site-navigation`,
    name: "CEVONS site navigation",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: PRIMARY_NAV.map((item, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: item.name,
      description: item.description,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}

export function serviceJsonLd(opts: {
  name: string;
  description: string;
  path: string;        // e.g. "/services/dumpster-rental"
  category?: string;   // Residential | Commercial | Industrial | Facilities
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${opts.path}#service`,
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    serviceType: opts.category ?? "Waste Management",
    image: opts.image,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "City", name: "Georgetown" },
      { "@type": "City", name: "Linden" },
      { "@type": "City", name: "New Amsterdam" },
      { "@type": "Country", name: "Guyana" },
    ],
  };
}

export function faqPageJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbListJsonLd(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${SITE_URL}${it.path}` } : {}),
    })),
  };
}

/**
 * Head scripts for a service detail page: Service + BreadcrumbList (+ FAQPage
 * when the page has FAQs). Returns TanStack `head().scripts` entries.
 */
export function serviceJsonLdScripts(opts: {
  name: string;
  description: string;
  path: string;
  breadcrumb: string;
  category?: string;
  image?: string;
  faqs?: { q: string; a: string }[];
}) {
  const graph: object[] = [
    serviceJsonLd({
      name: opts.name,
      description: opts.description,
      path: opts.path,
      category: opts.category,
      image: opts.image,
    }),
    breadcrumbListJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: opts.breadcrumb, path: opts.path },
    ]),
  ];
  if (opts.faqs?.length) graph.push(faqPageJsonLd(opts.faqs));
  return graph.map((node) => ({
    type: "application/ld+json",
    children: JSON.stringify(node),
  }));
}
