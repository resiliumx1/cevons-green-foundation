import { Link } from "@tanstack/react-router";
import { Award, Package } from "lucide-react";

type Logo = { src: string; alt: string };

// Interleave partners + certifications into one mixed track
const logos: Logo[] = [
  { src: "/partners/saipem.webp", alt: "Saipem logo — CEVONS partner organisation" },
  { src: "/certifications/epa.webp", alt: "EPA logo — CEVONS environmental certification" },
  { src: "/partners/ramps-logistics.webp", alt: "Ramps Logistics logo — CEVONS partner organisation" },
  { src: "/partners/gysbi.webp", alt: "GYSBI logo — CEVONS partner organisation" },
  { src: "/partners/g-mining.webp", alt: "G Mining Ventures logo — CEVONS partner organisation" },
  { src: "/certifications/iso.webp", alt: "ISO 9001:2015 logo — CEVONS quality management certification" },
  { src: "/partners/baker-hughes.webp", alt: "Baker Hughes logo — CEVONS partner organisation" },
  { src: "/partners/edison-chouest-offshore.webp", alt: "Edison Chouest Offshore logo — CEVONS partner organisation" },
  { src: "/partners/halliburton.jpg", alt: "Halliburton logo — CEVONS partner organisation" },
  { src: "/certifications/gcci.webp", alt: "GCCI logo — CEVONS member organisation" },
  { src: "/partners/agm-inc.jpg", alt: "AGM Inc. logo — CEVONS partner organisation" },
  { src: "/partners/gtt.jpg", alt: "GT&T logo — CEVONS partner organisation" },
  { src: "/partners/british-high-commission.jpg", alt: "British High Commission logo — CEVONS partner organisation" },
  { src: "/partners/us-embassy.jpg", alt: "United States Embassy logo — CEVONS partner organisation" },
  { src: "/certifications/psc.webp", alt: "PSC logo — CEVONS member organisation" },
  { src: "/partners/united-nations.jpg", alt: "United Nations logo — CEVONS partner organisation" },
  { src: "/partners/caricom.jpg", alt: "CARICOM logo — CEVONS partner organisation" },
  { src: "/partners/pegasus-hotel-guyana.jpg", alt: "Pegasus Hotel Guyana logo — CEVONS partner organisation" },
  { src: "/partners/marriott.jpg", alt: "Marriott logo — CEVONS partner organisation" },
  { src: "/partners/kfc.jpg", alt: "KFC logo — CEVONS partner organisation" },
  { src: "/partners/churchs-chicken.jpg", alt: "Church's Chicken logo — CEVONS partner organisation" },
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
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--brand-charcoal)] leading-tight">
            Trusted &amp; Certified Across Guyana
          </h2>
          <p className="mt-4 text-[var(--brand-grey-dark)] text-base md:text-lg">
            Partnering with leading organizations and certified by the standards that matter — from Georgetown to Linden and Berbice.
          </p>
        </div>

        <div className="lcm-marquee" role="presentation">
          <div className="lcm-fade lcm-fade-l" aria-hidden="true" />
          <div className="lcm-fade lcm-fade-r" aria-hidden="true" />
          <div className="lcm-track">
            {/* Real, described logos — the only <img> elements in the marquee. */}
            {logos.map((l) => (
              <div key={`real-${l.alt}`} className="lcm-chip">
                <img
                  src={l.src}
                  alt={l.alt}
                  loading="lazy"
                  decoding="async"
                  className="lcm-logo"
                  data-logo={l.src.split("/").pop()?.replace(/\.[^.]+$/, "")}
                />
              </div>
            ))}
            {/* Seamless-loop clone: painted with CSS background-image so the
                duplicated half adds no extra <img> elements to the DOM. */}
            {logos.map((l) => (
              <div key={`clone-${l.alt}`} className="lcm-chip" aria-hidden="true">
                <span
                  className="lcm-logo-bg"
                  data-logo={l.src.split("/").pop()?.replace(/\.[^.]+$/, "")}
                  style={{ backgroundImage: `url(${l.src})` }}
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
                <stop offset="0%" stopColor="var(--brand-orange)" stopOpacity="0.35" />
                <stop offset="50%" stopColor="var(--brand-orange)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--brand-orange)" stopOpacity="0.35" />
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
              className="btn-base px-5 py-3 text-sm border transition-colors hover:border-[var(--brand-orange)]"
              style={{
                backgroundColor: "#FFFFFF",
                color: "var(--brand-charcoal)",
                borderColor: "rgba(26,26,26,0.25)",
              }}
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
