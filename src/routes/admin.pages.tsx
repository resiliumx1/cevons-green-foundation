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
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

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

  const kindsForPage = useMemo(() => SECTION_KINDS.filter((k) => k.page === page), [page]);

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
          <select
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="min-h-[44px] rounded-lg border px-3 text-sm"
            style={field}
            aria-label="Page"
          >
            {EDITABLE_PAGES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <a href={`/admin/preview/${page}`} target="_blank" rel="noreferrer" className="admin-link-btn">
            <Eye className="size-4" aria-hidden /> Preview draft
          </a>
        </div>
      </header>

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
          No sections yet — the public page is rendering its built-in layout. Add a section above to start managing it
          here.
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
    </CrmPage>
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
