import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/**
 * Report PDF renderer.
 *
 * The look comes entirely from the template the team built in the admin:
 * colours, header and footer wording, logo, page size, typeface, cover page
 * and page numbers. The same renderer produces the download, the saved copy
 * and the emailed copy, so every route gives identical formatting.
 */

export type ReportTemplate = {
  name: string;
  accent_color: string;
  heading_color: string;
  header_text: string;
  subheader_text: string;
  footer_text: string;
  logo_path: string | null;
  letterhead_path: string | null;
  letterhead_mode: string;
  page_size: string;
  font_family: string;
  show_page_numbers: boolean;
  cover_page: boolean;
};

export type ReportTable = { columns: string[]; rows: string[][] };

export type ReportSection = {
  heading: string;
  body: string;
  bullets?: string[];
  table?: ReportTable | null;
};

export type ReportContent = { summary?: string; sections: ReportSection[] };

const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
};

const FONT_SETS: Record<string, { regular: StandardFonts; bold: StandardFonts }> = {
  helvetica: { regular: StandardFonts.Helvetica, bold: StandardFonts.HelveticaBold },
  times: { regular: StandardFonts.TimesRoman, bold: StandardFonts.TimesRomanBold },
  courier: { regular: StandardFonts.Courier, bold: StandardFonts.CourierBold },
};

function color(hex: string, fallback = "#0B2545") {
  const value = /^#?[0-9a-fA-F]{6}$/.test(hex.trim()) ? hex.trim().replace("#", "") : fallback.replace("#", "");
  return rgb(
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  );
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const rawLine of text.split(/\n+/)) {
    let line = "";
    for (const word of rawLine.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    out.push(line);
  }
  return out.length ? out : [""];
}

/** Strips characters the PDF standard fonts cannot draw (emoji, curly dashes). */
function safe(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\u0000-\u00FF]/g, "");
}

