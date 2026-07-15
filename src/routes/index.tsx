import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Leaf,
  MapPin,
  Recycle,
  Shield,
  ShieldCheck,
  BadgeCheck,
  Trash2,
  Truck,
  Factory,
  Home,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { LogoCarousel } from "@/components/home/LogoCarousel";
import SocialProofStrip from "@/components/SocialProofStrip";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { CevonsIcon } from "@/components/CevonsIcon";
import type { CevonsCategoryKey } from "@/data/cevonsIconRegistry";
import { BrandedImageBadge } from "@/components/brand/BrandedImageBadge";
import { HomeHero } from "@/components/home/HomeHero";

import { CertificationPanel } from "@/components/home/CertificationPanel";
import { OrangeCTABanner } from "@/components/cta/OrangeCTABanner";
import svcResidentialAsset from "@/assets/svc-residential.png.asset.json";
import svcCommercialAsset from "@/assets/svc-commercial.png.asset.json";
import svcIndustrialAsset from "@/assets/svc-industrial.png.asset.json";
import svcRecoveryAsset from "@/assets/svc-recovery.png.asset.json";
const imgResidential = svcResidentialAsset.url;
const imgCommercial = svcCommercialAsset.url;
const imgIndustrial = svcIndustrialAsset.url;
const imgRecovery = svcRecoveryAsset.url;
import marketLeaderBadge from "@/assets/market-leader-badge.png.asset.json";

import { useT } from "@/contexts/SettingsContext";



import { localBusinessGraphJsonLd } from "@/lib/seo/jsonLd";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CEVONS Environmental Services | Waste Management Guyana" },
      {
        name: "description",
        content:
          "Premium waste management, recycling and environmental services for homes, businesses and industries across Georgetown, Linden and Berbice.",
      },
      { property: "og:title", content: "CEVONS Environmental Services" },
      { property: "og:description", content: "Reliable waste management and environmental solutions across Guyana." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: "/assets/heroes/hero-homepage.webp" },
    ],

    scripts: [
      { type: "application/ld+json", children: JSON.stringify(localBusinessGraphJsonLd()) },
    ],
  }),
  component: HomePage,
});

const trust = [
  { icon: ShieldCheck, t: "EPA Certified", s: "Environmental Compliance" },
  { icon: Award, t: "ISO 9001:2015", s: "Quality Management" },
  { icon: BadgeCheck, t: "GCCI Member", s: "Guyana Chamber" },
  { icon: BadgeCheck, t: "PSC Member", s: "Private Sector Commission" },
  { icon: ShieldCheck, t: "Market Leader", s: "Since 1997" },
];

type PillarKey = "residential" | "commercial" | "industrial" | "facilities";
const pillars: { img: string; key: PillarKey; iconKey: CevonsCategoryKey }[] = [
  { img: imgResidential, key: "residential", iconKey: "residential" },
  { img: imgCommercial, key: "commercial", iconKey: "commercial" },
  { img: imgIndustrial, key: "industrial", iconKey: "industrial" },
  { img: imgRecovery, key: "facilities", iconKey: "facilities" },
];

const statValues = [
  { value: "29+", labelKey: "yearsLabel", icon: Award },
  { value: "10,000+", labelKey: "homesLabel", icon: Home },
  { value: "200,000+", labelKey: "tonnesLabel", icon: Recycle },
  { value: "10", labelKey: "regionsLabel", icon: MapPin },
];

type StepKey = "request" | "confirm" | "schedule" | "dispatch" | "service" | "complete";
const steps: { icon: typeof FileText; key: StepKey }[] = [
  { icon: FileText, key: "request" },
  { icon: ClipboardCheck, key: "confirm" },
  { icon: Calendar, key: "schedule" },
  { icon: Truck, key: "dispatch" },
  { icon: ShieldCheck, key: "service" },
  { icon: CheckCircle, key: "complete" },
];



