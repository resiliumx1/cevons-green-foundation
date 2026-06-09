import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/crm/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings | CEVONS Growth Command" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingsPage,
});

type Status =
  | "Pending Confirmation"
  | "Scheduled"
  | "Dispatch Ready"
  | "In Progress"
  | "Completed"
  | "Needs Review";

interface Booking {
  id: string;
  customer: string;
  service: string;
  region: string;
  date: string;
  time: string;
  status: Status;
  team: string;
}

const BOOKINGS: Booking[] = [
  { id: "BK-2041", customer: "ABC Holdings", service: "Dumpster Rental", region: "Georgetown", date: "May 16", time: "8:00 AM", status: "Scheduled", team: "Team Alpha" },
  { id: "BK-2042", customer: "Guyana Builders Inc.", service: "Skip Bin Rental", region: "Linden", date: "May 16", time: "10:00 AM", status: "Dispatch Ready", team: "Team Bravo" },
  { id: "BK-2043", customer: "Premier Hotel", service: "Portable Toilet", region: "Georgetown", date: "May 16", time: "1:00 PM", status: "In Progress", team: "Team Alpha" },
  { id: "BK-2044", customer: "National Foods Ltd.", service: "Waste Oil Disposal", region: "Georgetown", date: "May 17", time: "9:00 AM", status: "Needs Review", team: "Specialist" },
  { id: "BK-2045", customer: "John Persaud", service: "Septic Tank Clearance", region: "Berbice", date: "May 17", time: "11:00 AM", status: "Pending Confirmation", team: "Unassigned" },
  { id: "BK-2046", customer: "R&R Manufacturing", service: "Waste Oil Disposal", region: "EBD", date: "May 17", time: "2:00 PM", status: "Pending Confirmation", team: "Unassigned" },
  { id: "BK-2038", customer: "City Mall", service: "Commercial Garbage", region: "Georgetown", date: "May 14", time: "9:00 AM", status: "Completed", team: "Team Charlie" },
  { id: "BK-2039", customer: "Ocean View Resort", service: "Portable Toilet", region: "Essequibo", date: "May 15", time: "8:00 AM", status: "Completed", team: "Team Bravo" },
];

const STATUS_STYLES: Record<Status, string> = {
  "Pending Confirmation": "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  Scheduled: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Dispatch Ready": "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  "In Progress": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Completed: "bg-white/[0.06] text-white/60 border-white/[0.1]",
  "Needs Review": "bg-[#E31B23]/15 text-[#E31B23] border-[#E31B23]/30",
};

const KPIS = [
  { label: "Scheduled Today", value: "12", icon: CalendarCheck, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
  { label: "Pending Confirmation", value: "8", icon: Clock, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
  { label: "Specialist Reviews", value: "3", icon: AlertTriangle, tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10" },
  { label: "Completed This Week", value: "27", icon: CheckCircle2, tone: "text-white/70", bg: "bg-white/[0.05]" },
];

function BookingsPage() {
  const [search, setSearch] = useState("");

  const filtered = BOOKINGS.filter(
    (b) =>
      !search ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-white/60">
            Manage scheduled and pending service bookings.
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> New Booking
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-xl border border-white/[0.08] bg-[#101820] p-4 transition hover:border-white/[0.15]"
            >
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101820] p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none"
          />
        </div>
        {["Service", "Region", "Status", "Date Range", "Assigned Team"].map((f) => (
          <button
            key={f}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]"
          >
            <Filter className="h-3.5 w-3.5" /> {f}
          </button>
        ))}
      </div>

      {/* Table - Desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>
                {["Booking ID", "Customer", "Service", "Region", "Date / Time", "Status", "Assigned Team", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{b.id}</td>
                  <td className="px-4 py-3 text-white">{b.customer}</td>
                  <td className="px-4 py-3 text-white/80">{b.service}</td>
                  <td className="px-4 py-3 text-white/70">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-white/40" />
                      {b.region}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    <div>{b.date}</div>
                    <div className="text-xs text-white/50">{b.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">{b.team}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#FFD200]">{b.id}</span>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[b.status]}`}>
                {b.status}
              </span>
            </div>
            <h3 className="mt-2 font-semibold text-white">{b.customer}</h3>
            <p className="text-sm text-white/70">{b.service}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/60">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/40">Date</div>
                <div>{b.date}, {b.time}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/40">Region</div>
                <div>{b.region}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-white/40">Team</div>
                <div>{b.team}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
