import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ExternalLink, Newspaper, FileText, Megaphone, Search } from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/crm/newsroom")({
  head: () => ({ meta: [{ title: "Newsroom | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: CrmNewsroomPage,
});

type MediaType = "release" | "news" | "announcement";

type MediaItem = {
  id: string;
  type: MediaType;
  title: string;
  summary: string | null;
  body: string | null;
  outlet: string | null;
  external_url: string | null;
  image_url: string | null;
  published_at: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  type: MediaType;
  title: string;
  summary: string;
  body: string;
  outlet: string;
  external_url: string;
  image_url: string;
  published_at: string;
  is_published: boolean;
  sort_order: number;
};

const EMPTY: FormState = {
  type: "release",
  title: "",
  summary: "",
  body: "",
  outlet: "",
  external_url: "",
  image_url: "",
  published_at: new Date().toISOString().slice(0, 10),
  is_published: false,
  sort_order: 0,
};

const TYPE_META: Record<MediaType, { label: string; icon: typeof FileText; chip: string }> = {
  release: { label: "Release", icon: FileText, chip: "bg-[#EF7700]/15 text-[#EF7700] border-[#EF7700]/30" },
  news: { label: "News", icon: Newspaper, chip: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  announcement: { label: "Announcement", icon: Megaphone, chip: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
};

function CrmNewsroomPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["crm-media-items"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("media_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = {
        type: f.type,
        title: f.title.trim(),
        summary: f.summary.trim() || null,
        body: f.body.trim() || null,
        outlet: f.type === "news" ? (f.outlet.trim() || null) : null,
        external_url: f.external_url.trim() || null,
        image_url: f.image_url.trim() || null,
        published_at: new Date(f.published_at).toISOString(),
        is_published: f.is_published,
        sort_order: Number(f.sort_order) || 0,
      };
      if (!payload.title) throw new Error("Title is required");
      if (f.id) {
        const { error } = await (supabase as any).from("media_items").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("media_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(form.id ? "Item updated" : "Item created");
      qc.invalidateQueries({ queryKey: ["crm-media-items"] });
      qc.invalidateQueries({ queryKey: ["public-media-items"] });
      setEditorOpen(false);
      setForm(EMPTY);
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("media_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item deleted");
      qc.invalidateQueries({ queryKey: ["crm-media-items"] });
      qc.invalidateQueries({ queryKey: ["public-media-items"] });
      setConfirmDelete(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  const openNew = () => { setForm(EMPTY); setEditorOpen(true); };
  const openEdit = (it: MediaItem) => {
    setForm({
      id: it.id,
      type: it.type,
      title: it.title,
      summary: it.summary ?? "",
      body: it.body ?? "",
      outlet: it.outlet ?? "",
      external_url: it.external_url ?? "",
      image_url: it.image_url ?? "",
      published_at: it.published_at.slice(0, 10),
      is_published: it.is_published,
      sort_order: it.sort_order,
    });
    setEditorOpen(true);
  };

  const filtered = items.filter((it) =>
    !search ||
    it.title.toLowerCase().includes(search.toLowerCase()) ||
    (it.outlet ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CrmPage>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>Newsroom</h1>
          <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
            Manage media releases, press coverage, and announcements shown on the public newsroom.
          </p>
        </div>
        <Button onClick={openNew} className="bg-[#EF7700] hover:bg-[#EF7700]/90 text-white">
          <Plus className="size-4 mr-1.5" /> New item
        </Button>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "var(--crm-text-faint)" }} />
        <Input
          placeholder="Search by title or outlet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
        />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--crm-surface-muted)", color: "var(--crm-text-muted)" }}>
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Outlet</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--crm-text-muted)" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--crm-text-muted)" }}>No media items yet. Click “New item” to create one.</td></tr>
            ) : filtered.map((it) => {
              const meta = TYPE_META[it.type];
              const Icon = meta.icon;
              return (
                <tr key={it.id} className="border-t" style={{ borderColor: "var(--crm-border)" }}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.chip}`}>
                      <Icon className="size-3" /> {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-semibold truncate" style={{ color: "var(--crm-text)" }}>{it.title}</div>
                    {it.summary && <div className="text-xs truncate" style={{ color: "var(--crm-text-muted)" }}>{it.summary}</div>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--crm-text-muted)" }}>{it.outlet ?? "—"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--crm-text-muted)" }}>
                    {new Date(it.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {it.is_published ? (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-green-500/15 text-green-300 border-green-500/30">Published</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold bg-white/[0.06] text-white/50 border-white/[0.1]">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {it.external_url && (
                        <a href={it.external_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/5" title="Open link" style={{ color: "var(--crm-text-muted)" }}>
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(it)} className="p-1.5 rounded hover:bg-white/5" title="Edit" style={{ color: "var(--crm-text-muted)" }}>
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(it)} className="p-1.5 rounded hover:bg-red-500/10 hover:text-red-400" title="Delete" style={{ color: "var(--crm-text-muted)" }}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit media item" : "New media item"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MediaType })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="release">Media Release</SelectItem>
                    <SelectItem value="news">News (Press Coverage)</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Published date</Label>
                <Input type="date" className="mt-1.5" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Title *</Label>
              <Input className="mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <Label>Summary</Label>
              <Textarea className="mt-1.5" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Short blurb shown on the card." />
            </div>

            <div>
              <Label>Body (optional)</Label>
              <Textarea className="mt-1.5" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Full release / announcement text." />
            </div>

            {form.type === "news" && (
              <div>
                <Label>Outlet *</Label>
                <Input className="mt-1.5" value={form.outlet} onChange={(e) => setForm({ ...form, outlet: e.target.value })} placeholder="e.g. Stabroek News" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>External URL</Label>
                <Input className="mt-1.5" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} placeholder="https:// or /internal-path" />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input className="mt-1.5" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https:// or /assets/…" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Sort order</Label>
                <Input type="number" className="mt-1.5" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                  <Label>Published (visible on public site)</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-[#EF7700] hover:bg-[#EF7700]/90 text-white">
                {saveMutation.isPending ? "Saving…" : form.id ? "Save changes" : "Create item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this media item?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.title}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CrmPage>
  );
}
