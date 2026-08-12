import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMediaUrl } from "@/lib/mediaUrl";

/**
 * NAMED IMAGE SLOTS.
 *
 * Every replaceable photo on the public site is a slot: a stable key, a human
 * label, the page it lives on, a recommended aspect ratio, and the BUNDLED
 * DEFAULT that ships with the code.
 *
 * The `site_images` table only ever holds OVERRIDES. When it is empty the site
 * renders exactly what it rendered before this feature existed — the defaults
 * below are the source of truth, not the database.
 *
 * Rendered width/height attributes stay owned by the components, so replacing
 * a photo can never shift a layout: the box is fixed, the picture inside it
 * is cropped to fill.
 */

/* ── Bundled defaults ───────────────────────────────────────────────────── */

import heroSlide1Asset from "@/assets/slide-skip-hi-landscape.webp.asset.json";
import residentialWheelieBinAsset from "@/assets/residential-wheelie-bin.webp.asset.json";
import svcCommercialAsset from "@/assets/commercial-red-bin-v2.png.asset.json";
import svcIndustrialAsset from "@/assets/cevons-red-truck-industrial.webp.asset.json";
import svcRecoveryAsset from "@/assets/recycling-facility.jpg.asset.json";


import svcBiohazard from "@/assets/svc-biohazard.jpg";
import svcIndustrial from "@/assets/svc-industrial.jpg";
import svcSoil from "@/assets/svc-soil.jpg";
import svcShred from "@/assets/svc-shred.jpg";
import svcDumpster from "@/assets/svc-dumpster.jpg";
import svcGarbage from "@/assets/svc-garbage.jpg";
import commercialWasteHeroAsset from "@/assets/commercial-waste-hero.jpeg.asset.json";
import svcGrease from "@/assets/svc-grease.jpg";
import hazardousDrumsAsset from "@/assets/hazardous-waste-drums.webp.asset.json";
import svcLandfill from "@/assets/svc-landfill.jpg";
import svcRecovery from "@/assets/svc-recovery.jpg";
import plasticRecyclingAsset from "@/assets/plastic-recycling-hero.jpg.asset.json";
import portableToiletHeroAsset from "@/assets/portable-toilet-hero.png.asset.json";
import svcDestruction from "@/assets/svc-destruction.jpg";
import svcCommercial from "@/assets/svc-commercial.jpg";
import scrapMetalBalesAsset from "@/assets/scrap-metal-bales.webp.asset.json";
import svcSeptic from "@/assets/svc-septic.jpg";
import svcSkip from "@/assets/svc-skip.jpg";
import svcTank from "@/assets/svc-tank.jpg";
import svcOil from "@/assets/svc-oil.jpg";
import svcWastewater from "@/assets/svc-wastewater.jpg";

const url = (a: { url: string }) => a.url;

/* ── Registry ───────────────────────────────────────────────────────────── */

export type SlotDef = {
  /** Stable key. Never rename — it is the primary key in `site_images`. */
  key: string;
  label: string;
  /** Grouping label shown in the admin. */
  page: string;
  /** Recommended aspect ratio, width / height. */
  ratio: [number, number];
  /** The bundled default shipped with the code. */
  defaultSrc: string;
  defaultAlt: string;
  /** Where it is rendered — shown in the admin so nobody guesses. */
  usedIn: string;
};

const svc = (
  key: string,
  label: string,
  defaultSrc: string,
  defaultAlt: string,
  route: string,
): SlotDef => ({
  key,
  label,
  page: "Service pages",
  ratio: [4, 3],
  defaultSrc,
  defaultAlt,
  usedIn: `src/routes/${route}.tsx → ServicePageTemplate hero`,
});

