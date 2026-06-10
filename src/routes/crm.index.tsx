import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Users, MessageCircle, Phone, DollarSign,
  Calendar as CalendarIcon, Download, MoreHorizontal, Globe, Megaphone, Facebook, UserPlus,
  ChevronRight, Inbox, AlertTriangle, StickyNote, CheckCircle2, RefreshCw, TrendingUp, FileText,
} from "lucide-react";

import type { ReactNode, ComponentType } from "react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { CountUp } from "@/components/CountUp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/crm/")({
  component: Dashboard,
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SOURCE_COLORS: Record<string, string> = {
  Direct: "#64748b",
  google_ads: "#FFD200",
  facebook: "#3b82f6",
  whatsapp: "#25D366",
  organic: "#006B35",
  referral: "#a855f7",
  phone: "#E31B23",
  other: "#94a3b8",
};
const SOURCE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Direct: Globe,
  google_ads: Megaphone,
  facebook: Facebook,
  whatsapp: MessageCircle,
  organic: Globe,
  referral: UserPlus,
  phone: Phone,
};
const REGION_PALETTE = ["#006B35", "#FFD200", "#E31B23", "#3b82f6", "#a855f7", "#25D366", "#64748b"];

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfNextMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 1); }
function pctChange(curr: number, prev: number): { change: string; up: boolean } {
  if (prev === 0) {
    if (curr === 0) return { change: "0%", up: true };
    return { change: "+100%", up: true };
  }
  const diff = ((curr - prev) / prev) * 100;
  return { change: `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}%`, up: diff >= 0 };
}
function fmtMoney(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n.toLocaleString()}`;
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/* Data hooks                                                          */
/* ------------------------------------------------------------------ */

function useDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const nextMonthStart = startOfNextMonth(now).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const leads = useQuery({
    queryKey: ["dash", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, created_at, status, region, service, utm_source, contact_method, estimated_value")
        .gte("created_at", lastMonthStart);
      if (error) throw error;
      return data ?? [];
    },
  });

  const allLeads = useQuery({
    queryKey: ["dash", "leads-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("region, service, utm_source, created_at")
        .gte("created_at", new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString());
      if (error) throw error;
      return data ?? [];
    },
  });

  const wonLeads = useQuery({
    queryKey: ["dash", "won-leads-6mo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("estimated_value, created_at, status")
        .eq("status", "won")
        .gte("created_at", sixMonthsAgo);
      if (error) throw error;
      return data ?? [];
    },
  });

  const recentLeads = useQuery({
    queryKey: ["dash", "recent-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, reference, name, service, region, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const activity = useQuery({
    queryKey: ["dash", "activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("id, type, direction, body, created_by, created_at, related_type")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  return { leads, allLeads, wonLeads, recentLeads, activity, monthStart, nextMonthStart, lastMonthStart };
}


/* ------------------------------------------------------------------ */
/* UI building blocks                                                  */
/* ------------------------------------------------------------------ */

function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-[#101820] border border-white/[0.08] rounded-xl transition-colors hover:border-white/[0.14] ${className}`} style={style}>
      {children}
    </div>
  );
}

