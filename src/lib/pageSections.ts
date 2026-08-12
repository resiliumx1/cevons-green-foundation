import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Structured page sections.
 *
 * A page is an ORDERED LIST OF TYPED SECTIONS. Each kind has a Zod schema and
 * a fixed field list, so the editor can only produce shapes the renderer knows
 * how to draw. Colours are chosen from an approved set — never free-form —
 * because free colour pickers are how unreadable pages get shipped.
 *
 * The kinds below map 1:1 onto sections the homepage already renders today.
 */

export const APPROVED_PALETTES = ["navy", "orange", "green"] as const;
export type Palette = (typeof APPROVED_PALETTES)[number];

/** Fill + text pairs that are all AA or better. Text on orange/green is charcoal. */
export const PALETTE_STYLES: Record<Palette, { fill: string; text: string; label: string }> = {
  navy: { fill: "#000080", text: "#FFFFFF", label: "Navy field, white text" },
  orange: { fill: "#EF7700", text: "#1A1A1A", label: "Orange field, charcoal text" },
  green: { fill: "#2DA339", text: "#1A1A1A", label: "Green field, charcoal text" },
};

/* ── Schemas ────────────────────────────────────────────────────────────── */

const heroCopy = z.object({
  lineA: z.string().default(""),
  lineB1: z.string().default(""),
  lineB2: z.string().default(""),
  lead: z.string().default(""),
  ctaPrimaryLabel: z.string().default(""),
  ctaSecondaryLabel: z.string().default(""),
});

const pillarItem = z.object({
  title: z.string().default(""),
  body: z.string().default(""),
  image_path: z.string().default(""),
});

const pillars = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  items: z.array(pillarItem).default([]),
});

const statItem = z.object({
  value: z.string().default(""),
  label: z.string().default(""),
});

const stats = z.object({
  items: z.array(statItem).default([]),
});

const processHeading = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
});

const ctaBanner = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  primaryLabel: z.string().default(""),
  primaryHref: z.string().default("/request-service"),
  secondaryLabel: z.string().default(""),
  secondaryHref: z.string().default("/contact"),
  palette: z.enum(APPROVED_PALETTES).default("navy"),
});

const pageIntro = z.object({
  eyebrow: z.string().default(""),
  title: z.string().default(""),
  subtitle: z.string().default(""),
});

export type HeroCopyPayload = z.infer<typeof heroCopy>;
export type PillarsPayload = z.infer<typeof pillars>;
export type StatsPayload = z.infer<typeof stats>;
export type ProcessHeadingPayload = z.infer<typeof processHeading>;
export type CtaBannerPayload = z.infer<typeof ctaBanner>;
export type PageIntroPayload = z.infer<typeof pageIntro>;

export type SectionKind =
  | "hero_copy"
  | "pillars"
  | "stats"
  | "process_heading"
  | "cta_banner"
  | "page_intro";


export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "image" | "href" }
  | { key: string; label: string; type: "palette" }
  | { key: string; label: string; type: "items"; itemLabel: string; max: number; fields: Field[] };

type KindDef = {
  kind: SectionKind;
  label: string;
  /** Which existing component this section drives. */
  maps: string;
  /** Pages this kind may be added to. */
  pages: string[];
  schema: z.ZodTypeAny;
  fields: Field[];
};


export const SECTION_KINDS: KindDef[] = [
  {
    kind: "hero_copy",
    label: "Homepage hero copy",
    maps: "src/components/home/HomeHero.tsx",
    pages: ["home"],
    schema: heroCopy,
    fields: [
      { key: "lineA", label: "Headline line 1", type: "text" },
      { key: "lineB1", label: "Headline highlight word", type: "text" },
      { key: "lineB2", label: "Headline line 2 remainder", type: "text" },
      { key: "lead", label: "Lead paragraph", type: "textarea" },
      { key: "ctaPrimaryLabel", label: "WhatsApp button label", type: "text" },
      { key: "ctaSecondaryLabel", label: "Book now button label", type: "text" },
    ],
  },
  {
    kind: "pillars",
    label: "Core service pillars",
    maps: "Core service pillars grid in src/routes/index.tsx",
    pages: ["home"],
    schema: pillars,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      {
        key: "items",
        label: "Pillars",
        type: "items",
        itemLabel: "Pillar",
        max: 4,
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Body", type: "textarea" },
          { key: "image_path", label: "Image", type: "image" },
        ],
      },
    ],
  },
  {
    kind: "stats",
    label: "Impact stats band",
    maps: "Impact stats band in src/routes/index.tsx",
    pages: ["home"],
    schema: stats,
    fields: [
      {
        key: "items",
        label: "Figures",
        type: "items",
        itemLabel: "Figure",
        max: 4,
        fields: [
          { key: "value", label: "Figure", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
    ],
  },
  {
    kind: "process_heading",
    label: "Six-step process heading",
    maps: "src/components/home/ProcessSteps.tsx heading",
    pages: ["home"],
    schema: processHeading,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
    ],
  },
  {
    kind: "cta_banner",
    label: "Closing call-to-action banner",
    maps: "src/components/cta/OrangeCTABanner.tsx",
    pages: ["home", "about", "contact", "services"],
    schema: ctaBanner,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "primaryLabel", label: "Primary button label", type: "text" },
      { key: "primaryHref", label: "Primary button link", type: "href" },
      { key: "secondaryLabel", label: "Secondary button label", type: "text" },
      { key: "secondaryHref", label: "Secondary button link", type: "href" },
      { key: "palette", label: "Colour combination", type: "palette" },
    ],
  },
];

