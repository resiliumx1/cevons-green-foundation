import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PALETTE_STYLES, type Palette } from "@/lib/pageSections";

/**
 * Promotions are SCHEDULED AT READ TIME. The window is part of the anon SELECT
 * policy and of the query below, so an expired promotion can never stay live
 * and a scheduled one can never stay dark because a job failed to run.
 */

export type Placement = "site_top_bar" | "service_hero" | "wizard_step";

export type Promotion = {
  id: string;
  title: string;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  placement: string;
  target_services: string[];
  palette: string;
  starts_at: string;
  ends_at: string | null;
  published: boolean;
  click_count: number;
  created_at: string;
};

export const PLACEMENTS: Array<{ value: Placement; label: string; hint: string }> = [
  { value: "site_top_bar", label: "Site top bar", hint: "A strip above the header on every page." },
  { value: "service_hero", label: "Service page hero", hint: "Inside the hero of the targeted service pages." },
  { value: "wizard_step", label: "Booking wizard", hint: "Above the steps in the request wizard." },
];

export function paletteStyle(palette: string) {
  return PALETTE_STYLES[(palette as Palette) in PALETTE_STYLES ? (palette as Palette) : "navy"];
}

/** Live promotions for a placement, optionally narrowed to one service slug. */
export function useLivePromotions(placement: Placement, serviceSlug?: string) {
  return useQuery({
    queryKey: ["promotions", placement, serviceSlug ?? "*"],
    queryFn: async (): Promise<Promotion[]> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("placement", placement)
        .eq("published", true)
        .lte("starts_at", nowIso)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Promotion[];
      return rows.filter(
        (p) =>
          p.target_services.length === 0 ||
          (serviceSlug ? p.target_services.includes(serviceSlug) : false),
      );
    },
    staleTime: 60_000,
    retry: 1,
  });
}

/** Fire-and-forget click count. The function can only touch click_count. */
export async function recordPromotionClick(id: string) {
  try {
    await supabase.rpc("increment_promotion_click", { _id: id });
  } catch {
    // A missed count must never block the navigation.
  }
}
