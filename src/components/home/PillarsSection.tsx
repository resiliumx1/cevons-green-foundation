import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CevonsIcon } from "@/components/CevonsIcon";
import type { CevonsCategoryKey } from "@/data/cevonsIconRegistry";
import { useMediaSrc } from "@/components/media/useMediaSrc";
import { Editable } from "@/components/Editable";

export type PillarItem = {
  key: string;
  title: string;
  body: string;
  /** Content-string keys, when this pillar's copy is editable from the admin. */
  titleKey?: string;
  bodyKey?: string;
  /** Bundled asset URL (fallback content). */
  img?: string;
  /** Storage path from the media library (CRM-managed content). */
  imagePath?: string;
  /** Editor hooks from `useSiteImage` — empty on the public site. */
  imgProps?: Record<string, string>;
  iconKey: CevonsCategoryKey;
};

function PillarCard({ item, exploreLabel }: { item: PillarItem; exploreLabel: string }) {
  const managed = useMediaSrc(item.imagePath || null);
  const src = managed ?? item.img ?? null;
  return (
    <StaggerItem as="article" className="card-cevons group flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        {src && (
          <img
            {...(item.imgProps ?? {})}
            src={src}
            alt={`${item.title} waste management services in Guyana`}
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cevons-dark/30 to-transparent" />
      </div>
      <div className="relative p-6 pt-12 flex flex-col flex-1">
        <span className="icon-tile absolute -top-8 left-5 h-16 w-16 rounded-2xl overflow-hidden">
          <CevonsIcon group="categories" name={item.iconKey} fill decorative />
        </span>
        <Editable
          id={item.titleKey ?? ""}
          label="Pillar title"
          as="h3"
          className="text-xl font-bold text-cevons-dark min-h-[2rem]"
        >
          {item.title}
        </Editable>
        <Editable
          id={item.bodyKey ?? ""}
          label="Pillar description"
          as="p"
          className="mt-2 text-sm text-cevons-muted leading-relaxed"
        >
          {item.body}
        </Editable>
        <div className="mt-auto pt-6">
          <a
            href="/services"
            aria-label={`${exploreLabel} for ${item.title}`}
            className="group/cta inline-flex items-center justify-center gap-1.5 rounded-full border border-cevons-green/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-link)] transition-all duration-300 hover:border-cevons-green hover:bg-cevons-green hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_rgba(0,107,53,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cevons-green focus-visible:ring-offset-2"
          >
            {exploreLabel}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
          </a>
        </div>
      </div>
    </StaggerItem>
  );
}


/** Core service pillars grid — used by both the hardcoded and CRM-driven homepage. */
export function PillarsSection({
  eyebrow,
  eyebrowKey,
  heading,
  items,
  exploreLabel,
}: {
  eyebrow: string;
  eyebrowKey?: string;
  heading: React.ReactNode;
  items: PillarItem[];
  exploreLabel: string;
}) {
  return (
    <section className="section-y bg-white">
      <div className="container-cevons">
        <Reveal variant="up" className="text-center max-w-2xl mx-auto mb-12">
          <Editable
            id={eyebrowKey ?? ""}
            label="Pillars eyebrow"
            as="p"
            className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-eyebrow)] mb-3"
          >
            {eyebrow}
          </Editable>
          <h2 className="text-3xl md:text-5xl font-extrabold text-cevons-dark">{heading}</h2>
        </Reveal>
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {items.map((item) => (
            <PillarCard key={item.key} item={item} exploreLabel={exploreLabel} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}
