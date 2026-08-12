import { useState } from "react";
import { Check } from "lucide-react";
import { Editable, useEditableText, usePageContent } from "@/components/Editable";
import { useSiteImage } from "@/lib/siteImages";

export type BinSizeOption = {
  id: string;
  label: string;
  tagline: string;
  /** Omitted when we have no client-sourced dimensions for the container. */
  dimensions?: string;
  /** Omitted when we have no client-sourced capacity for the container. */
  capacity?: string;
  bestFor?: string[];
  image: string;
  imageAlt: string;
  /**
   * Named image slot. When given, the photo becomes replaceable from the
   * on-page editor and from /admin/images; `image`/`imageAlt` stay the
   * bundled fallback, so nothing changes until someone replaces it.
   */
  imageSlot?: string;
};

/**
 * One card photo. Split into its own component so each option can call
 * `useSiteImage` without breaking the rules of hooks. Every option's image
 * stays mounted (inactive ones faded out) so the editor can list and target
 * all of them, not just the visible one.
 */
function SizeImage({ option, active }: { option: BinSizeOption; active: boolean }) {
  const photo = useSiteImage(option.imageSlot ?? "", option.image, option.imageAlt);
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      loading="lazy"
      aria-hidden={!active}
      className={[
        "absolute inset-0 block size-full object-cover transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
      {...photo.editorProps}
    />
  );
}


export function BinSizeSelector({ options, eyebrow, heading, intro, keyBase }: {
  options: BinSizeOption[];
  eyebrow?: string;
  heading: string;
  intro?: string;
  /**
   * Content-layer prefix, e.g. `service.skip-bin-dumpster-rental`. When given,
   * every string in this section becomes editable under `<keyBase>.sizes.*`.
   */
  keyBase?: string;
}) {
  const [activeId, setActiveId] = useState(options[0]?.id);
  // In staff preview mode every slot renders (even when empty) so an editor can
  // click into it. Public visitors never see an empty slot or a placeholder.
  const { preview } = usePageContent();
  const active = options.find((o) => o.id === activeId) ?? options[0];
  const k = (suffix: string) => (keyBase ? `${keyBase}.sizes.${suffix}` : `sizes.${suffix}`);

  // Hooks must run unconditionally, so resolve the labels before bailing out.
  const activeIdx = Math.max(0, options.findIndex((o) => o.id === active?.id));
  const activeLabel = useEditableText(k(`${activeIdx}.label`), active?.label ?? "");
  const dimensionsLabel = useEditableText(k("dimensions-label"), "Dimensions");
  const capacityLabel = useEditableText(k("capacity-label"), "Capacity");
  const bestForLabel = useEditableText(k("best-for-label"), "Best for");

  if (!active) return null;

  return (
    <section className="py-12 md:py-16 bg-[var(--surface-page)]">
      <div className="container-cevons">
        <div className="max-w-3xl mb-10 md:mb-12">
          {eyebrow && (
            <Editable
              as="p"
              id={k("eyebrow")}
              label="Size selector eyebrow"
              className="text-xs md:text-sm font-bold uppercase tracking-[0.22em] text-[var(--brand-orange)] mb-3"
            >
              {eyebrow}
            </Editable>
          )}
          <Editable
            as="h2"
            id={k("heading")}
            label="Size selector heading"
            className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-[var(--text-heading)]"
          >
            {heading}
          </Editable>
          {intro && (
            <Editable
              as="p"
              id={k("intro")}
              label="Size selector intro"
              className="mt-4 text-base md:text-lg text-[var(--text-body)] leading-relaxed"
            >
              {intro}
            </Editable>
          )}
        </div>

        {/* Size chip selector */}
        <div
          role="tablist"
          aria-label="Choose a bin size"
          className="flex flex-wrap gap-3 mb-8"
        >
          {options.map((o, i) => {
            const isActive = o.id === activeId;
            return (
              <button
                key={o.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(o.id)}
                // The content editor swallows clicks on editable text (it opens
                // the editor instead), so in preview mode the chip label would
                // never switch the card. Selecting on pointer-down runs first
                // and keeps the tabs usable while editing.
                onPointerDownCapture={() => setActiveId(o.id)}
                className={[
                  "group relative inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm md:text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2",
                  isActive
                    ? "bg-[var(--brand-orange)] text-[var(--brand-charcoal)] shadow-[0_8px_24px_-8px_rgba(239,119,0,0.55)]"
                    : "bg-[var(--surface-emphasis)] text-[var(--text-heading)] border-2 border-[var(--border-hairline,#e5e7eb)] hover:border-[var(--brand-orange)]",
                ].join(" ")}
              >
                {isActive && <Check className="size-4" strokeWidth={3} />}
                <Editable id={k(`${i}.label`)} label={`Size ${i + 1} name`} as="span">
                  {o.label}
                </Editable>
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
          {/* No fixed ratio, no padding and no background: the source images
              already carry their own backdrop, so a second one only shows up
              as dead space around the picture. The image fills the card edge
              to edge at its natural ratio. */}
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5">
            <img
              key={active.id}
              src={active.image}
              alt={active.imageAlt}
              loading="lazy"
              className="block w-full h-auto animate-in fade-in duration-300"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-orange)] mb-3">
              {activeLabel}
            </p>
            <Editable
              as="h3"
              id={k(`${activeIdx}.tagline`)}
              label={`Size ${activeIdx + 1} description`}
              className="text-xl md:text-2xl font-extrabold text-[var(--text-heading)] mb-4 leading-tight"
            >
              {active.tagline}
            </Editable>
            {(preview || active.dimensions || active.capacity) && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {(preview || active.dimensions) && (
                  <div className="rounded-xl bg-[var(--surface-emphasis)] ring-1 ring-black/5 p-4">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-body)]">{dimensionsLabel}</dt>
                    <dd className="mt-1 text-base font-semibold text-[var(--text-heading)]">
                      <Editable id={k(`${activeIdx}.dimensions`)} label={`Size ${activeIdx + 1} dimensions`}>
                        {active.dimensions ?? "Add dimensions"}
                      </Editable>
                    </dd>
                  </div>
                )}
                {(preview || active.capacity) && (
                  <div className="rounded-xl bg-[var(--surface-emphasis)] ring-1 ring-black/5 p-4">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-body)]">{capacityLabel}</dt>
                    <dd className="mt-1 text-base font-semibold text-[var(--text-heading)]">
                      <Editable id={k(`${activeIdx}.capacity`)} label={`Size ${activeIdx + 1} capacity`}>
                        {active.capacity ?? "Add capacity"}
                      </Editable>
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {(preview || (active.bestFor && active.bestFor.length > 0)) && (
              <>
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--text-body)] mb-3">{bestForLabel}</p>
                <ul className="space-y-2">
                  {(active.bestFor && active.bestFor.length > 0
                    ? active.bestFor
                    : ["Add a use case", "Add a use case", "Add a use case"]
                  ).map((b, bi) => (
                    <li key={`${b}-${bi}`} className="flex items-start gap-2 text-[var(--text-heading)]">
                      <Check className="size-5 shrink-0 text-[var(--brand-orange)] mt-0.5" strokeWidth={2.5} />
                      <Editable id={k(`${activeIdx}.best-for.${bi}`)} label={`Size ${activeIdx + 1} best for ${bi + 1}`} as="span">
                        {b}
                      </Editable>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
