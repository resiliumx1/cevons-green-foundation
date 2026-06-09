import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, ClipboardCheck, Factory, FileText, Leaf, MapPin, Recycle, ShieldCheck, Truck, Users } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WhatsApp } from "@/components/icons/WhatsApp";
import heroTruck from "@/assets/hero-truck.jpg";
import imgResidential from "@/assets/svc-residential.jpg";
import imgCommercial from "@/assets/svc-commercial.jpg";
import imgIndustrial from "@/assets/svc-industrial.jpg";
import imgRecovery from "@/assets/svc-recovery.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CEVON'S Environmental Services — Reliable Waste Management in Guyana" },
      { name: "description", content: "Premium waste management, recycling and environmental services for homes, businesses and industries across Georgetown, Linden and Berbice." },
      { property: "og:title", content: "CEVON'S Environmental Services" },
      { property: "og:description", content: "Reliable waste management and environmental solutions across Guyana." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const pillars = [
  { img: imgResidential, title: "Residential", body: "Reliable collection services for clean, safe and comfortable homes and communities." },
  { img: imgCommercial, title: "Commercial", body: "Smart waste solutions for businesses and commercial properties." },
  { img: imgIndustrial, title: "Industrial", body: "Specialized waste management and industrial services." },
  { img: imgRecovery, title: "Facilities & Recovery", body: "Turning waste into resources through recycling and recovery." },
];

const stats = [
  { value: "25+", label: "Years of Service" },
  { value: "50K+", label: "Satisfied Customers" },
  { value: "120+", label: "Fleet & Equipment" },
  { value: "3", label: "Regions Served" },
];

const steps = [
  { icon: FileText, title: "Request", body: "Send your service request or inquiry." },
  { icon: ClipboardCheck, title: "Confirm", body: "We confirm details and requirements." },
  { icon: MapPin, title: "Schedule", body: "We schedule the best time for you." },
  { icon: Truck, title: "Dispatch", body: "Our team is dispatched." },
  { icon: Recycle, title: "Service", body: "We deliver quality service." },
  { icon: CheckCircle, title: "Complete", body: "Job complete and you're satisfied." },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroTruck} alt="CEVON'S waste collection truck and crew at sunrise" className="size-full object-cover hero-img" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-cevons-deep-green/85 via-cevons-deep-green/60 to-transparent" />
        </div>
        <div className="container-cevons relative py-24 md:py-36 lg:py-44">
          <div className="max-w-2xl reveal">
            <p className="text-cevons-yellow text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-5">
              <Leaf className="inline size-4 mr-1" /> Environmental Services Inc.
            </p>
            <h1 className="text-white text-[34px] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight">
              Environmental<br />Solutions.<br />
              <span className="text-cevons-yellow">Cleaner Tomorrow.</span>
            </h1>
            <p className="mt-6 text-white/85 text-base md:text-lg max-w-xl">
              Reliable waste management and environmental services for homes, businesses
              and industries across Guyana.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://wa.me/5926252366" className="btn-base btn-green text-base px-6 py-3.5">
                <WhatsApp className="size-5" />
                WhatsApp Us
              </a>
              <a href="#schedule" className="btn-base btn-yellow text-base px-6 py-3.5">
                Schedule a Service
                <ArrowRight className="size-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="brand-ribbon" aria-hidden="true" />
      </section>

      {/* Trust row */}
      <section className="border-b border-cevons-border">
        <div className="container-cevons py-8">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: MapPin, t: "Serving", s: "Georgetown, Linden & Berbice" },
              { icon: ShieldCheck, t: "EPA", s: "Certified" },
              { icon: FileText, t: "Since", s: "1997" },
              { icon: Leaf, t: "Environment", s: "Focused" },
            ].map(({ icon: Icon, t, s }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="size-10 rounded-full bg-cevons-green/10 text-cevons-green flex items-center justify-center">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-cevons-muted font-semibold">{t}</p>
                  <p className="text-sm text-cevons-dark font-semibold">{s}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Service pillars */}
      <section className="section-y bg-white">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-cevons-dark">
              Our Core <span className="text-cevons-green">Service</span> Pillars
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <article key={p.title} className="card-cevons group reveal" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.img} alt={p.title} loading="lazy" className="size-full object-cover transition-transform duration-500" />
                  <span className="absolute bottom-3 left-3 size-10 rounded-full bg-cevons-green text-white flex items-center justify-center shadow-soft">
                    <Leaf className="size-5" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-cevons-dark">{p.title}</h3>
                  <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{p.body}</p>
                  <a href="/services" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all">
                    Explore Services <ArrowRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative bg-cevons-deep-green overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cevons-green/80 [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] hidden md:block" />
        <div className="absolute right-0 top-0 bottom-0 w-[8%] bg-cevons-yellow [clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)] hidden md:block" />
        <div className="absolute right-0 top-0 bottom-0 w-[3%] bg-cevons-red [clip-path:polygon(60%_0,100%_0,100%_100%,0_100%)] hidden md:block" />
        <div className="container-cevons py-12 md:py-14 relative">
          <ul className="grid grid-cols-2 md:grid-cols-5 gap-8 text-white">
            {stats.map((s) => (
              <li key={s.label} className="flex items-center gap-4">
                {s.label === "Years of Service" && <FileText className="size-7 text-cevons-yellow shrink-0" />}
                {s.label === "Satisfied Customers" && <Users className="size-7 text-cevons-yellow shrink-0" />}
                {s.label === "Fleet & Equipment" && <Truck className="size-7 text-cevons-yellow shrink-0" />}
                {s.label === "Regions Served" && <MapPin className="size-7 text-cevons-yellow shrink-0" />}
                <div>
                  <p className="text-3xl md:text-4xl font-extrabold leading-none">{s.value}</p>
                  <p className="text-xs md:text-sm text-white/75 mt-1">{s.label}</p>
                </div>
              </li>
            ))}
            <li className="hidden md:flex items-center gap-4 relative z-10">
              <CheckCircle className="size-7 text-white shrink-0" />
              <div>
                <p className="text-3xl md:text-4xl font-extrabold leading-none">1 Goal</p>
                <p className="text-xs md:text-sm text-white/90 mt-1">A Cleaner Guyana</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 6-step process */}
      <section className="section-y bg-cevons-cream">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold">
              Our Simple <span className="text-cevons-green">6-Step</span> Process
            </h2>
          </div>
          <ol className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative text-center">
                <div className="mx-auto size-16 rounded-full bg-white border border-cevons-border flex items-center justify-center text-cevons-green shadow-soft">
                  <Icon className="size-7" />
                </div>
                <p className="mt-1 text-xs font-bold text-cevons-green">STEP {i + 1}</p>
                <h3 className="text-base font-bold mt-1">{title}</h3>
                <p className="text-xs text-cevons-muted mt-1.5 leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA banner */}
      <section id="schedule" className="bg-cevons-deep-green relative overflow-hidden">
        <div className="container-cevons py-16 md:py-20 text-center">
          <h2 className="text-white text-3xl md:text-5xl font-extrabold">Ready to Get Started?</h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            Let's keep Guyana clean and our environment healthy together.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <a href="https://wa.me/5926252366" className="btn-base btn-green text-base px-6 py-3.5">
              <WhatsApp className="size-5" /> WhatsApp Us
            </a>
            <a href="#quote" className="btn-base btn-yellow text-base px-6 py-3.5">
              Request a Quote <ArrowRight className="size-5" />
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
