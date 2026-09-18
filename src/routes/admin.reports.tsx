import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { Plus, Sparkle, Trash2 } from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from "@/components/admin/Manifest";
import {
  deleteReport,
  deleteReportTemplate,
  draftReport,
  emailReport,
  listReportsData,
  renderReport,
  saveReport,
  saveReportTemplate,
  type ReportRow,
  type ReportTemplateRow,
} from "@/lib/reports.functions";
import type { ReportContent, ReportSection } from "@/lib/reports/pdf.server";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReportsPage,
});

/**
 * Reports.
 *
 * The team picks a period and which parts of the business to cover; those
 * figures are read live and handed to the writer, which may only put words
 * around them. The finished report is printed onto the chosen template — or
 * onto a letterhead PDF the team uploaded, so it matches their own stationery.
 */

const SOURCE_LABELS: Array<{ key: string; label: string; hint: string }> = [
  { key: "requests", label: "Service requests", hint: "Requests received in the period" },
  { key: "messages", label: "Contact messages", hint: "Messages from the website" },
  { key: "traffic", label: "Website visitors", hint: "Google Analytics figures" },
  { key: "tiktok", label: "TikTok", hint: "Followers and video performance" },
  { key: "facebook", label: "Facebook", hint: "Only when the page is connected" },
  { key: "instagram", label: "Instagram", hint: "Only when the account is connected" },
];

const input =
  "w-full rounded-lg border crm-border crm-surface crm-text px-3 py-2 text-sm min-h-11";
const label = "block text-xs uppercase tracking-wide crm-text-muted mb-1";
const primaryBtn =
  "inline-flex items-center gap-2 rounded-lg bg-[#EA6A00] px-4 py-2 text-sm font-semibold text-white min-h-11 disabled:opacity-60";
const quietBtn =
  "inline-flex items-center gap-2 rounded-lg border crm-border px-3 py-2 text-sm crm-text min-h-11 disabled:opacity-60";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function downloadBase64(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < buffer.length; i += chunk) {
    binary += String.fromCharCode(...buffer.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function ReportsPage() {
  const load = useServerFn(listReportsData);
  const query = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => load({ data: {} }),
  });

  return (
    <CrmPage>
      <div className="space-y-6">
        <header>
          <h1 className="text-xl font-semibold crm-text">Reports</h1>
          <p className="text-sm crm-text-muted">
            Build a written report from real figures, printed on your own template.
          </p>
        </header>

        {query.isLoading ? (
          <PanelSkeleton rows={4} />
        ) : query.error ? (
          <PanelError what="reports" error={query.error} />
        ) : (
          <>
            <Builder templates={query.data!.templates} />
            <SavedReports reports={query.data!.reports} />
            <Templates templates={query.data!.templates} />
          </>
        )}
      </div>
    </CrmPage>
  );
}

/* ── Builder ─────────────────────────────────────────────────────────── */

