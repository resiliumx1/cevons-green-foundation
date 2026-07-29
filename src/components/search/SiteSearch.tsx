import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Mic,
  Search,
  Sparkles,
  Truck,
  FileText,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  groupResults,
  popularActions,
  searchSite,
  type SearchEntry,
  type SearchGroup,
} from "@/data/searchIndex";

const GROUP_ICON: Record<SearchGroup, typeof Truck> = {
  Services: Truck,
  Pages: FileText,
  "Quick actions": Sparkles,
};

/* ---------------- speech recognition (feature detected) ---------------- */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getSpeechCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined;
  return ctor ?? null;
}

/* ---------------------------------------------------------------------- */

export function SiteSearch({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate();
  const uid = useId().replace(/:/g, "");
  const listboxId = `site-search-list-${uid}`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [hasSpeech, setHasSpeech] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setHasSpeech(getSpeechCtor() !== null);
  }, []);

  const results: SearchEntry[] = useMemo(
    () => (query.trim() ? searchSite(query, 7) : popularActions),
    [query],
  );
  const grouped = useMemo(() => groupResults(results), [results]);
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);
  const noResults = query.trim().length > 0 && flat.length === 0;

  useEffect(() => setActiveIndex(-1), [query]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const close = useCallback(
    (refocus = true) => {
      stopListening();
      setOpen(false);
      setQuery("");
      setMicNote(null);
      if (refocus) requestAnimationFrame(() => triggerRef.current?.focus());
    },
    [stopListening],
  );

  // outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => () => stopListening(), [stopListening]);

  function go(entry: SearchEntry) {
    close(false);
    navigate({ to: entry.to });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flat.length) setActiveIndex((i) => (i + 1 + flat.length) % flat.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flat.length) setActiveIndex((i) => (i <= 0 ? flat.length - 1 : i - 1));
      return;
    }
    if (e.key === "Enter") {
      const entry = flat[activeIndex < 0 ? 0 : activeIndex];
      if (entry) {
        e.preventDefault();
        go(entry);
      }
    }
  }

  function toggleMic() {
    if (listening) {
      stopListening();
      return;
    }
    const Ctor = getSpeechCtor();
    if (!Ctor) return;
    setMicNote(null);
    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
        setQuery(text.trim());
        if (e.results[e.results.length - 1]?.isFinal) stopListening();
      };
      rec.onerror = () => {
        setMicNote("Mic unavailable");
        setListening(false);
        recognitionRef.current = null;
      };
      rec.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setMicNote("Mic unavailable");
      setListening(false);
    }
  }

  const panelPos = mobile
    ? "fixed left-0 right-0 top-[72px] px-4"
    : "absolute right-0 top-1/2 -translate-y-1/2 w-[280px]";

  let flatIndex = -1;

  return (
    <div ref={wrapRef} className={mobile ? "" : "relative"}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={triggerRef}
              type="button"
              aria-label="Search the site"
              aria-expanded={open}
              onClick={() => (open ? close() : setOpen(true))}
              className="inline-flex items-center justify-center size-10 rounded-full border border-cevons-border dark:border-white/15 bg-white dark:bg-white/[0.06] text-cevons-dark dark:text-white hover:bg-cevons-cream dark:hover:bg-white/10 hover:border-cevons-green transition-colors shadow-soft"
            >
              {open ? <X className="size-[18px]" /> : <Search className="size-[18px]" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="text-xs font-semibold">
            Click to search
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div className={`${panelPos} z-[200]`}>
          <div
            className="relative flex items-center gap-1 rounded-full border pl-3 pr-1.5 py-1 shadow-[0_10px_30px_rgba(16,24,32,0.16)]"
            style={{
              backgroundColor: "var(--surface-page)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <Search className="size-4 shrink-0" style={{ color: "var(--text-body)" }} aria-hidden />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={flat[activeIndex] ? `${listboxId}-opt-${flat[activeIndex].id}` : undefined}
              aria-label="Search the site"
              placeholder="Search services, pages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[14px] py-2"
              style={{ color: "var(--text-heading)" }}
            />
            {hasSpeech && (
              <button
                type="button"
                onClick={toggleMic}
                aria-pressed={listening}
                aria-label={listening ? "Stop voice search" : "Search by voice"}
                className={`inline-flex items-center justify-center size-8 rounded-full shrink-0 transition-colors ${
                  listening ? "motion-safe:animate-pulse" : "hover:bg-cevons-cream dark:hover:bg-white/10"
                }`}
                style={
                  listening
                    ? { backgroundColor: "var(--brand-orange)", color: "var(--text-on-orange)" }
                    : { color: "var(--text-body)" }
                }
              >
                <Mic className="size-4" />
              </button>
            )}
          </div>

          {micNote && (
            <p className="mt-1 px-3 text-[11px] font-semibold" style={{ color: "var(--text-body)" }}>
              {micNote}
            </p>
          )}

          <div
            className="mt-2 rounded-2xl border overflow-hidden shadow-[0_20px_44px_rgba(16,24,32,0.18)]"
            style={{
              backgroundColor: "var(--surface-page)",
              borderColor: "var(--border-hairline)",
            }}
          >
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Search suggestions"
              className="max-h-[min(60vh,420px)] overflow-y-auto py-1"
            >
              {noResults ? (
                <li className="px-4 py-4">
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-heading)" }}>
                    No matches — try “bins”, “septic”, “recycling”
                  </p>
                  <button
                    type="button"
                    onClick={() => go({ id: "nores", name: "Contact", desc: "", to: "/contact", group: "Pages" })}
                    className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold underline"
                    style={{ color: "var(--text-link)" }}
                  >
                    Contact us <ArrowRight className="size-3.5" />
                  </button>
                </li>
              ) : (
                grouped.map((g) => {
                  const GroupIcon = GROUP_ICON[g.group];
                  return (
                    <li key={g.group} role="presentation">
                      <div
                        className="px-4 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-[0.16em]"
                        style={{ color: "var(--text-body)" }}
                        role="presentation"
                      >
                        {query.trim() ? g.group : "Popular"}
                      </div>
                      <ul role="presentation">
                        {g.items.map((item) => {
                          flatIndex += 1;
                          const idx = flatIndex;
                          const active = idx === activeIndex;
                          return (
                            <li
                              key={item.id}
                              id={`${listboxId}-opt-${item.id}`}
                              role="option"
                              aria-selected={active}
                              onMouseEnter={() => setActiveIndex(idx)}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => go(item)}
                              className="flex items-start gap-3 px-4 py-2.5 cursor-pointer"
                              style={{
                                backgroundColor: active ? "var(--surface-emphasis)" : "transparent",
                              }}
                            >
                              <span
                                className="mt-0.5 inline-flex items-center justify-center size-7 rounded-lg shrink-0"
                                style={{
                                  backgroundColor: "var(--brand-orange)",
                                  color: "var(--text-on-orange)",
                                }}
                                aria-hidden
                              >
                                <GroupIcon className="size-4" />
                              </span>
                              <span className="min-w-0">
                                <span
                                  className="block text-[13.5px] font-bold leading-tight"
                                  style={{ color: "var(--text-heading)" }}
                                >
                                  {item.name}
                                </span>
                                <span
                                  className="block text-[12px] leading-snug truncate"
                                  style={{ color: "var(--text-body)" }}
                                >
                                  {item.desc}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
