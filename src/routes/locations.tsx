import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Check, Minus, MessageCircle, ArrowRight, ShieldCheck, Clock3, Award, Headphones, Mail } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { GuyanaBranchMap, type BranchPoint } from "@/components/GuyanaBranchMap";
import { cevonsContact, telHref, mailtoHref, whatsappHref } from "@/data/cevonsContact";
import { localBusinessGraphJsonLd, breadcrumbListJsonLd } from "@/lib/seo/jsonLd";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "CEVON'S Locations | Waste Management in Georgetown, Linden & Berbice" },
      { name: "description", content: "CEVON'S provides waste management and environmental services across Georgetown, Linden, and Berbice. Request service online or contact us by WhatsApp." },
      { property: "og:title", content: "CEVON'S Locations | Waste Management in Georgetown, Linden & Berbice" },
      { property: "og:description", content: "CEVON'S provides waste management and environmental services across Georgetown, Linden, and Berbice." },
      { property: "og:url", content: "/locations" },
    ],
    links: [{ rel: "canonical", href: "/locations" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessGraphJsonLd()) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbListJsonLd([
        { name: "Home", path: "/" },
        { name: "Locations", path: "/locations" },
      ])) },
    ],
  }),
  component: LocationsPage,
});

type Region = "Georgetown" | "Linden" | "Berbice";

const regions: {
  name: Region;
  label: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  coords: [number, number];
}[] = [
  {
    name: "Georgetown",
    label: "Head Office",
    address: `${cevonsContact.regions[0].addressLine1}, ${cevonsContact.regions[0].addressLine2}`,
    phone: cevonsContact.regions[0].phones.join(" / "),
    hours: cevonsContact.regions[0].hours,
    services: cevonsContact.regions[0].services,
    coords: [6.8013, -58.1551],
  },
  {
    name: "Linden",
    label: "Branch Office",
    address: `${cevonsContact.regions[1].addressLine1}, ${cevonsContact.regions[1].addressLine2}`,
    phone: cevonsContact.regions[1].phones.join(" / "),
    hours: cevonsContact.regions[1].hours,
    services: cevonsContact.regions[1].services,
    coords: [6.0064, -58.3018],
  },
  {
    name: "Berbice",
    label: "Branch Office",
    address: `${cevonsContact.regions[2].addressLine1}, ${cevonsContact.regions[2].addressLine2}`,
    phone: cevonsContact.regions[2].phones.join(" / "),
    hours: cevonsContact.regions[2].hours,
    services: cevonsContact.regions[2].services,
    coords: [6.2485, -57.5170],
  },
];

const mapBranches: BranchPoint[] = regions.map((r) => ({
  id: r.name,
  name: r.name,
  label: r.label,
  lat: r.coords[0],
  lng: r.coords[1],
  phone: r.phone.split(" / ")[0],
  hours: r.hours,
}));

const availability: { service: string; cells: Record<Region, "yes" | "contact"> }[] = [
  { service: "Garbage Collection", cells: { Georgetown: "yes", Linden: "yes", Berbice: "yes" } },
  { service: "Dumpster Rental", cells: { Georgetown: "yes", Linden: "contact", Berbice: "contact" } },
  { service: "Skip Bin Rental", cells: { Georgetown: "yes", Linden: "yes", Berbice: "yes" } },
  { service: "Portable Toilet Rental", cells: { Georgetown: "yes", Linden: "yes", Berbice: "yes" } },
  { service: "Septic Tank Clearance", cells: { Georgetown: "yes", Linden: "yes", Berbice: "yes" } },
  { service: "Waste Oil Recycling", cells: { Georgetown: "yes", Linden: "contact", Berbice: "contact" } },
  { service: "Scrap Metal Collection", cells: { Georgetown: "yes", Linden: "contact", Berbice: "contact" } },
  { service: "Wastewater Treatment", cells: { Georgetown: "yes", Linden: "contact", Berbice: "contact" } },
];