function Builder({ templates }: { templates: ReportTemplateRow[] }) {
  const qc = useQueryClient();
  const draft = useServerFn(draftReport);
  const save = useServerFn(saveReport);
  const print = useServerFn(renderReport);

  const defaultTemplate = templates.find((t) => t.is_default) ?? templates[0] ?? null;

  const [title, setTitle] = useState("");
  const [periodStart, setPeriodStart] = useState(monthsAgo(1));
  const [periodEnd, setPeriodEnd] = useState(today());
  const [sources, setSources] = useState<string[]>(["requests", "messages", "traffic"]);
  const [templateId, setTemplateId] = useState<string | null>(defaultTemplate?.id ?? null);
  const [brief, setBrief] = useState("");
  const [content, setContent] = useState<ReportContent | null>(null);
  const [facts, setFacts] = useState<any>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toggle = (key: string) =>
    setSources((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));

  const writing = useMutation({
    mutationFn: () =>
      draft({ data: { title, periodStart, periodEnd, sources, brief } }),
    onSuccess: (result) => {
      setContent(result.content);
      setFacts(result.facts);
      setNotice(null);
    },
    onError: (err: unknown) => setNotice(err instanceof Error ? err.message : "The draft failed."),
  });

  const saving = useMutation({
    mutationFn: async () => {
      const { id } = await save({
        data: {
          title,
          templateId,
          periodStart,
          periodEnd,
          sources,
          brief,
          content: content!,
          facts: facts ?? {},
          status: "done",
        },
      });
      return id;
    },
    onSuccess: async (id) => {
      await qc.invalidateQueries({ queryKey: ["admin-reports"] });
      setNotice("Saved. It is in your reports below.");
      return id;
    },
    onError: (err: unknown) => setNotice(err instanceof Error ? err.message : "Saving failed."),
  });

  const downloading = useMutation({
    mutationFn: async () => {
      const { id } = await save({
        data: {
          title,
          templateId,
          periodStart,
          periodEnd,
          sources,
          brief,
          content: content!,
          facts: facts ?? {},
          status: "done",
        },
      });
      const file = await print({ data: { id } });
      downloadBase64(file.base64, file.filename);
      await qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err: unknown) =>
      setNotice(err instanceof Error ? err.message : "The PDF could not be made."),
  });

  const updateSection = (index: number, patch: Partial<ReportSection>) =>
    setContent((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
          }
        : prev,
    );

  return (
    <Panel title="New report" code="REP-01">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="report-title">
            Title
          </label>
          <input
            id="report-title"
            className={input}
            value={title}
            placeholder="Quarterly business review"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className={label} htmlFor="report-start">
            From
          </label>
          <input
            id="report-start"
            type="date"
            className={input}
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
          />
        </div>
        <div>
          <label className={label} htmlFor="report-end">
            To
          </label>
          <input
            id="report-end"
            type="date"
            className={input}
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
          />
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className={label}>What to cover</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SOURCE_LABELS.map((s) => (
            <label
              key={s.key}
              className="flex items-start gap-3 rounded-lg border crm-border px-3 py-2 text-sm crm-text"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={sources.includes(s.key)}
                onChange={() => toggle(s.key)}
              />
              <span>
                <span className="font-medium">{s.label}</span>
                <span className="block text-xs crm-text-muted">{s.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="report-template">
            Template
          </label>
          <select
            id="report-template"
            className={input}
            value={templateId ?? ""}
            onChange={(e) => setTemplateId(e.target.value || null)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.letterhead_path ? " (your letterhead)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="report-brief">
            What should it say?
          </label>
          <textarea
            id="report-brief"
            className={`${input} min-h-[88px]`}
            value={brief}
            placeholder="Focus on how enquiries moved through the month and where they came from."
            onChange={(e) => setBrief(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryBtn}
          disabled={writing.isPending || !title.trim() || sources.length === 0}
          onClick={() => writing.mutate()}
        >
          <Sparkle className="h-4 w-4" aria-hidden="true" />
          {writing.isPending ? "Writing the draft…" : "Write the draft"}
        </button>
        {content && (
          <>
            <button
              type="button"
              className={quietBtn}
              disabled={saving.isPending}
              onClick={() => saving.mutate()}
            >
              Save
            </button>
            <button
              type="button"
              className={quietBtn}
              disabled={downloading.isPending}
              onClick={() => downloading.mutate()}
            >
              {downloading.isPending ? "Preparing the PDF…" : "Download PDF"}
            </button>
          </>
        )}
      </div>

      {writing.isPending && (
        <p className="mt-3 text-sm crm-text-muted">
          Reading the figures and writing — this can take a minute.
        </p>
      )}
      {notice && <p className="mt-3 text-sm crm-text">{notice}</p>}

      {content && (
        <div className="mt-5 space-y-4">
          <div>
            <label className={label} htmlFor="report-summary">
              Summary
            </label>
            <textarea
              id="report-summary"
              className={`${input} min-h-[96px]`}
              value={content.summary ?? ""}
              onChange={(e) => setContent({ ...content, summary: e.target.value })}
            />
          </div>
          {content.sections.map((section, index) => (
            <div key={index} className="rounded-lg border crm-border p-3">
              <input
                className={`${input} font-semibold`}
                value={section.heading}
                onChange={(e) => updateSection(index, { heading: e.target.value })}
              />
              <textarea
                className={`${input} mt-2 min-h-[110px]`}
                value={section.body}
                onChange={(e) => updateSection(index, { body: e.target.value })}
              />
              {section.bullets && section.bullets.length > 0 && (
                <textarea
                  className={`${input} mt-2 min-h-[80px]`}
                  value={section.bullets.join("\n")}
                  onChange={(e) =>
                    updateSection(index, {
                      bullets: e.target.value.split("\n").filter((line) => line.trim()),
                    })
                  }
                />
              )}
              {section.table && (
                <p className="mt-2 text-xs crm-text-muted">
                  Includes a table of {section.table.rows.length} rows.
                </p>
              )}
              <button
                type="button"
                className="mt-2 text-xs crm-danger"
                onClick={() =>
                  setContent({
                    ...content,
                    sections: content.sections.filter((_, i) => i !== index),
                  })
                }
              >
                Remove this section
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ── Saved reports ───────────────────────────────────────────────────── */

function SavedReports({ reports }: { reports: ReportRow[] }) {
  const qc = useQueryClient();
  const print = useServerFn(renderReport);
  const send = useServerFn(emailReport);
  const remove = useServerFn(deleteReport);
  const [emailing, setEmailing] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const download = useMutation({
    mutationFn: async (id: string) => {
      const file = await print({ data: { id } });
      downloadBase64(file.base64, file.filename);
    },
    onError: (err: unknown) =>
      setNotice(err instanceof Error ? err.message : "The PDF could not be made."),
  });

  const mail = useMutation({
    mutationFn: async (id: string) => send({ data: { id, to: address } }),
    onSuccess: (result) => {
      setEmailing(null);
      setAddress("");
      setNotice(result.sent ? "Sent." : "That address cannot receive our emails.");
    },
    onError: (err: unknown) => setNotice(err instanceof Error ? err.message : "Sending failed."),
  });

  const drop = useMutation({
    mutationFn: async (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }),
  });

  return (
    <Panel title="Your reports" code="REP-02">
      {reports.length === 0 ? (
        <PanelEmpty headline="No reports yet." />
      ) : (
        <ul className="space-y-2">
          {reports.map((report) => (
            <li key={report.id} className="rounded-lg border crm-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium crm-text">{report.title}</p>
                  <p className="text-xs crm-text-muted">
                    {report.period_start} to {report.period_end}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={quietBtn}
                    disabled={download.isPending}
                    onClick={() => download.mutate(report.id)}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className={quietBtn}
                    onClick={() => setEmailing(emailing === report.id ? null : report.id)}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={quietBtn}
                    onClick={() => drop.mutate(report.id)}
                    aria-label={`Delete ${report.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {emailing === report.id && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    className={`${input} max-w-xs`}
                    type="email"
                    placeholder="name@company.com"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <button
                    type="button"
                    className={primaryBtn}
                    disabled={mail.isPending || !address.trim()}
                    onClick={() => mail.mutate(report.id)}
                  >
                    {mail.isPending ? "Sending…" : "Send link"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {notice && <p className="mt-3 text-sm crm-text">{notice}</p>}
    </Panel>
  );
}

/* ── Templates ───────────────────────────────────────────────────────── */

function Templates({ templates }: { templates: ReportTemplateRow[] }) {
  const qc = useQueryClient();
  const save = useServerFn(saveReportTemplate);
  const remove = useServerFn(deleteReportTemplate);
  const [editing, setEditing] = useState<ReportTemplateRow | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const letterRef = useRef<HTMLInputElement>(null);

  const blank = useMemo<ReportTemplateRow>(
    () => ({
      id: "",
      name: "New template",
      accent_color: "#EA6A00",
      heading_color: "#0B2545",
      header_text: "CEVONS Environmental Services",
      subheader_text: "Georgetown, Guyana",
      footer_text: "",
      logo_path: null,
      letterhead_path: null,
      letterhead_mode: "all-pages",
      page_size: "A4",
      font_family: "helvetica",
      show_page_numbers: true,
      cover_page: true,
      is_default: false,
    }),
    [],
  );

  const saving = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const logoFile = logoRef.current?.files?.[0] ?? null;
      const letterFile = letterRef.current?.files?.[0] ?? null;
      await save({
        data: {
          ...editing,
          id: editing.id || null,
          logoBase64: logoFile ? await fileToBase64(logoFile) : null,
          logoExt: logoFile?.name.toLowerCase().endsWith(".jpg") ? "jpg" : "png",
          letterheadBase64: letterFile ? await fileToBase64(letterFile) : null,
        },
      });
    },
    onSuccess: async () => {
      setEditing(null);
      setNotice("Template saved.");
      await qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err: unknown) =>
      setNotice(err instanceof Error ? err.message : "The template could not be saved."),
  });

  const drop = useMutation({
    mutationFn: async (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }),
  });

  return (
    <Panel title="Templates" code="REP-03">
      <ul className="space-y-2">
        {templates.map((t) => (
          <li
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border crm-border p-3"
          >
            <div>
              <p className="text-sm font-medium crm-text">{t.name}</p>
              <p className="text-xs crm-text-muted">
                {t.letterhead_path ? "Prints onto your uploaded letterhead" : `${t.page_size} · built-in layout`}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className={quietBtn} onClick={() => setEditing(t)}>
                Edit
              </button>
              {!t.is_default && (
                <button type="button" className={quietBtn} onClick={() => drop.mutate(t.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className={`${quietBtn} mt-3`} onClick={() => setEditing(blank)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add a template
      </button>

      {editing && (
        <div className="mt-4 space-y-3 rounded-lg border crm-border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Name</label>
              <input
                className={input}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Page size</label>
              <select
                className={input}
                value={editing.page_size}
                onChange={(e) => setEditing({ ...editing, page_size: e.target.value })}
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div>
              <label className={label}>Heading colour</label>
              <input
                className={input}
                value={editing.heading_color}
                onChange={(e) => setEditing({ ...editing, heading_color: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Accent colour</label>
              <input
                className={input}
                value={editing.accent_color}
                onChange={(e) => setEditing({ ...editing, accent_color: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Header line</label>
              <input
                className={input}
                value={editing.header_text ?? ""}
                onChange={(e) => setEditing({ ...editing, header_text: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Second line</label>
              <input
                className={input}
                value={editing.subheader_text ?? ""}
                onChange={(e) => setEditing({ ...editing, subheader_text: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Footer line</label>
              <input
                className={input}
                value={editing.footer_text ?? ""}
                onChange={(e) => setEditing({ ...editing, footer_text: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Logo (PNG or JPG)</label>
              <input ref={logoRef} type="file" accept="image/png,image/jpeg" className={input} />
            </div>
            <div>
              <label className={label}>Your own PDF template</label>
              <input ref={letterRef} type="file" accept="application/pdf" className={input} />
              <p className="mt-1 text-xs crm-text-muted">
                Its pages are used as the stationery, so the report keeps your exact layout.
              </p>
            </div>
            <div>
              <label className={label}>Use your PDF on</label>
              <select
                className={input}
                value={editing.letterhead_mode}
                onChange={(e) => setEditing({ ...editing, letterhead_mode: e.target.value })}
              >
                <option value="all-pages">Every page</option>
                <option value="first-page">The first page only</option>
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm crm-text">
                <input
                  type="checkbox"
                  checked={editing.cover_page}
                  onChange={(e) => setEditing({ ...editing, cover_page: e.target.checked })}
                />
                Cover page
              </label>
              <label className="flex items-center gap-2 text-sm crm-text">
                <input
                  type="checkbox"
                  checked={editing.show_page_numbers}
                  onChange={(e) => setEditing({ ...editing, show_page_numbers: e.target.checked })}
                />
                Page numbers
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={primaryBtn}
              disabled={saving.isPending}
              onClick={() => saving.mutate()}
            >
              {saving.isPending ? "Saving…" : "Save template"}
            </button>
            <button type="button" className={quietBtn} onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {notice && <p className="mt-3 text-sm crm-text">{notice}</p>}
    </Panel>
  );
}
