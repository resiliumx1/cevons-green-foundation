import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, FileText, CheckCircle2, AlertTriangle, Send, X, Trash2,
  Eye, Printer, Edit3, Ban, Calendar as CalendarIcon, DollarSign, Clock,
} from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/crm/invoices")({
  head: () => ({ meta: [{ title: "Invoices | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: InvoicesPage,
});

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";
interface LineItem { description: string; qty: number; unit_price: number }

interface InvoiceRow {
  id: string;
  number: string;
  customer_id: string | null;
  job_id: string | null;
  line_items: LineItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  status: InvoiceStatus;
  issued_date: string | null;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-white/[0.06] text-white/60 border-white/[0.1]",
  sent: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  paid: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  overdue: "bg-[#E31B23]/15 text-[#E31B23] border-[#E31B23]/30",
  void: "bg-red-500/10 text-red-300/70 border-red-500/20",
};

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "void"];
const TAX_RATE = 0.14;

function fmtMoney(n: number | null | undefined) {
  return `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function label(s: InvoiceStatus) { return s.charAt(0).toUpperCase() + s.slice(1); }

function effectiveStatus(inv: InvoiceRow): InvoiceStatus {
  if (inv.status === "paid" || inv.status === "void" || inv.status === "draft") return inv.status;
  if (inv.due_date && inv.due_date < todayISO()) return "overdue";
  return inv.status;
}

function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InvoiceRow[];
    },
  });
}
function useCustomersLite() {
  return useQuery({
    queryKey: ["invoices:customers-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name, email, phone").order("name").limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}
function useJobsLite() {
  return useQuery({
    queryKey: ["invoices:jobs-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("id, service, customer_id, scheduled_start").order("scheduled_start", { ascending: false }).limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}
async function nextInvoiceNumber(): Promise<string> {
  const { data } = await supabase.from("invoices").select("number").order("created_at", { ascending: false }).limit(50);
  let max = 1000;
  for (const row of data ?? []) {
    const m = String(row.number ?? "").match(/(\d+)\s*$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `INV-${max + 1}`;
}

function InvoicesPage() {
  const { data: invoices, isLoading, isError, error, refetch } = useInvoices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [editing, setEditing] = useState<InvoiceRow | "new" | null>(null);
  const [previewing, setPreviewing] = useState<InvoiceRow | null>(null);

  const enriched = useMemo(() => (invoices ?? []).map((i) => ({ ...i, _status: effectiveStatus(i) })), [invoices]);

  const filtered = useMemo(() => {
    return enriched.filter((i) => {
      if (statusFilter !== "all" && i._status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!`${i.number} ${i.notes ?? ""}`.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [enriched, statusFilter, search]);

  const kpis = useMemo(() => {
    const sum = (arr: typeof enriched) => arr.reduce((a, b) => a + Number(b.total ?? 0), 0);
    const outstanding = enriched.filter((i) => i._status === "sent" || i._status === "overdue");
    const overdue = enriched.filter((i) => i._status === "overdue");
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const paidMonth = enriched.filter((i) => i._status === "paid" && i.paid_date && new Date(i.paid_date) >= monthStart);
    return [
      { label: "Outstanding", value: fmtMoney(sum(outstanding)), tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10", icon: Clock },
      { label: "Overdue", value: fmtMoney(sum(overdue)), tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10", icon: AlertTriangle },
      { label: "Paid (Month)", value: fmtMoney(sum(paidMonth)), tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: CheckCircle2 },
      { label: "Drafts", value: String(enriched.filter((i) => i._status === "draft").length), tone: "text-white/70", bg: "bg-white/[0.05]", icon: FileText },
      { label: "Total Invoices", value: String(enriched.length), tone: "text-white/70", bg: "bg-white/[0.05]", icon: DollarSign },
    ];
  }, [enriched]);

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Invoices</h1>
          <p className="mt-1 text-sm text-white/60">Issue invoices, track payments, and follow up on overdue accounts.</p>
        </div>
        <button onClick={() => setEditing("new")} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">{k.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{k.value}</p>
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices by number or notes..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(["all", ...STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg border px-3 py-2 text-xs capitalize transition ${
                statusFilter === s
                  ? "border-[#FFD200]/50 bg-[#FFD200]/15 text-[#FFD200]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
              }`}>
              {s === "all" ? "All" : label(s)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-10 text-center text-white/50">Loading invoices…</div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-semibold">Couldn't load invoices</p>
          <p className="mt-1 opacity-80">{(error as Error)?.message}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-lg border border-red-300/40 px-3 py-1 text-xs hover:bg-red-500/20">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-white/30" />
          <p className="mt-3 text-white/70">No invoices match your filters.</p>
          <button onClick={() => setEditing("new")} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black">
            <Plus className="h-4 w-4" /> Create first invoice
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
                  <tr>{["Number", "Total", "Status", "Issued", "Due", "Paid", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{i.number}</td>
                      <td className="px-4 py-3 font-semibold text-white">{fmtMoney(i.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${STATUS_STYLES[i._status]}`}>{label(i._status)}</span>
                      </td>
                      <td className="px-4 py-3 text-white/70">{fmtDate(i.issued_date)}</td>
                      <td className="px-4 py-3 text-white/70">{fmtDate(i.due_date)}</td>
                      <td className="px-4 py-3 text-white/70">{fmtDate(i.paid_date)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button title="Preview" onClick={() => setPreviewing(i)} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white"><Eye className="h-4 w-4" /></button>
                          <button title="Edit" onClick={() => setEditing(i)} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white"><Edit3 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((i) => (
              <button key={i.id} onClick={() => setPreviewing(i)} className="block w-full rounded-xl border border-white/[0.08] bg-[#101820] p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#FFD200]">{i.number}</span>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] capitalize ${STATUS_STYLES[i._status]}`}>{label(i._status)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">{fmtMoney(i.total)}</span>
                  <span className="text-xs text-white/50">Due {fmtDate(i.due_date)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {editing && (
        <InvoiceEditor initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} onPreview={(inv) => { setEditing(null); setPreviewing(inv); }} />
      )}
      {previewing && (
        <InvoicePreview invoice={previewing} onClose={() => setPreviewing(null)} onEdit={() => { const inv = previewing; setPreviewing(null); setEditing(inv); }} />
      )}
    </CrmPage>
  );
}

function InvoiceEditor({ initial, onClose, onPreview }: { initial: InvoiceRow | null; onClose: () => void; onPreview: (inv: InvoiceRow) => void }) {
  const qc = useQueryClient();
  const isNew = !initial;
  const { data: customers } = useCustomersLite();
  const { data: jobs } = useJobsLite();

  const [customerId, setCustomerId] = useState<string | null>(initial?.customer_id ?? null);
  const [jobId, setJobId] = useState<string | null>(initial?.job_id ?? null);
  const [issuedDate, setIssuedDate] = useState<string>(initial?.issued_date ?? todayISO());
  const [dueDate, setDueDate] = useState<string>(initial?.due_date ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(initial?.line_items?.length ? initial.line_items : [{ description: "", qty: 1, unit_price: 0 }]);
  const [taxRate, setTaxRate] = useState(() => {
    if (initial && initial.subtotal && Number(initial.subtotal) > 0) {
      return Number(((Number(initial.tax ?? 0) / Number(initial.subtotal)) || TAX_RATE).toFixed(4));
    }
    return TAX_RATE;
  });

  const subtotal = items.reduce((a, b) => a + Number(b.qty || 0) * Number(b.unit_price || 0), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const save = useMutation({
    mutationFn: async (mode: "save" | "save-preview"): Promise<InvoiceRow> => {
      const payload = {
        customer_id: customerId,
        job_id: jobId,
        line_items: items.filter((i) => i.description.trim() || i.unit_price > 0) as unknown as never,
        subtotal,
        tax,
        total,
        issued_date: issuedDate || null,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      };
      if (isNew) {
        const number = await nextInvoiceNumber();
        const { data, error } = await supabase.from("invoices").insert({ ...payload, number, status: "draft" }).select().single();
        if (error) throw error;
        return data as unknown as InvoiceRow;
      }
      const { data, error } = await supabase.from("invoices").update(payload).eq("id", initial!.id).select().single();
      if (error) throw error;
      return data as unknown as InvoiceRow;
    },
    onSuccess: (row, mode) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      if (mode === "save-preview") onPreview(row);
      else onClose();
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      if (!initial) return;
      const { error } = await supabase.from("invoices").delete().eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); onClose(); },
  });

  function updateItem(i: number, patch: Partial<LineItem>) { setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it))); }
  function addItem() { setItems((arr) => [...arr, { description: "", qty: 1, unit_price: 0 }]); }
  function removeItem(i: number) { setItems((arr) => arr.filter((_, idx) => idx !== i)); }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-2xl flex-col border-l border-white/[0.08] bg-[#0B1117] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{isNew ? "Create Invoice" : `Edit ${initial!.number}`}</h2>
            <p className="text-xs text-white/50">Drafts get a fresh number on save.</p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06]"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Customer">
              <select value={customerId ?? ""} onChange={(e) => setCustomerId(e.target.value || null)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
                <option value="">— None —</option>
                {(customers ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Linked Job">
              <select value={jobId ?? ""} onChange={(e) => setJobId(e.target.value || null)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
                <option value="">— None —</option>
                {(jobs ?? []).map((j: any) => <option key={j.id} value={j.id}>{j.service} — {fmtDate(j.scheduled_start)}</option>)}
              </select>
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-white/50">Line Items</label>
              <button onClick={addItem} className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white/80 hover:bg-white/[0.08]">
                <Plus className="h-3 w-3" /> Add line
              </button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 rounded-lg border border-white/[0.06] bg-black/20 p-2">
                  <input value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} placeholder="Description"
                    className="col-span-6 rounded border border-white/[0.06] bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
                  <input type="number" min={0} step="1" value={it.qty} onChange={(e) => updateItem(i, { qty: Number(e.target.value) || 0 })} placeholder="Qty"
                    className="col-span-2 rounded border border-white/[0.06] bg-black/30 px-2 py-1.5 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
                  <input type="number" min={0} step="0.01" value={it.unit_price} onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) || 0 })} placeholder="Unit Price"
                    className="col-span-3 rounded border border-white/[0.06] bg-black/30 px-2 py-1.5 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
                  <button onClick={() => removeItem(i)} className="col-span-1 flex items-center justify-center rounded text-white/40 hover:bg-white/[0.06] hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 ml-auto w-full max-w-xs space-y-1 rounded-lg border border-white/[0.08] bg-black/20 p-3 text-sm">
              <Row label="Subtotal" value={fmtMoney(subtotal)} />
              <Row label={<span>Tax <input type="number" min={0} step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="ml-1 w-16 rounded border border-white/[0.08] bg-black/30 px-1 py-0.5 text-xs text-white/80" /></span>} value={fmtMoney(tax)} />
              <div className="my-1 border-t border-white/[0.08]" />
              <Row label={<span className="font-semibold text-white">Total</span>} value={<span className="font-semibold text-[#FFD200]">{fmtMoney(total)}</span>} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Issued Date">
              <input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
            </Field>
            <Field label="Due Date">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Payment terms, bank info, internal notes…"
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>

          {save.isError && <p className="text-sm text-red-300">{(save.error as Error)?.message}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] px-5 py-3">
          <div>
            {!isNew && (
              <button onClick={() => { if (confirm("Delete this invoice?")) del.mutate(); }}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">Cancel</button>
            <button disabled={save.isPending} onClick={() => save.mutate("save")} className="rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-sm text-white hover:bg-white/[0.1] disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save Draft"}
            </button>
            <button disabled={save.isPending} onClick={() => save.mutate("save-preview")} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50">
              <Eye className="h-4 w-4" /> Save & Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/50">{label}</span>
      {children}
    </label>
  );
}
function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between text-white/70"><span>{label}</span><span>{value}</span></div>;
}

