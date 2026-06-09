import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Container,
  Factory,
  FileText,
  Hammer,
  Home,
  Leaf,
  MessageCircle,
  Recycle,
  Trash2,
  Truck,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { WhatsApp } from "@/components/icons/WhatsApp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "@/assets/cevons-logo.png";
import imgHero from "@/assets/svc-dumpster.jpg";
import imgRel0 from "@/assets/svc-dumpster.jpg";
import imgRel1 from "@/assets/svc-dumpster.jpg";
import imgRel2 from "@/assets/svc-dumpster.jpg";

const PAGE_TITLE = "Dumpster Rental in Guyana | CEVON'S Environmental Services";
const PAGE_DESC =
  "Request dumpster rental services from CEVON'S for construction, commercial, residential, and cleanup projects across Georgetown, Linden, and Berbice.";

export const Route = createFileRoute("/services/dumpster-rental")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/services/dumpster-rental" },
    ],
    links: [{ rel: "canonical", href: "/services/dumpster-rental" }],
  }),
  component: DumpsterRentalPage,
});

const benefits = [
  "Multiple sizes available",
  "Short and long-term rental",
  "Timely delivery and pickup",
  "Competitive pricing",
  "Proper waste disposal",
];

const sizes = [
  { size: "6 Yard", use: "Best for small cleanups" },
  { size: "10 Yard", use: "Best for home renovations" },
  { size: "15 Yard", use: "Best for medium projects" },
  { size: "20 Yard", use: "Best for construction debris" },
  { size: "30 Yard", use: "Best for large commercial jobs" },
  { size: "40 Yard", use: "Best for major site cleanups" },
];

const uses = [
  { icon: Hammer, title: "Construction Sites" },
  { icon: Home, title: "Home Renovations" },
  { icon: Hammer, title: "Roofing Projects" },
  { icon: Leaf, title: "Yard Cleanups" },
  { icon: Building2, title: "Commercial Properties" },
  { icon: Factory, title: "Industrial Waste" },
];

const steps = [
  { icon: MessageCircle, title: "Tell us what you need", body: "Send your project details by WhatsApp or quote request." },
  { icon: ClipboardCheck, title: "Confirm size and location", body: "We'll help you choose the right size for your job." },
  { icon: Calendar, title: "Schedule delivery", body: "We deliver the dumpster on the day that works for you." },
  { icon: Truck, title: "Pickup and disposal", body: "We collect the dumpster and dispose of waste responsibly." },
];

const faqs = [
  {
    q: "What size dumpster do I need?",
    a: "It depends on your project. Smaller cleanups and single rooms often fit a 6 or 10 yard dumpster, full home renovations typically need 15–20 yard, and construction or large commercial jobs usually call for 30 or 40 yard. Our team can recommend the right size based on what you're disposing of.",
  },
  {
    q: "How long can I keep the dumpster?",
    a: "Both short-term and long-term rentals are available. Let us know your timeline when you request service and we'll arrange a rental period that fits your project.",
  },
  {
    q: "What types of waste can I place in a dumpster?",
    a: "General construction debris, household waste, renovation material, yard waste and commercial waste are typically accepted. Hazardous materials, liquid waste, and certain regulated items must be handled separately — please confirm with our team before disposal.",
  },
  {
    q: "Do you deliver to Georgetown, Linden, and Berbice?",
    a: "Yes. CEVON'S serves Georgetown, Linden, and Berbice, with coverage across Guyana. Reach out to confirm delivery to your specific location.",
  },
  {
    q: "Can businesses schedule recurring dumpster service?",
    a: "Yes. We support ongoing commercial and industrial waste needs with recurring delivery, swap-out, and pickup schedules tailored to your operation.",
  },
  {
    q: "How do I request pricing?",
    a: "Send us a message via WhatsApp or use the Request a Quote button. Share your project type, location, and preferred rental period, and we'll get back to you with options.",
  },
];

const related = [
  { title: "Skip Bin Rental", body: "Various sizes for different types of projects.", img: imgRel0, to: "/services" },
  { title: "Garbage Collection", body: "Reliable collection for homes and businesses across Guyana.", img: imgRel1, to: "/services" },
  { title: "Scrap Metal", body: "We buy and recycle all types of scrap metal.", img: imgRel2, to: "/services" },
];

