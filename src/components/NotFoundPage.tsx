import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  MapPin,
  MessageCircle,
  Truck,
} from "lucide-react";
import { SiteLayout } from "./SiteLayout";
import { Reveal } from "./motion/Reveal";
import { WhatsApp } from "./icons/WhatsApp";
import { SiteSearch } from "@/components/search/SiteSearch";
import { CevonsIcon } from "@/components/CevonsIcon";
import { cevonsIcons } from "@/data/cevonsIconRegistry";
import skipTruckAsset from "@/assets/slide-skip-hi-landscape.webp.asset.json";
import { cevonsContact, primaryTelHref, primaryMailtoHref, whatsappHref } from "@/data/cevonsContact";

/** Genuine CEVONS photograph: the red skip-bin truck, already used on the
 *  homepage hero. 1920x1080, optimised. Replaces the stock green truck. */
const truckSrc = skipTruckAsset.url;

const helpfulLinks = [
  { to: "/services", title: "Services", sub: "Everything we collect and handle", Icon: Truck, branded: null },
  { to: "/locations", title: "Locations", sub: "Where we operate", Icon: MapPin, branded: null },
  { to: "/request-service", title: "Request a service", sub: "Tell us what you need moved", Icon: CalendarCheck, branded: cevonsIcons.ui.requestService },
  { to: "/contact", title: "Contact", sub: "Talk to the team", Icon: MessageCircle, branded: cevonsIcons.ui.contactSupport },
] as const;

export function NotFoundPage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cevons-cream">
        <div className="container-cevons relative grid lg:grid-cols-2 gap-10 lg:gap-12 items-center pt-12 md:pt-16 pb-20 md:pb-28">
          <Reveal variant="up">
            <p
              className="text-[104px] leading-none sm:text-[132px] md:text-[168px] font-black tracking-tight"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontVariantNumeric: "tabular-nums",
                color: "var(--text-heading)",
              }}
              aria-hidden="true"
            >
              404
            </p>

            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold text-[var(--text-heading)]">
              This page isn't on our route.
            </h1>
            <p className="mt-4 text-base md:text-lg text-cevons-muted max-w-xl">
              The link may be out of date, or the page may have moved. Here's where most people are heading.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/request-service" className="btn-base btn-yellow w-full sm:w-auto min-h-[44px]">
                <CalendarCheck className="size-4" />
                Book a service
              </Link>
              <Link to="/services" className="btn-base btn-outline-green w-full sm:w-auto min-h-[44px]">
                Browse all services
              </Link>
            </div>

            <Link
              to="/"
              className="mt-5 inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--text-link)] underline underline-offset-4 hover:no-underline"
            >
              Go to the homepage
            </Link>

            {/* Site search — the existing header component, expanded inline */}
            <div className="mt-7 max-w-md">
              <p className="mb-2 text-sm font-semibold text-[var(--text-heading)]">
                Or search the site
              </p>
              <SiteSearch inline />
            </div>
          </Reveal>

          <Reveal variant="scale" delay={0.1} className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lift aspect-[16/9]">
              <img
                src={truckSrc}
                width={1920}
                height={1080}
                alt="A red CEVONS skip-bin truck loading a skip container on site in Guyana"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top right, rgba(0,0,128,0.28), transparent 60%)" }}
              />
            </div>
          </Reveal>
        </div>

        <div aria-hidden="true" className="brand-ribbon" />
      </section>

      {/* HELPFUL LINKS */}
      <section className="section-y bg-[var(--surface-page)]">
        <div className="container-cevons">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-[var(--text-heading)]">
            Popular destinations
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {helpfulLinks.map(({ to, title, sub, Icon, branded }, i) => (
              <Link
                key={to}
                to={to}
                className="card-cevons p-6 group block dark:bg-[var(--surface-2)] dark:border-[var(--hairline)]"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                {branded ? (
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cevons-cream to-cevons-green/10 ring-1 ring-cevons-green/15 shadow-sm transition-transform group-hover:scale-[1.04] dark:from-[var(--surface-3)] dark:to-[color-mix(in_srgb,var(--brand-orange)_12%,transparent)] dark:ring-[var(--hairline)]">
                    <CevonsIcon icon={branded} size="md" decorative />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center size-12 rounded-full bg-cevons-green/10 text-cevons-green group-hover:bg-cevons-green group-hover:text-white transition-colors dark:bg-[color-mix(in_srgb,var(--brand-orange)_14%,var(--surface-3))] dark:text-[var(--brand-orange)] dark:group-hover:bg-[var(--brand-orange)] dark:group-hover:text-[var(--brand-charcoal)]">
                    <Icon className="size-6" />
                  </span>
                )}
                <h3 className="mt-4 text-base font-bold text-cevons-dark dark:text-[var(--text-strong)]">{title}</h3>
                <p className="mt-1 text-sm text-cevons-muted dark:text-[var(--text-muted)]">{sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NAVY CONTACT BAND */}
      <section className="pb-16 md:pb-20 bg-[var(--surface-page)]">
        <div className="container-cevons">
          <div
            className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lift"
            style={{ backgroundColor: "#000080" }}
          >
            <div className="flex items-start md:items-center gap-4">
              <span
                className="shrink-0 size-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#EF7700", color: "#1A1A1A" }}
              >
                <WhatsApp className="size-6" />
              </span>
              <div>
                <h3 className="text-lg md:text-xl font-bold" style={{ color: "#FFFFFF" }}>
                  Still can't find it?
                </h3>
                <p className="text-sm md:text-base" style={{ color: "#E8ECF5" }}>
                  Call{" "}
                  <a href={primaryTelHref} className="font-semibold underline underline-offset-2" style={{ color: "#FFFFFF" }}>
                    {cevonsContact.primaryPhone}
                  </a>{" "}
                  or email{" "}
                  <a href={primaryMailtoHref} className="font-semibold underline underline-offset-2" style={{ color: "#FFFFFF" }}>
                    {cevonsContact.email}
                  </a>
                  .
                </p>
              </div>
            </div>
            <a
              href={whatsappHref}
              {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="btn-base w-full md:w-auto min-h-[44px]"
              style={{ backgroundColor: "#EF7700", color: "#1A1A1A" }}
            >
              <WhatsApp className="size-4" />
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
