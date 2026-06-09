import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Send,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Award,
  Headphones,
  Upload,
  Leaf,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CevonsIcon } from "@/components/CevonsIcon";
import forestBg from "@/assets/forest-bg.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact CEVON’S | Waste Management & Environmental Services Guyana" },
      { name: "description", content: "Contact CEVON’S Environmental Services for waste management, dumpster rental, skip bin rental, septic services, recycling, and environmental solutions in Guyana." },
      { property: "og:title", content: "Contact CEVON’S | Waste Management & Environmental Services Guyana" },
      { property: "og:description", content: "Contact CEVON’S Environmental Services for waste management, dumpster rental, skip bin rental, septic services, recycling, and environmental solutions in Guyana." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: "Message us directly on WhatsApp.",
    action: "WhatsApp Us",
    href: "https://wa.me/",
    primary: true,
  },
  {
    icon: Phone,
    title: "Call Us",
    body: "Speak with our team.",
    action: "Call Now",
    href: "tel:",
    primary: false,
  },
  {
    icon: Mail,
    title: "Email Us",
    body: "Send your inquiry by email.",
    action: "Email CEVON’S",
    href: "mailto:info@cevonsgy.com",
    primary: false,
  },
  {
    icon: MapPin,
    title: "Head Office",
    body: "Visit or contact our main office.",
    action: "View Locations",
    href: "/locations",
    primary: false,
  },
];

const subjects = [
  "General Inquiry",
  "Request Service",
  "Billing",
  "Existing Request",
  "Business Partnership",
  "Other",
];

const branches = [
  {
    name: "Georgetown",
    label: "Head Office",
    address: "Address to be confirmed, Georgetown, Guyana",
    phone: "Phone to be confirmed",
    hours: "Mon–Sat • Hours to be confirmed",
  },
  {
    name: "Linden",
    label: "Branch Office",
    address: "Address to be confirmed, Linden, Guyana",
    phone: "Phone to be confirmed",
    hours: "Mon–Sat • Hours to be confirmed",
  },
  {
    name: "Berbice",
    label: "Branch Office",
    address: "Address to be confirmed, Berbice, Guyana",
    phone: "Phone to be confirmed",
    hours: "Mon–Sat • Hours to be confirmed",
  },
];

