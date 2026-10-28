/**
 * "How did you hear about us?" — shared options for every enquiry form.
 *
 * The stored/sent value is always the machine value (e.g. "truck_decal"),
 * never the display label.
 */
export const HEARD_ABOUT_VALUES = [
  "google",
  "facebook",
  "truck_decal",
  "skip_decal",
  "signage",
  "event",
  "radio",
  "newspaper",
  "word_of_mouth",
  "existing_customer",
  "other",
] as const;

export type HeardAboutValue = (typeof HEARD_ABOUT_VALUES)[number];

export const HEARD_ABOUT_OPTIONS: { value: HeardAboutValue; label: string }[] = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "truck_decal", label: "Saw a CEVONS truck" },
  { value: "skip_decal", label: "Saw a skip bin" },
  { value: "signage", label: "Branch or site signage" },
  { value: "event", label: "Event or banner" },
  { value: "radio", label: "Radio" },
  { value: "newspaper", label: "Newspaper" },
  { value: "word_of_mouth", label: "Word of mouth" },
  { value: "existing_customer", label: "I'm already a customer" },
  { value: "other", label: "Somewhere else" },
];

/** True when the string is one of the approved values. */
export function isHeardAboutValue(value: unknown): value is HeardAboutValue {
  return (
    typeof value === "string" &&
    (HEARD_ABOUT_VALUES as readonly string[]).includes(value)
  );
}
