import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, Target, MapPin, CheckSquare, DollarSign, Users, Download, AlertCircle, RefreshCw,
} from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { CrmTooltip, CRM_AXIS, CRM_GRID, CRM_TOOLTIP_CURSOR, CRM_TOOLTIP_LINE_CURSOR } from "@/components/crm/chartTheme";

export const Route = createFileRoute("/crm/reports")({
  head: () => ({ meta: [{ title: "Reports | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: ReportsPage,
});

type SR = Database["public"]["Tables"]["service_requests"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type JobRow = Database["public"]["Tables"]["jobs"]["Row"];

type Preset = "this_month" | "last_month" | "quarter" | "ytd" | "custom";

function startOf(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function rangeFor(preset: Preset, custom: { from: string; to: string }): { from: Date; to: Date } {
  const today = startOf(new Date());
  if (preset === "this_month") {
    return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59) };
  }
  if (preset === "last_month") {
    return { from: new Date(today.getFullYear(), today.getMonth() - 1, 1), to: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59) };
  }
  if (preset === "quarter") {
    const q = Math.floor(today.getMonth() / 3);
    return { from: new Date(today.getFullYear(), q * 3, 1), to: new Date(today.getFullYear(), q * 3 + 3, 0, 23, 59, 59) };
  }
  if (preset === "ytd") {
    return { from: new Date(today.getFullYear(), 0, 1), to: new Date(today.getFullYear(), 11, 31, 23, 59, 59) };
  }
  return {
    from: custom.from ? new Date(custom.from) : new Date(today.getFullYear(), today.getMonth(), 1),
    to: custom.to ? new Date(custom.to + "T23:59:59") : today,
  };
}

function toISODate(d: Date) { return d.toISOString().slice(0, 10); }
function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString(undefined, { month: "short", year: "2-digit" });
}
function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function ReportsPage() {
  const [preset, setPreset] = useState<Preset>("this_month");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const { from, to } = useMemo(() => rangeFor(preset, custom), [preset, custom]);
  const fromISO = from.toISOString();
  const toISO = to.toISOString();
  const fromDate = toISODate(from);
  const toDate = toISODate(to);

  const requestsQ = useQuery({
    queryKey: ["reports:requests", fromISO, toISO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id,status,service,region,utm_source,utm_medium,utm_campaign,contact_method,estimated_value,created_at,customer_id")
        .gte("created_at", fromISO).lte("created_at", toISO);
      if (error) throw error;
      return (data || []) as SR[];
    },
  });

  const invoicesQ = useQuery({
    queryKey: ["reports:invoices", fromDate, toDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id,status,total,customer_id,job_id,paid_date,issued_date")
        .eq("status", "paid")
        .gte("paid_date", fromDate).lte("paid_date", toDate);
      if (error) throw error;
      return (data || []) as Pick<InvoiceRow, "id" | "status" | "total" | "customer_id" | "job_id" | "paid_date" | "issued_date">[];
    },
  });

  const jobsQ = useQuery({
    queryKey: ["reports:jobs", fromISO, toISO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,status,service,region,scheduled_start,service_request_id,customer_id,updated_at,created_at");
      if (error) throw error;
      return (data || []) as Pick<JobRow, "id" | "status" | "service" | "region" | "scheduled_start" | "service_request_id" | "customer_id" | "updated_at" | "created_at">[];
    },
  });

  const loading = requestsQ.isLoading || invoicesQ.isLoading || jobsQ.isLoading;
  const errored = requestsQ.error || invoicesQ.error || jobsQ.error;
  const requests = requestsQ.data || [];
  const invoices = invoicesQ.data || [];
  const jobs = jobsQ.data || [];

  const completedJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (j.status !== "completed") return false;
      const t = j.updated_at ? new Date(j.updated_at) : null;
      return t ? t >= from && t <= to : false;
    });
  }, [jobs, from, to]);

  const kpis = useMemo(() => {
    const totalLeads = requests.length;
    const won = requests.filter((r) => r.status === "won").length;
    const conversion = totalLeads > 0 ? (won / totalLeads) * 100 : 0;
    const revenue = invoices.reduce((s, inv) => s + Number(inv.total || 0), 0);
    const avgDeal = invoices.length > 0 ? revenue / invoices.length : 0;
    return { totalLeads, won, conversion, revenue, avgDeal, jobsDone: completedJobs.length };
  }, [requests, invoices, completedJobs]);

  // Trends grouped by month within range
  const monthBuckets = useMemo(() => {
    const keys: string[] = [];
    const cur = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);
    while (cur <= end) {
      keys.push(monthKey(cur));
      cur.setMonth(cur.getMonth() + 1);
    }
    return keys;
  }, [from, to]);

  const revenueTrend = useMemo(() => {
    const map = new Map(monthBuckets.map((k) => [k, 0]));
    for (const inv of invoices) {
      if (!inv.paid_date) continue;
      const k = monthKey(new Date(inv.paid_date));
      if (map.has(k)) map.set(k, map.get(k)! + Number(inv.total || 0));
    }
    return Array.from(map.entries()).map(([k, v]) => ({ m: monthLabel(k), v }));
  }, [invoices, monthBuckets]);

  const leadTrend = useMemo(() => {
    const map = new Map(monthBuckets.map((k) => [k, 0]));
    for (const r of requests) {
      const k = monthKey(new Date(r.created_at));
      if (map.has(k)) map.set(k, map.get(k)! + 1);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ m: monthLabel(k), v }));
  }, [requests, monthBuckets]);

  // Region performance
  const regionRows = useMemo(() => {
    const map = new Map<string, { leads: number; won: number; revenue: number }>();
    for (const r of requests) {
      const k = r.region || "Unspecified";
      const row = map.get(k) || { leads: 0, won: 0, revenue: 0 };
      row.leads += 1;
      if (r.status === "won") row.won += 1;
      map.set(k, row);
    }
    // attribute revenue via jobs.region (preferred) or fallback to request region by customer
    const jobRegionById = new Map(jobs.map((j) => [j.id, j.region]));
    const reqRegionByCustomer = new Map<string, string>();
    for (const r of requests) if (r.customer_id && r.region) reqRegionByCustomer.set(r.customer_id, r.region);
    for (const inv of invoices) {
      let region: string | null | undefined = inv.job_id ? jobRegionById.get(inv.job_id) : undefined;
      if (!region && inv.customer_id) region = reqRegionByCustomer.get(inv.customer_id);
      const k = region || "Unspecified";
      const row = map.get(k) || { leads: 0, won: 0, revenue: 0 };
      row.revenue += Number(inv.total || 0);
      map.set(k, row);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, conv: v.leads > 0 ? (v.won / v.leads) * 100 : 0 }))
      .sort((a, b) => b.revenue - a.revenue || b.leads - a.leads);
  }, [requests, invoices, jobs]);

  // Lead source performance
  const sourceRows = useMemo(() => {
    const map = new Map<string, { leads: number; won: number }>();
    for (const r of requests) {
      let key = (r.utm_source || "").toLowerCase();
      if (!key) {
        const c = (r.contact_method || "").toLowerCase();
        if (c.includes("whatsapp")) key = "whatsapp";
        else if (c === "call" || c === "phone") key = "phone";
        else key = "direct";
      }
      const row = map.get(key) || { leads: 0, won: 0 };
      row.leads += 1;
      if (r.status === "won") row.won += 1;
      map.set(key, row);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, conv: v.leads > 0 ? (v.won / v.leads) * 100 : 0 }))
      .sort((a, b) => b.leads - a.leads);
  }, [requests]);

  // Top services by volume (leads) and by revenue (paid invoices linked to jobs)
  const servicesByVolume = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests) map.set(r.service || "Unspecified", (map.get(r.service || "Unspecified") || 0) + 1);
    return Array.from(map.entries()).map(([name, leads]) => ({ name, leads })).sort((a, b) => b.leads - a.leads).slice(0, 8);
  }, [requests]);

  const servicesByRevenue = useMemo(() => {
    const jobServiceById = new Map(jobs.map((j) => [j.id, j.service || "Unspecified"]));
    const reqServiceByCustomer = new Map<string, string>();
    for (const r of requests) if (r.customer_id && r.service) reqServiceByCustomer.set(r.customer_id, r.service);
    const map = new Map<string, number>();
    for (const inv of invoices) {
      let svc: string | undefined = inv.job_id ? jobServiceById.get(inv.job_id) : undefined;
      if (!svc && inv.customer_id) svc = reqServiceByCustomer.get(inv.customer_id);
      const key = svc || "Unspecified";
      map.set(key, (map.get(key) || 0) + Number(inv.total || 0));
    }
    return Array.from(map.entries()).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [invoices, jobs, requests]);

  function exportCSV() {
    const lines: string[] = [];
    lines.push(`Reports export,${fromDate} to ${toDate}`);
    lines.push("");
    lines.push("KPIs");
    lines.push(["Total Leads", "Won", "Conversion %", "Revenue", "Avg Deal Value", "Jobs Completed"].join(","));
    lines.push([kpis.totalLeads, kpis.won, kpis.conversion.toFixed(1), kpis.revenue.toFixed(2), kpis.avgDeal.toFixed(2), kpis.jobsDone].map(csvEscape).join(","));
    lines.push("");
    lines.push("Revenue trend (paid invoices)");
    lines.push("Month,Revenue");
    revenueTrend.forEach((r) => lines.push([r.m, r.v.toFixed(2)].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Lead trend");
    lines.push("Month,Leads");
    leadTrend.forEach((r) => lines.push([r.m, r.v].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Region performance");
    lines.push("Region,Leads,Won,Conversion %,Revenue");
    regionRows.forEach((r) => lines.push([r.name, r.leads, r.won, r.conv.toFixed(1), r.revenue.toFixed(2)].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Lead source performance");
    lines.push("Source,Leads,Won,Conversion %");
    sourceRows.forEach((r) => lines.push([r.name, r.leads, r.won, r.conv.toFixed(1)].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Top services by volume");
    lines.push("Service,Leads");
    servicesByVolume.forEach((r) => lines.push([r.name, r.leads].map(csvEscape).join(",")));
    lines.push("");
    lines.push("Top services by revenue");
    lines.push("Service,Revenue");
    servicesByRevenue.forEach((r) => lines.push([r.name, r.revenue.toFixed(2)].map(csvEscape).join(",")));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `cevons-report-${fromDate}_${toDate}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  const KPI_CARDS = [
    { label: "Total Leads", value: kpis.totalLeads.toString(), icon: Users, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
    { label: "Revenue", value: `$${kpis.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
    { label: "Conversion", value: `${kpis.conversion.toFixed(1)}%`, icon: Target, tone: "text-blue-300", bg: "bg-blue-500/10" },
    { label: "Avg Deal", value: `$${kpis.avgDeal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, tone: "text-purple-300", bg: "bg-purple-500/10" },
    { label: "Jobs Done", value: kpis.jobsDone.toString(), icon: CheckSquare, tone: "text-orange-300", bg: "bg-orange-500/10" },
  ];

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Reports</h1>
          <p className="mt-1 text-sm text-white/60">Performance across revenue, leads, regions and services.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
            {([
              ["this_month", "This month"],
              ["last_month", "Last month"],
              ["quarter", "Quarter"],
              ["ytd", "YTD"],
              ["custom", "Custom"],
            ] as [Preset, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setPreset(k)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${preset === k ? "bg-[#006B35] text-white" : "text-white/70 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
          {preset === "custom" ? (
            <div className="flex items-center gap-1">
              <input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white" />
              <span className="text-white/40">→</span>
              <input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white" />
            </div>
          ) : null}
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {errored ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Failed to load report data.</span>
          <button onClick={() => { requestsQ.refetch(); invoicesQ.refetch(); jobsQ.refetch(); }} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-white hover:bg-white/5">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {KPI_CARDS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50">{k.label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${k.bg}`}><Icon className={`h-3.5 w-3.5 ${k.tone}`} /></div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{loading ? "…" : k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Paid invoices over time">
          {revenueTrend.length === 0 && !loading ? <Empty /> : (
            <ResponsiveContainer>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CRM_GRID} />
                <XAxis dataKey="m" stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} />
                <YAxis stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CrmTooltip valueFormatter={(v) => `$${Number(v).toLocaleString()}`} />} cursor={CRM_TOOLTIP_LINE_CURSOR} wrapperStyle={{ zIndex: 50 }} />
                <Line type="monotone" dataKey="v" name="Revenue" stroke="#006B35" strokeWidth={2.5} dot={{ fill: "#006B35", r: 4 }} activeDot={{ r: 6, fill: "#0FA34A" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Lead Trend" subtitle="New service requests over time">
          {leadTrend.length === 0 && !loading ? <Empty /> : (
            <ResponsiveContainer>
              <LineChart data={leadTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CRM_GRID} />
                <XAxis dataKey="m" stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} />
                <YAxis stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} />
                <Tooltip content={<CrmTooltip valueFormatter={(v) => `${Number(v).toLocaleString()} leads`} />} cursor={CRM_TOOLTIP_LINE_CURSOR} wrapperStyle={{ zIndex: 50 }} />
                <Line type="monotone" dataKey="v" name="Leads" stroke="#0FA34A" strokeWidth={2.5} dot={{ fill: "#006B35", r: 4 }} activeDot={{ r: 6, fill: "#0FA34A" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Region table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101820]">
        <div className="border-b border-white/[0.06] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white"><MapPin className="h-4 w-4 text-blue-300" /> Area Performance</h2>
          <p className="text-xs text-white/50">Leads, won, and revenue by region</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Region", "Leads", "Won", "Conversion", "Revenue"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-white/40">Loading…</td></tr>
              ) : regionRows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-white/40">No regional data for this range.</td></tr>
              ) : regionRows.map((r) => (
                <tr key={r.name} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3 text-white/80">{r.leads}</td>
                  <td className="px-4 py-3 text-white/80">{r.won}</td>
                  <td className="px-4 py-3 text-white/70">{r.conv.toFixed(1)}%</td>
                  <td className={`px-4 py-3 font-semibold ${r.revenue > 0 ? "text-[#006B35]" : "text-white/50"}`}>${r.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source + services */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-[#101820]">
          <div className="border-b border-white/[0.06] p-5">
            <h2 className="text-sm font-semibold text-white">Lead Source Performance</h2>
            <p className="text-xs text-white/50">Leads and conversion by UTM source / channel</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Source", "Leads", "Won", "Conv"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-white/40">Loading…</td></tr>
              ) : sourceRows.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-white/40">No sources for this range.</td></tr>
              ) : sourceRows.map((r) => (
                <tr key={r.name} className="border-t border-white/[0.04]">
                  <td className="px-4 py-3 text-white capitalize">{r.name}</td>
                  <td className="px-4 py-3 text-white/80">{r.leads}</td>
                  <td className="px-4 py-3 text-white/80">{r.won}</td>
                  <td className="px-4 py-3 text-white/70">{r.conv.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ChartCard title="Top Services by Volume" subtitle="Leads per service">
          {servicesByVolume.length === 0 && !loading ? <Empty /> : (
            <ResponsiveContainer>
              <BarChart data={servicesByVolume} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CRM_GRID} />
                <XAxis type="number" stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} />
                <YAxis dataKey="name" type="category" stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} width={120} />
                <Tooltip content={<CrmTooltip valueFormatter={(v) => `${Number(v).toLocaleString()} leads`} />} cursor={CRM_TOOLTIP_CURSOR} wrapperStyle={{ zIndex: 50 }} />
                <Bar dataKey="leads" name="Leads" fill="#FFD200" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Top Services by Revenue" subtitle="Paid invoices attributed to service">
        {servicesByRevenue.length === 0 && !loading ? <Empty /> : (
          <ResponsiveContainer>
            <BarChart data={servicesByRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke={CRM_GRID} />
              <XAxis dataKey="name" stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} />
              <YAxis stroke={CRM_AXIS} fontSize={11} tick={{ fill: CRM_AXIS }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CrmTooltip valueFormatter={(v) => `$${Number(v).toLocaleString()}`} />} cursor={CRM_TOOLTIP_CURSOR} wrapperStyle={{ zIndex: 50 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#006B35" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </CrmPage>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {subtitle ? <p className="text-xs text-white/50">{subtitle}</p> : null}
      <div className="mt-4 h-[260px]">{children}</div>
    </div>
  );
}

function Empty() {
  return <div className="flex h-full items-center justify-center text-sm text-white/40">No data for this range.</div>;
}
