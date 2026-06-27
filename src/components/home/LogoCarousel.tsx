import { Link } from "@tanstack/react-router";
import { Award, Package } from "lucide-react";

type Logo = { src: string; alt: string };

// Interleave partners + certifications into one mixed track
const logos: Logo[] = [
  { src: "/partners/saipem.webp", alt: "Saipem" },
  { src: "/certifications/epa.webp", alt: "EPA Certified" },
  { src: "/partners/ramps-logistics.webp", alt: "Ramps Logistics" },
  { src: "/partners/gysbi.webp", alt: "GYSBI" },
  { src: "/certifications/iso.webp", alt: "ISO 9001:2015" },
  { src: "/partners/baker-hughes.webp", alt: "Baker Hughes" },
  { src: "/partners/edison-chouest-offshore.webp", alt: "Edison Chouest Offshore" },
  { src: "/partners/halliburton.jpg", alt: "Halliburton" },
  { src: "/certifications/gcci.webp", alt: "GCCI Member" },
  { src: "/partners/agm-inc.jpg", alt: "AGM Inc." },
  { src: "/partners/gtt.jpg", alt: "GT&T" },
  { src: "/partners/british-high-commission.jpg", alt: "British High Commission" },
  { src: "/partners/us-embassy.jpg", alt: "United States Embassy" },
  { src: "/certifications/psc.webp", alt: "PSC Member" },
  { src: "/partners/united-nations.jpg", alt: "United Nations" },
  { src: "/partners/caricom.jpg", alt: "CARICOM" },
  { src: "/partners/pegasus-hotel-guyana.jpg", alt: "Pegasus Hotel Guyana" },
  { src: "/partners/marriott.jpg", alt: "Marriott" },
  { src: "/partners/kfc.jpg", alt: "KFC" },
  { src: "/partners/churchs-chicken.jpg", alt: "Church's Chicken" },
];

export interface LogoCarouselProps {
  showCta?: boolean;
}

export function LogoCarousel({ showCta = true }: LogoCarouselProps) {
  const sequence = [...logos, ...logos];

  return (
    <section className="lcm-section" aria-label="Trusted partners and certifications">
      <div className="container-cevons">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
          <p className="spm-eyebrow justify-center">
            <span>Trusted Environmental Services</span>
            <span className="spm-eyebrow-dot" aria-hidden="true" />
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--cevons-deep-green,#1A1A1A)] leading-tight">
            Trusted &amp; Certified Across Guyana
          </h2>
          <p className="mt-4 text-[var(--cevons-muted,#64748B)] text-base md:text-lg">
            Partnering with leading organizations and certified by the standards that matter — from Georgetown to Linden and Berbice.
          </p>
        </div>

        <div className="lcm-marquee" role="presentation">
          <div className="lcm-fade lcm-fade-l" aria-hidden="true" />
          <div className="lcm-fade lcm-fade-r" aria-hidden="true" />
          <div className="lcm-track">
            {sequence.map((l, i) => (
              <div
                key={`${l.alt}-${i}`}
                className="lcm-chip"
                aria-hidden={i >= logos.length ? "true" : undefined}
              >
                <img
                  src={l.src}
                  alt={i >= logos.length ? "" : l.alt}
                  loading="lazy"
                  decoding="async"
                  className="lcm-logo"
                  data-logo={l.src.split("/").pop()?.replace(/\.[^.]+$/, "")}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Orange shimmer-wave line */}
        <div className="lcm-shimmer-wrap" aria-hidden="true">
          <svg
            className="lcm-wave"
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lcm-wave-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#EF7700" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#EF7700" stopOpacity="1" />
                <stop offset="100%" stopColor="#EF7700" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path
              d="M0 12 Q 75 2 150 12 T 300 12 T 450 12 T 600 12 T 750 12 T 900 12 T 1050 12 T 1200 12"
              fill="none"
              stroke="url(#lcm-wave-grad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="lcm-shimmer" />
        </div>

        {showCta && (
          <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/request-service" className="btn-base btn-yellow px-5 py-3 text-sm">
              <Award className="size-4" />
              Request a Service
            </Link>
            <Link
              to="/services"
              className="btn-base px-5 py-3 text-sm bg-white text-[var(--cevons-deep-green,#1A1A1A)] border border-[var(--cevons-deep-green,#1A1A1A)]/25 hover:border-[var(--cevons-green,#EF7700)] hover:bg-[var(--cevons-cream,#FBF7EE)] transition-colors"
            >
              <Package className="size-4" />
              View Services
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default LogoCarousel;
