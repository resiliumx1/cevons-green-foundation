import { createFileRoute } from "@tanstack/react-router";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, CalendarCheck, FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/crm/")({
  component: Dashboard,
});

const metrics = [
  { label: "New Leads", value: 24, change: "+12%", up: true, icon: Users, color: "text-emerald-400" },
  { label: "Scheduled Jobs", value: 18, change: "+4%", up: true, icon: CalendarCheck, color: "text-[#FFC629]" },
  { label: "Open Quotes", value: 32, change: "-3%", up: false, icon: FileText, color: "text-sky-400" },
  { label: "Completed Jobs", value: 15, change: "+8%", up: true, icon: CheckCircle2, color: "text-emerald-400" },
];

const sources = [
  { name: "Website", value: 28, color: "#10b981" },
  { name: "WhatsApp", value: 24, color: "#FFC629" },
  { name: "Google Ads", value: 18, color: "#3b82f6" },
  { name: "Facebook", value: 12, color: "#8b5cf6" },
  { name: "Phone", value: 10, color: "#ef4444" },
  { name: "Referral", value: 8, color: "#06b6d4" },
];

const regions = [
  { name: "Georgetown", value: 52, color: "#10b981" },
  { name: "Linden", value: 24, color: "#FFC629" },
  { name: "Berbice", value: 18, color: "#3b82f6" },
  { name: "Other", value: 6, color: "#64748b" },
];

const revenue = [
  { d: "Wk 1", v: 42000 }, { d: "Wk 2", v: 58000 }, { d: "Wk 3", v: 51000 },
  { d: "Wk 4", v: 67000 }, { d: "Wk 5", v: 73000 },
];

const services = [
  { name: "Dumpster Rental", count: 64 },
  { name: "Skip Bin Rental", count: 52 },
  { name: "Septic Tank", count: 38 },
  { name: "Portable Toilet", count: 27 },
  { name: "Waste Oil Disposal", count: 18 },
];

const tasks = [
  "Follow up with 4 leads",
  "Review 3 quotes",
  "Confirm 5 bookings",
  "Send 4 invoices",
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#121a26] border border-white/5 rounded-xl ${className}`}>{children}</div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, Romina</h1>
        <p className="text-sm text-slate-400 mt-1">Here's what's happening with your business today.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">{m.label}</div>
                  <div className="text-3xl font-bold text-white mt-2">{m.value}</div>
                </div>
                <div className={`h-10 w-10 rounded-lg bg-white/5 grid place-items-center ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${m.up ? "text-emerald-400" : "text-red-400"}`}>
                {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {m.change} vs last week
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Leads by Source</h3>
            <span className="text-xs text-slate-400">This month</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sources} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {sources.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f1620", border: "1px solid #ffffff10", borderRadius: 8, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {sources.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.name} <span className="ml-auto text-slate-400">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue This Month</h3>
              <div className="text-2xl font-bold text-white mt-1">$236,540</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">+18.2%</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={revenue}>
                <CartesianGrid stroke="#ffffff08" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: "#0f1620", border: "1px solid #ffffff10", borderRadius: 8, color: "#fff" }} />
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} dot={{ fill: "#FFC629", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Services</h3>
          <div className="space-y-3">
            {services.map((s) => {
              const pct = (s.count / 64) * 100;
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-slate-400">{s.count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-[#FFC629]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Leads by Region</h3>
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={regions} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={2}>
                  {regions.map((r) => <Cell key={r.name} fill={r.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f1620", border: "1px solid #ffffff10", borderRadius: 8, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {regions.map((r) => (
              <div key={r.name} className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                {r.name} <span className="ml-auto text-slate-400">{r.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Tasks Due Today</h3>
          <ul className="space-y-3">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                <span className="text-slate-200">{t}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full text-xs font-medium text-[#FFC629] hover:text-[#FFD659] py-2 border border-[#FFC629]/30 rounded-lg">
            View all tasks
          </button>
        </Card>
      </div>
    </div>
  );
}
