import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { REPORT_SOURCES } from "./reports/shared";
import type { ReportFacts } from "./reports/facts.server";
import type { ReportContent, ReportSection } from "./reports/pdf.server";

/**
 * Report building for the admin area.
 *
 * Figures always come from the live sources the team picked; the AI only
 * writes the wording around them and is told in the prompt that it may not
 * introduce a number that is not in the gathered facts.
 */

const REPORTS_BUCKET = "reports";

export type ReportTemplateRow = {
  id: string;
  name: string;
  accent_color: string;
  heading_color: string;
  header_text: string | null;
  subheader_text: string | null;
  footer_text: string | null;
  logo_path: string | null;
  letterhead_path: string | null;
  letterhead_mode: string;
  page_size: string;
  font_family: string;
  show_page_numbers: boolean;
  cover_page: boolean;
  is_default: boolean;
};

export type ReportRow = {
  id: string;
  title: string;
  template_id: string | null;
  period_start: string;
  period_end: string;
  sources: string[];
  brief: string | null;
  content: ReportContent;
  facts: ReportFacts | Record<string, never>;
  status: string;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
};

async function assertStaff(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
  if (error) throw new Error("Could not check your access.");
  if (!data) throw new Error("Only the CEVONS team can work with reports.");
}

/* ── Listing ─────────────────────────────────────────────────────────── */

export const listReportsData = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => raw ?? {})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ reports: ReportRow[]; templates: ReportTemplateRow[] }> => {
    await assertStaff(context as any);
    const [reports, templates] = await Promise.all([
      context.supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100),
      context.supabase.from("report_templates").select("*").order("created_at", { ascending: true }),
    ]);
    if (reports.error) throw new Error(reports.error.message);
    if (templates.error) throw new Error(templates.error.message);
    return {
      reports: (reports.data ?? []) as unknown as ReportRow[],
      templates: (templates.data ?? []) as unknown as ReportTemplateRow[],
    };
  });

/* ── Drafting ────────────────────────────────────────────────────────── */

type DraftInput = {
  title: string;
  periodStart: string;
  periodEnd: string;
  sources: string[];
  brief: string;
};

const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "sections"],
  properties: {
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "body", "bullets", "table"],
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          table: {
            anyOf: [
              {
                type: "object",
                additionalProperties: false,
                required: ["columns", "rows"],
                properties: {
                  columns: { type: "array", items: { type: "string" } },
                  rows: { type: "array", items: { type: "array", items: { type: "string" } } },
                },
              },
              { type: "null" },
            ],
          },
        },
      },
    },
  },
} as const;

