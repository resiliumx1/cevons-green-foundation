import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  discardContentDraft,
  publishContentString,
  saveContentDraft,
  type ContentMeta,
  type SavedString,
} from "@/lib/content.functions";

/**
 * Click-to-edit overlay. Rendered ONLY inside a verified staff preview
 * session (`ContentProvider` mounts it when `preview === true`), so nothing
 * here can ever appear on the public site.
 *
 * It works off the `data-content-key` attributes that <Editable> already adds
 * in preview mode: click a highlighted piece of copy, edit it in the panel,
 * save it as a draft or publish it. Writes go through server functions that
 * run as the signed-in staff user, so RLS and the publish guard trigger are
 * the real boundary — see content.functions.ts.
 */

type Props = {
  meta: Record<string, ContentMeta>;
  canPublish: boolean;
  /** Push a saved value back into the live page without a reload. */
  onSaved: (row: SavedString) => void;
};

const HIGHLIGHT_CSS = `
[data-content-key] {
  outline: 1px dashed rgba(0, 107, 53, 0.55);
  outline-offset: 2px;
  border-radius: 2px;
  cursor: text;
  transition: outline-color 120ms ease, background-color 120ms ease;
}
[data-content-key]:hover {
  outline: 2px solid #FCE722;
  background-color: rgba(252, 231, 34, 0.16);
}
[data-content-key][data-content-active="true"] {
  outline: 2px solid #FCE722;
  background-color: rgba(252, 231, 34, 0.24);
}
`;

