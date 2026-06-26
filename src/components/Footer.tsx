import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import logo from "@/assets/cevons-logo-transparent.png";
import { WhatsApp } from "./icons/WhatsApp";
import { cevonsContact, primaryTelHref, primaryMailtoHref, whatsappHref } from "@/data/cevonsContact";
import { NewsletterSignup } from "./NewsletterSignup";
import { useT } from "@/contexts/SettingsContext";

type FooterLink = { label: string; to: string };

function Col({ title, items }: { title: string; items: string[] | FooterLink[] }) {
  return (
    <div>
      <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-5">{title}</h4>
      <ul className="space-y-3">
        {items.map((i) => {
          const link: FooterLink = typeof i === "string" ? { label: i, to: "/services" } : i;
          return (
            <li key={link.label}>
              <Link to={link.to} className="text-white/75 hover:text-cevons-yellow text-[14px] leading-relaxed transition-colors">
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer() {
  const t = useT();
  const isExternalWA = whatsappHref.startsWith("http");

  const servicesList = ["residential", "commercial", "skipBin", "dumpster", "portable", "septic"].map(
    (k) => t(`footer.servicesList.${k}`),
  );
  const categoriesList = ["residential", "commercial", "industrial", "recycling"].map(
    (k) => t(`footer.categoriesList.${k}`),
  );
  const companyList: FooterLink[] = [
    { label: t("footer.companyList.about"), to: "/about" },
    { label: t("footer.companyList.careers"), to: "/careers" },
    { label: t("footer.companyList.locations"), to: "/locations" },
    { label: t("footer.companyList.resources"), to: "/resources" },
    { label: t("footer.companyList.newsroom"), to: "/newsroom" },
    { label: t("footer.companyList.contact"), to: "/contact" },
  ];

  return (
    <footer className="bg-cevons-deep-green text-white">
      <div className="container-cevons py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center">
              <img
                src={logo}
                alt="CEVONS Environmental Services logo"
                className="h-14 w-auto"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))" }}
              />
            </div>
            <p className="mt-5 text-white/75 text-sm leading-relaxed max-w-sm">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Facebook, Instagram, Linkedin].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="size-9 rounded-full bg-white/10 hover:bg-cevons-yellow hover:text-cevons-dark flex items-center justify-center transition-colors"
                >
                  <I className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <Col title={t("footer.services")} items={servicesList} />
          <Col title={t("footer.categories")} items={categoriesList} />
          <Col title={t("footer.company")} items={companyList} />

          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">{t("footer.getInTouch")}</h4>
            <a
              href={whatsappHref}
              {...(isExternalWA ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-start gap-3 group"
            >
              <span className="shrink-0 size-10 rounded-full bg-cevons-green flex items-center justify-center group-hover:bg-cevons-yellow group-hover:text-cevons-dark transition-colors">
                <WhatsApp className="size-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">{t("footer.primary")}</p>
                <p className="text-white font-semibold text-sm">{t("footer.whatsappUs")}</p>
              </div>
            </a>
            <a href={primaryTelHref} className="flex items-start gap-3 mt-4">
              <Phone className="size-4 mt-1 text-cevons-yellow" />
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">{t("footer.call")}</p>
                <p className="text-white text-sm font-semibold">{cevonsContact.primaryPhone}</p>
              </div>
            </a>
            <a href={primaryMailtoHref} className="flex items-start gap-3 mt-3">
              <Mail className="size-4 mt-1 text-cevons-yellow" />
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">{t("footer.email")}</p>
                <p className="text-white text-sm">{cevonsContact.email}</p>
              </div>
            </a>
            <p className="mt-4 text-xs text-white/55 leading-relaxed">
              {t("footer.branches")}
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="max-w-xl">
            <NewsletterSignup source="footer" variant="footer" />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="flex items-center gap-2 text-white/75 text-sm">
            <MapPin className="size-4 text-cevons-yellow" />
            {t("footer.serving")}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <a href="#" className="hover:text-cevons-yellow">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-cevons-yellow">{t("footer.terms")}</a>
            <a href="#" className="hover:text-cevons-yellow">{t("footer.sitemap")}</a>
            <span>© {new Date().getFullYear()} CEVONS Environmental Services Inc.</span>
            <Link
              to="/crm"
              aria-label="Admin login"
              title="Admin"
              className="group inline-flex items-center gap-1 text-white/40 hover:text-cevons-yellow transition-colors"
            >
              <ShieldCheck className="size-3.5" />
              <span className="text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">{t("footer.admin")}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
