import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Filter, Plus, Download, ChevronDown, ArrowUpDown, Eye, X,
  UserPlus, Tag, LayoutGrid, List as ListIcon, AlertTriangle, RefreshCw, Inbox,
  Check, CheckCheck, Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { PullToRefresh } from "@/components/admin/PullToRefresh";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/leads")({
  component: LeadsLayout,
});

function LeadsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/admin/leads") return <Outlet />;
  return <LeadsList />;
}

type Lead = Database["public"]["Tables"]["service_requests"]["Row"];

const STATUSES = ["new", "contacted", "quoted", "scheduled", "won", "lost"] as const;
type Status = typeof STATUSES[number];
type SortKey = "created_at" | "estimated_value" | "name" | "status";


const STATUS_LABEL: Record<Status, string> = {
  new: "New", contacted: "Contacted", quoted: "Quoted",
  scheduled: "Scheduled", won: "Won", lost: "Lost",
};

const STATUS_STYLES: Record<Status, string> = {
  new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  contacted: "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  quoted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  scheduled: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  won: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
  lost: "bg-red-500/15 text-red-400 border-red-500/30",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function sourceLabel(s: string | null) {
  if (!s || !s.trim()) return "Direct";
  return s.replace(/_/g, " ");
}

/* ------------------------------------------------------------------ */
/* Pipeline segments                                                   */
/* ------------------------------------------------------------------ */

const SEGMENTS = ["residential", "commercial", "industrial", "specialty"] as const;
type Segment = typeof SEGMENTS[number];
type SegmentFilter = Segment | "all";

const SEGMENT_LABEL: Record<Segment, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
  specialty: "Specialty",
};

const SEGMENT_DOT: Record<Segment, string> = {
  residential: "bg-emerald-400",
  commercial:  "bg-sky-400",
  industrial:  "bg-violet-400",
  specialty:   "bg-red-400",
};

const SPECIALTY_RE = /hazard|biohazard|waste\s*oil|contaminated\s*soil|tank\s*clean|product\s*destruction|wastewater|septic/i;
const INDUSTRIAL_RE = /industrial|refinery|mining|oil\s*&?\s*gas|plant|factory|manufactur/i;
const COMMERCIAL_RE = /commercial|business|office|retail|restaurant|hotel|facility|facilities|construction/i;
const RESIDENTIAL_RE = /residential|household|home|domestic|bulk\s*waste|yard|garbage\s*collection/i;

