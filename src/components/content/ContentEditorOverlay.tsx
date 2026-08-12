import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  discardContentDraft,
  publishContentString,
  publishPageDrafts,
  saveContentDraft,
  type ContentMeta,
  type SavedString,
} from "@/lib/content.functions";
import { ImageSlotEditor } from "@/components/content/ImageSlotEditor";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SLOTS_BY_KEY, useSiteImageOverrides } from "@/lib/siteImages";


/**
 * On-page editing overlay. Rendered ONLY inside a verified staff preview
 * session (`ContentProvider` mounts it when `preview === true`), so nothing
 * here can ever appear on the public site, and every style it injects is
 * removed when it unmounts.
 *
 * What it gives a non-technical editor:
 *   • persistent outlines around everything that can be edited, each with a
 *     small corner label taken from the existing section names;
 *   • a "Sections on this page" panel that scrolls to and highlights a section;
 *   • an editor popover anchored to the thing being edited;
 *   • a top bar explaining that this is a draft, with Publish all / Exit;
 *   • a first-run help card, reopenable from the "?" button.
 *
 * Writes go through server functions running as the signed-in staff user, so
 * RLS and the publish-guard trigger are the real boundary.
 */

type Props = {
  meta: Record<string, ContentMeta>;
  canPublish: boolean;
  /** Push a saved value back into the live page without a reload. */
  onSaved: (row: SavedString) => void;
};

const ORANGE = "#EF7700";
const INK = "#111214";
const PAPER = "#F5F5F5";
const BAR_HEIGHT = 44;
const HELP_KEY = "cevons.contentEditor.helpDismissed";

const OVERLAY_CSS = `
[data-content-key] {
  position: relative;
  outline: 1px dashed rgba(239, 119, 0, 0.55);
  outline-offset: 3px;
  border-radius: 2px;
  cursor: text;
  transition: outline-color 120ms ease, background-color 120ms ease;
}
[data-content-key][data-content-section]::after {
  content: attr(data-content-section);
  position: absolute;
  top: -9px;
  left: 0;
  z-index: 5;
  padding: 0 5px;
  border-radius: 4px;
  background: ${ORANGE};
  color: #1A1A1A;
  font: 700 9px/14px system-ui, sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0.75;
}
[data-content-key]:hover {
  outline: 2px solid ${ORANGE};
  background-color: rgba(239, 119, 0, 0.12);
}
[data-content-key]:hover::after { opacity: 1; }
[data-content-key][data-content-active="true"],
[data-content-key][data-content-flash="true"] {
  outline: 3px solid ${ORANGE};
  background-color: rgba(239, 119, 0, 0.18);
}
[data-content-key][data-content-flash="true"]::after { opacity: 1; }
`;

type SectionEntry = { section: string; key: string };

/** True on phone-sized screens, where the overlay becomes one bottom sheet. */
function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const read = () => setNarrow(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return narrow;
}

