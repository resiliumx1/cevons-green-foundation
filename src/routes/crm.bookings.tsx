import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Plus, CalendarCheck, Clock, AlertTriangle, CheckCircle2, MapPin, X, Save,
  RefreshCw, Inbox,
} from "lucide-react";
import { CrmPage } from "@/components/motion/CrmMotion";
import { JobModal } from "@/components/crm/JobModal";
import {
  useJobs, usePendingRequests, useCustomersLite, useJobMutations,
  JOB_STATUS_LABEL, JOB_STATUS_STYLES, fmtDateTime, fmtDate, toDatetimeLocal,
  type Job, type JobStatus, type ServiceRequest,
} from "@/lib/crm-jobs";

export const Route = createFileRoute("/crm/bookings")({
  head: () => ({ meta: [{ title: "Bookings | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const { data: jobs = [], isLoading: jobsLoading, isError: jobsError, refetch: refetchJobs } = useJobs();
  const { data: pending = [], isLoading: pendingLoading, isError: pendingError, refetch: refetchPending } = usePendingRequests();
  const { data: customers = [] } = useCustomersLite();
  const customerMap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);

  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState<ServiceRequest | null>(null);
  const [editing, setEditing] = useState<Job | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const term = search.trim().toLowerCase();
  const matchTerm = (hay: string) => !term || hay.toLowerCase().includes(term);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return jobs
      .filter((j) => j.scheduled_start && new Date(j.scheduled_start).getTime() >= now && j.status !== "cancelled")
      .filter((j) => matchTerm([j.number, j.customer_id ? customerMap[j.customer_id] ?? "" : "", j.service ?? "", j.region ?? ""].join(" ")))
      .sort((a, b) => new Date(a.scheduled_start!).getTime() - new Date(b.scheduled_start!).getTime());
  }, [jobs, customerMap, term]);

  const pendingFiltered = useMemo(
    () => pending.filter((r) => matchTerm([r.reference, r.name ?? "", r.service ?? "", r.region ?? ""].join(" "))),
    [pending, term],
  );

  const kpis = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    return [
      { label: "Scheduled Today", value: jobs.filter((j) => j.scheduled_start && new Date(j.scheduled_start) >= today && new Date(j.scheduled_start) < tomorrow && j.status !== "cancelled").length, icon: CalendarCheck, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
      { label: "Pending Confirmation", value: pending.length, icon: Clock, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
      { label: "Unassigned Upcoming", value: jobs.filter((j) => !j.assigned_to && j.status === "scheduled").length, icon: AlertTriangle, tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10" },
      { label: "Completed This Week", value: jobs.filter((j) => j.status === "completed" && j.scheduled_start && new Date(j.scheduled_start) >= weekAgo).length, icon: CheckCircle2, tone: "text-white/70", bg: "bg-white/[0.05]" },
    ];
  }, [jobs, pending]);

  const isLoading = jobsLoading || pendingLoading;
  const isError = jobsError || pendingError;

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-white/60">Confirm pending requests and review upcoming jobs.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> New Booking
        </button>
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center text-sm text-white/60 animate-pulse">Loading bookings…</div>
      ) : isError ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
          <p className="text-sm font-semibold text-white">Couldn't load bookings</p>
          <button onClick={() => { refetchJobs(); refetchPending(); }} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* Pending — to schedule */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#FFD200]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">To Schedule</h2>
              <span className="rounded-full bg-[#FFD200]/15 px-2 py-0.5 text-[11px] text-[#FFD200]">{pendingFiltered.length}</span>
            </div>
            {pendingFiltered.length === 0 ? (
              <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-6 text-center text-sm text-white/50">
                <Inbox className="mx-auto mb-2 h-5 w-5 text-white/40" /> No requests waiting for scheduling.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingFiltered.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#FFD200]/20 bg-[#FFD200]/[0.04] p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-[#FFD200]">{r.reference}</span>
                        <span className="text-sm font-semibold text-white">{r.name ?? "—"}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-white/60">
                        {r.service ?? "—"} · {r.region ?? "—"} · Preferred {fmtDate(r.preferred_date)}{r.preferred_time ? ` ${r.preferred_time}` : ""}
                      </div>
                    </div>
                    <button onClick={() => setConfirming(r)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-1.5 text-xs font-semibold text-[#101820] hover:brightness-95">
                      <CalendarCheck className="h-3.5 w-3.5" /> Confirm & Schedule
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming jobs */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-[#006B35]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">Upcoming Jobs</h2>
              <span className="rounded-full bg-[#006B35]/15 px-2 py-0.5 text-[11px] text-[#006B35]">{upcoming.length}</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-6 text-center text-sm text-white/50">
                <Inbox className="mx-auto mb-2 h-5 w-5 text-white/40" /> No upcoming jobs.
              </div>
            ) : (
              <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
                      <tr>{["Job", "Customer", "Service", "Region", "Scheduled", "Crew", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {upcoming.map((j) => (
                        <tr key={j.id} onClick={() => setEditing(j)} className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-mono text-xs text-[#FFD200]">{j.number}</td>
                          <td className="px-4 py-3 text-white">{j.customer_id ? customerMap[j.customer_id] ?? "—" : "—"}</td>
                          <td className="px-4 py-3 text-white/80">{j.service ?? "—"}</td>
                          <td className="px-4 py-3 text-white/70"><span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-white/40" />{j.region ?? "—"}</span></td>
                          <td className="px-4 py-3 text-white/70 whitespace-nowrap">{fmtDateTime(j.scheduled_start)}</td>
                          <td className="px-4 py-3 text-white/70">{j.assigned_to ?? <span className="text-white/40">Unassigned</span>}</td>
                          <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${JOB_STATUS_STYLES[j.status as JobStatus] ?? JOB_STATUS_STYLES.scheduled}`}>{JOB_STATUS_LABEL[j.status as JobStatus] ?? j.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-2 md:hidden">
              {upcoming.map((j) => (
                <div key={j.id} onClick={() => setEditing(j)} className="cursor-pointer rounded-xl border border-white/[0.08] bg-[#101820] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#FFD200]">{j.number}</span>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${JOB_STATUS_STYLES[j.status as JobStatus] ?? JOB_STATUS_STYLES.scheduled}`}>{JOB_STATUS_LABEL[j.status as JobStatus] ?? j.status}</span>
                  </div>
                  <h3 className="mt-2 font-semibold text-white">{j.customer_id ? customerMap[j.customer_id] ?? "—" : "—"}</h3>
                  <p className="text-sm text-white/70">{j.service ?? "—"}</p>
                  <div className="mt-2 text-xs text-white/60">{fmtDateTime(j.scheduled_start)} · {j.region ?? "—"}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {confirming && <ConfirmScheduleModal request={confirming} onClose={() => setConfirming(null)} />}
      {(showCreate || editing) && <JobModal job={editing} onClose={() => { setShowCreate(false); setEditing(null); }} />}
    </CrmPage>
  );
}

function ConfirmScheduleModal({ request, onClose }: { request: ServiceRequest; onClose: () => void }) {
  const { scheduleFromRequest } = useJobMutations();
  const initial =
    request.preferred_date
      ? toDatetimeLocal(new Date(`${request.preferred_date}T${request.preferred_time?.match(/\d{2}:\d{2}/)?.[0] ?? "09:00"}:00`).toISOString())
      : "";
  const [start, setStart] = useState(initial);
  const [crew, setCrew] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    try {
      if (!start) throw new Error("Pick a scheduled start time");
      await scheduleFromRequest.mutateAsync({
        request,
        scheduled_start: new Date(start).toISOString(),
        assigned_to: crew.trim() || null,
      });
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="pointer-events-auto w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0a1414] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[#FFD200]" />
              <h3 className="text-lg font-bold text-white">Confirm & Schedule</h3>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3 p-5">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="font-mono text-xs text-[#FFD200]">{request.reference}</div>
              <div className="mt-1 text-sm font-semibold text-white">{request.name ?? "—"}</div>
              <div className="text-xs text-white/60">{request.service ?? "—"} · {request.region ?? "—"}</div>
              <div className="mt-1 text-xs text-white/50">Preferred {fmtDate(request.preferred_date)}{request.preferred_time ? ` ${request.preferred_time}` : ""}</div>
            </div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-white/60">Scheduled Start *</span>
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#071111] px-3 py-2 text-sm text-white/90 focus:border-emerald-500/50 focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-white/60">Assigned Crew</span>
              <input value={crew} onChange={(e) => setCrew(e.target.value)} placeholder="Team Alpha"
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#071111] px-3 py-2 text-sm text-white/90 focus:border-emerald-500/50 focus:outline-none" />
            </label>
            {err && <p className="text-xs text-red-400">{err}</p>}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] p-5">
            <button onClick={onClose} className="rounded-lg px-3.5 py-2 text-sm text-white/70 hover:bg-white/5">Cancel</button>
            <button onClick={submit} disabled={scheduleFromRequest.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-3.5 py-2 text-sm font-semibold text-[#101820] hover:brightness-95 disabled:opacity-60">
              <Save className="h-4 w-4" /> {scheduleFromRequest.isPending ? "Scheduling…" : "Create Job"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