export async function renderReportPdf(options: {
  title: string;
  periodStart: string;
  periodEnd: string;
  template: ReportTemplate;
  content: ReportContent;
  logo?: { bytes: Uint8Array; kind: "png" | "jpg" } | null;
  /** Raw bytes of a PDF the team uploaded; its pages become the stationery. */
  letterhead?: Uint8Array | null;
}): Promise<Uint8Array> {
  const { title, periodStart, periodEnd, template, content, logo, letterhead } = options;
  const pdf = await PDFDocument.create();
  const fonts = FONT_SETS[template.font_family] ?? FONT_SETS["helvetica"]!;
  const regular = await pdf.embedFont(fonts.regular);
  const bold = await pdf.embedFont(fonts.bold);
  let size = PAGE_SIZES[template.page_size] ?? PAGE_SIZES["A4"]!;

  /* A letterhead the team uploaded is used as the stationery: its pages are
     drawn behind everything, and it also fixes the page size so the printed
     result matches their own document exactly. */
  let coverStationery: Awaited<ReturnType<typeof pdf.embedPage>> | null = null;
  let bodyStationery: Awaited<ReturnType<typeof pdf.embedPage>> | null = null;
  if (letterhead && letterhead.byteLength > 0) {
    try {
      const source = await PDFDocument.load(letterhead);
      const count = source.getPageCount();
      if (count > 0) {
        const first = source.getPage(0);
        size = [first.getWidth(), first.getHeight()];
        const wanted = count > 1 ? [0, 1] : [0];
        const embedded = await pdf.embedPdf(source, wanted);
        coverStationery = embedded[0] ?? null;
        bodyStationery =
          template.letterhead_mode === "first-page"
            ? (embedded[1] ?? null)
            : (embedded[1] ?? embedded[0] ?? null);
      }
    } catch {
      coverStationery = null;
      bodyStationery = null;
    }
  }
  const [pageWidth, pageHeight] = size;
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  const accent = color(template.accent_color, "#EA6A00");
  const heading = color(template.heading_color, "#0B2545");
  const bodyColor = rgb(0.17, 0.2, 0.24);

  let logoImage = null as Awaited<ReturnType<typeof pdf.embedPng>> | null;
  if (logo) {
    try {
      logoImage = logo.kind === "png" ? await pdf.embedPng(logo.bytes) : await pdf.embedJpg(logo.bytes);
    } catch {
      logoImage = null;
    }
  }

  const pages: PDFPage[] = [];
  let page = pdf.addPage(size);
  pages.push(page);
  let y = pageHeight - margin;

  const usingStationery = Boolean(coverStationery);
  let pageIndex = 0;

  const drawBanner = (target: PDFPage) => {
    const stationery = pageIndex === 0 ? coverStationery : bodyStationery;
    pageIndex += 1;
    if (stationery) {
      target.drawPage(stationery, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      return;
    }
    target.drawRectangle({ x: 0, y: pageHeight - 8, width: pageWidth, height: 8, color: accent });
  };

  const newPage = () => {
    page = pdf.addPage(size);
    pages.push(page);
    drawBanner(page);
    // Leave room for a letterhead's own printed header when one is in use.
    y = pageHeight - (usingStationery ? 130 : margin);
  };

  const need = (space: number) => {
    if (y - space < margin + (usingStationery ? 90 : 40)) newPage();
  };

  const drawText = (text: string, opts: { font: PDFFont; size: number; color: ReturnType<typeof rgb>; gap?: number; indent?: number }) => {
    const indent = opts.indent ?? 0;
    for (const line of wrap(safe(text), opts.font, opts.size, contentWidth - indent)) {
      need(opts.size + 6);
      page.drawText(line, { x: margin + indent, y: y - opts.size, size: opts.size, font: opts.font, color: opts.color });
      y -= opts.size + 4;
    }
    y -= opts.gap ?? 0;
  };

  /* Cover */
  drawBanner(page);
  if (template.cover_page) {
    y = pageHeight - (usingStationery ? 230 : 150);
    if (logoImage && !usingStationery) {
      const scaled = logoImage.scaleToFit(170, 80);
      page.drawImage(logoImage, { x: margin, y: y - scaled.height, width: scaled.width, height: scaled.height });
      y -= scaled.height + 30;
    }
    if (template.header_text && !usingStationery) drawText(template.header_text, { font: bold, size: 16, color: heading });
    if (template.subheader_text && !usingStationery) drawText(template.subheader_text, { font: regular, size: 11, color: bodyColor, gap: 24 });
    drawText(title, { font: bold, size: 26, color: heading, gap: 8 });
    drawText(`${periodStart} to ${periodEnd}`, { font: regular, size: 12, color: accent, gap: 12 });
    page.drawRectangle({ x: margin, y: y - 6, width: contentWidth, height: 2, color: accent });
    newPage();
  } else {
    if (logoImage && !usingStationery) {
      const scaled = logoImage.scaleToFit(130, 54);
      page.drawImage(logoImage, { x: margin, y: y - scaled.height, width: scaled.width, height: scaled.height });
      y -= scaled.height + 16;
    }
    if (template.header_text && !usingStationery) drawText(template.header_text, { font: bold, size: 13, color: heading });
    drawText(title, { font: bold, size: 20, color: heading });
    drawText(`${periodStart} to ${periodEnd}`, { font: regular, size: 11, color: accent, gap: 12 });
  }

  if (content.summary?.trim()) {
    drawText("Summary", { font: bold, size: 14, color: heading, gap: 2 });
    drawText(content.summary, { font: regular, size: 10.5, color: bodyColor, gap: 12 });
  }

  for (const section of content.sections) {
    need(60);
    drawText(section.heading, { font: bold, size: 13.5, color: heading, gap: 2 });
    if (section.body?.trim()) drawText(section.body, { font: regular, size: 10.5, color: bodyColor, gap: 4 });

    for (const bullet of section.bullets ?? []) {
      need(20);
      page.drawCircle({ x: margin + 4, y: y - 6, size: 2, color: accent });
      drawText(bullet, { font: regular, size: 10.5, color: bodyColor, indent: 16 });
    }

    if (section.table && section.table.columns.length) {
      const cols = section.table.columns.length;
      const colWidth = contentWidth / cols;
      const rowHeight = 18;
      need(rowHeight * 2);
      y -= 6;
      page.drawRectangle({ x: margin, y: y - rowHeight + 4, width: contentWidth, height: rowHeight, color: heading });
      section.table.columns.forEach((col, i) => {
        page.drawText(safe(col).slice(0, 28), {
          x: margin + 6 + i * colWidth,
          y: y - rowHeight + 10,
          size: 9.5,
          font: bold,
          color: rgb(1, 1, 1),
        });
      });
      y -= rowHeight;
      section.table.rows.forEach((row, index) => {
        need(rowHeight);
        if (index % 2 === 1) {
          page.drawRectangle({
            x: margin,
            y: y - rowHeight + 4,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.96, 0.97, 0.98),
          });
        }
        row.slice(0, cols).forEach((cell, i) => {
          page.drawText(safe(String(cell)).slice(0, 32), {
            x: margin + 6 + i * colWidth,
            y: y - rowHeight + 10,
            size: 9.5,
            font: regular,
            color: bodyColor,
          });
        });
        y -= rowHeight;
      });
      y -= 10;
    }

    y -= 8;
  }

  /* Footer on every page */
  pages.forEach((p, index) => {
    if (template.footer_text && !usingStationery) {
      p.drawText(safe(template.footer_text).slice(0, 120), {
        x: margin,
        y: margin - 24,
        size: 8.5,
        font: regular,
        color: rgb(0.45, 0.48, 0.52),
      });
    }
    if (template.show_page_numbers) {
      const label = `${index + 1} / ${pages.length}`;
      p.drawText(label, {
        x: pageWidth - margin - regular.widthOfTextAtSize(label, 8.5),
        y: margin - 24,
        size: 8.5,
        font: regular,
        color: rgb(0.45, 0.48, 0.52),
      });
    }
  });

  pdf.setTitle(safe(title));
  return await pdf.save();
}
