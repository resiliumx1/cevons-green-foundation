import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  History,
  Loader2,
  Pencil,

  ChevronDown,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createPreviewToken } from "@/lib/content.functions";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { canPublish, useAdminIdentity } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaSrc } from "@/components/media/useMediaSrc";
import { georgetownLabel } from "@/lib/georgetown";
import { SERVICE_PAGES, servicePageId } from "@/lib/servicePages";
import {
  EDITABLE_PAGES,
  PALETTE_STYLES,
  SECTION_KINDS,
  APPROVED_PALETTES,
  kindDef,
  parsePayload,
  type Field,
  type PageSection,
} from "@/lib/pageSections";

export const Route = createFileRoute("/admin/pages")({
  head: () => ({
    meta: [{ title: "Pages | CEVONS Website Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: PagesEditor,
});

/** jsonb columns are typed as `Json` by the generated types; our payloads are plain objects. */
const asJson = (v: Record<string, unknown>) => v as never;

type Row = PageSection & { draft_payload: Record<string, unknown>; payload: Record<string, unknown> };

const surface = { background: "var(--crm-surface)", borderColor: "var(--crm-border)" } as const;
const field = {
  background: "var(--crm-surface-muted)",
  borderColor: "var(--crm-border)",
  color: "var(--crm-text)",
} as const;

/* ── Image picker (reuses the media library) ─────────────────────────────── */

function MediaPickerValue({ path }: { path: string }) {
  const url = useMediaSrc(path || null);
  if (!path) return <span className="text-[12px]" style={{ color: "var(--crm-text-muted)" }}>No image chosen</span>;
  return url ? (
    <img src={url} alt="" className="h-16 w-24 rounded-lg object-cover" />
  ) : (
    <Loader2 className="size-4 animate-spin" style={{ color: "var(--crm-text-muted)" }} />
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: library = [] } = useQuery({
    queryKey: ["admin", "media-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_posts")
        .select("id, title, image_path")
        .not("image_path", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; title: string; image_path: string }>;
    },
  });

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <MediaPickerValue path={value} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] rounded-lg border px-3 text-sm"
        style={field}
        aria-label="Choose an image from the media library"
      >
        <option value="">— No image —</option>
        {library.map((m) => (
          <option key={m.id} value={m.image_path}>
            {m.title || m.image_path}
          </option>
        ))}
      </select>
      <Link to="/admin/media" className="admin-link-btn">
        Manage media
      </Link>
    </div>
  );
}

/* ── Generic field renderer, driven by the kind's schema ─────────────────── */

function FieldInput({
  f,
  value,
  onChange,
}: {
  f: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (f.type === "items") {
    const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
    const blank = Object.fromEntries(f.fields.map((sf) => [sf.key, ""]));
    return (
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border p-3 space-y-2" style={surface}>
            <div className="flex items-center justify-between">
              <span className="admin-mono" style={{ color: "var(--crm-text-muted)" }}>
                {f.itemLabel} {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Move ${f.itemLabel} ${i + 1} up`}
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...items];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    onChange(next);
                  }}
                  className="min-h-[44px] min-w-[44px] grid place-items-center rounded disabled:opacity-30 focus:outline-none focus-visible:ring-2"
                  style={{ color: "var(--crm-text-muted)" }}
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${f.itemLabel} ${i + 1} down`}
                  disabled={i === items.length - 1}
                  onClick={() => {
                    const next = [...items];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    onChange(next);
                  }}
                  className="min-h-[44px] min-w-[44px] grid place-items-center rounded disabled:opacity-30 focus:outline-none focus-visible:ring-2"
                  style={{ color: "var(--crm-text-muted)" }}
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${f.itemLabel} ${i + 1}`}
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  className="min-h-[44px] min-w-[44px] grid place-items-center rounded focus:outline-none focus-visible:ring-2"
                  style={{ color: "var(--crm-text-muted)" }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            {f.fields.map((sf) => (
              <div key={sf.key} className="space-y-1">
                <Label className="text-[12px]" style={{ color: "var(--crm-text-muted)" }}>
                  {sf.label}
                </Label>
                <FieldInput
                  f={sf}
                  value={item[sf.key] ?? ""}
                  onChange={(v) => {
                    const next = [...items];
                    next[i] = { ...item, [sf.key]: v };
                    onChange(next);
                  }}
                />
              </div>
            ))}
          </div>
        ))}
        {items.length < f.max && (
          <Button type="button" variant="outline" onClick={() => onChange([...items, blank])}>
            <Plus className="size-4 mr-1.5" /> Add {f.itemLabel.toLowerCase()}
          </Button>
        )}
      </div>
    );
  }

  if (f.type === "palette") {
    const current = typeof value === "string" ? value : "navy";
    return (
      <div className="flex flex-wrap gap-2">
        {APPROVED_PALETTES.map((p) => {
          const s = PALETTE_STYLES[p];
          const active = current === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-pressed={active}
              className="min-h-[44px] rounded-lg px-4 text-[12px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: s.fill,
                color: s.text,
                outline: active ? "2px solid var(--crm-text)" : "none",
                outlineOffset: 2,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (f.type === "image") {
    return <ImageField value={typeof value === "string" ? value : ""} onChange={onChange} />;
  }

  if (f.type === "textarea") {
    return (
      <Textarea
        rows={3}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        style={field}
      />
    );
  }

  return (
    <Input
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={f.type === "href" ? "/request-service" : undefined}
      style={field}
    />
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

function PagesEditor() {
  const qc = useQueryClient();
  const { roles, userId } = useAdminIdentity();
  const mayPublish = canPublish(roles);
  const [page, setPage] = useState<string>(EDITABLE_PAGES[0].value);
  const [adding, setAdding] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);

  const sectionsQuery = useQuery({
    queryKey: ["admin", "page_sections", page],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page", page)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = sectionsQuery.data ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "page_sections", page] });

  const kindsForPage = useMemo(() => SECTION_KINDS.filter((k) => k.pages.includes(page)), [page]);

  async function addSection(kind: string) {
    const def = kindDef(kind);
    if (!def) return;
    const seed = parsePayload<Record<string, unknown>>(kind, {});
    const { error } = await supabase.from("page_sections").insert({
      page,
      kind,
      position: rows.length,
      payload: {},
      draft_payload: asJson(seed),
      published: false,
      updated_by: userId,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setAdding("");
    toast.success("Section added as a draft.");
    refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = rows[index];
    const b = rows[index + dir];
    if (!a || !b) return;
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("page_sections").update({ position: b.position }).eq("id", a.id),
      supabase.from("page_sections").update({ position: a.position }).eq("id", b.id),
    ]);
    if (e1 || e2) {
      toast.error((e1 ?? e2)!.message);
      return;
    }
    refresh();
  }

  const deleteMutation = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase.from("page_sections").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Section deleted");
      setConfirmDelete(null);
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <CrmPage className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="admin-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--crm-text)" }}>
            Pages
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
            A page is an ordered list of typed sections. Edits are saved as drafts; the live site only changes when you
            publish. If a page has no sections at all, the site keeps rendering its built-in layout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Service detail pages have no typed sections — only click-to-edit copy. */}
          {!page.startsWith("service.") && (
            <a href={`/admin/preview/${page}`} target="_blank" rel="noreferrer" className="admin-link-btn">
              <Eye className="size-4" aria-hidden /> Preview draft
            </a>
          )}
        </div>
      </header>

      <PagePicker page={page} onSelect={setPage} />

      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
        style={surface}
      >
        <div className="min-w-[240px] flex-1">
          <h2 className="text-base font-semibold" style={{ color: "var(--crm-text)" }}>
            Change the words on this page
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: "var(--crm-text-muted)" }}>
            Opens the real page so you can scroll it and click any text to edit it. Use the list below instead when you
            need to add, reorder or hide whole sections.
          </p>
        </div>
        <EditCopyButton page={page} />
      </div>

      {/* Service detail pages are template-driven: they have editable copy but no
          typed, reorderable sections, so the builder below is hidden for them. */}
      {!page.startsWith("service.") && (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border p-3" style={surface}>
            <select
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              className="min-h-[44px] rounded-lg border px-3 text-sm"
              style={field}
              aria-label="Section type"
            >
              <option value="">Choose a section type…</option>
              {kindsForPage.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
            <Button type="button" disabled={!adding} onClick={() => void addSection(adding)}>
              <Plus className="size-4 mr-1.5" /> Add section
            </Button>
          </div>

          {sectionsQuery.isLoading ? (
            <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
              Loading…
            </p>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border p-8 text-sm" style={{ ...surface, color: "var(--crm-text-muted)" }}>
              No sections yet — the public page is rendering its built-in layout. Add a section above to start managing
              it here.
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((row, i) => (
                <SectionCard
                  key={row.id}
                  row={row}
                  isFirst={i === 0}
                  isLast={i === rows.length - 1}
                  mayPublish={mayPublish}
                  userId={userId}
                  onMove={(dir) => void move(i, dir)}
                  onChanged={refresh}
                  onDelete={() => setConfirmDelete(row)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete the “{confirmDelete ? kindDef(confirmDelete.kind)?.label ?? confirmDelete.kind : ""}” section?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This section and its version history will be permanently removed from the {page} page. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete section
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ContentStringsList />
    </CrmPage>
  );
}

/* ── Page picker ─────────────────────────────────────────────────────────── */

type PickerEntry = { value: string; label: string; path: string };

/** The 22 service detail pages, as picker entries. */
const SERVICE_PICKER: PickerEntry[] = SERVICE_PAGES.map((s) => ({
  value: servicePageId(s.slug),
  label: s.label,
  path: `/services/${s.slug}`,
}));

const MAIN_PICKER: PickerEntry[] = EDITABLE_PAGES.map((p) => ({
  value: p.value,
  label: p.label,
  path: p.path,
}));

function PageCard({
  entry,
  active,
  count,
  onSelect,
}: {
  entry: PickerEntry;
  active: boolean;
  count: number;
  onSelect: (p: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry.value)}
        aria-pressed={active}
        className="w-full min-h-[44px] rounded-xl border px-3 py-2.5 text-left transition-colors"
        style={{
          ...field,
          borderColor: active ? "var(--crm-primary)" : undefined,
          boxShadow: active ? "0 0 0 1px var(--crm-primary) inset" : undefined,
        }}
      >
        <span className="block text-sm font-semibold" style={{ color: "var(--crm-text)" }}>
          {entry.label}
        </span>
        <span
          className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px]"
          style={{ color: "var(--crm-text-muted)" }}
        >
          <code>{entry.path}</code>
          <span>·</span>
          <span>{count > 0 ? `${count} editable text ${count === 1 ? "item" : "items"}` : "Not yet editable"}</span>
        </span>
      </button>
    </li>
  );
}

/**
 * Every editable page, always visible — no dropdown. Main pages first, then the
 * 22 service detail pages in a collapsible, scrollable sub-list so the picker
 * stays usable. Each card shows the public path and how many pieces of text are
 * registered for on-page editing.
 */
function PagePicker({ page, onSelect }: { page: string; onSelect: (p: string) => void }) {
  const { data: counts = {} } = useQuery({
    queryKey: ["admin", "content_strings", "counts"],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase.from("content_strings").select("page");
      if (error) throw error;
      const out: Record<string, number> = {};
      for (const r of data ?? []) out[r.page] = (out[r.page] ?? 0) + 1;
      return out;
    },
  });

  const [servicesOpen, setServicesOpen] = useState(page.startsWith("service."));

  return (
    <div className="rounded-2xl border p-4" style={surface}>
      <h2 className="text-base font-semibold" style={{ color: "var(--crm-text)" }}>
        Choose a page
      </h2>

      <h3 className="mt-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--crm-text-muted)" }}>
        Main pages
      </h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {MAIN_PICKER.map((p) => (
          <PageCard
            key={p.value}
            entry={p}
            active={p.value === page}
            count={counts[p.value] ?? 0}
            onSelect={onSelect}
          />
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setServicesOpen((v) => !v)}
        aria-expanded={servicesOpen}
        className="mt-4 flex min-h-[44px] w-full items-center justify-between rounded-xl border px-3 text-left"
        style={field}
      >
        <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--crm-text-muted)" }}>
          Service pages ({SERVICE_PICKER.length})
        </span>
        <ChevronDown
          className="size-4 transition-transform"
          style={{ color: "var(--crm-text-muted)", transform: servicesOpen ? "rotate(180deg)" : undefined }}
          aria-hidden
        />
      </button>

      {servicesOpen && (
        <ul className="mt-2 grid max-h-[320px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_PICKER.map((p) => (
            <PageCard
              key={p.value}
              entry={p}
              active={p.value === page}
              count={counts[p.value] ?? 0}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}


/* ── Click-to-edit launcher ──────────────────────────────────────────────── */

/** Public path each editable page lives at. */
const PAGE_PATHS: Record<string, string> = Object.fromEntries(
  [...MAIN_PICKER, ...SERVICE_PICKER].map((p) => [p.value, p.path]),
);


/**
 * Opens the real public page in a staff preview session. The token is minted
 * server-side for the signed-in user and expires in an hour; the overlay that
 * appears there is what actually edits copy.
 */
function EditCopyButton({ page }: { page: string }) {
  const mint = useServerFn(createPreviewToken);
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    try {
      const { token } = await mint({});
      const path = PAGE_PATHS[page] ?? "/";
      window.open(`${path}?preview=${encodeURIComponent(token)}`, "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the preview session");
    } finally {
      setBusy(false);
    }
  };

  const pageLabel =
    [...MAIN_PICKER, ...SERVICE_PICKER].find((p) => p.value === page)?.label ?? page;

  return (
    <Button type="button" size="lg" onClick={() => void open()} disabled={busy}>
      <Pencil className="size-4 mr-2" aria-hidden />
      {busy ? "Opening…" : `Open ${pageLabel} and edit it`}
    </Button>
  );
}


/* ── Content strings (read-only inventory) ───────────────────────────────── */

type ContentStringRow = {
  key: string;
  page: string;
  section: string;
  label: string;
  published_value: string | null;
  draft_value: string | null;
  max_length: number | null;
};

function ContentStringsList() {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "content_strings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_strings")
        .select("key, page, section, label, published_value, draft_value, max_length")
        .order("page", { ascending: true })
        .order("section", { ascending: true })
        .order("key", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ContentStringRow[];
    },
  });

  const groups = useMemo(() => {
    const map = new Map<string, ContentStringRow[]>();
    for (const r of rows) {
      const g = `${r.page} › ${r.section}`;
      const list = map.get(g);
      if (list) list.push(r);
      else map.set(g, [r]);
    }
    return [...map.entries()];
  }, [rows]);

  return (
    <section className="mt-10 rounded-2xl border p-4 md:p-6" style={surface}>
      <h2 className="text-lg font-semibold" style={{ color: "var(--crm-text)" }}>
        Content strings
      </h2>
      <p className="mt-1 text-[13px]" style={{ color: "var(--crm-text-muted)" }}>
        Individual pieces of copy on the public site, addressed by key. Use “Edit copy on page” above to change any of them directly on the page.
      </p>

      {isLoading && (
        <p className="mt-4 text-sm" style={{ color: "var(--crm-text-muted)" }}>
          Loading…
        </p>
      )}
      {!isLoading && rows.length === 0 && (
        <p className="mt-4 text-sm" style={{ color: "var(--crm-text-muted)" }}>
          No content strings registered yet.
        </p>
      )}

      {groups.map(([group, list]) => (
        <div key={group} className="mt-6">
          <h3
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--crm-text-muted)" }}
          >
            {group}
          </h3>
          <ul className="mt-2 divide-y" style={{ borderColor: "var(--crm-border)" }}>
            {list.map((r) => {
              const differs = r.draft_value != null && r.draft_value !== r.published_value;
              return (
                <li key={r.key} className="py-3 flex flex-wrap items-start gap-x-4 gap-y-1">
                  <div className="min-w-[180px]">
                    <p className="text-sm font-medium" style={{ color: "var(--crm-text)" }}>
                      {r.label}
                    </p>
                    <p className="text-[11px] font-mono" style={{ color: "var(--crm-text-muted)" }}>
                      {r.key}
                    </p>
                  </div>
                  <p className="flex-1 min-w-[220px] text-sm" style={{ color: "var(--crm-text-muted)" }}>
                    {r.published_value ?? <em>— not set —</em>}
                  </p>
                  {differs && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: "var(--crm-accent, #FCE722)", color: "#1A1A1A" }}
                    >
                      Draft differs
                    </span>
                  )}
                  {r.max_length != null && (
                    <span className="text-[11px]" style={{ color: "var(--crm-text-muted)" }}>
                      max {r.max_length}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}


/* ── One section ─────────────────────────────────────────────────────────── */

function SectionCard({
  row,
  isFirst,
  isLast,
  mayPublish,
  userId,
  onMove,
  onChanged,
  onDelete,
}: {
  row: Row;
  isFirst: boolean;
  isLast: boolean;
  mayPublish: boolean;
  userId: string | null;
  onMove: (dir: -1 | 1) => void;
  onChanged: () => void;
  onDelete: () => void;
}) {
  const def = kindDef(row.kind);
  const [draft, setDraft] = useState<Record<string, unknown>>(
    parsePayload<Record<string, unknown>>(row.kind, row.draft_payload),
  );
  const [busy, setBusy] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setDraft(parsePayload<Record<string, unknown>>(row.kind, row.draft_payload));
  }, [row.draft_payload, row.kind]);

  const unpublished =
    JSON.stringify(row.draft_payload ?? {}) !== JSON.stringify(row.payload ?? {}) || !row.published;

  if (!def) return null;

  async function saveDraft() {
    setBusy(true);
    const { error } = await supabase
      .from("page_sections")
      .update({ draft_payload: asJson(draft), updated_by: userId })
      .eq("id", row.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Draft saved.");
    onChanged();
  }

  async function publish() {
    setBusy(true);
    const { error } = await supabase
      .from("page_sections")
      .update({ draft_payload: asJson(draft), payload: asJson(draft), published: true, updated_by: userId })
      .eq("id", row.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Published. The previous version was saved to history.");
    onChanged();
  }

  async function toggleVisible() {
    setBusy(true);
    const { error } = await supabase
      .from("page_sections")
      .update({ published: !row.published, updated_by: userId })
      .eq("id", row.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onChanged();
  }

  return (
    <section className="rounded-xl border" style={surface}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-3" style={{ borderColor: "var(--crm-border)" }}>
        <div className="min-w-0">
          <h2 className="admin-display text-[16px] font-bold" style={{ color: "var(--crm-text)" }}>
            {def.label}
          </h2>
          <p className="admin-mono" style={{ color: "var(--crm-text-muted)" }}>
            {row.published ? "Visible" : "Hidden"} · position {row.position} · updated {georgetownLabel(row.updated_at)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {unpublished && (
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ backgroundColor: "#FCE722", color: "#1A1A1A" }}
            >
              Unpublished changes
            </span>
          )}
          <button
            type="button"
            aria-label="Move section up"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded disabled:opacity-30 focus:outline-none focus-visible:ring-2"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Move section down"
            disabled={isLast}
            onClick={() => onMove(1)}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded disabled:opacity-30 focus:outline-none focus-visible:ring-2"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            aria-label={row.published ? "Hide section" : "Show section"}
            disabled={!mayPublish || busy}
            onClick={() => void toggleVisible()}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded disabled:opacity-30 focus:outline-none focus-visible:ring-2"
            style={{ color: "var(--crm-text-muted)" }}
          >
            {row.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="Version history"
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded focus:outline-none focus-visible:ring-2"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <History className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Delete section"
            onClick={onDelete}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded focus:outline-none focus-visible:ring-2"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {def.fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label style={{ color: "var(--crm-text)" }}>{f.label}</Label>
            <FieldInput f={f} value={draft[f.key]} onChange={(v) => setDraft({ ...draft, [f.key]: v })} />
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button type="button" variant="outline" disabled={busy} onClick={() => void saveDraft()}>
            <Save className="size-4 mr-1.5" /> Save draft
          </Button>
          <Button
            type="button"
            disabled={busy || !mayPublish}
            onClick={() => void publish()}
            style={{ backgroundColor: "#EF7700", color: "#1A1A1A" }}
          >
            <UploadCloud className="size-4 mr-1.5" /> Publish
          </Button>
          {!mayPublish && (
            <span className="admin-mono" style={{ color: "var(--crm-text-muted)" }}>
              Your role can save drafts but not publish.
            </span>
          )}
        </div>

        {showHistory && <VersionHistory row={row} mayPublish={mayPublish} onRestored={onChanged} />}
      </div>
    </section>
  );
}

/* ── Version history ─────────────────────────────────────────────────────── */

type Version = { id: string; payload: Record<string, unknown>; created_at: string; created_by: string | null };

function VersionHistory({
  row,
  mayPublish,
  onRestored,
}: {
  row: Row;
  mayPublish: boolean;
  onRestored: () => void;
}) {
  const q = useQuery({
    queryKey: ["admin", "page_section_versions", row.id],
    queryFn: async (): Promise<Version[]> => {
      const { data, error } = await supabase
        .from("page_section_versions")
        .select("id, payload, created_at, created_by")
        .eq("section_id", row.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Version[];
    },
  });

  async function restore(v: Version) {
    const { error } = await supabase
      .from("page_sections")
      .update({ draft_payload: asJson(v.payload), payload: asJson(v.payload) })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Earlier version restored and published.");
    onRestored();
  }

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "var(--crm-border)" }}>
      <h3 className="admin-mono mb-2" style={{ color: "var(--crm-text-muted)" }}>
        Version history — the live content before each publish
      </h3>
      {q.isLoading ? (
        <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
          Loading…
        </p>
      ) : (q.data ?? []).length === 0 ? (
        <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
          Nothing yet — history starts building the second time this section is published.
        </p>
      ) : (
        <ul className="space-y-2">
          {(q.data ?? []).map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span style={{ color: "var(--crm-text)" }}>{georgetownLabel(v.created_at)}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!mayPublish}
                onClick={() => void restore(v)}
              >
                <RotateCcw className="size-4 mr-1.5" /> Restore
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
