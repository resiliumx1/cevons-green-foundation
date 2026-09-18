import { renderLayout } from "./layout";

export interface ReportShareEmailInput {
  title: string;
  note?: string | null;
  downloadUrl: string;
}

/** Email that hands someone a secure link to a finished report. */
export function renderReportShareEmail(input: ReportShareEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { html, text } = renderLayout({
    eyebrow: "CEVONS report",
    title: input.title,
    intro: "A report has been shared with you. Use the button below to download it as a PDF.",
    rows: [],
    bodyBlock: input.note?.trim() ? { heading: "Note", text: input.note.trim() } : undefined,
    ctaLabel: "Download the report",
    ctaUrl: input.downloadUrl,
    footerNote: "This download link works for 7 days. Sent from the CEVONS admin.",
  });

  return { subject: `CEVONS report: ${input.title}`, html, text };
}
