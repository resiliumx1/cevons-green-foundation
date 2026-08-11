import { cleanRows, renderLayout } from "./layout";

export interface ServiceRequestEmailInput {
  reference: string;
  service?: string | null;
  category?: string | null;
  customerType?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  region?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  contactMethod?: string | null;
  message?: string | null;
  /** Free-form detail fields captured by the wizard. */
  details?: Record<string, unknown> | null;
  fileUrls?: string[] | null;
  crmUrl: string;
}

function prettyLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function detailValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => detailValue(v)).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function renderServiceRequestEmail(input: ServiceRequestEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const detailRows = Object.entries(input.details ?? {}).map(([k, v]) => ({
    label: prettyLabel(k),
    value: detailValue(v),
  }));

  const rows = cleanRows([
    { label: "Reference", value: input.reference },
    { label: "Service", value: input.service },
    { label: "Category", value: input.category },
    { label: "Customer type", value: input.customerType },
    { label: "Customer", value: input.name },
    { label: "Company", value: input.company },
    { label: "Phone", value: input.phone },
    { label: "Email", value: input.email },
    { label: "Location", value: input.region },
    { label: "Preferred date", value: input.preferredDate },
    { label: "Preferred time", value: input.preferredTime },
    { label: "Preferred contact", value: input.contactMethod },
    ...detailRows,
    { label: "Attachments", value: (input.fileUrls ?? []).join("\n") },
  ]);

  const { html, text } = renderLayout({
    eyebrow: "New service request",
    title: input.service?.trim() || "Service request",
    intro: `A new service request was submitted on the website. Reference ${input.reference}.`,
    rows,
    bodyBlock: input.message?.trim()
      ? { heading: "Customer notes", text: input.message.trim() }
      : undefined,
    ctaLabel: "Open in CRM",
    ctaUrl: input.crmUrl,
    footerNote:
      "Sent automatically by the CEVONS website. Replies to this message go to info@cevons.com.",
  });

  return {
    subject: `New service request ${input.reference}${input.service ? ` - ${input.service}` : ""}`,
    html,
    text,
  };
}
