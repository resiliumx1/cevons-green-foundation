import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, ChevronRight, Menu, PackageSearch, X } from "lucide-react";
import logo from "@/assets/cevons-logo-transparent.png";
import { SettingsMenu } from "./SettingsMenu";
import { useT } from "@/contexts/SettingsContext";

const ACTIVE_ORANGE = "#EF7700";

function useIsActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  };
}

type NavItem = { to: string; key: string; hasDropdown?: boolean };
const nav: NavItem[] = [
  { to: "/", key: "home" },
  { to: "/services", key: "services", hasDropdown: true },
  { to: "/industries", key: "industries" },
  { to: "/locations", key: "locations" },
  { to: "/resources", key: "resources" },
  { to: "/newsroom", key: "newsroom" },
  { to: "/about", key: "about" },
  { to: "/careers", key: "careers" },
  { to: "/contact", key: "contact" },
];

const utilityNav: NavItem[] = [
  { to: "/track-request", key: "trackRequest" },
];

type ServiceSlug =
  | "general-trash-collection" | "dumpster-rental" | "septic-services" | "portable-toilet"
  | "general-waste-management" | "skip-bin-dumpster-rental" | "grease-trap-septic-tank" | "document-shredding"
  | "hazardous-waste" | "wastewater" | "used-waste-oil" | "contaminated-soil" | "tank-cleaning"
  | "product-destruction" | "biohazardous-disposal" | "material-recovery-facility" | "landfill-operations";

