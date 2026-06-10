import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Users,
  ContactRound,
  MessageSquare,
  Megaphone,
  LayoutGrid,
  BarChart3,
  Star,
  Settings,
  Upload,
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

type LeadRow = { id: string; reference: string; name: string | null; service: string | null; status: string | null };
type CustomerRow = { id: string; name: string; type: string | null; region: string | null };
type MessageRow = { id: string; reference: string | null; name: string; subject: string | null };
type CampaignRow = { id: string; name: string; channel: string | null; utm_campaign: string | null };

type Results = {
  leads: LeadRow[];
  customers: CustomerRow[];
  messages: MessageRow[];
  campaigns: CampaignRow[];
};

const EMPTY: Results = { leads: [], customers: [], messages: [], campaigns: [] };
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
  } catch {}
}

function escapeIlike(s: string) {
  // escape % and _ for ilike
  return s.replace(/[%_]/g, (m) => `\\${m}`);
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-[#FFD200]/30 text-inherit rounded-sm px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  contacted: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  quoted: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  scheduled: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  lost: "bg-red-500/15 text-red-300 border-red-400/30",
};

export function CrmCommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>(EMPTY);
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const reqId = useRef(0);

  // Reset on close
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

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Query
  useEffect(() => {
    if (!open) return;
    if (!debounced) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    const q = escapeIlike(debounced);
    const myId = ++reqId.current;
    setLoading(true);
    const like = `%${q}%`;

    Promise.all([
      supabase
        .from("service_requests")
        .select("id, reference, name, service, status")
        .or(
          `name.ilike.${like},reference.ilike.${like},phone.ilike.${like},email.ilike.${like},service.ilike.${like}`,
        )
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("customers")
        .select("id, name, type, region")
        .or(`name.ilike.${like},contact_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("contact_messages")
        .select("id, reference, name, subject")
        .or(`name.ilike.${like},subject.ilike.${like},reference.ilike.${like},email.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("campaigns")
        .select("id, name, channel, utm_campaign")
        .or(`name.ilike.${like},utm_campaign.ilike.${like}`)
        .order("created_at", { ascending: false })
        .limit(5),
    ])
      .then(([leads, customers, messages, campaigns]) => {
        if (myId !== reqId.current) return;
        setResults({
          leads: (leads.data as LeadRow[]) ?? [],
          customers: (customers.data as CustomerRow[]) ?? [],
          messages: (messages.data as MessageRow[]) ?? [],
          campaigns: (campaigns.data as CampaignRow[]) ?? [],
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

  const hasAny =
    results.leads.length + results.customers.length + results.messages.length + results.campaigns.length > 0;

  const pages = useMemo(
    () =>
      [
        { label: "Dashboard", icon: LayoutGrid, to: "/crm" as const },
        { label: "Leads / Requests", icon: Users, to: "/crm/leads" as const },
        { label: "Conversations", icon: MessageSquare, to: "/crm/conversations" as const },
        { label: "Customers", icon: ContactRound, to: "/crm/customers" as const },
        { label: "Marketing", icon: Megaphone, to: "/crm/marketing" as const },
        { label: "Reports", icon: BarChart3, to: "/crm/reports" as const },
        { label: "Reviews", icon: Star, to: "/crm/reviews" as const },
        { label: "Settings", icon: Settings, to: "/crm/settings" as const },
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
          placeholder="Search leads, customers, messages, campaigns…"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#FFD200]" />
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

        {results.leads.length > 0 && (
          <CommandGroup heading="Leads / Requests">
            {results.leads.map((l) => (
              <CommandItem
                key={`lead-${l.id}`}
                value={`lead-${l.id}-${l.reference}-${l.name ?? ""}`}
                onSelect={() => go(() => navigate({ to: "/crm/leads/$id", params: { id: l.id } }))}
              >
                <Users className="h-4 w-4 text-[#FFD200]" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate text-sm font-medium">
                    <Highlight text={l.name || "Unnamed lead"} q={debounced} />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    <Highlight text={l.reference} q={debounced} />
                    {l.service ? <> · <Highlight text={l.service} q={debounced} /></> : null}
                  </span>
                </div>
                {l.status && (
                  <span
                    className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                      STATUS_COLORS[l.status] || "bg-white/5 text-white/70 border-white/10"
                    }`}
                  >
                    {l.status}
                  </span>
                )}
              </CommandItem>
            ))}
            <CommandItem
              value={`view-all-leads`}
              onSelect={() => go(() => navigate({ to: "/crm/leads" }))}
              className="text-xs text-[#FFD200]"
            >
              <ArrowRight className="h-3.5 w-3.5" /> View all in Leads
            </CommandItem>
          </CommandGroup>
        )}

        {results.customers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Customers">
              {results.customers.map((c) => (
                <CommandItem
                  key={`cust-${c.id}`}
                  value={`cust-${c.id}-${c.name}`}
                  onSelect={() => go(() => navigate({ to: "/crm/customers" }))}
                >
                  <ContactRound className="h-4 w-4 text-[#FFD200]" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">
                      <Highlight text={c.name} q={debounced} />
                    </span>
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {[c.type, c.region].filter(Boolean).join(" · ") || "Customer"}
                    </span>
                  </div>
                </CommandItem>
              ))}
              <CommandItem
                value="view-all-customers"
                onSelect={() => go(() => navigate({ to: "/crm/customers" }))}
                className="text-xs text-[#FFD200]"
              >
                <ArrowRight className="h-3.5 w-3.5" /> View all in Customers
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {results.messages.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Messages">
              {results.messages.map((m) => (
                <CommandItem
                  key={`msg-${m.id}`}
                  value={`msg-${m.id}-${m.reference ?? ""}-${m.name}`}
                  onSelect={() => go(() => navigate({ to: "/crm/conversations" }))}
                >
                  <MessageSquare className="h-4 w-4 text-[#FFD200]" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">
                      <Highlight text={m.subject || "(no subject)"} q={debounced} />
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      <Highlight text={m.name} q={debounced} />
                      {m.reference ? <> · <Highlight text={m.reference} q={debounced} /></> : null}
                    </span>
                  </div>
                </CommandItem>
              ))}
              <CommandItem
                value="view-all-messages"
                onSelect={() => go(() => navigate({ to: "/crm/conversations" }))}
                className="text-xs text-[#FFD200]"
              >
                <ArrowRight className="h-3.5 w-3.5" /> View all in Conversations
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {results.campaigns.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Campaigns">
              {results.campaigns.map((c) => (
                <CommandItem
                  key={`camp-${c.id}`}
                  value={`camp-${c.id}-${c.name}-${c.utm_campaign ?? ""}`}
                  onSelect={() => go(() => navigate({ to: "/crm/marketing" }))}
                >
                  <Megaphone className="h-4 w-4 text-[#FFD200]" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">
                      <Highlight text={c.name} q={debounced} />
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.channel ? <span className="capitalize">{c.channel.replace("_", " ")}</span> : null}
                      {c.utm_campaign ? <> · <Highlight text={c.utm_campaign} q={debounced} /></> : null}
                    </span>
                  </div>
                </CommandItem>
              ))}
              <CommandItem
                value="view-all-campaigns"
                onSelect={() => go(() => navigate({ to: "/crm/marketing" }))}
                className="text-xs text-[#FFD200]"
              >
                <ArrowRight className="h-3.5 w-3.5" /> View all in Marketing
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {filteredPages.length > 0 && (
          <>
            {hasAny && <CommandSeparator />}
            <CommandGroup heading="Pages">
              {filteredPages.map((p) => {
                const Icon = p.icon;
                return (
                  <CommandItem
                    key={p.to}
                    value={`page-${p.label}`}
                    onSelect={() => go(() => navigate({ to: p.to }), p.label)}
                  >
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
              <CommandItem
                value="action-new-campaign"
                onSelect={() => go(() => navigate({ to: "/crm/marketing" }), "New campaign")}
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span>New campaign</span>
              </CommandItem>
              <CommandItem
                value="action-import-customers"
                onSelect={() => go(() => navigate({ to: "/crm/customers" }), "Import customers")}
              >
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span>Import customers</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {!debounced && recent.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            <Search className="mx-auto mb-2 h-5 w-5 opacity-50" />
            Search leads, customers, messages, campaigns, or pages.
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
