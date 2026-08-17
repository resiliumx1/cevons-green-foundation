/**
 * CEVONS operating branches and the Guyanese locations each branch serves.
 * Leads are filed against a specific location (`region`) plus the branch that
 * serves it (`service_branch`).
 */

export type ServiceBranch = "Georgetown" | "Linden" | "Berbice";

export const OTHER_AREA_VALUE = "__other__";
export const OTHER_AREA_LABEL = "My area isn't listed";

export const serviceAreaGroups: { branch: ServiceBranch; areas: string[] }[] = [
  {
    branch: "Georgetown",
    areas: [
      "Georgetown",
      "East Bank Demerara",
      "East Coast Demerara",
      "West Bank Demerara",
      "West Coast Demerara",
      "Vreed-en-Hoop",
      "Parika",
      "Essequibo Coast",
      "Anna Regina",
      "Bartica",
    ],
  },
  {
    branch: "Linden",
    areas: ["Linden", "Kwakwani", "Ituni", "Mabura", "Lethem", "Mahdia"],
  },
  {
    branch: "Berbice",
    areas: [
      "New Amsterdam",
      "Rose Hall",
      "Corriverton",
      "Skeldon",
      "Mahaicony",
      "Mahaica",
      "Fort Wellington",
    ],
  },
];

/** Branch serving a given area, or null when the area is unknown. */
export function branchForArea(area: string | null | undefined): ServiceBranch | null {
  if (!area) return null;
  const group = serviceAreaGroups.find((g) => g.areas.includes(area));
  return group ? group.branch : null;
}
