import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/dev/motion-debug")({
  head: () => ({
    meta: [
      { title: "Motion Debug — Reveal Instrumentation" },
      { name: "robots", content: "noindex,nofollow" },
      {
        name: "description",
        content:
          "Internal diagnostic: scans a target route for motion/reveal elements stranded at opacity 0 or with untriggered transforms.",
      },
    ],
  }),
  component: MotionDebugPage,
});

type Finding = {
  index: number;
  selector: string;
  tag: string;
  classes: string;
  opacity: number;
  transform: string;
  rectTop: number;
  rectHeight: number;
  inViewport: boolean;
  belowFold: boolean;
  aboveFold: boolean;
  text: string;
  reason: string;
};

type ScanResult = {
  url: string;
  viewport: { w: number; h: number };
  scrollY: number;
  docHeight: number;
  reducedMotionCss: boolean;
  reducedMotionMedia: boolean;
  totalCandidates: number;
  stranded: Finding[];
  neverEntered: Finding[];
  ok: number;
};

// Any element that framer-motion or our Reveal helpers could touch.
// We look at inline style (framer writes inline), plus data-* markers.
const CANDIDATE_SELECTOR = [
  "[style*='opacity']",
  "[style*='transform']",
  "[data-framer-appear-id]",
  "[data-motion]",
].join(",");

function shortSelector(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;
  while (node && depth < 4 && node.tagName.toLowerCase() !== "body") {
    let piece = node.tagName.toLowerCase();
    if (node.id) piece += `#${node.id}`;
    const cls = (node.getAttribute("class") || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .join(".");
    if (cls) piece += `.${cls}`;
    parts.unshift(piece);
    node = node.parentElement;
    depth++;
  }
  return parts.join(" > ");
}

function transformIsIdentity(t: string): boolean {
  if (!t || t === "none") return true;
  // matrix(1, 0, 0, 1, 0, 0) or matrix3d identity
  if (/^matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\)$/.test(t)) return true;
  if (
    /^matrix3d\(1,\s*0,\s*0,\s*0,\s*0,\s*1,\s*0,\s*0,\s*0,\s*0,\s*1,\s*0,\s*0,\s*0,\s*0,\s*1\)$/.test(
      t,
    )
  )
    return true;
  return false;
}

function scanDocument(doc: Document, win: Window): ScanResult {
  const vw = win.innerWidth;
  const vh = win.innerHeight;
  const scrollY = win.scrollY;
  const docHeight = doc.documentElement.scrollHeight;
  const reducedMotionCss = doc.documentElement.classList.contains("reduce-motion");
  const reducedMotionMedia = win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nodes = Array.from(doc.querySelectorAll(CANDIDATE_SELECTOR));
  const stranded: Finding[] = [];
  const neverEntered: Finding[] = [];
  let ok = 0;

  nodes.forEach((el, i) => {
    const cs = win.getComputedStyle(el);
    const opacity = parseFloat(cs.opacity || "1");
    const transform = cs.transform;
    const rect = el.getBoundingClientRect();
    const inViewport = rect.bottom > 0 && rect.top < vh;
    const belowFold = rect.top >= vh;
    const aboveFold = rect.bottom <= 0;
    const identity = transformIsIdentity(transform);

    const text = (el.textContent || "").trim().slice(0, 80);
    const base: Omit<Finding, "reason"> = {
      index: i,
      selector: shortSelector(el),
      tag: el.tagName.toLowerCase(),
      classes: el.getAttribute("class") || "",
      opacity,
      transform,
      rectTop: Math.round(rect.top + scrollY),
      rectHeight: Math.round(rect.height),
      inViewport,
      belowFold,
      aboveFold,
      text,
    };

    // Stranded: in viewport but effectively invisible or transformed off
    if (inViewport && (opacity < 0.99 || !identity)) {
      const reasons: string[] = [];
      if (opacity < 0.99) reasons.push(`opacity=${opacity.toFixed(2)}`);
      if (!identity) reasons.push(`transform=${transform}`);
      stranded.push({ ...base, reason: reasons.join(" ") });
      return;
    }

    // Never-entered: below fold AND at opacity 1 with identity transform.
    // That means the element has no reveal wrapper at all (or the reveal
    // already fired without the element being visible — likely a bug).
    if (belowFold && opacity >= 0.99 && identity) {
      // Heuristic: only interesting if it *has* framer markers.
      const hasFramer =
        el.hasAttribute("data-framer-appear-id") ||
        el.hasAttribute("data-motion") ||
        (el.getAttribute("style") || "").includes("will-change");
      if (hasFramer) {
        neverEntered.push({ ...base, reason: "below-fold but fully visible (reveal likely skipped)" });
      }
      ok++;
      return;
    }

    ok++;
  });

  return {
    url: win.location.href,
    viewport: { w: vw, h: vh },
    scrollY,
    docHeight,
    reducedMotionCss,
    reducedMotionMedia,
    totalCandidates: nodes.length,
    stranded,
    neverEntered,
    ok,
  };
}

