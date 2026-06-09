import { createFileRoute } from "@tanstack/react-router";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Users, CalendarCheck, FileText, CheckCircle2,
  Calendar as CalendarIcon, Download, MoreHorizontal, Globe, MessageCircle, Phone, Megaphone, Facebook, UserPlus,
  ChevronRight, Inbox,
} from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/crm/")({
  component: Dashboard,
});

/* ------------------------------------------------------------------ */
/* Mock data — replace with real data source when backend is connected */
/* ------------------------------------------------------------------ */

const spark = (vals: number[]) => vals.map((v, i) => ({ i, v }));

const metrics = [
  {
    label: "New Leads", value: 24, change: "+12%", up: true,
    icon: Users, accent: "#006B35",
    spark: spark([10, 14, 12, 18, 16, 21, 24]),
  },
  {
    label: "Scheduled Jobs", value: 18, change: "+8%", up: true,
    icon: CalendarCheck, accent: "#FFD200",
    spark: spark([8, 10, 12, 11, 14, 16, 18]),
  },
  {
    label: "Open Quotes", value: 32, change: "-15%", up: false,
    icon: FileText, accent: "#E31B23",
    spark: spark([42, 40, 38, 36, 34, 33, 32]),
  },
  {
    label: "Completed Jobs", value: 15, change: "+5%", up: true,
    icon: CheckCircle2, accent: "#006B35",
    spark: spark([8, 9, 10, 12, 13, 14, 15]),
  },
];

const sources = [
  { name: "Website", value: 42, color: "#006B35", icon: Globe },
  { name: "WhatsApp", value: 28, color: "#25D366", icon: MessageCircle },
  { name: "Google Ads", value: 15, color: "#FFD200", icon: Megaphone },
  { name: "Facebook", value: 8, color: "#3b82f6", icon: Facebook },
  { name: "Phone", value: 5, color: "#E31B23", icon: Phone },
  { name: "Referral", value: 2, color: "#64748b", icon: UserPlus },
];

const regions = [
  { name: "Georgetown", value: 55, color: "#006B35" },
  { name: "Linden", value: 25, color: "#FFD200" },
  { name: "Berbice", value: 18, color: "#E31B23" },
  { name: "Other", value: 2, color: "#64748b" },
];

const revenue = [
  { d: "May 1", v: 142000 }, { d: "May 5", v: 168000 }, { d: "May 8", v: 175000 },
  { d: "May 12", v: 188000 }, { d: "May 16", v: 202000 }, { d: "May 20", v: 215000 },
  { d: "May 24", v: 223000 }, { d: "May 28", v: 236540 },
];

const services = [
  { name: "Dumpster Rental", pct: 35 },
  { name: "Skip Bin Rental", pct: 25 },
  { name: "Septic Tank", pct: 18 },
  { name: "Waste Oil Disposal", pct: 12 },
  { name: "Portable Toilet", pct: 7 },
  { name: "Other Services", pct: 3 },
];

const tasks = [
  "Follow up with 4 leads",
  "Review 3 quotes",
  "Confirm 5 bookings",
  "Send 4 invoices",
];

const bookings = [
  { time: "May 16, 8:00 AM", customer: "ABC Holdings", service: "Dumpster Rental", location: "Georgetown", status: "Scheduled" },
  { time: "May 16, 10:00 AM", customer: "Guyana Builders Inc.", service: "Skip Bin Rental", location: "Linden", status: "Scheduled" },
  { time: "May 16, 1:00 PM", customer: "Premier Hotel", service: "Portable Toilet", location: "Georgetown", status: "Scheduled" },
  { time: "May 17, 9:00 AM", customer: "National Foods Ltd.", service: "Waste Oil Collection", location: "Georgetown", status: "Scheduled" },
];

const activity = [
  { icon: UserPlus, color: "#006B35", title: "New lead from Website", detail: "ABC Construction Ltd.", time: "2 min ago" },
  { icon: FileText, color: "#FFD200", title: "Quote sent", detail: "CEV-1240 — Skip Bin Rental", time: "15 min ago" },
  { icon: CheckCircle2, color: "#006B35", title: "Job completed", detail: "CEV-1236 — Septic Tank", time: "1 hour ago" },
  { icon: Download, color: "#3b82f6", title: "Payment received", detail: "INV-2031 — $18,750", time: "2 hours ago" },
];

/* ------------------------------------------------------------------ */
/* Reusable building blocks                                            */
/* ------------------------------------------------------------------ */

function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-[#101820] border border-white/[0.08] rounded-xl transition-colors hover:border-white/[0.14] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title = "No data available", subtitle = "Once data flows in it will appear here.", icon: Icon = Inbox }: { title?: string; subtitle?: string; icon?: typeof Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="h-12 w-12 rounded-full bg-white/5 grid place-items-center mb-3">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtitle}</p>
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />;
}

