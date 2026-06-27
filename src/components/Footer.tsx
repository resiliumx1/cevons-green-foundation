import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
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
  items,
  currentPath,
}: {
  title: string;
  items: FooterLink[];
  currentPath: string;
}) {
  return (
    <div>
      <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-2">
        {title}
      </h4>
      <span aria-hidden className="block h-[3px] w-8 rounded-full mb-5" style={{ backgroundColor: BRAND_ORANGE }} />
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

  const trustMini = [
    { Icon: Leaf, title: t("footer.trust.eco"), sub: t("footer.trust.ecoSub") },
    { Icon: ShieldCheck, title: t("footer.trust.cert"), sub: t("footer.trust.certSub") },
    { Icon: WhatsApp, title: t("footer.trust.wa"), sub: t("footer.trust.waSub") },
    { Icon: Clock, title: t("footer.trust.fast"), sub: t("footer.trust.fastSub") },
  ];

  return (
    <footer>
      {/* Newsletter card on cream background, sitting above the dark footer */}
      <section className="bg-cevons-cream py-12 md:py-14">
        <NewsletterSignup source="footer-card" variant="card" />
      </section>

      <div className="bg-[#0F0F0F] text-white relative overflow-hidden">
        {/* thin gradient accent divider */}
        <div
          aria-hidden
          className="h-[3px] w-full"
          style={{ background: "linear-gradient(90deg, transparent 0%, #EF7700 30%, #F5A300 50%, #EF7700 70%, transparent 100%)" }}
        />

        {/* faint watermark C */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-24 text-white/[0.025] select-none"
          style={{ fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif", fontSize: "28rem", fontWeight: 900, lineHeight: 1 }}
        >
          C
        </span>

        {/* ZONE 3 — Main link grid */}
        <div className="container-cevons py-14 md:py-16 relative">
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

              {/* Social icons */}
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
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_ORANGE)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                    >
                      <SocialGlyph platform={s.platform} className="size-4" />
                    </a>
                  );
                })}
              </div>

              {/* 2x2 trust mini items */}
              <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4 max-w-md">
                {trustMini.map(({ Icon, title, sub }) => (
                  <li key={title} className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="shrink-0 size-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(45,163,57,0.18)", color: BRAND_GREEN }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-white text-[12.5px] font-bold leading-tight">{title}</p>
                      <p className="text-white/60 text-[11px] leading-snug">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <LinkCol title={t("footer.services")} items={servicesList} currentPath={currentPath} />
            <LinkCol title={t("footer.company")} items={companyList} currentPath={currentPath} />
            <LinkCol title={t("footer.industries")} items={industriesList} currentPath={currentPath} />

            <GetInTouch t={t} isExternalWA={isExternalWA} />
          </div>
        </div>




        {/* Bottom bar */}
        <div className="border-t border-white/10 relative">
          <div className="container-cevons py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-white/60 text-xs">
              © {year} CEVONS Environmental Services Inc. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
              <span aria-label={`${t("footer.privacy")} — Coming soon`} title="Coming soon" className="cursor-not-allowed text-white/40">{t("footer.privacy")}</span>
              <span className="text-white/20">|</span>
              <span aria-label={`${t("footer.terms")} — Coming soon`} title="Coming soon" className="cursor-not-allowed text-white/40">{t("footer.terms")}</span>
              <span className="text-white/20">|</span>
              <Link
                to="/sitemap"
                className="group/sm inline-flex items-center gap-1 text-white/60 hover:text-[color:var(--brand-orange)] focus-visible:text-[color:var(--brand-orange)] transition-colors motion-reduce:transition-none"
                style={{ ["--brand-orange" as never]: BRAND_ORANGE }}
              >
                <ArrowRight
                  aria-hidden
                  className="size-3 opacity-0 -translate-x-1 group-hover/sm:opacity-100 group-hover/sm:translate-x-0 group-focus-visible/sm:opacity-100 group-focus-visible/sm:translate-x-0 transition-all duration-200 motion-reduce:transition-none"
                  style={{ color: BRAND_ORANGE }}
                />
                {t("footer.sitemap")}
              </Link>
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
      </div>
    </footer>
  );
}

function GetInTouch({ t, isExternalWA }: { t: (k: string) => string; isExternalWA: boolean }) {
  return (
    <div>
      <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-2 inline-flex items-center gap-2">
        <Phone className="size-4" style={{ color: BRAND_GREEN }} />
        {t("footer.getInTouch")}
      </h4>
      <span aria-hidden className="block h-[3px] w-8 rounded-full mb-5" style={{ backgroundColor: BRAND_ORANGE }} />
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
  );
}