function InvoicePreview({ invoice, onClose, onEdit }: { invoice: InvoiceRow; onClose: () => void; onEdit: () => void }) {
  const qc = useQueryClient();
  const status = effectiveStatus(invoice);

  const { data: customer } = useQuery({
    queryKey: ["invoice:customer", invoice.customer_id],
    enabled: !!invoice.customer_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", invoice.customer_id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: job } = useQuery({
    queryKey: ["invoice:job", invoice.job_id],
    enabled: !!invoice.job_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", invoice.job_id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async (next: InvoiceStatus) => {
      const patch: any = { status: next };
      if (next === "paid") patch.paid_date = todayISO();
      if (next !== "paid") patch.paid_date = null;
      const { error } = await supabase.from("invoices").update(patch).eq("id", invoice.id);
      if (error) throw error;
      const activities: any[] = [];
      const body = `Invoice ${invoice.number} marked ${next}${next === "paid" ? ` (${fmtMoney(invoice.total)})` : ""}`;
      if (invoice.customer_id) activities.push({ related_type: "customer", related_id: invoice.customer_id, type: "status_change", body, created_by: "crm" });
      if (invoice.job_id) activities.push({ related_type: "job", related_id: invoice.job_id, type: "status_change", body, created_by: "crm" });
      if (activities.length) await supabase.from("activities").insert(activities);
      return next;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const items = Array.isArray(invoice.line_items) ? invoice.line_items : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm print:bg-white print:p-0" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[95vh] w-full max-w-3xl flex-col rounded-2xl border border-white/[0.08] bg-[#0B1117] shadow-2xl print:max-h-none print:rounded-none print:border-0 print:bg-white print:text-black">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${STATUS_STYLES[status]}`}>{label(status)}</span>
            <span className="font-mono text-xs text-[#FFD200]">{invoice.number}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} title="Edit" className="rounded p-1.5 text-white/70 hover:bg-white/[0.06]"><Edit3 className="h-4 w-4" /></button>
            <button onClick={() => window.print()} title="Print" className="rounded p-1.5 text-white/70 hover:bg-white/[0.06]"><Printer className="h-4 w-4" /></button>
            <button onClick={onClose} title="Close" className="rounded p-1.5 text-white/70 hover:bg-white/[0.06]"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 print:p-12">
          <div className="flex items-start justify-between gap-6 border-b border-white/[0.08] pb-6 print:border-black/20">
            <div>
              <div className="text-2xl font-bold tracking-tight text-white print:text-black">CEVONS</div>
              <p className="mt-1 text-xs text-white/60 print:text-black/60">Waste Management & Environmental Services</p>
              <p className="text-xs text-white/60 print:text-black/60">Georgetown, Guyana</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-white/50 print:text-black/50">Invoice</p>
              <p className="font-mono text-lg text-[#FFD200] print:text-black">{invoice.number}</p>
              <p className="mt-1 text-xs text-white/60 print:text-black/60">Issued {fmtDate(invoice.issued_date)}</p>
              {invoice.due_date && <p className="text-xs text-white/60 print:text-black/60">Due {fmtDate(invoice.due_date)}</p>}
              {invoice.paid_date && <p className="text-xs text-[#006B35] print:text-black/70">Paid {fmtDate(invoice.paid_date)}</p>}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-white/50 print:text-black/50">Billed To</p>
              {customer ? (
                <>
                  <p className="font-medium text-white print:text-black">{(customer as any).name}</p>
                  {(customer as any).email && <p className="text-white/70 print:text-black/70">{(customer as any).email}</p>}
                  {(customer as any).phone && <p className="text-white/70 print:text-black/70">{(customer as any).phone}</p>}
                </>
              ) : <p className="text-white/50 print:text-black/50">—</p>}
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-white/50 print:text-black/50">Reference</p>
              {job && <p className="text-white/80 print:text-black/80">Job — {(job as any).service}</p>}
              {job && <p className="text-white/60 print:text-black/60">Scheduled {fmtDate((job as any).scheduled_start)}</p>}
              {!job && <p className="text-white/50 print:text-black/50">—</p>}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-white/[0.08] print:border-black/20">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/60 print:bg-black/5 print:text-black/70">
                <tr>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 text-right font-medium">Qty</th>
                  <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-white/40 print:text-black/40">No line items.</td></tr>
                ) : items.map((it, i) => (
                  <tr key={i} className="border-t border-white/[0.06] print:border-black/10">
                    <td className="px-4 py-3 text-white print:text-black">{it.description || "—"}</td>
                    <td className="px-4 py-3 text-right text-white/80 print:text-black/80">{it.qty}</td>
                    <td className="px-4 py-3 text-right text-white/80 print:text-black/80">{fmtMoney(it.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-white print:text-black">{fmtMoney(Number(it.qty || 0) * Number(it.unit_price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
            <Row label={<span className="text-white/60 print:text-black/60">Subtotal</span>} value={<span className="text-white print:text-black">{fmtMoney(invoice.subtotal)}</span>} />
            <Row label={<span className="text-white/60 print:text-black/60">Tax</span>} value={<span className="text-white print:text-black">{fmtMoney(invoice.tax)}</span>} />
            <div className="my-1 border-t border-white/[0.08] print:border-black/20" />
            <Row label={<span className="font-semibold text-white print:text-black">Total</span>} value={<span className="font-semibold text-[#FFD200] print:text-black">{fmtMoney(invoice.total)}</span>} />
          </div>

          {invoice.notes && (
            <div className="mt-6 rounded-lg border border-white/[0.08] bg-black/20 p-3 text-sm text-white/80 print:border-black/20 print:bg-transparent print:text-black/80">
              <p className="mb-1 text-xs uppercase tracking-wider text-white/50 print:text-black/50">Notes</p>
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] px-5 py-3 print:hidden">
          <div className="flex items-center gap-1 text-xs text-white/50">
            <CalendarIcon className="h-3.5 w-3.5" /> Last updated {fmtDate(invoice.updated_at)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton current={status} target="sent" icon={Send} label="Mark Sent" onClick={() => setStatus.mutate("sent")} disabled={setStatus.isPending} />
            <ActionButton current={status} target="paid" icon={CheckCircle2} label="Mark Paid" onClick={() => setStatus.mutate("paid")} disabled={setStatus.isPending} />
            <ActionButton current={status} target="void" icon={Ban} label="Void" onClick={() => { if (confirm("Void this invoice?")) setStatus.mutate("void"); }} disabled={setStatus.isPending} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ current, target, icon: Icon, label, onClick, disabled }: { current: InvoiceStatus; target: InvoiceStatus; icon: any; label: string; onClick: () => void; disabled?: boolean }) {
  const active = current === target;
  return (
    <button onClick={onClick} disabled={disabled || active}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
        active ? `${STATUS_STYLES[target]} cursor-default` : "border-white/[0.1] bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
      } disabled:opacity-60`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
