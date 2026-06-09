import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, DollarSign, MapPin, Wrench, Clock, Star } from "lucide-react";

export const Route = createFileRoute("/crm/reports")({
  component: Reports,
});

const reports = [
  { title: "Revenue Trends", desc: "Month-over-month revenue across all services and regions.", icon: TrendingUp, stat: "+18.2%", color: "text-emerald-400" },
  { title: "ROI", desc: "Return on marketing spend across campaigns and channels.", icon: DollarSign, stat: "4.2×", color: "text-[#FFC629]" },
  { title: "Area Performance", desc: "Service activity and revenue by region.", icon: MapPin, stat: "3 regions", color: "text-sky-400" },
  { title: "Service Demand", desc: "Trending services and request volume.", icon: Wrench, stat: "Top: Skip Bin", color: "text-emerald-400" },
  { title: "Response Times", desc: "Average time from request to first contact.", icon: Clock, stat: "12 min", color: "text-[#FFC629]" },
  { title: "Review Requests", desc: "Customer reviews requested and received.", icon: Star, stat: "4.8 / 5", color: "text-emerald-400" },
];

function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-slate-400 mt-1">Operational and growth insights across CEVON'S.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.title} className="text-left bg-[#121a26] border border-white/5 rounded-xl p-5 hover:border-emerald-500/30 transition-colors group">
              <div className="flex items-start justify-between">
                <div className={`h-11 w-11 rounded-lg bg-white/5 grid place-items-center ${r.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-white">{r.stat}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-white group-hover:text-[#FFC629]">{r.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{r.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
