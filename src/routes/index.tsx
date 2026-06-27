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
import { LogoCarousel } from "@/components/home/LogoCarousel";
import SocialProofStrip from "@/components/SocialProofStrip";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { CevonsIcon } from "@/components/CevonsIcon";
import type { CevonsCategoryKey } from "@/data/cevonsIconRegistry";
import { BrandedImageBadge } from "@/components/brand/BrandedImageBadge";
import { HomeHero } from "@/components/home/HomeHero";

import { CertificationPanel } from "@/components/home/CertificationPanel";
import imgResidential from "@/assets/svc-residential.jpg";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgIndustrial from "@/assets/svc-industrial.jpg";
import imgRecovery from "@/assets/svc-recovery.jpg";
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">{t("home.pillars.eyebrow")}</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-cevons-dark">
              {t("home.pillars.titleA")} <span className="text-cevons-green">{t("home.pillars.titleB")}</span> {t("home.pillars.titleC")}
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ img, key, iconKey }) => {
              const title = t(`home.pillars.items.${key}.title`);
              const body = t(`home.pillars.items.${key}.body`);
              return (
                <StaggerItem as="article" key={key} className="card-cevons group">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={img} alt={`${title} waste management services in Guyana`} loading="lazy" className="size-full object-cover transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-cevons-dark/30 to-transparent" />
                  </div>
                  <div className="relative p-6 pt-12">
                    <span className="absolute -top-8 left-5 h-16 w-16 rounded-2xl bg-[#101820] border-4 border-white overflow-hidden shadow-lift transition-transform duration-300 group-hover:scale-[1.04]">
                      <CevonsIcon group="categories" name={iconKey} fill decorative />
                    </span>
                    <h3 className="text-xl font-bold text-cevons-dark">{title}</h3>
                    <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{body}</p>
                    <a href="/services" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-cevons-green hover:gap-2 transition-all">
                      {t("home.pillars.explore")} <ArrowRight className="size-4" />
                    </a>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* IMPACT STATS BAND */}
      <section className="relative bg-cevons-deep-green overflow-hidden">
        <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-[38%] hidden md:block">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="size-full">
            <path d="M40,0 L400,0 L400,200 L0,200 Z" fill="#EF7700" />
            <path d="M110,0 L400,0 L400,200 L70,200 Z" fill="#C45F00" />
            <path d="M170,0 L400,0 L400,200 L130,200 Z" fill="#1A1A1A" />
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">{t("home.process.eyebrow")}</p>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              {t("home.process.titleA")} <span className="text-cevons-green">{t("home.process.titleB")}</span> {t("home.process.titleC")}
            </h2>
          </Reveal>

          <Stagger as="ol" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-2 gap-y-10">
            {steps.map(({ icon: Icon, key }, i) => {
              const title = t(`home.process.items.${key}.title`);
              const body = t(`home.process.items.${key}.body`);
              return (
                <StaggerItem as="li" key={key} className="relative text-center">
                  {i < steps.length - 1 && (
                    <ArrowRight aria-hidden="true" className="hidden lg:block absolute top-7 -right-3 size-5 text-cevons-green/40" />
                  )}
                  <div className="mx-auto size-16 rounded-full bg-white border-2 border-cevons-green/30 flex items-center justify-center text-cevons-green shadow-soft">
                    <Icon className="size-7" />
                  </div>
                  <p className="mt-3 text-[11px] font-bold tracking-wider text-cevons-green uppercase">{t("home.process.step")} {i + 1}</p>
                  <h3 className="text-base font-bold mt-0.5 text-cevons-dark">{title}</h3>
                  <p className="text-xs text-cevons-muted mt-1.5 leading-relaxed px-2">{body}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white dark:bg-[#0b0b0b] py-14 md:py-20">
        <div className="container-cevons">
          <div
            id="schedule"
            className="relative overflow-hidden rounded-[28px] px-6 py-14 md:px-16 md:py-20 text-center shadow-[0_30px_60px_-25px_rgba(239,119,0,0.55)] ring-1 ring-black/5"
            style={{
              background:
                "linear-gradient(120deg, #C45F00 0%, #EF7700 45%, #FF8A2A 100%)",
            }}
          >
            {/* Dot texture */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
            {/* Decorative curved swooshes */}
            <svg
              aria-hidden
              className="absolute inset-0 size-full opacity-30 pointer-events-none"
              viewBox="0 0 1200 360"
              preserveAspectRatio="none"
            >
              <path d="M-50,260 C300,180 700,340 1300,160" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" />
              <path d="M-50,300 C350,220 750,380 1300,200" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
            </svg>
            {/* Soft corner glows */}
            <div aria-hidden className="absolute -left-32 top-1/3 size-[420px] rounded-full pointer-events-none"
                 style={{ background: "radial-gradient(circle, rgba(255,210,0,0.25) 0%, transparent 65%)" }} />
            <div aria-hidden className="absolute -right-24 -top-24 size-[420px] rounded-full pointer-events-none"
                 style={{ background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%)" }} />

            <div className="relative">
              {/* Eyebrow with flanking lines */}
              <div className="mx-auto mb-6 flex items-center justify-center gap-4 max-w-2xl">
                <span aria-hidden className="hidden sm:block h-px flex-1 bg-white/50 max-w-[80px]" />
                <p className="text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em]">
                  {t("home.cta.eyebrow")}
                </p>
                <span aria-hidden className="hidden sm:block h-px flex-1 bg-white/50 max-w-[80px]" />
              </div>

              <h2 className="font-display text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
                {t("home.cta.title")}
              </h2>
              <p className="mt-5 md:mt-6 text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {t("home.cta.lead")}
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-xl bg-[#2DA339] text-white font-bold text-base hover:bg-[#258A30] hover:-translate-y-0.5 transition shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
                >
                  <WhatsApp className="size-5" /> {t("home.cta.whatsapp")}
                </a>
                <a
                  href="/request-service"
                  className="inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-xl bg-white text-[#EF7700] font-bold text-base hover:bg-white/95 hover:-translate-y-0.5 transition shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
                >
                  {t("home.cta.quote")} <ArrowRight className="size-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </SiteLayout>
  );

}

