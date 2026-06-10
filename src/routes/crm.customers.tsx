import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Filter, Plus, X, Users, UserPlus, Building2, Repeat,
  Phone, Mail, MapPin, FileText, AlertTriangle, RefreshCw, Inbox,
  Pencil, Archive, Trash2, ChevronDown, Upload,
} from "lucide-react";

import { ImportCustomersDialog } from "@/components/crm/ImportCustomersDialog";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/crm/customers")({
  head: () => ({ meta: [{ title: "Customers | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: CustomersPage,
});

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Lead = Database["public"]["Tables"]["service_requests"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];
type Quote = Database["public"]["Tables"]["quotes"]["Row"];
type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type Activity = Database["public"]["Tables"]["activities"]["Row"];

const TYPES = ["Residential", "Commercial", "Industrial", "Government / Municipal", "Institution"] as const;
const STATUSES = ["active", "lead", "inactive"] as const;
type Status = typeof STATUSES[number];

const TYPE_STYLES: Record<string, string> = {
  Residential: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Commercial: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  Industrial: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Government / Municipal": "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  Institution: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};
const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  lead: "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  inactive: "bg-white/[0.06] text-white/50 border-white/[0.1]",
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function money(n: number | null | undefined) {
  return `$${Number(n ?? 0).toLocaleString()}`;
}

/* ------------------------------------------------------------------ */
/* Data hooks                                                          */
/* ------------------------------------------------------------------ */

function useCustomers() {
  return useQuery({
    queryKey: ["crm", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Customer[];
    },
  });
}

function useCustomerRelated(id: string | null) {
  return useQuery({
    enabled: !!id,
    queryKey: ["crm", "customer-related", id],
    queryFn: async () => {
      const cid = id!;
      const [leadsR, jobsR, quotesR, invoicesR, activitiesR] = await Promise.all([
        supabase.from("service_requests").select("*").eq("customer_id", cid).order("created_at", { ascending: false }),
        supabase.from("jobs").select("*").eq("customer_id", cid).order("scheduled_start", { ascending: false }),
        supabase.from("quotes").select("*").eq("customer_id", cid).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("customer_id", cid).order("created_at", { ascending: false }),
        supabase.from("activities").select("*").eq("related_type", "customer").eq("related_id", cid).order("created_at", { ascending: false }),
      ]);
      for (const r of [leadsR, jobsR, quotesR, invoicesR, activitiesR]) if (r.error) throw r.error;
      return {
        leads: (leadsR.data ?? []) as Lead[],
        jobs: (jobsR.data ?? []) as Job[],
        quotes: (quotesR.data ?? []) as Quote[],
        invoices: (invoicesR.data ?? []) as Invoice[],
        activities: (activitiesR.data ?? []) as Activity[],
      };
    },
  });
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function CustomersPage() {
  const qc = useQueryClient();
  const { data: customers = [], isLoading, isError, refetch } = useCustomers();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const regions = useMemo(
    () => Array.from(new Set(customers.map((c) => c.region).filter(Boolean))).sort() as string[],
    [customers],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false;
      if (regionFilter && c.region !== regionFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (term) {
        const hay = [c.name, c.contact_name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [customers, search, typeFilter, regionFilter, statusFilter]);

  const kpis = useMemo(() => {
    const total = customers.length;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newThisMonth = customers.filter((c) => c.created_at >= monthStart).length;
    const commercial = customers.filter((c) => c.type === "Commercial").length;
    const active = customers.filter((c) => c.status === "active").length;
    return [
      { label: "Total Customers", value: total, tone: "text-white/80", bg: "bg-white/[0.05]", icon: Users },
      { label: "New This Month", value: newThisMonth, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10", icon: UserPlus },
      { label: "Commercial Accounts", value: commercial, tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: Building2 },
      { label: "Active", value: active, tone: "text-purple-300", bg: "bg-purple-500/10", icon: Repeat },
    ];
  }, [customers]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Customers</h1>
          <p className="mt-1 text-sm text-white/60">Manage customer and company records.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white hover:bg-white/[0.08]"
          >
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">{k.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white tabular-nums">{k.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.bg}`}>
                  <Icon className={`h-4 w-4 ${k.tone}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101820] p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
        <FilterSelect value={typeFilter} onChange={setTypeFilter} placeholder="All Types"
          options={TYPES.map((t) => ({ value: t, label: t }))} />
        <FilterSelect value={regionFilter} onChange={setRegionFilter} placeholder="All Regions"
          options={regions.map((r) => ({ value: r, label: r }))} />
        <FilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="All Status"
          options={STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} />
        {(search || typeFilter || regionFilter || statusFilter) && (
          <button onClick={() => { setSearch(""); setTypeFilter(""); setRegionFilter(""); setStatusFilter(""); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-white/60 hover:text-white">
            <Filter className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center text-sm text-white/60 animate-pulse">Loading customers…</div>
      ) : isError ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
          <p className="text-sm font-semibold text-white">Couldn't load customers</p>
          <button onClick={() => refetch()} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-12 text-center">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-white/40" />
          <p className="text-sm font-semibold text-white">No customers match your filters</p>
          <p className="mt-1 text-xs text-white/60">Try clearing filters or adding a new customer.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
                  <tr>{["Customer", "Type", "Contact", "Region", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedId(c.id)} className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{c.name}</div>
                        <div className="text-xs text-white/50">{c.contact_name ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        {c.type ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${TYPE_STYLES[c.type] ?? "border-white/10 text-white/60"}`}>{c.type}</span> : <span className="text-white/40">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/70">
                        <div>{c.phone ?? "—"}</div>
                        <div className="text-white/50">{c.email ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 text-white/70">{c.region ?? "—"}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[c.status] ?? STATUS_STYLES.inactive}`}>{c.status}</span></td>
                      <td className="px-4 py-3 text-right text-xs text-[#FFD200]">View</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/[0.08] px-4 py-3 text-xs text-white/50">
              Showing <span className="font-semibold text-white">{filtered.length}</span> of <span className="font-semibold text-white">{customers.length}</span> customers
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((c) => (
              <div key={c.id} onClick={() => setSelectedId(c.id)} className="cursor-pointer rounded-xl border border-white/[0.08] bg-[#101820] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{c.name}</h3>
                    <p className="text-xs text-white/50">{c.contact_name ?? "—"}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${STATUS_STYLES[c.status] ?? STATUS_STYLES.inactive}`}>{c.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  {c.type && <span className={`inline-flex rounded-full border px-2 py-0.5 ${TYPE_STYLES[c.type] ?? "border-white/10 text-white/60"}`}>{c.type}</span>}
                  <span className="text-white/60">{c.region ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <CustomerDrawer
          customer={selected}
          onClose={() => setSelectedId(null)}
          onEdit={() => setEditing(selected)}
          onChanged={() => qc.invalidateQueries({ queryKey: ["crm", "customers"] })}
        />
      )}

      {(showAdd || editing) && (
        <CustomerFormModal
          initial={editing ?? undefined}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}

      <ImportCustomersDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => qc.invalidateQueries({ queryKey: ["crm", "customers"] })}
      />
    </CrmPage>
  );
}

/* ------------------------------------------------------------------ */
/* Filter select                                                       */
/* ------------------------------------------------------------------ */

function FilterSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-3 pr-8 text-sm text-white/80 hover:bg-white/[0.06] focus:outline-none">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detail drawer                                                       */
/* ------------------------------------------------------------------ */

function CustomerDrawer({ customer, onClose, onEdit, onChanged }: { customer: Customer; onClose: () => void; onEdit: () => void; onChanged: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useCustomerRelated(customer.id);

  const archive = useMutation({
    mutationFn: async () => {
      const next = customer.status === "inactive" ? "active" : "inactive";
      const { error } = await supabase.from("customers").update({ status: next }).eq("id", customer.id);
      if (error) throw error;
    },
    onSuccess: () => { onChanged(); },
  });

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("customers").delete().eq("id", customer.id);
      if (error) throw error;
    },
    onSuccess: () => { onChanged(); onClose(); },
  });

  const lifetimeValue = useMemo(
    () => (data?.invoices ?? []).filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total ?? 0), 0),
    [data],
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0a1218] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/[0.06] p-5">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-white">{customer.name}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {customer.type && <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${TYPE_STYLES[customer.type] ?? "border-white/10 text-white/60"}`}>{customer.type}</span>}
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[customer.status] ?? STATUS_STYLES.inactive}`}>{customer.status}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/60 hover:bg-white/[0.05] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Contact</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/80"><span className="text-white/40">Primary:</span> {customer.contact_name ?? "—"}</div>
              <div className="flex items-center gap-2 text-white/80"><Phone className="h-3.5 w-3.5 text-white/40" /> {customer.phone ?? "—"}</div>
              <div className="flex items-center gap-2 text-white/80"><Mail className="h-3.5 w-3.5 text-white/40" /> {customer.email ?? "—"}</div>
              <div className="flex items-center gap-2 text-white/80"><MapPin className="h-3.5 w-3.5 text-white/40" /> {[customer.address, customer.region].filter(Boolean).join(", ") || "—"}</div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-5">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Lifetime Value</p>
              <p className="mt-1 text-lg font-semibold text-[#FFD200]">{money(lifetimeValue)}</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Leads</p>
              <p className="mt-1 text-lg font-semibold text-white tabular-nums">{data?.leads.length ?? 0}</p>
            </div>
          </section>

          {isLoading ? (
            <div className="text-center text-xs text-white/50">Loading related records…</div>
          ) : isError ? (
            <div className="text-center text-xs text-red-400">Couldn't load related records.</div>
          ) : (
            <>
              <RelatedSection title="Leads / Requests" empty="No linked leads yet.">
                {data!.leads.map((l) => (
                  <Link key={l.id} to="/crm/leads/$id" params={{ id: l.id }} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-sm hover:bg-white/[0.05]">
                    <div>
                      <div className="font-mono text-xs text-[#FFD200]">{l.reference}</div>
                      <div className="text-xs text-white/70">{l.service ?? "—"}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-white/80 capitalize">{l.status}</div>
                      <div className="text-white/50">{fmtDate(l.created_at)}</div>
                    </div>
                  </Link>
                ))}
              </RelatedSection>

              <RelatedSection title="Jobs" empty="No jobs yet.">
                {data!.jobs.map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-sm">
                    <div>
                      <div className="font-mono text-xs text-[#FFD200]">{j.number}</div>
                      <div className="text-xs text-white/70">{j.service ?? "—"}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-white/80 capitalize">{j.status}</div>
                      <div className="text-white/50">{fmtDate(j.scheduled_start)}</div>
                    </div>
                  </div>
                ))}
              </RelatedSection>

              <RelatedSection title="Quotes" empty="No quotes yet.">
                {data!.quotes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-sm">
                    <div>
                      <div className="font-mono text-xs text-[#FFD200]">{q.number}</div>
                      <div className="text-xs text-white/70">{q.title ?? "—"}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-white/80 capitalize">{q.status}</div>
                      <div className="text-white/50 tabular-nums">{money(q.total)}</div>
                    </div>
                  </div>
                ))}
              </RelatedSection>

              <RelatedSection title="Invoices" empty="No invoices yet.">
                {data!.invoices.map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-sm">
                    <div>
                      <div className="font-mono text-xs text-[#FFD200]">{i.number}</div>
                      <div className="text-xs text-white/70">Due {fmtDate(i.due_date)}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-white/80 capitalize">{i.status}</div>
                      <div className="text-white/50 tabular-nums">{money(i.total)}</div>
                    </div>
                  </div>
                ))}
              </RelatedSection>

              <RelatedSection title="Activity Timeline" empty="No activity logged.">
                {data!.activities.map((a) => (
                  <div key={a.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white capitalize">{a.type}{a.direction ? ` · ${a.direction}` : ""}</span>
                      <span className="text-[10px] text-white/50">{fmtDate(a.created_at)}</span>
                    </div>
                    {a.body && <p className="mt-1 text-xs text-white/70">{a.body}</p>}
                  </div>
                ))}
              </RelatedSection>
            </>
          )}

          {customer.notes && (
            <section className="border-t border-white/[0.06] pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Notes</h3>
              <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/80">
                <FileText className="mb-2 h-3.5 w-3.5 text-white/40" />
                {customer.notes}
              </div>
            </section>
          )}

          <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-5">
            <button onClick={onEdit} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06]">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => archive.mutate()} disabled={archive.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06] disabled:opacity-60">
              <Archive className="h-3.5 w-3.5" /> {customer.status === "inactive" ? "Activate" : "Archive"}
            </button>
            <button onClick={() => { if (confirm(`Delete ${customer.name}? This cannot be undone.`)) del.mutate(); }} disabled={del.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-60">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function RelatedSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  const hasContent = arr.filter(Boolean).length > 0;
  return (
    <section className="border-t border-white/[0.06] pt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">{title}</h3>
      <div className="mt-3 space-y-2">
        {hasContent ? children : <p className="text-xs text-white/50">{empty}</p>}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Create / Edit modal                                                 */
/* ------------------------------------------------------------------ */

function CustomerFormModal({ initial, onClose }: { initial?: Customer; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    contact_name: initial?.contact_name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    type: initial?.type ?? "",
    region: initial?.region ?? "",
    address: initial?.address ?? "",
    status: (initial?.status ?? "active") as Status,
    notes: initial?.notes ?? "",
  });
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new Error("Invalid email");
      const payload = {
        name: form.name.trim(),
        contact_name: form.contact_name.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        type: form.type || null,
        region: form.region.trim() || null,
        address: form.address.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
      };
      if (initial) {
        const { error } = await supabase.from("customers").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crm", "customers"] }); onClose(); },
    onError: (e: Error) => setErr(e.message),
  });

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-white/[0.08] bg-[#0a1414] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">{initial ? "Edit Customer" : "Add Customer"}</h3>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3 p-5">
            <Field label="Name *">
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact"><input value={form.contact_name} onChange={(e) => setField("contact_name", e.target.value)} className={inputCls} /></Field>
              <Field label="Type">
                <select value={form.type} onChange={(e) => setField("type", e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input value={form.phone} onChange={(e) => setField("phone", e.target.value)} type="tel" className={inputCls} /></Field>
              <Field label="Email"><input value={form.email} onChange={(e) => setField("email", e.target.value)} type="email" className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Region"><input value={form.region} onChange={(e) => setField("region", e.target.value)} className={inputCls} /></Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setField("status", e.target.value as Status)} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Address"><input value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputCls} /></Field>
            <Field label="Notes">
              <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={3} className={inputCls} />
            </Field>
            {err && <p className="text-xs text-red-400">{err}</p>}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] p-5">
            <button onClick={onClose} className="rounded-lg px-3.5 py-2 text-sm text-white/70 hover:bg-white/5">Cancel</button>
            <button onClick={() => save.mutate()} disabled={save.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-3.5 py-2 text-sm font-semibold text-[#101820] hover:brightness-95 disabled:opacity-60">
              <Plus className="h-4 w-4" /> {save.isPending ? "Saving…" : initial ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const inputCls = "mt-1 w-full rounded-lg border border-white/[0.08] bg-[#071111] px-3 py-2 text-sm text-white/90 focus:border-emerald-500/50 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-white/60">{label}</span>
      {children}
    </label>
  );
}
