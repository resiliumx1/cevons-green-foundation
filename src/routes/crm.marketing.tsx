import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import {
  Users, Globe, MessageCircle, Phone, DollarSign, TrendingUp, TrendingDown,
  Lightbulb, MapPin, ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/crm/marketing")({
  head: () => ({ meta: [{ title: "Marketing Performance | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: MarketingPage,
});

const KPIS = [
  { label: "Total Leads", value: "428", trend: 18, up: true, icon: Users, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
  { label: "Website Requests", value: "164", trend: 22, up: true, icon: Globe, tone: "text-blue-300", bg: "bg-blue-500/10" },
  { label: "WhatsApp Clicks", value: "312", trend: 31, up: true, icon: MessageCircle, tone: "text-[#00A85A]", bg: "bg-[#00A85A]/10" },
  { label: "Calls", value: "96", trend: 9, up: true, icon: Phone, tone: "text-purple-300", bg: "bg-purple-500/10" },
  { label: "Cost Per Lead", value: "$14.20", trend: -8, up: true, icon: DollarSign, tone: "text-orange-300", bg: "bg-orange-500/10" },
  { label: "Estimated ROI", value: "4.2x", trend: 16, up: true, icon: TrendingUp, tone: "text-[#00A85A]", bg: "bg-[#00A85A]/10" },
];

const CHANNELS = [
  { name: "Website", leads: 164 },
  { name: "WhatsApp", leads: 312 },
  { name: "Google Ads", leads: 142 },
  { name: "Facebook", leads: 88 },
  { name: "Phone", leads: 96 },
  { name: "Referral", leads: 54 },
  { name: "Organic", leads: 121 },
];

const CAMPAIGNS = [
  { name: "Dumpster Rental Georgetown", channel: "Google Ads", leads: 87, cost: 1240, cpl: 14.25, jobs: 31, revenue: 58450, roi: 4.7 },
  { name: "Portable Toilet Rentals", channel: "Facebook", leads: 64, cost: 920, cpl: 14.38, jobs: 22, revenue: 32100, roi: 3.5 },
  { name: "Waste Oil Collection", channel: "Google Ads", leads: 28, cost: 680, cpl: 24.29, jobs: 9, revenue: 87200, roi: 12.8 },
  { name: "Skip Bin Rental Linden", channel: "Facebook", leads: 41, cost: 540, cpl: 13.17, jobs: 14, revenue: 24800, roi: 4.6 },
  { name: "Septic Tank Clearance", channel: "Google Ads", leads: 52, cost: 720, cpl: 13.85, jobs: 19, revenue: 18400, roi: 2.6 },
  { name: "Commercial Waste Management", channel: "LinkedIn", leads: 36, cost: 1080, cpl: 30.0, jobs: 12, revenue: 96500, roi: 8.9 },
];

const SERVICES = [
  { name: "Dumpster Rental", value: 32, color: "#FFD200" },
  { name: "Skip Bin Rental", value: 18, color: "#00A85A" },
  { name: "Septic Tank", value: 14, color: "#E31B23" },
  { name: "Portable Toilet", value: 16, color: "#3B82F6" },
  { name: "Waste Oil", value: 10, color: "#A855F7" },
  { name: "Scrap Metal", value: 6, color: "#F97316" },
  { name: "Other", value: 4, color: "#6B7280" },
];

const REGIONS = [
  { name: "Georgetown", leads: 248, pct: 58 },
  { name: "Linden", leads: 86, pct: 20 },
  { name: "Berbice", leads: 64, pct: 15 },
  { name: "Other", leads: 30, pct: 7 },
];

const FUNNEL = [
  { stage: "Website Visit", count: 12400, pct: 100 },
  { stage: "Form Started", count: 1860, pct: 15 },
  { stage: "Request Submitted", count: 428, pct: 3.5 },
  { stage: "Contacted", count: 384, pct: 3.1 },
  { stage: "Quote Sent", count: 246, pct: 2.0 },
  { stage: "Scheduled", count: 167, pct: 1.35 },
  { stage: "Completed", count: 142, pct: 1.15 },
];

const INSIGHTS = [
  { icon: TrendingUp, text: "Dumpster Rental has the strongest lead volume this month.", tone: "text-[#FFD200]" },
  { icon: MessageCircle, text: "WhatsApp clicks increased by 31%.", tone: "text-[#00A85A]" },
  { icon: MapPin, text: "Georgetown is generating the highest number of requests.", tone: "text-blue-300" },
  { icon: Lightbulb, text: "Waste Oil leads show high commercial value but need faster follow-up.", tone: "text-orange-300" },
];

function MarketingPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Marketing Performance</h1>
        <p className="mt-1 text-sm text-white/60">Track lead sources, campaigns, requests, and revenue impact.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k) => {
          const Icon = k.icon;
          const TrendIcon = k.trend > 0 ? TrendingUp : TrendingDown;
          const good = k.label === "Cost Per Lead" ? k.trend < 0 : k.trend > 0;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50">{k.label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${k.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${k.tone}`} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{k.value}</p>
              <div className={`mt-1 inline-flex items-center gap-1 text-xs ${good ? "text-[#00A85A]" : "text-[#E31B23]"}`}>
                <TrendIcon className="h-3 w-3" />
                {Math.abs(k.trend)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Leads by Channel</h2>
          <p className="text-xs text-white/50">Distribution of inbound lead sources this month</p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer>
              <BarChart data={CHANNELS}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0a1218", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="leads" fill="#FFD200" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Service Demand</h2>
          <p className="text-xs text-white/50">Share of lead volume by service</p>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={SERVICES} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {SERVICES.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a1218", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {SERVICES.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-white/70">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="truncate">{s.name}</span>
                <span className="ml-auto text-white/40">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign performance */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101820]">
        <div className="border-b border-white/[0.06] p-5">
          <h2 className="text-sm font-semibold text-white">Campaign Performance</h2>
          <p className="text-xs text-white/50">Active campaigns ranked by revenue</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Campaign", "Channel", "Leads", "Cost", "Cost/Lead", "Booked Jobs", "Revenue", "ROI"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.name} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3"><span className="rounded border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 text-xs text-white/70">{c.channel}</span></td>
                  <td className="px-4 py-3 text-white/80">{c.leads}</td>
                  <td className="px-4 py-3 text-white/70">${c.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/70">${c.cpl.toFixed(2)}</td>
                  <td className="px-4 py-3 text-white/80">{c.jobs}</td>
                  <td className="px-4 py-3 font-semibold text-[#FFD200]">${c.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${c.roi >= 5 ? "border-[#00A85A]/30 bg-[#00A85A]/10 text-[#00A85A]" : c.roi >= 3 ? "border-[#FFD200]/30 bg-[#FFD200]/10 text-[#FFD200]" : "border-orange-500/30 bg-orange-500/10 text-orange-300"}`}>
                      <ArrowUpRight className="h-3 w-3" />{c.roi.toFixed(1)}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts row 2: Region + Funnel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Area Performance</h2>
          <p className="text-xs text-white/50">Lead distribution by region</p>
          <div className="mt-4 space-y-3">
            {REGIONS.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-white"><MapPin className="h-3.5 w-3.5 text-white/40" />{r.name}</span>
                  <span className="text-white/70">{r.leads} <span className="text-white/40">({r.pct}%)</span></span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00A85A] to-[#FFD200]" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Conversion Funnel</h2>
          <p className="text-xs text-white/50">From website visit to completed job</p>
          <div className="mt-4 space-y-2">
            {FUNNEL.map((f, i) => (
              <div key={f.stage}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80">{f.stage}</span>
                  <span className="text-white/50">{f.count.toLocaleString()} <span className="text-white/40">({f.pct}%)</span></span>
                </div>
                <div className="mt-1 h-7 overflow-hidden rounded-md bg-white/[0.03]">
                  <div
                    className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-[#00A85A]/40 to-[#FFD200]/40 px-2 text-[10px] text-white/80"
                    style={{ width: `${Math.max(10, 100 - i * 13)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#101820] to-[#0a1218] p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD200]/15">
            <Lightbulb className="h-4 w-4 text-[#FFD200]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Insights</h2>
            <p className="text-xs text-white/50">Key takeaways for this period</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {INSIGHTS.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <Icon className={`h-4 w-4 shrink-0 ${ins.tone}`} />
                <p className="text-sm text-white/80">{ins.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
