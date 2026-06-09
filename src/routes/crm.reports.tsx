import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, Target, MapPin, PieChart, Clock, CheckSquare, Star, XCircle, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/crm/reports")({
  head: () => ({ meta: [{ title: "Reports | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: ReportsPage,
});

const CARDS = [
  { title: "Revenue Trends", desc: "Track monthly and yearly revenue performance.", icon: TrendingUp, tone: "text-[#00A85A]", bg: "bg-[#00A85A]/10" },
  { title: "ROI & Campaign Performance", desc: "Compare marketing spend with revenue impact.", icon: Target, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
  { title: "Area Performance", desc: "See which regions generate the most demand.", icon: MapPin, tone: "text-blue-300", bg: "bg-blue-500/10" },
  { title: "Service Demand", desc: "Lead and job distribution by service.", icon: PieChart, tone: "text-purple-300", bg: "bg-purple-500/10" },
  { title: "Response Times", desc: "Measure first-contact and follow-up speed.", icon: Clock, tone: "text-orange-300", bg: "bg-orange-500/10" },
  { title: "Quote-to-Booking Rate", desc: "Conversion from quote sent to job booked.", icon: CheckSquare, tone: "text-[#00A85A]", bg: "bg-[#00A85A]/10" },
  { title: "Review Requests", desc: "Customer feedback response rates.", icon: Star, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
  { title: "Lost Opportunities", desc: "Declined or expired quotes and stalled leads.", icon: XCircle, tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10" },
];

const REVENUE = [
  { m: "Nov", v: 142000 }, { m: "Dec", v: 168000 }, { m: "Jan", v: 184000 },
  { m: "Feb", v: 172000 }, { m: "Mar", v: 198000 }, { m: "Apr", v: 221000 }, { m: "May", v: 236540 },
];

const SERVICE_LEADS = [
  { name: "Dumpster", leads: 142 }, { name: "Skip Bin", leads: 88 },
  { name: "Septic", leads: 64 }, { name: "Portable Toilet", leads: 72 },
  { name: "Waste Oil", leads: 46 }, { name: "Scrap Metal", leads: 28 },
];

const REGION_JOBS = [
  { name: "Georgetown", jobs: 184 }, { name: "Linden", jobs: 62 },
  { name: "Berbice", jobs: 48 }, { name: "EBD", jobs: 38 }, { name: "Other", jobs: 22 },
];

function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Reports</h1>
        <p className="mt-1 text-sm text-white/60">
          Review business performance across revenue, ROI, services, regions, and response times.
        </p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="group flex flex-col rounded-xl border border-white/[0.08] bg-[#101820] p-4 transition hover:border-[#FFD200]/30">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}>
                <Icon className={`h-5 w-5 ${c.tone}`} />
              </div>
              <h3 className="mt-3 font-semibold text-white">{c.title}</h3>
              <p className="mt-1 flex-1 text-xs text-white/60">{c.desc}</p>
              <button className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#FFD200] transition group-hover:gap-2">
                View Report <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Sample charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Monthly Revenue Trend</h2>
          <p className="text-xs text-white/50">Last 7 months</p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer>
              <LineChart data={REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#0a1218", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="v" stroke="#00A85A" strokeWidth={2.5} dot={{ fill: "#FFD200", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Leads by Service</h2>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer>
              <BarChart data={SERVICE_LEADS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: "#0a1218", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="leads" fill="#FFD200" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Jobs by Region</h2>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer>
              <BarChart data={REGION_JOBS}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0a1218", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="jobs" fill="#00A85A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
