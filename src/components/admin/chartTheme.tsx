import type { TooltipProps } from "recharts";

/** Shared Recharts styling for the CRM (light theme, on-brand). */

export const CRM_AXIS = "#525C6B";
export const CRM_GRID = "#E5E7EB";

/** Solid white card tooltip — used as `contentStyle` fallback. */
export const CRM_TOOLTIP_STYLE: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  color: "#101820",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(16,24,32,0.12)",
  padding: "8px 10px",
};

export const CRM_TOOLTIP_ITEM_STYLE: React.CSSProperties = { color: "#101820" };
export const CRM_TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "#525C6B",
  fontWeight: 600,
  marginBottom: 4,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

type Formatter = (value: number | string, name?: string) => string;

type CrmTooltipExtra = {
  valueFormatter?: Formatter;
  labelFormatter?: (label: string | number) => string;
};

/** Custom tooltip content: solid white card, label + series rows. */
export function CrmTooltip(
  props: TooltipProps<number, string> & CrmTooltipExtra,
) {
  const { active, payload, label, valueFormatter, labelFormatter } = props;
  if (!active || !payload || payload.length === 0) return null;

  const fmt = valueFormatter ?? ((v: number | string) => String(v));
  const lbl = labelFormatter
    ? labelFormatter(label as string | number)
    : (label as string | number | undefined);

  return (
    <div style={CRM_TOOLTIP_STYLE} className="crm-chart-tooltip">
      {lbl !== undefined && lbl !== "" && (
        <div style={CRM_TOOLTIP_LABEL_STYLE}>{String(lbl)}</div>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => {
          const seriesName =
            (p.payload &&
              typeof p.payload === "object" &&
              "label" in (p.payload as Record<string, unknown>) &&
              ((p.payload as { label?: string }).label as string)) ||
            (p.name as string | undefined) ||
            "";
          const raw = p.value as number | string;
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-[12px]"
              style={{ color: "#101820" }}
            >
              {p.color && (
                <span
                  aria-hidden
                  style={{
                    background: p.color as string,
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    display: "inline-block",
                  }}
                />
              )}
              {seriesName && (
                <span className="text-[#525C6B]">{seriesName}</span>
              )}
              <span className="ml-auto font-semibold tabular-nums">
                {fmt(raw, p.name as string | undefined)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CRM_TOOLTIP_CURSOR = { fill: "rgba(0,107,53,0.06)" };
export const CRM_TOOLTIP_LINE_CURSOR = {
  stroke: "#94A3B8",
  strokeWidth: 1,
  strokeDasharray: "3 3",
};
