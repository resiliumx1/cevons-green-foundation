import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Filter, Plus, Download, ChevronDown, ArrowUpDown, Eye, Pencil, MoreHorizontal,
  X, MessageSquarePlus, ChevronLeft, ChevronRight, Trash2, UserPlus, Tag,
} from "lucide-react";

export const Route = createFileRoute("/crm/leads")({
  component: LeadsLayout,
});

function LeadsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/crm/leads") return <Outlet />;
  return <LeadsList />;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

type Status =
  | "New" | "Contacted" | "Details Needed" | "Quote Needed"
  | "Quote Sent" | "Scheduled" | "Specialist Review" | "Completed";

type Priority = "High" | "Medium" | "Low";

const statusStyles: Record<Status, string> = {
  "New": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "Contacted": "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  "Details Needed": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Quote Needed": "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  "Quote Sent": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Scheduled": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Specialist Review": "bg-[#E31B23]/15 text-red-400 border-[#E31B23]/30",
  "Completed": "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
};

const priorityStyles: Record<Priority, string> = {
  High: "bg-[#E31B23]/15 text-red-400 border-[#E31B23]/30",
  Medium: "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  Low: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

type Lead = {
  id: string; customer: string; service: string; source: string;
  priority: Priority; status: Status; assigned: string; region: string; date: string;
};

const leads: Lead[] = [
  { id: "CEV-1245", customer: "ABC Holdings", service: "Dumpster Rental", source: "Website", priority: "High", status: "Contacted", assigned: "Romina S.", region: "Georgetown", date: "May 15" },
  { id: "CEV-1244", customer: "John Persaud", service: "Septic Tank", source: "WhatsApp", priority: "Medium", status: "New", assigned: "A. Singh", region: "Berbice", date: "May 15" },
  { id: "CEV-1243", customer: "R&R Manufacturing", service: "Waste Oil Disposal", source: "Google Ads", priority: "High", status: "Specialist Review", assigned: "K. Ali", region: "Georgetown", date: "May 15" },
  { id: "CEV-1242", customer: "Ministry of Public Works", service: "Wastewater Treatment", source: "Referral", priority: "High", status: "Quote Needed", assigned: "R. Brown", region: "Linden", date: "May 14" },
  { id: "CEV-1241", customer: "Ocean View Resort", service: "Portable Toilet", source: "Website", priority: "Medium", status: "Scheduled", assigned: "T. James", region: "Georgetown", date: "May 14" },
  { id: "CEV-1240", customer: "Guyana Builders Inc.", service: "Skip Bin Rental", source: "Phone", priority: "Medium", status: "Quote Sent", assigned: "M. Singh", region: "Linden", date: "May 13" },
  { id: "CEV-1239", customer: "GreenMart", service: "Document Shredding", source: "Facebook", priority: "Low", status: "Completed", assigned: "A. Singh", region: "Georgetown", date: "May 13" },
  { id: "CEV-1238", customer: "AutoCare Garage", service: "Lube Oil Disposal", source: "Website", priority: "High", status: "Details Needed", assigned: "K. Ali", region: "Berbice", date: "May 13" },
];

const TABS = ["All", "New", "Contacted", "Details Needed", "Quote Needed", "Quote Sent", "Scheduled", "Specialist Review", "Completed"] as const;
type Tab = typeof TABS[number];

/* ------------------------------------------------------------------ */
/* UI bits                                                             */
/* ------------------------------------------------------------------ */

function SelectBtn({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#101820] border border-white/[0.08] text-slate-200 hover:border-white/20">
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
    </button>
  );
}

function SortableTh({ label }: { label: string }) {
  return (
    <th className="px-3 py-3 font-medium">
      <button className="inline-flex items-center gap-1 hover:text-white">
        {label}
        <ArrowUpDown className="h-3 w-3 opacity-60" />
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${statusStyles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold ${priorityStyles[p]}`}>
      {p}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-6 w-6 rounded-full bg-emerald-700/60 grid place-items-center text-[10px] font-semibold text-white">{initials}</span>
      <span className="text-slate-200 text-sm">{name}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function LeadsList() {
  const [tab, setTab] = useState<Tab>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const visible = useMemo(() => tab === "All" ? leads : leads.filter((l) => l.status === tab), [tab]);
  const allChecked = visible.length > 0 && visible.every((l) => selected.has(l.id));
  const previewLead = leads.find((l) => l.id === previewId) ?? null;

  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) visible.forEach((l) => next.delete(l.id));
    else visible.forEach((l) => next.add(l.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-tight">Leads / Requests</h1>
          <p className="text-sm text-slate-400 mt-1">Manage customer inquiries, service requests, quotes, and follow-ups.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#101820] border border-white/[0.08] text-sm text-slate-200 hover:border-white/20">
            <Filter className="h-4 w-4 text-slate-400" /> Filters
          </button>
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#101820] border border-white/[0.08] text-sm text-slate-200 hover:border-white/20">
            <Download className="h-4 w-4 text-slate-400" /> Export
          </button>
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95">
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-3 md:p-4 animate-fade-in">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name, company, service, ID..."
              className="w-full rounded-lg bg-[#071111] border border-white/[0.08] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <SelectBtn label="All Pipelines" />
          <SelectBtn label="All Users" />
          <SelectBtn label="All Sources" />
          <SelectBtn label="All Status" />
          <SelectBtn label="Last 30 Days" />
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="inline-flex gap-1 p-1 bg-[#101820] border border-white/[0.08] rounded-lg">
          {TABS.map((t) => {
            const active = t === tab;
            const count = t === "All" ? leads.length : leads.filter((l) => l.status === t).length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  active ? "bg-[#FFD200] text-[#101820]" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
                <span className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-[#101820]/15" : "bg-white/5 text-slate-400"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-[#FFD200]/10 border border-[#FFD200]/30 rounded-lg px-4 py-2.5 animate-fade-in">
          <span className="text-sm text-[#FFD200] font-semibold">{selected.size} selected</span>
          <div className="h-4 w-px bg-[#FFD200]/30" />
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white"><UserPlus className="h-3.5 w-3.5" /> Assign</button>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white"><Tag className="h-3.5 w-3.5" /> Change Status</button>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white"><Download className="h-3.5 w-3.5" /> Export</button>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-slate-400 hover:text-white">Clear</button>
        </div>
      )}

      {/* Table (desktop) */}
      <div className="hidden md:block bg-[#101820] border border-white/[0.08] rounded-xl overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/[0.08]">
                <th className="pl-4 pr-2 py-3 w-10">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                </th>
                <SortableTh label="Lead ID" />
                <SortableTh label="Customer" />
                <SortableTh label="Service" />
                <SortableTh label="Source" />
                <SortableTh label="Priority" />
                <SortableTh label="Status" />
                <SortableTh label="Assigned To" />
                <SortableTh label="Region" />
                <SortableTh label="Date" />
                <th className="px-3 py-3 font-medium text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((l) => {
                const isSelected = selected.has(l.id);
                const isPreview = previewId === l.id;
                return (
                  <tr
                    key={l.id}
                    onClick={() => setPreviewId(l.id)}
                    className={`border-b border-white/[0.05] last:border-0 cursor-pointer transition-colors ${
                      isPreview ? "bg-emerald-500/[0.04]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="pl-4 pr-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(l.id)} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                    </td>
                    <td className="px-3 py-3">
                      <Link to="/crm/leads/$id" params={{ id: l.id }} className="font-mono text-xs text-[#FFD200] hover:underline" onClick={(e) => e.stopPropagation()}>{l.id}</Link>
                    </td>
                    <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{l.customer}</td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{l.service}</td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{l.source}</td>
                    <td className="px-3 py-3"><PriorityBadge p={l.priority} /></td>
                    <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                    <td className="px-3 py-3 whitespace-nowrap"><Avatar name={l.assigned} /></td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{l.region}</td>
                    <td className="px-3 py-3 text-slate-400 whitespace-nowrap">{l.date}</td>
                    <td className="px-3 py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link to="/crm/leads/$id" params={{ id: l.id }} className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10 text-slate-300" aria-label="View"><Eye className="h-3.5 w-3.5" /></Link>
                        <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10 text-slate-300" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-white/10 text-slate-300" aria-label="More"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.08] text-xs text-slate-400">
          <span>Showing <span className="text-white font-semibold">1–{visible.length}</span> of <span className="text-white font-semibold">{leads.length}</span> leads</span>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 grid place-items-center rounded-md border border-white/10 hover:bg-white/5 text-slate-300 disabled:opacity-40" disabled><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="h-7 w-7 grid place-items-center rounded-md bg-[#FFD200] text-[#101820] font-semibold">1</button>
            <button className="h-7 w-7 grid place-items-center rounded-md border border-white/10 hover:bg-white/5 text-slate-300">2</button>
            <button className="h-7 w-7 grid place-items-center rounded-md border border-white/10 hover:bg-white/5 text-slate-300">3</button>
            <button className="h-7 w-7 grid place-items-center rounded-md border border-white/10 hover:bg-white/5 text-slate-300"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {visible.map((l) => (
          <div key={l.id} className="bg-[#101820] border border-white/[0.08] rounded-xl p-4" onClick={() => setPreviewId(l.id)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link to="/crm/leads/$id" params={{ id: l.id }} className="font-mono text-[11px] text-[#FFD200]">{l.id}</Link>
                <p className="text-white font-semibold truncate mt-0.5">{l.customer}</p>
                <p className="text-xs text-slate-400 mt-0.5">{l.service} • {l.region}</p>
              </div>
              <PriorityBadge p={l.priority} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadge status={l.status} />
              <span className="text-[11px] text-slate-400">{l.date}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <Avatar name={l.assigned} />
              <span className="text-[11px] text-slate-400">{l.source}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Side preview drawer */}
      {previewLead && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPreviewId(null)} />
          <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#0a1414] border-l border-white/[0.08] z-50 shadow-2xl flex flex-col animate-[slide-in-right_0.25s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <div>
                <p className="font-mono text-[11px] text-[#FFD200]">{previewLead.id}</p>
                <h3 className="text-lg font-bold text-white mt-0.5">{previewLead.customer}</h3>
              </div>
              <button onClick={() => setPreviewId(null)} className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 text-slate-300" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <PreviewRow label="Service" value={previewLead.service} />
              <PreviewRow label="Status" value={<StatusBadge status={previewLead.status} />} />
              <PreviewRow label="Priority" value={<PriorityBadge p={previewLead.priority} />} />
              <PreviewRow label="Source" value={previewLead.source} />
              <PreviewRow label="Region" value={previewLead.region} />
              <PreviewRow label="Assigned To" value={<Avatar name={previewLead.assigned} />} />
              <div className="pt-2 border-t border-white/[0.08]">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Last Activity</p>
                <p className="text-sm text-slate-200">Contacted via WhatsApp · {previewLead.date}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Next Action</p>
                <p className="text-sm text-slate-200">Send quote within 24 hours</p>
              </div>
            </div>
            <div className="p-5 border-t border-white/[0.08] flex items-center gap-2">
              <Link
                to="/crm/leads/$id"
                params={{ id: previewLead.id }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95"
              >
                View Details
              </Link>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#101820] border border-white/[0.08] text-sm text-slate-200 hover:border-white/20">
                <MessageSquarePlus className="h-4 w-4" /> Add Note
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
}
