import { Leaf } from "lucide-react";
import {
  cevonsIcons,
  type CevonsIconEntry,
} from "@/data/cevonsIconRegistry";

type IconGroup = "categories" | "services" | "ui";
type SizeVariant = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<SizeVariant, number> = {
  sm: 32,
  md: 48,
  lg: 72,
  xl: 112,
};

export interface CevonsIconProps {
  /** Group + key lookup in the registry */
  group?: IconGroup;
  name?: string;
  /** Or pass a direct icon object */
  icon?: CevonsIconEntry;
  size?: SizeVariant;
  /** Decorative icons get empty alt and aria-hidden */
  decorative?: boolean;
  /** Hero / above-the-fold icons should set eager */
  priority?: boolean;
  className?: string;
}

function resolveIcon(
  group?: IconGroup,
  name?: string,
  icon?: CevonsIconEntry,
): CevonsIconEntry | null {
  if (icon) return icon;
  if (!group || !name) return null;
  const bucket = cevonsIcons[group] as Record<string, CevonsIconEntry>;
  return bucket?.[name] ?? null;
}

export function CevonsIcon({
  group,
  name,
  icon,
  size = "md",
  decorative = false,
  priority = false,
  className,
}: CevonsIconProps) {
  const resolved = resolveIcon(group, name, icon);
  const px = SIZE_PX[size];
  const baseClass = `object-contain inline-block ${className ?? ""}`.trim();

  if (!resolved) {
    return (
      <span
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : "Service icon"}
        aria-hidden={decorative || undefined}
        className={`inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary ${className ?? ""}`}
        style={{ width: px, height: px }}
      >
        <Leaf style={{ width: px * 0.55, height: px * 0.55 }} />
      </span>
    );
  }

  return (
    <img
      src={resolved.src}
      width={px}
      height={px}
      alt={decorative ? "" : resolved.alt}
      aria-hidden={decorative || undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={baseClass}
      draggable={false}
    />
  );
}

export default CevonsIcon;
