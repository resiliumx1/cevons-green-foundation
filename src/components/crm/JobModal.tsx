import { useState, useMemo } from "react";
import { X, Save, Trash2, Briefcase } from "lucide-react";
import {
  type Job,
  type JobStatus,
  JOB_STATUSES,
  JOB_STATUS_LABEL,
  useCustomersLite,
  useQuotesLite,
  useJobMutations,
  toDatetimeLocal,
} from "@/lib/crm-jobs";

const inputCls =
  "mt-1 w-full rounded-lg border border-white/[0.08] bg-[#071111] px-3 py-2 text-sm text-white/90 focus:border-emerald-500/50 focus:outline-none";

export function JobModal({ job, onClose }: { job?: Job | null; onClose: () => void }) {
  const isEdit = !!job;
  const { data: customers = [] } = useCustomersLite();
  const { data: quotes = [] } = useQuotesLite();
  const { create, update, remove } = useJobMutations();

  const [form, setForm] = useState({
    customer_id: job?.customer_id ?? "",
    quote_id: job?.quote_id ?? "",
    service: job?.service ?? "",
    region: job?.region ?? "",
    address: job?.address ?? "",
    scheduled_start: toDatetimeLocal(job?.scheduled_start),
    scheduled_end: toDatetimeLocal(job?.scheduled_end),
    assigned_to: job?.assigned_to ?? "",
    status: (job?.status ?? "scheduled") as JobStatus,
    notes: job?.notes ?? "",
  });
  const [err, setErr] = useState<string | null>(null);

  const quotesForCustomer = useMemo(
    () => quotes.filter((q) => !form.customer_id || q.customer_id === form.customer_id),
    [quotes, form.customer_id],
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setErr(null);
    try {
      if (!form.scheduled_start) throw new Error("Scheduled start is required");
      const payload = {
        customer_id: form.customer_id || null,
        quote_id: form.quote_id || null,
        service: form.service.trim() || null,
        region: form.region.trim() || null,
        address: form.address.trim() || null,
        scheduled_start: form.scheduled_start ? new Date(form.scheduled_start).toISOString() : null,
        scheduled_end: form.scheduled_end ? new Date(form.scheduled_end).toISOString() : null,
        assigned_to: form.assigned_to.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
      };
      if (isEdit && job) await update.mutateAsync({ id: job.id, patch: payload });
      else await create.mutateAsync(payload);
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const onDelete = async () => {
    if (!job) return;
    if (!confirm(`Delete job ${job.number}? This cannot be undone.`)) return;
    try {
      await remove.mutateAsync(job.id);
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const pending = create.isPending || update.isPending || remove.isPending;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="pointer-events-auto w-full max-w-lg overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a1414] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">
                {isEdit ? `Edit ${job!.number}` : "Create Job"}
              </h3>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
            <Field label="Customer">
              <select value={form.customer_id} onChange={(e) => set("customer_id", e.target.value)} className={inputCls}>
                <option value="">— None —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Linked Quote">
              <select value={form.quote_id} onChange={(e) => set("quote_id", e.target.value)} className={inputCls}>
                <option value="">— None —</option>
                {quotesForCustomer.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.number} {q.title ? `· ${q.title}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Service">
                <input value={form.service} onChange={(e) => set("service", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Region">
                <input value={form.region} onChange={(e) => set("region", e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="Address">
              <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Scheduled Start *">
                <input type="datetime-local" value={form.scheduled_start} onChange={(e) => set("scheduled_start", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Scheduled End">
                <input type="datetime-local" value={form.scheduled_end} onChange={(e) => set("scheduled_end", e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Assigned Crew">
                <input value={form.assigned_to} onChange={(e) => set("assigned_to", e.target.value)} placeholder="Team Alpha" className={inputCls} />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value as JobStatus)} className={inputCls}>
                  {JOB_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {JOB_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={inputCls} />
            </Field>
            {err && <p className="text-xs text-red-400">{err}</p>}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] p-5">
            {isEdit ? (
              <button onClick={onDelete} disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-60">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            ) : <span />}
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="rounded-lg px-3.5 py-2 text-sm text-white/70 hover:bg-white/5">Cancel</button>
              <button onClick={save} disabled={pending}
                className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-3.5 py-2 text-sm font-semibold text-[#101820] hover:brightness-95 disabled:opacity-60">
                <Save className="h-4 w-4" /> {pending ? "Saving…" : isEdit ? "Save Changes" : "Create Job"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-white/60">{label}</span>
      {children}
    </label>
  );
}
