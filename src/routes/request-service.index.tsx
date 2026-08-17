import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo/site";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check, ChevronLeft, ChevronRight, Upload, MessageCircle, AlertCircle,
  Home, Building2, Factory, Recycle,
  Trash2, Container, Droplet, Waves, FileText, ShieldAlert, Flame, Sprout, Beaker, PackageX, Biohazard, Mountain, Truck,
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { serviceAreaGroups, branchForArea, OTHER_AREA_VALUE, OTHER_AREA_LABEL } from "@/data/serviceAreas";
import { getAttribution } from "@/lib/attribution";
import { cn } from "@/lib/utils";
import { AnimatedTruckStepper } from "@/components/AnimatedTruckStepper";
import { PromoSlot } from "@/components/promo/PromoSlot";
import { cevonsContact, primaryTelHref, primaryMailtoHref, whatsappHref } from "@/data/cevonsContact";
import { breadcrumbListJsonLd } from "@/lib/seo/jsonLd";
import { ContentProvider, Editable, useEditableText } from "@/components/Editable";
import { getPageContent } from "@/lib/content.functions";

export const Route = createFileRoute("/request-service/")({
  validateSearch: (search: Record<string, unknown>): { preview?: string } =>
    typeof search.preview === "string" ? { preview: search.preview } : {},
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: ({ deps }) => getPageContent({ data: { page: "request-service", token: deps.preview ?? null } }),
  head: () => ({
    meta: [
      { title: "Request a Service | CEVONS Guyana" },
      { name: "description", content: "Request waste management, recycling or environmental services from CEVONS across Georgetown, Linden, and Berbice." },
      { property: "og:title", content: "Request a Service | CEVONS Guyana" },
      { property: "og:description", content: "Tell us what you need and we'll take care of the rest." },
      { property: "og:url", content: absUrl("/request-service") },
    ],
    links: [{ rel: "canonical", href: absUrl("/request-service") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(breadcrumbListJsonLd([
        { name: "Home", path: "/" },
        { name: "Request a Service", path: "/request-service" },
      ])) },
    ],
  }),
  component: RequestServicePage,
});

/* ---------------- Taxonomy ---------------- */

type CategoryKey = "residential" | "commercial" | "industrial" | "facilities";

type ServiceKey =
  // residential
  | "general-trash-collection" | "septic-services" | "portable-toilet"
  // commercial
  | "general-waste-management" | "skip-bin-dumpster-rental" | "portable-toilet-commercial"
  | "grease-trap-septic-tank" | "document-shredding"
  // industrial
  | "hazardous-waste" | "wastewater" | "used-waste-oil" | "contaminated-soil"
  | "tank-cleaning" | "product-destruction" | "biohazardous-disposal"
  // facilities
  | "material-recovery-facility" | "landfill-operations"
  // cross-category additions
  | "compactor-rental" | "road-sweeping" | "scrap-metal-recycling"
  | "plastic-recycling" | "used-cooking-oil";

type DetailType =
  | "dumpster" | "toilet" | "septic" | "trash" | "shred"
  | "industrial" | "facilities"
  | "compactor" | "sweeping" | "recyclables" | "cooking-oil";

type ServiceMeta = { key: ServiceKey; name: string; desc: string; icon: any; iconKey: CevonsServiceKey; detailType: DetailType; categories: CategoryKey[] };

const CATEGORIES: { key: CategoryKey; name: string; desc: string; icon: any; iconKey: CevonsCategoryKey }[] = [
  { key: "residential", name: "Residential", desc: "Homes, neighborhoods, and small properties.", icon: Home, iconKey: "residential" },
  { key: "commercial", name: "Commercial", desc: "Offices, retail, hospitality, and businesses.", icon: Building2, iconKey: "commercial" },
  { key: "industrial", name: "Industrial", desc: "Specialized and regulated waste streams.", icon: Factory, iconKey: "industrial" },
  { key: "facilities", name: "Facilities", desc: "Recovery and landfill operations.", icon: Recycle, iconKey: "facilities" },
];

