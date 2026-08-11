import { cleanRows, renderLayout } from "./layout";

export interface ContactMessageEmailInput {
  reference: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  attachmentUrl?: string | null;
  crmUrl: string;
}

export function renderContactMessageEmail(input: ContactMessageEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const rows = cleanRows([
    { label: "Reference", value: input.reference },
    { label: "From", value: input.name },
    { label: "Email", value: input.email },
    { label: "Phone", value: input.phone },
    { label: "Subject", value: input.subject },
    { label: "Attachment", value: input.attachmentUrl },
  ]);

  const { html, text } = renderLayout({
    eyebrow: "New contact message",
    title: input.subject?.trim() || "Website enquiry",
    intro: `A new message was submitted through the website contact form. Reference ${input.reference}.`,
    rows,
    bodyBlock: input.message?.trim()
      ? { heading: "Message", text: input.message.trim() }
      : undefined,
    ctaLabel: "Open in CRM",
    ctaUrl: input.crmUrl,
    footerNote:
      "Sent automatically by the CEVONS website. Replies to this message go to info@cevons.com.",
  });

  return {
    subject: `New contact message ${input.reference}${input.subject ? ` - ${input.subject}` : ""}`,
    html,
    text,
  };
}
