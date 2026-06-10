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
  Target,
  Home,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SocialProofMarquee } from "@/components/SocialProofMarquee";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { CevonsIcon } from "@/components/CevonsIcon";
import type { CevonsCategoryKey } from "@/data/cevonsIconRegistry";
const heroHomepage = "/assets/heroes/hero-homepage.webp";
import { BrandedImageBadge } from "@/components/brand/BrandedImageBadge";
import { HomeHero } from "@/components/home/HomeHero";
import imgResidential from "@/assets/svc-residential.jpg";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgIndustrial from "@/assets/svc-industrial.jpg";
import imgRecovery from "@/assets/svc-recovery.jpg";
import { NewsletterSignup } from "@/components/NewsletterSignup";

import { localBusinessGraphJsonLd } from "@/lib/seo/jsonLd";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CEVON'S Environmental Services — Reliable Waste Management in Guyana" },
      {
        name: "description",
        content:
          "Premium waste management, recycling and environmental services for homes, businesses and industries across Georgetown, Linden and Berbice.",
      },
      { property: "og:title", content: "CEVON'S Environmental Services" },
      { property: "og:description", content: "Reliable waste management and environmental solutions across Guyana." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: "/assets/heroes/hero-homepage.webp", fetchpriority: "high" },
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

const pillars: { img: string; title: string; iconKey: CevonsCategoryKey; body: string }[] = [
  { img: imgResidential, title: "Residential", iconKey: "residential", body: "Reliable collection and essential services for clean, safe and comfortable homes and communities." },
  { img: imgCommercial, title: "Commercial", iconKey: "commercial", body: "Smart waste solutions for businesses and commercial properties." },
  { img: imgIndustrial, title: "Industrial", iconKey: "industrial", body: "Specialized waste management and industrial environmental services." },
  { img: imgRecovery, title: "Recycling & Facilities", iconKey: "facilities", body: "Turning waste into resources through recycling and facility services." },
];

const stats: { label: string; value: string; icon: typeof ClipboardCheck }[] = [
  { value: "29+", label: "Years leading Guyana's waste industry (Since 1997)", icon: Award },
  { value: "10,000+", label: "Homes & businesses served every day", icon: Home },
  { value: "50,000+", label: "Tonnes of waste managed each year", icon: Recycle },
  { value: "3", label: "Regions served (Georgetown · Linden · Berbice)", icon: MapPin },
];


const steps = [
  { icon: FileText, title: "Request", body: "Send your service request or inquiry." },
  { icon: ClipboardCheck, title: "Confirm", body: "We confirm details and requirements." },
  { icon: Calendar, title: "Schedule", body: "We schedule the best time for you." },
  { icon: Truck, title: "Dispatch", body: "Our team is dispatched." },
  { icon: ShieldCheck, title: "Service", body: "We deliver quality service." },
  { icon: CheckCircle, title: "Complete", body: "Job complete and you're satisfied." },
];