function LocationsPage() {
  const [activePin, setActivePin] = useState<Region>("Georgetown");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SiteLayout>
      {/* HERO */}
      <PageHero
        title="Our Locations"
        eyebrow="Guyana"
        subtitle="Proudly serving Georgetown, Linden, and Berbice."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Locations" }]}
        imageSrc="/assets/heroes/hero-locations.webp"
        imageAlt="CEVON’S service coverage across Georgetown, Linden, and Berbice"
        height="standard"
      />

      {/* MAP SECTION */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
              Where We Operate
            </h2>
            <p className="mt-3 text-cevons-muted max-w-2xl mx-auto">
              Tap a pin to see the region. Coverage spans coastal and inland Guyana.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl rounded-3xl border border-[var(--cevons-deep-green,#006B35)]/15 bg-[var(--cevons-cream,#FBF7EE)] p-3 sm:p-5 md:p-6 shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <GuyanaBranchMap
                branches={mapBranches}
                selectedId={activePin}
                onSelect={(id) => setActivePin(id as Region)}
                className="absolute inset-0 size-full"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-cevons-muted">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--cevons-deep-green,#006B35)]" /> Branch
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFD200]" /> Selected
              </span>
              <span className="text-cevons-muted/70">Click the map to enable scroll zoom</span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {regions.map((r) => {
                const active = activePin === r.name;
                return (
                  <button
                    key={r.name}
                    onClick={() => setActivePin(r.name)}
                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                      active
                        ? "border-[var(--cevons-deep-green,#006B35)] bg-[var(--cevons-deep-green,#006B35)] text-white shadow-md"
                        : "border-[var(--cevons-deep-green,#006B35)]/15 bg-white text-[var(--cevons-deep-green,#006B35)] hover:border-[var(--cevons-deep-green,#006B35)]/40"
                    }`}
                    aria-pressed={active}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <MapPin className="w-4 h-4" /> {r.name}
                    </div>
                    <div className={`text-xs mt-0.5 ${active ? "text-white/80" : "text-cevons-muted"}`}>
                      {r.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* REGION CARDS */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]">
        <div className="container-cevons">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
              Regional Offices
            </h2>
            <p className="mt-3 text-cevons-muted">Reach out to the team closest to you.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regions.map((r) => (
              <div
                key={r.name}
                className="group rounded-2xl bg-white border border-[var(--cevons-deep-green,#006B35)]/10 p-7 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-[var(--cevons-deep-green,#006B35)]/10 text-[var(--cevons-deep-green,#006B35)]">
                      <MapPin className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
                        {r.name}
                      </h3>
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#B58900]">
                        {r.label}
                      </span>
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-cevons-muted">
                  <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />{r.address}</li>
                  <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />
                    <span className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {r.phone.split(" / ").map((p) => (
                        <a key={p} href={telHref(p)} className="hover:text-[var(--cevons-deep-green,#006B35)] hover:underline">{p}</a>
                      ))}
                    </span>
                  </li>
                  <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />
                    <a href={mailtoHref()} className="hover:text-[var(--cevons-deep-green,#006B35)] hover:underline">{cevonsContact.email}</a>
                  </li>
                  <li className="flex gap-2"><Clock className="w-4 h-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />{r.hours}</li>
                </ul>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cevons-muted mb-2">
                    Services Available
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-[var(--cevons-deep-green,#006B35)]/8 text-[var(--cevons-deep-green,#006B35)] text-xs font-medium px-2.5 py-1 border border-[var(--cevons-deep-green,#006B35)]/15"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/request-service"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cevons-deep-green,#006B35)] text-white font-semibold px-4 py-3 hover:bg-[var(--cevons-deep-green,#006B35)]/90 transition-colors"
                >
                  Request Service in {r.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AVAILABILITY TABLE */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
              Service Availability by Location
            </h2>
            <p className="mt-3 text-cevons-muted">A quick view of what's offered where.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--cevons-deep-green,#006B35)]/15 shadow-sm">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-[var(--cevons-deep-green,#006B35)] text-white">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold">Service</th>
                  {(["Georgetown", "Linden", "Berbice"] as Region[]).map((r) => (
                    <th key={r} className="px-5 py-4 text-sm font-semibold text-center">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {availability.map((row, i) => (
                  <tr
                    key={row.service}
                    className={i % 2 === 0 ? "bg-white" : "bg-[var(--cevons-cream,#FBF7EE)]/60"}
                  >
                    <td className="px-5 py-4 text-sm font-medium text-[var(--cevons-deep-green,#006B35)]">
                      {row.service}
                    </td>
                    {(["Georgetown", "Linden", "Berbice"] as Region[]).map((r) => (
                      <td key={r} className="px-5 py-4 text-center">
                        {row.cells[r] === "yes" ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--cevons-deep-green,#006B35)]/10 text-[var(--cevons-deep-green,#006B35)]">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cevons-muted">
                            <Minus className="w-3.5 h-3.5" /> Contact for availability
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* LOCAL CTA */}
      <section className="bg-[var(--cevons-deep-green,#006B35)] text-white">
        <div className="container-cevons py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Need service in your area?</h2>
          <p className="mt-3 text-white/85 max-w-2xl mx-auto">
            Tell us your location and the service you need. Our team will confirm availability and next steps.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={whatsappHref}
              {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5C518] text-[var(--cevons-deep-green,#006B35)] font-bold px-6 py-3.5 hover:brightness-105 transition"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
            <Link
              to="/request-service"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white text-white font-bold px-6 py-3.5 hover:bg-white hover:text-[var(--cevons-deep-green,#006B35)] transition"
            >
              Request Service <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[var(--cevons-cream,#FBF7EE)] border-t border-[var(--cevons-deep-green,#006B35)]/10">
        <div className="container-cevons py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: "Licensed & Insured" },
            { icon: Clock3, label: "Same-Day Response" },
            { icon: Award, label: "Trusted Across Guyana" },
            { icon: Headphones, label: "24/7 Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center text-center">
              <Icon className="w-6 h-6 text-[var(--cevons-deep-green,#006B35)]" />
              <span className="text-sm font-semibold text-[var(--cevons-deep-green,#006B35)]">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
