import { canPublish, useAdminIdentity } from "@/lib/adminAuth";
import { createFileRoute } from "@tanstack/react-router";
import { forwardRef, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
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
  CheckCircle2,
  Globe,
  Crop,
  RotateCcw,
  Minus,
  CalendarClock,
  Clock3,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { getMediaUrl, invalidateMediaUrl, MEDIA_BUCKET } from "@/lib/mediaUrl";
import { processImage } from "@/lib/imageProcess";
import { mediaImageStyle } from "@/lib/mediaPosts";
import {
  GEORGETOWN_LABEL,
  georgetownInputToUtc,
  georgetownLabel,
  utcToGeorgetownInput,
} from "@/lib/georgetown";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [
      { title: "Media | CEVONS Website Admin" },
      { name: "description", content: "Manage CEVONS website slides, gallery photos, announcements, publishing, and photo crops." },
      { property: "og:title", content: "Media | CEVONS Website Admin" },
      { property: "og:description", content: "Manage CEVONS website slides, gallery photos, announcements, publishing, and photo crops." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
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
  publish_at: string | null;
  unpublish_at: string | null;
  focal_x: number;
  focal_y: number;
  image_fit: ImageFit;
  image_zoom: number;
};

type ImageFit = "cover" | "contain" | "custom";
type ImagePresentation = { focal_x: number; focal_y: number; image_fit: ImageFit; image_zoom: number };

function haptic(pattern: number | number[] = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
}

const KINDS: Array<{ value: Kind; label: string; icon: typeof Images; hint: string }> = [
  { value: "slide", label: "Slides", icon: MonitorPlay, hint: "Full-width slideshow photos. Landscape works best." },
  { value: "gallery", label: "Gallery", icon: Images, hint: "Photo grid images." },
  { value: "announcement", label: "Announcements", icon: Megaphone, hint: "Text-only is fine — an image is optional." },
];

/* ------------------------------------------------------------------ */
/* Thumbnail                                                           */
/* ------------------------------------------------------------------ */

function Thumb({ path, alt, presentation }: { path: string | null; alt: string; presentation?: ImagePresentation }) {
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
        <img
          src={url}
          alt={alt}
          className="h-full w-full"
          style={presentation ? mediaImageStyle(presentation) : undefined}
          loading="lazy"
        />
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
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const uploadOrderRef = useRef(0);
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

  function chooseFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    const rejected = files.length - images.length;
    if (rejected > 0) {
      toast.error(`${rejected} file${rejected > 1 ? "s" : ""} skipped — only image files can be uploaded.`);
    }
    if (!images.length) return;
    haptic();
    uploadOrderRef.current = nextSortOrder(kind);
    setUploadQueue(images);
  }

  async function savePreparedUpload(settings: ImagePresentation) {
    const file = uploadQueue[0];
    if (!file) return;
    setUploadBusy(true);
    try {
      setProgress({ label: `Optimising ${file.name}…`, pct: 15 });
      const processed = await processImage(file);
      setProgress({ label: `Uploading ${file.name}…`, pct: 55 });
      const path = `${kind}/${crypto.randomUUID()}.${processed.ext}`;
      const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(path, processed.blob, { contentType: processed.mime, upsert: false });
      if (upErr) throw upErr;
      setProgress({ label: `Saving ${file.name}…`, pct: 85 });
      const { error: insErr } = await supabase.from("media_posts").insert({
        kind,
        title: file.name.replace(/\.[^.]+$/, "").slice(0, 120),
        caption: "",
        image_path: path,
        image_w: processed.width,
        image_h: processed.height,
        published: false,
        sort_order: uploadOrderRef.current++,
        ...settings,
      });
      if (insErr) {
        await supabase.storage.from(MEDIA_BUCKET).remove([path]);
        throw insErr;
      }
      setProgress({ label: `Done — ${file.name}`, pct: 100 });
      setUploadQueue((queue) => queue.slice(1));
      toast.success(uploadQueue.length > 1 ? "Photo saved. Prepare the next photo." : "Photo saved as a draft.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProgress(null);
      setUploadBusy(false);
    }
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

  const activeKind = KINDS.find((k) => k.value === kind) ?? KINDS[0];

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
          chooseFiles(Array.from(e.dataTransfer.files));
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
          onClick={() => { haptic(); fileRef.current?.click(); }}
          className="tap-haptic mt-3 bg-[#EF7700] hover:bg-[#EF7700]/90 text-white"
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
             chooseFiles(Array.from(e.target.files ?? []));
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
      {uploadQueue[0] && (
        <ImagePresentationDialog
          title={uploadQueue.length > 1 ? `Prepare photo 1 of ${uploadQueue.length}` : "Prepare photo before upload"}
          source={uploadQueue[0]}
          kind={kind}
          open
          busy={uploadBusy}
          onOpenChange={(next) => { if (!next && !uploadBusy) setUploadQueue((queue) => queue.slice(1)); }}
          onSave={(settings) => void savePreparedUpload(settings)}
        />
      )}

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
        <AlertDialogCancel className="tap-haptic" onClick={() => haptic()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { haptic([10, 35, 10]); if (confirmDelete) deleteMutation.mutate(confirmDelete); }}
              className="tap-haptic bg-red-600 hover:bg-red-700"
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


  // Swap the photo on an existing item, keeping its title, caption,
  // schedule and position. The old file is removed only after the row
  // points at the new one, so a failure never leaves the item photoless.
  const qcRow = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busyPhoto, setBusyPhoto] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [replacement, setReplacement] = useState<File | null>(null);

  async function replacePhoto(file: File, settings: ImagePresentation) {
    setBusyPhoto(true);
    try {
      const processed = await processImage(file);
      const path = `${post.kind}/${crypto.randomUUID()}.${processed.ext}`;
      const { error: upErr } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, processed.blob, { contentType: processed.mime, upsert: false });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase
        .from("media_posts")
        .update({ image_path: path, image_w: processed.width, image_h: processed.height, ...settings })
        .eq("id", post.id);
      if (dbErr) {
        await supabase.storage.from(MEDIA_BUCKET).remove([path]);
        throw dbErr;
      }

      const old = post.image_path;
      if (old && old !== path) {
        await supabase.storage.from(MEDIA_BUCKET).remove([old]);
        invalidateMediaUrl(old);
      }
      toast.success("Photo updated.");
      setReplacement(null);
      void qcRow.invalidateQueries({ queryKey: ["crm-media-posts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update that photo.");
    } finally {
      setBusyPhoto(false);
    }
  }

  useEffect(() => setTitle(post.title), [post.title]);
  useEffect(() => setCaption(post.caption ?? ""), [post.caption]);

  const isPortraitSlide =
    post.kind === "slide" && !!post.image_w && !!post.image_h && post.image_h > post.image_w;

  return (
    <div
      className="rounded-xl border p-3 flex flex-col sm:flex-row gap-3"
      style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
    >
      <div className="shrink-0 space-y-2 sm:w-48">
        <div className="flex items-center gap-3 sm:block">
          <Thumb
            path={post.image_path}
            alt={post.title || "Media item"}
            presentation={{ focal_x: post.focal_x, focal_y: post.focal_y, image_fit: post.image_fit, image_zoom: post.image_zoom }}
          />
          <div className="min-w-0 sm:mt-2">
            <p className="text-sm font-bold" style={{ color: "var(--crm-text)" }}>Photo controls</p>
            <p className="mt-0.5 text-xs leading-snug" style={{ color: "var(--crm-text-muted)" }}>
              Replace the photo or adjust how it appears on the website.
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) setReplacement(f);
          }}
        />
        <Button
          type="button"
          size="sm"
           className="tap-haptic w-full min-h-11 border font-bold shadow-sm"
          style={{
            background: "var(--admin-orange)",
            borderColor: "var(--admin-orange-strong)",
            color: "var(--admin-charcoal)",
          }}
          disabled={busyPhoto}
          onClick={() => { haptic(); fileRef.current?.click(); }}
        >
          {busyPhoto ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {busyPhoto ? "Saving…" : post.image_path ? "Change photo" : "Add photo"}
        </Button>
        {post.image_path && (
          <Button
            type="button"
            size="sm"
            className="tap-haptic w-full min-h-11 border font-bold shadow-sm"
            style={{
              background: "var(--admin-navy)",
              borderColor: "var(--admin-navy-strong)",
              color: "var(--admin-on-navy)",
            }}
            onClick={() => { haptic(); setCropOpen(true); }}
          >
            <Crop className="size-4" /> Adjust website crop
          </Button>
        )}
        {post.image_path && (
          <p className="px-1 text-center text-xs leading-snug" style={{ color: "var(--crm-text-muted)" }}>
            Crop changes the website view only. Your original photo stays intact.
          </p>
        )}
      </div>

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

        <Scheduling post={post} disabled={!mayPublish} onPatch={onPatch} />

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
        <div className="w-full space-y-1.5">
          <Button
            type="button"
            disabled={!mayPublish}
            onClick={() => { haptic(post.published ? [8, 25, 8] : 12); onPatch({ published: !post.published }); }}
            aria-label={post.published ? "Switch back to draft" : "Publish this item"}
            title={
              post.published
                ? "Showing on the public site — click to switch back to draft"
                : "Make this item live on the public site"
            }
            className={
              "tap-haptic w-full min-h-11 text-sm font-bold rounded-lg " +
              (post.published
                ? "bg-[#15803D] hover:bg-[#15803D]/90 text-white"
                : "bg-[#EF7700] hover:bg-[#EF7700]/90 text-white shadow-[0_4px_14px_rgba(239,119,0,0.4)]")
            }
          >
            {post.published ? (
              <>
                <CheckCircle2 className="size-4 mr-1.5 shrink-0" /> Published
              </>
            ) : (
              <>
                <Globe className="size-4 mr-1.5 shrink-0" /> Publish
              </>
            )}
          </Button>
          <p className="text-[11px] text-center leading-tight" style={{ color: "var(--crm-text-muted)" }}>
            {mayPublish
              ? post.published
                ? "Live on the site — click to unpublish"
                : "Not on the site yet — click to publish"
              : "Contributors can't publish"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { haptic(); onMove(-1); }}
            disabled={isFirst}
            className="tap-haptic p-2.5 rounded hover:bg-white/5 disabled:opacity-30"
            title="Move up"
            aria-label="Move up"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            onClick={() => { haptic(); onMove(1); }}
            disabled={isLast}
            className="tap-haptic p-2.5 rounded hover:bg-white/5 disabled:opacity-30"
            title="Move down"
            aria-label="Move down"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            onClick={() => { haptic([8, 25, 8]); onDelete(); }}
            className="tap-haptic p-2.5 rounded hover:bg-red-500/10 hover:text-red-400"
            title="Delete"
            aria-label="Delete"
            style={{ color: "var(--crm-text-muted)" }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <FocalCropDialog
        post={post}
        open={cropOpen}
        onOpenChange={setCropOpen}
        onSave={(settings) => onPatch(settings)}
      />
      {replacement && (
        <ImagePresentationDialog
          title="Prepare replacement photo"
          source={replacement}
          kind={post.kind as Kind}
          open
          busy={busyPhoto}
          onOpenChange={(next) => { if (!next && !busyPhoto) setReplacement(null); }}
          onSave={(settings) => void replacePhoto(replacement, settings)}
        />
      )}
    </div>
  );
}

function FocalCropDialog({
  post,
  open,
  onOpenChange,
  onSave,
}: {
  post: MediaPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: ImagePresentation) => void;
}) {
  return (
    <ImagePresentationDialog
      title="Adjust website photo"
      source={post.image_path ?? ""}
      kind={post.kind as Kind}
      initial={{ focal_x: post.focal_x ?? 50, focal_y: post.focal_y ?? 50, image_fit: post.image_fit ?? "cover", image_zoom: post.image_zoom ?? 100 }}
      open={open}
      onOpenChange={onOpenChange}
      onSave={(settings) => { onSave(settings); onOpenChange(false); }}
    />
  );
}

function ImagePresentationDialog({
  title,
  source,
  kind,
  initial = { focal_x: 50, focal_y: 50, image_fit: "cover", image_zoom: 100 },
  open,
  busy = false,
  onOpenChange,
  onSave,
}: {
  title: string;
  source: File | string;
  kind: Kind;
  initial?: ImagePresentation;
  open: boolean;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: ImagePresentation) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [fit, setFit] = useState<ImageFit>(initial.image_fit);
  const [x, setX] = useState(initial.focal_x);
  const [y, setY] = useState(initial.focal_y);
  const [zoom, setZoom] = useState(initial.image_zoom);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setFit(initial.image_fit);
    setX(initial.focal_x);
    setY(initial.focal_y);
    setZoom(initial.image_zoom);
    let alive = true;
    let objectUrl: string | null = null;
    if (source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      setUrl(objectUrl);
    } else {
      void getMediaUrl(source).then((next) => { if (alive) setUrl(next); });
    }
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, source, initial.image_fit, initial.focal_x, initial.focal_y, initial.image_zoom]);

  const moveFocus = (clientX: number, clientY: number) => {
    if (fit === "contain") return;
    const box = previewRef.current?.getBoundingClientRect();
    if (!box) return;
    setX(Math.round(Math.max(0, Math.min(100, ((clientX - box.left) / box.width) * 100))));
    setY(Math.round(Math.max(0, Math.min(100, ((clientY - box.top) / box.height) * 100))));
  };
  const imageStyle = {
    objectFit: fit === "contain" ? "contain" : "cover",
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${fit === "custom" ? zoom / 100 : 1})`,
    transformOrigin: `${x}% ${y}%`,
  } as const;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-3xl overflow-y-auto" style={{ background: "var(--crm-surface, #ffffff)", borderColor: "var(--crm-border, #d9dde3)", color: "var(--crm-text, #1a1a1a)" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Crop className="size-5" /> {title}</DialogTitle>
          <DialogDescription style={{ color: "var(--crm-text-muted, #5f6670)" }}>Choose how the photo fits, then move the focus onto the important area. The original photo stays intact.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Photo fit">
          {([
            ["cover", "Fill box", "Best automatic fit"],
            ["contain", "Fit whole photo", "No cropping"],
            ["custom", "Custom crop", "Position and zoom"],
          ] as const).map(([value, label, hint]) => (
            <Button key={value} type="button" variant="outline" role="radio" aria-checked={fit === value} onClick={() => { haptic(); setFit(value); if (value !== "custom") setZoom(100); }} className="tap-haptic min-h-16 h-auto rounded-lg border px-2 py-2 text-center whitespace-normal" style={{ borderColor: fit === value ? "var(--admin-orange-strong, #c45f00)" : "var(--crm-border, #d9dde3)", background: fit === value ? "var(--admin-accent-soft, #fff1df)" : "var(--crm-surface-muted, #f4f6f8)", color: "var(--crm-text, #1a1a1a)", boxShadow: fit === value ? "inset 0 0 0 1px var(--admin-orange-strong, #c45f00)" : "none" }}>
              <span className="block">
              <span className="block text-xs font-extrabold sm:text-sm">{label}</span>
              <span className="mt-0.5 block text-[10px]" style={{ color: "var(--crm-text-muted, #5f6670)" }}>{hint}</span>
              </span>
            </Button>
          ))}
        </div>
        <div className={kind === "slide" ? "grid gap-3 sm:grid-cols-[1fr_10rem]" : "grid gap-3"}>
          <div>
            <p className="mb-1.5 text-xs font-bold" style={{ color: "var(--crm-text-muted, #5f6670)" }}>{kind === "slide" ? "Desktop preview" : "Website preview"}</p>
            <CropPreview
              ref={previewRef}
              url={url}
              className={kind === "slide" ? "aspect-video" : "aspect-[4/3]"}
              imageStyle={imageStyle}
              interactive={fit !== "contain"}
              onMove={moveFocus}
              onNudge={(nextX, nextY) => { setX(nextX); setY(nextY); }}
              x={x}
              y={y}
            />
          </div>
          {kind === "slide" && (
            <div>
              <p className="mb-1.5 text-xs font-bold" style={{ color: "var(--crm-text-muted, #5f6670)" }}>Phone preview</p>
              <CropPreview url={url} className="mx-auto aspect-[9/16] max-h-72" imageStyle={imageStyle} />
            </div>
          )}
        </div>
        {fit === "custom" && (
          <div className="space-y-2 rounded-lg border p-3" style={{ borderColor: "var(--crm-border, #d9dde3)", background: "var(--crm-surface-muted, #f4f6f8)" }}>
            <Label htmlFor="crop-zoom" className="flex items-center justify-between"><span>Zoom</span><strong>{zoom}%</strong></Label>
            <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="tap-haptic size-11" disabled={zoom <= 100} aria-label="Zoom out" onClick={() => { haptic(); setZoom((value) => Math.max(100, value - 5)); }}><Minus className="size-4" /></Button>
              <input id="crop-zoom" className="w-full accent-[var(--admin-orange)]" type="range" min="100" max="200" step="1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} onPointerUp={() => haptic()} aria-valuetext={`${zoom} percent`} />
              <Button type="button" variant="outline" size="icon" className="tap-haptic size-11" disabled={zoom >= 200} aria-label="Zoom in" onClick={() => { haptic(); setZoom((value) => Math.min(200, value + 5)); }}><Plus className="size-4" /></Button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: "var(--crm-text-muted, #5f6670)" }}>
          <p>{fit === "contain" ? "The full photo remains visible. Empty space may appear around it." : "Drag the large preview to set the focus. Arrow keys make precise adjustments."}</p>
          {fit !== "contain" && <output aria-live="polite" className="font-bold tabular-nums">Focus: {x}% × {y}%</output>}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" disabled={busy} className="tap-haptic" onClick={() => { haptic(); setFit("cover"); setX(50); setY(50); setZoom(100); }}><RotateCcw className="size-4" /> Reset</Button>
          <Button type="button" variant="outline" disabled={busy} className="tap-haptic" onClick={() => { haptic(); onOpenChange(false); }}>Cancel</Button>
          <Button type="button" disabled={busy} className="tap-haptic font-bold" style={{ background: "var(--admin-orange, #ef7700)", color: "var(--admin-charcoal, #1a1a1a)" }} onClick={() => { haptic(12); onSave({ focal_x: x, focal_y: y, image_fit: fit, image_zoom: fit === "custom" ? zoom : 100 }); }}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} {busy ? "Saving…" : "Use this photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const CropPreview = forwardRef<HTMLDivElement, { url: string | null; className: string; imageStyle: CSSProperties; interactive?: boolean; onMove?: (x: number, y: number) => void; onNudge?: (x: number, y: number) => void; x?: number; y?: number }>(function CropPreview({ url, className, imageStyle, interactive = false, onMove, onNudge, x = 50, y = 50 }, ref) {
  const [dragging, setDragging] = useState(false);
  const nudge = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const amount = event.shiftKey ? 5 : 1;
    let nextX = x;
    let nextY = y;
    if (event.key === "ArrowLeft") nextX -= amount;
    else if (event.key === "ArrowRight") nextX += amount;
    else if (event.key === "ArrowUp") nextY -= amount;
    else if (event.key === "ArrowDown") nextY += amount;
    else return;
    event.preventDefault();
    onNudge?.(Math.max(0, Math.min(100, nextX)), Math.max(0, Math.min(100, nextY)));
    haptic();
  };
  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-lg border touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-orange)] focus-visible:ring-offset-2 ${className}`}
      style={{ borderColor: "var(--crm-border, #d9dde3)", background: "var(--crm-surface-muted, #f4f6f8)", cursor: interactive ? (dragging ? "grabbing" : "grab") : "default" }}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "slider" : "img"}
      aria-label={interactive ? "Photo crop position" : "Photo preview"}
      aria-roledescription={interactive ? "image cropper" : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-valuenow={interactive ? x : undefined}
      aria-valuetext={interactive ? `Focus at ${x} percent horizontal and ${y} percent vertical` : undefined}
      onKeyDown={nudge}
      onPointerDown={(event) => { if (!interactive) return; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); onMove?.(event.clientX, event.clientY); }}
      onPointerMove={(event) => { if (interactive && event.currentTarget.hasPointerCapture(event.pointerId)) onMove?.(event.clientX, event.clientY); }}
      onPointerUp={(event) => { if (!interactive) return; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); setDragging(false); haptic(); }}
      onPointerCancel={() => setDragging(false)}
    >
      {url ? <img src={url} alt="" className="size-full pointer-events-none" style={imageStyle} /> : <div className="grid size-full place-items-center"><Loader2 className="size-5 animate-spin" /></div>}
      {interactive && <><div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-60" aria-hidden>{Array.from({ length: 9 }).map((_, index) => <span key={index} className="border border-white/30" />)}</div><span className="pointer-events-none absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.8)]" style={{ left: `${x}%`, top: `${y}%` }}><span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "var(--admin-orange, #ef7700)" }} /></span></>}
    </div>
  );
});


