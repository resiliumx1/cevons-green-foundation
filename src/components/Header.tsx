import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, ChevronRight, Menu, PackageSearch, X } from "lucide-react";
import logo from "@/assets/cevons-logo-transparent.png";
import { CurrencyToggle } from "./CurrencyToggle";

type NavItem = { to: string; label: string; hasDropdown?: boolean };
const nav: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services", hasDropdown: true },
  { to: "/industries", label: "Industries" },
  { to: "/locations", label: "Locations" },
  { to: "/resources", label: "Resources" },
  { to: "/newsroom", label: "Newsroom" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Secondary nav items — surfaced on mobile menu + as utility CTAs on desktop, not in primary desktop strip
const utilityNav: NavItem[] = [
  { to: "/track-request", label: "Track Request" },
];

const servicesMenu: { group: string; items: { label: string; to: string }[] }[] = [
  {
    group: "Residential",
    items: [
      { label: "General Trash Collection", to: "/services/general-trash-collection" },
      { label: "Dumpster Rental", to: "/services/dumpster-rental" },
      { label: "Septic Services", to: "/services/septic-services" },
      { label: "Portable Toilet", to: "/services/portable-toilet" },
    ],
  },
  {
    group: "Commercial",
    items: [
      { label: "General Waste Management", to: "/services/general-waste-management" },
      { label: "Skip Bin & Dumpster Rental", to: "/services/skip-bin-dumpster-rental" },
      { label: "Portable Toilet", to: "/services/portable-toilet" },
      { label: "Grease Trap / Septic Tank", to: "/services/grease-trap-septic-tank" },
      { label: "Document Shredding", to: "/services/document-shredding" },
    ],
  },
  {
    group: "Industrial",
    items: [
      { label: "Hazardous Waste", to: "/services/hazardous-waste" },
      { label: "Wastewater", to: "/services/wastewater" },
      { label: "Used Waste Oil", to: "/services/used-waste-oil" },
      { label: "Contaminated Soil", to: "/services/contaminated-soil" },
      { label: "Tank Cleaning", to: "/services/tank-cleaning" },
      { label: "Product Destruction", to: "/services/product-destruction" },
      { label: "Biohazardous Disposal", to: "/services/biohazardous-disposal" },
    ],
  },
  {
    group: "Facilities",
    items: [
      { label: "Material Recovery Facility", to: "/services/material-recovery-facility" },
      { label: "Landfill Operations", to: "/services/landfill-operations" },
    ],
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
        {/* Logo lockup (left) */}
        <Link
          to="/"
          className={`flex items-center shrink-0 group gap-2.5 transition-opacity duration-300 ${
            scrolled ? "opacity-90" : "opacity-100"
          }`}
          aria-label="CEVON'S Environmental Services home"
        >
          <span className="relative inline-flex items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 -m-3 rounded-full bg-[radial-gradient(closest-side,rgba(0,107,53,0.10),transparent_72%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <img
              src={logo}
              alt="CEVON'S Environmental Services"
              className="relative h-12 lg:h-14 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
              style={{ filter: "drop-shadow(0 1px 1px rgba(16,24,32,0.08))" }}
            />
          </span>
          <span className="flex flex-col justify-center leading-none">
            <span
              className="text-[17px] lg:text-[19px] font-extrabold tracking-tight text-cevons-dark"
              style={{ fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif" }}
            >
              CEVON&rsquo;S
            </span>
            <span className="hidden md:block mt-0.5 text-[9px] lg:text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cevons-muted">
              Environmental Services Inc.
            </span>
          </span>
        </Link>


        {/* Nav (center, flex-1) */}
        <nav className="hidden lg:flex items-center justify-center gap-0.5 flex-1 min-w-0" aria-label="Primary">
          {nav.map((item) => (
            <div key={item.to} className="relative group">
              <Link
                to={item.to}
                className="px-2.5 py-2 text-[13.5px] font-semibold text-cevons-dark hover:text-cevons-green transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                activeProps={{ className: "text-cevons-green" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="size-3.5" />}
              </Link>
              {item.hasDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="bg-white rounded-xl border border-cevons-border shadow-[0_20px_40px_rgba(16,24,32,0.12)] p-5 grid grid-cols-4 gap-x-6 gap-y-2 min-w-[820px]">
                    {servicesMenu.map((col) => (
                      <div key={col.group}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cevons-green mb-2">{col.group}</p>
                        <ul className="space-y-1">
                          {col.items.map((s) => (
                            <li key={col.group + s.label}>
                              <Link
                                to={s.to}
                                className="block px-2 py-1.5 -mx-2 text-[13px] text-cevons-dark hover:bg-cevons-cream hover:text-cevons-green rounded-md transition-colors"
                              >
                                {s.label}
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
          ))}
        </nav>

        {/* CTAs (right) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <CurrencyToggle />
          <a href="/contact" className="btn-base btn-green text-[13.5px] px-3.5 py-2.5 shrink-0">
            <WhatsApp className="size-4" />
            WhatsApp
          </a>
          <a href="/request-service" className="btn-base btn-yellow btn-shine group/sched text-[13.5px] px-3.5 py-2.5 shrink-0">
            <Calendar className="size-4 transition-transform duration-300 group-hover/sched:-rotate-6 group-hover/sched:scale-110" />
            Schedule
          </a>
        </div>

        {/* Mobile toggle (everything below xl) */}
        <button
          className="lg:hidden ml-auto p-2 -mr-2 text-cevons-dark shrink-0"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu overlay — portaled to body so the sticky header's backdrop-filter
          containing block doesn't trap `position: fixed` (which made the menu vanish on scroll). */}
      {mobileOpen && typeof document !== "undefined" && createPortal(
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-[72px] z-[200] bg-white flex flex-col overscroll-contain">
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-8" style={{ WebkitOverflowScrolling: "touch" }}>
            {/* Main nav */}
            <nav className="flex flex-col gap-0.5" aria-label="Mobile primary">
              {[...nav, ...utilityNav].map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div key={item.to} className="flex flex-col">
                      <button
                        onClick={() => setServicesOpen((v) => !v)}
                        className="flex items-center justify-between px-3 py-3 text-base font-semibold text-cevons-dark rounded-lg hover:bg-cevons-cream transition-colors"
                        aria-expanded={servicesOpen}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`size-5 text-cevons-muted transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {servicesOpen && (
                        <div className="pl-3 pr-1 pb-2 flex flex-col gap-3">
                          {servicesMenu.map((col) => (
                            <div key={col.group} className="flex flex-col">
                              <span className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cevons-green">
                                {col.group}
                              </span>
                              <div className="flex flex-col">
                                {col.items.map((s) => (
                                  <Link
                                    key={s.to}
                                    to={s.to}
                                    className="flex items-center gap-2 px-3 py-2 text-[14px] text-cevons-dark rounded-lg hover:bg-cevons-cream hover:text-cevons-green transition-colors"
                                    onClick={() => { setMobileOpen(false); setServicesOpen(false); }}
                                  >
                                    <ChevronRight className="size-3.5 text-cevons-muted shrink-0" />
                                    {s.label}
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
                    {item.label}
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
                Request a Service
              </Link>
              <Link
                to="/track-request"
                className="flex items-center gap-3 px-3 py-3 text-[14px] font-semibold text-cevons-dark rounded-lg hover:bg-cevons-cream transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <PackageSearch className="size-5 text-cevons-green" />
                Track My Request
              </Link>
            </div>

            <div className="my-4 border-t border-cevons-border" />

            <div className="flex flex-col gap-3 px-1">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cevons-muted">Currency</span>
                <CurrencyToggle />
              </div>
              <a href="/contact" className="btn-base btn-green w-full">
                <WhatsApp className="size-4" />
                WhatsApp Us
              </a>
              <a href="/request-service" className="btn-base btn-yellow btn-shine group/sched w-full">
                <Calendar className="size-4 transition-transform duration-300 group-hover/sched:-rotate-6 group-hover/sched:scale-110" />
                Schedule a Service
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
