import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import {
  Users, Globe, MessageCircle, Phone, DollarSign, TrendingUp, TrendingDown,
  Lightbulb, MapPin, ArrowUpRight, Plus, X, Edit3, Trash2, AlertCircle, RefreshCw, Lock,
} from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { UtmLinkBuilder } from "@/components/crm/UtmLinkBuilder";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/crm/marketing")({
  head: () => ({ meta: [{ title: "Marketing Performance | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: MarketingPage,
});

type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];
type SR = Database["public"]["Tables"]["service_requests"]["Row"];


const CHANNEL_OPTIONS = ["google_ads", "facebook", "whatsapp", "referral", "organic", "other"] as const;
const PIE_COLORS = ["#FFD200", "#006B35", "#E31B23", "#3B82F6", "#A855F7", "#F97316", "#6B7280", "#22D3EE"];

function fmtMoney(n: number) {
  return `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function isWhatsApp(r: SR): boolean {
  const s = (r.utm_source || "").toLowerCase();
  const m = (r.utm_medium || "").toLowerCase();
  const c = (r.contact_method || "").toLowerCase();
  return s.includes("whatsapp") || s === "wa" || m.includes("whatsapp") || c.includes("whatsapp") || c === "wa";
}
function isCall(r: SR): boolean {
  const c = (r.contact_method || "").toLowerCase();
  const s = (r.utm_source || "").toLowerCase();
  return c === "call" || c === "phone" || s === "phone" || s === "call";
}
function isWebsite(r: SR): boolean {
  // website requests: came via the public form (has landing_page or no utm_source override to messaging app)
  if (isWhatsApp(r) || isCall(r)) return false;
  return !!r.landing_page || !!r.utm_source || true; // any service_request that isn't WA/call is a website request
}

function MarketingPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CampaignRow | "new" | null>(null);

  const requestsQ = useQuery({
    queryKey: ["marketing:requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id,status,service,region,utm_source,utm_medium,utm_campaign,contact_method,landing_page,customer_id,estimated_value,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SR[];
    },
  });

  const campaignsQ = useQuery({
    queryKey: ["marketing:campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as CampaignRow[];
    },
  });

  const loading = requestsQ.isLoading || campaignsQ.isLoading;
  const errored = requestsQ.error || campaignsQ.error;

  const requests = requestsQ.data || [];
  const campaigns = campaignsQ.data || [];

  const totals = useMemo(() => {
    const total = requests.length;
    const whatsapp = requests.filter(isWhatsApp).length;
    const calls = requests.filter(isCall).length;
    const website = total - whatsapp - calls;
    const totalCost = campaigns.reduce((s, c) => s + Number(c.cost || 0), 0);
    const cpl = total > 0 ? totalCost / total : 0;

    // revenue from won leads using estimated_value (no invoices table dependency)
    const wonLeads = requests.filter((r) => r.status === "won");
    const revenue = wonLeads.reduce((s, r) => s + Number(r.estimated_value || 0), 0);
    const roi = totalCost > 0 ? revenue / totalCost : 0;
    const conversionRate = total > 0 ? (wonLeads.length / total) * 100 : 0;

    return { total, whatsapp, calls, website, totalCost, cpl, revenue, roi, conversionRate, wonCount: wonLeads.length };
  }, [requests, campaigns]);


  const channelData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests) {
      let key = (r.utm_source || "").toLowerCase().trim();
      if (!key) {
        if (isWhatsApp(r)) key = "whatsapp";
        else if (isCall(r)) key = "phone";
        else key = "direct";
      }
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
      map.set(label, (map.get(label) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, leads]) => ({ name, leads })).sort((a, b) => b.leads - a.leads);
  }, [requests]);

  const serviceData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests) {
      const k = r.service || "Unspecified";
      map.set(k, (map.get(k) || 0) + 1);
    }
    const arr = Array.from(map.entries()).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));
    return arr.sort((a, b) => b.value - a.value).slice(0, 8);
  }, [requests]);

  const regionData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests) {
      const k = r.region || "Unspecified";
      map.set(k, (map.get(k) || 0) + 1);
    }
    const total = requests.length || 1;
    return Array.from(map.entries())
      .map(([name, leads]) => ({ name, leads, pct: Math.round((leads / total) * 100) }))
      .sort((a, b) => b.leads - a.leads);
  }, [requests]);

  const funnel = useMemo(() => {
    const count = (s: string) => requests.filter((r) => r.status === s).length;
    const newC = count("new");
    const contacted = count("contacted");
    const quoted = count("quoted");
    const won = count("won");
    const all = requests.length || 1;
    return [
      { stage: "New", count: newC, pct: Math.round((newC / all) * 100) },
      { stage: "Contacted", count: contacted, pct: Math.round((contacted / all) * 100) },
      { stage: "Quoted", count: quoted, pct: Math.round((quoted / all) * 100) },
      { stage: "Won", count: won, pct: Math.round((won / all) * 100) },
    ];
  }, [requests]);

  const campaignMetrics = useMemo(() => {
    return campaigns.map((c) => {
      const utm = (c.utm_campaign || "").toLowerCase();
      const matched = utm
        ? requests.filter((r) => (r.utm_campaign || "").toLowerCase() === utm)
        : [];
      const leads = matched.length;
      const wonLeads = matched.filter((r) => r.status === "won");
      const revenue = wonLeads.reduce((s, r) => s + Number(r.estimated_value || 0), 0);
      const cost = Number(c.cost || 0);
      const cpl = leads > 0 ? cost / leads : 0;
      const roi = cost > 0 ? revenue / cost : 0;
      return { ...c, leads, won: wonLeads.length, revenue, cpl, roi };
    });
  }, [campaigns, requests]);


  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marketing:campaigns"] }),
  });

  const KPIS = [
    { label: "Total Leads", value: totals.total.toString(), icon: Users, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
    { label: "Website Requests", value: Math.max(totals.website, 0).toString(), icon: Globe, tone: "text-blue-300", bg: "bg-blue-500/10" },
    { label: "WhatsApp Clicks", value: totals.whatsapp.toString(), icon: MessageCircle, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
    { label: "Calls", value: totals.calls.toString(), icon: Phone, tone: "text-purple-300", bg: "bg-purple-500/10" },
    { label: "Cost Per Lead", value: totals.total > 0 ? `$${totals.cpl.toFixed(2)}` : "—", icon: DollarSign, tone: "text-orange-300", bg: "bg-orange-500/10" },
    { label: "Estimated ROI", value: totals.totalCost > 0 ? `${totals.roi.toFixed(1)}x` : "—", icon: TrendingUp, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
  ];

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Marketing Performance</h1>
          <p className="mt-1 text-sm text-white/60">Lead attribution from website + UTMs. Campaign spend entered manually; ROI &amp; CPL are computed.</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-medium text-[#0a1218] hover:bg-[#FFD200]/90"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      {errored ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Failed to load marketing data.</span>
          <button
            onClick={() => { requestsQ.refetch(); campaignsQ.refetch(); }}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-white hover:bg-white/5"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50">{k.label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${k.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${k.tone}`} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{loading ? "…" : k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Ad-platform placeholder */}
      <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-white/60">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
        <span>
          <strong className="text-white/80">Connect later:</strong> ad impressions, click costs and real-time spend from Google Ads / Meta Ads will appear here once the GHL integration and ad-platform connectors are linked.
        </span>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Leads by Channel</h2>
          <p className="text-xs text-white/50">Grouped by UTM source (falls back to WhatsApp/Phone/Direct)</p>
          <div className="mt-4 h-[280px]">
            {channelData.length === 0 && !loading ? (
              <div className="flex h-full items-center justify-center text-sm text-white/40">No leads yet.</div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0a1218", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Bar dataKey="leads" fill="#FFD200" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Service Demand</h2>
          <p className="text-xs text-white/50">Share of lead volume by service</p>
          <div className="mt-4 h-[220px]">
            {serviceData.length === 0 && !loading ? (
              <div className="flex h-full items-center justify-center text-sm text-white/40">No service data.</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={serviceData} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {serviceData.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0a1218", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {serviceData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-white/70">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="truncate">{s.name}</span>
                <span className="ml-auto text-white/40">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign performance */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101820]">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Campaign Performance</h2>
            <p className="text-xs text-white/50">Manual cost · auto-computed leads, revenue, CPL, ROI</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Campaign", "Channel", "UTM", "Leads", "Cost", "CPL", "Won", "Revenue", "ROI", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-white/40">Loading…</td></tr>
              ) : campaignMetrics.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-white/40">No campaigns yet. Click "New Campaign" to add one.</td></tr>
              ) : campaignMetrics.map((c) => (
                <tr key={c.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3"><span className="rounded border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 text-xs text-white/70">{c.channel || "—"}</span></td>
                  <td className="px-4 py-3 text-white/60 font-mono text-xs">{c.utm_campaign || "—"}</td>
                  <td className="px-4 py-3 text-white/80">{c.leads}</td>
                  <td className="px-4 py-3 text-white/70">{fmtMoney(Number(c.cost))}</td>
                  <td className="px-4 py-3 text-white/70">{c.leads > 0 ? `$${c.cpl.toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3 text-white/80">{c.won}</td>
                  <td className="px-4 py-3 font-semibold text-[#FFD200]">{fmtMoney(c.revenue)}</td>
                  <td className="px-4 py-3">
                    {Number(c.cost) > 0 ? (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${c.roi >= 5 ? "border-[#006B35]/30 bg-[#006B35]/10 text-[#006B35]" : c.roi >= 3 ? "border-[#FFD200]/30 bg-[#FFD200]/10 text-[#FFD200]" : "border-orange-500/30 bg-orange-500/10 text-orange-300"}`}>
                        <ArrowUpRight className="h-3 w-3" />{c.roi.toFixed(1)}x
                      </span>
                    ) : <span className="text-white/40 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(c)} className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { if (confirm(`Delete campaign "${c.name}"?`)) deleteMut.mutate(c.id); }} className="rounded p-1 text-white/60 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Area Performance</h2>
          <p className="text-xs text-white/50">Lead distribution by region</p>
          <div className="mt-4 space-y-3">
            {regionData.length === 0 && !loading ? (
              <p className="text-sm text-white/40">No region data.</p>
            ) : regionData.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-white"><MapPin className="h-3.5 w-3.5 text-white/40" />{r.name}</span>
                  <span className="text-white/70">{r.leads} <span className="text-white/40">({r.pct}%)</span></span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#006B35] to-[#FFD200]" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
          <h2 className="text-sm font-semibold text-white">Conversion Funnel</h2>
          <p className="text-xs text-white/50">Lead status flow: new → contacted → quoted → won</p>
          <div className="mt-4 space-y-2">
            {funnel.map((f, i) => {
              const maxCount = Math.max(...funnel.map((x) => x.count), 1);
              const width = Math.max(8, (f.count / maxCount) * 100);
              return (
                <div key={f.stage}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">{f.stage}</span>
                    <span className="text-white/50">{f.count.toLocaleString()} <span className="text-white/40">({f.pct}%)</span></span>
                  </div>
                  <div className="mt-1 h-7 overflow-hidden rounded-md bg-white/[0.03]">
                    <div
                      className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-[#006B35]/40 to-[#FFD200]/40 px-2 text-[10px] text-white/80"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* UTM Link Builder */}
      <UtmLinkBuilder />

      {/* Insights placeholder */}
      <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#101820] to-[#0a1218] p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD200]/15">
            <Lightbulb className="h-4 w-4 text-[#FFD200]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Insights</h2>
            <p className="text-xs text-white/50">Automated takeaways will appear once the AI insights engine is connected.</p>
          </div>
        </div>
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/50">
          Connect later — needs aggregated month-over-month data + ad-platform spend.
        </div>
      </div>

      {editing ? (
        <CampaignEditor
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["marketing:campaigns"] }); }}
        />
      ) : null}
    </CrmPage>
  );
}

function CampaignEditor({ initial, onClose, onSaved }: { initial: CampaignRow | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    channel: initial?.channel || "google_ads",
    utm_campaign: initial?.utm_campaign || "",
    start_date: initial?.start_date || "",
    end_date: initial?.end_date || "",
    cost: initial?.cost?.toString() || "0",
    status: initial?.status || "active",
  });
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      const payload = {
        name: form.name.trim(),
        channel: form.channel || null,
        utm_campaign: form.utm_campaign.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        cost: Number(form.cost) || 0,
        status: form.status,
      };
      if (initial) {
        const { error } = await supabase.from("campaigns").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("campaigns").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: onSaved,
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0a1218] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{initial ? "Edit Campaign" : "New Campaign"}</h3>
          <button onClick={onClose} className="rounded p-1 text-white/60 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Dumpster Rental Georgetown" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Channel">
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="input">
                {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="ended">ended</option>
              </select>
            </Field>
          </div>
          <Field label="UTM Campaign (match to service_requests.utm_campaign)">
            <input value={form.utm_campaign} onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })} className="input font-mono" placeholder="dumpster_geo_2025" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input" />
            </Field>
            <Field label="End date">
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Cost (USD)">
            <input type="number" min="0" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input" />
          </Field>
          {err ? <p className="text-xs text-red-300">{err}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5">Cancel</button>
            <button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-medium text-[#0a1218] hover:bg-[#FFD200]/90 disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        <style>{`.input{width:100%;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);padding:8px 12px;font-size:14px;color:white;outline:none}.input:focus{border-color:#FFD200}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/60">{label}</span>
      {children}
    </label>
  );
}