function HeroSwoosh() {
  // Stacked curved brand swooshes at hero bottom: red above yellow, curving up on the right.
  return (
    <svg
      aria-hidden="true"
      className="absolute bottom-0 left-0 w-full h-[80px] md:h-[110px] z-10 pointer-events-none"
      viewBox="0 0 1440 110"
      preserveAspectRatio="none"
    >
      <path d="M0,90 C480,30 980,10 1440,0 L1440,110 L0,110 Z" fill="#FFD200" />
      <path d="M0,70 C520,20 1000,8 1440,-10 L1440,60 C1000,40 520,55 0,90 Z" fill="#E31B23" />
    </svg>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      <HomeHero />


      {/* SOCIAL PROOF MARQUEE */}
      <SocialProofMarquee variant="full" />

      {/* CORE SERVICE PILLARS */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <Reveal variant="up" className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">What We Do</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-cevons-dark">
              Our Core <span className="text-cevons-green">Service</span> Pillars
            </h2>
          </Reveal>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map(({ img, title, body, iconKey }) => (
              <StaggerItem as="article" key={title} className="card-cevons group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={img} alt={title} loading="lazy" className="size-full object-cover transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-cevons-dark/30 to-transparent" />
                </div>
                <div className="relative p-6 pt-12">
                  <span className="absolute -top-8 left-5 h-16 w-16 rounded-2xl bg-[#101820] border-4 border-white overflow-hidden shadow-lift transition-transform duration-300 group-hover:scale-[1.04]">
                    <CevonsIcon group="categories" name={iconKey} fill decorative />
                  </span>
                  <h3 className="text-xl font-bold text-cevons-dark">{title}</h3>
                  <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{body}</p>
                  <a href="/services" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-cevons-green hover:gap-2 transition-all">
                    Explore Services <ArrowRight className="size-4" />
                  </a>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

        </div>
      </section>

      {/* IMPACT STATS BAND */}
      <section className="relative bg-cevons-deep-green overflow-hidden">
        {/* Decorative brand accent behind last stat */}
        <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-[38%] hidden md:block">
          <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="size-full">
            <path d="M40,0 L400,0 L400,200 L0,200 Z" fill="#006B35" />
            <path d="M110,0 L400,0 L400,200 L70,200 Z" fill="#FFD200" />
            <path d="M170,0 L400,0 L400,200 L130,200 Z" fill="#E31B23" />
          </svg>
        </div>
        <div className="container-cevons py-14 md:py-16 relative">
          <ul className="grid grid-cols-2 md:grid-cols-5 gap-8 text-white">
            {stats.map(({ icon: Icon, value, label }) => (
              <li key={label} className="flex items-center gap-4">
                <Icon className="size-7 text-cevons-yellow shrink-0" />
                <div>
                  <p className="text-2xl md:text-3xl font-extrabold leading-tight text-white">
                    {value}
                  </p>
                  <p className="text-xs md:text-sm text-white/80 mt-1.5 font-medium">{label}</p>
                </div>
              </li>
            ))}
            <li className="flex items-center gap-4 relative z-10">
              <Target className="size-7 text-white shrink-0" />
              <div>
                <p className="text-3xl md:text-4xl font-extrabold leading-none text-white">1 Goal</p>
                <p className="text-xs md:text-sm text-white/95 mt-1.5 font-semibold">A Cleaner Guyana</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 6-STEP PROCESS */}
      <section className="section-y bg-cevons-cream">
        <div className="container-cevons">
          <Reveal variant="up" className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-extrabold">
              Our Simple <span className="text-cevons-green">6-Step</span> Process
            </h2>
          </Reveal>

          <Stagger as="ol" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-2 gap-y-10">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <StaggerItem as="li" key={title} className="relative text-center">
                {/* Arrow */}
                {i < steps.length - 1 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden lg:block absolute top-7 -right-3 size-5 text-cevons-green/40"
                  />
                )}
                <div className="mx-auto size-16 rounded-full bg-white border-2 border-cevons-green/30 flex items-center justify-center text-cevons-green shadow-soft">
                  <Icon className="size-7" />
                </div>
                <p className="mt-3 text-[11px] font-bold tracking-wider text-cevons-green uppercase">Step {i + 1}</p>
                <h3 className="text-base font-bold mt-0.5 text-cevons-dark">{title}</h3>
                <p className="text-xs text-cevons-muted mt-1.5 leading-relaxed px-2">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-cevons">
          <div
            id="schedule"
            className="relative overflow-hidden rounded-2xl px-6 py-14 md:px-16 md:py-20 text-center"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, #00713A 0%, #003F27 60%, #002819 100%)",
            }}
          >
            {/* Subtle texture overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative">
              <p className="text-cevons-yellow text-xs font-bold uppercase tracking-[0.22em] mb-4 inline-flex items-center gap-2">
                <Leaf className="size-4" /> Let's Build a Greener Guyana
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-extrabold">Ready to Get Started?</h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Let's keep Guyana clean and our environment healthy together.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/contact" className="btn-base btn-green text-base px-6 py-3.5">
                  <WhatsApp className="size-5" /> WhatsApp Us
                </a>
                <a href="/request-service" className="btn-base btn-yellow text-base px-6 py-3.5">
                  Request a Quote <ArrowRight className="size-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSignup source="home" />
    </SiteLayout>
  );
}
