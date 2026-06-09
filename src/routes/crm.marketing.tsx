import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { MousePointerClick, Phone, MessageCircle, Globe, TrendingUp, DollarSign } from "lucide-react";

export const Route = createFileRoute("/crm/marketing")({
  component: Marketing,
});

const campaigns = [
  { name: "Google Ads – Skip Bins", leads: 48, cpl: 12.4, cpj: 84 },
  { name: "Meta – Residential", leads: 32, cpl: 9.1, cpj: 67 },
  { name: "Google Ads – Septic", leads: 21, cpl: 18.7, cpj: 112 },
  { name: "Meta – Commercial", leads: 17, cpl: 22.3, cpj: 144 },
  { name: "Organic Search", leads: 64, cpl: 0, cpj: 0 },
];

const channelStats = [
  { label: "Website Conversions", value: "5.4%", icon: Globe, color: "text-emerald-400" },
  { label: "WhatsApp Clicks", value: "1,284", icon: MessageCircle, color: "text-[#FFC629]" },
  { label: "Calls", value: "342", icon: Phone, color: "text-sky-400" },
  { label: "Cost per Lead", value: "$11.20", icon: DollarSign, color: "text-emerald-400" },
  { label: "Cost per Booked Job", value: "$78.40", icon: TrendingUp, color: "text-[#FFC629]" },
  { label: "Click-through Rate", value: "4.8%", icon: MousePointerClick, color: "text-sky-400" },
];

const channelMix = [
  { name: "Google Ads", v: 69 },
  { name: "Meta Ads", v: 49 },
  { name: "Organic", v: 64 },
  { name: "Direct", v: 28 },
  { name: "Referral", v: 18 },
];

function Marketing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Marketing</h1>
        <p className="text-sm text-slate-400 mt-1">Campaign performance and channel insights.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {channelStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#121a26] border border-white/5 rounded-xl p-4">
              <Icon className={`h-5 w-5 ${s.color}`} />
              <div className="text-2xl font-bold text-white mt-3">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#121a26] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Leads by Campaign</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
                  <th className="py-2 font-medium">Campaign</th>
                  <th className="py-2 font-medium">Leads</th>
                  <th className="py-2 font-medium">Cost / Lead</th>
                  <th className="py-2 font-medium">Cost / Booked Job</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.name} className="border-b border-white/5">
                    <td className="py-3 text-white">{c.name}</td>
                    <td className="py-3 text-slate-300">{c.leads}</td>
                    <td className="py-3 text-slate-300">{c.cpl ? `$${c.cpl.toFixed(2)}` : "—"}</td>
                    <td className="py-3 text-slate-300">{c.cpj ? `$${c.cpj.toFixed(2)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#121a26] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Channel Mix</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={channelMix}>
                <CartesianGrid stroke="#ffffff08" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f1620", border: "1px solid #ffffff10", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="v" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
