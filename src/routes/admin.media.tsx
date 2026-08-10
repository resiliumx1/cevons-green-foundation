import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  Loader2,
  AlertTriangle,
  Megaphone,
  Images,
  MonitorPlay,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { getMediaUrl, invalidateMediaUrl, MEDIA_BUCKET } from "@/lib/mediaUrl";
import { processImage } from "@/lib/imageProcess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [{ title: "Media | CEVONS Website Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: CrmMediaPage,
});

type Kind = "slide" | "gallery" | "announcement";

type MediaPost = {
  id: string;
  created_at: string;
  kind: string;
  title: string;
  caption: string | null;
  image_path: string | null;
  image_w: number | null;
  image_h: number | null;
  published: boolean;
  sort_order: number;
};

const KINDS: Array<{ value: Kind; label: string; icon: typeof Images; hint: string }> = [
  { value: "slide", label: "Slides", icon: MonitorPlay, hint: "Full-width slideshow photos. Landscape works best." },
  { value: "gallery", label: "Gallery", icon: Images, hint: "Photo grid images." },
  { value: "announcement", label: "Announcements", icon: Megaphone, hint: "Text-only is fine — an image is optional." },
];

/* ------------------------------------------------------------------ */
/* Thumbnail                                                           */
/* ------------------------------------------------------------------ */

