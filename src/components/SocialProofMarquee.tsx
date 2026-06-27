import { Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  Calendar,
  Headset,
  type LucideIcon,
  MapPin,
  MessageCircle,
  Package,
  Recycle,
  ShieldCheck,
  Truck,
} from "lucide-react";

type Item = { label: string; icon?: LucideIcon; img?: string };

const I = (name: string) => `/industry-icons/${name}.webp`;

const trustRow: Item[] = [
  { label: "Since 1997", icon: Calendar },
  { label: "EPA Certified", icon: ShieldCheck },
  { label: "Georgetown", icon: MapPin },
  { label: "Linden", icon: MapPin },
  { label: "Berbice", icon: MapPin },
  { label: "Residential Services", img: I("residential") },
  { label: "Commercial Services", img: I("commercial") },
  { label: "Industrial Services", img: I("industrial") },
  { label: "Facilities & Recovery", icon: Recycle },
  { label: "WhatsApp Support", icon: MessageCircle },
  { label: "Service Requests Online", icon: Headset },
  { label: "Specialist Review Available", icon: BadgeCheck },
];

const industriesRow: Item[] = [
  { label: "Commercial Real Estate", img: I("commercial") },
  { label: "Manufacturing", img: I("industrial") },
  { label: "Industrial Facilities", img: I("industrial") },
  { label: "Healthcare", img: I("healthcare") },
  { label: "Education", img: I("education") },
  { label: "Hotels & Restaurants", img: I("hotels-restaurants") },
  { label: "Hospitality", img: I("hospitality") },
  { label: "Retail & Shopping", img: I("retail-shopping") },
  { label: "Government & Municipal", img: I("government-municipal") },
  { label: "Construction", img: I("construction") },
  { label: "Logistics & Warehousing", img: I("logistics-warehousing") },
  { label: "Residential Communities", img: I("residential") },
  { label: "Recycling & Recovery", icon: Recycle },
  { label: "Environmental Infrastructure", icon: Truck },
];

function Pill({ item }: { item: Item }) {
  const Icon = item.icon;
  return (
    <span className="spm-pill group/pill">
      <span className={`spm-pill-icon${item.img ? " spm-pill-icon-img" : ""}`}>
        {item.img ? (
          <img
            src={item.img}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={24}
            height={24}
            className="spm-pill-img"
          />
        ) : Icon ? (
          <Icon className="size-4" aria-hidden="true" />
        ) : null}
      </span>
      <span className="spm-pill-text">{item.label}</span>
    </span>
  );
}

function Track({
  items,
  direction = "left",
  duration = 45,
}: {
  items: Item[];
  direction?: "left" | "right";
  duration?: number;
}) {

  // Duplicate twice for seamless loop
  const sequence = [...items, ...items];
  return (
    <div className="spm-marquee" role="presentation">
      <div className="spm-fade spm-fade-l" aria-hidden="true" />
      <div className="spm-fade spm-fade-r" aria-hidden="true" />
      <div
        className={`spm-track ${direction === "right" ? "spm-track-reverse" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {sequence.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            aria-hidden={i >= items.length ? "true" : undefined}
          >
            <Pill item={item} iconOnly={iconOnly} />
          </div>
        ))}
      </div>
    </div>
  );
}


function StaticGrid({ items }: { items: Item[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {items.map((item) => (
        <Pill key={item.label} item={item} />
      ))}
    </div>
  );
}

export interface SocialProofMarqueeProps {
  variant?: "full" | "compact";
  showCta?: boolean;
  className?: string;
}

export function SocialProofMarquee({
  variant = "full",
  showCta = true,
  className = "",
}: SocialProofMarqueeProps) {
  const isCompact = variant === "compact";

  return (
    <section
      className={`spm-section ${isCompact ? "spm-section-compact" : ""} ${className}`}
      aria-label="CEVONS trust and industry proof"
    >
      <div className="container-cevons">
        {!isCompact && (
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <p className="spm-eyebrow">
              <span>Trusted Environmental Services</span>
              <span className="spm-eyebrow-dot" aria-hidden="true" />
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--cevons-deep-green,#1A1A1A)] leading-tight">
              Trusted by Homes, Businesses &amp; Industries Across Guyana
            </h2>
            <p className="mt-4 text-[var(--cevons-muted,#64748B)] text-base md:text-lg">
              From residential collection to industrial waste and facility
              operations, CEVONS supports communities and organizations
              across Georgetown, Linden, and Berbice.
            </p>
          </div>
        )}

        {isCompact && (
          <div className="text-center mb-5">
            <p className="spm-eyebrow justify-center">
              <span>Trusted Across Guyana</span>
              <span className="spm-eyebrow-dot" aria-hidden="true" />
            </p>
          </div>
        )}

        {/* Static fallback for reduced motion */}
        <div className="spm-reduced">
          <StaticGrid items={isCompact ? trustRow : trustRow} />
          {!isCompact && (
            <div className="mt-3">
              <StaticGrid items={industriesRow} />
            </div>
          )}
        </div>

        {/* Animated marquee */}
        <div className="spm-motion space-y-3 md:space-y-4">
          <Track items={trustRow} direction="left" duration={45} />
          {!isCompact && (
            <Track items={industriesRow} direction="right" duration={55} />
          )}
        </div>

        {!isCompact && showCta && (
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

export default SocialProofMarquee;
