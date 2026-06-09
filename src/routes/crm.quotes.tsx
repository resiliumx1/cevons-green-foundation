import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/crm/quotes")({
  head: () => ({ meta: [{ title: "Quotes | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: QuotesPage,
});

type Status = "Draft" | "Needs Review" | "Sent" | "Awaiting Approval" | "Accepted" | "Declined" | "Expired";

const STATUS_STYLES: Record<Status, string> = {
  Draft: "bg-white/[0.06] text-white/60 border-white/[0.1]",
  "Needs Review": "bg-[#E31B23]/15 text-[#E31B23] border-[#E31B23]/30",
  Sent: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Awaiting Approval": "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  Accepted: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  Declined: "bg-red-500/15 text-red-300 border-red-500/30",
  Expired: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

interface Quote {
  id: string; requestId: string; customer: string; service: string;
  amount: number; status: Status; sent: string; expiry: string; assignee: string;
}

const QUOTES: Quote[] = [
  { id: "Q-3041", requestId: "CEV-1245", customer: "ABC Holdings", service: "Dumpster Rental", amount: 18500, status: "Awaiting Approval", sent: "May 14", expiry: "May 21", assignee: "Sarah K." },
  { id: "Q-3040", requestId: "CEV-1244", customer: "Premier Hotel", service: "Portable Toilet", amount: 9750, status: "Sent", sent: "May 13", expiry: "May 20", assignee: "Marcus T." },
  { id: "Q-3039", requestId: "CEV-1243", customer: "Guyana Builders Inc.", service: "Skip Bin Rental", amount: 24200, status: "Accepted", sent: "May 12", expiry: "May 19", assignee: "Sarah K." },
  { id: "Q-3038", requestId: "CEV-1242", customer: "R&R Manufacturing", service: "Waste Oil Disposal", amount: 42800, status: "Needs Review", sent: "—", expiry: "—", assignee: "Specialist" },
  { id: "Q-3037", requestId: "CEV-1241", customer: "City Mall", service: "Commercial Garbage", amount: 36500, status: "Draft", sent: "—", expiry: "—", assignee: "Marcus T." },
  { id: "Q-3036", requestId: "CEV-1240", customer: "Demerara Sugar", service: "Industrial Waste", amount: 87500, status: "Declined", sent: "May 8", expiry: "May 15", assignee: "Sarah K." },
  { id: "Q-3035", requestId: "CEV-1239", customer: "Ocean View Resort", service: "Portable Toilet", amount: 12400, status: "Expired", sent: "May 1", expiry: "May 8", assignee: "Marcus T." },
];

const KPIS = [
  { label: "Quote Needed", value: "6", tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10", icon: AlertCircle },
  { label: "Quotes Sent", value: "18", tone: "text-blue-300", bg: "bg-blue-500/10", icon: FileText },
  { label: "Awaiting Approval", value: "9", tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10", icon: Clock },
  { label: "Accepted This Month", value: "23", tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: CheckCircle2 },
  { label: "Lost This Month", value: "4", tone: "text-white/60", bg: "bg-white/[0.05]", icon: XCircle },
];

function QuotesPage() {
  const [search, setSearch] = useState("");
  const filtered = QUOTES.filter((q) => !search || q.customer.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Quotes</h1>
          <p className="mt-1 text-sm text-white/60">Track quote requests, sent quotes, and approvals.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Create Quote
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotes..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
        {["Status", "Assignee", "Service", "Date Range"].map((f) => (
          <button key={f} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <Filter className="h-3.5 w-3.5" /> {f}
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Quote ID", "Request ID", "Customer", "Service", "Amount", "Status", "Sent", "Expiry", "Assigned", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{q.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{q.requestId}</td>
                  <td className="px-4 py-3 text-white">{q.customer}</td>
                  <td className="px-4 py-3 text-white/80">{q.service}</td>
                  <td className="px-4 py-3 font-semibold text-white">${q.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[q.status]}`}>{q.status}</span></td>
                  <td className="px-4 py-3 text-white/70">{q.sent}</td>
                  <td className="px-4 py-3 text-white/70">{q.expiry}</td>
                  <td className="px-4 py-3 text-white/70">{q.assignee}</td>
                  <td className="px-4 py-3 text-right"><button className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((q) => (
          <div key={q.id} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#FFD200]">{q.id}</span>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[q.status]}`}>{q.status}</span>
            </div>
            <h3 className="mt-2 font-semibold text-white">{q.customer}</h3>
            <p className="text-sm text-white/70">{q.service}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg font-semibold text-white">${q.amount.toLocaleString()}</span>
              <span className="text-xs text-white/50">Expires {q.expiry}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