function classifySegment(l: Lead): Segment {
  const haystack = `${l.category ?? ""} ${l.service ?? ""} ${l.customer_type ?? ""}`.toLowerCase();
  if (SPECIALTY_RE.test(haystack)) return "specialty";
  const ct = (l.customer_type ?? "").toLowerCase();
  if (ct.includes("industrial") || INDUSTRIAL_RE.test(haystack)) return "industrial";
  if (ct.includes("commercial") || COMMERCIAL_RE.test(haystack)) return "commercial";
  if (ct.includes("residential") || RESIDENTIAL_RE.test(haystack)) return "residential";
  const cat = (l.category ?? "").toLowerCase();
  if (cat.includes("recycl") || cat.includes("facilit")) return "commercial";
  return "residential";
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

function useLeads() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`crm-leads-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => {
        qc.invalidateQueries({ queryKey: ["crm", "leads"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  return useQuery({
    queryKey: ["crm", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });
}

/* ------------------------------------------------------------------ */
/* UI atoms                                                            */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const s = (STATUSES as readonly string[]).includes(status) ? (status as Status) : "new";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${STATUS_STYLES[s]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABEL[s]}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-6 w-6 rounded-full bg-emerald-700/60 grid place-items-center text-[10px] font-semibold text-white">{initials}</span>
      <span className="text-slate-200 text-sm">{name}</span>
    </span>
  );
}

function SortBtn({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-white ${active ? "text-white" : ""}`}>
      {label}
      <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-50"}`} />
      {active && <span className="text-[10px]">{dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg bg-[#101820] border border-white/[0.08] text-slate-200 hover:border-white/20 focus:outline-none focus:border-emerald-500/50"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function LeadsList() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading, isError, refetch } = useLeads();

  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<Status | null>(null);
  const [exportState, setExportState] = useState<{
    status: "idle" | "working" | "done" | "error";
    progress: number;
    message: string;
  }>({ status: "idle", progress: 0, message: "" });


  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);


  const updateStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: Status }) => {
      const { error } = await supabase.from("service_requests").update({ status }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm", "leads"] }),
  });

  const regions = useMemo(
    () => Array.from(new Set(leads.map((l) => l.region).filter(Boolean))).sort() as string[],
    [leads],
  );
  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.utm_source ?? "").filter((s) => s !== ""))).sort(),
    [leads],
  );

  const [segment, setSegment] = useState<SegmentFilter>("all");

  const withSegments = useMemo(
    () => leads.map((l) => ({ lead: l, segment: classifySegment(l) })),
    [leads],
  );

  const segmentStats = useMemo(() => {
    const init = (): { count: number; value: number } => ({ count: 0, value: 0 });
    const stats: Record<SegmentFilter, { count: number; value: number }> = {
      all: init(), residential: init(), commercial: init(), industrial: init(), specialty: init(),
    };
    withSegments.forEach(({ lead, segment: seg }) => {
      const v = Number(lead.estimated_value ?? 0);
      stats.all.count++; stats.all.value += v;
      stats[seg].count++; stats[seg].value += v;
    });
    return stats;
  }, [withSegments]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const cutoff = dateFilter ? Date.now() - Number(dateFilter) * 24 * 60 * 60 * 1000 : 0;
    const filtered = withSegments.filter(({ lead: l, segment: seg }) => {
      if (segment !== "all" && seg !== segment) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      if (regionFilter && l.region !== regionFilter) return false;
      if (cutoff && new Date(l.created_at).getTime() < cutoff) return false;
      if (sourceFilter) {
        const s = l.utm_source && l.utm_source.trim() ? l.utm_source : "Direct";
        if (sourceFilter === "Direct" ? s !== "Direct" : s !== sourceFilter) return false;
      }
      if (term) {
        const hay = [l.name, l.email, l.phone, l.service, l.reference].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    }).map((x) => x.lead);
    const rank = (l: Lead) => {
      if (sortKey === "created_at") return new Date(l.created_at).getTime();
      if (sortKey === "estimated_value") return Number(l.estimated_value ?? 0);
      return 0;
    };
    filtered.sort((a, b) => {
      if (sortKey === "name") {
        const cmp = (a.name ?? "").localeCompare(b.name ?? "");
        return sortDir === "asc" ? cmp : -cmp;
      }
      if (sortKey === "status") {
        const order = (s: string) => STATUSES.indexOf(s as Status);
        const cmp = order(a.status) - order(b.status);
        return sortDir === "asc" ? cmp : -cmp;
      }
      return sortDir === "asc" ? rank(a) - rank(b) : rank(b) - rank(a);
    });
    return filtered;
  }, [withSegments, segment, search, statusFilter, regionFilter, sourceFilter, dateFilter, sortKey, sortDir]);

  const allChecked = visible.length > 0 && visible.every((l) => selected.has(l.id));
  const previewLead = leads.find((l) => l.id === previewId) ?? null;
  const filtersActive = !!(search || statusFilter || regionFilter || sourceFilter || dateFilter);

  const clearFilters = () => {
    setSearch(""); setStatusFilter(""); setRegionFilter(""); setSourceFilter(""); setDateFilter("");
  };

  const exportCsv = async (rows: Lead[], label: string) => {
    if (exportState.status === "working") return;
    if (rows.length === 0) {
      setExportState({ status: "error", progress: 0, message: "Nothing to export — no requests match the current filters." });
      toast.error("Nothing to export", { description: "No requests match the current filters." });
      return;
    }
    setExportState({ status: "working", progress: 0, message: `Preparing ${rows.length} ${label}…` });
    try {
      const cols: Array<keyof Lead> = [
        "reference", "created_at", "name", "email", "phone", "service", "category",
        "region", "status", "estimated_value", "utm_source", "message",
      ];
      const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
      const lines: string[] = [cols.join(",")];
      const CHUNK = 200;
      for (let i = 0; i < rows.length; i += CHUNK) {
        rows.slice(i, i + CHUNK).forEach((r) => lines.push(cols.map((c) => cell(r[c])).join(",")));
        const pct = Math.min(99, Math.round(((i + CHUNK) / rows.length) * 100));
        setExportState({ status: "working", progress: pct, message: `Building CSV… ${pct}%` });
        // yield so the progress bar can paint on large exports
        await new Promise((res) => setTimeout(res, 0));
      }
      const csv = lines.join("\r\n");
      const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
      const fileName = `cevons-requests-${new Date().toISOString().slice(0, 10)}.csv`;
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setExportState({
        status: "done",
        progress: 100,
        message: `Exported ${rows.length} ${label} to ${fileName}.`,
      });
      toast.success(`Exported ${rows.length} ${label}`, { description: fileName });
      window.setTimeout(() => setExportState((s) => (s.status === "done" ? { status: "idle", progress: 0, message: "" } : s)), 6000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The export could not be created.";
      setExportState({ status: "error", progress: 0, message: `Export failed. ${message}` });
      toast.error("Export failed", { description: message });
    }
  };


  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) visible.forEach((l) => next.delete(l.id));
    else visible.forEach((l) => next.add(l.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const setSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };


  return (
    <PullToRefresh onRefresh={refresh}>
    <CrmPage className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-tight">Requests</h1>
          <p className="text-sm text-slate-400 mt-1">Manage customer inquiries, service requests, quotes, and follow-ups.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 bg-[#101820] border border-white/[0.08] rounded-lg">
            <button onClick={() => setView("list")} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${view === "list" ? "bg-[#EF7700] text-white" : "text-slate-300 hover:text-white"}`}>
              <ListIcon className="h-3.5 w-3.5" /> List
            </button>
            <button onClick={() => setView("kanban")} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${view === "kanban" ? "bg-[#EF7700] text-white" : "text-slate-300 hover:text-white"}`}>
              <LayoutGrid className="h-3.5 w-3.5" /> Pipeline
            </button>
          </div>
          <button
            onClick={() =>
              exportCsv(
                selected.size > 0 ? visible.filter((l) => selected.has(l.id)) : visible,
                selected.size > 0 ? "selected requests" : "filtered requests",
              )
            }
            disabled={visible.length === 0 || exportState.status === "working"}
            aria-busy={exportState.status === "working"}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#101820] border border-white/[0.08] text-sm text-slate-200 hover:border-white/20 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1414]"
          >
            {exportState.status === "working"
              ? <Loader2 className="h-4 w-4 animate-spin text-[#FFD200]" />
              : <Download className="h-4 w-4 text-slate-400" />}
            {exportState.status === "working"
              ? "Exporting…"
              : `Export ${selected.size > 0 ? `${selected.size} selected` : "CSV"}`}
          </button>


          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95">
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* CSV export status */}
      <div aria-live="polite" role="status" className={exportState.status === "idle" ? "sr-only" : ""}>
        {exportState.status !== "idle" && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              exportState.status === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : exportState.status === "done"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-white/[0.08] bg-[#101820] text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {exportState.status === "working" && <Loader2 className="h-4 w-4 animate-spin text-[#FFD200]" />}
              {exportState.status === "done" && <Check className="h-4 w-4" />}
              {exportState.status === "error" && <AlertTriangle className="h-4 w-4" />}
              <span>{exportState.message}</span>
              {exportState.status !== "working" && (
                <button
                  onClick={() => setExportState({ status: "idle", progress: 0, message: "" })}
                  aria-label="Dismiss export message"
                  className="ml-auto rounded p-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {exportState.status === "working" && (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={exportState.progress}
                aria-label="CSV export progress"
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
              >
                <div className="h-full rounded-full bg-[#FFD200] transition-[width] duration-200" style={{ width: `${exportState.progress}%` }} />
              </div>
            )}
          </div>
        )}
      </div>



      {/* Pipeline segment tabs */}
      <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-2 animate-fade-in">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...SEGMENTS] as SegmentFilter[]).map((seg) => {
            const active = segment === seg;
            const stats = segmentStats[seg];
            const label = seg === "all" ? "All Pipelines" : SEGMENT_LABEL[seg];
            const dot = seg === "all" ? "bg-[#FFD200]" : SEGMENT_DOT[seg];
            return (
              <button
                key={seg}
                onClick={() => setSegment(seg)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors ${
                  active
                    ? "bg-white/[0.04] border-[#FFD200]/40 text-white"
                    : "bg-transparent border-white/[0.06] text-slate-300 hover:bg-white/[0.03] hover:border-white/[0.12]"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded tabular-nums ${active ? "bg-[#FFD200]/15 text-[#FFD200]" : "bg-white/5 text-slate-400"}`}>
                  {stats.count}
                </span>
                {stats.value > 0 && (
                  <span className="text-[10px] text-emerald-400 font-semibold tabular-nums hidden sm:inline">
                    ${stats.value >= 1000 ? `${Math.round(stats.value / 100) / 10}k` : stats.value.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-3 md:p-4 animate-fade-in">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, service, ref..."
              className="w-full rounded-lg bg-[#071111] border border-white/[0.08] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All Status"
            options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
          <Select value={regionFilter} onChange={setRegionFilter} placeholder="All Regions"
            options={regions.map((r) => ({ value: r, label: r }))} />
          <Select value={sourceFilter} onChange={setSourceFilter} placeholder="All Sources"
            options={[{ value: "Direct", label: "Direct" }, ...sources.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))]} />
          <Select value={dateFilter} onChange={setDateFilter} placeholder="Any date"
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
            ]} />
          <Select value={sortKey} onChange={(v) => setSortKey(v as SortKey)} placeholder="Sort by date"
            options={[
              { value: "created_at", label: "Sort: date" },
              { value: "estimated_value", label: "Sort: value" },
              { value: "name", label: "Sort: name" },
              { value: "status", label: "Sort: status" },
            ]} />
          <button
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#101820] border border-white/[0.08] text-xs font-semibold text-slate-200 hover:border-white/20"
            aria-label={sortDir === "asc" ? "Sort descending" : "Sort ascending"}
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> {sortDir === "asc" ? "Ascending" : "Descending"}
          </button>
          {filtersActive && (
            <button onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white">
              <Filter className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>


      {/* Bulk actions (desktop) */}
      {selected.size > 0 && (
        <div className="hidden lg:flex flex-wrap items-center gap-3 bg-[#FFD200]/10 border border-[#FFD200]/30 rounded-lg px-4 py-2.5 animate-fade-in">
          <span className="text-sm text-[#FFD200] font-semibold">{selected.size} selected</span>
          <div className="h-4 w-px bg-[#FFD200]/30" />
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-200">
            <Tag className="h-3.5 w-3.5" />
            <span>Change status:</span>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => updateStatus.mutate({ ids: Array.from(selected), status: s })}
                disabled={updateStatus.isPending}
                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[11px] font-medium">
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-slate-400 hover:text-white">Clear</button>
        </div>
      )}

      {/* Body */}
      {isLoading ? (
        <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-4" aria-busy="true">
          <span className="sr-only">Loading requests…</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-white/[0.05] py-3 last:border-0">
              <div className="h-4 w-4 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
              <div className="h-3 flex-1 rounded bg-white/[0.07] animate-pulse" />
              <div className="h-5 w-16 rounded-md bg-white/10 animate-pulse" />
              <div className="h-3 w-14 rounded bg-white/[0.07] animate-pulse" />
            </div>
          ))}
        </div>

      ) : isError ? (
        <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-8 text-center">
          <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-white font-semibold">Couldn't load leads</p>
          <button onClick={() => refetch()} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-12 text-center">
          <Inbox className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-white font-semibold">
            {filtersActive || segment !== "all" ? "No requests match these filters" : "No service requests yet"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {filtersActive || segment !== "all"
              ? "Widen the date range, clear a filter, or search a different term."
              : "Bookings from the request wizard on the public site land here automatically."}
          </p>
          {(filtersActive || segment !== "all") && (
            <button
              onClick={() => { clearFilters(); setSegment("all"); }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/5"
            >
              <Filter className="h-3.5 w-3.5" /> Clear all filters
            </button>
          )}
        </div>

      ) : view === "kanban" ? (
        <KanbanBoard leads={visible} onDrop={(id, status) => updateStatus.mutate({ ids: [id], status })} onOpen={setPreviewId} />
      ) : (
        <>
          {/* Table (desktop) */}
          <div className="hidden lg:block bg-[#101820] border border-white/[0.08] rounded-xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/[0.08]">
                    <th className="pl-4 pr-2 py-3 w-10">
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                    </th>
                    <th className="px-3 py-3 font-medium">Ref</th>
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">Service</th>
                    <th className="px-3 py-3 font-medium">Region</th>
                    <th className="px-3 py-3 font-medium">Source</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium"><SortBtn label="Value" active={sortKey === "estimated_value"} dir={sortDir} onClick={() => setSort("estimated_value")} /></th>
                    <th className="px-3 py-3 font-medium"><SortBtn label="Date" active={sortKey === "created_at"} dir={sortDir} onClick={() => setSort("created_at")} /></th>
                    <th className="px-3 py-3 font-medium text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((l) => {
                    const isSelected = selected.has(l.id);
                    const isPreview = previewId === l.id;
                    const isSpecialist = !!(l.service && /hazard|biohazard|waste oil|tank|septic|industrial|wastewater/i.test(l.service));
                    return (
                      <tr key={l.id} onClick={() => setPreviewId(l.id)}
                        className={`border-b border-white/[0.05] last:border-0 cursor-pointer transition-colors ${isPreview ? "bg-emerald-500/[0.04]" : "hover:bg-white/[0.02]"}`}>
                        <td className="pl-4 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleOne(l.id)} aria-label={`Select ${l.reference ?? "request"}`} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Link to="/admin/leads/$id" params={{ id: l.id }} className="font-mono text-xs text-[#FFD200] hover:underline whitespace-nowrap" onClick={(e) => e.stopPropagation()}>{l.reference}</Link>
                        </td>
                        <td className="px-3 py-3 text-white font-medium whitespace-nowrap">
                          {l.name ?? "—"}
                          {isSpecialist && <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E31B23]/15 text-red-400 border border-[#E31B23]/30">SPECIALIST</span>}
                        </td>
                        <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{l.service ?? "—"}</td>
                        <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{l.region ?? "—"}</td>
                        <td className="px-3 py-3 text-slate-300 whitespace-nowrap capitalize">{sourceLabel(l.utm_source)}</td>
                        <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                        <td className="px-3 py-3 text-slate-300 whitespace-nowrap tabular-nums">{l.estimated_value ? `$${Number(l.estimated_value).toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-3 text-slate-400 whitespace-nowrap">{fmtDate(l.created_at)}</td>
                        <td className="px-3 py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                          <Link to="/admin/leads/$id" params={{ id: l.id }} className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 text-slate-300" aria-label="View">
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-white/[0.08] text-xs text-slate-400">
              Showing <span className="text-white font-semibold">{visible.length}</span> of <span className="text-white font-semibold">{leads.length}</span> leads
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3 pb-24">
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>Swipe a card right, or long-press, to select it.</span>
              <button
                onClick={toggleAll}
                className="inline-flex items-center gap-1 font-semibold text-slate-300"
              >
                <CheckCheck className="h-3.5 w-3.5" /> {allChecked ? "Clear all" : "Select all"}
              </button>
            </div>
            {visible.map((l) => (
              <SwipeSelectCard
                key={l.id}
                lead={l}
                selected={selected.has(l.id)}
                selectMode={selected.size > 0}
                onToggle={() => toggleOne(l.id)}
                onOpen={() => setPreviewId(l.id)}
              />
            ))}
          </div>

          {/* Mobile bulk bar */}
          {selected.size > 0 && (
            <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#FFD200]/30 bg-[#0a1414]/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
              <button onClick={() => setSelected(new Set())} className="text-xs font-semibold text-slate-400">
                Clear
              </button>
              <span className="text-sm font-semibold text-[#FFD200]">{selected.size} selected</span>
              <button
                onClick={() => setSheetOpen(true)}
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-4 py-2.5 text-sm font-semibold text-[#101820]"
              >
                <Tag className="h-4 w-4" /> Actions
              </button>
            </div>
          )}
        </>
      )}

      {/* Side preview drawer */}
      {previewLead && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPreviewId(null)} />
          <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#0a1414] border-l border-white/[0.08] z-50 shadow-2xl flex flex-col animate-[slide-in-right_0.25s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <div>
                <p className="font-mono text-[11px] text-[#FFD200]">{previewLead.reference}</p>
                <h3 className="text-lg font-bold text-white mt-0.5">{previewLead.name ?? "—"}</h3>
              </div>
              <button onClick={() => setPreviewId(null)} className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 text-slate-300" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <PreviewRow label="Service" value={previewLead.service ?? "—"} />
              <PreviewRow label="Status" value={<StatusBadge status={previewLead.status} />} />
              <PreviewRow label="Region" value={previewLead.region ?? "—"} />
              <PreviewRow label="Source" value={<span className="capitalize">{sourceLabel(previewLead.utm_source)}</span>} />
              <PreviewRow label="Phone" value={previewLead.phone ?? "—"} />
              <PreviewRow label="Email" value={previewLead.email ?? "—"} />
              <PreviewRow label="Value" value={previewLead.estimated_value ? `$${Number(previewLead.estimated_value).toLocaleString()}` : "—"} />
              <PreviewRow label="Assigned" value={previewLead.assigned_to ? <Avatar name={previewLead.assigned_to} /> : "Unassigned"} />
              <PreviewRow label="Created" value={new Date(previewLead.created_at).toLocaleString()} />
              {previewLead.message && (
                <div className="pt-3 border-t border-white/[0.08]">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Message</p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{previewLead.message}</p>
                </div>
              )}
              <div className="pt-3 border-t border-white/[0.08]">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Quick status change</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => updateStatus.mutate({ ids: [previewLead.id], status: s })}
                      disabled={updateStatus.isPending || previewLead.status === s}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${previewLead.status === s ? STATUS_STYLES[s] : "border-white/10 text-slate-300 hover:bg-white/5"}`}>
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/[0.08]">
              <Link to="/admin/leads/$id" params={{ id: previewLead.id }}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95">
                View Full Details
              </Link>
            </div>
          </aside>
        </>
      )}

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} />}

      {sheetOpen && (
        <BulkActionSheet
          count={selected.size}
          pending={updateStatus.isPending}
          confirmStatus={confirmStatus}
          onPick={setConfirmStatus}
          onCancel={() => { setConfirmStatus(null); setSheetOpen(false); }}
          onConfirm={async () => {
            if (!confirmStatus) return;
            await updateStatus.mutateAsync({ ids: Array.from(selected), status: confirmStatus });
            setConfirmStatus(null);
            setSheetOpen(false);
            setSelected(new Set());
          }}
          onExport={() => {
            void exportCsv(visible.filter((l) => selected.has(l.id)), "selected requests");
            setSheetOpen(false);
          }}
        />
      )}
    </CrmPage>
    </PullToRefresh>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile swipe-to-select card                                         */
/* ------------------------------------------------------------------ */

function SwipeSelectCard({
  lead: l, selected, selectMode, onToggle, onOpen,
}: {
  lead: Lead; selected: boolean; selectMode: boolean; onToggle: () => void; onOpen: () => void;
}) {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  const clearLongPress = () => {
    if (longPress.current) { clearTimeout(longPress.current); longPress.current = null; }
  };

  const label = `${l.reference ?? "Request"} — ${l.name ?? "Unnamed"}, ${l.service ?? "no service"}, ${l.region ?? "no region"}`;

  return (
    <li className="relative overflow-hidden rounded-xl list-none">
      <div
        className="absolute inset-y-0 left-0 flex w-24 items-center pl-4"
        style={{ background: selected ? "rgba(239,68,68,0.15)" : "rgba(255,210,0,0.15)" }}
        aria-hidden
      >
        <Check className="h-5 w-5" style={{ color: selected ? "#f87171" : "#FFD200" }} />
      </div>
      <div
        onTouchStart={(e) => {
          fired.current = false;
          start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          clearLongPress();
          longPress.current = setTimeout(() => {
            fired.current = true;
            if (navigator.vibrate) navigator.vibrate(10);
            onToggle();
          }, 480);
        }}
        onTouchMove={(e) => {
          if (!start.current) return;
          const mx = e.touches[0].clientX - start.current.x;
          const my = e.touches[0].clientY - start.current.y;
          if (Math.abs(my) > 12 || Math.abs(mx) > 8) clearLongPress();
          if (!swiping.current && Math.abs(mx) > Math.abs(my) && mx > 10) swiping.current = true;
          if (swiping.current) setDx(Math.max(0, Math.min(96, mx)));
        }}
        onTouchEnd={() => {
          clearLongPress();
          if (swiping.current) {
            if (dx > 64) {
              fired.current = true;
              if (navigator.vibrate) navigator.vibrate(8);
              onToggle();
            }
            swiping.current = false;
            setDx(0);
          }
          start.current = null;
        }}
        className={`relative bg-[#101820] border rounded-xl p-4 focus-within:ring-2 focus-within:ring-[#FFD200] focus-within:ring-offset-2 focus-within:ring-offset-[#0a1414] ${selected ? "border-[#FFD200]/60" : "border-white/[0.08]"}`}
        style={{ transform: `translateX(${dx}px)`, transition: dx === 0 ? "transform 180ms ease" : "none" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${label}`}
              className="relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-md border-white/25 bg-white/5 accent-[#FFD200] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            />
            <div className="relative z-10 min-w-0">
              <Link
                to="/admin/leads/$id"
                params={{ id: l.id }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 font-mono text-[11px] text-[#FFD200] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200]"
              >
                {l.reference}
              </Link>
              <p className="text-white font-semibold truncate mt-0.5">{l.name ?? "—"}</p>
              <p className="text-xs text-slate-400 mt-0.5">{l.service ?? "—"} • {l.region ?? "—"}</p>
            </div>
          </div>
          <StatusBadge status={l.status} />
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-slate-400 capitalize">{sourceLabel(l.utm_source)}</span>
          <span className="text-slate-400">{fmtDate(l.created_at)}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (fired.current) { fired.current = false; return; }
            if (selectMode) onToggle();
            else onOpen();
          }}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); onToggle(); }
          }}
          aria-label={`Open ${label}`}
          className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD200] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1414]"
        />
      </div>
    </li>
  );
}


/* ------------------------------------------------------------------ */
/* Mobile bulk action bottom sheet                                     */
/* ------------------------------------------------------------------ */

function BulkActionSheet({
  count, pending, confirmStatus, onPick, onCancel, onConfirm, onExport,
}: {
  count: number;
  pending: boolean;
  confirmStatus: Status | null;
  onPick: (s: Status) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onExport: () => void;
}) {
  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bulk actions"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/[0.08] bg-[#0a1414] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-[slide-in-right_0.2s_ease-out]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        {confirmStatus ? (
          <>
            <h3 className="text-base font-bold text-white">
              Mark {count} request{count === 1 ? "" : "s"} as {STATUS_LABEL[confirmStatus]}?
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              This updates the status for every selected request. You can change it again at any time.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={onCancel}
                disabled={pending}
                className="rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFD200] px-4 py-3 text-sm font-semibold text-[#101820] disabled:opacity-60"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pending ? "Updating…" : "Confirm"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base font-bold text-white">{count} selected</h3>
            <p className="mt-1 text-sm text-slate-400">Choose a new status, or export the selection.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onPick(s)}
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold ${STATUS_STYLES[s]}`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
            <button
              onClick={onExport}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200"
            >
              <Download className="h-4 w-4" /> Export selected as CSV
            </button>
            <button onClick={onCancel} className="mt-2 w-full px-4 py-3 text-sm font-semibold text-slate-400">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}


function PreviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm text-slate-200 text-right">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kanban                                                              */
/* ------------------------------------------------------------------ */

function KanbanBoard({ leads, onDrop, onOpen }: { leads: Lead[]; onDrop: (id: string, status: Status) => void; onOpen: (id: string) => void }) {
  const [overCol, setOverCol] = useState<Status | null>(null);
  const grouped = useMemo(() => {
    const m: Record<Status, Lead[]> = { new: [], contacted: [], quoted: [], scheduled: [], won: [], lost: [] };
    leads.forEach((l) => {
      const s = (STATUSES as readonly string[]).includes(l.status) ? (l.status as Status) : "new";
      m[s].push(l);
    });
    return m;
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 animate-fade-in">
      {STATUSES.map((col) => (
        <div key={col}
          onDragOver={(e) => { e.preventDefault(); setOverCol(col); }}
          onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            setOverCol(null);
            if (id) onDrop(id, col);
          }}
          className={`bg-[#0a1414] border rounded-xl p-2 flex flex-col min-h-[300px] ${overCol === col ? "border-[#FFD200]/60 bg-[#FFD200]/[0.03]" : "border-white/[0.08]"}`}
        >
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-xs font-semibold text-white">{STATUS_LABEL[col]}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 tabular-nums">{grouped[col].length}</span>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[60vh]">
            {grouped[col].map((l) => (
              <div key={l.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", l.id)}
                onClick={() => onOpen(l.id)}
                className="bg-[#101820] border border-white/[0.08] rounded-lg p-3 cursor-grab hover:border-white/20 transition-colors active:cursor-grabbing"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#FFD200]">{l.reference}</span>
                  {l.estimated_value && <span className="text-[10px] text-emerald-400 font-semibold">${Number(l.estimated_value).toLocaleString()}</span>}
                </div>
                <p className="text-sm text-white font-medium mt-1 truncate">{l.name ?? "—"}</p>
                <p className="text-[11px] text-slate-400 truncate">{l.service ?? "—"}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="capitalize">{sourceLabel(l.utm_source)}</span>
                  <span>{fmtDate(l.created_at)}</span>
                </div>
              </div>
            ))}
            {grouped[col].length === 0 && (
              <div className="text-center text-[11px] text-slate-500 py-6">Drag leads here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add Lead modal                                                      */
/* ------------------------------------------------------------------ */

function AddLeadModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", region: "", message: "", estimated_value: "" });
  const [err, setErr] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.phone.trim()) throw new Error("Name and phone are required");
      const { error } = await supabase.from("service_requests").insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        service: form.service.trim() || null,
        region: form.region.trim() || null,
        message: form.message.trim() || null,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
        utm_source: "manual",
        status: "new",
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crm", "leads"] }); onClose(); },
    onError: (e: Error) => setErr(e.message),
  });

  const field = (key: keyof typeof form, label: string, type = "text", textarea = false) => (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-slate-400">{label}</span>
      {textarea ? (
        <textarea value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} rows={3}
          className="mt-1 w-full rounded-lg bg-[#071111] border border-white/[0.08] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50" />
      ) : (
        <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} type={type}
          className="mt-1 w-full rounded-lg bg-[#071111] border border-white/[0.08] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50" />
      )}
    </label>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#0a1414] border border-white/[0.08] rounded-xl w-full max-w-md pointer-events-auto shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Add Manual Lead</h3>
            </div>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 text-slate-300"><X className="h-4 w-4" /></button>
          </div>
          <div className="p-5 space-y-3">
            {field("name", "Name *")}
            <div className="grid grid-cols-2 gap-3">
              {field("phone", "Phone *", "tel")}
              {field("email", "Email", "email")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("service", "Service")}
              {field("region", "Region")}
            </div>
            {field("estimated_value", "Estimated Value ($)", "number")}
            {field("message", "Notes", "text", true)}
            {err && <p className="text-xs text-red-400">{err}</p>}
          </div>
          <div className="p-5 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancel</button>
            <button onClick={() => create.mutate()} disabled={create.isPending}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95 disabled:opacity-60">
              <Plus className="h-4 w-4" /> {create.isPending ? "Creating…" : "Create Lead"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
