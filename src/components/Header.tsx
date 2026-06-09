import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, ChevronDown, Menu, X } from "lucide-react";
import logo from "@/assets/cevons-logo.png";
import { WhatsApp } from "./icons/WhatsApp";

type NavItem = { to: string; label: string; hasDropdown?: boolean };
const nav: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services", hasDropdown: true },
  { to: "/industries", label: "Industries" },
  { to: "/locations", label: "Locations" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] w-full border-b border-cevons-border transition-shadow ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.04)]" : "bg-white"
      }`}
    >
      <div className="container-cevons flex h-[72px] items-center gap-4">
        {/* Logo (left) */}
        <Link to="/" className="flex items-center shrink-0" aria-label="CEVON'S Environmental Services home">
          <img src={logo} alt="CEVON'S Environmental Services" className="h-10 xl:h-11 w-auto" />
        </Link>

        {/* Nav (center, flex-1) */}
        <nav className="hidden xl:flex items-center justify-center gap-0.5 flex-1 min-w-0" aria-label="Primary">
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
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <a href="/contact" className="btn-base btn-green text-[13.5px] px-3.5 py-2.5 shrink-0">
            <WhatsApp className="size-4" />
            WhatsApp
          </a>
          <a href="/request-service" className="btn-base btn-yellow text-[13.5px] px-3.5 py-2.5 shrink-0">
            <Calendar className="size-4" />
            Schedule
          </a>
        </div>

        {/* Mobile toggle (everything below xl) */}
        <button
          className="xl:hidden ml-auto p-2 -mr-2 text-cevons-dark shrink-0"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="xl:hidden border-t border-cevons-border bg-white">
          <div className="container-cevons py-4 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-3 text-base font-semibold text-cevons-dark rounded-md hover:bg-cevons-cream"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-cevons-border">
              <a href="/contact" className="btn-base btn-green w-full">
                <WhatsApp className="size-4" />
                WhatsApp Us
              </a>
              <a href="/request-service" className="btn-base btn-yellow w-full">
                <Calendar className="size-4" />
                Schedule a Service
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
