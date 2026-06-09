import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check, ChevronLeft, ChevronRight, Upload, MessageCircle, AlertCircle,
  Home, Building2, Factory, Recycle,
  Trash2, Container, Droplet, Waves, FileText, ShieldAlert, Flame, Sprout, Beaker, PackageX, Biohazard, Mountain,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { CevonsIcon } from "@/components/CevonsIcon";
import type { CevonsCategoryKey, CevonsServiceKey } from "@/data/cevonsIconRegistry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { cevonsContact, primaryTelHref, primaryMailtoHref, whatsappHref } from "@/data/cevonsContact";

export const Route = createFileRoute("/request-service")({
  head: () => ({
    meta: [
      { title: "Request a Service | CEVON'S Guyana" },
      { name: "description", content: "Request waste management, recycling or environmental services from CEVON'S across Georgetown, Linden, and Berbice." },
      { property: "og:title", content: "Request a Service | CEVON'S Guyana" },
      { property: "og:description", content: "Tell us what you need and we'll take care of the rest." },
    ],
    links: [{ rel: "canonical", href: "/request-service" }],
  }),
  component: RequestServicePage,
});

/* ---------------- Taxonomy ---------------- */

type CategoryKey = "residential" | "commercial" | "industrial" | "facilities";

type ServiceKey =
  // residential
  | "general-trash-collection" | "dumpster-rental" | "septic-services" | "portable-toilet"
  // commercial
  | "general-waste-management" | "skip-bin-dumpster-rental" | "portable-toilet-commercial"
  | "grease-trap-septic-tank" | "document-shredding"
  // industrial
  | "hazardous-waste" | "wastewater" | "used-waste-oil" | "contaminated-soil"
  | "tank-cleaning" | "product-destruction" | "biohazardous-disposal"
  // facilities
  | "material-recovery-facility" | "landfill-operations";

type DetailType =
  | "dumpster" | "toilet" | "septic" | "trash" | "shred"
  | "industrial" | "facilities";

type ServiceMeta = { key: ServiceKey; name: string; desc: string; icon: any; iconKey: CevonsServiceKey; detailType: DetailType; category: CategoryKey };

const CATEGORIES: { key: CategoryKey; name: string; desc: string; icon: any; iconKey: CevonsCategoryKey }[] = [
  { key: "residential", name: "Residential", desc: "Homes, neighborhoods, and small properties.", icon: Home, iconKey: "residential" },
  { key: "commercial", name: "Commercial", desc: "Offices, retail, hospitality, and businesses.", icon: Building2, iconKey: "commercial" },
  { key: "industrial", name: "Industrial", desc: "Specialized and regulated waste streams.", icon: Factory, iconKey: "industrial" },
  { key: "facilities", name: "Facilities", desc: "Recovery and landfill operations.", icon: Recycle, iconKey: "facilities" },
];