const SERVICES: ServiceMeta[] = [
  // residential
  { key: "general-trash-collection", name: "General Trash Collection", desc: "Scheduled household pickup.", icon: Trash2, iconKey: "general-trash-collection", detailType: "trash", categories: ["residential"] },
  { key: "septic-services", name: "Septic Services", desc: "Safe, efficient septic tank pumping.", icon: Droplet, iconKey: "septic-services", detailType: "septic", categories: ["residential"] },
  { key: "portable-toilet", name: "Portable Toilet", desc: "Clean portable toilet rentals.", icon: Waves, iconKey: "portable-toilet", detailType: "toilet", categories: ["residential"] },
  // commercial
  { key: "general-waste-management", name: "General Waste Management", desc: "Scheduled commercial collection.", icon: Trash2, iconKey: "general-waste-management", detailType: "trash", categories: ["commercial"] },
  { key: "skip-bin-dumpster-rental", name: "Skip Bin & Dumpster Rental", desc: "Right-sized containers for projects.", icon: Container, iconKey: "skip-bin", detailType: "dumpster", categories: ["residential", "commercial"] },
  { key: "portable-toilet-commercial", name: "Portable Toilet", desc: "Sanitation for sites and events.", icon: Waves, iconKey: "portable-toilet", detailType: "toilet", categories: ["commercial"] },
  { key: "grease-trap-septic-tank", name: "Grease Trap / Septic Tank", desc: "Grease trap & septic servicing.", icon: Droplet, iconKey: "grease-trap", detailType: "septic", categories: ["commercial"] },
  { key: "document-shredding", name: "Document Shredding", desc: "Secure document destruction.", icon: FileText, iconKey: "document-shredding", detailType: "shred", categories: ["commercial"] },
  // industrial
  { key: "hazardous-waste", name: "Hazardous Waste", desc: "Regulated handling and disposal.", icon: ShieldAlert, iconKey: "hazardous-waste", detailType: "industrial", categories: ["industrial"] },
  { key: "wastewater", name: "Wastewater", desc: "Industrial wastewater services.", icon: Waves, iconKey: "liquid-wastewater", detailType: "industrial", categories: ["industrial"] },
  { key: "used-waste-oil", name: "Used Waste Oil", desc: "Collection & recycling of waste oils.", icon: Flame, iconKey: "used-waste-oil", detailType: "industrial", categories: ["industrial"] },
  { key: "contaminated-soil", name: "Contaminated Soil", desc: "Excavation, transport, treatment.", icon: Sprout, iconKey: "contaminated-soil", detailType: "industrial", categories: ["industrial"] },
  { key: "tank-cleaning", name: "Tank Cleaning", desc: "Industrial tank cleaning.", icon: Beaker, iconKey: "tank-cleaning", detailType: "industrial", categories: ["industrial"] },
  { key: "product-destruction", name: "Product Destruction", desc: "Certified product destruction.", icon: PackageX, iconKey: "product-destruction", detailType: "industrial", categories: ["commercial"] },
  { key: "biohazardous-disposal", name: "Biohazardous Disposal", desc: "Clinical & lab waste disposal.", icon: Biohazard, iconKey: "biohazardous-disposal", detailType: "industrial", categories: ["industrial"] },
  // facilities
  { key: "material-recovery-facility", name: "Material Recovery Facility", desc: "Sorting & recovery intake.", icon: Recycle, iconKey: "material-recovery", detailType: "facilities", categories: ["facilities"] },
  { key: "landfill-operations", name: "Landfill Operations", desc: "Managed landfill intake.", icon: Mountain, iconKey: "landfill-operations", detailType: "facilities", categories: ["facilities"] },
  // cross-category additions
  { key: "compactor-rental", name: "Compactor Rental", desc: "Shrink waste volume and cut pickup frequency.", icon: Container, iconKey: "compactor-rental", detailType: "compactor", categories: ["commercial"] },
  { key: "road-sweeping", name: "Road Sweeping", desc: "Mechanical sweeper hire for streets, sites, and events.", icon: Truck, iconKey: "road-sweeping", detailType: "sweeping", categories: ["commercial"] },
  { key: "scrap-metal-recycling", name: "Scrap Metal Recycling", desc: "We buy ferrous and non-ferrous metals, cable and lead batteries — licensed dealer and exporter.", icon: Recycle, iconKey: "scrap-metal-recycling", detailType: "recyclables", categories: ["commercial"] },
  { key: "plastic-recycling", name: "Plastic Recycling", desc: "Business plastics recycling with verified end destinations.", icon: Recycle, iconKey: "plastic-shredding", detailType: "recyclables", categories: ["commercial"] },
  { key: "used-cooking-oil", name: "Used Cooking Oil Collection", desc: "Scheduled kitchen oil collection — routed for recycling.", icon: Flame, iconKey: "cooking-oil-recycling", detailType: "cooking-oil", categories: ["commercial"] },
];

// Specialist review services
const SPECIALIST_KEYS: Set<ServiceKey> = new Set([
  "hazardous-waste", "wastewater", "used-waste-oil", "contaminated-soil",
  "tank-cleaning", "product-destruction", "biohazardous-disposal",
  "material-recovery-facility", "landfill-operations",
  "compactor-rental", "road-sweeping", "scrap-metal-recycling",
]);