function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden" aria-labelledby="contact-h1">
        <div className="absolute inset-0">
          <img src={forestBg} alt="" aria-hidden="true" className="size-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cevons-deep-green,#006B35)]/95 via-[var(--cevons-deep-green,#006B35)]/85 to-[var(--cevons-deep-green,#006B35)]/60" />
        </div>
        <div className="container-cevons relative min-h-[280px] md:min-h-[360px] flex flex-col justify-center py-16 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className={`flex items-center gap-1.5 text-xs md:text-sm text-white/80 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <li><Link to="/" className="hover:text-[var(--cevons-yellow,#FFD200)] transition-colors">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="size-3.5 text-white/50" /></li>
              <li aria-current="page" className="text-[var(--cevons-yellow,#FFD200)] font-semibold">Contact</li>
            </ol>
          </nav>
          <div className={`mb-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            <span className="inline-flex items-center justify-center size-16 md:size-20 rounded-2xl bg-white/10 border border-white/25 backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <CevonsIcon group="ui" name="contactSupport" size="md" decorative priority />
            </span>
          </div>
          <h1 id="contact-h1" className={`text-white text-4xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 delay-75 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Get in Touch
          </h1>
          <p className={`mt-4 text-white/85 text-base md:text-xl max-w-2xl transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            We’re here to help. Reach out to us today.
          </p>
        </div>
        <div className="brand-ribbon" aria-hidden="true" />
      </section>

      {/* CONTACT METHODS */}
      <section className="section-y bg-[var(--cevons-cream,#FBF7EE)]" aria-label="Contact methods">
        <div className="container-cevons">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactMethods.map(({ icon: Icon, title, body, action, href, primary }, i) => (
              <div
                key={title}
                className={`rounded-2xl bg-white border p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  primary
                    ? "border-[var(--cevons-deep-green,#006B35)]/20 ring-1 ring-[var(--cevons-deep-green,#006B35)]/10"
                    : "border-[var(--cevons-deep-green,#006B35)]/10"
                } ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <span className={`flex w-12 h-12 items-center justify-center rounded-xl mb-4 ${
                  primary ? "bg-[var(--cevons-deep-green,#006B35)] text-white" : "bg-[var(--cevons-deep-green,#006B35)]/10 text-[var(--cevons-deep-green,#006B35)]"
                }`}>
                  <Icon className="size-6" />
                </span>
                <h3 className="text-lg font-bold text-[var(--cevons-deep-green,#006B35)]">{title}</h3>
                <p className="mt-1.5 text-sm text-[var(--cevons-muted,#64748B)] leading-relaxed">{body}</p>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl font-semibold px-4 py-2.5 text-sm transition-colors w-full ${
                    primary
                      ? "bg-[var(--cevons-deep-green,#006B35)] text-white hover:bg-[var(--cevons-deep-green,#006B35)]/90"
                      : "border-2 border-[var(--cevons-deep-green,#006B35)] text-[var(--cevons-deep-green,#006B35)] hover:bg-[var(--cevons-deep-green,#006B35)] hover:text-white"
                  }`}
                >
                  {action} <ArrowRight className="size-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT FORM + BRANCH INFO */}
      <section className="section-y bg-white" aria-label="Contact form and branches">
        <div className="container-cevons">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* FORM */}
            <div className="lg:col-span-3">
              <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#006B35)] mb-3">Message</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
                  Send Us a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className={`mt-8 space-y-5 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-[var(--cevons-border,#E5E7EB)] bg-white px-4 py-3 text-sm text-[var(--cevons-dark,#101820)] placeholder:text-[var(--cevons-muted,#64748B)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--cevons-deep-green,#006B35)]/30 focus:border-[var(--cevons-deep-green,#006B35)] transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-[var(--cevons-border,#E5E7EB)] bg-white px-4 py-3 text-sm text-[var(--cevons-dark,#101820)] placeholder:text-[var(--cevons-muted,#64748B)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--cevons-deep-green,#006B35)]/30 focus:border-[var(--cevons-deep-green,#006B35)] transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+592 ..."
                      className="w-full rounded-xl border border-[var(--cevons-border,#E5E7EB)] bg-white px-4 py-3 text-sm text-[var(--cevons-dark,#101820)] placeholder:text-[var(--cevons-muted,#64748B)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--cevons-deep-green,#006B35)]/30 focus:border-[var(--cevons-deep-green,#006B35)] transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--cevons-border,#E5E7EB)] bg-white px-4 py-3 text-sm text-[var(--cevons-dark,#101820)] focus:outline-none focus:ring-2 focus:ring-[var(--cevons-deep-green,#006B35)]/30 focus:border-[var(--cevons-deep-green,#006B35)] transition appearance-none"
                    >
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full rounded-xl border border-[var(--cevons-border,#E5E7EB)] bg-white px-4 py-3 text-sm text-[var(--cevons-dark,#101820)] placeholder:text-[var(--cevons-muted,#64748B)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--cevons-deep-green,#006B35)]/30 focus:border-[var(--cevons-deep-green,#006B35)] transition resize-y"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--cevons-border,#E5E7EB)] px-4 py-3 cursor-pointer hover:bg-[var(--cevons-cream,#FBF7EE)] transition-colors">
                    <Upload className="size-5 text-[var(--cevons-muted,#64748B)]" />
                    <span className="text-sm text-[var(--cevons-muted,#64748B)]">Upload attachment (optional)</span>
                    <input type="file" className="sr-only" />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-base btn-green text-base px-7 py-3.5"
                >
                  <Send className="size-4" /> Send Message
                </button>

                {submitted && (
                  <p className="text-sm font-medium text-[var(--cevons-deep-green,#006B35)] bg-[var(--cevons-deep-green,#006B35)]/10 rounded-lg px-4 py-3">
                    Thank you! Your message has been received. We will get back to you soon.
                  </p>
                )}
              </form>
            </div>

            {/* BRANCH INFO */}
            <aside className="lg:col-span-2">
              <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cevons-deep-green,#006B35)] mb-3">Offices</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--cevons-deep-green,#006B35)]">
                  Our Branches
                </h2>
              </div>

              <div className="mt-8 space-y-5">
                {branches.map((b, i) => (
                  <div
                    key={b.name}
                    className={`rounded-xl bg-[var(--cevons-cream,#FBF7EE)] border border-[var(--cevons-deep-green,#006B35)]/10 p-6 transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{ transitionDelay: `${200 + i * 80}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex w-10 h-10 items-center justify-center rounded-lg bg-[var(--cevons-deep-green,#006B35)]/10 text-[var(--cevons-deep-green,#006B35)]">
                        <MapPin className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[var(--cevons-deep-green,#006B35)]">{b.name}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#B58900]">{b.label}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-sm text-[var(--cevons-muted,#64748B)]">
                      <li className="flex gap-2"><MapPin className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />{b.address}</li>
                      <li className="flex gap-2"><Phone className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />{b.phone}</li>
                      <li className="flex gap-2"><Clock3 className="size-4 mt-0.5 shrink-0 text-[var(--cevons-deep-green,#006B35)]" />{b.hours}</li>
                    </ul>
                  </div>
                ))}
              </div>

              {/* MAP PLACEHOLDER */}
              <div className={`mt-6 rounded-2xl overflow-hidden border border-[var(--cevons-deep-green,#006B35)]/10 bg-[var(--cevons-cream,#FBF7EE)] relative transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "500ms" }}>
                <div className="aspect-[4/3] relative">
                  <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" aria-hidden>
                    <defs>
                      <linearGradient id="gy-contact" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#006B35" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#006B35" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M120 30 L180 25 L240 35 L280 60 L300 110 L290 170 L270 220 L230 260 L180 270 L140 250 L110 210 L95 160 L100 100 Z"
                      fill="url(#gy-contact)"
                      stroke="#006B35"
                      strokeOpacity="0.5"
                      strokeWidth="1.5"
                    />
                    {/* Pins */}
                    {[
                      { x: 128, y: 210, label: "Georgetown" },
                      { x: 152, y: 165, label: "Linden" },
                      { x: 248, y: 186, label: "Berbice" },
                    ].map((pin) => (
                      <g key={pin.label}>
                        <circle cx={pin.x} cy={pin.y - 8} r="6" fill="#006B35" stroke="white" strokeWidth="2" />
                        <text x={pin.x} y={pin.y + 8} textAnchor="middle" fontSize="10" fill="#006B35" fontWeight="600">{pin.label}</text>
                      </g>
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-semibold text-[var(--cevons-deep-green,#006B35)]/50 bg-white/80 px-3 py-1 rounded-full">Interactive map coming soon</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* URGENT CTA */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-cevons">
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-14 md:px-16 md:py-20 text-center"
            style={{
              background:
                "radial-gradient(120% 100% at 0% 0%, #00713A 0%, #003F27 60%, #002819 100%)",
            }}
          >
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
              <p className="text-[var(--cevons-yellow,#FFD200)] text-xs font-bold uppercase tracking-[0.22em] mb-4 inline-flex items-center gap-2">
                <Leaf className="size-4" /> Urgent
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-extrabold">
                Need Urgent Assistance?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Contact us on WhatsApp and our team will respond as soon as possible.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-base btn-green text-base px-6 py-3.5"
                >
                  <MessageCircle className="size-5" /> WhatsApp Us
                </a>
                <a
                  href="tel:"
                  className="btn-base btn-yellow text-base px-6 py-3.5"
                >
                  <Phone className="size-5" /> Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-[var(--cevons-cream,#FBF7EE)] border-t border-[var(--cevons-deep-green,#006B35)]/10">
        <div className="container-cevons py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, label: "Licensed & Insured" },
            { icon: Clock3, label: "Same-Day Response" },
            { icon: Award, label: "Trusted Across Guyana" },
            { icon: Headphones, label: "24/7 Support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center text-center">
              <Icon className="w-6 h-6 text-[var(--cevons-deep-green,#006B35)]" />
              <span className="text-sm font-semibold text-[var(--cevons-deep-green,#006B35)]">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
