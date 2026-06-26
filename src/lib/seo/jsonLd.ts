/**
 * Centralized JSON-LD builders for CEVONS site SEO.
 * Use with TanStack head().scripts:
 *   scripts: [{ type: "application/ld+json", children: JSON.stringify(orgJsonLd()) }]
 */
import { cevonsContact } from "@/data/cevonsContact";

export const SITE_URL = "https://cevons-green-foundation.lovable.app";

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

export function localBusinessGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
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