const servicesMenu: { groupKey: "residential" | "commercial" | "industrial" | "facilities"; items: ServiceSlug[] }[] = [
  { groupKey: "residential", items: ["general-trash-collection", "dumpster-rental", "septic-services", "portable-toilet"] },
  { groupKey: "commercial", items: ["general-waste-management", "skip-bin-dumpster-rental", "portable-toilet", "grease-trap-septic-tank", "document-shredding"] },
  { groupKey: "industrial", items: ["hazardous-waste", "wastewater", "used-waste-oil", "contaminated-soil", "tank-cleaning", "product-destruction", "biohazardous-disposal"] },
  { groupKey: "facilities", items: ["material-recovery-facility", "landfill-operations"] },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const t = useT();
  const isActive = useIsActive();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-[100] w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-cevons-border/60 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          : "bg-white border-b border-cevons-border"
      }`}
    >
      <div className="container-cevons flex h-[72px] items-center gap-4">
        <Link
          to="/"
          className={`flex items-center shrink-0 group gap-2.5 transition-opacity duration-300 ${
            scrolled ? "opacity-90" : "opacity-100"
          }`}
          aria-label="CEVONS Environmental Services home"
        >
          <span className="relative inline-flex items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 -m-3 rounded-full bg-[radial-gradient(closest-side,rgba(0,107,53,0.10),transparent_72%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <img
              src={logo}
              alt="CEVONS Environmental Services"
              className="relative h-12 lg:h-14 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
              style={{ filter: "drop-shadow(0 1px 1px rgba(16,24,32,0.08))" }}
            />
          </span>
          <span className="flex flex-col justify-center leading-none">
            <span
              className="text-[17px] lg:text-[19px] font-extrabold tracking-tight text-[#2DA339] dark:text-[#4FD163]"
              style={{ fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif" }}
            >
              CEVONS
            </span>
            <span className="hidden md:block mt-0.5 text-[9px] lg:text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#2DA339] dark:text-[#4FD163]">
              Environmental Services Inc.
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-0.5 flex-1 min-w-0" aria-label="Primary">
          {nav.map((item) => {
            const active = isActive(item.to);
            return (
            <div key={item.to} className="relative group">
              <Link
                to={item.to}
                className={`relative px-2 py-2 text-[13px] font-semibold transition-colors inline-flex items-center gap-1 whitespace-nowrap ${
                  active
                    ? "text-[#EF7700]"
                    : "text-cevons-dark hover:text-[#EF7700]/80"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {t(`nav.${item.key}`)}
                {item.hasDropdown && <ChevronDown className="size-3.5" />}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-2 right-2 -bottom-0.5 h-[2.5px] rounded-full bg-[${ACTIVE_ORANGE}] motion-safe:transition-all motion-safe:duration-300 ${
                    active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                  } origin-center`}
                  style={{ backgroundColor: ACTIVE_ORANGE }}
                />
              </Link>
              {item.hasDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="bg-white rounded-xl border border-cevons-border shadow-[0_20px_40px_rgba(16,24,32,0.12)] p-5 grid grid-cols-4 gap-x-6 gap-y-2 min-w-[820px]">
                    {servicesMenu.map((col) => (
                      <div key={col.groupKey}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cevons-green mb-2">
                          {t(`servicesMenu.${col.groupKey}`)}
                        </p>
                        <ul className="space-y-1">
                          {col.items.map((slug) => (
                            <li key={col.groupKey + slug}>
                              <Link
                                to={`/services/${slug}`}
                                className="block px-2 py-1.5 -mx-2 text-[13px] text-cevons-dark hover:bg-cevons-cream hover:text-cevons-green rounded-md transition-colors"
                              >
                                {t(`servicesMenu.items.${slug}`)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <SettingsMenu />
          <a href="/request-service" className="btn-base btn-green btn-shine group/sched text-[13.5px] px-4 py-2.5 shrink-0">
            <Calendar className="size-4 transition-transform duration-300 group-hover/sched:-rotate-6 group-hover/sched:scale-110" />
            {t("nav.schedule")}
          </a>
        </div>

        <div className="lg:hidden ml-auto flex items-center gap-1 shrink-0">
          <SettingsMenu />
          <button
            className="p-2 -mr-2 text-cevons-dark"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && typeof document !== "undefined" && createPortal(
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-[72px] z-[200] bg-white flex flex-col overscroll-contain">
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
            <nav className="flex flex-col gap-0.5" aria-label="Mobile primary">
              {[...nav, ...utilityNav].map((item) => {
                if (item.hasDropdown) {
                  const active = isActive(item.to);
                  return (
                    <div key={item.to} className="flex flex-col">
                      <button
                        onClick={() => setServicesOpen((v) => !v)}
                        className={`flex items-center justify-between px-3 py-3 text-base font-semibold rounded-lg hover:bg-cevons-cream transition-colors border-l-[3px] ${
                          active
                            ? "text-[#EF7700] border-[#EF7700] bg-[#EF7700]/5"
                            : "text-cevons-dark border-transparent"
                        }`}
                        aria-expanded={servicesOpen}
                        aria-current={active ? "page" : undefined}
                      >
                        <span>{t(`nav.${item.key}`)}</span>
                        <ChevronDown
                          className={`size-5 transition-transform duration-200 ${active ? "text-[#EF7700]" : "text-cevons-muted"} ${servicesOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {servicesOpen && (
                        <div className="pl-3 pr-1 pb-2 flex flex-col gap-3">
                          {servicesMenu.map((col) => (
                            <div key={col.groupKey} className="flex flex-col">
                              <span className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cevons-green">
                                {t(`servicesMenu.${col.groupKey}`)}
                              </span>
                              <div className="flex flex-col">
                                {col.items.map((slug) => (
                                  <Link
                                    key={slug}
                                    to={`/services/${slug}`}
                                    className="flex items-center gap-2 px-3 py-2 text-[14px] text-cevons-dark rounded-lg hover:bg-cevons-cream hover:text-cevons-green transition-colors"
                                    onClick={() => { setMobileOpen(false); setServicesOpen(false); }}
                                  >
                                    <ChevronRight className="size-3.5 text-cevons-muted shrink-0" />
                                    {t(`servicesMenu.items.${slug}`)}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="px-3 py-3 text-base font-semibold text-cevons-dark rounded-lg hover:bg-cevons-cream transition-colors"
                    onClick={() => setMobileOpen(false)}
                    activeProps={{ className: "bg-cevons-cream text-cevons-green" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                );
              })}
            </nav>

            <div className="my-4 border-t border-cevons-border" />

            <div className="flex flex-col gap-1 px-1">
              <Link
                to="/request-service"
                className="flex items-center gap-3 px-3 py-3 text-[14px] font-semibold text-cevons-dark rounded-lg hover:bg-cevons-cream transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <Calendar className="size-5 text-cevons-green" />
                {t("nav.requestService")}
              </Link>
              <Link
                to="/track-request"
                className="flex items-center gap-3 px-3 py-3 text-[14px] font-semibold text-cevons-dark rounded-lg hover:bg-cevons-cream transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <PackageSearch className="size-5 text-cevons-green" />
                {t("nav.trackMyRequest")}
              </Link>
            </div>

            <div className="my-4 border-t border-cevons-border" />

            <div className="flex flex-col gap-3 px-1">
              <a href="/request-service" className="btn-base btn-green btn-shine group/sched w-full">
                <Calendar className="size-4 transition-transform duration-300 group-hover/sched:-rotate-6 group-hover/sched:scale-110" />
                {t("nav.scheduleService")}
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
