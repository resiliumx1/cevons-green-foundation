import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/cevons-logo.png";
import { WhatsApp } from "./icons/WhatsApp";

const col = (title: string, items: string[]) => (
  <div>
    <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-5">{title}</h4>
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i}>
          <Link to="/services" className="text-white/75 hover:text-cevons-yellow text-[14px] leading-relaxed transition-colors">
            {i}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export function Footer() {
  return (
    <footer className="bg-cevons-deep-green text-white">
      <div className="container-cevons py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-3 inline-block">
              <img src={logo} alt="CEVON'S Environmental Services" className="h-10 w-auto" />
            </div>
            <p className="mt-5 text-white/75 text-sm leading-relaxed max-w-sm">
              CEVON'S Environmental Services Inc. delivers reliable waste management and
              environmental solutions for homes, businesses, and industries across Guyana.
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

          {col("Services", ["Residential Garbage Collection", "Commercial Garbage Collection", "Skip Bin Rental", "Dumpster Rental", "Portable Toilet Rental", "Septic Tank Clearance"])}
          {col("Categories", ["Residential", "Commercial", "Industrial", "Recycling & Facilities"])}
          {col("Company", ["About Us", "Locations", "Resources", "Contact"])}

          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Get In Touch</h4>
            <a href="/contact" className="flex items-start gap-3 group">
              <span className="shrink-0 size-10 rounded-full bg-cevons-green flex items-center justify-center group-hover:bg-cevons-yellow group-hover:text-cevons-dark transition-colors">
                <WhatsApp className="size-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">Primary</p>
                <p className="text-white font-semibold text-sm">WhatsApp Us</p>
              </div>
            </a>
            <a href="/request-service" className="flex items-start gap-3 mt-4">
              <Phone className="size-4 mt-1 text-cevons-yellow" />
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">Secondary</p>
                <p className="text-white text-sm">Schedule a Service</p>
              </div>
            </a>
            <a href="/contact" className="flex items-start gap-3 mt-3">
              <Mail className="size-4 mt-1 text-cevons-yellow" />
              <div>
                <p className="text-xs uppercase tracking-wider text-white/60">Contact</p>
                <p className="text-white text-sm">Reach out online</p>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="flex items-center gap-2 text-white/75 text-sm">
            <MapPin className="size-4 text-cevons-yellow" />
            Proudly serving Georgetown, Linden & Berbice
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
            <a href="#" className="hover:text-cevons-yellow">Privacy Policy</a>
            <a href="#" className="hover:text-cevons-yellow">Terms of Service</a>
            <a href="#" className="hover:text-cevons-yellow">Sitemap</a>
            <span>© {new Date().getFullYear()} CEVON'S Environmental Services Inc.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