const SERVICES: ServiceMeta[] = [
  // residential
  { key: "general-trash-collection", name: "General Trash Collection", desc: "Scheduled household pickup.", icon: Trash2, iconKey: "general-trash-collection", detailType: "trash", category: "residential" },
  { key: "dumpster-rental", name: "Dumpster Rental", desc: "Short or long term dumpsters.", icon: Container, iconKey: "dumpster-rental", detailType: "dumpster", category: "residential" },
  { key: "septic-services", name: "Septic Services", desc: "Safe, efficient septic tank pumping.", icon: Droplet, iconKey: "septic-services", detailType: "septic", category: "residential" },
  { key: "portable-toilet", name: "Portable Toilet", desc: "Clean portable toilet rentals.", icon: Waves, iconKey: "portable-toilet", detailType: "toilet", category: "residential" },
  // commercial
  { key: "general-waste-management", name: "General Waste Management", desc: "Scheduled commercial collection.", icon: Trash2, iconKey: "general-waste-management", detailType: "trash", category: "commercial" },
  { key: "skip-bin-dumpster-rental", name: "Skip Bin & Dumpster Rental", desc: "Right-sized containers for projects.", icon: Container, iconKey: "skip-bin", detailType: "dumpster", category: "commercial" },
  { key: "portable-toilet-commercial", name: "Portable Toilet", desc: "Sanitation for sites and events.", icon: Waves, iconKey: "portable-toilet", detailType: "toilet", category: "commercial" },
  { key: "grease-trap-septic-tank", name: "Grease Trap / Septic Tank", desc: "Grease trap & septic servicing.", icon: Droplet, iconKey: "grease-trap", detailType: "septic", category: "commercial" },
  { key: "document-shredding", name: "Document Shredding", desc: "Secure document destruction.", icon: FileText, iconKey: "document-shredding", detailType: "shred", category: "commercial" },
  // industrial
  { key: "hazardous-waste", name: "Hazardous Waste", desc: "Regulated handling and disposal.", icon: ShieldAlert, iconKey: "hazardous-waste", detailType: "industrial", category: "industrial" },
  { key: "wastewater", name: "Wastewater", desc: "Industrial wastewater services.", icon: Waves, iconKey: "liquid-wastewater", detailType: "industrial", category: "industrial" },
  { key: "used-waste-oil", name: "Used Waste Oil", desc: "Collection & recycling of waste oils.", icon: Flame, iconKey: "used-waste-oil", detailType: "industrial", category: "industrial" },
  { key: "contaminated-soil", name: "Contaminated Soil", desc: "Excavation, transport, treatment.", icon: Sprout, iconKey: "contaminated-soil", detailType: "industrial", category: "industrial" },
  { key: "tank-cleaning", name: "Tank Cleaning", desc: "Industrial tank cleaning.", icon: Beaker, iconKey: "tank-cleaning", detailType: "industrial", category: "industrial" },
  { key: "product-destruction", name: "Product Destruction", desc: "Certified product destruction.", icon: PackageX, iconKey: "product-destruction", detailType: "industrial", category: "industrial" },
  { key: "biohazardous-disposal", name: "Biohazardous Disposal", desc: "Clinical & lab waste disposal.", icon: Biohazard, iconKey: "biohazardous-disposal", detailType: "industrial", category: "industrial" },
  // facilities
  { key: "material-recovery-facility", name: "Material Recovery Facility", desc: "Sorting & recovery intake.", icon: Recycle, iconKey: "material-recovery", detailType: "facilities", category: "facilities" },
  { key: "landfill-operations", name: "Landfill Operations", desc: "Managed landfill intake.", icon: Mountain, iconKey: "landfill-operations", detailType: "facilities", category: "facilities" },
];

// Specialist review services
const SPECIALIST_KEYS: Set<ServiceKey> = new Set([
  "hazardous-waste", "wastewater", "used-waste-oil", "contaminated-soil",
  "tank-cleaning", "product-destruction", "biohazardous-disposal",
  "material-recovery-facility", "landfill-operations",
]);

const STEPS = ["Category", "Service", "Details", "Schedule", "Your Info", "Review"];

type FormData = {
  category: CategoryKey | null;
  service: ServiceKey | null;
  details: Record<string, string>;
  files: { name: string; size: number }[];
  schedule: { date: string; window: string; urgency: string; timeframe: string };
  info: {
    fullName: string; company: string; phone: string; email: string;
    address: string; region: string; contactMethod: string; notes: string;
  };
  confirm: boolean;
};

const EMPTY: FormData = {
  category: null,
  service: null,
  details: {},
  files: [],
  schedule: { date: "", window: "", urgency: "", timeframe: "" },
  info: { fullName: "", company: "", phone: "", email: "", address: "", region: "", contactMethod: "WhatsApp", notes: "" },
  confirm: false,
};

