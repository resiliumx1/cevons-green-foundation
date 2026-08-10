import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  LayoutTemplate,
  Activity,
  Image as ImageIcon,
  Tag,
  Inbox,
  UsersRound,
  FileClock,
  Settings,
  Plus,
  ArrowRight,
  Loader2,
  History,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

/**
 * Command palette for the WEBSITE admin: the things this product manages —
 * requests submitted from the site, media, promotions and the screens
 * themselves. It no longer searches CRM entities.
 */

type RequestRow = { id: string; reference: string; name: string | null; service: string | null; status: string | null };
type MediaRow = { id: string; title: string | null; kind: string | null };
type PromoRow = { id: string; title: string; placement: string | null };

type Results = { requests: RequestRow[]; media: MediaRow[]; promotions: PromoRow[] };

const EMPTY: Results = { requests: [], media: [], promotions: [] };
const RECENT_KEY = "crm-cmdk-recent";

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 5) : [];
  } catch {
    return [];
  }
}
function pushRecent(q: string) {
  if (!q.trim()) return;
  const next = [q, ...loadRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — recents are a convenience only
  }
}

function escapeIlike(s: string) {
  return s.replace(/[%_]/g, (m) => `\\${m}`);
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-[#FCE722]/40 px-0.5 text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function CrmCommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>(EMPTY);
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const reqId = useRef(0);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
      setResults(EMPTY);
      setLoading(false);
    } else {
      setRecent(loadRecent());
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    if (!debounced) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    const like = `%${escapeIlike(debounced)}%`;
    const myId = ++reqId.current;
    setLoading(true);

    Promise.all([
      supabase
        .from("service_requests")
        .select("id, reference, name, service, status")
        .or(`name.ilike.${like},reference.ilike.${like},phone.ilike.${like},email.ilike.${like},service.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("media_posts")
        .select("id, title, kind")
        .or(`title.ilike.${like},caption.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("promotions")
        .select("id, title, placement")
        .or(`title.ilike.${like},body.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(5),
    ])
      .then(([requests, media, promotions]) => {
        if (myId !== reqId.current) return;
        setResults({
          requests: (requests.data as RequestRow[]) ?? [],
          media: (media.data as MediaRow[]) ?? [],
          promotions: (promotions.data as PromoRow[]) ?? [],
        });
      })
      .catch(() => {
        if (myId !== reqId.current) return;
        setResults(EMPTY);
      })
      .finally(() => {
        if (myId === reqId.current) setLoading(false);
      });
  }, [debounced, open]);

  function go(to: () => void, label?: string) {
    if (label || debounced) pushRecent(label || debounced);
    onOpenChange(false);
    setTimeout(to, 0);
  }

  const hasAny = results.requests.length + results.media.length + results.promotions.length > 0;

  const pages = useMemo(
    () => [
      { label: "Dashboard", icon: LayoutGrid, to: "/admin" as const },
      { label: "Traffic", icon: Activity, to: "/admin/traffic" as const },
      { label: "Pages", icon: LayoutTemplate, to: "/admin/pages" as const },
      { label: "Media", icon: ImageIcon, to: "/admin/media" as const },
      { label: "Promotions", icon: Tag, to: "/admin/promotions" as const },
      { label: "Requests", icon: Inbox, to: "/admin/leads" as const },
      { label: "People", icon: UsersRound, to: "/admin/people" as const },
      { label: "Activity log", icon: FileClock, to: "/admin/audit" as const },
      { label: "Settings", icon: Settings, to: "/admin/settings" as const },
    ],
    [],
  );

  const filteredPages = useMemo(() => {
    if (!debounced) return pages;
    const q = debounced.toLowerCase();
    return pages.filter((p) => p.label.toLowerCase().includes(q));
  }, [debounced, pages]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="relative">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search pages, media, requests, settings…"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#EF7700]" />
        )}
      </div>

      <CommandList className="max-h-[60vh] sm:max-h-[420px]">
        {!debounced && recent.length > 0 && (
          <CommandGroup heading="Recent searches">
            {recent.map((r) => (
              <CommandItem key={r} value={`recent-${r}`} onSelect={() => setQuery(r)}>
                <History className="h-4 w-4 text-muted-foreground" />
                <span>{r}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {debounced && !loading && !hasAny && filteredPages.length === 0 && (
          <CommandEmpty>
            No results for &ldquo;<span className="font-medium">{debounced}</span>&rdquo;
          </CommandEmpty>
        )}

        {results.requests.length > 0 && (
          <CommandGroup heading="Requests">
            {results.requests.map((l) => (
              <CommandItem
                key={`req-${l.id}`}
                value={`req-${l.id}-${l.reference}-${l.name ?? ""}`}
                onSelect={() => go(() => navigate({ to: "/admin/leads/$id", params: { id: l.id } }))}
              >
                <Inbox className="h-4 w-4 text-muted-foreground" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    <Highlight text={l.name || "Unnamed request"} q={debounced} />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    <Highlight text={l.reference} q={debounced} />
                    {l.service ? <> · <Highlight text={l.service} q={debounced} /></> : null}
                  </span>
                </div>
                {l.status && (
                  <span className="ml-auto rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize">
                    {l.status}
                  </span>
                )}
              </CommandItem>
            ))}
            <CommandItem value="view-all-requests" onSelect={() => go(() => navigate({ to: "/admin/leads" }))} className="text-xs">
              <ArrowRight className="h-3.5 w-3.5" /> View all in Requests
            </CommandItem>
          </CommandGroup>
        )}

        {results.media.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Media">
              {results.media.map((m) => (
                <CommandItem
                  key={`media-${m.id}`}
                  value={`media-${m.id}-${m.title ?? ""}`}
                  onSelect={() => go(() => navigate({ to: "/admin/media" }))}
                >
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      <Highlight text={m.title || "Untitled"} q={debounced} />
                    </span>
                    <span className="truncate text-xs capitalize text-muted-foreground">{m.kind ?? "media"}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.promotions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Promotions">
              {results.promotions.map((p) => (
                <CommandItem
                  key={`promo-${p.id}`}
                  value={`promo-${p.id}-${p.title}`}
                  onSelect={() => go(() => navigate({ to: "/admin/promotions" }))}
                >
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      <Highlight text={p.title} q={debounced} />
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {(p.placement ?? "").replace(/_/g, " ")}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredPages.length > 0 && (
          <>
            {hasAny && <CommandSeparator />}
            <CommandGroup heading="Screens">
              {filteredPages.map((p) => {
                const Icon = p.icon;
                return (
                  <CommandItem key={p.to} value={`page-${p.label}`} onSelect={() => go(() => navigate({ to: p.to }), p.label)}>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <Highlight text={p.label} q={debounced} />
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem value="action-upload-media" onSelect={() => go(() => navigate({ to: "/admin/media" }), "Upload media")}>
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span>Upload media</span>
              </CommandItem>
              <CommandItem value="action-new-promotion" onSelect={() => go(() => navigate({ to: "/admin/promotions" }), "New promotion")}>
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span>New promotion</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {!debounced && recent.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            <Search className="mx-auto mb-2 h-5 w-5 opacity-50" />
            Search pages, media, promotions, requests or any admin screen.
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