async function writeWithAi(input: DraftInput, facts: ReportFacts): Promise<ReportContent> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("The AI writing service is not configured.");

  const prompt = [
    `Write a business report for CEVONS Environmental Services, Guyana.`,
    `Title: ${input.title}`,
    `Period: ${input.periodStart} to ${input.periodEnd}`,
    input.brief.trim() ? `What the team asked for: ${input.brief.trim()}` : "",
    ``,
    `FACTS (JSON). These are the only figures that exist:`,
    JSON.stringify(facts),
    ``,
    `Rules you must follow:`,
    `- Never state a number, percentage, date range, capacity or count that is not in the FACTS.`,
    `- Where a block says available:false, say plainly that the source could not be read and why. Do not estimate it.`,
    `- No targets, forecasts or claims about performance that the figures do not show.`,
    `- Plain professional English. 4 to 7 sections. Each body under 160 words.`,
    `- Use a table only where the facts contain a list of pairs; otherwise set table to null.`,
    `- Return bullets as an array (empty when not needed).`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      input: prompt,
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      text: {
        format: { type: "json_schema", name: "report", strict: true, schema: DRAFT_SCHEMA },
      },
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`The AI writer could not be reached [${res.status}]. ${detail.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload);
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && typeof event.response?.output_text === "string" && !text) {
          text = event.response.output_text;
        }
      } catch {
        /* partial event — ignore */
      }
    }
  }

  if (!text.trim()) throw new Error("The AI writer returned nothing. Please try again.");
  const parsed = JSON.parse(text) as ReportContent;
  const sections: ReportSection[] = (parsed.sections ?? []).map((s) => ({
    heading: String(s.heading ?? "").slice(0, 120),
    body: String(s.body ?? ""),
    bullets: Array.isArray(s.bullets) ? s.bullets.map(String).slice(0, 12) : [],
    table:
      s.table && Array.isArray(s.table.columns) && s.table.columns.length
        ? {
            columns: s.table.columns.map(String).slice(0, 5),
            rows: (s.table.rows ?? []).slice(0, 30).map((r) => r.map(String).slice(0, 5)),
          }
        : null,
  }));
  return { summary: String(parsed.summary ?? ""), sections };
}

export const draftReport = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => {
    const input = raw as DraftInput;
    const title = String(input?.title ?? "").trim();
    if (!title) throw new Error("Give the report a title.");
    const sources = (Array.isArray(input?.sources) ? input.sources : []).filter((s) =>
      (REPORT_SOURCES as readonly string[]).includes(s),
    );
    if (!sources.length) throw new Error("Pick at least one source of information.");
    const date = (value: unknown, label: string) => {
      const text = String(value ?? "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`Pick a valid ${label}.`);
      return text;
    };
    return {
      title: title.slice(0, 160),
      periodStart: date(input?.periodStart, "start date"),
      periodEnd: date(input?.periodEnd, "end date"),
      sources,
      brief: String(input?.brief ?? "").slice(0, 2000),
    } satisfies DraftInput;
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }): Promise<{ content: ReportContent; facts: ReportFacts }> => {
    await assertStaff(context as any);
    const { collectFacts } = await import("./reports/facts.server");
    const facts = await collectFacts(context.supabase, data.sources, data.periodStart, data.periodEnd);
    const content = await writeWithAi(data, facts);
    return { content, facts };
  });

/* ── Saving ──────────────────────────────────────────────────────────── */

export type SaveReportInput = {
  id?: string | null;
  title: string;
  templateId: string | null;
  periodStart: string;
  periodEnd: string;
  sources: string[];
  brief: string;
  content: ReportContent;
  facts: ReportFacts | Record<string, never>;
  status?: string;
};

export const saveReport = createServerFn({ method: "POST" })
  .inputValidator((raw: SaveReportInput) => raw)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }): Promise<{ id: string }> => {
    await assertStaff(context as any);
    const input = data;
    const row = {
      title: input.title.slice(0, 160),
      template_id: input.templateId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      sources: input.sources,
      brief: input.brief,
      content: input.content as any,
      facts: input.facts as any,
      status: input.status === "done" ? "done" : "draft",
    };
    if (input.id) {
      const { error } = await context.supabase.from("reports").update(row).eq("id", input.id);
      if (error) throw new Error(error.message);
      return { id: input.id };
    }
    const { data: created, error } = await context.supabase
      .from("reports")
      .insert({ ...row, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (created as { id: string }).id };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .inputValidator((raw: { id: string }) => raw)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertStaff(context as any);
    const { id } = data;
    const { error } = await context.supabase.from("reports").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ── Templates ───────────────────────────────────────────────────────── */

export type SaveTemplateInput = Omit<Partial<ReportTemplateRow>, "id"> & {
  id?: string | null;
  name: string;
  /** Optional uploads, sent as base64 without the data: prefix. */
  logoBase64?: string | null;
  logoExt?: string | null;
  letterheadBase64?: string | null;
};

export const saveReportTemplate = createServerFn({ method: "POST" })
  .inputValidator((raw: SaveTemplateInput) => raw)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }): Promise<{ id: string }> => {
    await assertStaff(context as any);
    const input = data;

    const upload = async (base64: string, path: string, contentType: string) => {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const { error } = await context.supabase.storage
        .from(REPORTS_BUCKET)
        .upload(path, bytes, { contentType, upsert: true });
      if (error) throw new Error(error.message);
      return path;
    };

    let logoPath = input.logo_path ?? null;
    if (input.logoBase64) {
      const ext = (input.logoExt ?? "png").toLowerCase() === "jpg" ? "jpg" : "png";
      logoPath = await upload(
        input.logoBase64,
        `templates/${crypto.randomUUID()}.${ext}`,
        ext === "png" ? "image/png" : "image/jpeg",
      );
    }

    let letterheadPath = input.letterhead_path ?? null;
    if (input.letterheadBase64) {
      letterheadPath = await upload(
        input.letterheadBase64,
        `templates/${crypto.randomUUID()}.pdf`,
        "application/pdf",
      );
    }

    const row = {
      name: String(input.name ?? "Template").slice(0, 120),
      accent_color: input.accent_color ?? "#EA6A00",
      heading_color: input.heading_color ?? "#0B2545",
      header_text: input.header_text ?? "",
      subheader_text: input.subheader_text ?? "",
      footer_text: input.footer_text ?? "",
      logo_path: logoPath,
      letterhead_path: letterheadPath,
      letterhead_mode: input.letterhead_mode === "first-page" ? "first-page" : "all-pages",
      page_size: input.page_size ?? "A4",
      font_family: input.font_family ?? "helvetica",
      show_page_numbers: input.show_page_numbers ?? true,
      cover_page: input.cover_page ?? true,
    };

    if (input.id) {
      const { error } = await context.supabase.from("report_templates").update(row).eq("id", input.id);
      if (error) throw new Error(error.message);
      return { id: input.id };
    }
    const { data: created, error } = await context.supabase
      .from("report_templates")
      .insert({ ...row, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (created as { id: string }).id };
  });

export const deleteReportTemplate = createServerFn({ method: "POST" })
  .inputValidator((raw: { id: string }) => raw)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertStaff(context as any);
    const { id } = data;
    const { error } = await context.supabase.from("report_templates").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ── Printing ────────────────────────────────────────────────────────── */

async function buildPdf(context: any, reportId: string) {
  const { data: report, error } = await context.supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();
  if (error || !report) throw new Error("That report could not be found.");

  let template: any = null;
  if (report.template_id) {
    const { data } = await context.supabase
      .from("report_templates")
      .select("*")
      .eq("id", report.template_id)
      .maybeSingle();
    template = data;
  }
  if (!template) {
    const { data } = await context.supabase
      .from("report_templates")
      .select("*")
      .eq("is_default", true)
      .maybeSingle();
    template = data;
  }
  template = template ?? {
    name: "CEVONS standard",
    accent_color: "#EA6A00",
    heading_color: "#0B2545",
    header_text: "CEVONS Environmental Services",
    subheader_text: "Georgetown, Guyana",
    footer_text: "Prepared with CEVONS admin",
    logo_path: null,
    letterhead_path: null,
    letterhead_mode: "all-pages",
    page_size: "A4",
    font_family: "helvetica",
    show_page_numbers: true,
    cover_page: true,
  };

  const readFile = async (path: string | null) => {
    if (!path) return null;
    const { data } = await context.supabase.storage.from(REPORTS_BUCKET).download(path);
    if (!data) return null;
    return new Uint8Array(await data.arrayBuffer());
  };

  const logoBytes = await readFile(template.logo_path);
  const letterhead = await readFile(template.letterhead_path);

  const { renderReportPdf } = await import("./reports/pdf.server");
  const bytes = await renderReportPdf({
    title: report.title,
    periodStart: report.period_start,
    periodEnd: report.period_end,
    template,
    content: (report.content ?? { sections: [] }) as ReportContent,
    logo: logoBytes
      ? { bytes: logoBytes, kind: template.logo_path?.endsWith(".jpg") ? "jpg" : "png" }
      : null,
    letterhead,
  });

  const path = `generated/${report.id}.pdf`;
  await context.supabase.storage
    .from(REPORTS_BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });
  await context.supabase.from("reports").update({ pdf_path: path, status: "done" }).eq("id", report.id);

  const filename = `${String(report.title).replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "report"}.pdf`;
  return { bytes, path, filename, title: report.title as string };
}

export const renderReport = createServerFn({ method: "POST" })
  .inputValidator((raw: { id: string }) => raw)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }): Promise<{ base64: string; filename: string }> => {
    await assertStaff(context as any);
    const { id } = data;
    const { bytes, filename } = await buildPdf(context, id);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return { base64: btoa(binary), filename };
  });

export const emailReport = createServerFn({ method: "POST" })
  .inputValidator((raw: { id: string; to: string; note?: string }) => raw)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }): Promise<{ sent: boolean; reason?: string }> => {
    await assertStaff(context as any);
    const { id, to, note } = data;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw new Error("Enter a valid email address.");

    const { path, title } = await buildPdf(context, id);
    const { data: signed, error } = await context.supabase.storage
      .from(REPORTS_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (error || !signed?.signedUrl) throw new Error("The download link could not be created.");

    const { renderReportShareEmail } = await import("./email-templates/report-share");
    const { subject, html, text } = renderReportShareEmail({
      title,
      note: note ?? null,
      downloadUrl: signed.signedUrl,
    });

    const { sendRawEmail } = await import("./email-templates/send-email");
    const result = await sendRawEmail({ to, subject, html, text, label: "report-share" });
    return result;
  });