function RequestServicePage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const selected = SERVICES.find((s) => s.key === data.service) ?? null;
  const isSpecialist = !!(selected && SPECIALIST_KEYS.has(selected.key));

  function setDetail(k: string, v: string) {
    setData((d) => ({ ...d, details: { ...d.details, [k]: v } }));
  }
  function setInfo(k: keyof FormData["info"], v: string) {
    setData((d) => ({ ...d, info: { ...d.info, [k]: v } }));
  }
  function setSchedule(k: keyof FormData["schedule"], v: string) {
    setData((d) => ({ ...d, schedule: { ...d.schedule, [k]: v } }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (step === 0 && !data.category) e.category = "Please choose a category.";
    if (step === 1 && !data.service) e.service = "Please choose a service.";
    if (step === 4) {
      if (!data.info.fullName.trim()) e.fullName = "Name is required.";
      if (!data.info.phone.trim()) e.phone = "Phone is required.";
      else if (!/^[+\d\s\-()]{7,}$/.test(data.info.phone)) e.phone = "Enter a valid phone number.";
      if (data.info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.info.email)) e.email = "Enter a valid email.";
      if (!data.info.address.trim()) e.address = "Service location is required.";
    }
    if (step === 5 && !data.confirm) e.confirm = "Please confirm before submitting.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!validate()) return;
    // Demo submission only — future integration point for CRM sync.
    console.log("CEVON'S service request submitted:", data);
    navigate({ to: "/request-service/confirmation" });
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).map((f) => ({ name: f.name, size: f.size }));
    setData((d) => ({ ...d, files: [...d.files, ...list] }));
  }
  function removeFile(i: number) {
    setData((d) => ({ ...d, files: d.files.filter((_, idx) => idx !== i) }));
  }

  // Continue-button enablement
  const canContinue = useMemo(() => {
    if (step === 0) return !!data.category;
    if (step === 1) return !!data.service;
    if (step === 4) {
      return (
        data.info.fullName.trim() &&
        /^[+\d\s\-()]{7,}$/.test(data.info.phone) &&
        data.info.address.trim()
      );
    }
    return true;
  }, [step, data]);

  return (
    <SiteLayout>
      <PageHero
        title="Request a Service"
        subtitle="Tell us what you need and we’ll take care of the rest."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Request a Service" }]}
        imageSrc="/assets/heroes/hero-request-service.webp"
        imageAlt="Customer requesting CEVON’S service online"
        height="standard"
        showLogoBadge
      />


      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Form */}
          <div>
            <Stepper step={step} />
            <div
              key={step}
              className="mt-8 rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8 animate-fade-in motion-reduce:animate-none"
            >
              {step === 0 && <StepCategory data={data} setData={setData} error={errors.category} />}
              {step === 1 && <StepService data={data} setData={setData} error={errors.service} />}
              {step === 2 && (
                <StepDetails
                  service={selected}
                  details={data.details}
                  setDetail={setDetail}
                  files={data.files}
                  onFiles={onFiles}
                  removeFile={removeFile}
                />
              )}
              {step === 3 && (
                <StepSchedule
                  isSpecialist={isSpecialist}
                  schedule={data.schedule}
                  setSchedule={setSchedule}
                />
              )}
              {step === 4 && <StepInfo info={data.info} setInfo={setInfo} errors={errors} />}
              {step === 5 && (
                <StepReview
                  data={data}
                  selected={selected}
                  isSpecialist={isSpecialist}
                  confirm={data.confirm}
                  setConfirm={(v) => setData((d) => ({ ...d, confirm: v }))}
                  error={errors.confirm}
                />
              )}

              {/* Nav */}
              <div className="mt-8 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 border-t border-border pt-6">
                <Button variant="outline" onClick={back} disabled={step === 0} className="h-12">
                  <ChevronLeft className="size-4 mr-1" /> Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    onClick={next}
                    disabled={!canContinue}
                    className="h-12 bg-[var(--cevons-yellow)] text-[#101820] hover:bg-[var(--cevons-yellow)]/90 font-semibold disabled:opacity-50"
                  >
                    Continue <ChevronRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    disabled={!data.confirm}
                    className="h-12 bg-[var(--cevons-yellow)] text-[#101820] hover:bg-[var(--cevons-yellow)]/90 font-semibold disabled:opacity-50"
                  >
                    Submit Request
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Need Help?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Call our Georgetown Head Office at{" "}
                <a href={primaryTelHref} className="font-semibold text-[#006B35] hover:underline">{cevonsContact.primaryPhone}</a>{" "}
                or email{" "}
                <a href={primaryMailtoHref} className="font-semibold text-[#006B35] hover:underline">{cevonsContact.email}</a>.
                Or contact the branch closest to you.
              </p>
              {/* Confirm official WhatsApp number with CEVON'S before launch. */}
              <a
                href={whatsappHref}
                {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 h-11 rounded-[10px] bg-[#006B35] text-white hover:bg-[#003F27] font-semibold transition-colors"
              >
                <MessageCircle className="size-4" /> WhatsApp Us
              </a>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-foreground">What happens next?</h4>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal pl-4">
                <li>Submit your request</li>
                <li>Our team reviews details</li>
                <li>We confirm via WhatsApp or phone</li>
                <li>Service is scheduled and delivered</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

/* ---------------- Stepper ---------------- */

function Stepper({ step }: { step: number }) {
  const pct = Math.round((step / (STEPS.length - 1)) * 100);
  return (
    <div>
      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-[#006B35] transition-all duration-500"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((label, i) => {
          const completed = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex-1 flex items-center gap-2 min-w-0">
              <div className={cn(
                "shrink-0 size-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                (completed || active) && "bg-[#006B35] border-[#006B35] text-white",
                !completed && !active && "bg-card border-border text-muted-foreground",
              )}>
                {completed ? <Check className="size-4" /> : i + 1}
              </div>
              <span className={cn("text-xs md:text-sm truncate", active ? "text-foreground font-semibold" : "text-muted-foreground")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className={cn("hidden md:block flex-1 h-px", completed ? "bg-[#006B35]" : "bg-border")} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- Step 1: Category ---------------- */

function StepCategory({ data, setData, error }: { data: FormData; setData: (f: FormData) => void; error?: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">What type of service do you need?</h2>
      <p className="text-muted-foreground mt-1">Choose the category that best matches your project.</p>
      {error && <p className="mt-3 text-sm text-destructive flex items-center gap-1"><AlertCircle className="size-4" />{error}</p>}

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map((c) => {
          const active = data.category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setData({ ...data, category: c.key, service: null, details: {} })}
              className={cn(
                "text-left rounded-2xl border-2 p-6 transition-all bg-card group",
                active
                  ? "border-[#006B35] bg-[#006B35]/5 shadow-md"
                  : "border-border hover:border-[#006B35]/60 hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "h-24 w-24 rounded-2xl flex items-center justify-center shadow-sm ring-1 transition-transform group-hover:scale-[1.04]",
                    active
                      ? "bg-white ring-[#006B35]/30"
                      : "bg-gradient-to-br from-[#FAFBF9] to-[#006B35]/5 ring-black/5",
                  )}
                >
                  <CevonsIcon group="categories" name={c.iconKey} size="xl" decorative />
                </div>
                {active && <Check className="size-5 text-[#006B35]" />}
              </div>
              <div className="mt-4 text-lg font-bold">{c.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{c.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 2: Service ---------------- */

function StepService({ data, setData, error }: { data: FormData; setData: (f: FormData) => void; error?: string }) {
  const list = SERVICES.filter((s) => s.category === data.category);
  return (
    <div>
      <h2 className="text-2xl font-bold">Which service?</h2>
      <p className="text-muted-foreground mt-1">Select the service that best matches your request.</p>
      {error && <p className="mt-3 text-sm text-destructive flex items-center gap-1"><AlertCircle className="size-4" />{error}</p>}

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((s) => {
          const active = data.service === s.key;
          const specialist = SPECIALIST_KEYS.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setData({ ...data, service: s.key, details: {} })}
              className={cn(
                "text-left rounded-xl border-2 p-4 transition-all bg-card group",
                active
                  ? "border-[#006B35] bg-[#006B35]/5 shadow-md"
                  : "border-border hover:border-[#006B35]/60 hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm ring-1 transition-transform group-hover:scale-[1.04]",
                    active
                      ? "bg-white ring-[#006B35]/30"
                      : "bg-gradient-to-br from-[#FAFBF9] to-[#006B35]/5 ring-black/5",
                  )}
                >
                  <CevonsIcon group="services" name={s.iconKey} size="md" decorative />
                </div>
                {active && <Check className="size-5 text-[#006B35]" />}
              </div>
              <div className="mt-3 font-semibold">{s.name}</div>
              <div className="text-sm text-muted-foreground">{s.desc}</div>
              {specialist && (
                <div className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-wide text-[var(--cevons-red)]">
                  Specialist Review
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 3: Details ---------------- */

function StepDetails({
  service, details, setDetail, files, onFiles, removeFile,
}: {
  service: ServiceMeta | null;
  details: Record<string, string>;
  setDetail: (k: string, v: string) => void;
  files: { name: string; size: number }[];
  onFiles: (f: FileList | null) => void;
  removeFile: (i: number) => void;
}) {
  if (!service) return <div className="text-muted-foreground">Please select a service first.</div>;
  const type = service.detailType;

  return (
    <div>
      <h2 className="text-2xl font-bold">Service Details</h2>
      <p className="text-muted-foreground mt-1">Share a few specifics so our team can prepare.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {type === "dumpster" && (
          <>
            <Field label="Waste type">
              <Select value={details.wasteType ?? ""} onValueChange={(v) => setDetail("wasteType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select waste type" /></SelectTrigger>
                <SelectContent>
                  {["Household", "Commercial", "Construction", "Mixed", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estimated volume / size needed"><Input className="h-12" value={details.volume ?? ""} onChange={(e) => setDetail("volume", e.target.value)} placeholder="e.g. 10 yard, 20 yard" /></Field>
            <Field label="Rental duration"><Input className="h-12" value={details.duration ?? ""} onChange={(e) => setDetail("duration", e.target.value)} placeholder="e.g. 5 days" /></Field>
            <Field label="Delivery location" full><Input className="h-12" value={details.location ?? ""} onChange={(e) => setDetail("location", e.target.value)} /></Field>
            <Field label="Preferred delivery date"><Input type="date" className="h-12" value={details.delivery ?? ""} onChange={(e) => setDetail("delivery", e.target.value)} /></Field>
            <Field label="Preferred pickup date"><Input type="date" className="h-12" value={details.pickup ?? ""} onChange={(e) => setDetail("pickup", e.target.value)} /></Field>
            <Field label="Site access notes" full><Textarea value={details.access ?? ""} onChange={(e) => setDetail("access", e.target.value)} placeholder="Gates, narrow streets, parking, etc." /></Field>
          </>
        )}

        {type === "toilet" && (
          <>
            <Field label="Use case">
              <Select value={details.useCase ?? ""} onValueChange={(v) => setDetail("useCase", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select use case" /></SelectTrigger>
                <SelectContent>
                  {["Event", "Construction Site", "Commercial Site", "Residential Project", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Number of units"><Input type="number" min="1" className="h-12" value={details.units ?? ""} onChange={(e) => setDetail("units", e.target.value)} /></Field>
            <Field label="People expected"><Input type="number" min="1" className="h-12" value={details.people ?? ""} onChange={(e) => setDetail("people", e.target.value)} /></Field>
            <Field label="Servicing frequency">
              <Select value={details.freq ?? ""} onValueChange={(v) => setDetail("freq", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Daily", "Weekly", "Bi-weekly", "End of rental"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Start date"><Input type="date" className="h-12" value={details.start ?? ""} onChange={(e) => setDetail("start", e.target.value)} /></Field>
            <Field label="End date"><Input type="date" className="h-12" value={details.end ?? ""} onChange={(e) => setDetail("end", e.target.value)} /></Field>
            <Field label="Delivery location" full><Input className="h-12" value={details.location ?? ""} onChange={(e) => setDetail("location", e.target.value)} /></Field>
          </>
        )}

        {type === "septic" && (
          <>
            <Field label="Residential or commercial">
              <Select value={details.customerType ?? ""} onValueChange={(v) => setDetail("customerType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Residential", "Commercial"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Tank / grease trap type"><Input className="h-12" value={details.tank ?? ""} onChange={(e) => setDetail("tank", e.target.value)} placeholder="e.g. concrete septic, grease trap" /></Field>
            <Field label="Last serviced date (if known)"><Input type="date" className="h-12" value={details.lastService ?? ""} onChange={(e) => setDetail("lastService", e.target.value)} /></Field>
            <Field label="Urgency">
              <Select value={details.urgency ?? ""} onValueChange={(v) => setDetail("urgency", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Routine", "Soon", "Urgent"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Access details" full><Textarea value={details.access ?? ""} onChange={(e) => setDetail("access", e.target.value)} /></Field>
            <Field label="Issue description" full><Textarea value={details.issue ?? ""} onChange={(e) => setDetail("issue", e.target.value)} /></Field>
          </>
        )}

        {type === "trash" && (
          <>
            <Field label="Customer type">
              <Select value={details.customerType ?? ""} onValueChange={(v) => setDetail("customerType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Residential", "Commercial", "Institutional"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="One-time or recurring">
              <Select value={details.cadence ?? ""} onValueChange={(v) => setDetail("cadence", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["One-time", "Recurring"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Waste volume / frequency"><Input className="h-12" value={details.volume ?? ""} onChange={(e) => setDetail("volume", e.target.value)} placeholder="e.g. 2 bags weekly" /></Field>
            <Field label="Preferred start date"><Input type="date" className="h-12" value={details.start ?? ""} onChange={(e) => setDetail("start", e.target.value)} /></Field>
            <Field label="Service location" full><Input className="h-12" value={details.location ?? ""} onChange={(e) => setDetail("location", e.target.value)} /></Field>
          </>
        )}

        {type === "shred" && (
          <>
            <Field label="Number of boxes / bags"><Input className="h-12" value={details.qty ?? ""} onChange={(e) => setDetail("qty", e.target.value)} /></Field>
            <Field label="One-time or recurring">
              <Select value={details.cadence ?? ""} onValueChange={(v) => setDetail("cadence", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["One-time", "Recurring"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Pickup or on-site">
              <Select value={details.mode ?? ""} onValueChange={(v) => setDetail("mode", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Pickup", "On-site shredding"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Confidentiality notes" full><Textarea value={details.confidentiality ?? ""} onChange={(e) => setDetail("confidentiality", e.target.value)} /></Field>
          </>
        )}

        {type === "industrial" && (
          <>
            <Field label="Waste type"><Input className="h-12" value={details.wasteType ?? ""} onChange={(e) => setDetail("wasteType", e.target.value)} placeholder="e.g. solvent, hydrocarbon-impacted soil" /></Field>
            <Field label="Estimated quantity / volume"><Input className="h-12" value={details.qty ?? ""} onChange={(e) => setDetail("qty", e.target.value)} placeholder="e.g. 5 drums, 200 L, 10 m³" /></Field>
            <Field label="Source of waste"><Input className="h-12" value={details.source ?? ""} onChange={(e) => setDetail("source", e.target.value)} placeholder="Process, equipment, location" /></Field>
            <Field label="Site type"><Input className="h-12" value={details.site ?? ""} onChange={(e) => setDetail("site", e.target.value)} placeholder="e.g. workshop, plant, port" /></Field>
            <Field label="Compliance documentation needed">
              <Select value={details.compliance ?? ""} onValueChange={(v) => setDetail("compliance", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Yes", "No", "Unsure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Urgency">
              <Select value={details.urgency ?? ""} onValueChange={(v) => setDetail("urgency", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Routine", "Soon", "Urgent"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Notes (SDS info, hazards, access)" full>
              <Textarea value={details.notes ?? ""} onChange={(e) => setDetail("notes", e.target.value)} placeholder="Add any safety, access, or material details. Attach SDS in the upload section." />
            </Field>
          </>
        )}

        {type === "facilities" && (
          <>
            <Field label="Facility inquiry type">
              <Select value={details.inquiry ?? ""} onValueChange={(v) => setDetail("inquiry", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Commercial Tipping", "Material Intake", "Diversion Program", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Organization / company"><Input className="h-12" value={details.org ?? ""} onChange={(e) => setDetail("org", e.target.value)} /></Field>
            <Field label="Location" full><Input className="h-12" value={details.location ?? ""} onChange={(e) => setDetail("location", e.target.value)} /></Field>
            <Field label="Message / details" full><Textarea value={details.message ?? ""} onChange={(e) => setDetail("message", e.target.value)} placeholder="Material types, expected volumes, frequency, timeline." /></Field>
          </>
        )}
      </div>

      {/* Upload */}
      <div className="mt-8">
        <Label className="text-sm font-semibold">
          {type === "industrial"
            ? "Upload SDS, photos, or supporting documents"
            : type === "facilities"
              ? "Upload supporting documentation"
              : "Upload photos or documents (optional)"}
        </Label>
        <label
          htmlFor="file-upload"
          className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 hover:border-[#006B35] hover:bg-[#006B35]/5 transition-colors cursor-pointer p-8 text-center"
        >
          <Upload className="size-6 text-[#006B35]" />
          <div className="mt-2 font-medium">Drag & drop files here or click to upload</div>
          <div className="text-xs text-muted-foreground mt-1">Accepted: images, PDFs, documents.</div>
          <input id="file-upload" type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm">
                <span className="truncate">{f.name} <span className="text-muted-foreground">({Math.round(f.size / 1024)} KB)</span></span>
                <button type="button" className="text-destructive hover:underline" onClick={() => removeFile(i)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("space-y-1.5", full && "md:col-span-2")}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

/* ---------------- Step 4: Schedule / Review Type ---------------- */

function StepSchedule({
  isSpecialist, schedule, setSchedule,
}: {
  isSpecialist: boolean;
  schedule: FormData["schedule"]; setSchedule: (k: keyof FormData["schedule"], v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{isSpecialist ? "Specialist Review" : "Schedule"}</h2>
      <p className="text-muted-foreground mt-1">
        {isSpecialist
          ? "Tell us when you'd like to be contacted — our specialist team will follow up."
          : "Pick your preferred date and time window."}
      </p>

      {isSpecialist && (
        <div className="mt-4 rounded-xl border border-[var(--cevons-yellow)]/50 bg-[var(--cevons-yellow)]/15 p-4 text-sm">
          <strong className="font-semibold">Specialist Review Required.</strong>{" "}
          Submit your request and a CEVON'S team member will contact you by WhatsApp during the same business day.
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {!isSpecialist ? (
          <>
            <Field label="Preferred date">
              <Input type="date" className="h-12" value={schedule.date} onChange={(e) => setSchedule("date", e.target.value)} />
            </Field>
            <Field label="Preferred time window">
              <Select value={schedule.window} onValueChange={(v) => setSchedule("window", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select a window" /></SelectTrigger>
                <SelectContent>{["Morning", "Midday", "Afternoon", "Flexible"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </>
        ) : (
          <>
            <Field label="Preferred contact time">
              <Select value={schedule.window} onValueChange={(v) => setSchedule("window", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Morning", "Midday", "Afternoon", "Anytime"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Urgency">
              <Select value={schedule.urgency} onValueChange={(v) => setSchedule("urgency", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Routine", "Soon", "Urgent"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Preferred service timeframe" full>
              <Input className="h-12" value={schedule.timeframe} onChange={(e) => setSchedule("timeframe", e.target.value)} placeholder="e.g. within the next 2 weeks" />
            </Field>
          </>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">All dates and time windows are preferences. Our team will confirm the final schedule.</p>
    </div>
  );
}

/* ---------------- Step 5: Your Info ---------------- */

function StepInfo({
  info, setInfo, errors,
}: { info: FormData["info"]; setInfo: (k: keyof FormData["info"], v: string) => void; errors: Record<string, string> }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">Your Information</h2>
      <p className="text-muted-foreground mt-1">So we can reach out and confirm your service.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Field label="Full Name *">
          <Input className="h-12" value={info.fullName} onChange={(e) => setInfo("fullName", e.target.value)} />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
        </Field>
        <Field label="Company Name"><Input className="h-12" value={info.company} onChange={(e) => setInfo("company", e.target.value)} /></Field>
        <Field label="Phone Number *">
          <Input className="h-12" value={info.phone} onChange={(e) => setInfo("phone", e.target.value)} placeholder="+592 …" />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </Field>
        <Field label="Email Address">
          <Input type="email" className="h-12" value={info.email} onChange={(e) => setInfo("email", e.target.value)} />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </Field>
        <Field label="Service Location / Address *" full>
          <Input className="h-12" value={info.address} onChange={(e) => setInfo("address", e.target.value)} />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </Field>
        <Field label="Region">
          <Select value={info.region} onValueChange={(v) => setInfo("region", v)}>
            <SelectTrigger className="h-12"><SelectValue placeholder="Select a region" /></SelectTrigger>
            <SelectContent>{["Georgetown", "Linden", "Berbice", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Preferred contact method">
          <RadioGroup value={info.contactMethod} onValueChange={(v) => setInfo("contactMethod", v)} className="flex gap-4 pt-3">
            {["WhatsApp", "Phone", "Email"].map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value={m} /> {m}
              </label>
            ))}
          </RadioGroup>
        </Field>
        <Field label="Additional Notes" full><Textarea value={info.notes} onChange={(e) => setInfo("notes", e.target.value)} /></Field>
      </div>
    </div>
  );
}

/* ---------------- Step 6: Review ---------------- */

function StepReview({
  data, selected, isSpecialist, confirm, setConfirm, error,
}: {
  data: FormData; selected: ServiceMeta | null; isSpecialist: boolean;
  confirm: boolean; setConfirm: (v: boolean) => void; error?: string;
}) {
  const detailEntries = useMemo(() => Object.entries(data.details).filter(([, v]) => v), [data.details]);
  const categoryName = CATEGORIES.find((c) => c.key === data.category)?.name ?? "—";
  return (
    <div>
      <h2 className="text-2xl font-bold">Review & Submit</h2>
      <p className="text-muted-foreground mt-1">Please confirm everything below is correct.</p>

      <div className="mt-6 space-y-4">
        <ReviewBlock title="Category">
          <div className="font-medium">{categoryName}</div>
        </ReviewBlock>
        <ReviewBlock title="Service">
          <div className="font-medium">{selected?.name ?? "—"}</div>
          {isSpecialist && <div className="text-sm text-[var(--cevons-red)] font-semibold mt-1">Specialist review required</div>}
        </ReviewBlock>
        {detailEntries.length > 0 && (
          <ReviewBlock title="Details">
            <dl className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {detailEntries.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}:</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </ReviewBlock>
        )}
        <ReviewBlock title={isSpecialist ? "Specialist review" : "Schedule"}>
          <div className="text-sm space-y-1">
            {!isSpecialist ? (
              <>
                <div><span className="text-muted-foreground">Preferred date:</span> {data.schedule.date || "—"}</div>
                <div><span className="text-muted-foreground">Time window:</span> {data.schedule.window || "—"}</div>
              </>
            ) : (
              <>
                <div><span className="text-muted-foreground">Contact time:</span> {data.schedule.window || "—"}</div>
                <div><span className="text-muted-foreground">Urgency:</span> {data.schedule.urgency || "—"}</div>
                <div><span className="text-muted-foreground">Timeframe:</span> {data.schedule.timeframe || "—"}</div>
              </>
            )}
          </div>
        </ReviewBlock>
        <ReviewBlock title="Your Info">
          <div className="text-sm grid md:grid-cols-2 gap-x-6 gap-y-1">
            <div><span className="text-muted-foreground">Name:</span> {data.info.fullName}</div>
            <div><span className="text-muted-foreground">Company:</span> {data.info.company || "—"}</div>
            <div><span className="text-muted-foreground">Phone:</span> {data.info.phone}</div>
            <div><span className="text-muted-foreground">Email:</span> {data.info.email || "—"}</div>
            <div className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {data.info.address}</div>
            <div><span className="text-muted-foreground">Region:</span> {data.info.region || "—"}</div>
            <div><span className="text-muted-foreground">Contact via:</span> {data.info.contactMethod}</div>
            {data.info.notes && <div className="md:col-span-2"><span className="text-muted-foreground">Notes:</span> {data.info.notes}</div>}
          </div>
        </ReviewBlock>
        {data.files.length > 0 && (
          <ReviewBlock title="Uploaded files">
            <ul className="text-sm list-disc pl-5 space-y-1">
              {data.files.map((f, i) => <li key={i}>{f.name}</li>)}
            </ul>
          </ReviewBlock>
        )}
      </div>

      <label className="mt-6 flex items-start gap-3 cursor-pointer">
        <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(!!v)} className="mt-1" />
        <span className="text-sm">I confirm that the information provided is accurate.</span>
      </label>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