function TrendPill({ up, change }: { up: boolean; change: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
        up ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {change} <span className="text-slate-500 font-normal">vs yesterday</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {status}
    </span>
  );
}

const TOOLTIP_STYLE = { background: "#0a1414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 };

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#101820] border border-white/[0.08] text-sm text-slate-200 hover:border-white/20">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            May 15, 2026
          </button>
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-lg bg-[#101820] border border-white/[0.08] text-slate-300 hover:border-white/20" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          const gradId = `grad-${i}`;
          return (
            <Card key={m.label} className="p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-slate-400">{m.label}</div>
                  <div className="text-3xl font-bold text-white mt-2 tabular-nums">{m.value}</div>
                  <div className="mt-2"><TrendPill up={m.up} change={m.change} /></div>
                </div>
                <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0" style={{ background: `${m.accent}1f`, color: m.accent }}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="h-12 mt-2 -mx-1">
                <ResponsiveContainer>
                  <AreaChart data={m.spark}>
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={m.accent} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={m.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={m.accent} strokeWidth={2} fill={`url(#${gradId})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Row: Leads by Source + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Leads by Source</h3>
            <span className="text-xs text-slate-400">This month</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-48 w-48 shrink-0 relative">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sources} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
                    {sources.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Total</div>
                <div className="text-xl font-bold text-white">142</div>
              </div>
            </div>
            <ul className="flex-1 space-y-2 min-w-0">
              {sources.map((s) => (
                <li key={s.name} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="truncate">{s.name}</span>
                  <span className="ml-auto text-slate-400 tabular-nums">{s.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2 animate-fade-in" style={{ animationDelay: "80ms" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue This Month</h3>
              <div className="text-3xl font-bold text-white mt-1 tabular-nums">$236,540</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> +21% <span className="text-slate-500 font-normal">vs last month</span>
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">May 2026</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={revenue} margin={{ left: -10, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006B35" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#006B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="v" stroke="#006B35" strokeWidth={2.5} dot={{ fill: "#006B35", r: 3 }} activeDot={{ r: 5, fill: "#FFD200" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Row: Top Services + Leads by Region + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-4">Top Services</h3>
          <div className="space-y-3.5">
            {services.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-200">{s.name}</span>
                  <span className="text-slate-400 tabular-nums">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#FFD200] transition-[width] duration-700"
                    style={{ width: `${s.pct * 2.8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 animate-fade-in" style={{ animationDelay: "60ms" }}>
          <h3 className="text-sm font-semibold text-white mb-2">Leads by Region</h3>
          <div className="flex items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={regions} dataKey="value" innerRadius={40} outerRadius={68} paddingAngle={2} stroke="none">
                    {regions.map((r) => <Cell key={r.name} fill={r.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 min-w-0">
              {regions.map((r) => (
                <li key={r.name} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="truncate">{r.name}</span>
                  <span className="ml-auto text-slate-400 tabular-nums">{r.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5 flex flex-col animate-fade-in" style={{ animationDelay: "120ms" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Tasks Due Today</h3>
          <ul className="space-y-3 flex-1">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm group">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                <span className="text-slate-200 group-hover:text-white transition-colors">{t}</span>
              </li>
            ))}
          </ul>
          <button className="mt-5 w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#FFD200] hover:text-[#FFE66B] py-2 border border-[#FFD200]/30 rounded-lg hover:bg-[#FFD200]/5 transition-colors">
            View All Tasks <ChevronRight className="h-3 w-3" />
          </button>
        </Card>
      </div>

      {/* Row: Bookings + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Upcoming Bookings</h3>
            <span className="text-xs text-slate-400">{bookings.length} scheduled</span>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/[0.08]">
                  <th className="px-5 py-2.5 font-medium">Time</th>
                  <th className="px-3 py-2.5 font-medium">Customer</th>
                  <th className="px-3 py-2.5 font-medium">Service</th>
                  <th className="px-3 py-2.5 font-medium">Location</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-slate-300 whitespace-nowrap">{b.time}</td>
                    <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{b.customer}</td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{b.service}</td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{b.location}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 py-2 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/5 transition-colors">
            View Calendar <ChevronRight className="h-3 w-3" />
          </button>
        </Card>

        <Card className="p-5 flex flex-col animate-fade-in" style={{ animationDelay: "80ms" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          <ul className="space-y-4 flex-1">
            {activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${a.color}1f`, color: a.color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium leading-tight">{a.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{a.detail}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">{a.time}</span>
                </li>
              );
            })}
          </ul>
          <button className="mt-5 w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-300 hover:text-white py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            View All Activity <ChevronRight className="h-3 w-3" />
          </button>
        </Card>
      </div>
    </div>
  );
}
