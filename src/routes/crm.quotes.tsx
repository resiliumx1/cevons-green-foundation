import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  X, Trash2, Send, Eye, Printer, Calendar as CalendarIcon, Edit3,
} from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/crm/quotes")({
  head: () => ({ meta: [{ title: "Quotes | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: QuotesPage,
});

type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

interface LineItem { description: string; qty: number; unit_price: number }

interface QuoteRow {
  id: string;
  number: string;
  service_request_id: string | null;
  customer_id: string | null;
  title: string | null;
  line_items: LineItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  status: QuoteStatus;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<QuoteStatus, string> = {
  draft: "bg-white/[0.06] text-white/60 border-white/[0.1]",
  sent: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  accepted: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  declined: "bg-red-500/15 text-red-300 border-red-500/30",
  expired: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

const STATUSES: QuoteStatus[] = ["draft", "sent", "accepted", "declined", "expired"];
const TAX_RATE = 0.14; // 14% VAT (Guyana)

function fmtMoney(n: number | null | undefined) {
  return `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function statusLabel(s: QuoteStatus) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── queries ───────────────────────────────────────────────────────────

function useQuotes() {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as QuoteRow[];
    },
  });
}

function useLeadsLite() {
  return useQuery({
    queryKey: ["quotes:leads-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, reference, name, service, customer_id")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useCustomersLite() {
  return useQuery({
    queryKey: ["quotes:customers-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email, phone")
        .order("name", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

async function nextQuoteNumber(): Promise<string> {
  const { data } = await supabase
    .from("quotes")
    .select("number")
    .order("created_at", { ascending: false })
    .limit(50);
  let max = 1000;
  for (const row of data ?? []) {
    const m = String(row.number ?? "").match(/(\d+)\s*$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `Q-${max + 1}`;
}

// ─── page ──────────────────────────────────────────────────────────────

function QuotesPage() {
  const { data: quotes, isLoading, isError, error, refetch } = useQuotes();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [editing, setEditing] = useState<QuoteRow | "new" | null>(null);
  const [previewing, setPreviewing] = useState<QuoteRow | null>(null);

  const filtered = useMemo(() => {
    return (quotes ?? []).filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${q.number} ${q.title ?? ""} ${q.notes ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [quotes, statusFilter, search]);

  const kpis = useMemo(() => {
    const list = quotes ?? [];
    const byStatus = (s: QuoteStatus) => list.filter((q) => q.status === s);
    const sum = (arr: QuoteRow[]) => arr.reduce((a, b) => a + Number(b.total ?? 0), 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const acceptedMonth = byStatus("accepted").filter((q) => new Date(q.created_at) >= monthStart);
    return [
      { label: "Drafts", value: String(byStatus("draft").length), tone: "text-white/70", bg: "bg-white/[0.05]", icon: AlertCircle },
      { label: "Sent / Open", value: String(byStatus("sent").length), tone: "text-blue-300", bg: "bg-blue-500/10", icon: FileText },
      { label: "Pipeline Value", value: fmtMoney(sum(byStatus("sent"))), tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10", icon: Clock },
      { label: "Accepted (Month)", value: String(acceptedMonth.length), tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: CheckCircle2 },
      { label: "Won Value (Month)", value: fmtMoney(sum(acceptedMonth)), tone: "text-[#006B35]", bg: "bg-[#006B35]/10", icon: CheckCircle2 },
    ];
  }, [quotes]);

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Quotes</h1>
          <p className="mt-1 text-sm text-white/60">Track quote requests, sent quotes, and approvals.</p>
        </div>
        <button onClick={() => setEditing("new")} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Create Quote
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotes by number, title, notes..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg border px-3 py-2 text-xs capitalize transition ${
                statusFilter === s
                  ? "border-[#FFD200]/50 bg-[#FFD200]/15 text-[#FFD200]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {s === "all" ? "All" : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-10 text-center text-white/50">Loading quotes…</div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-semibold">Couldn't load quotes</p>
          <p className="mt-1 opacity-80">{(error as Error)?.message}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-lg border border-red-300/40 px-3 py-1 text-xs hover:bg-red-500/20">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-white/30" />
          <p className="mt-3 text-white/70">No quotes match your filters.</p>
          <button onClick={() => setEditing("new")} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black">
            <Plus className="h-4 w-4" /> Create first quote
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
                  <tr>
                    {["Number", "Title", "Total", "Status", "Valid Until", "Created", ""].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr key={q.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{q.number}</td>
                      <td className="px-4 py-3 text-white">{q.title ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-white">{fmtMoney(q.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${STATUS_STYLES[q.status]}`}>
                          {statusLabel(q.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70">{fmtDate(q.valid_until)}</td>
                      <td className="px-4 py-3 text-white/70">{fmtDate(q.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button title="Preview" onClick={() => setPreviewing(q)} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button title="Edit" onClick={() => setEditing(q)} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((q) => (
              <button key={q.id} onClick={() => setPreviewing(q)} className="block w-full rounded-xl border border-white/[0.08] bg-[#101820] p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#FFD200]">{q.number}</span>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] capitalize ${STATUS_STYLES[q.status]}`}>{statusLabel(q.status)}</span>
                </div>
                <h3 className="mt-2 font-semibold text-white">{q.title ?? "Untitled"}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">{fmtMoney(q.total)}</span>
                  <span className="text-xs text-white/50">Valid {fmtDate(q.valid_until)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {editing && (
        <QuoteEditor
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onPreview={(q) => { setEditing(null); setPreviewing(q); }}
        />
      )}
      {previewing && (
        <QuotePreview
          quote={previewing}
          onClose={() => setPreviewing(null)}
          onEdit={() => { const q = previewing; setPreviewing(null); setEditing(q); }}
        />
      )}
    </CrmPage>
  );
}

// ─── editor ───────────────────────────────────────────────────────────

function QuoteEditor({
  initial, onClose, onPreview,
}: { initial: QuoteRow | null; onClose: () => void; onPreview: (q: QuoteRow) => void }) {
  const qc = useQueryClient();
  const isNew = !initial;

  const { data: leads } = useLeadsLite();
  const { data: customers } = useCustomersLite();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [serviceRequestId, setServiceRequestId] = useState<string | null>(initial?.service_request_id ?? null);
  const [customerId, setCustomerId] = useState<string | null>(initial?.customer_id ?? null);
  const [validUntil, setValidUntil] = useState<string>(initial?.valid_until ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initial?.line_items?.length ? initial.line_items : [{ description: "", qty: 1, unit_price: 0 }],
  );
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
    mutationFn: async (mode: "save" | "save-preview"): Promise<QuoteRow> => {
      const payload = {
        title: title.trim() || null,
        service_request_id: serviceRequestId,
        customer_id: customerId,
        line_items: items.filter((i) => i.description.trim() || i.unit_price > 0) as unknown as never,
        subtotal,
        tax,
        total,
        valid_until: validUntil || null,
        notes: notes.trim() || null,
      };
      if (isNew) {
        const number = await nextQuoteNumber();
        const { data, error } = await supabase
          .from("quotes")
          .insert({ ...payload, number, status: "draft" })
          .select()
          .single();
        if (error) throw error;
        return data as unknown as QuoteRow;
      }
      const { data, error } = await supabase
        .from("quotes")
        .update(payload)
        .eq("id", initial!.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as QuoteRow;
    },
    onSuccess: (row, mode) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      if (mode === "save-preview") onPreview(row);
      else onClose();
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      if (!initial) return;
      const { error } = await supabase.from("quotes").delete().eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotes"] }); onClose(); },
  });

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function addItem() { setItems((arr) => [...arr, { description: "", qty: 1, unit_price: 0 }]); }
  function removeItem(i: number) { setItems((arr) => arr.filter((_, idx) => idx !== i)); }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-2xl flex-col border-l border-white/[0.08] bg-[#0B1117] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{isNew ? "Create Quote" : `Edit ${initial!.number}`}</h2>
            <p className="text-xs text-white/50">Draft is saved with a fresh number.</p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06]"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dumpster rental — 2 weeks"
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Linked Lead">
              <select value={serviceRequestId ?? ""} onChange={(e) => setServiceRequestId(e.target.value || null)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
                <option value="">— None —</option>
                {(leads ?? []).map((l: any) => (
                  <option key={l.id} value={l.id}>{l.reference ?? l.id.slice(0, 8)} — {l.name} ({l.service})</option>
                ))}
              </select>
            </Field>
            <Field label="Linked Customer">
              <select value={customerId ?? ""} onChange={(e) => setCustomerId(e.target.value || null)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
                <option value="">— None —</option>
                {(customers ?? []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
                  <input value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })}
                    placeholder="Description" className="col-span-6 rounded border border-white/[0.06] bg-black/30 px-2 py-1.5 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
                  <input type="number" min={0} step="1" value={it.qty}
                    onChange={(e) => updateItem(i, { qty: Number(e.target.value) || 0 })}
                    placeholder="Qty" className="col-span-2 rounded border border-white/[0.06] bg-black/30 px-2 py-1.5 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
                  <input type="number" min={0} step="0.01" value={it.unit_price}
                    onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) || 0 })}
                    placeholder="Unit Price" className="col-span-3 rounded border border-white/[0.06] bg-black/30 px-2 py-1.5 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
                  <button onClick={() => removeItem(i)} className="col-span-1 flex items-center justify-center rounded text-white/40 hover:bg-white/[0.06] hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 ml-auto w-full max-w-xs space-y-1 rounded-lg border border-white/[0.08] bg-black/20 p-3 text-sm">
              <Row label="Subtotal" value={fmtMoney(subtotal)} />
              <Row label={<span>Tax <input type="number" min={0} step="0.01" value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="ml-1 w-16 rounded border border-white/[0.08] bg-black/30 px-1 py-0.5 text-xs text-white/80" /></span>} value={fmtMoney(tax)} />
              <div className="my-1 border-t border-white/[0.08]" />
              <Row label={<span className="font-semibold text-white">Total</span>} value={<span className="font-semibold text-[#FFD200]">{fmtMoney(total)}</span>} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Valid Until">
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              placeholder="Internal or customer-facing notes…"
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>

          {save.isError && <p className="text-sm text-red-300">{(save.error as Error)?.message}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] px-5 py-3">
          <div>
            {!isNew && (
              <button onClick={() => { if (confirm("Delete this quote?")) del.mutate(); }}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">Cancel</button>
            <button disabled={save.isPending} onClick={() => save.mutate("save")}
              className="rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-sm text-white hover:bg-white/[0.1] disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save Draft"}
            </button>
            <button disabled={save.isPending} onClick={() => save.mutate("save-preview")}
              className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50">
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

// ─── preview / printable ───────────────────────────────────────────────

function QuotePreview({ quote, onClose, onEdit }: { quote: QuoteRow; onClose: () => void; onEdit: () => void }) {
  const qc = useQueryClient();

  const { data: lead } = useQuery({
    queryKey: ["quote:lead", quote.service_request_id],
    enabled: !!quote.service_request_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("service_requests").select("*").eq("id", quote.service_request_id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: customer } = useQuery({
    queryKey: ["quote:customer", quote.customer_id],
    enabled: !!quote.customer_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", quote.customer_id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async (next: QuoteStatus) => {
      const { error } = await supabase.from("quotes").update({ status: next }).eq("id", quote.id);
      if (error) throw error;
      // log activity on linked records
      const activities: any[] = [];
      const body = `Quote ${quote.number} marked ${next}`;
      if (quote.service_request_id) activities.push({ related_type: "lead", related_id: quote.service_request_id, type: "status_change", body, created_by: "crm" });
      if (quote.customer_id) activities.push({ related_type: "customer", related_id: quote.customer_id, type: "status_change", body, created_by: "crm" });
      if (activities.length) await supabase.from("activities").insert(activities);
      return next;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const createJob = useMutation({
    mutationFn: async () => {
      const payload: any = {
        service_request_id: quote.service_request_id,
        customer_id: quote.customer_id,
        quote_id: quote.id,
        service: quote.title ?? "Service",
        status: "scheduled",
      };
      const { error } = await supabase.from("jobs").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); alert("Job created from quote."); },
    onError: (e) => alert((e as Error).message),
  });

  const items = Array.isArray(quote.line_items) ? quote.line_items : [];
  const status = quote.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm print:bg-white print:p-0" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[95vh] w-full max-w-3xl flex-col rounded-2xl border border-white/[0.08] bg-[#0B1117] shadow-2xl print:max-h-none print:rounded-none print:border-0 print:bg-white print:text-black">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs capitalize ${STATUS_STYLES[status]}`}>{statusLabel(status)}</span>
            <span className="font-mono text-xs text-[#FFD200]">{quote.number}</span>
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
              <p className="text-xs uppercase tracking-wider text-white/50 print:text-black/50">Quote</p>
              <p className="font-mono text-lg text-[#FFD200] print:text-black">{quote.number}</p>
              <p className="mt-1 text-xs text-white/60 print:text-black/60">Issued {fmtDate(quote.created_at)}</p>
              {quote.valid_until && <p className="text-xs text-white/60 print:text-black/60">Valid until {fmtDate(quote.valid_until)}</p>}
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
              ) : lead ? (
                <>
                  <p className="font-medium text-white print:text-black">{(lead as any).name}</p>
                  {(lead as any).email && <p className="text-white/70 print:text-black/70">{(lead as any).email}</p>}
                  {(lead as any).phone && <p className="text-white/70 print:text-black/70">{(lead as any).phone}</p>}
                </>
              ) : (
                <p className="text-white/50 print:text-black/50">—</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-white/50 print:text-black/50">Reference</p>
              {lead && <p className="text-white/80 print:text-black/80">Lead {(lead as any).reference ?? (lead as any).id?.slice(0, 8)}</p>}
              <p className="text-white/80 print:text-black/80">{quote.title ?? "—"}</p>
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
            <Row label={<span className="text-white/60 print:text-black/60">Subtotal</span>} value={<span className="text-white print:text-black">{fmtMoney(quote.subtotal)}</span>} />
            <Row label={<span className="text-white/60 print:text-black/60">Tax</span>} value={<span className="text-white print:text-black">{fmtMoney(quote.tax)}</span>} />
            <div className="my-1 border-t border-white/[0.08] print:border-black/20" />
            <Row label={<span className="font-semibold text-white print:text-black">Total</span>} value={<span className="font-semibold text-[#FFD200] print:text-black">{fmtMoney(quote.total)}</span>} />
          </div>

          {quote.notes && (
            <div className="mt-6 rounded-lg border border-white/[0.08] bg-black/20 p-3 text-sm text-white/80 print:border-black/20 print:bg-transparent print:text-black/80">
              <p className="mb-1 text-xs uppercase tracking-wider text-white/50 print:text-black/50">Notes</p>
              <p className="whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] px-5 py-3 print:hidden">
          <div className="flex items-center gap-1 text-xs text-white/50">
            <CalendarIcon className="h-3.5 w-3.5" /> Last updated {fmtDate(quote.updated_at)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusButton current={status} target="sent" icon={Send} label="Mark Sent" onClick={() => setStatus.mutate("sent")} disabled={setStatus.isPending} />
            <StatusButton current={status} target="accepted" icon={CheckCircle2} label="Accepted"
              onClick={async () => {
                await setStatus.mutateAsync("accepted");
                if (confirm("Create a job from this accepted quote?")) createJob.mutate();
              }}
              disabled={setStatus.isPending}
            />
            <StatusButton current={status} target="declined" icon={XCircle} label="Declined" onClick={() => setStatus.mutate("declined")} disabled={setStatus.isPending} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  current, target, icon: Icon, label, onClick, disabled,
}: { current: QuoteStatus; target: QuoteStatus; icon: any; label: string; onClick: () => void; disabled?: boolean }) {
  const active = current === target;
  return (
    <button onClick={onClick} disabled={disabled || active}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
        active
          ? `${STATUS_STYLES[target]} cursor-default`
          : "border-white/[0.1] bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
      } disabled:opacity-60`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