export const SITE_IMAGE_SLOTS: SlotDef[] = [
  /* Homepage */
  {
    key: "home_hero_slide_1",
    label: "Homepage hero — first slide",
    page: "Homepage",
    ratio: [16, 9],
    defaultSrc: url(heroSlide1Asset),
    defaultAlt: "CEVONS skip bin being delivered on a Georgetown work site",
    usedIn: "src/components/home/HeroSlideshow.tsx (fallback slide 1)",
  },
  {
    key: "home_pillar_residential",
    label: "Core services — Residential card",
    page: "Homepage",
    ratio: [4, 3],
    defaultSrc: url(residentialWheelieBinAsset),
    defaultAlt: "CEVONS residential wheelie bin at a Guyanese home",
    usedIn: "src/routes/index.tsx core service pillars",
  },
  {
    key: "home_pillar_commercial",
    label: "Core services — Commercial card",
    page: "Homepage",
    ratio: [4, 3],
    defaultSrc: url(svcCommercialAsset),
    defaultAlt: "Red CEVONS commercial bin outside a business",
    usedIn: "src/routes/index.tsx core service pillars",
  },
  {
    key: "home_pillar_industrial",
    label: "Core services — Industrial card",
    page: "Homepage",
    ratio: [4, 3],
    defaultSrc: url(svcIndustrialAsset),
    defaultAlt: "CEVONS red haulage truck on an industrial site",
    usedIn: "src/routes/index.tsx core service pillars",
  },
  {
    key: "home_pillar_recovery",
    label: "Core services — Recycling & facilities card",
    page: "Homepage",
    ratio: [4, 3],
    defaultSrc: url(svcRecoveryAsset),
    defaultAlt: "Sorting line inside the CEVONS material recovery facility",
    usedIn: "src/routes/index.tsx core service pillars",
  },

  /* Standalone pages */
  {
    key: "about_hero",
    label: "About — hero photo",
    page: "About",
    ratio: [3, 2],
    defaultSrc: "/assets/heroes/about-support-hero.webp",
    defaultAlt: "CEVONS front-office team supporting a customer inquiry at the Georgetown office",
    usedIn: "src/routes/about.tsx hero",
  },
  {
    key: "careers_hero",
    label: "Careers — hero photo",
    page: "Careers",
    ratio: [3, 2],
    defaultSrc: "/assets/heroes/careers-boardroom-hero.webp",
    defaultAlt: "CEVONS team members reviewing service offerings during a boardroom presentation",
    usedIn: "src/routes/careers.tsx hero",
  },
  {
    key: "contact_hero",
    label: "Contact — hero photo",
    page: "Contact",
    ratio: [16, 9],
    defaultSrc: "/assets/heroes/contact-portrait-hero.webp",
    defaultAlt: "CEVONS customer care representative on a call at the Georgetown office",
    usedIn: "src/routes/contact.tsx → PageHero",
  },
  {
    key: "locations_hero",
    label: "Locations — hero photo",
    page: "Locations",
    ratio: [16, 9],
    defaultSrc: "/assets/heroes/hero-locations.webp",
    defaultAlt: "CEVONS service vehicle on the road in Guyana",
    usedIn: "src/routes/locations.tsx → PageHero",
  },
  {
    key: "request_service_hero",
    label: "Book a service — hero photo",
    page: "Book a service",
    ratio: [16, 9],
    defaultSrc: "/assets/heroes/hero-request-service.webp",
    defaultAlt: "CEVONS crew loading waste on a customer site",
    usedIn: "src/routes/request-service.index.tsx → PageHero",
  },
  {
    key: "track_request_hero",
    label: "Track a request — hero photo",
    page: "Track a request",
    ratio: [16, 9],
    defaultSrc: "/assets/heroes/hero-track-request.webp",
    defaultAlt: "CEVONS dispatch team coordinating collections",
    usedIn: "src/routes/track-request.tsx → PageHero",
  },

  /* Service page heroes */
  svc("svc_biohazardous_disposal_hero", "Biohazardous disposal — hero", svcBiohazard, "Biohazardous waste handling by CEVONS technicians", "services.biohazardous-disposal"),
  svc("svc_compactor_rental_hero", "Compactor rental — hero", svcIndustrial, "Waste compactor installed at an industrial site", "services.compactor-rental"),
  svc("svc_contaminated_soil_hero", "Contaminated soil — hero", svcSoil, "Contaminated soil remediation works", "services.contaminated-soil"),
  svc("svc_document_shredding_hero", "Document shredding — hero", svcShred, "Secure document shredding service", "services.document-shredding"),
  svc("svc_dumpster_rental_hero", "Dumpster rental — hero", svcDumpster, "CEVONS dumpster placed on a customer site", "services.dumpster-rental"),
  svc("svc_general_trash_collection_hero", "General trash collection — hero", svcGarbage, "CEVONS collection truck servicing bins", "services.general-trash-collection"),
  svc("svc_general_waste_management_hero", "Commercial waste management — hero", url(commercialWasteHeroAsset), "Red CEVONS commercial waste bin at a business premises", "services.general-waste-management"),
  svc("svc_grease_trap_septic_hero", "Grease trap & septic tank — hero", svcGrease, "Grease trap servicing by a CEVONS crew", "services.grease-trap-septic-tank"),
  svc("svc_hazardous_waste_hero", "Hazardous waste — hero", url(hazardousDrumsAsset), "Labelled hazardous waste drums staged for collection", "services.hazardous-waste"),
  svc("svc_landfill_operations_hero", "Landfill operations — hero", svcLandfill, "Landfill operations managed by CEVONS", "services.landfill-operations"),
  svc("svc_material_recovery_hero", "Material recovery facility — hero", svcRecovery, "Material recovery facility sorting line", "services.material-recovery-facility"),
  svc("svc_plastic_recycling_hero", "Plastic recycling — hero", url(plasticRecyclingAsset), "Baled plastic ready for recycling", "services.plastic-recycling"),
  svc("svc_portable_toilet_hero", "Portable toilet rental — hero", url(portableToiletHeroAsset), "CEVONS portable toilet unit on a work site", "services.portable-toilet"),
  svc("svc_product_destruction_hero", "Product destruction — hero", svcDestruction, "Secure product destruction process", "services.product-destruction"),
  svc("svc_road_sweeping_hero", "Road sweeping — hero", svcCommercial, "Road sweeping service in progress", "services.road-sweeping"),
  svc("svc_scrap_metal_hero", "Scrap metal — hero", url(scrapMetalBalesAsset), "Baled scrap metal at the CEVONS yard", "services.scrap-metal-recycling"),
  svc("svc_septic_services_hero", "Septic services — hero", svcSeptic, "Septic tank pumping by a CEVONS vacuum truck", "services.septic-services"),
  svc("svc_skip_bin_hero", "Skip bin & dumpster rental — hero", svcSkip, "CEVONS skip bin ready for collection", "services.skip-bin-dumpster-rental"),
  svc("svc_tank_cleaning_hero", "Tank cleaning — hero", svcTank, "Industrial tank cleaning operation", "services.tank-cleaning"),
  svc("svc_used_cooking_oil_hero", "Used cooking oil — hero", svcOil, "Used cooking oil collection containers", "services.used-cooking-oil"),
  svc("svc_used_waste_oil_hero", "Used waste oil — hero", svcOil, "Waste oil collection and handling", "services.used-waste-oil"),
  svc("svc_wastewater_hero", "Wastewater — hero", svcWastewater, "Wastewater treatment operations", "services.wastewater"),
];

