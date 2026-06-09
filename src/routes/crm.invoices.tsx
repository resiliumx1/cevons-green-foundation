import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, FileText, Send, CheckCircle2, AlertTriangle } from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
export const Route = createFileRoute("/crm/invoices")({
  head: () => ({ meta: [{ title: "Invoices | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: InvoicesPage,
});

type Status = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";

const STATUS_STYLES: Record<Status, string> = {
  Draft: "bg-white/[0.06] text-white/60 border-white/[0.1]",
  Sent: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Paid: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  Overdue: "bg-[#E31B23]/15 text-[#E31B23] border-[#E31B23]/30",
  Cancelled: "bg-red-500/10 text-red-300/70 border-red-500/20",
};

interface Invoice {
  id: string; customer: string; service: string; amount: number;
  status: Status; sent: string; due: string; relatedRequest: string;
}

const INVOICES: Invoice[] = [
  { id: "INV-2031", customer: "ABC Holdings", service: "Dumpster Rental", amount: 18750, status: "Paid", sent: "May 10", due: "May 24", relatedRequest: "CEV-1245" },
  { id: "INV-2030", customer: "Premier Hotel", service: "Portable Toilet", amount: 9750, status: "Sent", sent: "May 13", due: "May 27", relatedRequest: "CEV-1244" },
  { id: "INV-2029", customer: "Guyana Builders Inc.", service: "Skip Bin Rental", amount: 24200, status: "Sent", sent: "May 12", due: "May 26", relatedRequest: "CEV-1243" },
  { id: "INV-2028", customer: "City Mall", service: "Commercial Garbage", amount: 36500, status: "Overdue", sent: "Apr 20", due: "May 4", relatedRequest: "CEV-1198" },
  { id: "INV-2027", customer: "R&R Manufacturing", service: "Waste Oil Disposal", amount: 42800, status: "Draft", sent: "—", due: "—", relatedRequest: "CEV-1242" },
  { id: "INV-2026", customer: "Demerara Sugar", service: "Industrial Waste", amount: 87500, status: "Paid", sent: "May 1", due: "May 15", relatedRequest: "CEV-1220" },
  { id: "INV-2025", customer: "Ocean View Resort", service: "Portable Toilet", amount: 12400, status: "Cancelled", sent: "Apr 28", due: "May 12", relatedRequest: "CEV-1210" },
];

const KPIS = [
  { label: "Draft Invoices", value: "4", tone: "text-white/70", bg: "bg-white/[0.05]", icon: FileText },
  { label: "Sent Invoices", value: "17", tone: "text-blue-300", bg: "bg-blue-500/10", icon: Send },
  { label: "Paid", value: "$184,250", tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: CheckCircle2 },
  { label: "Overdue", value: "$36,500", tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10", icon: AlertTriangle },
];

function InvoicesPage() {
  const [search, setSearch] = useState("");
  const filtered = INVOICES.filter((i) => !search || i.customer.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Invoices</h1>
          <p className="mt-1 text-sm text-white/60">Track invoice status after service delivery.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Create Invoice
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
        {["Status", "Customer", "Date Range"].map((f) => (
          <button key={f} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <Filter className="h-3.5 w-3.5" /> {f}
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Invoice ID", "Customer", "Service", "Amount", "Status", "Sent", "Due", "Request", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{i.id}</td>
                  <td className="px-4 py-3 text-white">{i.customer}</td>
                  <td className="px-4 py-3 text-white/80">{i.service}</td>
                  <td className="px-4 py-3 font-semibold text-white">${i.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[i.status]}`}>{i.status}</span></td>
                  <td className="px-4 py-3 text-white/70">{i.sent}</td>
                  <td className="px-4 py-3 text-white/70">{i.due}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{i.relatedRequest}</td>
                  <td className="px-4 py-3 text-right"><button className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((i) => (
          <div key={i.id} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#FFD200]">{i.id}</span>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[i.status]}`}>{i.status}</span>
            </div>
            <h3 className="mt-2 font-semibold text-white">{i.customer}</h3>
            <p className="text-sm text-white/70">{i.service}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg font-semibold text-white">${i.amount.toLocaleString()}</span>
              <span className="text-xs text-white/50">Due {i.due}</span>
            </div>
          </div>
        ))}
      </div>
    </CrmPage>
  );
}
