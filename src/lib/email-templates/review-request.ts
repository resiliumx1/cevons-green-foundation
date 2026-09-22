import { cleanRows, renderLayout } from "./layout";

export interface ReviewRequestEmailInput {
  name?: string | null;
  service?: string | null;
  reference?: string | null;
  reviewUrl: string;
}

/**
 * Polite post-job follow-up asking the customer to rate CEVONS on Google.
 * Contains no invented details — only the job facts already on the request.
 */
export function renderReviewRequestEmail(input: ReviewRequestEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = (input.name ?? "").trim().split(/\s+/)[0] || "";
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";

  const rows = cleanRows([
    { label: "Service", value: input.service },
    { label: "Reference", value: input.reference },
  ]);

  const { html, text } = renderLayout({
    eyebrow: "Thank you",
    title: "How did we do?",
    intro: `${greeting} thank you for choosing CEVONS. If you have a moment, we would appreciate a short review — it helps our team and helps other customers in Guyana find us.`,
    rows,
    ctaLabel: "Leave a Google review",
    ctaUrl: input.reviewUrl,
    footerNote:
      "If anything about your service was not right, simply reply to this email and our team will look into it. Replies go to info@cevons.com.",
  });

  return {
    subject: "Thank you from CEVONS — how did we do?",
    html,
    text,
  };
}
