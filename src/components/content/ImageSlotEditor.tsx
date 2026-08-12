import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMediaUrl, MEDIA_BUCKET } from "@/lib/mediaUrl";
import { compressionSummary, processImage } from "@/lib/imageProcess";
import {
  RATIO_TOLERANCE,
  ratioDrift,
  ratioLabel,
  SLOTS_BY_KEY,
  useSiteImageOverrides,
  type SiteImageRow,
} from "@/lib/siteImages";

/**
 * PHOTO EDITING, ON THE PAGE ITSELF.
 *
 * Mounted by the content editor overlay, so it exists only inside a verified
 * staff preview session. Every photo that comes from the named-slot registry
 * (`useSiteImage`) renders with `data-image-slot`, which is all this needs to
 * outline it, list it and open a picker for it.
 *
 * Draft / publish works exactly like the copy editor:
 *   • Save as draft   -> draft_* columns; visible only in preview
 *   • Publish         -> live columns; blocked by the DB trigger unless the
 *                        signed-in staff member has publishing rights
 *   • Discard draft   -> clears the draft, page falls back to what is live
 */

const ORANGE = "#EF7700";
const INK = "#111214";
const PAPER = "#F5F5F5";

/** What the picker will accept from a file chooser or a drag-and-drop. */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"] as const;
export const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,.avif,.gif,image/jpeg,image/png,image/webp,image/avif,image/gif";
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

function prettyBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Returns a plain-English problem, or null when the file is fine to upload. */
export function validateImageFile(file: File): string | null {
  const name = file.name || "That file";
  const type = (file.type || "").toLowerCase();
  if (type && !type.startsWith("image/")) {
    return `${name} isn’t a photo. Please choose a JPG, PNG, WebP, AVIF or GIF image.`;
  }
  if (!type || !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type)) {
    return `${name} is a file type we can’t use here. Please choose a JPG, PNG, WebP, AVIF or GIF image.`;
  }
  if (file.size === 0) {
    return `${name} is empty. Please choose a different photo.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `${name} is ${prettyBytes(file.size)} — too large. Please use a photo under ${prettyBytes(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}

/**
 * Turns "IMG_2043 orange-skip_bin@georgetown.JPG" into
 * "Orange skip bin georgetown" so the description box is never empty.
 * Returns "" when the file name carries no real words (camera codes only).
 */
export function suggestAltFromFileName(fileName: string, slotLabel?: string): string {
  const base = (fileName || "").replace(/\.[^.]+$/, "");
  const words = base
    .replace(/[_\-.@+]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    // Drop camera/export noise: IMG, DSC, screenshots, bare numbers, hashes.
    .filter((w) => !/^(img|dsc|dscn|pxl|photo|image|screenshot|copy|final|edited|v\d+)$/i.test(w))
    .filter((w) => !/^\d+$/.test(w))
    .filter((w) => !/^[0-9a-f]{8,}$/i.test(w));

  const phrase = words.join(" ").replace(/\s+/g, " ").trim();
  if (phrase.length < 3) return slotLabel ? `Photo for ${slotLabel}` : "";
  const suggestion = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  return suggestion.slice(0, 300);
}



const IMAGE_CSS = `
[data-image-slot] {
  outline: 2px dashed rgba(239, 119, 0, 0.7);
  outline-offset: -3px;
  cursor: pointer;
  transition: outline-color 120ms ease;
}
[data-image-slot]:hover {
  outline: 3px solid ${ORANGE};
}
[data-image-slot][data-image-flash="true"] {
  outline: 4px solid ${ORANGE};
}
`;

type Picked = { path: string; w: number | null; h: number | null };

type MediaRow = {
  id: string;
  title: string;
  image_path: string | null;
  image_w: number | null;
  image_h: number | null;
};

/* Small resolved-path preview. */
function Thumb({ path, src, alt, height = 120 }: { path?: string | null; src?: string; alt: string; height?: number }) {
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [state, setState] = useState<"idle" | "loading" | "failed">(src ? "idle" : "idle");
  useEffect(() => {
    let alive = true;
    if (!path) {
      setUrl(src ?? null);
      setState("idle");
      return;
    }
    setUrl(null);
    setState("loading");
    void getMediaUrl(path).then((u) => {
      if (!alive) return;
      if (u) {
        setUrl(u);
        setState("idle");
      } else {
        setUrl(src ?? null);
        setState(src ? "idle" : "failed");
      }
    });
    return () => {
      alive = false;
    };
  }, [path, src]);
  return (
    <div
      style={{
        height,
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
        background: "#E4E4E7",
        display: "grid",
        placeItems: "center",
      }}
    >
      {url ? (
        <img src={url} alt={alt} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ font: "600 11px system-ui, sans-serif", color: "#6B7280" }}>
          {state === "loading" ? "Loading…" : state === "failed" ? "Photo unavailable" : "No photo yet"}
        </span>
      )}
    </div>
  );
}


export function ImageSlotEditor({
  canPublish,
  variant = "floating",
}: {
  canPublish: boolean;
  /** "inline" drops the floating launcher so a parent sheet can host the list. */
  variant?: "floating" | "inline";
}) {
  const qc = useQueryClient();
  const [slots, setSlots] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hover, setHover] = useState<{ label: string; top: number; left: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [altInvalid, setAltInvalid] = useState(false);
  const [suggestedAlt, setSuggestedAlt] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const altRef = useRef<HTMLInputElement | null>(null);


  const { data: rows } = useSiteImageOverrides(true);
  const row: SiteImageRow | undefined = rows?.find((r) => r.slot === activeSlot);
  const def = activeSlot ? SLOTS_BY_KEY[activeSlot] : undefined;
  const hasDraft = !!row?.draft_image_path;

  /* Inject the outline styles for as long as the editor is mounted. */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = IMAGE_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* Collect the photo slots present on this page, in document order. */
  useLayoutEffect(() => {
    const read = () => {
      const found = Array.from(document.querySelectorAll<HTMLElement>("[data-image-slot]"))
        .map((el) => el.getAttribute("data-image-slot") ?? "")
        .filter(Boolean);
      setSlots(Array.from(new Set(found)));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  const open = useCallback(
    (slot: string) => {
      const r = rows?.find((x) => x.slot === slot);
      const d = SLOTS_BY_KEY[slot];
      const path = r?.draft_image_path ?? r?.image_path ?? null;
      setActiveSlot(slot);
      setNote(null);
      setConfirmPublish(false);
      setDragOver(false);
      setHover(null);
      setPicked(
        path
          ? {
              path,
              w: (r?.draft_image_path ? r?.draft_image_w : r?.image_w) ?? null,
              h: (r?.draft_image_path ? r?.draft_image_h : r?.image_h) ?? null,
            }
          : null,
      );
      setAlt((r?.draft_image_path ? r?.draft_alt : r?.alt) ?? d?.defaultAlt ?? "");
    },
    [rows],
  );

  /* Click a photo on the page to edit it. Capture phase so a photo inside a
     link or a slider control still opens the picker instead of navigating. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("[data-content-ui]")) return;
      const node = target.closest<HTMLElement>("[data-image-slot]");
      if (!node) return;
      const slot = node.getAttribute("data-image-slot");
      if (!slot) return;
      e.preventDefault();
      e.stopPropagation();
      open(slot);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [open]);

  /* A plain "Click to change photo" tag that follows whichever photo is hovered.
     Images cannot host pseudo-elements, so the tag is a floating element. */
  useEffect(() => {
    if (activeSlot) {
      setHover(null);
      return;
    }
    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const node = target?.closest<HTMLElement>("[data-image-slot]");
      if (!node || target?.closest("[data-content-ui]")) {
        setHover(null);
        return;
      }
      const slot = node.getAttribute("data-image-slot") ?? "";
      const r = node.getBoundingClientRect();
      setHover({
        label: SLOTS_BY_KEY[slot]?.label ?? "this photo",
        top: Math.max(8, r.top + 8),
        left: Math.max(8, r.left + 8),
      });
    };
    const clear = () => setHover(null);
    document.addEventListener("mousemove", onMove, true);
    window.addEventListener("scroll", clear, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("scroll", clear, true);
    };
  }, [activeSlot]);

  const { data: library = [] } = useQuery({
    queryKey: ["content-editor-media-library"],
    enabled: activeSlot != null,
    queryFn: async (): Promise<MediaRow[]> => {
      const { data, error } = await supabase
        .from("media_posts")
        .select("id, title, image_path, image_w, image_h")
        .not("image_path", "is", null)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as MediaRow[];
    },
  });

  useEffect(() => {
    setConfirmPublish(false);
  }, [picked?.path, alt]);

  const drift = def && picked?.w && picked?.h ? ratioDrift(def.ratio, picked.w, picked.h) : 0;

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["site_images"] });
  };

  async function upload(file: File) {
    if (!activeSlot) return;
    const problem = validateImageFile(file);
    if (problem) {
      setNote({ tone: "error", text: problem });
      return;
    }
    try {
      setBusy("Optimising photo…");
      const processed = await processImage(file);
      const savings = compressionSummary(processed);
      setBusy(savings ? `Uploading… ${savings}` : "Uploading…");
      const path = `site-images/${activeSlot}/${crypto.randomUUID()}.${processed.ext}`;
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, processed.blob, { contentType: processed.mime, upsert: false });
      if (error) throw error;
      await supabase.from("media_posts").insert({
        kind: "gallery",
        title: `${def?.label ?? activeSlot} — ${file.name.replace(/\.[^.]+$/, "")}`.slice(0, 120),
        caption: "",
        image_path: path,
        image_w: processed.width,
        image_h: processed.height,
        published: false,
        sort_order: 0,
      });
      setPicked({ path, w: processed.width, h: processed.height });
      const suggestion = suggestAltFromFileName(file.name, def?.label);
      setSuggestedAlt(suggestion);
      let filled = false;
      if (suggestion && alt.trim().length === 0) {
        setAlt(suggestion);
        setAltInvalid(false);
        filled = true;
      }
      setNote({
        tone: "ok",
        text: [
          savings ? `Photo uploaded and optimised (${savings}).` : "Photo uploaded.",
          filled ? "We suggested a description from the file name — edit it if needed, then save." : "Check the description, then save.",
        ].join(" "),
      });

    } catch (err) {
      setNote({ tone: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  }

  async function write(mode: "draft" | "publish") {
    if (!activeSlot) return;
    if (!picked) {
      // Reverting to the photo that ships with the page: clear the override.
      setBusy(mode === "draft" ? "Saving draft…" : "Publishing…");
      const clear =
        mode === "draft"
          ? { slot: activeSlot, draft_image_path: null, draft_image_w: null, draft_image_h: null, draft_alt: null }
          : {
              slot: activeSlot,
              image_path: null,
              image_w: null,
              image_h: null,
              alt: null,
              draft_image_path: null,
              draft_image_w: null,
              draft_image_h: null,
              draft_alt: null,
            };
      const { error: clearErr } = await supabase.from("site_images").upsert(clear as never, { onConflict: "slot" });
      setBusy(null);
      if (clearErr) {
        setNote({ tone: "error", text: clearErr.message });
        return;
      }
      await refresh();
      setConfirmPublish(false);
      if (mode === "publish") setActiveSlot(null);
      else setNote({ tone: "ok", text: "Saved as a draft — back to the original photo." });
      return;
    }
    // Publishing always needs a description typed into the box — no silent
    // fallbacks. Drafts may still fall back to the slot's existing text or the
    // shipped default so work in progress is never lost.
    const typed = alt.trim();
    const fallback = (row?.alt?.trim() || def?.defaultAlt?.trim() || "").slice(0, 300);
    if (mode === "publish" && typed.length === 0) {
      setAltInvalid(true);
      if (fallback) setAlt(fallback);
      setNote({
        tone: "error",
        text: fallback
          ? "This photo cannot be published with an empty description. We’ve filled in the previous one — check it reads correctly, then publish."
          : "This photo cannot be published yet: type a short description of it first (screen readers read it aloud).",
      });
      setConfirmPublish(false);
      altRef.current?.focus();
      altRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const effectiveAlt = (typed || fallback).slice(0, 300);
    if (effectiveAlt.length === 0) {
      setAltInvalid(true);
      setNote({
        tone: "error",
        text: "Type a short description of this photo first (screen readers read it aloud).",
      });
      altRef.current?.focus();
      altRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setAltInvalid(false);
    if (alt.trim() !== effectiveAlt) setAlt(effectiveAlt);

    setBusy(mode === "draft" ? "Saving draft…" : "Publishing…");
    const payload: Record<string, string | number | null> =
      mode === "draft"
        ? {
            slot: activeSlot,
            draft_image_path: picked.path,
            draft_image_w: picked.w,
            draft_image_h: picked.h,
            draft_alt: effectiveAlt,
          }
        : {
            slot: activeSlot,
            image_path: picked.path,
            image_w: picked.w,
            image_h: picked.h,
            alt: effectiveAlt,
            draft_image_path: null,
            draft_image_w: null,
            draft_image_h: null,
            draft_alt: null,
          };
    const { error } = await supabase.from("site_images").upsert(payload as never, { onConflict: "slot" });
    setBusy(null);
    if (error) {
      setConfirmPublish(false);
      setNote({
        tone: "error",
        text:
          (mode === "publish" ? "This photo could not be published. " : "This draft could not be saved. ") +
          error.message,
      });
      return;
    }

    await refresh();
    if (mode === "publish") setActiveSlot(null);
    else setNote({ tone: "ok", text: "Saved as a draft. Only you can see it until it is published." });
  }

  async function discard() {
    if (!activeSlot) return;
    setBusy("Discarding…");
    const { error } = await supabase
      .from("site_images")
      .update({
        draft_image_path: null,
        draft_image_w: null,
        draft_image_h: null,
        draft_alt: null,
      })
      .eq("slot", activeSlot);
    setBusy(null);
    if (error) {
      setNote({ tone: "error", text: error.message });
      return;
    }
    await refresh();
    setActiveSlot(null);
  }

  const draftCount = useMemo(
    () => slots.filter((s) => rows?.some((r) => r.slot === s && r.draft_image_path)).length,
    [slots, rows],
  );

  if (slots.length === 0) return null;

  const photoList = (
    <>
      {slots.map((s) => {
              const d = SLOTS_BY_KEY[s];
              const staged = rows?.some((r) => r.slot === s && r.draft_image_path);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    const node = document.querySelector<HTMLElement>(`[data-image-slot="${s}"]`);
                    node?.scrollIntoView({ behavior: "smooth", block: "center" });
                    node?.setAttribute("data-image-flash", "true");
                    window.setTimeout(() => node?.removeAttribute("data-image-flash"), 1200);
                    open(s);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    marginBottom: 4,
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "#fff",
                    color: INK,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  {d?.label ?? s}
                  {staged && (
                    <span style={{ display: "block", font: "700 10px system-ui", color: "#8A4B00" }}>
                      Draft waiting
                    </span>
                  )}
                </button>
              );
      })}
    </>
  );

  const picker = (
    <>
      {hover && !activeSlot && (
        <div
          data-content-ui
          aria-hidden="true"
          style={{
            position: "fixed",
            top: hover.top,
            left: hover.left,
            zIndex: 2147483000,
            pointerEvents: "none",
            padding: "6px 10px",
            borderRadius: 999,
            background: ORANGE,
            color: "#1A1A1A",
            font: "800 12px/1.2 system-ui, sans-serif",
            boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          }}
        >
          Click to change: {hover.label}
        </div>
      )}

      {/* Picker */}
      {activeSlot && def && (
        <div
          data-content-ui
          role="dialog"
          aria-modal="true"
          aria-label={`Change ${def.label}`}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483100,
            background: "rgba(0,0,0,0.6)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            font: "500 14px/1.5 system-ui, sans-serif",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveSlot(null);
          }}
        >
          <div
            style={{
              width: "min(680px, 100%)",
              maxHeight: "88vh",
              overflowY: "auto",
              background: PAPER,
              color: INK,
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <h2 style={{ font: "800 17px/1.2 system-ui", margin: 0 }}>Change “{def.label}”</h2>
                <p style={{ margin: "4px 0 0", font: "500 12px system-ui", color: "#4B5563" }}>
                  Recommended shape {ratioLabel(def.ratio)}. Photos are resized automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlot(null)}
                aria-label="Close"
                style={{ minWidth: 44, minHeight: 44, border: "none", background: "transparent", cursor: "pointer", font: "700 18px system-ui" }}
              >
                ✕
              </button>
            </div>

            <Thumb path={picked?.path} src={picked ? undefined : def.defaultSrc} alt="" height={180} />

            {drift > RATIO_TOLERANCE && (
              <p style={{ margin: "8px 0 0", font: "700 12px system-ui", color: "#8A4B00" }}>
                This photo is a different shape to the space it fills, so parts of it will be cropped.
              </p>
            )}

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = e.dataTransfer.files;
                if (!files || files.length === 0) {
                  setNote({ tone: "error", text: "We couldn’t read that. Please drop a single photo file." });
                  return;
                }
                if (files.length > 1) {
                  setNote({ tone: "error", text: "Please drop one photo at a time." });
                  return;
                }
                void upload(files[0]);
              }}
              style={{
                margin: "12px 0",
                padding: 12,
                borderRadius: 12,
                border: `2px dashed ${dragOver ? ORANGE : "rgba(0,0,0,0.18)"}`,
                background: dragOver ? "rgba(239,119,0,0.08)" : "#fff",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT_ATTR}
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                  e.target.value = "";
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    minHeight: 44,
                    padding: "0 16px",
                    borderRadius: 10,
                    border: "none",
                    background: INK,
                    color: "#fff",
                    font: "700 13px system-ui",
                    cursor: "pointer",
                  }}
                >
                  {picked ? "Replace with a new photo" : "Upload a photo"}
                </button>
                {picked && (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => {
                      setPicked(null);
                      setAlt(def.defaultAlt);
                      setNote({ tone: "ok", text: "Back to the original photo. Save to keep this." });
                    }}
                    style={{
                      minHeight: 44,
                      padding: "0 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.2)",
                      background: "#fff",
                      color: INK,
                      font: "700 13px system-ui",
                      cursor: "pointer",
                    }}
                  >
                    Use the original photo
                  </button>
                )}
                {busy && <span style={{ font: "600 12px system-ui", color: "#4B5563" }}>{busy}</span>}
              </div>
              <p style={{ margin: "8px 0 0", font: "500 12px system-ui", color: "#4B5563" }}>
                You can also drag a photo from your computer straight onto this box. JPG, PNG, WebP, AVIF or GIF, up to{" "}
                {prettyBytes(MAX_UPLOAD_BYTES)}.
              </p>
            </div>

            <label style={{ display: "block", font: "700 12px system-ui", marginBottom: 4 }} htmlFor="cevons-img-alt">
              Describe this photo <span style={{ color: "#7F1D1D" }}>(required to publish)</span>
            </label>
            <input
              id="cevons-img-alt"
              ref={altRef}
              value={alt}
              required
              aria-invalid={altInvalid}
              aria-describedby="cevons-img-alt-help"
              placeholder="e.g. Orange CEVONS skip bin on a Georgetown worksite"
              onChange={(e) => {
                setAlt(e.target.value);
                if (altInvalid) setAltInvalid(false);
              }}
              style={{
                width: "100%",
                minHeight: 44,
                padding: "0 12px",
                borderRadius: 10,
                border: altInvalid ? "2px solid #7F1D1D" : "1px solid rgba(0,0,0,0.2)",

                background: "#fff",
                color: INK,
                font: "500 14px system-ui",
              }}
            />
            {suggestedAlt && alt.trim() !== suggestedAlt && (
              <button
                type="button"
                onClick={() => {
                  setAlt(suggestedAlt);
                  setAltInvalid(false);
                }}
                style={{
                  marginTop: 8,
                  minHeight: 36,
                  padding: "0 12px",
                  borderRadius: 999,
                  border: `1px solid ${ORANGE}`,
                  background: "#FFF4E5",
                  color: "#7A3E00",
                  font: "700 12px system-ui",
                  cursor: "pointer",
                }}
              >
                Use suggested: “{suggestedAlt}”
              </button>
            )}
            <p id="cevons-img-alt-help" style={{ margin: "6px 0 0", font: "500 12px system-ui", color: altMissing ? "#7F1D1D" : "#4B5563" }}>
              {altMissing
                ? "Add a description before publishing — screen readers read it aloud."
                : "Screen readers read this aloud, so say what is actually in the photo."}
            </p>



            {library.length > 0 && (
              <>
                <p style={{ font: "800 11px system-ui", letterSpacing: "0.08em", textTransform: "uppercase", margin: "16px 0 8px" }}>
                  Or pick one already uploaded
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                  {library.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPicked({ path: m.image_path!, w: m.image_w, h: m.image_h })}
                      title={m.title}
                      style={{
                        padding: 0,
                        border: picked?.path === m.image_path ? `3px solid ${ORANGE}` : "1px solid rgba(0,0,0,0.15)",
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <Thumb path={m.image_path} alt={m.title} height={74} />
                    </button>
                  ))}
                </div>
              </>
            )}

            {note && (
              <p
                role={note.tone === "error" ? "alert" : "status"}
                style={{
                  margin: "12px 0 0",
                  padding: note.tone === "error" ? "8px 10px" : 0,
                  borderRadius: 8,
                  background: note.tone === "error" ? "#FEE2E2" : "transparent",
                  font: "700 12px system-ui",
                  color: note.tone === "ok" ? "#14532D" : "#7F1D1D",
                }}
              >
                {note.text}
              </p>
            )}


            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => void write("draft")}
                style={{
                  minHeight: 44,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "none",
                  background: ORANGE,
                  color: "#1A1A1A",
                  font: "800 13px system-ui",
                  cursor: "pointer",
                }}
              >
                Save as draft
              </button>
              {canPublish ? (
                confirmPublish ? (
                  <span
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "#FFF4E5",
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  >
                    <span style={{ font: "700 12px system-ui", color: "#7A3E00" }}>
                      Publish now? Every visitor will see this photo straight away.
                    </span>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => void write("publish")}
                      style={{
                        minHeight: 44,
                        padding: "0 16px",
                        borderRadius: 10,
                        border: "none",
                        background: "#14532D",
                        color: "#fff",
                        font: "800 13px system-ui",
                        cursor: "pointer",
                      }}
                    >
                      Yes, publish it
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => setConfirmPublish(false)}
                      style={{
                        minHeight: 44,
                        padding: "0 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.2)",
                        background: "#fff",
                        color: INK,
                        font: "700 13px system-ui",
                        cursor: "pointer",
                      }}
                    >
                      Not yet
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => {
                      setNote(null);
                      setConfirmPublish(true);
                    }}
                    style={{
                      minHeight: 44,
                      padding: "0 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "#14532D",
                      color: "#fff",
                      font: "800 13px system-ui",
                      cursor: "pointer",
                    }}
                  >
                    Publish this photo
                  </button>
                )
              ) : (
                <span style={{ alignSelf: "center", font: "600 12px system-ui", color: "#4B5563" }}>
                  Your role can save drafts but not publish.
                </span>
              )}
              {hasDraft && (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => void discard()}
                  style={{
                    minHeight: 44,
                    padding: "0 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.2)",
                    background: "#fff",
                    color: INK,
                    font: "700 13px system-ui",
                    cursor: "pointer",
                  }}
                >
                  Discard draft
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  /* Inline: the parent sheet already provides the surface and the heading. */
  if (variant === "inline") {
    return (
      <>
        {photoList}
        {picker}
      </>
    );
  }

  return (
    <>
      {/* Floating launcher + list of the photos on this page */}
      <div
        data-content-ui
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 2147483000,
          font: "500 13px/1.4 system-ui, sans-serif",
        }}
      >
        {panelOpen && (
          <div
            style={{
              width: 260,
              maxHeight: "50vh",
              overflowY: "auto",
              marginBottom: 8,
              background: PAPER,
              color: INK,
              borderRadius: 12,
              boxShadow: "0 18px 48px rgba(0,0,0,0.32)",
              padding: 12,
            }}
          >
            <p style={{ font: "800 11px/1.4 system-ui", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
              Photos on this page
            </p>
            {photoList}
          </div>
        )}
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          style={{
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 999,
            border: "none",
            background: ORANGE,
            color: "#1A1A1A",
            font: "800 13px system-ui, sans-serif",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
          }}
        >
          {panelOpen ? "Hide photos" : `Photos (${slots.length}${draftCount ? ` · ${draftCount} draft` : ""})`}
        </button>
      </div>
      {picker}
    </>
  );
}