export function EmptyState({ title = "No data yet", subtitle = "Once data flows in it will appear here.", icon: Icon = Inbox }: { title?: string; subtitle?: string; icon?: ComponentType<{ className?: string }> }) {
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

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div className="h-10 w-10 rounded-full bg-red-500/10 grid place-items-center mb-2">
        <AlertTriangle className="h-4 w-4 text-red-400" />
      </div>
      <p className="text-sm font-semibold text-white">Couldn't load data</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}

function TrendPill({ up, change, label = "vs last month" }: { up: boolean; change: string; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {change} <span className="text-slate-500 font-normal">{label}</span>
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
/* Activity icon mapping                                               */
/* ------------------------------------------------------------------ */

const ACTIVITY_ICON: Record<string, { icon: ComponentType<{ className?: string }>; color: string }> = {
  note: { icon: StickyNote, color: "#94a3b8" },
  call: { icon: Phone, color: "#3b82f6" },
  whatsapp: { icon: MessageCircle, color: "#25D366" },
  sms: { icon: MessageCircle, color: "#a855f7" },
  email: { icon: FileText, color: "#FFD200" },
  status_change: { icon: CheckCircle2, color: "#006B35" },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Dashboard() {
  const d = useDashboardData();
  const now = new Date();
  const monthMs = startOfMonth(now).getTime();
  const nextMonthMs = startOfNextMonth(now).getTime();
  const lastMonthMs = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  /* ---- KPIs ---- */
  const leadsRows = d.leads.data ?? [];
  const leadsThisMonth = leadsRows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= monthMs && t < nextMonthMs;
  }).length;
  const leadsLastMonth = leadsRows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= lastMonthMs && t < monthMs;
  }).length;
  const leadsTrend = pctChange(leadsThisMonth, leadsLastMonth);

  // WhatsApp / Phone / Contact clicks from contact_method on leads this month
  const isWhatsApp = (r: { utm_source?: string | null; contact_method?: string | null }) => {
    const s = (r.utm_source || "").toLowerCase();
    const c = (r.contact_method || "").toLowerCase();
    return s.includes("whatsapp") || s === "wa" || c.includes("whatsapp") || c === "wa";
  };
  const isCall = (r: { utm_source?: string | null; contact_method?: string | null }) => {
    const s = (r.utm_source || "").toLowerCase();
    const c = (r.contact_method || "").toLowerCase();
    return c === "call" || c === "phone" || s === "phone" || s === "call";
  };
  const thisMonthRows = leadsRows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= monthMs && t < nextMonthMs;
  });
  const lastMonthRows = leadsRows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= lastMonthMs && t < monthMs;
  });
  const whatsappThisMonth = thisMonthRows.filter(isWhatsApp).length;
  const whatsappLastMonth = lastMonthRows.filter(isWhatsApp).length;
  const whatsappTrend = pctChange(whatsappThisMonth, whatsappLastMonth);
  const callsThisMonth = thisMonthRows.filter(isCall).length;
  const callsLastMonth = lastMonthRows.filter(isCall).length;
  const callsTrend = pctChange(callsThisMonth, callsLastMonth);

  // Conversion rate (won ÷ total) — across loaded window
  const wonCount = leadsRows.filter((r) => r.status === "won").length;
  const conversionRate = leadsRows.length > 0 ? (wonCount / leadsRows.length) * 100 : 0;
  const wonLastMonth = lastMonthRows.filter((r) => r.status === "won").length;
  const prevConv = lastMonthRows.length > 0 ? (wonLastMonth / lastMonthRows.length) * 100 : 0;
  const convTrend = pctChange(Math.round(conversionRate * 10), Math.round(prevConv * 10));

  const metrics = [
    {
      label: "New Leads", value: leadsThisMonth, trend: leadsTrend,
      icon: Users, accent: "#006B35",
      loading: d.leads.isLoading, error: d.leads.isError, retry: () => d.leads.refetch(),
    },
    {
      label: "WhatsApp Clicks", value: whatsappThisMonth, trend: whatsappTrend,
      icon: MessageCircle, accent: "#25D366",
      loading: d.leads.isLoading, error: d.leads.isError, retry: () => d.leads.refetch(),
    },
    {
      label: "Contact Clicks", value: callsThisMonth, trend: callsTrend,
      icon: Phone, accent: "#3b82f6",
      loading: d.leads.isLoading, error: d.leads.isError, retry: () => d.leads.refetch(),
    },
    {
      label: "Conversion Rate", value: conversionRate, trend: convTrend,
      icon: TrendingUp, accent: "#FFD200",
      loading: d.leads.isLoading, error: d.leads.isError, retry: () => d.leads.refetch(),
      percent: true,
    },
  ];


  /* ---- Sources (this month) ---- */
  const sourcesMap = new Map<string, number>();
  leadsRows
    .filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= monthMs && t < nextMonthMs;
    })
    .forEach((r) => {
      const key = (r.utm_source && r.utm_source.trim()) ? r.utm_source : "Direct";
      sourcesMap.set(key, (sourcesMap.get(key) ?? 0) + 1);
    });
  const sourcesTotal = Array.from(sourcesMap.values()).reduce((a, b) => a + b, 0);
  const sources = Array.from(sourcesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      label: name === "Direct" ? "Direct" : name.replace(/_/g, " "),
      value: count,
      pct: sourcesTotal ? Math.round((count / sourcesTotal) * 100) : 0,
      color: SOURCE_COLORS[name] ?? "#94a3b8",
      icon: SOURCE_ICONS[name] ?? Globe,
    }));

  /* ---- Regions ---- */
  const regionsMap = new Map<string, number>();
  (d.allLeads.data ?? []).forEach((r) => {
    const key = r.region || "Unspecified";
    regionsMap.set(key, (regionsMap.get(key) ?? 0) + 1);
  });
  const regionsTotal = Array.from(regionsMap.values()).reduce((a, b) => a + b, 0);
  const regions = Array.from(regionsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      name, value: count,
      pct: regionsTotal ? Math.round((count / regionsTotal) * 100) : 0,
      color: REGION_PALETTE[i % REGION_PALETTE.length],
    }));

  /* ---- Top services ---- */
  const servicesMap = new Map<string, number>();
  (d.allLeads.data ?? []).forEach((r) => {
    const key = r.service || "Unspecified";
    servicesMap.set(key, (servicesMap.get(key) ?? 0) + 1);
  });
  const servicesArr = Array.from(servicesMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const servicesMax = servicesArr[0]?.[1] ?? 1;
  const services = servicesArr.map(([name, count]) => ({
    name, count, pct: Math.round((count / servicesMax) * 100),
  }));

  /* ---- Won-lead value trend (last 6 months) ---- */
  const months: { key: string; label: string; v: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${dt.getFullYear()}-${dt.getMonth()}`,
      label: dt.toLocaleString("en-US", { month: "short" }),
      v: 0,
    });
  }
  (d.wonLeads.data ?? []).forEach((row) => {
    const pd = new Date(row.created_at);
    const key = `${pd.getFullYear()}-${pd.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.v += Number(row.estimated_value ?? 0);
  });
  const wonValueThisMonth = months[months.length - 1]?.v ?? 0;
  const wonValueLastMonth = months[months.length - 2]?.v ?? 0;
  const wonValueTrend = pctChange(wonValueThisMonth, wonValueLastMonth);


  return (
    <CrmPage className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#101820] border border-white/[0.08] text-sm text-slate-200 hover:border-white/20">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            {now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </button>
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95">
            <Download className="h-4 w-4" /> Export
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
                  <div className="text-3xl font-bold text-white mt-2 tabular-nums">
                    {m.loading ? (
                      <SkeletonBlock className="h-8 w-24 mt-1" />
                    ) : m.error ? (
                      <span className="text-red-400 text-base">—</span>
                    ) : m.percent ? (
                      <><CountUp end={Math.round(m.value as number)} /><span>%</span></>
                    ) : (
                      <CountUp end={m.value as number} />
                    )}
                  </div>
                  <div className="mt-2 min-h-[16px]">
                    {!m.loading && !m.error && m.trend.change && (
                      <TrendPill up={m.trend.up} change={m.trend.change} />
                    )}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0" style={{ background: `${m.accent}1f`, color: m.accent }}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="h-12 mt-2 -mx-1">
                <ResponsiveContainer>
                  <AreaChart data={months.map((mo, idx) => ({ i: idx, v: Math.max(1, (m.value as number) * (0.4 + idx * 0.12)) }))}>
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
          {d.leads.isLoading ? (
            <SkeletonBlock className="h-48 w-full" />
          ) : d.leads.isError ? (
            <ErrorState onRetry={() => d.leads.refetch()} />
          ) : sources.length === 0 ? (
            <EmptyState title="No leads this month" subtitle="New leads will appear here as they come in." />
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-48 w-48 shrink-0 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={sources} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
                      {sources.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, _n, p: { payload?: { label?: string } }) => [v, p?.payload?.label ?? ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Total</div>
                  <div className="text-xl font-bold text-white">{sourcesTotal}</div>
                </div>
              </div>
              <ul className="flex-1 space-y-2 min-w-0">
                {sources.map((s) => (
                  <li key={s.name} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="truncate capitalize">{s.label}</span>
                    <span className="ml-auto text-slate-400 tabular-nums">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2 animate-fade-in" style={{ animationDelay: "80ms" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Won-Lead Value (last 6 months)</h3>
              <div className="text-3xl font-bold text-white mt-1 tabular-nums">
                {d.wonLeads.isLoading ? <SkeletonBlock className="h-8 w-32 mt-1" /> : fmtMoney(wonValueThisMonth)}
              </div>
              {!d.wonLeads.isLoading && !d.wonLeads.isError && (
                <div className="mt-1"><TrendPill up={wonValueTrend.up} change={wonValueTrend.change} /></div>
              )}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400">{now.toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
          </div>
          {d.wonLeads.isLoading ? (
            <SkeletonBlock className="h-52 w-full" />
          ) : d.wonLeads.isError ? (
            <ErrorState onRetry={() => d.wonLeads.refetch()} />
          ) : months.every((m) => m.v === 0) ? (
            <EmptyState title="No won leads yet" subtitle="Move leads to 'Won' to see their estimated value here." />
          ) : (
            <div className="h-52">
              <ResponsiveContainer>
                <LineChart data={months.map((m) => ({ d: m.label, v: m.v }))} margin={{ left: -10, right: 8, top: 4 }}>
                  <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006B35" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#006B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="d" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Won Value"]} />
                  <Line type="monotone" dataKey="v" stroke="#006B35" strokeWidth={2.5} dot={{ fill: "#006B35", r: 3 }} activeDot={{ r: 5, fill: "#FFD200" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>


      {/* Row: Top Services + Leads by Region */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-4">Top Services</h3>
          {d.allLeads.isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="h-6 w-full" />)}</div>
          ) : d.allLeads.isError ? (
            <ErrorState onRetry={() => d.allLeads.refetch()} />
          ) : services.length === 0 ? (
            <EmptyState title="No service data" />
          ) : (
            <div className="space-y-3.5">
              {services.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-200 truncate pr-2">{s.name}</span>
                    <span className="text-slate-400 tabular-nums">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#FFD200] transition-[width] duration-700" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 animate-fade-in lg:col-span-2" style={{ animationDelay: "60ms" }}>
          <h3 className="text-sm font-semibold text-white mb-2">Leads by Region</h3>
          {d.allLeads.isLoading ? (
            <SkeletonBlock className="h-40 w-full" />
          ) : d.allLeads.isError ? (
            <ErrorState onRetry={() => d.allLeads.refetch()} />
          ) : regions.length === 0 ? (
            <EmptyState title="No region data" />
          ) : (
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
                    <span className="ml-auto text-slate-400 tabular-nums">{r.value} ({r.pct}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Row: Recent Leads + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Leads</h3>
            <span className="text-xs text-slate-400">{d.recentLeads.data?.length ?? 0} latest</span>
          </div>
          {d.recentLeads.isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-10 w-full" />)}</div>
          ) : d.recentLeads.isError ? (
            <ErrorState onRetry={() => d.recentLeads.refetch()} />
          ) : (d.recentLeads.data?.length ?? 0) === 0 ? (
            <EmptyState title="No leads yet" subtitle="New service requests will appear here." icon={Inbox} />
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/[0.08]">
                    <th className="px-5 py-2.5 font-medium">When</th>
                    <th className="px-3 py-2.5 font-medium">Name</th>
                    <th className="px-3 py-2.5 font-medium">Service</th>
                    <th className="px-3 py-2.5 font-medium">Region</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.recentLeads.data ?? []).map((b) => (
                    <tr key={b.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-slate-300 whitespace-nowrap">{timeAgo(b.created_at)}</td>
                      <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{b.name ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{b.service ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{b.region ?? "—"}</td>
                      <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button className="mt-4 w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 py-2 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/5 transition-colors">
            View All Leads <ChevronRight className="h-3 w-3" />
          </button>
        </Card>


        <Card className="p-5 flex flex-col animate-fade-in" style={{ animationDelay: "80ms" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          {d.activity.isLoading ? (
            <div className="space-y-3 flex-1">{[...Array(6)].map((_, i) => <SkeletonBlock key={i} className="h-10 w-full" />)}</div>
          ) : d.activity.isError ? (
            <ErrorState onRetry={() => d.activity.refetch()} />
          ) : (d.activity.data?.length ?? 0) === 0 ? (
            <EmptyState title="No activity yet" subtitle="Notes, calls and messages will show here." />
          ) : (
            <ul className="space-y-4 flex-1">
              {(d.activity.data ?? []).map((a) => {
                const meta = ACTIVITY_ICON[a.type] ?? { icon: StickyNote, color: "#94a3b8" };
                const Icon = meta.icon;
                return (
                  <li key={a.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${meta.color}1f`, color: meta.color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium leading-tight capitalize">
                        {a.type.replace("_", " ")} {a.direction ? `• ${a.direction}` : ""}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{a.body ?? a.related_type}</p>
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">{timeAgo(a.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <button className="mt-5 w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-300 hover:text-white py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            View All Activity <ChevronRight className="h-3 w-3" />
          </button>
        </Card>
      </div>
    </CrmPage>
  );
}