/**
 * Page-intro copy for the four non-home pages that render a hero with an
 * eyebrow, heading and standfirst today. Every one of these maps to a
 * component that already exists; nothing here invents a new section.
 */
SECTION_KINDS.push({
  kind: "page_intro",
  label: "Page intro (eyebrow, heading, standfirst)",
  maps: "PageHero / page hero heading block",
  pages: ["about", "careers", "contact", "services"],
  schema: pageIntro,
  fields: [
    { key: "eyebrow", label: "Eyebrow", type: "text" },
    { key: "title", label: "Heading", type: "text" },
    { key: "subtitle", label: "Standfirst", type: "textarea" },
  ],
});

/**
 * Every customer-facing page whose copy is wrapped in <Editable>. `path` is the
 * public URL the on-page editor opens.
 */
export const EDITABLE_PAGES = [
  { value: "home", label: "Homepage", path: "/" },
  { value: "about", label: "About", path: "/about" },
  { value: "services", label: "Services overview", path: "/services" },
  { value: "contact", label: "Contact", path: "/contact" },
  { value: "careers", label: "Careers", path: "/careers" },
  { value: "locations", label: "Locations", path: "/locations" },
  { value: "resources", label: "Resources", path: "/resources" },
  { value: "industries", label: "Industries", path: "/industries" },
  { value: "news-media", label: "News & Media", path: "/news-media" },
  { value: "track-request", label: "Track a request", path: "/track-request" },
  { value: "request-service", label: "Request service", path: "/request-service" },
] as const;


export function kindDef(kind: string): KindDef | undefined {
  return SECTION_KINDS.find((k) => k.kind === kind);
}

/** Parse a stored payload through its schema; never throws. */
export function parsePayload<T = unknown>(kind: string, payload: unknown): T {
  const def = kindDef(kind);
  if (!def) return {} as T;
  const res = def.schema.safeParse(payload ?? {});
  return (res.success ? res.data : def.schema.parse({})) as T;
}

/* ── Rows ───────────────────────────────────────────────────────────────── */

export type PageSection = {
  id: string;
  page: string;
  kind: string;
  position: number;
  payload: unknown;
  /** Staff-only. Absent on public reads — anon has no column access to drafts. */
  draft_payload?: unknown;
  published: boolean;
  updated_at: string;
  updated_by: string | null;
};


/**
 * PUBLIC read. RLS already restricts anon to `published = true`; we filter
 * explicitly for clarity. An empty result means "fall back to the hardcoded
 * components" — the live site must never depend on this table having rows.
 */
export function usePublishedSections(page: string) {
  return useQuery({
    queryKey: ["page_sections", page],
    queryFn: async (): Promise<PageSection[]> => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("id, page, kind, position, payload, draft_payload, published, updated_at, updated_by")
        .eq("page", page)
        .eq("published", true)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PageSection[];
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/**
 * Convenience read for pages that render ONE section of a kind (page intro,
 * closing CTA). Returns `null` when nothing is published, which means the
 * caller keeps its hardcoded copy — the permanent fallback.
 */
export function useSectionPayload<T>(page: string, kind: SectionKind): T | null {
  const { data } = usePublishedSections(page);
  const row = data?.find((s) => s.kind === kind);
  if (!row) return null;
  return parsePayload<T>(kind, row.payload);
}
