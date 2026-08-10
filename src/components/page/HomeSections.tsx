import { ArrowRight, Leaf, Calendar, ClipboardCheck, CheckCircle, FileText, ShieldCheck, Truck } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { CertificationPanel } from "@/components/home/CertificationPanel";
import { LogoCarousel } from "@/components/home/LogoCarousel";
import SocialProofStrip from "@/components/SocialProofStrip";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { Reveal } from "@/components/motion/Reveal";
import { OrangeCTABanner } from "@/components/cta/OrangeCTABanner";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { PillarsSection, type PillarItem } from "@/components/home/PillarsSection";
import { StatsBand } from "@/components/home/StatsBand";
import { useT } from "@/contexts/SettingsContext";
import {
  parsePayload,
  type CtaBannerPayload,
  type HeroCopyPayload,
  type PageSection,
  type PillarsPayload,
  type ProcessHeadingPayload,
  type StatsPayload,
} from "@/lib/pageSections";
import type { CevonsCategoryKey } from "@/data/cevonsIconRegistry";

/**
 * Renders a homepage from `page_sections` rows. Each kind maps onto the exact
 * component the hardcoded homepage already uses, so a CRM-driven page and the
 * fallback page are visually the same thing with different copy.
 */

const PILLAR_ICONS: CevonsCategoryKey[] = ["residential", "commercial", "industrial", "facilities"];

const STEP_ICONS = [FileText, ClipboardCheck, Calendar, Truck, ShieldCheck, CheckCircle];
const STEP_KEYS = ["request", "confirm", "schedule", "dispatch", "service", "complete"] as const;

export function HomeSections({
  sections,
  source = "payload",
}: {
  sections: PageSection[];
  source?: "payload" | "draft_payload";
}) {
  const t = useT();

  return (
    <>
      {sections.map((section) => {
        const raw = source === "draft_payload" ? section.draft_payload : section.payload;

        switch (section.kind) {
          case "hero_copy": {
            const p = parsePayload<HeroCopyPayload>(section.kind, raw);
            return (
              <div key={section.id}>
                <HomeHero content={p} />
                <CertificationPanel />
                <LogoCarousel />
              </div>
            );
          }

          case "pillars": {
            const p = parsePayload<PillarsPayload>(section.kind, raw);
            const items: PillarItem[] = p.items.map((it, i) => ({
              key: `${section.id}-${i}`,
              title: it.title,
              body: it.body,
              imagePath: it.image_path || undefined,
              iconKey: PILLAR_ICONS[i % PILLAR_ICONS.length],
            }));
            return (
              <PillarsSection
                key={section.id}
                eyebrow={p.eyebrow}
                heading={p.title}
                items={items}
                exploreLabel={t("home.pillars.explore")}
              />
            );
          }

          case "stats": {
            const p = parsePayload<StatsPayload>(section.kind, raw);
            return (
              <div key={section.id}>
                <StatsBand items={p.items.map((s) => ({ value: s.value, label: s.label }))} />
                <SocialProofStrip />
              </div>
            );
          }

          case "process_heading": {
            const p = parsePayload<ProcessHeadingPayload>(section.kind, raw);
            return (
              <section key={section.id} className="section-y bg-cevons-cream">
                <div className="container-cevons">
                  <Reveal variant="up" className="text-center max-w-2xl mx-auto mb-14">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3">
                      {p.eyebrow}
                    </p>
                    <h2 className="text-3xl md:text-5xl font-extrabold">{p.title}</h2>
                  </Reveal>
                  <ProcessSteps
                    steps={STEP_KEYS.map((key, i) => ({
                      icon: STEP_ICONS[i],
                      key,
                      step: t("home.process.step"),
                      index: i + 1,
                      title: t(`home.process.items.${key}.title`),
                      body: t(`home.process.items.${key}.body`),
                    }))}
                  />
                </div>
              </section>
            );
          }

          case "cta_banner": {
            const p = parsePayload<CtaBannerPayload>(section.kind, raw);
            return (
              <div key={section.id} id="schedule" data-cta-palette={p.palette}>
                <OrangeCTABanner icon={Leaf} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle}>
                  {p.primaryLabel && (
                    <a href={p.primaryHref} className="cta-btn-primary">
                      {p.primaryLabel} <ArrowRight className="size-5" />
                    </a>
                  )}
                  {p.secondaryLabel && (
                    <a href={p.secondaryHref} className="cta-btn-wa">
                      <WhatsApp className="size-5" /> {p.secondaryLabel}
                    </a>
                  )}
                </OrangeCTABanner>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