/* ------------------------------------------------------------------ */
/* Scheduling — Georgetown in, UTC stored, evaluated at read time      */
/* ------------------------------------------------------------------ */

function Scheduling({
  post,
  disabled,
  onPatch,
}: {
  post: MediaPost;
  disabled: boolean;
  onPatch: (patch: Partial<MediaPost>) => void;
}) {
  const inputStyle = {
    background: "var(--crm-surface-muted)",
    borderColor: "var(--crm-border)",
    color: "var(--crm-text)",
  } as const;

  const now = Date.now();
  const live =
    post.published &&
    (!post.publish_at || new Date(post.publish_at).getTime() <= now) &&
    (!post.unpublish_at || new Date(post.unpublish_at).getTime() > now);
  const startsLater = !!post.publish_at && new Date(post.publish_at).getTime() > now;
  const ended = !!post.unpublish_at && new Date(post.unpublish_at).getTime() <= now;
  const invalidWindow = !!post.publish_at && !!post.unpublish_at && new Date(post.unpublish_at).getTime() <= new Date(post.publish_at).getTime();
  const status = !post.published
    ? { label: "Draft", detail: "Not visible until Publish is selected.", color: "var(--crm-text-muted)", bg: "var(--crm-surface-muted)", icon: ImageIcon }
    : invalidWindow
      ? { label: "Fix schedule", detail: "The end must be later than the start.", color: "var(--admin-red)", bg: "color-mix(in oklab, var(--admin-red) 12%, var(--crm-surface))", icon: AlertTriangle }
      : live
        ? { label: "Live now", detail: post.unpublish_at ? `Comes down ${georgetownLabel(post.unpublish_at)}.` : "No end date is set.", color: "var(--admin-green)", bg: "color-mix(in oklab, var(--admin-green) 12%, var(--crm-surface))", icon: CheckCircle2 }
        : startsLater
          ? { label: "Scheduled", detail: `Goes live ${georgetownLabel(post.publish_at)}.`, color: "var(--admin-blue)", bg: "color-mix(in oklab, var(--admin-blue) 12%, var(--crm-surface))", icon: CalendarClock }
          : ended
            ? { label: "Ended", detail: `Came down ${georgetownLabel(post.unpublish_at)}.`, color: "var(--admin-orange-strong)", bg: "var(--admin-accent-soft)", icon: Clock3 }
            : { label: "Outside schedule", detail: "This item is published but is not currently visible.", color: "var(--admin-orange-strong)", bg: "var(--admin-accent-soft)", icon: Clock3 };
  const StatusIcon = status.icon;

  return (
    <div className="rounded-lg border p-3 space-y-3" style={{ borderColor: invalidWindow ? "var(--admin-red)" : "var(--crm-border)" }}>
      <div className="flex items-start gap-2 rounded-md border px-3 py-2" style={{ background: status.bg, borderColor: status.color }}>
        <StatusIcon className="mt-0.5 size-4 shrink-0" style={{ color: status.color }} />
        <div><p className="text-xs font-extrabold" style={{ color: status.color }}>{status.label}</p><p className="text-[11px] leading-snug" style={{ color: "var(--crm-text)" }}>{status.detail}</p></div>
      </div>
      <p className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--crm-text)" }}>
        <CalendarClock className="size-4" style={{ color: "var(--admin-orange-strong)" }} /> Publishing schedule <span className="font-normal" style={{ color: "var(--crm-text-muted)" }}>({GEORGETOWN_LABEL})</span>
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="space-y-1 block">
          <span className="text-xs font-bold" style={{ color: "var(--crm-text)" }}>Goes live</span>
          <div className="flex gap-1"><Input type="datetime-local" disabled={disabled} value={utcToGeorgetownInput(post.publish_at)} onChange={(e) => onPatch({ publish_at: georgetownInputToUtc(e.target.value) })} style={inputStyle} />{post.publish_at && <Button type="button" variant="outline" size="icon" disabled={disabled} onClick={() => onPatch({ publish_at: null })} aria-label="Clear go-live date"><X className="size-4" /></Button>}</div>
        </label>
        <label className="space-y-1 block">
          <span className="text-xs font-bold" style={{ color: "var(--crm-text)" }}>Comes down <span className="font-normal" style={{ color: "var(--crm-text-muted)" }}>(optional)</span></span>
          <div className="flex gap-1"><Input type="datetime-local" disabled={disabled} value={utcToGeorgetownInput(post.unpublish_at)} onChange={(e) => onPatch({ unpublish_at: georgetownInputToUtc(e.target.value) })} style={inputStyle} />{post.unpublish_at && <Button type="button" variant="outline" size="icon" disabled={disabled} onClick={() => onPatch({ unpublish_at: null })} aria-label="Clear end date"><X className="size-4" /></Button>}</div>
        </label>
      </div>
      <p className="text-[11px]" style={{ color: invalidWindow ? "var(--admin-red)" : "var(--crm-text-muted)" }}>{invalidWindow ? "Choose an end date later than the go-live date." : "Dates do not publish a draft automatically. Select Publish when it is ready."}</p>
    </div>
  );
}