function HomePage() {
  const t = useT();
  return (
    <SiteLayout>
      <HomeHero />

      {/* Certification panel — EPA / ISO / GCCI / Market Leader */}
      <CertificationPanel />

      {/* SOCIAL PROOF MARQUEE */}
      <LogoCarousel />

      {/* CORE SERVICE PILLARS */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <Reveal variant="up" className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3">{t("home.pillars.eyebrow")}</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-cevons-dark">
              {t("home.pillars.titleA")} <span className="text-[var(--text-heading)]">{t("home.pillars.titleB")}</span> {t("home.pillars.titleC")}
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pillars.map(({ img, key, iconKey }) => {
              const title = t(`home.pillars.items.${key}.title`);
              const body = t(`home.pillars.items.${key}.body`);
              return (
                <StaggerItem as="article" key={key} className="card-cevons group flex flex-col h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={img} alt={`${title} waste management services in Guyana`} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cevons-dark/30 to-transparent" />
                  </div>
                  <div className="relative p-6 pt-12 flex flex-col flex-1">
                    <span className="icon-tile absolute -top-8 left-5 h-16 w-16 rounded-2xl overflow-hidden">
                      <CevonsIcon group="categories" name={iconKey} fill decorative />
                    </span>
                    <h3 className="text-xl font-bold text-cevons-dark min-h-[2rem]">{title}</h3>
                    <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{body}</p>
                    <div className="mt-auto pt-6">
                      <a
                        href="/services"
                        className="group/cta inline-flex items-center justify-center gap-1.5 rounded-full border border-cevons-green/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-link)] transition-all duration-300 hover:border-cevons-green hover:bg-cevons-green hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgba(0,107,53,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cevons-green focus-visible:ring-offset-2"
                      >
                        {t("home.pillars.explore")}
                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                      </a>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

        </div>
      </section>

      {/* IMPACT STATS BAND */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "var(--surface-dark-alt)" }}
      >
        {/* 3px orange top rule — delineates the band in both modes */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: "var(--brand-orange)" }} />
        <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-[38%] hidden md:block">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="size-full">
            <path d="M40,0 L400,0 L400,200 L0,200 Z" fill="var(--brand-orange)" />
            <path d="M110,0 L400,0 L400,200 L70,200 Z" fill="var(--brand-orange-dark)" />
            <path d="M170,0 L400,0 L400,200 L130,200 Z" fill="var(--brand-yellow)" opacity="0.28" />
          </svg>
        </div>
        <div className="container-cevons py-14 md:py-16 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white w-full lg:w-auto">
              {statValues.map(({ icon: Icon, value, labelKey }) => {
                const label = t(`home.stats.${labelKey}`);
                return (
                  <li key={labelKey} className="flex items-center gap-4">
                    <Icon className="size-7 text-white shrink-0" />
                    <div>
                      <p className="text-2xl md:text-3xl font-extrabold leading-tight text-white">{value}</p>
                      <p className="text-xs md:text-sm text-white/80 mt-1.5 font-medium">{label}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="relative z-10 flex-shrink-0 w-full flex justify-center lg:w-auto">
              <img
                src={marketLeaderBadge.url}
                alt="Market Leader - Trusted Since 1997"
                className="h-auto w-[280px] md:w-[320px] rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <SocialProofStrip />

      {/* 6-STEP PROCESS */}
      <section className="section-y bg-cevons-cream">
        <div className="container-cevons">
          <Reveal variant="up" className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3">{t("home.process.eyebrow")}</p>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              {t("home.process.titleA")} <span className="text-[var(--text-heading)]">{t("home.process.titleB")}</span> {t("home.process.titleC")}
            </h2>
          </Reveal>

          <ProcessSteps
            steps={steps.map(({ icon, key }, i) => ({
              icon,
              key,
              step: t("home.process.step"),
              index: i + 1,
              title: t(`home.process.items.${key}.title`),
              body: t(`home.process.items.${key}.body`),
            }))}
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <div id="schedule">
        <OrangeCTABanner
          icon={Leaf}
          eyebrow={t("home.cta.eyebrow")}
          title={t("home.cta.title")}
          subtitle={t("home.cta.lead")}
        >
          <a href="/request-service" className="cta-btn-primary">
            {t("home.cta.quote")} <ArrowRight className="size-5" />
          </a>
          <a href="/contact" className="cta-btn-wa">
            <WhatsApp className="size-5" /> {t("home.cta.whatsapp")}
          </a>
        </OrangeCTABanner>
      </div>

    </SiteLayout>
  );

}

