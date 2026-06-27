const items = [
  {
    logo: "/assets/social-proof/epa-logo.webp",
    title: "EPA Certified",
    subtitle: "Environmental Compliance",
  },
  {
    logo: "/assets/social-proof/iso-logo.webp",
    title: "ISO 9001:2015",
    subtitle: "Quality Management",
  },
  {
    logo: "/assets/social-proof/gcci-logo.webp",
    title: "GCCI Member",
    subtitle: "Private Sector Commission",
  },
];


export default function SocialProofStrip() {
  return (
    <section
      aria-label="Certifications and memberships"
      className="bg-white border-t border-black/[0.06]"
    >
      <div className="container-cevons md:h-[120px] py-6 md:py-0 flex items-center justify-center">
        <ul className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap items-center justify-center gap-4 md:gap-12 w-full">
          {items.map((it, i) => (
            <li
              key={it.title}
              className={[
                "sp-card group flex items-center gap-3 rounded-2xl px-5 py-4 md:px-7 md:h-[90px]",
                "border transition-all duration-[250ms] motion-safe:animate-sp-in",
                it.dark
                  ? "border-white/10 text-white sp-card--dark"
                  : "border-black/[0.08] bg-white/75 backdrop-blur-md text-cevons-deep-green",
              ].join(" ")}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img
                src={it.logo}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-12 w-12 md:h-14 md:w-14 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p
                  className={`text-sm md:text-base font-bold leading-tight ${
                    it.dark ? "text-white" : "text-cevons-deep-green"
                  }`}
                >
                  {it.title}
                </p>
                <p
                  className={`text-[11px] md:text-xs mt-0.5 ${
                    it.dark ? "text-white/80" : "text-black/60"
                  }`}
                >
                  {it.subtitle}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