import { trackWizardStep, trackEvent } from "@/lib/analytics";

const STEPS = ["Category", "Service", "Details", "Schedule", "Your Info", "Review"];

type FormData = {
  category: CategoryKey | null;
  service: ServiceKey | null;
  details: Record<string, string>;
  files: { file: File; name: string; size: number }[];
  schedule: { date: string; window: string; urgency: string; timeframe: string };
  info: {
    fullName: string; company: string; phone: string; email: string;
    address: string; region: string; regionOther: string; contactMethod: string; notes: string;
  };
  confirm: boolean;
  newsletterOptIn: boolean;
};

const EMPTY: FormData = {
  category: null,
  service: null,
  details: {},
  files: [],
  schedule: { date: "", window: "", urgency: "", timeframe: "" },
  info: { fullName: "", company: "", phone: "", email: "", address: "", region: "", regionOther: "", contactMethod: "WhatsApp", notes: "" },
  confirm: false,
  newsletterOptIn: true,
};

function RequestServicePage() {
  const content = Route.useLoaderData();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  /** Latest step/data for the deferred auto-advance analytics event. */
  const latestRef = useRef({ step: 0, data: EMPTY });
  latestRef.current = { step, data };

  // Preselect from ?service=<slug>
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const svcParam = params.get("service");
    if (!svcParam) return;
    const match = SERVICES.find((s) => s.key === svcParam);
    if (!match) return;
    setData((d) => (d.service ? d : { ...d, category: match.categories[0], service: match.key }));
    setStep((s) => (s === 0 ? 2 : s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function clearAdvanceTimer() {
    if (advanceTimerRef.current !== null) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }
  useEffect(() => () => clearAdvanceTimer(), []);

  const wizardRef = useRef<HTMLDivElement>(null);
  function keepWizardInView() {
    if (typeof window === "undefined") return;
    const el = wizardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Only scroll if the top of the wizard is above the viewport (user has
    // scrolled past it). Never yank a user who's already focused on the form.
    if (rect.top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function next() {
    if (!validate()) return;
    trackWizardStep({ stepIndex: step, stepName: STEPS[step], method: "next", service: data.service, category: data.category });
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    keepWizardInView();
  }
  function back() {
    clearAdvanceTimer();
    setStep((s) => Math.max(s - 1, 0));
    keepWizardInView();
  }
  /** Schedule an auto-advance ~280ms after a single-select click so the
   * user sees their choice register. Only ever called from user click
   * handlers — never from mount — so hitting Back doesn't trap them. */
  function scheduleAdvance() {
    clearAdvanceTimer();
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      setErrors({});
      const { step: curStep, data: curData } = latestRef.current;
      trackWizardStep({ stepIndex: curStep, stepName: STEPS[curStep], method: "auto", service: curData.service, category: curData.category });
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      keepWizardInView();
    }, 280);
  }


  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      // 1. Upload any attached files to storage first.
      let fileUrls: string[] = [];
      if (data.files.length > 0) {
        const folder = `public/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const uploaded: string[] = [];
        for (const item of data.files) {
          const safeName = item.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${folder}/${safeName}`;
          const { error: upErr } = await supabase.storage
            .from("service-request-uploads")
            .upload(path, item.file, { contentType: item.file.type || undefined, upsert: false });
          if (upErr) throw new Error(`Upload failed for ${item.name}: ${upErr.message}`);
          uploaded.push(path);
        }
        fileUrls = uploaded;
      }

      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const payload = {
        category: data.category,
        service: data.service,
        customer_type: data.category,
        details: data.details,
        preferred_date: data.schedule.date || null,
        preferred_time: data.schedule.window || null,
        region: data.info.region || null,
        name: data.info.fullName,
        email: data.info.email || null,
        phone: data.info.phone,
        company: data.info.company || null,
        contact_method: data.info.contactMethod,
        message: [data.info.address && `Address: ${data.info.address}`, data.info.notes].filter(Boolean).join("\n\n"),
        file_urls: fileUrls,
        utm_source: params?.get("utm_source"),
        utm_medium: params?.get("utm_medium"),
        utm_campaign: params?.get("utm_campaign"),
        utm_term: params?.get("utm_term"),
        utm_content: params?.get("utm_content"),
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        landing_page: typeof window !== "undefined" ? window.location.pathname : null,
      };
      const { data: fnRes, error } = await supabase.functions.invoke<{ reference?: string; error?: string }>(
        "submit-service-request",
        { body: payload },
      );
      if (error || !fnRes?.reference) throw error ?? new Error(fnRes?.error || "Submission failed");
      const ref = fnRes.reference;
      trackWizardStep({ stepIndex: STEPS.length - 1, stepName: STEPS[STEPS.length - 1], method: "submit", service: data.service, category: data.category });
      trackEvent("service_request_submitted", { service: data.service || null, category: data.category || null, reference: ref });

      // Persist summary for the confirmation page (refresh-safe via sessionStorage).
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`cev:req:${ref}`, JSON.stringify({
          reference: ref,
          name: data.info.fullName,
          email: data.info.email,
          phone: data.info.phone,
          contact: data.info.email || data.info.phone,
          service: selected?.name ?? data.service,
          region: data.info.region,
          preferred_date: data.schedule.date,
          preferred_time: data.schedule.window,
          address: data.info.address,
        }));
      }

      if (data.newsletterOptIn && data.info.email) {
        try {
          const { subscribeEmail } = await import("@/components/NewsletterSignup");
          await subscribeEmail(data.info.email, "request-form");
        } catch { /* non-blocking */ }
      }
      navigate({ to: "/request-service/confirmation", search: { ref } as any });
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const ALLOWED_TYPES = /^(image\/(png|jpe?g|webp|heic|gif)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i;
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_FILES = 8;

  function onFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    const rejected: string[] = [];
    const accepted = incoming.filter((f) => {
      if (f.size > MAX_FILE_BYTES) { rejected.push(`${f.name} (too large)`); return false; }
      if (!ALLOWED_TYPES.test(f.type) && !/\.(pdf|docx?|png|jpe?g|webp|heic|gif)$/i.test(f.name)) {
        rejected.push(`${f.name} (unsupported)`); return false;
      }
      return true;
    });
    if (rejected.length) setSubmitError(`Skipped: ${rejected.join(", ")}`);
    setData((d) => {
      const merged = [...d.files, ...accepted.map((file) => ({ file, name: file.name, size: file.size }))].slice(0, MAX_FILES);
      return { ...d, files: merged };
    });
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

  const heroTitle = useEditableText("request-service.hero.title", "Request a Service");
  const heroSubtitle = useEditableText(
    "request-service.hero.subtitle",
    "Tell us what you need and we’ll take care of the rest.",
  );

  return (
    <ContentProvider value={content}>
    <SiteLayout>
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Request a Service" }]}
        imageSrc="/assets/heroes/hero-request-service.webp"
        slot="request_service_hero"
        imageAlt="Customer requesting a CEVONS service online"
        height="compact"
        waveVariant="minimal"
      />



      <section className="container mx-auto px-4 py-6 md:py-8">
        <div ref={wizardRef} className="max-w-3xl mx-auto min-w-0 scroll-mt-24">
          <PromoSlot placement="wizard_step" className="mb-4" />
          {/* SR-only live region announces the new step to assistive tech. */}
          <div className="sr-only" role="status" aria-live="polite">
            {`Step ${step + 1} of ${STEPS.length}, ${STEPS[step]}`}
          </div>
          <AnimatedTruckStepper
            currentStep={step}
            steps={STEPS}
            onStepClick={(i) => i < step && (clearAdvanceTimer(), setStep(i))}
            className="mb-2"
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-5 rounded-2xl border border-border bg-card shadow-sm p-5 md:p-6"
            >
            {step === 0 && <StepCategory data={data} setData={setData} error={errors.category} onAdvance={scheduleAdvance} />}
            {step === 1 && <StepService data={data} setData={setData} error={errors.service} onAdvance={scheduleAdvance} />}
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
                newsletterOptIn={data.newsletterOptIn}
                setNewsletterOptIn={(v) => setData((d) => ({ ...d, newsletterOptIn: v }))}
                error={errors.confirm}
              />
            )}

            {/* Nav */}
            <div className="mt-8 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 border-t border-border pt-6">
              <Button variant="outline" onClick={back} disabled={step === 0} className="h-12">
                <ChevronLeft className="size-4 mr-1" /> <Editable id="request-service.nav.back" label="Back button label" as="span">Back</Editable>
              </Button>
              {/* Steps 0 and 1 auto-advance on selection — Continue would be redundant. */}
              {step >= 2 && step < STEPS.length - 1 && (
                <Button
                  onClick={next}
                  disabled={!canContinue}
                  className="h-12 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)] font-semibold disabled:opacity-50"
                >
                  <Editable id="request-service.nav.continue" label="Continue button label" as="span">Continue</Editable> <ChevronRight className="size-4 ml-1" />
                </Button>
              )}
              {step === STEPS.length - 1 && (
                <Button
                  onClick={submit}
                  disabled={!data.confirm || submitting}
                  className="h-12 bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)] font-semibold disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : <Editable id="request-service.nav.submit" label="Submit button label" as="span">Submit Request</Editable>}
                </Button>
              )}
            </div>
            {submitError && (
              <p className="mt-3 text-sm text-[var(--text-eyebrow)] font-medium">{submitError}</p>
            )}
            </motion.div>
          </AnimatePresence>

          {/* Compact help strip — footnote, not a second decision. */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Editable id="request-service.helpStrip.lead" label="Help strip lead text" as="span">Need help? Call</Editable>{" "}
            <a href={primaryTelHref} className="font-semibold text-[var(--text-link)] hover:underline">{cevonsContact.primaryPhone}</a>
            {" · "}
            <a href={primaryMailtoHref} className="font-semibold text-[var(--text-link)] hover:underline">{cevonsContact.email}</a>
            {" · "}
            <a
              href={whatsappHref}
              {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-semibold text-[var(--text-link)] hover:underline inline-flex items-center gap-1"
            >
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
          </p>
        </div>
      </section>
    </SiteLayout>
    </ContentProvider>
  );
}

/* Stepper removed — AnimatedTruckStepper is the sole progress indicator. */


/* ---------------- Step 1: Category ---------------- */

function StepCategory({ data, setData, error, onAdvance }: { data: FormData; setData: (f: FormData) => void; error?: string; onAdvance: () => void }) {
  return (
    <div>
      <Editable id="request-service.stepCategory.title" label="Category step heading" as="h2" className="text-2xl font-bold">What type of service do you need?</Editable>
      <Editable id="request-service.stepCategory.subtitle" label="Category step helper text" as="p" className="text-muted-foreground mt-1">Choose the category that best matches your project.</Editable>
      {error && <p className="mt-3 text-sm text-destructive flex items-center gap-1"><AlertCircle className="size-4" />{error}</p>}

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {CATEGORIES.map((c) => {
          const active = data.category === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => { setData({ ...data, category: c.key, service: null, details: {} }); onAdvance(); }}
              className={cn(
                "text-left rounded-2xl border-2 p-4 transition-all bg-card group flex items-center gap-4",
                active
                  ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 shadow-md"
                  : "border-border hover:border-[var(--brand-orange)]/60 hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <div
                className={cn(
                  "icon-tile relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden",
                  active
                    ? "ring-2 ring-[var(--brand-orange)] ring-offset-2 ring-offset-card"
                    : "ring-1 ring-black/5",
                )}
              >
                <CevonsIcon group="categories" name={c.iconKey} fill decorative />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold">{c.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{c.desc}</div>
              </div>
              {active && <Check className="size-5 shrink-0 text-[var(--brand-orange)]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 2: Service ---------------- */

function StepService({ data, setData, error, onAdvance }: { data: FormData; setData: (f: FormData) => void; error?: string; onAdvance: () => void }) {
  const list = SERVICES.filter((s) => data.category != null && s.categories.includes(data.category));
  return (
    <div>
      <Editable id="request-service.stepService.title" label="Service step heading" as="h2" className="text-2xl font-bold">Which service?</Editable>
      <Editable id="request-service.stepService.subtitle" label="Service step helper text" as="p" className="text-muted-foreground mt-1">Select the service that best matches your request.</Editable>
      {error && <p className="mt-3 text-sm text-destructive flex items-center gap-1"><AlertCircle className="size-4" />{error}</p>}

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((s) => {
          const active = data.service === s.key;
          const specialist = SPECIALIST_KEYS.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => { setData({ ...data, service: s.key, details: {} }); onAdvance(); }}
              className={cn(
                "text-left rounded-xl border-2 p-3 transition-all bg-card group flex items-center gap-3",
                active
                  ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 shadow-md"
                  : "border-border hover:border-[var(--brand-orange)]/60 hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <div
                className={cn(
                  "icon-tile relative h-12 w-12 shrink-0 rounded-xl overflow-hidden",
                  active
                    ? "ring-2 ring-[var(--brand-orange)] ring-offset-2 ring-offset-card"
                    : "ring-1 ring-black/5",
                )}
              >
                <CevonsIcon group="services" name={s.iconKey} fill decorative />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-snug">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{s.desc}</div>
                {specialist && (
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: "var(--brand-orange)", color: "var(--text-on-orange)" }}
                  >
                    Specialist Review
                  </span>
                )}
              </div>
              {active && <Check className="size-5 shrink-0 text-[var(--brand-orange)]" />}
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
  files: { file: File; name: string; size: number }[];
  onFiles: (f: FileList | null) => void;
  removeFile: (i: number) => void;
}) {
  if (!service) return <div className="text-muted-foreground">Please select a service first.</div>;
  const type = service.detailType;

  return (
    <div>
      <Editable id="request-service.stepDetails.title" label="Details step heading" as="h2" className="text-2xl font-bold">Service Details</Editable>
      <p className="text-muted-foreground mt-1">
        {service.key === "scrap-metal-recycling"
          ? <Editable id="request-service.stepDetails.subtitleScrap" label="Details step helper text (scrap metal)" as="span">Tell us what you're selling so our buying team can prepare an offer.</Editable>
          : <Editable id="request-service.stepDetails.subtitleDefault" label="Details step helper text (default)" as="span">Share a few specifics so our team can prepare.</Editable>}
      </p>


      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {type === "dumpster" && (
          <>
            <Field label="Bin size" full>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { size: "10 cu yd", title: "Builders waste bin", dims: "12 ft × 6 ft × 4 ft", equiv: "≈ 60 garbage bags — about the size of a small car", badge: "Most common" },
                  { size: "20 cu yd", title: "Mid-size roll-off", dims: "", equiv: "The step up from the skip bin for larger clean-outs." },
                  { size: "52 cu yd", title: "Mother of all Bins", dims: "22 ft × 8 ft × 9 ft", equiv: "Our largest skip — for major demolition and industrial jobs" },
                  { size: "Not sure — help me choose", title: "Not sure — help me choose", dims: "", equiv: "We'll recommend the right bin based on your project." },
                ].map((opt) => {
                  const active = details.size === opt.size;
                  return (
                    <button
                      type="button"
                      key={opt.size}
                      onClick={() => setDetail("size", opt.size)}
                      className={`w-full text-left rounded-xl border p-3 flex items-start gap-3 transition-colors ${active ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5" : "border-border hover:border-[var(--brand-orange)]/50"}`}
                    >
                      <div className="shrink-0 w-16 text-center">
                        {opt.size.startsWith("Not sure") ? (
                          <div className="text-xs font-semibold leading-tight pt-1">Not sure</div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold leading-none">{opt.size.split(" ")[0]}</div>
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">cu yd</div>
                          </>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{opt.title}</span>
                          {opt.badge && (
                            <span
                              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                              style={{ background: "var(--brand-orange)", color: "var(--text-on-orange)" }}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.dims && <div className="text-xs text-muted-foreground mt-0.5">{opt.dims}</div>}
                        {opt.equiv && <div className="text-xs mt-1 leading-snug">{opt.equiv}</div>}
                      </div>
                      {active && <Check className="size-5 shrink-0 text-[var(--brand-orange)]" />}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="How many bins?">
              <Input type="number" min="1" max="10" className="h-12" value={details.quantity ?? "1"} onChange={(e) => setDetail("quantity", e.target.value)} />
            </Field>
            <Field label="Waste type">
              <Select value={details.wasteType ?? ""} onValueChange={(v) => setDetail("wasteType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select waste type" /></SelectTrigger>
                <SelectContent>
                  {["Household", "Commercial", "Construction", "Mixed", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Rental duration">
              <Select value={details.duration ?? ""} onValueChange={(v) => setDetail("duration", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select duration" /></SelectTrigger>
                <SelectContent>
                  {["1 day", "3 days", "1 week", "2 weeks", "1 month", "Ongoing", "Not sure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
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

        {type === "compactor" && (
          <>
            <Field label="Compactor type">
              <Select value={details.compactorType ?? ""} onValueChange={(v) => setDetail("compactorType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Static", "Self-contained", "Not sure — advise me"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Waste stream">
              <Select value={details.wasteStream ?? ""} onValueChange={(v) => setDetail("wasteStream", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["General waste", "Cardboard & paper", "Mixed recyclables", "Wet waste", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Estimated volume per week"><Input className="h-12" value={details.volumePerWeek ?? ""} onChange={(e) => setDetail("volumePerWeek", e.target.value)} placeholder="e.g. 6 m³" /></Field>
            <Field label="Rental duration">
              <Select value={details.duration ?? ""} onValueChange={(v) => setDetail("duration", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["1 month", "3 months", "6 months", "12 months", "Ongoing", "Not sure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Power available on site">
              <Select value={details.power ?? ""} onValueChange={(v) => setDetail("power", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Yes", "No", "Not sure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Site access notes" full><Textarea value={details.access ?? ""} onChange={(e) => setDetail("access", e.target.value)} /></Field>
          </>
        )}

        {type === "sweeping" && (
          <>
            <Field label="Area type">
              <Select value={details.areaType ?? ""} onValueChange={(v) => setDetail("areaType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Road", "Car park", "Industrial yard", "Construction site", "Compound", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Approximate area or length"><Input className="h-12" value={details.area ?? ""} onChange={(e) => setDetail("area", e.target.value)} placeholder="e.g. 2 km, or 500 m²" /></Field>
            <Field label="One-time or recurring">
              <Select value={details.cadence ?? ""} onValueChange={(v) => setDetail("cadence", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["One-time", "Recurring"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Frequency">
              <Select value={details.frequency ?? ""} onValueChange={(v) => setDetail("frequency", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Daily", "Weekly", "Bi-weekly", "Monthly"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Debris type">
              <Select value={details.debris ?? ""} onValueChange={(v) => setDetail("debris", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Sand & silt", "Construction debris", "General litter", "Post-event cleanup", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Timing constraints" full><Textarea value={details.timing ?? ""} onChange={(e) => setDetail("timing", e.target.value)} placeholder="e.g. must be done overnight, before opening hours" /></Field>
          </>
        )}

        {type === "recyclables" && (
          <>
            <Field label={service.key === "scrap-metal-recycling" ? "What are you selling?" : "Material type"}>
              <Select value={details.materialType ?? ""} onValueChange={(v) => setDetail("materialType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {(service.key === "scrap-metal-recycling"
                    ? ["Ferrous (steel, iron)", "Non-ferrous (copper, aluminium, brass)", "Scrap cable", "Lead batteries", "Mixed", "Not sure"]
                    : ["PET", "HDPE", "Plastic film", "Mixed plastics", "Not sure"]
                  ).map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label={service.key === "scrap-metal-recycling" ? "Estimated quantity you're selling" : "Estimated quantity / weight"}><Input className="h-12" value={details.quantity ?? ""} onChange={(e) => setDetail("quantity", e.target.value)} placeholder="e.g. 2 tonnes, 10 drums" /></Field>
            <Field label="Collection type">
              <Select value={details.cadence ?? ""} onValueChange={(v) => setDetail("cadence", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["One-off", "Periodic"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="How is it stored">
              <Select value={details.storage ?? ""} onValueChange={(v) => setDetail("storage", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Loose", "Baled", "In containers", "Not sure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={service.key === "scrap-metal-recycling" ? "Do you need us to collect it?" : "Do you need a container on site"}>
              <Select value={details.container ?? ""} onValueChange={(v) => setDetail("container", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Yes", "No", "Not sure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>

            </Field>
            <Field label="Notes" full><Textarea value={details.notes ?? ""} onChange={(e) => setDetail("notes", e.target.value)} /></Field>
          </>
        )}

        {type === "cooking-oil" && (
          <>
            <Field label="Business type">
              <Select value={details.businessType ?? ""} onValueChange={(v) => setDetail("businessType", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Restaurant", "Hotel", "Bakery", "Food processor", "Caterer", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Estimated litres per collection"><Input className="h-12" value={details.litres ?? ""} onChange={(e) => setDetail("litres", e.target.value)} placeholder="e.g. 200 L" /></Field>
            <Field label="Collection frequency">
              <Select value={details.frequency ?? ""} onValueChange={(v) => setDetail("frequency", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Weekly", "Bi-weekly", "Monthly", "On-call", "Not sure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Current storage">
              <Select value={details.storage ?? ""} onValueChange={(v) => setDetail("storage", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Drums", "IBC tank", "Loose containers", "None yet"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Do you need collection containers supplied">
              <Select value={details.containersNeeded ?? ""} onValueChange={(v) => setDetail("containersNeeded", v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Yes", "No", "Not sure"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Notes" full><Textarea value={details.notes ?? ""} onChange={(e) => setDetail("notes", e.target.value)} /></Field>
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
          className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 hover:border-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/5 transition-colors cursor-pointer p-8 text-center"
        >
          <Upload className="size-6 text-[var(--brand-orange)]" />
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
      <h2 className="text-2xl font-bold">
        {isSpecialist
          ? <Editable id="request-service.stepSchedule.titleSpecialist" label="Schedule step heading (specialist)" as="span">Specialist Review</Editable>
          : <Editable id="request-service.stepSchedule.titleDefault" label="Schedule step heading (default)" as="span">Schedule</Editable>}
      </h2>
      <p className="text-muted-foreground mt-1">
        {isSpecialist
          ? <Editable id="request-service.stepSchedule.subtitleSpecialist" label="Schedule step helper text (specialist)" as="span">Tell us when you'd like to be contacted — our specialist team will follow up.</Editable>
          : <Editable id="request-service.stepSchedule.subtitleDefault" label="Schedule step helper text (default)" as="span">Pick your preferred date and time window.</Editable>}
      </p>

      {isSpecialist && (
        <div className="mt-4 rounded-xl border border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/10 p-4 text-sm">
          <Editable id="request-service.stepSchedule.specialistNoticeStrong" label="Specialist notice bold lead" as="strong" className="font-semibold">Specialist Review Required.</Editable>{" "}
          <Editable id="request-service.stepSchedule.specialistNoticeBody" label="Specialist notice body" as="span">Submit your request and a CEVONS team member will contact you by WhatsApp during the same business day.</Editable>
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
      <Editable id="request-service.stepSchedule.footerNote" label="Schedule footer note" as="p" className="mt-4 text-xs text-muted-foreground">All dates and time windows are preferences. Our team will confirm the final schedule.</Editable>
    </div>
  );
}

/* ---------------- Step 5: Your Info ---------------- */

function StepInfo({
  info, setInfo, errors,
}: { info: FormData["info"]; setInfo: (k: keyof FormData["info"], v: string) => void; errors: Record<string, string> }) {
  return (
    <div>
      <Editable id="request-service.stepInfo.title" label="Info step heading" as="h2" className="text-2xl font-bold">Your Information</Editable>
      <Editable id="request-service.stepInfo.subtitle" label="Info step helper text" as="p" className="text-muted-foreground mt-1">So we can reach out and confirm your service.</Editable>
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
            <SelectTrigger className="h-12"><SelectValue placeholder="Select your area" /></SelectTrigger>
            <SelectContent>
              {serviceAreaGroups.map((g) => (
                <SelectGroup key={g.branch}>
                  <SelectLabel>{g.branch} branch</SelectLabel>
                  {g.areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectGroup>
              ))}
              <SelectGroup>
                <SelectItem value={OTHER_AREA_VALUE}>{OTHER_AREA_LABEL}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {info.region && info.region !== OTHER_AREA_VALUE && (
            <p className="text-xs text-muted-foreground">Served by our {branchForArea(info.region)} branch.</p>
          )}
          {info.region === OTHER_AREA_VALUE && (
            <Input
              className="h-12"
              value={info.regionOther}
              onChange={(e) => setInfo("regionOther", e.target.value)}
              placeholder="Type your town or village"
            />
          )}
          {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
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
  data, selected, isSpecialist, confirm, setConfirm, newsletterOptIn, setNewsletterOptIn, error,
}: {
  data: FormData; selected: ServiceMeta | null; isSpecialist: boolean;
  confirm: boolean; setConfirm: (v: boolean) => void;
  newsletterOptIn: boolean; setNewsletterOptIn: (v: boolean) => void;
  error?: string;
}) {
  const detailEntries = useMemo(() => Object.entries(data.details).filter(([, v]) => v), [data.details]);
  const categoryName = CATEGORIES.find((c) => c.key === data.category)?.name ?? "—";
  return (
    <div>
      <Editable id="request-service.stepReview.title" label="Review step heading" as="h2" className="text-2xl font-bold">Review & Submit</Editable>
      <Editable id="request-service.stepReview.subtitle" label="Review step helper text" as="p" className="text-muted-foreground mt-1">Please confirm everything below is correct.</Editable>

      <div className="mt-6 space-y-4">
        <ReviewBlock title="Category">
          <div className="font-medium">{categoryName}</div>
        </ReviewBlock>
        <ReviewBlock title="Service">
          <div className="font-medium">{selected?.name ?? "—"}</div>
          {isSpecialist && <div className="text-sm text-[var(--brand-orange)] font-semibold mt-1">Specialist review required</div>}
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
        <Editable id="request-service.stepReview.confirmLabel" label="Confirm checkbox label" as="span" className="text-sm">I confirm that the information provided is accurate.</Editable>
      </label>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <label className="mt-4 flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={newsletterOptIn}
          onCheckedChange={(v) => setNewsletterOptIn(!!v)}
          className="mt-1"
        />
        <span className="text-sm text-muted-foreground">
          <Editable id="request-service.stepReview.newsletterLabel" label="Newsletter opt-in label" as="span">Keep me updated with CEVONS news &amp; tips.</Editable> <span className="text-xs">(You can uncheck this.)</span>
        </span>
      </label>

      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
        <Editable id="request-service.stepReview.nextTitle" label="What happens next heading" as="div" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What happens next?</Editable>
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal pl-5">
          <li><Editable id="request-service.stepReview.next1" label="Next steps item 1" as="span">Submit your request</Editable></li>
          <li><Editable id="request-service.stepReview.next2" label="Next steps item 2" as="span">Our team reviews the details</Editable></li>
          <li><Editable id="request-service.stepReview.next3" label="Next steps item 3" as="span">We confirm via WhatsApp or phone</Editable></li>
          <li><Editable id="request-service.stepReview.next4" label="Next steps item 4" as="span">Service is scheduled and delivered</Editable></li>
        </ol>
      </div>
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