function Thumb({ path, alt }: { path: string | null; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setUrl(null);
    setFailed(false);
    if (!path) return;
    void getMediaUrl(path).then((u) => {
      if (!alive) return;
      if (u) setUrl(u);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [path]);

  return (
    <div
      className="h-20 w-28 shrink-0 rounded-lg overflow-hidden grid place-items-center border"
      style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)" }}
    >
      {!path ? (
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--crm-text-faint)" }}>
          Text only
        </span>
      ) : url ? (
        <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : failed ? (
        <ImageIcon className="size-5" style={{ color: "var(--crm-text-faint)" }} />
      ) : (
        <Loader2 className="size-4 animate-spin" style={{ color: "var(--crm-text-faint)" }} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function CrmMediaPage() {
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>("slide");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<{ label: string; pct: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaPost | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Text-only announcement composer
  const [annTitle, setAnnTitle] = useState("");
  const [annCaption, setAnnCaption] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["crm-media-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_posts")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaPost[];
    },
  });

  const rows = posts.filter((p) => p.kind === kind);

  const refresh = () => qc.invalidateQueries({ queryKey: ["crm-media-posts"] });

  /* ---------------- upload ---------------- */

  const nextSortOrder = (k: Kind) => {
    const existing = posts.filter((p) => p.kind === k).map((p) => p.sort_order);
    return existing.length ? Math.max(...existing) + 1 : 0;
  };

  async function uploadFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    const rejected = files.length - images.length;
    if (rejected > 0) {
      toast.error(`${rejected} file${rejected > 1 ? "s" : ""} skipped — only image files can be uploaded.`);
    }
    if (!images.length) return;

    let order = nextSortOrder(kind);

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const label = `${file.name} (${i + 1}/${images.length})`;
      try {
        setProgress({ label: `Optimising ${label}…`, pct: 15 });
        const processed = await processImage(file);

        setProgress({ label: `Uploading ${label}…`, pct: 55 });
        const path = `${kind}/${crypto.randomUUID()}.${processed.ext}`;
        const { error: upErr } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, processed.blob, { contentType: processed.mime, upsert: false });
        if (upErr) throw upErr;

        setProgress({ label: `Saving ${label}…`, pct: 85 });
        const { error: insErr } = await supabase.from("media_posts").insert({
          kind,
          title: file.name.replace(/\.[^.]+$/, "").slice(0, 120),
          caption: "",
          image_path: path,
          image_w: processed.width,
          image_h: processed.height,
          published: false,
          sort_order: order++,
        });
        if (insErr) {
          await supabase.storage.from(MEDIA_BUCKET).remove([path]);
          throw insErr;
        }

        setProgress({ label: `Done — ${label}`, pct: 100 });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed.";
        toast.error(msg);
      }
    }

    setProgress(null);
    toast.success("Upload complete — new items are saved as drafts.");
    refresh();
  }

  /* ---------------- mutations ---------------- */

  const patchMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<MediaPost> }) => {
      const { error } = await supabase.from("media_posts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (post: MediaPost) => {
      if (post.image_path) {
        const { error: sErr } = await supabase.storage.from(MEDIA_BUCKET).remove([post.image_path]);
        if (sErr) throw sErr;
        invalidateMediaUrl(post.image_path);
      }
      const { error } = await supabase.from("media_posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item deleted");
      setConfirmDelete(null);
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  async function move(index: number, dir: -1 | 1) {
    const a = rows[index];
    const b = rows[index + dir];
    if (!a || !b) return;
    const { error } = await supabase
      .from("media_posts")
      .upsert([
        { id: a.id, kind: a.kind, sort_order: b.sort_order },
        { id: b.id, kind: b.kind, sort_order: a.sort_order },
      ]);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  }

  async function createAnnouncement() {
    if (!annTitle.trim()) {
      toast.error("Give the announcement a title first.");
      return;
    }
    const { error } = await supabase.from("media_posts").insert({
      kind: "announcement",
      title: annTitle.trim(),
      caption: annCaption.trim(),
      image_path: null,
      published: false,
      sort_order: nextSortOrder("announcement"),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setAnnTitle("");
    setAnnCaption("");
    toast.success("Announcement saved as a draft.");
    refresh();
  }

  /* ---------------- render ---------------- */

  const activeKind = KINDS.find((k) => k.value === kind)!;

  return (
    <CrmPage>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>
          Media
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
          Upload and organise slideshow photos, gallery images, and announcements. Nothing appears on the public site
          until you switch it to Published.
        </p>
      </div>

      {/* Segmented control */}
      <div
        className="inline-flex rounded-xl border p-1 mb-5"
        style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)" }}
        role="tablist"
        aria-label="Media type"
      >
        {KINDS.map((k) => {
          const Icon = k.icon;
          const active = k.value === kind;
          return (
            <button
              key={k.value}
              role="tab"
              aria-selected={active}
              onClick={() => setKind(k.value)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors"
              style={
                active
                  ? { background: "#EF7700", color: "#ffffff" }
                  : { color: "var(--crm-text-muted)" }
              }
            >
              <Icon className="size-4" /> {k.label}
            </button>
          );
        })}
      </div>

      {/* Uploader */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void uploadFiles(Array.from(e.dataTransfer.files));
        }}
        className="rounded-xl border-2 border-dashed p-6 text-center transition-colors mb-4"
        style={{
          borderColor: dragOver ? "#EF7700" : "var(--crm-border)",
          background: dragOver ? "rgba(239,119,0,0.08)" : "var(--crm-surface)",
        }}
      >
        <Upload className="size-6 mx-auto mb-2" style={{ color: "var(--crm-text-muted)" }} />
        <p className="text-sm font-semibold" style={{ color: "var(--crm-text)" }}>
          Drag photos here, or
        </p>
        <Button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-3 bg-[#EF7700] hover:bg-[#EF7700]/90 text-white"
        >
          Choose photos
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            void uploadFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <p className="text-xs mt-3" style={{ color: "var(--crm-text-muted)" }}>
          {activeKind.hint} Photos are automatically resized to 1920px and compressed. Max 25MB per file.
        </p>

        {progress && (
          <div className="mt-4 max-w-sm mx-auto text-left">
            <div className="text-xs mb-1.5" style={{ color: "var(--crm-text-muted)" }}>
              {progress.label}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--crm-surface-muted)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${progress.pct}%`, background: "#EF7700" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Text-only announcement composer */}
      {kind === "announcement" && (
        <div
          className="rounded-xl border p-4 mb-5"
          style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
        >
          <div className="text-sm font-semibold mb-3" style={{ color: "var(--crm-text)" }}>
            Text-only announcement
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1.5"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Holiday collection schedule"
              />
            </div>
            <div>
              <Label>Caption</Label>
              <Textarea
                className="mt-1.5"
                rows={2}
                value={annCaption}
                onChange={(e) => setAnnCaption(e.target.value)}
                placeholder="Short body text."
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => void createAnnouncement()}
            className="mt-3 bg-[#EF7700] hover:bg-[#EF7700]/90 text-white"
          >
            <Plus className="size-4 mr-1.5" /> Add announcement
          </Button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm py-8 text-center" style={{ color: "var(--crm-text-muted)" }}>
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center text-sm"
            style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)", color: "var(--crm-text-muted)" }}
          >
            Nothing here yet.
          </div>
        ) : (
          rows.map((post, i) => (
            <MediaRow
              key={post.id}
              post={post}
              isFirst={i === 0}
              isLast={i === rows.length - 1}
              onMove={(dir) => void move(i, dir)}
              onPatch={(patch) => patchMutation.mutate({ id: post.id, patch })}
              onDelete={() => setConfirmDelete(post)}
            />
          ))
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.title || "Untitled"}” and its photo will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete)}
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

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */

function MediaRow({
  post,
  isFirst,
  isLast,
  onMove,
  onPatch,
  onDelete,
}: {
  post: MediaPost;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  onPatch: (patch: Partial<MediaPost>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(post.title);
  const [caption, setCaption] = useState(post.caption ?? "");
  // Contributors may create and edit drafts but never publish. The database
  // enforces the same rule through the media_posts insert/update policies.
  const { roles } = useAdminIdentity();
  const mayPublish = canPublish(roles);


  useEffect(() => setTitle(post.title), [post.title]);
  useEffect(() => setCaption(post.caption ?? ""), [post.caption]);

  const isPortraitSlide =
    post.kind === "slide" && !!post.image_w && !!post.image_h && post.image_h > post.image_w;

  return (
    <div
      className="rounded-xl border p-3 flex flex-col sm:flex-row gap-3"
      style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
    >
      <Thumb path={post.image_path} alt={post.title || "Media item"} />

      <div className="flex-1 min-w-0 space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== post.title && onPatch({ title })}
          placeholder="Title"
          className="font-semibold"
          style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
        />
        <Textarea
          rows={2}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => caption !== (post.caption ?? "") && onPatch({ caption })}
          placeholder="Caption"
          style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={{ color: "var(--crm-text-muted)" }}>
          {post.image_w && post.image_h ? <span>{post.image_w} × {post.image_h}px</span> : <span>No image</span>}
          <span>Position {post.sort_order}</span>
        </div>

        {isPortraitSlide && (
          <div
            className="flex items-start gap-2 rounded-lg border px-3 py-2 text-[12px]"
            style={{
              background: "rgba(245,158,11,0.12)",
              borderColor: "rgba(245,158,11,0.35)",
              color: "#F5C518",
            }}
          >
            <AlertTriangle className="size-4 shrink-0 mt-[1px]" />
            <span>
              Portrait photo — it will display with blurred side fills in the slideshow. Landscape photos fill the
              screen best.
            </span>
          </div>
        )}
      </div>

      <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 sm:w-40 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Switch
              checked={post.published}
              disabled={!mayPublish}
              onCheckedChange={(v) => onPatch({ published: v })}
              aria-label="Published"
            />
            <span className="text-[12px] font-semibold" style={{ color: "var(--crm-text)" }}>
              {post.published ? "Published" : "Draft"}
            </span>
          </div>
          {!mayPublish && (
            <span className="admin-mono text-center" style={{ color: "var(--crm-text-muted)" }}>
              Contributors can't publish
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30"
            title="Move up"
            aria-label="Move up"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30"
            title="Move down"
            aria-label="Move down"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
            aria-label="Delete"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
