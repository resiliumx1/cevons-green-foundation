/**
 * Shared, email-client-safe layout helpers.
 *
 * Rules applied here:
 *  - tables only (no flexbox / grid), inline styles only, no external CSS
 *  - max width 600px
 *  - CEVONS navy #000080 header band with white text
 *  - orange #EF7700 buttons ALWAYS use charcoal #1A1A1A text
 *    (white on orange is 2.87:1 and fails, so it is never used)
 */

export const BRAND = {
  navy: "#000080",
  orange: "#EF7700",
  charcoal: "#1A1A1A",
  grey: "#4A4A4A",
  border: "#E2E5EC",
  surface: "#F7F8FB",
  white: "#FFFFFF",
} as const;

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface Row {
  label: string;
  value: string | null | undefined;
}

/** Drops empty rows so we never render blank or invented values. */
export function cleanRows(rows: Row[]): Array<{ label: string; value: string }> {
  return rows
    .map((r) => ({ label: r.label, value: String(r.value ?? "").trim() }))
    .filter((r) => r.value.length > 0);
}

function rowsToHtml(rows: Array<{ label: string; value: string }>): string {
  return rows
    .map((r, i) => {
      const bg = i % 2 === 0 ? BRAND.surface : BRAND.white;
      return `
        <tr>
          <td style="padding:10px 16px;background:${bg};border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${BRAND.grey};width:38%;vertical-align:top;">${escapeHtml(r.label)}</td>
          <td style="padding:10px 16px;background:${bg};border-bottom:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:${BRAND.charcoal};font-weight:bold;vertical-align:top;">${escapeHtml(r.value).replace(/\n/g, "<br />")}</td>
        </tr>`;
    })
    .join("");
}

function rowsToText(rows: Array<{ label: string; value: string }>): string {
  return rows.map((r) => `${r.label}: ${r.value}`).join("\n");
}

export interface LayoutInput {
  eyebrow: string;
  title: string;
  intro: string;
  rows: Array<{ label: string; value: string }>;
  bodyBlock?: { heading: string; text: string } | undefined;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
}

export function renderLayout(input: LayoutInput): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.white};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.intro)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.white};">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;border:1px solid ${BRAND.border};border-radius:12px;">
            <tr>
              <td style="background:${BRAND.navy};padding:22px 24px;border-radius:12px 12px 0 0;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;">${escapeHtml(input.eyebrow)}</p>
                <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;font-weight:bold;color:#FFFFFF;">${escapeHtml(input.title)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${BRAND.charcoal};">${escapeHtml(input.intro)}</td>
            </tr>
            <tr>
              <td style="padding:8px 24px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BRAND.border};border-radius:8px;border-collapse:separate;">
                  ${rowsToHtml(input.rows)}
                </table>
              </td>
            </tr>
            ${
              input.bodyBlock
                ? `<tr>
              <td style="padding:18px 24px 0;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 6px;font-size:13px;color:${BRAND.grey};">${escapeHtml(input.bodyBlock.heading)}</p>
                <div style="padding:14px 16px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;font-size:14px;line-height:22px;color:${BRAND.charcoal};">${escapeHtml(input.bodyBlock.text).replace(/\n/g, "<br />")}</div>
              </td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:22px 24px 4px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${BRAND.orange};border-radius:8px;">
                      <a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${BRAND.charcoal};text-decoration:none;">${escapeHtml(input.ctaLabel)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:${BRAND.grey};">${escapeHtml(input.footerNote)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    input.eyebrow.toUpperCase(),
    input.title,
    "",
    input.intro,
    "",
    rowsToText(input.rows),
    ...(input.bodyBlock ? ["", `${input.bodyBlock.heading}:`, input.bodyBlock.text] : []),
    "",
    `${input.ctaLabel}: ${input.ctaUrl}`,
    "",
    input.footerNote,
  ].join("\n");

  return { html, text };
}