export const SLOTS_BY_KEY: Record<string, SlotDef> = Object.fromEntries(
  SITE_IMAGE_SLOTS.map((s) => [s.key, s]),
);

/** Slot keys grouped by page, in registry order. */
export function slotsByPage(): Array<{ page: string; slots: SlotDef[] }> {
  const out: Array<{ page: string; slots: SlotDef[] }> = [];
  for (const s of SITE_IMAGE_SLOTS) {
    const bucket = out.find((g) => g.page === s.page);
    if (bucket) bucket.slots.push(s);
    else out.push({ page: s.page, slots: [s] });
  }
  return out;
}

/* ── Rows ───────────────────────────────────────────────────────────────── */

export type SiteImageRow = {
  slot: string;
  image_path: string | null;
  image_w: number | null;
  image_h: number | null;
  alt: string | null;
  updated_at: string;
  updated_by?: string | null;
  /* Staff preview only — anon has no column privilege on these. */
  draft_image_path?: string | null;
  draft_image_w?: number | null;
  draft_image_h?: number | null;
  draft_alt?: string | null;
};

/** Columns a visitor is allowed to read. Must match the anon column grant. */
const PUBLIC_COLUMNS = "slot, image_path, image_w, image_h, alt, updated_at";
const STAFF_COLUMNS = `${PUBLIC_COLUMNS}, updated_by, draft_image_path, draft_image_w, draft_image_h, draft_alt`;

