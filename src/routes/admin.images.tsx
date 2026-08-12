import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ImageIcon, Loader2, RotateCcw, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { canPublish, useAdminIdentity } from "@/lib/adminAuth";
import { getMediaUrl, MEDIA_BUCKET } from "@/lib/mediaUrl";
import { processImage } from "@/lib/imageProcess";
import { georgetownLabel, GEORGETOWN_LABEL } from "@/lib/georgetown";
import {
  RATIO_TOLERANCE,
  SITE_IMAGE_SLOTS,
  ratioDrift,
  ratioLabel,
  slotsByPage,
  type SiteImageRow,
  type SlotDef,
} from "@/lib/siteImages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/images")({
  head: () => ({
    meta: [
      { title: "Site images | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SiteImagesPage,
});

type MediaRow = {
  id: string;
  title: string;
  image_path: string | null;
  image_w: number | null;
  image_h: number | null;
};

/* ------------------------------------------------------------------ */

function useOverrides() {
  return useQuery({
    queryKey: ["admin-site-images"],
    queryFn: async (): Promise<SiteImageRow[]> => {
      const { data, error } = await supabase
        .from("site_images")
        .select("slot, image_path, image_w, image_h, alt, updated_at, updated_by");
      if (error) throw error;
      return (data ?? []) as SiteImageRow[];
    },
  });
}

/** Preview that resolves a storage path, or renders a bundled default URL. */
function Preview({ path, src, alt }: { path?: string | null; src?: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!path) {
      setUrl(src ?? null);
      setFailed(false);
      return;
    }
    setUrl(null);
    setFailed(false);
    void getMediaUrl(path).then((u) => {
      if (!alive) return;
      if (u) setUrl(u);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, [path, src]);

  return (
    <div
      className="h-24 w-32 shrink-0 rounded-lg overflow-hidden grid place-items-center border"
      style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)" }}
    >
      {url ? (
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
/* Replace dialog                                                      */
/* ------------------------------------------------------------------ */

function ReplaceDialog({
  slot,
  current,
  onClose,
  onSaved,
}: {
  slot: SlotDef;
  current: SiteImageRow | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [alt, setAlt] = useState(current?.alt ?? slot.defaultAlt);
  const [picked, setPicked] = useState<{ path: string; w: number | null; h: number | null } | null>(
    current?.image_path ? { path: current.image_path, w: current.image_w, h: current.image_h } : null,
  );
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: library = [], isLoading, isError } = useQuery({
    queryKey: ["admin-site-images-library"],
    queryFn: async (): Promise<MediaRow[]> => {
      const { data, error } = await supabase
        .from("media_posts")
        .select("id, title, image_path, image_w, image_h")
        .not("image_path", "is", null)
        .order("created_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as MediaRow[];
    },
  });

  const drift =
    picked?.w && picked?.h ? ratioDrift(slot.ratio, picked.w, picked.h) : 0;
  const altBlank = alt.trim().length === 0;

  async function upload(file: File) {
    try {
      setBusy("Optimising photo…");
      const processed = await processImage(file);
      setBusy("Uploading…");
      const path = `site-images/${slot.key}/${crypto.randomUUID()}.${processed.ext}`;
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, processed.blob, { contentType: processed.mime, upsert: false });
      if (error) throw error;
      // Register it in the media library so it can be reused elsewhere.
      await supabase.from("media_posts").insert({
        kind: "gallery",
        title: `${slot.label} — ${file.name.replace(/\.[^.]+$/, "")}`.slice(0, 120),
        caption: "",
        image_path: path,
        image_w: processed.width,
        image_h: processed.height,
        published: false,
        sort_order: 0,
      });
      setPicked({ path, w: processed.width, h: processed.height });
      toast.success("Photo uploaded — check the description, then save.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!picked) {
      toast.error("Choose or upload a photo first.");
      return;
    }
    if (altBlank) {
      toast.error("Describe the photo — the description is required for screen readers.");
      return;
    }
    setBusy("Saving…");
    const { error } = await supabase.from("site_images").upsert(
      {
        slot: slot.key,
        image_path: picked.path,
        image_w: picked.w,
        image_h: picked.h,
        alt: alt.trim(),
      },
      { onConflict: "slot" },
    );
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Photo replaced on the live site.");
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Replace ${slot.label}`}
    >
      <div
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border p-5"
        style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--crm-text)" }}>
              Replace “{slot.label}”
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--crm-text-muted)" }}>
              Recommended shape {ratioLabel(slot.ratio)}. Photos are resized automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 grid place-items-center rounded-lg"
            style={{ color: "var(--crm-text-muted)" }}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Preview path={picked?.path} src={picked ? undefined : slot.defaultSrc} alt="" />
          <div className="flex-1 min-w-[180px]">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              className="min-h-11"
              onClick={() => fileRef.current?.click()}
              disabled={!!busy}
            >
              <Upload className="size-4 mr-2" />
              Upload a photo
            </Button>
            {busy && (
              <p className="text-xs mt-2" style={{ color: "var(--crm-text-muted)" }}>
                {busy}
              </p>
            )}
          </div>
        </div>

        {drift > RATIO_TOLERANCE && (
          <div
            className="flex items-start gap-2 rounded-lg border p-3 mb-4 text-sm"
            style={{ borderColor: "#EF7700", background: "#EF7700", color: "#1A1A1A" }}
          >
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span>
              This photo is a different shape to the recommended {ratioLabel(slot.ratio)}. It will
              still be used — the sides or the top and bottom will be cropped to fit. You can save
              anyway.
            </span>
          </div>
        )}

        <div className="mb-4">
          <Label htmlFor="site-image-alt" className="text-sm font-semibold">
            Photo description <span aria-hidden>*</span>{" "}
            <span className="font-normal" style={{ color: "var(--crm-text-muted)" }}>
              (required — read aloud by screen readers)
            </span>
          </Label>
          <Input
            id="site-image-alt"
            value={alt}
            required
            aria-invalid={altBlank}
            onChange={(e) => setAlt(e.target.value)}
            className="mt-1 min-h-11"
            placeholder="e.g. CEVONS crew loading a skip bin in Georgetown"
          />
          {altBlank && (
            <p className="text-xs mt-1" style={{ color: "var(--crm-danger, #B3261E)" }}>
              A description is required. An image on a public page without one is an accessibility
              defect.
            </p>
          )}
        </div>

        <div className="mb-2">
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--crm-text)" }}>
            Or pick from the media library
          </p>
          {isLoading ? (
            <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
              Loading photos…
            </p>
          ) : isError ? (
            <p className="text-sm" style={{ color: "var(--crm-danger, #B3261E)" }}>
              The media library could not be loaded. Try again.
            </p>
          ) : library.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
              No photos in the library yet — upload one above.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {library.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPicked({ path: m.image_path!, w: m.image_w, h: m.image_h })}
                  className="rounded-lg overflow-hidden border-2 min-h-11"
                  style={{
                    borderColor:
                      picked?.path === m.image_path ? "#EF7700" : "var(--crm-border)",
                  }}
                  aria-pressed={picked?.path === m.image_path}
                >
                  <Preview path={m.image_path} alt={m.title} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" className="min-h-11" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="min-h-11"
            onClick={() => void save()}
            disabled={!!busy || altBlank || !picked}
          >
            Save photo
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SiteImagesPage() {
  const qc = useQueryClient();
  const identity = useAdminIdentity();
  const mayPublish = canPublish(identity.roles);
  const { data: rows = [], isLoading, isError, refetch } = useOverrides();
  const [editing, setEditing] = useState<SlotDef | null>(null);
  const [search, setSearch] = useState("");

  const byslot = useMemo(() => {
    const m = new Map<string, SiteImageRow>();
    rows.forEach((r) => m.set(r.slot, r));
    return m;
  }, [rows]);

  const revert = useMutation({
    mutationFn: async (slot: string) => {
      const { error } = await supabase.from("site_images").delete().eq("slot", slot);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reverted to the original photo.");
      void qc.invalidateQueries({ queryKey: ["admin-site-images"] });
      void qc.invalidateQueries({ queryKey: ["site_images"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not revert"),
  });

  const groups = slotsByPage()
    .map((g) => ({
      ...g,
      slots: g.slots.filter(
        (s) =>
          !search.trim() ||
          `${s.label} ${s.page} ${s.key}`.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    }))
    .filter((g) => g.slots.length > 0);

  return (
    <CrmPage>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>
          Site images
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
          Every replaceable photo on the public website. Replacing one swaps the picture only — the
          layout, size and cropping stay exactly as designed. {SITE_IMAGE_SLOTS.length} slots.
          Times are {GEORGETOWN_LABEL}.
        </p>
      </div>

      {!mayPublish && (
        <div
          className="rounded-lg border p-3 mb-4 text-sm"
          style={{ borderColor: "var(--crm-border)", color: "var(--crm-text-muted)" }}
        >
          Your role can view these photos but cannot change what the public site shows.
        </div>
      )}

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search slots…"
        className="mb-5 max-w-sm min-h-11"
        aria-label="Search image slots"
      />

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
          Loading site images…
        </p>
      ) : isError ? (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--crm-border)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--crm-text)" }}>
            The image list could not be loaded.
          </p>
          <Button className="min-h-11" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : groups.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
          No slots match “{search}”.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.page}>
              <h2
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--crm-text-muted)" }}
              >
                {g.page}
              </h2>
              <div className="space-y-3">
                {g.slots.map((s) => {
                  const row = byslot.get(s.key);
                  return (
                    <div
                      key={s.key}
                      className="rounded-xl border p-3 flex flex-col min-[560px]:flex-row min-[560px]:items-center gap-3"
                      style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
                    >
                      <Preview
                        path={row?.image_path}
                        src={row ? undefined : s.defaultSrc}
                        alt={row?.alt ?? s.defaultAlt}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold" style={{ color: "var(--crm-text)" }}>
                            {s.label}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5"
                            style={
                              row
                                ? { background: "#2DA339", color: "#1A1A1A" }
                                : {
                                    background: "var(--crm-surface-muted)",
                                    color: "var(--crm-text-muted)",
                                  }
                            }
                          >
                            {row ? "Replaced" : "Original"}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "var(--crm-text-muted)" }}>
                          Recommended {ratioLabel(s.ratio)} · {s.usedIn}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--crm-text-muted)" }}>
                          {row
                            ? `Replaced ${georgetownLabel(row.updated_at)} · “${row.alt}”`
                            : `“${s.defaultAlt}”`}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          type="button"
                          className="min-h-11"
                          disabled={!mayPublish}
                          onClick={() => setEditing(s)}
                        >
                          Replace
                        </Button>
                        {row && (
                          <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            disabled={!mayPublish || revert.isPending}
                            onClick={() => revert.mutate(s.key)}
                          >
                            <RotateCcw className="size-4 mr-2" />
                            Revert
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <ReplaceDialog
          slot={editing}
          current={byslot.get(editing.key)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void qc.invalidateQueries({ queryKey: ["admin-site-images"] });
            void qc.invalidateQueries({ queryKey: ["site_images"] });
          }}
        />
      )}
    </CrmPage>
  );
}
