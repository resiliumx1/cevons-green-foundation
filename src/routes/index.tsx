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
import { Reveal } from "@/components/motion/Reveal";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { LogoCarousel } from "@/components/home/LogoCarousel";
import SocialProofStrip from "@/components/SocialProofStrip";
import { WhatsApp } from "@/components/icons/WhatsApp";
import type { CevonsCategoryKey } from "@/data/cevonsIconRegistry";
import { BrandedImageBadge } from "@/components/brand/BrandedImageBadge";
import { HomeHero } from "@/components/home/HomeHero";
import { PillarsSection } from "@/components/home/PillarsSection";
import { StatsBand } from "@/components/home/StatsBand";
import { HomeSections } from "@/components/page/HomeSections";
import { usePublishedSections } from "@/lib/pageSections";


import { CertificationPanel } from "@/components/home/CertificationPanel";
import { OrangeCTABanner } from "@/components/cta/OrangeCTABanner";
import residentialWheelieBinAsset from "@/assets/residential-wheelie-bin.webp.asset.json";
import heroSlide1Asset from "@/assets/slide-skip-hi-landscape.webp.asset.json";
import svcCommercialAsset from "@/assets/commercial-red-bin-v2.png.asset.json";
import svcIndustrialAsset from "@/assets/cevons-red-truck-industrial.webp.asset.json";
import svcRecoveryAsset from "@/assets/recycling-facility.jpg.asset.json";
const imgResidential = residentialWheelieBinAsset.url;
const imgCommercial = svcCommercialAsset.url;
const imgIndustrial = svcIndustrialAsset.url;
const imgRecovery = svcRecoveryAsset.url;

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
      // Warm the first slideshow frame (LCP) before JS hydrates the carousel.
      { rel: "preload", as: "image", href: heroSlide1Asset.url, type: "image/webp", fetchpriority: "high" },
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
  // CRM-managed sections take over when rows exist for this page. While the
  // query is in flight — and forever, if the table is empty — the hardcoded
  // homepage below renders, exactly like the slideshow fallback.
  const sectionsQuery = usePublishedSections("home");
  const sections = sectionsQuery.data ?? [];

  return (
    <SiteLayout>
      {sections.length > 0 ? <HomeSections sections={sections} /> : <HardcodedHome />}
    </SiteLayout>
  );
}

function HardcodedHome() {
  const t = useT();
  return (
    <>
      <HomeHero />

      {/* Certification panel — EPA / ISO / GCCI / Market Leader */}
      <CertificationPanel />

      {/* SOCIAL PROOF MARQUEE */}
      <LogoCarousel />

      {/* CORE SERVICE PILLARS */}
      <PillarsSection
        eyebrow={t("home.pillars.eyebrow")}
        heading={
          <>
            {t("home.pillars.titleA")}{" "}
            <span className="text-[var(--text-heading)]">{t("home.pillars.titleB")}</span>{" "}
            {t("home.pillars.titleC")}
          </>
        }
        exploreLabel={t("home.pillars.explore")}
        items={pillars.map(({ img, key, iconKey }) => ({
          key,
          img,
          iconKey,
          title: t(`home.pillars.items.${key}.title`),
          body: t(`home.pillars.items.${key}.body`),
        }))}
      />

      {/* IMPACT STATS BAND */}
      <StatsBand
        items={statValues.map(({ value, labelKey, icon }) => ({
          value,
          label: t(`home.stats.${labelKey}`),
          icon,
        }))}
      />

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
    </>
  );
}
