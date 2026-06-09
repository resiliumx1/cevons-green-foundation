import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, MapPin, Truck, Activity, CheckCircle2, AlertTriangle } from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
export const Route = createFileRoute("/crm/jobs")({
  head: () => ({ meta: [{ title: "Jobs | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: JobsPage,
});

type Status = "Dispatch Ready" | "In Progress" | "Completed" | "Delayed" | "Needs Review" | "Cancelled";

const STATUS_STYLES: Record<Status, string> = {
  "Dispatch Ready": "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  "In Progress": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Completed: "bg-white/[0.06] text-white/60 border-white/[0.1]",
  Delayed: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Needs Review": "bg-[#E31B23]/15 text-[#E31B23] border-[#E31B23]/30",
  Cancelled: "bg-red-500/10 text-red-300/70 border-red-500/20",
};

interface Job {
  id: string; customer: string; service: string; region: string;
  date: string; team: string; status: Status; notes: string;
}

const JOBS: Job[] = [
  { id: "JOB-5012", customer: "ABC Holdings", service: "Dumpster Rental", region: "Georgetown", date: "May 16, 8:00 AM", team: "Team Alpha", status: "Dispatch Ready", notes: "Gate code: 4421" },
  { id: "JOB-5011", customer: "Guyana Builders Inc.", service: "Skip Bin Rental", region: "Linden", date: "May 16, 10:00 AM", team: "Team Bravo", status: "In Progress", notes: "2 of 3 bins delivered" },
  { id: "JOB-5010", customer: "Premier Hotel", service: "Portable Toilet", region: "Georgetown", date: "May 16, 1:00 PM", team: "Team Alpha", status: "In Progress", notes: "" },
  { id: "JOB-5009", customer: "National Foods Ltd.", service: "Waste Oil Disposal", region: "Georgetown", date: "May 17, 9:00 AM", team: "Specialist", status: "Needs Review", notes: "Volume estimate pending" },
  { id: "JOB-5008", customer: "John Persaud", service: "Septic Tank Clearance", region: "Berbice", date: "May 17, 11:00 AM", team: "Team Charlie", status: "Dispatch Ready", notes: "Customer at site" },
  { id: "JOB-5007", customer: "Demerara Plaza", service: "Commercial Garbage", region: "Georgetown", date: "May 15, 7:00 AM", team: "Team Alpha", status: "Completed", notes: "" },
  { id: "JOB-5006", customer: "Riverside Estates", service: "Dumpster Rental", region: "EBD", date: "May 15, 8:00 AM", team: "Team Bravo", status: "Delayed", notes: "Truck maintenance" },
  { id: "JOB-5005", customer: "City Council", service: "Bulk Pickup", region: "Georgetown", date: "May 14", team: "Team Charlie", status: "Cancelled", notes: "Rescheduled by client" },
];

const KPIS = [
  { label: "Dispatch Ready", value: "8", tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: Truck },
  { label: "In Progress", value: "5", tone: "text-purple-300", bg: "bg-purple-500/10", icon: Activity },
  { label: "Completed Today", value: "11", tone: "text-white/70", bg: "bg-white/[0.05]", icon: CheckCircle2 },
  { label: "Needs Attention", value: "3", tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10", icon: AlertTriangle },
];

function JobsPage() {
  const [search, setSearch] = useState("");
  const filtered = JOBS.filter((j) => !search || j.customer.toLowerCase().includes(search.toLowerCase()) || j.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Jobs</h1>
          <p className="mt-1 text-sm text-white/60">Track job and service execution status.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Create Job
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">{k.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{k.value}</p>
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
        {["Status", "Region", "Team", "Service", "Date Range"].map((f) => (
          <button key={f} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <Filter className="h-3.5 w-3.5" /> {f}
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Job ID", "Customer", "Service", "Region", "Scheduled", "Team", "Status", "Notes", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{j.id}</td>
                  <td className="px-4 py-3 text-white">{j.customer}</td>
                  <td className="px-4 py-3 text-white/80">{j.service}</td>
                  <td className="px-4 py-3 text-white/70"><span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-white/40" />{j.region}</span></td>
                  <td className="px-4 py-3 text-white/70">{j.date}</td>
                  <td className="px-4 py-3 text-white/70">{j.team}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[j.status]}`}>{j.status}</span></td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-xs text-white/60">{j.notes || "—"}</td>
                  <td className="px-4 py-3 text-right"><button className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((j) => (
          <div key={j.id} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#FFD200]">{j.id}</span>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[j.status]}`}>{j.status}</span>
            </div>
            <h3 className="mt-2 font-semibold text-white">{j.customer}</h3>
            <p className="text-sm text-white/70">{j.service}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/60">
              <div><span className="text-white/40">When:</span> {j.date}</div>
              <div><span className="text-white/40">Region:</span> {j.region}</div>
              <div className="col-span-2"><span className="text-white/40">Team:</span> {j.team}</div>
            </div>
          </div>
        ))}
      </div>
    </CrmPage>
  );
}