function MotionDebugPage() {
  const [target, setTarget] = useState("/");
  const [autoScroll, setAutoScroll] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [selfScan, setSelfScan] = useState<ScanResult | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const runScan = useCallback(async () => {
    const frame = iframeRef.current;
    if (!frame || !frame.contentWindow || !frame.contentDocument) {
      setStatus("iframe not ready");
      return;
    }
    setStatus("scanning…");
    const win = frame.contentWindow;
    const doc = frame.contentDocument;

    if (autoScroll) {
      // Gradually scroll top→bottom→top so IntersectionObserver fires for
      // every reveal wrapper on the page.
      const step = Math.max(200, Math.round(win.innerHeight * 0.6));
      const max = doc.documentElement.scrollHeight;
      for (let y = 0; y <= max; y += step) {
        win.scrollTo({ top: y, behavior: "auto" });
        await new Promise((r) => setTimeout(r, 120));
      }
      win.scrollTo({ top: 0, behavior: "auto" });
      await new Promise((r) => setTimeout(r, 200));
    }

    const r = scanDocument(doc, win);
    setResult(r);
    setStatus(
      `done — ${r.stranded.length} stranded / ${r.neverEntered.length} never-entered / ${r.totalCandidates} candidates`,
    );
  }, [autoScroll]);

  const scanSelf = useCallback(() => {
    setSelfScan(scanDocument(document, window));
  }, []);

  useEffect(() => {
    scanSelf();
  }, [scanSelf]);

  const iframeSrc = useMemo(() => {
    // Force same-origin path
    return target.startsWith("/") ? target : `/${target}`;
  }, [target]);

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-orange)]">
            Diagnostic
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--cevons-deep-green)]">
            Motion / Reveal Instrumentation
          </h1>
          <p className="max-w-3xl text-sm text-black/60">
            Loads any route in an iframe, optionally auto-scrolls to trigger
            IntersectionObserver-based reveals, then reports elements that
            remain at <code>opacity &lt; 1</code> or a non-identity transform
            while in the viewport (<strong>stranded</strong>), plus elements
            below the fold that already appear fully visible (
            <strong>never-entered</strong>, i.e. missing a reveal wrapper).
          </p>
        </header>

        <section className="rounded-2xl border border-black/5 bg-white p-4 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-xs font-semibold text-black/70">
              Target route
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="/"
                className="mt-1 w-72 rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)]"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-black/70">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll before scan
            </label>
            <button
              onClick={runScan}
              className="rounded-md bg-[var(--brand-orange)] px-4 py-2 text-sm font-bold text-[var(--text-on-orange)] shadow-sm"
            >
              Scan target
            </button>
            <button
              onClick={scanSelf}
              className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-charcoal)]"
            >
              Re-scan this page
            </button>
            <span className="text-xs text-black/50">{status}</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-black/10 bg-white">
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title="motion debug target"
              className="block h-[720px] w-full"
            />
          </div>
        </section>

        {result && <ResultPanel title="Target scan" result={result} />}
        {selfScan && (
          <ResultPanel title="Self scan (this page)" result={selfScan} muted />
        )}

        <section className="rounded-2xl border border-black/5 bg-white p-4 md:p-6 text-sm text-black/70">
          <h2 className="mb-2 text-base font-bold text-[var(--cevons-deep-green)]">
            How to read this
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Stranded</strong> = element is currently on-screen but
              framer left it at opacity &lt; 1 or a translated/scaled
              transform. Almost always a broken reveal (wrong PresenceContext,
              parent unmounted, viewport observer never fired).
            </li>
            <li>
              <strong>Never-entered</strong> = element is below the fold yet
              already fully visible with framer markers. Means either the
              reveal wrapper is missing/removed, or something skipped its
              <code>initial</code> (e.g. an ancestor <code>AnimatePresence</code>
              with <code>initial=false</code>).
            </li>
            <li>
              Enable <em>Auto-scroll</em> to force IntersectionObserver to fire
              for every wrapper; then look at what remains stranded — those
              are the genuinely broken ones.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function ResultPanel({
  title,
  result,
  muted,
}: {
  title: string;
  result: ScanResult;
  muted?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-black/5 p-4 md:p-6 shadow-sm ${
        muted ? "bg-[#FBFAF7]" : "bg-white"
      }`}
    >
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-[var(--cevons-deep-green)]">
          {title}
        </h2>
        <div className="text-xs text-black/60">
          {result.url} · vp {result.viewport.w}×{result.viewport.h} · doc{" "}
          {result.docHeight}px · scrollY {result.scrollY} · reduce-motion:{" "}
          {result.reducedMotionCss ? "css✓" : "css✗"}/{result.reducedMotionMedia ? "media✓" : "media✗"}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Stranded" value={result.stranded.length} tone="bad" />
        <Stat label="Never-entered" value={result.neverEntered.length} tone="warn" />
        <Stat label="Candidates" value={result.totalCandidates} tone="ok" />
      </div>

      <FindingsTable title="Stranded (in viewport, invisible)" rows={result.stranded} />
      <FindingsTable
        title="Never-entered (below fold, already visible)"
        rows={result.neverEntered}
      />
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "bad";
}) {
  const bg =
    tone === "bad"
      ? "#FEE2E2"
      : tone === "warn"
        ? "#FEF3C7"
        : "#ECFDF5";
  const fg =
    tone === "bad" ? "#991B1B" : tone === "warn" ? "#92400E" : "#065F46";
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: bg, color: fg }}
    >
      <div className="text-[11px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function FindingsTable({ title, rows }: { title: string; rows: Finding[] }) {
  if (rows.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-black/10 px-4 py-3 text-xs text-black/50">
        {title}: none.
      </div>
    );
  }
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-bold text-[var(--brand-charcoal)]">
        {title} ({rows.length})
      </h3>
      <div className="overflow-x-auto rounded-xl border border-black/10">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="bg-black/[0.03] text-left text-[11px] font-bold uppercase tracking-wider text-black/60">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Selector</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Top / H</th>
              <th className="px-3 py-2">Text</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px] text-black/80">
            {rows.map((r) => (
              <tr key={r.index} className="border-t border-black/5 align-top">
                <td className="px-3 py-2">{r.index}</td>
                <td className="px-3 py-2 whitespace-pre-wrap break-all">
                  {r.selector}
                </td>
                <td className="px-3 py-2 text-[var(--brand-orange)]">
                  {r.reason}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.rectTop} / {r.rectHeight}
                </td>
                <td className="px-3 py-2 max-w-[280px] truncate" title={r.text}>
                  {r.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
