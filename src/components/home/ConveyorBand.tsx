const partners = [
  { src: "/partners/saipem.webp", alt: "Saipem" },
  { src: "/partners/ramps-logistics.webp", alt: "Ramps Logistics" },
  { src: "/partners/gysbi.webp", alt: "GYSBI" },
  { src: "/partners/baker-hughes.webp", alt: "Baker Hughes" },
  { src: "/partners/edison-chouest-offshore.webp", alt: "Edison Chouest Offshore" },
  { src: "/partners/halliburton.jpg", alt: "Halliburton" },
  { src: "/partners/agm-inc.jpg", alt: "AGM Inc." },
  { src: "/partners/gtt.jpg", alt: "GT&T" },
  { src: "/partners/british-high-commission.jpg", alt: "British High Commission" },
  { src: "/partners/us-embassy.jpg", alt: "United States Embassy" },
  { src: "/partners/united-nations.jpg", alt: "United Nations" },
  { src: "/partners/caricom.jpg", alt: "CARICOM" },
  { src: "/partners/pegasus-hotel-guyana.jpg", alt: "Pegasus Hotel Guyana" },
  { src: "/partners/marriott.jpg", alt: "Marriott" },
  { src: "/partners/kfc.jpg", alt: "KFC" },
  { src: "/partners/churchs-chicken.jpg", alt: "Church's Chicken" },
];

const services = [
  { src: "/services/svc-residential.webp", label: "Residential", href: "/services#residential" },
  { src: "/services/svc-commercial.webp", label: "Commercial", href: "/services#commercial" },
  { src: "/services/svc-industrial.webp", label: "Industrial", href: "/services#industrial" },
  { src: "/services/svc-recycling.webp", label: "Recyclables", href: "/services#recycling" },
];

type ConveyorBandProps = {
  variant?: "default" | "embedded" | "hero-bottom";
};

export function ConveyorBand({ variant = "default" }: ConveyorBandProps) {
  const variantClass =
    variant === "embedded"
      ? "conveyor--embedded"
      : variant === "hero-bottom"
        ? "conveyor--hero-bottom"
        : "";
  return (
    <section
      aria-label="Trusted clients and services"
      className={`conveyor relative z-[5] w-full ${variantClass}`}
    >

      {/* BAND 1 — Partner logos on orange */}
      <div className="conveyor-band conveyor-band--orange">
        <div className="conveyor-band__inner">
          <p className="conveyor-eyebrow conveyor-eyebrow--dark">
            Trusted by leading organisations across Guyana
          </p>
          <div className="conveyor-marquee" data-pause-on-hover>
            <div className="conveyor-track conveyor-track--left">
              {[...partners, ...partners].map((p, i) => (
                <div className="conveyor-chip" key={`p-${i}`}>
                  <img src={p.src} alt={p.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BAND 2 — Service photos on charcoal */}
      <div className="conveyor-band conveyor-band--charcoal">
        <div className="conveyor-band__inner">
          <p className="conveyor-eyebrow conveyor-eyebrow--yellow">Our services</p>
          <div className="conveyor-marquee" data-pause-on-hover>
            <div className="conveyor-track conveyor-track--right">
              {[...services, ...services, ...services, ...services].map((s, i) => (
                <a className="conveyor-tile" href={s.href} key={`s-${i}`}>
                  <img src={s.src} alt={s.label} loading="lazy" />
                  <span className="conveyor-tile__caption">{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConveyorBand;
