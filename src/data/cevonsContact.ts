/**
 * Central source of truth for CEVONS official contact details.
 * Source: official CEVONS Environmental Services Inc. contact page.
 *
 * NOTE: The official WhatsApp number has not been confirmed yet.
 * Confirm official WhatsApp number with CEVONS before launch and
 * replace the `whatsapp` field below with the real value.
 */

export type CevonsRegionId = "georgetown" | "linden" | "berbice";

export interface CevonsRegion {
  id: CevonsRegionId;
  name: string;
  officeType: "Head Office" | "Branch Office";
  addressLine1: string;
  addressLine2: string;
  phones: string[];
  email: string;
  hours: string;
  services: string[];
}

export const cevonsContact = {
  companyName: "CEVON\u2019S Environmental Services Inc.",
  email: "info@cevons.com",
  /** Primary phone for general inquiries (Georgetown Head Office). */
  primaryPhone: "+592 218 1455",
  /** Official CEVONS WhatsApp number (Georgetown Head Office line). */
  whatsapp: "+592 218 1455" as string,
  hours: "Monday \u2013 Saturday, 8:00am to 5:00pm",
  regions: [
    {
      id: "georgetown",
      name: "Georgetown",
      officeType: "Head Office",
      addressLine1: "Lot 1 Mandela Avenue",
      addressLine2: "Georgetown, Guyana",
      phones: ["+592 218 1455"],
      email: "info@cevons.com",
      hours: "Monday \u2013 Saturday, 8:00am to 5:00pm",
      services: [
        "Residential",
        "Commercial",
        "Industrial",
        "Portable Toilet",
        "Skip Bin",
        "Dumpster",
        "Septic",
      ],
    },
    {
      id: "linden",
      name: "Linden",
      officeType: "Branch Office",
      addressLine1: "17 Republic Avenue, McKensie",
      addressLine2: "Linden, Guyana",
      phones: ["+592 444 6248", "+592 444 6249"],
      email: "info@cevons.com",
      hours: "Monday \u2013 Saturday, 8:00am to 5:00pm",
      services: ["Residential", "Commercial", "Skip Bin", "Portable Toilet", "Septic"],
    },
    {
      id: "berbice",
      name: "Berbice",
      officeType: "Branch Office",
      addressLine1: "Lot 16 New Street",
      addressLine2: "New Amsterdam, Guyana",
      phones: ["+592 333 1455", "+592 333 4513"],
      email: "info@cevons.com",
      hours: "Monday \u2013 Saturday, 8:00am to 5:00pm",
      services: ["Residential", "Commercial", "Skip Bin", "Portable Toilet", "Septic"],
    },
  ] satisfies CevonsRegion[],
} as const;

/** True only once the official WhatsApp number is confirmed and set above. */
export const hasConfirmedWhatsApp = cevonsContact.whatsapp !== "TO_BE_CONFIRMED";

/** href for the WhatsApp CTA — falls back to /contact until confirmed. */
export const whatsappHref = hasConfirmedWhatsApp
  ? `https://wa.me/${cevonsContact.whatsapp.replace(/\D/g, "")}`
  : "/contact";

/** Convert "+592 218 1455" → "tel:+5922181455". */
export const telHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;

/** Convert "info@cevons.com" → "mailto:info@cevons.com". */
export const mailtoHref = (email: string = cevonsContact.email) => `mailto:${email}`;

/** Primary tel: link for the Georgetown Head Office. */
export const primaryTelHref = telHref(cevonsContact.primaryPhone);

/** Primary mailto for general inquiries. */
export const primaryMailtoHref = mailtoHref(cevonsContact.email);

/**
 * JSON-LD LocalBusiness graph including all three branches.
 * Use on the Locations page and home as `<script type="application/ld+json">`.
 */
export function buildLocalBusinessJsonLd(siteUrl: string = "") {
  const sameOrg = {
    "@type": "Organization",
    name: cevonsContact.companyName,
    email: cevonsContact.email,
    telephone: cevonsContact.primaryPhone,
    url: siteUrl || undefined,
    areaServed: ["Georgetown", "Linden", "Berbice", "Guyana"],
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      sameOrg,
      ...cevonsContact.regions.map((r) => ({
        "@type": "LocalBusiness",
        "@id": `${siteUrl}#${r.id}`,
        name: `${cevonsContact.companyName} \u2013 ${r.name} ${r.officeType}`,
        parentOrganization: cevonsContact.companyName,
        email: r.email,
        telephone: r.phones[0],
        address: {
          "@type": "PostalAddress",
          streetAddress: r.addressLine1,
          addressLocality: r.name === "Berbice" ? "New Amsterdam" : r.name,
          addressRegion: r.name,
          addressCountry: "GY",
        },
        openingHours: "Mo-Sa 08:00-17:00",
        areaServed: r.name,
      })),
    ],
  };
}
