import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Plus, X, Users, UserPlus, Building2, Repeat, Phone, Mail, MapPin, FileText } from "lucide-react";

export const Route = createFileRoute("/crm/customers")({
  head: () => ({ meta: [{ title: "Customers | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: CustomersPage,
});

type CustomerType = "Residential" | "Commercial" | "Industrial" | "Government / Municipal" | "Institution";
type Status = "Active" | "Lead" | "Inactive";

const TYPE_STYLES: Record<CustomerType, string> = {
  Residential: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Commercial: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  Industrial: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Government / Municipal": "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  Institution: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

const STATUS_STYLES: Record<Status, string> = {
  Active: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  Lead: "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  Inactive: "bg-white/[0.06] text-white/50 border-white/[0.1]",
};

interface Customer {
  id: string; name: string; contact: string; phone: string; email: string;
  type: CustomerType; region: string; services: string[]; lastRequest: string;
  totalRequests: number; status: Status; owner: string; revenue: number;
  history: { id: string; service: string; date: string }[];
  notes: string;
}

const CUSTOMERS: Customer[] = [
  { id: "CUST-001", name: "ABC Holdings", contact: "John Mitchell", phone: "+592 000-0000", email: "john@abcholdings.gy", type: "Commercial", region: "Georgetown", services: ["Dumpster Rental", "Skip Bin"], lastRequest: "May 14", totalRequests: 12, status: "Active", owner: "Sarah K.", revenue: 184500,
    history: [{ id: "CEV-1245", service: "Dumpster Rental", date: "May 14" }, { id: "CEV-1198", service: "Commercial Garbage", date: "Apr 22" }, { id: "CEV-1150", service: "Skip Bin Rental", date: "Mar 30" }],
    notes: "Prefers weekday morning deliveries. Has standing PO for monthly pickups." },
  { id: "CUST-002", name: "Guyana Builders Inc.", contact: "Anita Persaud", phone: "+592 000-0000", email: "anita@gbi.gy", type: "Industrial", region: "Linden", services: ["Skip Bin Rental"], lastRequest: "May 12", totalRequests: 8, status: "Active", owner: "Marcus T.", revenue: 142200,
    history: [{ id: "CEV-1243", service: "Skip Bin Rental", date: "May 12" }], notes: "Construction site — needs heavy-duty bins." },
  { id: "CUST-003", name: "John Persaud", contact: "John Persaud", phone: "+592 000-0000", email: "—", type: "Residential", region: "Berbice", services: ["Septic Tank"], lastRequest: "May 11", totalRequests: 2, status: "Lead", owner: "Sarah K.", revenue: 4500,
    history: [{ id: "CEV-1241", service: "Septic Tank Clearance", date: "May 11" }], notes: "First-time customer." },
  { id: "CUST-004", name: "Premier Hotel", contact: "Lisa Wong", phone: "+592 000-0000", email: "ops@premierhotel.gy", type: "Commercial", region: "Georgetown", services: ["Portable Toilet", "Commercial Garbage"], lastRequest: "May 13", totalRequests: 24, status: "Active", owner: "Marcus T.", revenue: 312800,
    history: [{ id: "CEV-1244", service: "Portable Toilet", date: "May 13" }], notes: "VIP account. Event-driven volume." },
  { id: "CUST-005", name: "National Foods Ltd.", contact: "David Khan", phone: "+592 000-0000", email: "d.khan@nflfoods.gy", type: "Industrial", region: "Georgetown", services: ["Waste Oil Disposal"], lastRequest: "May 10", totalRequests: 6, status: "Active", owner: "Specialist", revenue: 256400,
    history: [{ id: "CEV-1242", service: "Waste Oil Disposal", date: "May 10" }], notes: "Specialist review required for each pickup." },
  { id: "CUST-006", name: "City Council", contact: "Procurement Office", phone: "+592 000-0000", email: "procurement@gov.gy", type: "Government / Municipal", region: "Georgetown", services: ["Bulk Pickup"], lastRequest: "Apr 28", totalRequests: 4, status: "Inactive", owner: "Sarah K.", revenue: 89500,
    history: [{ id: "CEV-1199", service: "Bulk Pickup", date: "Apr 28" }], notes: "Tender-based engagements." },
  { id: "CUST-007", name: "St. Joseph Academy", contact: "Headmaster Reid", phone: "+592 000-0000", email: "office@sja.edu.gy", type: "Institution", region: "Georgetown", services: ["Commercial Garbage"], lastRequest: "May 5", totalRequests: 9, status: "Active", owner: "Marcus T.", revenue: 67200,
    history: [{ id: "CEV-1232", service: "Commercial Garbage", date: "May 5" }], notes: "Weekly pickup contract." },
];

const KPIS = [
  { label: "Total Customers", value: "248", tone: "text-white/80", bg: "bg-white/[0.05]", icon: Users },
  { label: "New This Month", value: "17", tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10", icon: UserPlus },
  { label: "Commercial Accounts", value: "94", tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: Building2 },
  { label: "Repeat Customers", value: "162", tone: "text-purple-300", bg: "bg-purple-500/10", icon: Repeat },
];

function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = CUSTOMERS.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Customers</h1>
          <p className="mt-1 text-sm text-white/60">Manage customer and company records.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Add Customer
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
        {["Type", "Region", "Status", "Owner"].map((f) => (
          <button key={f} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            <Filter className="h-3.5 w-3.5" /> {f}
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Customer", "Type", "Region", "Services", "Last Request", "Total", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-white/50">{c.contact}</div>
                  </td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${TYPE_STYLES[c.type]}`}>{c.type}</span></td>
                  <td className="px-4 py-3 text-white/70">{c.region}</td>
                  <td className="px-4 py-3 text-xs text-white/70">{c.services.join(", ")}</td>
                  <td className="px-4 py-3 text-white/70">{c.lastRequest}</td>
                  <td className="px-4 py-3 text-center text-white">{c.totalRequests}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[c.status]}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-right text-xs text-[#FFD200]">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((c) => (
          <div key={c.id} onClick={() => setSelected(c)} className="cursor-pointer rounded-xl border border-white/[0.08] bg-[#101820] p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{c.name}</h3>
                <p className="text-xs text-white/50">{c.contact}</p>
              </div>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[c.status]}`}>{c.status}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex rounded-full border px-2 py-0.5 ${TYPE_STYLES[c.type]}`}>{c.type}</span>
              <span className="text-white/60">{c.region}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/60">{c.totalRequests} requests</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0a1218] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.06] p-5">
              <div>
                <h2 className="text-xl font-semibold text-white">{selected.name}</h2>
                <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs ${TYPE_STYLES[selected.type]}`}>{selected.type}</span>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-white/60 hover:bg-white/[0.05] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Contact</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/80"><span className="text-white/40">Primary:</span> {selected.contact}</div>
                  <div className="flex items-center gap-2 text-white/80"><Phone className="h-3.5 w-3.5 text-white/40" /> {selected.phone}</div>
                  <div className="flex items-center gap-2 text-white/80"><Mail className="h-3.5 w-3.5 text-white/40" /> {selected.email}</div>
                  <div className="flex items-center gap-2 text-white/80"><MapPin className="h-3.5 w-3.5 text-white/40" /> {selected.region}</div>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-5">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Lifetime Revenue</p>
                  <p className="mt-1 text-lg font-semibold text-[#FFD200]">${selected.revenue.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Total Requests</p>
                  <p className="mt-1 text-lg font-semibold text-white">{selected.totalRequests}</p>
                </div>
              </section>

              <section className="border-t border-white/[0.06] pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Request History</h3>
                <div className="mt-3 space-y-2">
                  {selected.history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-sm">
                      <div>
                        <div className="font-mono text-xs text-[#FFD200]">{h.id}</div>
                        <div className="text-xs text-white/70">{h.service}</div>
                      </div>
                      <span className="text-xs text-white/50">{h.date}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-white/[0.06] pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Assigned Owner</h3>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006B35]/20 text-xs font-semibold text-[#006B35]">{selected.owner.split(" ").map((x) => x[0]).join("")}</div>
                  <span className="text-sm text-white">{selected.owner}</span>
                </div>
              </section>

              <section className="border-t border-white/[0.06] pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Notes</h3>
                <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/80">
                  <FileText className="mb-2 h-3.5 w-3.5 text-white/40" />
                  {selected.notes}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-5">
                <button className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06]">New Request</button>
                <button className="rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">View Full Profile</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