/** "trust-bar" -> "Trust bar". Derived from the section names already stored. */
function prettySection(raw: string): string {
  const t = raw.replace(/[-_]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function ContentEditorOverlay({ meta, canPublish, onSaved }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetTab, setSheetTab] = useState<"sections" | "photos">("sections");
  const [helpOpen, setHelpOpen] = useState(false);
  const [sections, setSections] = useState<SectionEntry[]>([]);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dirtyRef = useRef(false);
  /** Text that was in the box when this key was opened — used as the "unchanged"
   *  baseline for copy that has no saved value yet (published_value NULL). */
  const openedValueRef = useRef("");

  const saveDraft = useServerFn(saveContentDraft);
  const publish = useServerFn(publishContentString);
  const publishAll = useServerFn(publishPageDrafts);
  const discard = useServerFn(discardContentDraft);

  const narrow = useNarrow();
  const active = activeKey ? meta[activeKey] : undefined;
  const label = active?.label ?? activeKey ?? "";
  const maxLength = active?.maxLength ?? null;
  const remaining = maxLength != null ? maxLength - value.length : null;
  const tooLong = maxLength != null && value.length > maxLength;
  const baseline = active?.draft ?? active?.published ?? openedValueRef.current;
  const dirty = value !== baseline;
  dirtyRef.current = dirty;

  /* The editable "page" these keys belong to. Most pages are a single leading
     segment ("home.hero.title"), the 22 service detail pages are two
     ("service.septic-services.hero.title"). */
  const page = useMemo(() => {
    const first = Object.keys(meta)[0] ?? "";
    const parts = first.split(".");
    return parts[0] === "service" ? parts.slice(0, 2).join(".") : (parts[0] ?? "");
  }, [meta]);

  const draftCount = useMemo(
    () => Object.values(meta).filter((m) => m.draft != null && m.draft !== m.published).length,
    [meta],
  );

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 4200);
  };

  /* Tag each editable node with its friendly section name and collect the
     sections in document order for the picker panel. */
  useLayoutEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-content-key]"));
    const seen = new Set<string>();
    const list: SectionEntry[] = [];
    for (const el of nodes) {
      const key = el.getAttribute("data-content-key");
      if (!key) continue;
      const m = meta[key];
      const section = prettySection(m?.section ?? "Content");
      el.setAttribute("data-content-section", section);
      if (!seen.has(section)) {
        seen.add(section);
        list.push({ section, key });
      }
    }
    setSections(list);
  }, [meta]);

  /* Offset the page so the fixed edit bar never covers the site header. The
     bar wraps onto several lines on a phone, so the offset is measured. */
  useEffect(() => {
    const prev = document.body.style.paddingTop;
    const apply = () => {
      const h = barRef.current?.offsetHeight ?? BAR_HEIGHT;
      document.body.style.paddingTop = `${h}px`;
      document.documentElement.style.scrollPaddingTop = `${h + 12}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    if (barRef.current) ro.observe(barRef.current);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      document.documentElement.style.scrollPaddingTop = "";
      document.body.style.paddingTop = prev;
      document
        .querySelectorAll("[data-content-section]")
        .forEach((n) => n.removeAttribute("data-content-section"));
    };
  }, []);

  /* First-run help. */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(HELP_KEY) !== "1") setHelpOpen(true);
    } catch {
      /* private mode — just skip the card */
    }
  }, []);

  const dismissHelp = () => {
    setHelpOpen(false);
    try {
      window.localStorage.setItem(HELP_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const closeEditor = useCallback((confirmIfDirty: boolean) => {
    if (confirmIfDirty && dirtyRef.current) {
      const ok = window.confirm("You have changes that are not saved yet. Close without saving?");
      if (!ok) return;
    }
    setActiveKey(null);
    setStatus(null);
  }, []);

  const openKey = useCallback(
    (key: string, el?: HTMLElement | null) => {
      const m = meta[key];
      // When nothing has been saved for this key yet, the box must still show
      // the copy currently on the page rather than an empty field.
      const node =
        el ?? document.querySelector<HTMLElement>(`[data-content-key="${CSS.escape(key)}"]`);
      const onPage = (node?.textContent ?? "").trim();
      const next = m?.draft ?? m?.published ?? onPage;
      openedValueRef.current = next;
      setActiveKey(key);
      setValue(next);
      setStatus(null);
      setPanelOpen(false);
    },
    [meta],
  );

  // Selecting a piece of copy on the page.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-content-ui]")) return;
      const el = target?.closest?.("[data-content-key]") as HTMLElement | null;
      if (!el) return;
      const key = el.getAttribute("data-content-key");
      if (!key) return;
      // Editing beats navigating: a wrapped label inside a link must not
      // follow the link while the editor is open.
      e.preventDefault();
      e.stopPropagation();
      if (dirtyRef.current && key !== activeKey) {
        if (!window.confirm("You have changes that are not saved yet. Discard them?")) return;
      }
      openKey(key, el);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [openKey, activeKey]);

  // Clicking anywhere that is not editable closes the editor.
  useEffect(() => {
    if (!activeKey) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-content-ui]")) return;
      if (target?.closest?.("[data-content-key]")) return;
      closeEditor(true);
    };
    document.addEventListener("mousedown", onDown, true);
    return () => document.removeEventListener("mousedown", onDown, true);
  }, [activeKey, closeEditor]);

  // Mark + anchor the selected element.
  useEffect(() => {
    document
      .querySelectorAll("[data-content-active]")
      .forEach((n) => n.removeAttribute("data-content-active"));
    if (!activeKey) {
      setAnchor(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-content-key="${CSS.escape(activeKey)}"]`);
    el?.setAttribute("data-content-active", "true");
    el?.scrollIntoView({ block: "center", behavior: "smooth" });

    const place = () => {
      const node = document.querySelector<HTMLElement>(`[data-content-key="${CSS.escape(activeKey)}"]`);
      if (!node) return;
      const r = node.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 24);
      const left = Math.min(Math.max(12, r.left), Math.max(12, window.innerWidth - width - 12));
      const below = r.bottom + 12;
      const top = below + 260 > window.innerHeight ? Math.max(BAR_HEIGHT + 12, r.top - 272) : below;
      setAnchor({ top, left });
    };
    const t = window.setTimeout(() => {
      place();
      fieldRef.current?.focus();
    }, 220);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [activeKey]);

  // Escape cancels.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (helpOpen) {
        dismissHelp();
        return;
      }
      if (activeKey) closeEditor(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeKey, helpOpen, closeEditor]);

  const jumpTo = (entry: SectionEntry) => {
    const el = document.querySelector<HTMLElement>(`[data-content-key="${CSS.escape(entry.key)}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.setAttribute("data-content-flash", "true");
    window.setTimeout(() => el.removeAttribute("data-content-flash"), 1800);
  };

  const exitHref = "/admin/pages";

  const run = async (fn: () => Promise<SavedString>, okText: string) => {
    setBusy(true);
    setStatus(null);
    try {
      const row = await fn();
      onSaved(row);
      setValue(row.draft ?? row.published ?? openedValueRef.current);
      setStatus({ tone: "ok", text: okText });
      flash(okText);
    } catch (err) {
      setStatus({
        tone: "error",
        text: err instanceof Error ? err.message : "That change could not be saved.",
      });
    } finally {
      setBusy(false);
    }
  };

  const doPublishAll = async () => {
    setBusy(true);
    try {
      const rows = await publishAll({ data: { page } });
      rows.forEach(onSaved);
      flash(
        rows.length === 0
          ? "There was nothing waiting to publish."
          : `${rows.length} change${rows.length === 1 ? "" : "s"} are now live on the website.`,
      );
    } catch (err) {
      flash(err instanceof Error ? err.message : "Those changes could not be published.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{OVERLAY_CSS}</style>

      {/* ── Edit-mode bar ─────────────────────────────────────────────── */}
      <div data-content-ui ref={barRef} style={barStyle}>
        <span style={{ fontWeight: 700, color: ORANGE }}>Editing a draft</span>
        <span style={{ opacity: 0.85 }} className="cev-bar-note">
          The live site has not changed.
        </span>
        <span style={{ opacity: 0.75 }}>
          {draftCount} unpublished change{draftCount === 1 ? "" : "s"}
        </span>
        <span style={{ flex: 1 }} />
        {canPublish ? (
          <button type="button" disabled={busy || draftCount === 0} onClick={() => void doPublishAll()} style={{ ...primaryBtn, padding: "6px 12px", opacity: busy || draftCount === 0 ? 0.5 : 1 }}>
            Publish all changes
          </button>
        ) : (
          <span style={{ opacity: 0.75 }}>Your role can save drafts but not publish.</span>
        )}
        <button type="button" onClick={() => setHelpOpen(true)} aria-label="How on-page editing works" style={{ ...toolbarBtn, width: 28, padding: 0 }}>
          ?
        </button>
        <a href={exitHref} style={{ ...toolbarBtn, textDecoration: "none" }}>
          Exit editing
        </a>
      </div>

      {/* ── Sections + photos ─────────────────────────────────────────────
          On a phone the two floating panels become ONE bottom sheet with two
          tabs, so nothing overlaps the page or each other. On a wide screen
          they stay as they were. ─────────────────────────────────────────── */}
      {narrow && activeKey ? null : narrow ? (
        <div
          data-content-ui
          className="cev-sheet"
          style={{ background: PAPER, color: INK, fontFamily: "system-ui, sans-serif" }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {(["sections", "photos"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSheetTab(t);
                  setPanelOpen(true);
                }}
                aria-pressed={sheetTab === t && panelOpen}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: sheetTab === t ? ORANGE : "#FFFFFF",
                  color: "#1A1A1A",
                  font: "800 14px system-ui",
                  cursor: "pointer",
                }}
              >
                {t === "sections" ? "Text" : "Photos"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-label={panelOpen ? "Hide the list" : "Show the list"}
              style={{
                minHeight: 44,
                minWidth: 44,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#FFFFFF",
                color: "#1A1A1A",
                font: "700 15px system-ui",
                cursor: "pointer",
              }}
            >
              {panelOpen ? "▾" : "▴"}
            </button>
          </div>

          {panelOpen && sheetTab === "sections" && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {sections.length === 0 && (
                <li style={{ padding: 8, fontSize: 14, opacity: 0.75 }}>Nothing editable on this page yet.</li>
              )}
              {sections.map((s) => (
                <li key={s.section}>
                  <button
                    type="button"
                    onClick={() => jumpTo(s)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      minHeight: 44,
                      padding: "10px 12px",
                      marginBottom: 6,
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.10)",
                      background: "#FFFFFF",
                      color: INK,
                      font: "600 15px system-ui",
                      cursor: "pointer",
                    }}
                  >
                    {s.section}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {panelOpen && sheetTab === "photos" && (
            <div style={{ font: "500 15px/1.4 system-ui, sans-serif" }}>
              <ImageSlotEditor canPublish={canPublish} variant="inline" />
            </div>
          )}
        </div>
      ) : (
        <div data-content-ui style={panelStyle} ref={panelRef}>
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            style={panelHeaderBtn}
          >
            <span>Sections on this page</span>
            <span aria-hidden>{panelOpen ? "▾" : "▸"}</span>
          </button>
          {panelOpen && (
            <ul style={{ listStyle: "none", margin: 0, padding: 6, maxHeight: "40vh", overflowY: "auto" }}>
              {sections.length === 0 && (
                <li style={{ padding: 8, fontSize: 12, opacity: 0.7 }}>Nothing editable on this page yet.</li>
              )}
              {sections.map((s) => (
                <li key={s.section}>
                  <button type="button" onClick={() => jumpTo(s)} style={panelItemBtn}>
                    {s.section}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}


      {/* ── Editor popover ────────────────────────────────────────────── */}
      {activeKey && (narrow || anchor) && (
        <div
          data-content-ui
          className={narrow ? "cev-sheet" : undefined}
          role="dialog"
          aria-label={`Edit ${label}`}
          style={
            narrow
              ? {
                  zIndex: 2147483006,
                  background: INK,
                  color: PAPER,
                  borderTop: `2px solid ${ORANGE}`,
                  fontFamily: "system-ui, sans-serif",
                }
              : {
                  position: "fixed",
                  top: anchor?.top,
                  left: anchor?.left,
                  zIndex: 2147483002,
                  width: "min(360px, calc(100vw - 24px))",
                  padding: 14,
                  borderRadius: 14,
                  background: INK,
                  color: PAPER,
                  border: `1px solid ${ORANGE}`,
                  boxShadow: "0 24px 60px -20px rgba(0,0,0,0.8)",
                  fontFamily: "system-ui, sans-serif",
                }
          }
        >
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{label}</p>
            <button type="button" onClick={() => closeEditor(true)} aria-label="Close editor" style={toolbarBtn}>
              Close
            </button>
          </div>

          {active?.multiline || value.length > 70 ? (
            <textarea
              ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
              value={value}
              rows={4}
              onChange={(e) => setValue(e.target.value)}
              style={fieldStyle}
            />
          ) : (
            <input
              ref={fieldRef as React.RefObject<HTMLInputElement>}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={fieldStyle}
            />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.85 }}>
            <span>
              {active?.draft != null && active.draft !== active.published
                ? "Saved as a draft — not live yet"
                : "Matches the live site"}
            </span>
            {maxLength != null && (
              <span style={{ color: tooLong ? "#FF9C9C" : undefined }}>
                {tooLong
                  ? `${value.length - maxLength} characters too long`
                  : `${remaining} characters left`}
              </span>
            )}
          </div>

          {status && (
            <p style={{ margin: "10px 0 0", fontSize: 12, color: status.tone === "ok" ? "#9BE59B" : "#FF9C9C" }}>
              {status.text}
            </p>
          )}
          {tooLong && (
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#FF9C9C" }}>
              This text is too long to fit. Shorten it before saving.
            </p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              disabled={busy || tooLong || !dirty}
              onClick={() =>
                void run(
                  () => saveDraft({ data: { key: activeKey, value } }),
                  "Draft saved. The live site has not changed yet.",
                )
              }
              style={{ ...primaryBtn, opacity: busy || tooLong || !dirty ? 0.5 : 1 }}
            >
              Save draft
            </button>
            <button type="button" disabled={busy} onClick={() => closeEditor(true)} style={secondaryBtn}>
              Cancel
            </button>
            {canPublish && (
              <button
                type="button"
                disabled={busy || tooLong}
                onClick={() =>
                  void run(
                    () => publish({ data: { key: activeKey, value } }),
                    "Published — this is now live on the website.",
                  )
                }
                style={{ ...secondaryBtn, opacity: busy || tooLong ? 0.5 : 1 }}
              >
                Publish this
              </button>
            )}
            {active?.draft != null && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(() => discard({ data: { key: activeKey } }), "Draft removed. Back to the live wording.")
                }
                style={secondaryBtn}
              >
                Undo draft
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── First-run help ────────────────────────────────────────────── */}
      {helpOpen && (
        <div data-content-ui role="dialog" aria-label="How on-page editing works" style={helpStyle}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>How to edit this page</p>
          <ol style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
            <li>Anything with an orange dashed outline can be edited — click it.</li>
            <li>Changes are saved as drafts; the website only updates when you publish.</li>
            <li>Use the “Sections on this page” list to jump around the page.</li>
          </ol>
          <button type="button" onClick={dismissHelp} style={{ ...primaryBtn, marginTop: 14 }}>
            Got it
          </button>
        </div>
      )}

      {/* ── Photos on this page (phone: hosted inside the sheet above) ── */}
      {!narrow && <ImageSlotEditor canPublish={canPublish} />}

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div data-content-ui role="status" aria-live="polite" style={toastStyle}>
          {toast}
        </div>
      )}
    </>

  );
}

const barStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  minHeight: BAR_HEIGHT,
  zIndex: 2147483003,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  padding: "6px 12px",
  background: INK,
  color: PAPER,
  borderBottom: `2px solid ${ORANGE}`,
  fontSize: 12.5,
  fontFamily: "system-ui, sans-serif",
};

const panelStyle: React.CSSProperties = {
  position: "fixed",
  right: 12,
  bottom: 12,
  zIndex: 2147483001,
  width: "min(240px, calc(100vw - 24px))",
  borderRadius: 12,
  background: INK,
  color: PAPER,
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 18px 40px -18px rgba(0,0,0,0.75)",
  fontFamily: "system-ui, sans-serif",
  overflow: "hidden",
};

const panelHeaderBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  width: "100%",
  minHeight: 40,
  padding: "0 12px",
  background: "transparent",
  border: "none",
  color: ORANGE,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
};

const panelItemBtn: React.CSSProperties = {
  display: "block",
  width: "100%",
  minHeight: 36,
  padding: "8px 10px",
  textAlign: "left",
  borderRadius: 8,
  border: "none",
  background: "transparent",
  color: PAPER,
  fontSize: 12.5,
  cursor: "pointer",
};

const toolbarBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 28,
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.3)",
  background: "transparent",
  color: PAPER,
  fontSize: 12,
  cursor: "pointer",
};

const primaryBtn: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 10,
  border: "none",
  background: ORANGE,
  color: "#1A1A1A",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.3)",
  background: "transparent",
  color: PAPER,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  margin: "12px 0 6px",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.08)",
  color: PAPER,
  fontSize: 14,
  lineHeight: 1.5,
  resize: "vertical",
};

const helpStyle: React.CSSProperties = {
  position: "fixed",
  top: BAR_HEIGHT + 12,
  right: 12,
  zIndex: 2147483004,
  width: "min(320px, calc(100vw - 24px))",
  padding: 16,
  borderRadius: 14,
  background: INK,
  color: PAPER,
  border: `1px solid ${ORANGE}`,
  boxShadow: "0 24px 60px -20px rgba(0,0,0,0.8)",
  fontFamily: "system-ui, sans-serif",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  bottom: 16,
  zIndex: 2147483005,
  maxWidth: "calc(100vw - 24px)",
  padding: "10px 16px",
  borderRadius: 999,
  background: INK,
  color: PAPER,
  border: `1px solid ${ORANGE}`,
  fontSize: 12.5,
  fontFamily: "system-ui, sans-serif",
  boxShadow: "0 18px 40px -18px rgba(0,0,0,0.75)",
};