function DumpsterRentalPage() {
  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-cevons-border">
        <div className="container-cevons py-4">
          <ol className="flex items-center gap-1.5 text-xs md:text-sm">
            <li>
              <Link to="/" className="text-cevons-green font-semibold hover:underline">Home</Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="size-3.5 text-cevons-muted" /></li>
            <li>
              <Link to="/services" className="text-cevons-green font-semibold hover:underline">Services</Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="size-3.5 text-cevons-muted" /></li>
            <li aria-current="page" className="text-cevons-muted">Dumpster Rental</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-cevons-cream relative overflow-hidden" aria-labelledby="svc-h1">
        <div className="container-cevons section-y grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-4 inline-flex items-center gap-2">
              <Container className="size-4" /> Dumpster Rental
            </p>
            <h1 id="svc-h1" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-cevons-dark">
              Dumpster Rental Solutions
            </h1>
            <p className="mt-5 text-base md:text-lg text-cevons-muted max-w-xl leading-relaxed">
              Flexible dumpster rental for construction, renovations, cleanups, commercial projects, and long-term waste needs across Guyana.
            </p>
            <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-3" role="list">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-cevons-dark">
                  <CheckCircle2 className="size-5 text-cevons-green shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="/contact" className="btn-base btn-green px-6 py-3.5 text-base">
                <WhatsApp className="size-5" /> WhatsApp Us
              </a>
              <a href="/request-service" className="btn-base btn-yellow px-6 py-3.5 text-base">
                <FileText className="size-5" /> Request a Quote
              </a>
            </div>
          </div>

          <div className="reveal" style={{ animationDelay: "120ms" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-lift group">
              <img
                src={imgDumpster}
                alt="Green CEVON'S dumpster ready for rental on a Guyana job site"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                width={960}
                height={720}
              />
              <div className="absolute top-4 left-4 bg-white rounded-lg px-2.5 py-1.5 shadow-soft flex items-center gap-2">
                <img src={logo} alt="" aria-hidden="true" className="h-6 w-auto" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cevons-dark">CEVON'S</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="section-y bg-white" aria-labelledby="sizes-h">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">Service Options</p>
            <h2 id="sizes-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">
              Choose the right size for your project
            </h2>
            <p className="mt-4 text-sm text-cevons-muted">
              Typical size options — confirm availability with CEVON'S.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sizes.map(({ size, use }, i) => (
              <article
                key={size}
                className="group bg-white rounded-xl border border-cevons-border p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-cevons-green hover:shadow-lift reveal"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="size-14 rounded-xl bg-cevons-green/10 text-cevons-green flex items-center justify-center mb-4">
                  <Container className="size-7" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-cevons-dark">{size}</h3>
                <p className="mt-1.5 text-sm text-cevons-muted">{use}</p>
                <a
                  href="/contact"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all"
                  aria-label={`Ask about the ${size} dumpster`}
                >
                  Ask About This Size <ArrowRight className="size-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Common Uses */}
      <section className="section-y bg-cevons-cream" aria-labelledby="uses-h">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">Common Uses</p>
            <h2 id="uses-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">
              What our dumpsters are used for
            </h2>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {uses.map(({ icon: Icon, title }, i) => (
              <li
                key={title}
                className="bg-white rounded-xl border border-cevons-border p-5 text-center shadow-soft transition-all hover:border-cevons-green hover:-translate-y-0.5 reveal"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="mx-auto mb-3 size-12 rounded-full bg-cevons-green/10 text-cevons-green flex items-center justify-center">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-cevons-dark leading-snug">{title}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="section-y bg-white" aria-labelledby="how-h">
        <div className="container-cevons">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">How It Works</p>
            <h2 id="how-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">
              Simple, professional service
            </h2>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="relative bg-white rounded-xl border border-cevons-border p-6 shadow-soft reveal"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className="absolute -top-3 left-6 bg-cevons-yellow text-cevons-dark text-xs font-extrabold px-2.5 py-1 rounded-md shadow-soft">
                  Step {i + 1}
                </span>
                <span className="size-12 rounded-full bg-cevons-green text-white flex items-center justify-center mt-2">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-cevons-dark">{title}</h3>
                <p className="mt-1.5 text-sm text-cevons-muted leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Help choosing CTA */}
      <section className="bg-white pb-16 md:pb-20" id="quote">
        <div className="container-cevons">
          <div className="rounded-2xl bg-cevons-cream border border-cevons-green/20 p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-soft">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-2 inline-flex items-center gap-2">
                <Leaf className="size-4" /> We're Here to Help
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-cevons-dark">Need Help Choosing?</h2>
              <p className="mt-3 text-cevons-muted leading-relaxed">
                Our team can help you select the right dumpster size for your project, timeline, and waste type.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a href="/contact" className="btn-base btn-green px-6 py-3.5 text-base">
                <WhatsApp className="size-5" /> WhatsApp Us
              </a>
              <a href="/request-service" className="btn-base btn-yellow px-6 py-3.5 text-base">
                <FileText className="size-5" /> Request a Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y bg-cevons-cream" aria-labelledby="faq-h">
        <div className="container-cevons max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-3">FAQ</p>
            <h2 id="faq-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="bg-white rounded-xl border border-cevons-border px-5 shadow-soft data-[state=open]:border-cevons-green transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-cevons-dark hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-cevons-muted leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related */}
      <section className="section-y bg-white" aria-labelledby="related-h">
        <div className="container-cevons">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cevons-green mb-2">More From CEVON'S</p>
              <h2 id="related-h" className="text-3xl md:text-4xl font-extrabold text-cevons-dark">Related Services</h2>
            </div>
            <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all">
              View all services <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(({ title, body, img, to }, i) => {
              const Icon = title === "Skip Bin Rental" ? Container : title === "Garbage Collection" ? Trash2 : Recycle;
              return (
                <article
                  key={title}
                  className="group bg-white rounded-xl border border-cevons-border overflow-hidden shadow-soft transition-all hover:-translate-y-0.5 hover:border-cevons-green hover:shadow-lift reveal"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-cevons-cream">
                    <img src={img} alt={title} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute -bottom-5 left-5 size-12 rounded-full bg-cevons-green text-white border-4 border-white flex items-center justify-center shadow-soft">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="p-6 pt-8">
                    <h3 className="text-lg font-bold text-cevons-dark">{title}</h3>
                    <p className="mt-2 text-sm text-cevons-muted leading-relaxed">{body}</p>
                    <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cevons-green hover:gap-2 transition-all">
                      Learn More <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
