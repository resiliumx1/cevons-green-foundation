import { ArrowRight } from "lucide-react";
import { useLivePromotions, paletteStyle, recordPromotionClick, type Placement } from "@/lib/promotions";

/**
 * Public promotion rendering.
 *
 * Visibility is decided at READ TIME by the database policy and the query
 * window, so nothing here needs a cron job. Colours come from the approved
 * palette set only, so contrast can't be broken from the admin.
 */

function PromoBody({
  id,
  title,
  body,
  ctaLabel,
  ctaHref,
  palette,
  compact,
}: {
  id: string;
  title: string;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  palette: string;
  compact?: boolean;
}) {
  const style = paletteStyle(palette);
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ${compact ? "px-4 py-2.5" : "rounded-2xl px-5 py-4"}`}
      style={{ backgroundColor: style.fill, color: style.text }}
    >
      <p className="text-sm font-bold" style={{ color: style.text }}>
        {title}
      </p>
      {body && (
        <p className="text-sm" style={{ color: style.text, opacity: 0.92 }}>
          {body}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          onClick={() => void recordPromotionClick(id)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-[0.08em] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: style.text,
            color: style.fill,
          }}
        >
          {ctaLabel} <ArrowRight className="size-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
}

export function PromoSlot({
  placement,
  serviceSlug,
  className,
}: {
  placement: Placement;
  serviceSlug?: string;
  className?: string;
}) {
  const { data = [] } = useLivePromotions(placement, serviceSlug);
  if (data.length === 0) return null;
  const p = data[0];
  return (
    <div className={className} role="region" aria-label="Promotion">
      <PromoBody
        id={p.id}
        title={p.title}
        body={p.body}
        ctaLabel={p.cta_label}
        ctaHref={p.cta_href}
        palette={p.palette}
        compact={placement === "site_top_bar"}
      />
    </div>
  );
}
