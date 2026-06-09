import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Filter, Plus, MapPin, Truck, Activity, CheckCircle2, AlertTriangle,
  ChevronDown, RefreshCw, Inbox, Eye,
} from "lucide-react";
import { CrmPage } from "@/components/motion/CrmMotion";
import { JobModal } from "@/components/crm/JobModal";
import {
  useJobs, useCustomersLite, useJobMutations,
  JOB_STATUSES, JOB_STATUS_LABEL, JOB_STATUS_STYLES,
  fmtDateTime, type Job, type JobStatus,
} from "@/lib/crm-jobs";

export const Route = createFileRoute("/crm/jobs")({
  head: () => ({ meta: [{ title: "Jobs | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: JobsPage,
});

function JobsPage() {
  const { data: jobs = [], isLoading, isError, refetch } = useJobs();
  const { data: customers = [] } = useCustomersLite();
  const { update } = useJobMutations();
  const customerMap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [editing, setEditing] = useState<Job | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const regions = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.region).filter(Boolean))).sort() as string[],
    [jobs],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (statusFilter && j.status !== statusFilter) return false;
      if (regionFilter && j.region !== regionFilter) return false;
      if (term) {
        const cust = j.customer_id ? customerMap[j.customer_id] ?? "" : "";
        const hay = [j.number, cust, j.service, j.assigned_to].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [jobs, search, statusFilter, regionFilter, customerMap]);

  const kpis = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return [
      { label: "Scheduled", value: jobs.filter((j) => j.status === "scheduled").length, icon: Truck, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
      { label: "In Progress", value: jobs.filter((j) => j.status === "in_progress").length, icon: Activity, tone: "text-purple-300", bg: "bg-purple-500/10" },
      {
        label: "Completed Today",
        value: jobs.filter((j) => j.status === "completed" && j.scheduled_start && new Date(j.scheduled_start) >= today && new Date(j.scheduled_start) < tomorrow).length,
        icon: CheckCircle2, tone: "text-white/70", bg: "bg-white/[0.05]",
      },
      { label: "Unassigned", value: jobs.filter((j) => !j.assigned_to && j.status !== "completed" && j.status !== "cancelled").length, icon: AlertTriangle, tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10" },
    ];
  }, [jobs]);

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Jobs</h1>
          <p className="mt-1 text-sm text-white/60">Track job and service execution status.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Create Job
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">{k.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white tabular-nums">{k.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.bg}`}>
                  <Icon className={`h-4 w-4 ${k.tone}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101820] p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ref, customer, service, crew..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
        <Select value={statusFilter} onChange={setStatusFilter} placeholder="All Status"
          options={JOB_STATUSES.map((s) => ({ value: s, label: JOB_STATUS_LABEL[s] }))} />
        <Select value={regionFilter} onChange={setRegionFilter} placeholder="All Regions"
          options={regions.map((r) => ({ value: r, label: r }))} />
        {(search || statusFilter || regionFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); setRegionFilter(""); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-white/60 hover:text-white">
            <Filter className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center text-sm text-white/60 animate-pulse">Loading jobs…</div>
      ) : isError ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
          <p className="text-sm font-semibold text-white">Couldn't load jobs</p>
          <button onClick={() => refetch()} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-12 text-center">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-white/40" />
          <p className="text-sm font-semibold text-white">No jobs match your filters</p>
          <p className="mt-1 text-xs text-white/60">Create a job or schedule a pending booking.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
                  <tr>{["Job", "Customer", "Service", "Region", "Scheduled", "Crew", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.map((j) => (
                    <tr key={j.id} onClick={() => setEditing(j)} className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{j.number}</td>
                      <td className="px-4 py-3 text-white">{j.customer_id ? customerMap[j.customer_id] ?? "—" : "—"}</td>
                      <td className="px-4 py-3 text-white/80">{j.service ?? "—"}</td>
                      <td className="px-4 py-3 text-white/70"><span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-white/40" />{j.region ?? "—"}</span></td>
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">{fmtDateTime(j.scheduled_start)}</td>
                      <td className="px-4 py-3 text-white/70">{j.assigned_to ?? <span className="text-white/40">Unassigned</span>}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select value={j.status} onChange={(e) => update.mutate({ id: j.id, patch: { status: e.target.value as JobStatus } })}
                          className={`appearance-none rounded-full border px-2 py-0.5 text-[11px] focus:outline-none ${JOB_STATUS_STYLES[j.status as JobStatus] ?? JOB_STATUS_STYLES.scheduled}`}>
                          {JOB_STATUSES.map((s) => <option key={s} value={s} className="bg-[#0a1414] text-white">{JOB_STATUS_LABEL[s]}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((j) => (
              <div key={j.id} onClick={() => setEditing(j)} className="cursor-pointer rounded-xl border border-white/[0.08] bg-[#101820] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#FFD200]">{j.number}</span>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${JOB_STATUS_STYLES[j.status as JobStatus] ?? JOB_STATUS_STYLES.scheduled}`}>{JOB_STATUS_LABEL[j.status as JobStatus] ?? j.status}</span>
                </div>
                <h3 className="mt-2 font-semibold text-white">{j.customer_id ? customerMap[j.customer_id] ?? "—" : "—"}</h3>
                <p className="text-sm text-white/70">{j.service ?? "—"}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/60">
                  <div><span className="text-white/40">When:</span> {fmtDateTime(j.scheduled_start)}</div>
                  <div><span className="text-white/40">Region:</span> {j.region ?? "—"}</div>
                  <div className="col-span-2"><span className="text-white/40">Crew:</span> {j.assigned_to ?? "Unassigned"}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {(showCreate || editing) && (
        <JobModal job={editing} onClose={() => { setShowCreate(false); setEditing(null); }} />
      )}
    </CrmPage>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-3 pr-8 text-sm text-white/80 hover:bg-white/[0.06] focus:outline-none">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
    </div>
  );
}
