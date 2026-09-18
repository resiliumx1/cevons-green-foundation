import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Copy, ImagePlus, Plus, RefreshCw, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { GEORGETOWN_LABEL, georgetownLabel } from "@/lib/georgetown";
import { PanelSkeleton, PanelError } from "@/components/admin/Manifest";
import { processImage } from "@/lib/imageProcess";
import { MEDIA_BUCKET, invalidateMediaUrl } from "@/lib/mediaUrl";
import { useMediaSrc } from "@/components/media/useMediaSrc";

export const Route = createFileRoute("/admin/social")({
  head: () => ({
    meta: [
      { title: "Social posts | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SocialPostsPage,
});

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", tone: "#111827" },
  { id: "facebook", label: "Facebook", tone: "#2563EB" },
  { id: "instagram", label: "Instagram", tone: "#C13584" },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

const STATUSES = [
  { id: "draft", label: "Draft", tone: "#64748B" },
  { id: "scheduled", label: "Scheduled", tone: "#EA6A00" },
  { id: "posted", label: "Posted", tone: "#15803D" },
  { id: "cancelled", label: "Cancelled", tone: "#9CA3AF" },
] as const;

type SocialPost = {
  id: string;
  platforms: string[];
  caption: string;
  image_path: string | null;
  link_url: string | null;
  scheduled_at: string | null;
  status: string;
  posted_at: string | null;
  notes: string | null;
  created_at: string;
};

/** ISO string -> value a `datetime-local` input accepts, in the browser's zone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StatusChip({ status }: { status: string }) {
  const s = STATUSES.find((x) => x.id === status);
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5 shrink-0"
      style={{ background: s?.tone ?? "#64748B", color: "#FFFFFF" }}
    >
      {s?.label ?? status}
    </span>
  );
}

function PlatformChips({ platforms }: { platforms: string[] }) {
  if (platforms.length === 0)
    return (
      <span className="text-xs" style={{ color: "var(--crm-text-muted)" }}>
        No account chosen
      </span>
    );
  return (
    <>
      {platforms.map((p) => {
        const meta = PLATFORMS.find((x) => x.id === p);
        return (
          <span
            key={p}
            className="text-[10px] font-semibold rounded px-2 py-0.5"
            style={{ border: `1px solid ${meta?.tone ?? "var(--crm-border)"}`, color: meta?.tone }}
          >
            {meta?.label ?? p}
          </span>
        );
      })}
    </>
  );
}

function Thumb({ path }: { path: string | null }) {
  const src = useMediaSrc(path);
  if (!path) return null;
  return (
    <img
      src={src ?? undefined}
      alt=""
      width={96}
      height={96}
      loading="lazy"
      className="size-24 rounded-lg object-cover shrink-0"
      style={{ background: "var(--crm-surface-muted)" }}
    />
  );
}

function SocialPostsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [composerOpen, setComposerOpen] = useState(false);

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-social-posts"],
    queryFn: async (): Promise<SocialPost[]> => {
      const { data, error } = await supabase
        .from("social_posts")
        .select(
          "id, platforms, caption, image_path, link_url, scheduled_at, status, posted_at, notes, created_at",
        )
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as SocialPost[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-social-posts"] });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<SocialPost> }) => {
      const { error } = await supabase.from("social_posts").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void refresh(),
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not save that change."),
  });

  const remove = useMutation({
    mutationFn: async (post: SocialPost) => {
      const { error } = await supabase.from("social_posts").delete().eq("id", post.id);
      if (error) throw error;
      if (post.image_path) {
        await supabase.storage.from(MEDIA_BUCKET).remove([post.image_path]);
        invalidateMediaUrl(post.image_path);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted.");
      void refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not delete."),
  });

  const rows = useMemo(
    () =>
      data.filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (platformFilter !== "all" && !p.platforms.includes(platformFilter)) return false;
        return true;
      }),
    [data, statusFilter, platformFilter],
  );

  const upcoming = data.filter(
    (p) => p.status === "scheduled" && p.scheduled_at && new Date(p.scheduled_at) > new Date(),
  ).length;

  return (
    <CrmPage className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>
            Social posts
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
            Plan and schedule TikTok, Facebook and Instagram posts
            {upcoming > 0 ? ` — ${upcoming} coming up` : ""}. Times are {GEORGETOWN_LABEL}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="admin-btn-quiet"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden />
            Refresh
          </button>
          <button
            type="button"
            className="admin-btn-quiet"
            onClick={() => setComposerOpen((v) => !v)}
          >
            {composerOpen ? <X className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
            {composerOpen ? "Close" : "New post"}
          </button>
        </div>
      </div>

      <p
        className="rounded-lg border p-3 text-xs"
        style={{ borderColor: "var(--crm-border)", color: "var(--crm-text-muted)" }}
      >
        Nothing is sent to TikTok, Facebook or Instagram automatically — posting permission from
        those platforms isn't in place. This page holds the wording, photo and timing; copy the
        caption and download the photo when it's time to post, then mark it as posted.
      </p>

      {composerOpen && <Composer onDone={() => { setComposerOpen(false); void refresh(); }} />}

      <div className="admin-toolbar">
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="admin-select"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          aria-label="Filter by account"
        >
          <option value="all">All accounts</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}
        >
          <PanelSkeleton rows={4} />
        </div>
      ) : isError ? (
        <PanelError what="social posts" error={error} />
      ) : rows.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}
        >
          <CalendarClock className="size-6 mx-auto mb-2" style={{ color: "var(--crm-text-faint)" }} />
          <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
            {data.length === 0
              ? "No posts planned yet. Use “New post” to write one and give it a date."
              : "No posts match these filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onPatch={(values) => patch.mutate({ id: p.id, values })}
              onDelete={() => remove.mutate(p)}
              busy={patch.isPending || remove.isPending}
            />
          ))}
        </div>
      )}
    </CrmPage>
  );
}

/* ── Composer ─────────────────────────────────────────────────────────── */

function Composer({ onDone }: { onDone: () => void }) {
  const [platforms, setPlatforms] = useState<PlatformId[]>([]);
  const [caption, setCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (id: PlatformId) =>
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  async function save(status: "draft" | "scheduled") {
    if (!caption.trim()) {
      toast.error("Write the caption first.");
      return;
    }
    if (status === "scheduled" && !when) {
      toast.error("Choose the date and time to schedule it.");
      return;
    }
    setSaving(true);
    let imagePath: string | null = null;
    let width: number | null = null;
    let height: number | null = null;
    try {
      if (file) {
        const processed = await processImage(file);
        const path = `social/${crypto.randomUUID()}.${processed.ext}`;
        const { error: upErr } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, processed.blob, { contentType: processed.mime, upsert: false });
        if (upErr) throw upErr;
        imagePath = path;
        width = processed.width;
        height = processed.height;
      }
      const { error } = await supabase.from("social_posts").insert({
        platforms,
        caption: caption.trim(),
        link_url: linkUrl.trim() || null,
        scheduled_at: when ? new Date(when).toISOString() : null,
        notes: notes.trim() || null,
        status,
        image_path: imagePath,
        image_w: width,
        image_h: height,
      });
      if (error) {
        if (imagePath) await supabase.storage.from(MEDIA_BUCKET).remove([imagePath]);
        throw error;
      }
      toast.success(status === "scheduled" ? "Post scheduled." : "Draft saved.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save this post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
    >
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => {
          const on = platforms.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              className="min-h-11 rounded-lg px-3 text-sm font-semibold"
              style={{
                border: `1px solid ${on ? p.tone : "var(--crm-border)"}`,
                background: on ? p.tone : "transparent",
                color: on ? "#FFFFFF" : "var(--crm-text)",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <label className="block text-sm" style={{ color: "var(--crm-text)" }}>
        Caption
        <textarea
          className="admin-input mt-1 w-full"
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What should this post say?"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm" style={{ color: "var(--crm-text)" }}>
          Link (optional)
          <input
            className="admin-input mt-1 w-full"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://cevons.com/…"
            inputMode="url"
          />
        </label>
        <label className="block text-sm" style={{ color: "var(--crm-text)" }}>
          Date and time
          <input
            type="datetime-local"
            className="admin-input mt-1 w-full"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </label>
      </div>

      <label className="block text-sm" style={{ color: "var(--crm-text)" }}>
        Note for the team (optional)
        <input
          className="admin-input mt-1 w-full"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. tag the Georgetown depot"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="button" className="admin-btn-quiet" onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4" aria-hidden />
          {file ? "Change photo" : "Add photo"}
        </button>
        {file && (
          <span className="text-xs truncate" style={{ color: "var(--crm-text-muted)" }}>
            {file.name}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          className="min-h-11 rounded-lg px-4 text-sm font-semibold"
          style={{ background: "#EA6A00", color: "#FFFFFF", opacity: saving ? 0.6 : 1 }}
          disabled={saving}
          onClick={() => void save("scheduled")}
        >
          <CalendarClock className="h-4 w-4 inline mr-2" aria-hidden />
          Schedule
        </button>
        <button
          type="button"
          className="admin-btn-quiet"
          disabled={saving}
          onClick={() => void save("draft")}
        >
          Save as draft
        </button>
      </div>
    </div>
  );
}

/* ── One planned post ─────────────────────────────────────────────────── */

function PostCard({
  post,
  onPatch,
  onDelete,
  busy,
}: {
  post: SocialPost;
  onPatch: (values: Partial<SocialPost>) => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [when, setWhen] = useState(toLocalInput(post.scheduled_at));
  const src = useMediaSrc(post.image_path);

  return (
    <article
      className="rounded-xl border p-3"
      style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
    >
      <div className="flex gap-3">
        <Thumb path={post.image_path} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={post.status} />
            <PlatformChips platforms={post.platforms} />
            <span className="text-xs ml-auto shrink-0" style={{ color: "var(--crm-text-muted)" }}>
              {post.status === "posted" && post.posted_at
                ? `Posted ${georgetownLabel(post.posted_at)}`
                : post.scheduled_at
                  ? georgetownLabel(post.scheduled_at)
                  : "No date set"}
            </span>
          </div>
          <p
            className="text-sm mt-2 whitespace-pre-wrap"
            style={{ color: "var(--crm-text)" }}
          >
            {post.caption}
          </p>
          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline break-all"
              style={{ color: "var(--crm-text-muted)" }}
            >
              {post.link_url}
            </a>
          )}
          {post.notes && (
            <p className="text-xs mt-1" style={{ color: "var(--crm-text-muted)" }}>
              Note: {post.notes}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="admin-btn-quiet"
              onClick={() => {
                void navigator.clipboard
                  .writeText(post.caption)
                  .then(() => toast.success("Caption copied."))
                  .catch(() => toast.error("Could not copy the caption."));
              }}
            >
              <Copy className="h-4 w-4" aria-hidden /> Copy caption
            </button>
            {src && (
              <a className="admin-btn-quiet" href={src} target="_blank" rel="noreferrer" download>
                Download photo
              </a>
            )}
            {post.status !== "posted" && (
              <button
                type="button"
                className="admin-btn-quiet"
                disabled={busy}
                onClick={() => onPatch({ status: "posted", posted_at: new Date().toISOString() })}
              >
                <Send className="h-4 w-4" aria-hidden /> Mark as posted
              </button>
            )}
            <button type="button" className="admin-btn-quiet" onClick={() => setOpen((v) => !v)}>
              {open ? "Close" : "Edit"}
            </button>
            <button
              type="button"
              className="admin-btn-quiet"
              disabled={busy}
              onClick={onDelete}
              aria-label="Delete post"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Delete
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-3 border-t pt-3 space-y-3" style={{ borderColor: "var(--crm-border)" }}>
          <label className="block text-sm" style={{ color: "var(--crm-text)" }}>
            Caption
            <textarea
              className="admin-input mt-1 w-full"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm" style={{ color: "var(--crm-text)" }}>
              Date and time
              <input
                type="datetime-local"
                className="admin-input mt-1 w-full"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </label>
            <label className="block text-sm" style={{ color: "var(--crm-text)" }}>
              Status
              <select
                className="admin-select mt-1 w-full"
                value={post.status}
                onChange={(e) =>
                  onPatch({
                    status: e.target.value,
                    posted_at: e.target.value === "posted" ? new Date().toISOString() : null,
                  })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const on = post.platforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  className="min-h-11 rounded-lg px-3 text-sm font-semibold"
                  style={{
                    border: `1px solid ${on ? p.tone : "var(--crm-border)"}`,
                    background: on ? p.tone : "transparent",
                    color: on ? "#FFFFFF" : "var(--crm-text)",
                  }}
                  onClick={() =>
                    onPatch({
                      platforms: on
                        ? post.platforms.filter((x) => x !== p.id)
                        : [...post.platforms, p.id],
                    })
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="min-h-11 rounded-lg px-4 text-sm font-semibold"
            style={{ background: "#EA6A00", color: "#FFFFFF" }}
            disabled={busy}
            onClick={() => {
              onPatch({
                caption: caption.trim(),
                scheduled_at: when ? new Date(when).toISOString() : null,
              });
              setOpen(false);
            }}
          >
            Save changes
          </button>
        </div>
      )}
    </article>
  );
}
