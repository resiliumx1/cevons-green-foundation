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
  /** Fill the parent container edge-to-edge (object-cover) */
  fill?: boolean;
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
  fill = false,
  className,
}: CevonsIconProps) {
  const resolved = resolveIcon(group, name, icon);
  const px = SIZE_PX[size];
  const baseClass = `object-contain inline-block ${className ?? ""}`.trim();

  if (!resolved) {
    if (fill) {
      return (
        <span
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : "Service icon"}
          aria-hidden={decorative || undefined}
          className={`absolute inset-0 flex items-center justify-center bg-primary/10 text-primary ${className ?? ""}`}
        >
          <Leaf className="w-1/2 h-1/2" />
        </span>
      );
    }
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

  if (fill) {
    return (
      <img
        src={resolved.src}
        alt={decorative ? "" : resolved.alt}
        aria-hidden={decorative || undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover ${className ?? ""}`.trim()}
        draggable={false}
      />
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