export function ContentEditorOverlay({ meta, canPublish, onSaved }: Props) {
  const [highlight, setHighlight] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  const saveDraft = useServerFn(saveContentDraft);
  const publish = useServerFn(publishContentString);
  const discard = useServerFn(discardContentDraft);

  const active = activeKey ? meta[activeKey] : undefined;
  const label = active?.label ?? activeKey ?? "";
  const maxLength = active?.maxLength ?? null;
  const tooLong = maxLength != null && value.length > maxLength;
  const baseline = active?.draft ?? active?.published ?? "";
  const dirty = value !== baseline;

  // Selecting a piece of copy on the page.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-content-key]") as HTMLElement | null;
      if (!el) return;
      const key = el.getAttribute("data-content-key");
      if (!key) return;
      // Editing beats navigating: a wrapped label inside a link must not
      // follow the link while the editor is open.
      e.preventDefault();
      e.stopPropagation();
      const m = meta[key];
      setActiveKey(key);
      setValue(m?.draft ?? m?.published ?? (el.textContent ?? ""));
      setStatus(null);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [meta]);

  // Mark the selected element so the editor and the page agree on what is being edited.
  useEffect(() => {
    document
      .querySelectorAll("[data-content-active]")
      .forEach((n) => n.removeAttribute("data-content-active"));
    if (!activeKey) return;
    const el = document.querySelector(`[data-content-key="${CSS.escape(activeKey)}"]`);
    el?.setAttribute("data-content-active", "true");
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = window.setTimeout(() => fieldRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [activeKey]);

  // Escape closes the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveKey(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const exitHref = useMemo(() => {
    if (typeof window === "undefined") return "/";
    const url = new URL(window.location.href);
    url.searchParams.delete("preview");
    return url.pathname + url.search;
  }, []);

  const run = async (fn: () => Promise<SavedString>, okText: string) => {
    setBusy(true);
    setStatus(null);
    try {
      const row = await fn();
      onSaved(row);
      setValue(row.draft ?? row.published ?? "");
      setStatus({ tone: "ok", text: okText });
    } catch (err) {
      setStatus({
        tone: "error",
        text: err instanceof Error ? err.message : "That change could not be saved.",
      });
    } finally {
      setBusy(false);
    }
  };

  const count = Object.keys(meta).length;
  const draftCount = Object.values(meta).filter((m) => m.draft != null && m.draft !== m.published).length;

  return (
    <>
      {highlight && <style>{HIGHLIGHT_CSS}</style>}

      {/* Toolbar */}
      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          zIndex: 2147483000,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 999,
          background: "#111214",
          color: "#F5F5F5",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 18px 40px -18px rgba(0,0,0,0.75)",
          fontSize: 13,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontWeight: 700, color: "#FCE722" }}>Editing copy</span>
        <span style={{ opacity: 0.7 }}>
          {count} editable {count === 1 ? "string" : "strings"}
          {draftCount > 0 ? ` · ${draftCount} unpublished` : ""}
        </span>
        <button
          type="button"
          onClick={() => setHighlight((h) => !h)}
          style={toolbarBtn}
        >
          {highlight ? "Hide outlines" : "Show outlines"}
        </button>
        <a href={exitHref} style={{ ...toolbarBtn, textDecoration: "none" }}>
          Exit preview
        </a>
      </div>

      {/* Editor panel */}
      {activeKey && (
        <div
          role="dialog"
          aria-label={`Edit ${label}`}
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 2147483001,
            width: "min(420px, calc(100vw - 32px))",
            padding: 16,
            borderRadius: 16,
            background: "#111214",
            color: "#F5F5F5",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 24px 60px -20px rgba(0,0,0,0.8)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.6, fontFamily: "ui-monospace, monospace" }}>
                {activeKey}
              </p>
            </div>
            <button type="button" onClick={() => setActiveKey(null)} aria-label="Close editor" style={toolbarBtn}>
              Close
            </button>
          </div>

          {active?.multiline || value.length > 70 ? (
            <textarea
              ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
              value={value}
              rows={4}
              maxLength={maxLength ?? undefined}
              onChange={(e) => setValue(e.target.value)}
              style={fieldStyle}
            />
          ) : (
            <input
              ref={fieldRef as React.RefObject<HTMLInputElement>}
              value={value}
              maxLength={maxLength ?? undefined}
              onChange={(e) => setValue(e.target.value)}
              style={fieldStyle}
            />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.7 }}>
            <span>
              {active?.draft != null && active.draft !== active.published
                ? "Unpublished draft"
                : "Matches the live site"}
            </span>
            {maxLength != null && (
              <span style={{ color: tooLong ? "#FF8A8A" : undefined }}>
                {value.length} / {maxLength}
              </span>
            )}
          </div>

          {status && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 12,
                color: status.tone === "ok" ? "#8BE28B" : "#FF8A8A",
              }}
            >
              {status.text}
            </p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              disabled={busy || tooLong || !dirty}
              onClick={() => void run(() => saveDraft({ data: { key: activeKey, value } }), "Draft saved.")}
              style={{ ...primaryBtn, opacity: busy || tooLong || !dirty ? 0.5 : 1 }}
            >
              Save draft
            </button>
            {canPublish && (
              <button
                type="button"
                disabled={busy || tooLong}
                onClick={() => void run(() => publish({ data: { key: activeKey, value } }), "Published to the live site.")}
                style={{ ...secondaryBtn, opacity: busy || tooLong ? 0.5 : 1 }}
              >
                Publish
              </button>
            )}
            {active?.draft != null && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => discard({ data: { key: activeKey } }), "Draft discarded.")}
                style={secondaryBtn}
              >
                Discard draft
              </button>
            )}
          </div>

          {!canPublish && (
            <p style={{ margin: "10px 0 0", fontSize: 11, opacity: 0.6 }}>
              Your role can save drafts. An editor or admin publishes them.
            </p>
          )}
        </div>
      )}
    </>
  );
}

const toolbarBtn: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "#F5F5F5",
  fontSize: 12,
  cursor: "pointer",
};

const primaryBtn: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 10,
  border: "none",
  background: "#FCE722",
  color: "#1A1A1A",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.24)",
  background: "transparent",
  color: "#F5F5F5",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  margin: "12px 0 6px",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.06)",
  color: "#F5F5F5",
  fontSize: 14,
  lineHeight: 1.5,
  resize: "vertical",
};
