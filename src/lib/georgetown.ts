/**
 * Georgetown, Guyana runs at a fixed UTC−4 all year (no DST), so the whole
 * conversion is a constant offset. Everything is STORED in UTC; every input
 * and label in the admin is Georgetown time and says so.
 */
export const GEORGETOWN_OFFSET_MS = 4 * 60 * 60 * 1000;
export const GEORGETOWN_LABEL = "Georgetown time (UTC−4)";

/** UTC ISO string → value for an <input type="datetime-local">. */
export function utcToGeorgetownInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - GEORGETOWN_OFFSET_MS).toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value (Georgetown) → UTC ISO string. */
export function georgetownInputToUtc(value: string): string | null {
  if (!value) return null;
  const asUtc = new Date(`${value}:00Z`);
  if (Number.isNaN(asUtc.getTime())) return null;
  return new Date(asUtc.getTime() + GEORGETOWN_OFFSET_MS).toISOString();
}

/** Human label, always suffixed GYT so nobody guesses the zone. */
export function georgetownLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Guyana",
  }).format(d)} GYT`;
}
