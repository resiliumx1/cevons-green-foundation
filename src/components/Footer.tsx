import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  Clock,
  Leaf,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { SocialGlyph } from "./icons/SocialGlyph";
import { socialLinksList } from "@/data/socialLinks";
import logo from "@/assets/cevons-logo-transparent.png";
import { WhatsApp } from "./icons/WhatsApp";
import {
  cevonsContact,
  primaryTelHref,
  primaryMailtoHref,
  whatsappHref,
} from "@/data/cevonsContact";
import { NewsletterSignup } from "./NewsletterSignup";
import { useT } from "@/contexts/SettingsContext";

const BRAND_ORANGE = "#EF7700";
const BRAND_GREEN = "#2DA339";

type FooterLink = { label: string; to: string };

function FooterNavLink({ to, label, currentPath }: { to: string; label: string; currentPath: string }) {
  // Active if exact match, or — for service/industry detail pages — when the
  // current URL is nested under the same route prefix.
  const isActive =
    currentPath === to ||
    (to !== "/" && to.split("/").length > 2 && currentPath.startsWith(to));
  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={`group/link inline-flex items-center gap-1.5 text-[14px] leading-relaxed transition-colors motion-reduce:transition-none ${
        isActive ? "text-[color:var(--fa-orange)] font-semibold" : "text-white/75 hover:text-[color:var(--fa-orange)]"
      }`}
      style={{ ["--fa-orange" as never]: BRAND_ORANGE }}
    >
      <ArrowRight
        aria-hidden
        className={`size-3.5 shrink-0 -ml-0.5 transition-all duration-200 motion-reduce:transition-none ${
          isActive
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 group-focus-visible/link:opacity-100 group-focus-visible/link:translate-x-0"
        }`}
        style={{ color: BRAND_ORANGE }}
      />
      <span
        className={`transition-transform duration-200 motion-reduce:transition-none ${
          isActive ? "translate-x-0" : "group-hover/link:translate-x-0.5 group-focus-visible/link:translate-x-0.5"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function LinkCol({
  title,
  icon: Icon,
  items,
  currentPath,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: FooterLink[];
  currentPath: string;
}) {
  return (
    <div>
      <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-5 inline-flex items-center gap-2">
        {Icon ? <span style={{ color: BRAND_GREEN }}><Icon className="size-4" /></span> : null}
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((l) => (
          <li key={l.label + l.to}>
            <FooterNavLink to={l.to} label={l.label} currentPath={currentPath} />
          </li>
        ))}
      </ul>
    </div>
  );
}


export function Footer() {
  const t = useT();
  const isExternalWA = whatsappHref.startsWith("http");
  const year = new Date().getFullYear();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });


  const servicesList: FooterLink[] = [
    { label: t("footer.servicesList.residential"), to: "/services/general-trash-collection" },
    { label: t("footer.servicesList.commercial"), to: "/services/general-waste-management" },
    { label: t("footer.servicesList.industrial"), to: "/services/hazardous-waste" },
    { label: t("footer.servicesList.recycling"), to: "/services/material-recovery-facility" },
    { label: t("footer.servicesList.skipBin"), to: "/services/skip-bin-dumpster-rental" },
    { label: t("footer.servicesList.dumpster"), to: "/services/dumpster-rental" },
    { label: t("footer.servicesList.portable"), to: "/services/portable-toilet" },
    { label: t("footer.servicesList.septic"), to: "/services/septic-services" },
  ];

  const industriesList: FooterLink[] = [
    "residential",
    "commercial",
    "industrial",
    "hospitality",
    "construction",
    "healthcare",
    "education",
    "retail",
  ].map((k) => ({ label: t(`footer.industriesList.${k}`), to: "/industries" }));

  const companyList: FooterLink[] = [
    { label: t("footer.companyList.about"), to: "/about" },
    { label: t("footer.companyList.story"), to: "/about" },
    { label: t("footer.companyList.careers"), to: "/careers" },
    { label: t("footer.companyList.newsroom"), to: "/newsroom" },
    { label: t("footer.companyList.locations"), to: "/locations" },
    { label: t("footer.companyList.environment"), to: "/resources" },
    { label: t("footer.companyList.contact"), to: "/contact" },
  ];

  const trustItems = [
    { Icon: WhatsApp, title: t("footer.trust.wa"), sub: t("footer.trust.waSub") },
    { Icon: Clock, title: t("footer.trust.fast"), sub: t("footer.trust.fastSub") },
    { Icon: ShieldCheck, title: t("footer.trust.cert"), sub: t("footer.trust.certSub") },
    { Icon: Leaf, title: t("footer.trust.eco"), sub: t("footer.trust.ecoSub") },
  ];

  const stats = [
    { value: t("footer.stats.yearsValue"), label: t("footer.stats.yearsLabel") },
    { value: t("footer.stats.homesValue"), label: t("footer.stats.homesLabel") },
    { value: t("footer.stats.wasteValue"), label: t("footer.stats.wasteLabel") },
    {
      value: t("footer.stats.regionsValue"),
      label: t("footer.stats.regionsLabel"),
      sub: t("footer.stats.regionsSub"),
    },
  ];

  const certs = [
    { initials: "EPA", color: "#1E88E5", title: t("footer.certs.epaTitle"), sub: t("footer.certs.epaSub") },
    { initials: "ISO", color: "#D42229", title: t("footer.certs.isoTitle"), sub: t("footer.certs.isoSub") },
    { initials: "GCCI", color: "#FCE722", title: t("footer.certs.gcciTitle"), sub: t("footer.certs.gcciSub") },
  ];

  return (
    <footer className="bg-[#0F0F0F] text-white">
      {/* ZONE 1 — Partner gradient banner */}
      <section className="relative overflow-hidden">
        <div
          className="relative"
          style={{
            background:
              "linear-gradient(90deg, #111111 0%, #1a1a1a 18%, #F5A300 38%, #EF7700 65%, #D42229 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 6% 100%, 0 70%)",
          }}
        >
          <div className="container-cevons relative py-7 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-y-6 gap-x-10">
              <h3
                className="text-white text-2xl md:text-3xl leading-tight tracking-tight"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 }}
              >
                {t("footer.partnerLine")}{" "}
                <span style={{ color: BRAND_GREEN }}>{t("footer.partnerGreen")}</span>{" "}
                {t("footer.partnerCountry")}
              </h3>

              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                {trustItems.map(({ Icon, title, sub }) => (
                  <li key={title} className="flex items-start gap-2.5 min-w-0">
                    <span className="shrink-0 size-9 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-white ring-1 ring-white/20">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-white text-[13px] font-bold leading-tight">{title}</p>
                      <p className="text-white/85 text-[11px] leading-snug">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ZONE 2 — Stats + certifications strip */}
      <section className="border-b border-white/10">
        <div className="container-cevons py-7">
          <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <span
                className="size-10 rounded-lg flex items-center justify-center ring-1 ring-white/15"
                style={{ backgroundColor: "rgba(45,163,57,0.15)" }}
              >
                <BadgeCheck className="size-5" style={{ color: BRAND_GREEN }} />
              </span>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold leading-tight">{t("footer.stats.heading")}</p>
                <p className="text-white/60 text-xs leading-snug">{t("footer.stats.sub")}</p>
              </div>
            </div>

            <ul className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 xl:divide-x xl:divide-white/10">
              {stats.map((s) => (
                <li key={s.label} className="px-0 xl:px-4 min-w-0">
                  <p className="text-white text-lg md:text-xl font-extrabold leading-tight" style={{ color: BRAND_ORANGE }}>
                    {s.value}
                  </p>
                  <p className="text-white/80 text-[12px] leading-snug">{s.label}</p>
                  {s.sub ? <p className="text-white/55 text-[11px] mt-0.5">{s.sub}</p> : null}
                </li>
              ))}
            </ul>

            <ul className="flex items-center gap-4 shrink-0 flex-wrap">
              {certs.map((c) => (
                <li key={c.title} className="flex items-center gap-2.5">
                  <span
                    className="size-10 rounded-full flex items-center justify-center text-[10px] font-extrabold ring-2 ring-white/15"
                    style={{ backgroundColor: c.color, color: c.color === "#FCE722" ? "#1A1A1A" : "#FFFFFF" }}
                    aria-hidden
                  >
                    {c.initials}
                  </span>
                  <div className="leading-tight">
                    <p className="text-white text-[11px] font-bold uppercase tracking-wider">{c.title}</p>
                    <p className="text-white/60 text-[11px]">{c.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ZONE 3 — Main link grid */}
      <div className="container-cevons py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2">
              <img
                src={logo}
                alt="CEVONS Environmental Services logo"
                className="h-10 w-auto"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))" }}
              />
              <span
                className="text-2xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif" }}
              >
                CEVONS
              </span>
            </div>
            <p
              className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: BRAND_GREEN }}
            >
              Environmental Services Inc.
            </p>
            <p className="mt-5 text-white/70 text-sm leading-relaxed max-w-sm">{t("footer.tagline")}</p>

            <div className="mt-6 flex items-center gap-2.5">
              {socialLinksList.map((s) => {
                const disabled = !s.enabled || !s.url;
                const label = disabled ? `${s.name} — Coming soon` : `Follow CEVONS on ${s.name}`;
                const common =
                  "size-10 rounded-full flex items-center justify-center transition-all duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cevons-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]";
                if (disabled) {
                  return (
                    <span
                      key={s.platform}
                      role="img"
                      aria-label={label}
                      title="Coming soon"
                      className={`${common} bg-white/5 text-white/35 cursor-not-allowed`}
                    >
                      <SocialGlyph platform={s.platform} className="size-4" />
                    </span>
                  );
                }
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={`${common} bg-white/10 text-white hover:-translate-y-0.5 hover:scale-110 motion-reduce:hover:transform-none`}
                    style={{ ["--hover-bg" as never]: BRAND_ORANGE }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_ORANGE)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <SocialGlyph platform={s.platform} className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <LinkCol title={t("footer.services")} icon={Leaf} items={servicesList} currentPath={currentPath} />
          <LinkCol title={t("footer.industries")} icon={Building2} items={industriesList} currentPath={currentPath} />
          <LinkCol title={t("footer.company")} icon={Briefcase} items={companyList} currentPath={currentPath} />


          {/* Get in touch */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-5 inline-flex items-center gap-2">
              <Phone className="size-4" style={{ color: BRAND_GREEN }} />
              {t("footer.getInTouch")}
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={whatsappHref}
                  {...(isExternalWA ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-start gap-3 group"
                >
                  <span className="shrink-0 size-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(45,163,57,0.18)", color: BRAND_GREEN }}>
                    <WhatsApp className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight">{t("footer.whatsappUs")}</p>
                    <p className="text-white/60 text-xs">{t("footer.whatsappSub")}</p>
                  </div>
                </a>
              </li>
              <li>
                <a href={primaryTelHref} className="flex items-start gap-3 group">
                  <span className="shrink-0 size-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,119,0,0.18)", color: BRAND_ORANGE }}>
                    <Phone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold leading-tight" style={{ color: BRAND_ORANGE }}>
                      {cevonsContact.primaryPhone}
                    </p>
                    <p className="text-white/60 text-xs">{t("footer.callHours")}</p>
                  </div>
                </a>
              </li>
              <li>
                <a href={primaryMailtoHref} className="flex items-start gap-3 group">
                  <span className="shrink-0 size-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,119,0,0.18)", color: BRAND_ORANGE }}>
                    <Mail className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold leading-tight">{cevonsContact.email}</p>
                    <p className="text-white/60 text-xs">{t("footer.emailSub")}</p>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 size-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(45,163,57,0.18)", color: BRAND_GREEN }}>
                    <MapPin className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold leading-tight">{t("footer.locationLabel")}</p>
                    <p className="text-white/60 text-xs">{t("footer.branches")}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-3 inline-flex items-center gap-2">
              <Award className="size-4" style={{ color: BRAND_GREEN }} />
              {t("footer.newsletter")}
            </h4>
            <p className="text-white/70 text-xs leading-relaxed mb-3">{t("footer.newsletterBlurb")}</p>
            <NewsletterSignup source="footer" variant="footer" />
          </div>
        </div>
      </div>

      {/* ZONE 4 — Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-cevons py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-white/60 text-xs">
            © {year} CEVONS Environmental Services Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
            <a href="#" className="hover:text-[color:var(--brand-orange)]" style={{ ["--brand-orange" as never]: BRAND_ORANGE }}>{t("footer.privacy")}</a>
            <span className="text-white/20">|</span>
            <a href="#" className="hover:text-[color:var(--brand-orange)]" style={{ ["--brand-orange" as never]: BRAND_ORANGE }}>{t("footer.terms")}</a>
            <span className="text-white/20">|</span>
            <Link to="/" className="hover:text-[color:var(--brand-orange)]" style={{ ["--brand-orange" as never]: BRAND_ORANGE }}>{t("footer.sitemap")}</Link>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/60">{t("footer.serving")}</span>
            <span
              aria-hidden
              className="inline-flex size-6 rounded-full overflow-hidden ring-1 ring-white/20"
              style={{
                background:
                  "conic-gradient(from 0deg, #2DA339 0 33%, #FCE722 33% 66%, #D42229 66% 100%)",
              }}
            />
            <Link
              to="/crm"
              aria-label="Admin login"
              title="Admin"
              className="group inline-flex items-center gap-1 text-white/30 hover:text-cevons-yellow transition-colors"
            >
              <ShieldCheck className="size-3.5" />
              <span className="text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                {t("footer.admin")}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