/**
 * All overrides, one query, cached. Empty result = the site uses defaults.
 *
 * In a staff preview session the draft columns come along too, so the editor
 * can show a staged photo before it is published.
 */
export function useSiteImageOverrides(preview = false) {
  return useQuery({
    queryKey: ["site_images", preview],
    queryFn: async (): Promise<SiteImageRow[]> => {
      // The column list is chosen at runtime, so the generated select-string
      // types cannot narrow it; the row shape is asserted instead.
      const { data, error } = await supabase
        .from("site_images")
        .select(preview ? STAFF_COLUMNS : (PUBLIC_COLUMNS as never));
      if (error) throw error;
      return (data ?? []) as unknown as SiteImageRow[];
    },

    staleTime: preview ? 0 : 5 * 60_000,
    retry: 1,
  });
}

export type ResolvedSiteImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  isOverride: boolean;
  /** True when the rendered picture is an unpublished draft. */
  isDraft: boolean;
  /**
   * Spread onto the rendered <img>. Empty for the public site; in a staff
   * preview it tags the node so the editor can outline it and open the picker.
   */
  editorProps: Record<string, string>;
};

/**
 * The override when one exists and resolves, otherwise the bundled default.
 *
 * `fallbackSrc` / `fallbackAlt` let a component keep owning its own default
 * (service pages pass the asset they already imported); when omitted the
 * registry default is used.
 */
export function useSiteImage(
  slot: string,
  fallbackSrc?: string,
  fallbackAlt?: string,
): ResolvedSiteImage {
  const def = SLOTS_BY_KEY[slot];
  const { preview } = useImageEditing();
  const editorProps: Record<string, string> =
    preview && def ? { "data-image-slot": slot } : {};

  const editorProps = preview && def ? { "data-image-slot": slot } : {};
  const base: ResolvedSiteImage = {
    src: fallbackSrc ?? def?.defaultSrc ?? "",
    alt: fallbackAlt ?? def?.defaultAlt ?? "",
    isOverride: false,
    isDraft: false,
    editorProps,
  };

  const { data } = useSiteImageOverrides(preview);
  const row = data?.find((r) => r.slot === slot);
  // A draft only ever renders inside a verified staff preview session.
  const useDraft = preview && !!row?.draft_image_path;
  const path = useDraft ? row?.draft_image_path : row?.image_path;
  const alt = (useDraft ? row?.draft_alt : row?.alt) ?? base.alt;
  const w = (useDraft ? row?.draft_image_w : row?.image_w) ?? undefined;
  const h = (useDraft ? row?.draft_image_h : row?.image_h) ?? undefined;
  const [resolved, setResolved] = useState<ResolvedSiteImage | null>(null);

  useEffect(() => {
    let alive = true;
    if (!path) {
      setResolved(null);
      return;
    }
    void getMediaUrl(path).then((u) => {
      if (!alive || !u) return;
      setResolved({
        src: u,
        alt,
        width: w,
        height: h,
        isOverride: true,
        isDraft: useDraft,
        editorProps,
      });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, alt, w, h, useDraft, preview]);

  return resolved ?? base;
}


/** How far an uploaded image's ratio may drift before we warn. */
export const RATIO_TOLERANCE = 0.2;

export function ratioLabel(ratio: [number, number]) {
  return `${ratio[0]}:${ratio[1]}`;
}

export function ratioDrift(ratio: [number, number], w: number, h: number) {
  if (!w || !h) return 0;
  const want = ratio[0] / ratio[1];
  const got = w / h;
  return Math.abs(got - want) / want;
}
