import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Search, Filter, Plus, Calendar as CalIcon } from "lucide-react";

export const Route = createFileRoute("/crm/leads")({
  component: LeadsLayout,
});

function LeadsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/crm/leads") return <Outlet />;
  return <LeadsList />;
}

type Status = "New" | "Contacted" | "Qualified" | "Quote Sent" | "Scheduled" | "Specialist Review" | "Completed";

const statusStyles: Record<Status, string> = {
  "New": "bg-slate-500/15 text-slate-300 border-slate-500/30",
  "Contacted": "bg-[#FFC629]/15 text-[#FFC629] border-[#FFC629]/30",
  "Qualified": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Quote Sent": "bg-[#FFC629]/15 text-[#FFC629] border-[#FFC629]/30",
  "Scheduled": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Specialist Review": "bg-[#E63946]/15 text-red-400 border-[#E63946]/30",
  "Completed": "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
};

const priorityStyles: Record<string, string> = {
  High: "text-red-400",
  Medium: "text-[#FFC629]",
  Low: "text-slate-400",
};

const leads = [
  { id: "CEV-1245", contact: "ABC Holdings", service: "Skip Bin Rental", source: "WhatsApp", priority: "High", status: "Contacted" as Status, assigned: "Romina", date: "Jun 09, 2026" },
  { id: "CEV-1244", contact: "Marie Singh", service: "Dumpster Rental", source: "Website", priority: "Medium", status: "New" as Status, assigned: "Unassigned", date: "Jun 09, 2026" },
  { id: "CEV-1243", contact: "Linden Foods Ltd", service: "Commercial Pickup", source: "Google Ads", priority: "High", status: "Quote Sent" as Status, assigned: "Devon", date: "Jun 08, 2026" },
  { id: "CEV-1242", contact: "Berbice Hospital", service: "Medical Waste", source: "Referral", priority: "High", status: "Specialist Review" as Status, assigned: "Romina", date: "Jun 08, 2026" },
  { id: "CEV-1241", contact: "GT Construction", service: "Skip Bin Rental", source: "Phone", priority: "Medium", status: "Scheduled" as Status, assigned: "Devon", date: "Jun 07, 2026" },
  { id: "CEV-1240", contact: "Hotel Tower", service: "Portable Toilet", source: "Facebook", priority: "Low", status: "Qualified" as Status, assigned: "Anika", date: "Jun 07, 2026" },
  { id: "CEV-1239", contact: "Joel Persaud", service: "Septic Tank", source: "WhatsApp", priority: "Medium", status: "Completed" as Status, assigned: "Devon", date: "Jun 06, 2026" },
  { id: "CEV-1238", contact: "Riverdale Estate", service: "Waste Oil Disposal", source: "Website", priority: "Low", status: "Contacted" as Status, assigned: "Anika", date: "Jun 06, 2026" },
];

function Select({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#121a26] border border-white/5 text-slate-200 hover:border-white/10">
      <Filter className="h-3.5 w-3.5 text-slate-400" />
      {label}
    </button>
  );
}

function LeadsList() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads / Requests</h1>
          <p className="text-sm text-slate-400 mt-1">Manage incoming service requests and follow-ups.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFC629] text-[#0a3622] rounded-lg font-semibold text-sm hover:bg-[#FFD659]">
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      <div className="bg-[#121a26] border border-white/5 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name, ID, service…"
              className="w-full rounded-lg bg-[#0f1620] border border-white/5 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <Select label="All Pipelines" />
          <Select label="All Users" />
          <Select label="All Sources" />
          <Select label="All Status" />
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#121a26] border border-white/5 text-slate-200 hover:border-white/10">
            <CalIcon className="h-3.5 w-3.5 text-slate-400" /> Date range
          </button>
        </div>
      </div>

      <div className="bg-[#121a26] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
                <th className="px-4 py-3 font-medium">Lead ID</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assigned To</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link to="/crm/leads/$id" params={{ id: l.id }} className="font-mono text-[#FFC629] hover:underline">{l.id}</Link>
                  </td>
                  <td className="px-4 py-3 text-white">{l.contact}</td>
                  <td className="px-4 py-3 text-slate-300">{l.service}</td>
                  <td className="px-4 py-3 text-slate-300">{l.source}</td>
                  <td className={`px-4 py-3 font-medium ${priorityStyles[l.priority]}`}>{l.priority}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-medium ${statusStyles[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{l.assigned}</td>
                  <td className="px-4 py-3 text-slate-400">{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
