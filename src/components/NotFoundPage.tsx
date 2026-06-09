import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CalendarCheck,
  HardHat,
  Handshake,
  Home,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { SiteLayout } from "./SiteLayout";
import { Reveal } from "./motion/Reveal";
import { WhatsApp } from "./icons/WhatsApp";
import { CevonsIcon } from "@/components/CevonsIcon";
import { cevonsIcons } from "@/data/cevonsIconRegistry";
import logo from "@/assets/cevons-logo.png";
const truck = "/assets/heroes/hero-404.webp";
import { cevonsContact, primaryTelHref, primaryMailtoHref, whatsappHref } from "@/data/cevonsContact";

const helpfulLinks = [
  { to: "/services", title: "Our Services", sub: "Explore all services", Icon: Truck, branded: null },
  { to: "/locations", title: "Locations", sub: "View our service areas", Icon: MapPin, branded: null },
  { to: "/request-service", title: "Request a Service", sub: "Let's take care of it", Icon: CalendarCheck, branded: cevonsIcons.ui.requestService },
  { to: "/contact", title: "Contact Us", sub: "We're here to help", Icon: MessageCircle, branded: cevonsIcons.ui.contactSupport },
] as const;

const benefits = [
  { Icon: ShieldCheck, title: "Reliable Service", sub: "On-time, every time." },
  { Icon: HardHat, title: "Safety First", sub: "People and environment always come first." },
  { Icon: Leaf, title: "Eco-Focused", sub: "Sustainable solutions for a cleaner Guyana." },
  { Icon: Handshake, title: "Trusted Partner", sub: "25+ years of trusted environmental service." },
];

export function NotFoundPage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cevons-cream">
        <div className="container-cevons relative grid lg:grid-cols-2 gap-10 lg:gap-8 items-center pt-12 md:pt-16 pb-24 md:pb-32">
          <Reveal variant="up">
            <div className="flex items-center gap-2 md:gap-4 leading-none">
              <span className="text-[120px] md:text-[180px] font-black text-cevons-dark tracking-tighter">4</span>
              <span className="relative inline-block size-[110px] md:size-[170px] shrink-0 animate-[hero-scale_1.2s_ease-out]">
                <span className="absolute inset-0 rounded-full bg-white shadow-lift" />
                <img
                  src={logo}
                  alt="CEVON'S logo mark"
                  className="absolute inset-2 md:inset-3 object-contain w-[calc(100%-1rem)] md:w-[calc(100%-1.5rem)] h-[calc(100%-1rem)] md:h-[calc(100%-1.5rem)]"
                />
              </span>
              <span className="text-[120px] md:text-[180px] font-black text-cevons-dark tracking-tighter">4</span>
            </div>

            <h1 className="mt-6 text-3xl md:text-5xl font-extrabold text-cevons-green">
              Oops! Page Not Found
            </h1>
            <p className="mt-4 text-base md:text-lg text-cevons-muted max-w-xl">
              The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/" className="btn-base btn-green w-full sm:w-auto">
                <Home className="size-4" />
                Go Home
              </Link>
              <Link to="/request-service" className="btn-base btn-yellow w-full sm:w-auto">
                <Calendar className="size-4" />
                Request a Service
              </Link>
            </div>

            <Link
              to="/services"
              className="mt-5 inline-block text-sm font-semibold text-cevons-green hover:text-cevons-deep-green underline underline-offset-4"
            >
              Browse Our Services →
            </Link>
          </Reveal>

          <Reveal variant="scale" delay={0.1} className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lift aspect-[4/3]">
              <img src={truck} alt="CEVON’S branded page not found image" className="w-full h-full object-cover hero-img" />
              <div className="absolute inset-0 bg-gradient-to-tr from-cevons-deep-green/30 via-transparent to-transparent" />
            </div>
          </Reveal>

        </div>

        {/* Swoosh accents */}
        <div aria-hidden="true" className="brand-ribbon" />
      </section>

      {/* HELPFUL LINKS */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center">
            Here are some <span className="text-cevons-green">helpful links</span>
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {helpfulLinks.map(({ to, title, sub, Icon, branded }, i) => (
              <Link
                key={to}
                to={to}
                className="card-cevons p-6 group reveal block"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                {branded ? (
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cevons-cream to-cevons-green/10 ring-1 ring-cevons-green/15 shadow-sm transition-transform group-hover:scale-[1.04]">
                    <CevonsIcon icon={branded} size="md" decorative />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center size-12 rounded-full bg-cevons-green/10 text-cevons-green group-hover:bg-cevons-green group-hover:text-white transition-colors">
                    <Icon className="size-6" />
                  </span>
                )}
                <h3 className="mt-4 text-base font-bold text-cevons-dark">{title}</h3>
                <p className="mt-1 text-sm text-cevons-muted">{sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP BANNER */}
      <section className="pb-16 md:pb-20 bg-white">
        <div className="container-cevons">
          <div className="reveal rounded-2xl bg-cevons-deep-green p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lift">
            <div className="flex items-start md:items-center gap-4">
              <span className="shrink-0 size-12 rounded-full bg-cevons-green flex items-center justify-center text-white">
                <WhatsApp className="size-6" />
              </span>
              <div>
                <h3 className="text-white text-lg md:text-xl font-bold">Need immediate assistance?</h3>
                <p className="text-white/75 text-sm md:text-base">
                  Call <a href={primaryTelHref} className="font-semibold text-cevons-yellow hover:underline">{cevonsContact.primaryPhone}</a>
                  {" "}or email{" "}
                  <a href={primaryMailtoHref} className="font-semibold text-cevons-yellow hover:underline">{cevonsContact.email}</a>.
                </p>
              </div>
            </div>
            {/* Confirm official WhatsApp number with CEVON'S before launch. */}
            <a
              href={whatsappHref}
              {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="btn-base btn-yellow w-full md:w-auto"
            >
              <WhatsApp className="size-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="pb-16 md:pb-20 bg-white">
        <div className="container-cevons">
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {benefits.map(({ Icon, title, sub }) => (
              <li key={title} className="text-center">
                <span className="inline-flex items-center justify-center size-12 rounded-full bg-cevons-green/10 text-cevons-green">
                  <Icon className="size-6" />
                </span>
                <p className="mt-3 font-bold text-cevons-dark">{title}</p>
                <p className="mt-1 text-sm text-cevons-muted">{sub}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
