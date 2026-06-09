import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, MapPin, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { CrmPage } from "@/components/motion/CrmMotion";
import { JobModal } from "@/components/crm/JobModal";
import {
  useJobs, useCustomersLite, useJobMutations,
  JOB_STATUS_CALENDAR, JOB_STATUS_LABEL,
  type Job, type JobStatus,
} from "@/lib/crm-jobs";

export const Route = createFileRoute("/crm/calendar")({
  head: () => ({ meta: [{ title: "Calendar | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: CalendarPage,
});

type View = "Week" | "Month";

function startOfWeek(d: Date) {
  const n = new Date(d); n.setHours(0, 0, 0, 0);
  const day = (n.getDay() + 6) % 7; // Mon=0
  n.setDate(n.getDate() - day);
  return n;
}
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7AM - 5PM

function CalendarPage() {
  const { data: jobs = [], isLoading, isError, refetch } = useJobs();
  const { data: customers = [] } = useCustomersLite();
  const { update } = useJobMutations();
  const customerMap = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c.name])), [customers]);

  const [view, setView] = useState<View>("Week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [editing, setEditing] = useState<Job | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const today = new Date();
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const monthStart = useMemo(() => { const d = new Date(anchor); d.setDate(1); d.setHours(0,0,0,0); return d; }, [anchor]);
  const monthGridStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const monthDates = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(monthGridStart, i)), [monthGridStart]);

  const jobsWithStart = useMemo(() => jobs.filter((j) => j.scheduled_start), [jobs]);

  const dayJobs = (d: Date) =>
    jobsWithStart
      .filter((j) => sameDay(new Date(j.scheduled_start!), d))
      .sort((a, b) => new Date(a.scheduled_start!).getTime() - new Date(b.scheduled_start!).getTime());

  const todays = dayJobs(today);

  const rangeLabel =
    view === "Week"
      ? `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const navigate = (dir: -1 | 1) => {
    if (view === "Week") setAnchor((a) => addDays(a, dir * 7));
    else { const d = new Date(anchor); d.setMonth(d.getMonth() + dir); setAnchor(d); }
  };

  const onDropJob = async (jobId: string, day: Date, hour?: number) => {
    const j = jobs.find((x) => x.id === jobId);
    if (!j) return;
    const orig = j.scheduled_start ? new Date(j.scheduled_start) : new Date();
    const next = new Date(day);
    next.setHours(hour ?? orig.getHours(), orig.getMinutes(), 0, 0);
    const diff = next.getTime() - orig.getTime();
    const nextEnd = j.scheduled_end ? new Date(new Date(j.scheduled_end).getTime() + diff).toISOString() : null;
    await update.mutateAsync({ id: j.id, patch: { scheduled_start: next.toISOString(), scheduled_end: nextEnd } });
  };

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Calendar</h1>
        <p className="text-sm text-white/60">Scheduled jobs, color-coded by status. Drag to reschedule.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-white/[0.08]">
          {(["Week", "Month"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm transition ${view === v ? "bg-[#FFD200] text-black" : "bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"}`}>
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setAnchor(new Date())}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/80 hover:bg-white/[0.06]">
          <CalendarIcon className="h-4 w-4" /> {rangeLabel}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="rounded-lg border border-white/[0.08] p-1.5 text-white/70 hover:bg-white/[0.06]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(1)} className="rounded-lg border border-white/[0.08] p-1.5 text-white/70 hover:bg-white/[0.06]">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-1.5 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
            <Plus className="h-4 w-4" /> Add Job
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-white/60">
        {(Object.keys(JOB_STATUS_CALENDAR) as JobStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${JOB_STATUS_CALENDAR[s].dot}`} />
            {JOB_STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center text-sm text-white/60 animate-pulse">Loading calendar…</div>
      ) : isError ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-8 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
          <p className="text-sm font-semibold text-white">Couldn't load calendar</p>
          <button onClick={() => refetch()} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          {view === "Week" ? (
            <WeekGrid weekDates={weekDates} jobs={jobsWithStart} customerMap={customerMap} onOpen={setEditing} onDrop={onDropJob} />
          ) : (
            <MonthGrid monthAnchor={monthStart} dates={monthDates} jobs={jobsWithStart} customerMap={customerMap} onOpen={setEditing} onDrop={onDropJob} />
          )}

          {/* Today's Schedule */}
          <aside className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">Today's Schedule</h3>
            <p className="mt-0.5 text-xs text-white/50">{today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
            <div className="mt-3 space-y-2">
              {todays.length === 0 ? (
                <p className="text-xs text-white/50">No jobs today.</p>
              ) : todays.map((j) => {
                const s = JOB_STATUS_CALENDAR[j.status as JobStatus] ?? JOB_STATUS_CALENDAR.scheduled;
                const t = new Date(j.scheduled_start!);
                return (
                  <button key={j.id} onClick={() => setEditing(j)}
                    className={`block w-full rounded-lg border border-white/[0.06] border-l-2 ${s.border} bg-white/[0.02] p-2.5 text-left hover:bg-white/[0.04]`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-white">{j.service ?? j.number}</span>
                      <span className="flex shrink-0 items-center gap-1 text-[10px] text-white/50">
                        <Clock className="h-3 w-3" />
                        {t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-white/60">{j.customer_id ? customerMap[j.customer_id] ?? "—" : "—"}</div>
                    {j.region && <div className="mt-1 flex items-center gap-1 text-[10px] text-white/40"><MapPin className="h-2.5 w-2.5" /> {j.region}</div>}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {(showCreate || editing) && <JobModal job={editing} onClose={() => { setShowCreate(false); setEditing(null); }} />}
    </CrmPage>
  );
}

/* ------------------------------------------------------------------ */
/* Week grid                                                           */
/* ------------------------------------------------------------------ */

function WeekGrid({ weekDates, jobs, customerMap, onOpen, onDrop }: {
  weekDates: Date[]; jobs: Job[]; customerMap: Record<string, string>;
  onOpen: (j: Job) => void; onDrop: (id: string, day: Date, hour: number) => void;
}) {
  const today = new Date();
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.06]">
          <div className="p-2" />
          {weekDates.map((d, i) => (
            <div key={i} className={`border-l border-white/[0.06] p-2 text-center ${sameDay(d, today) ? "bg-[#FFD200]/[0.04]" : ""}`}>
              <div className="text-[10px] uppercase tracking-wider text-white/40">{DAYS[i]}</div>
              <div className="mt-0.5 text-sm font-semibold text-white">{d.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-r border-white/[0.06]">
            {HOURS.map((h) => (
              <div key={h} className="h-16 border-b border-white/[0.04] px-2 py-1 text-[10px] text-white/40">
                {h > 12 ? h - 12 : h}{h >= 12 ? "PM" : "AM"}
              </div>
            ))}
          </div>
          {weekDates.map((d, di) => (
            <div key={di} className={`relative border-r border-white/[0.06] ${sameDay(d, today) ? "bg-[#FFD200]/[0.02]" : ""}`}>
              {HOURS.map((h) => (
                <div key={h} className="h-16 border-b border-white/[0.04]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); if (id) onDrop(id, d, h); }}
                />
              ))}
              {jobs.filter((j) => sameDay(new Date(j.scheduled_start!), d)).map((j) => {
                const start = new Date(j.scheduled_start!);
                const end = j.scheduled_end ? new Date(j.scheduled_end) : new Date(start.getTime() + 60 * 60 * 1000);
                const startH = start.getHours() + start.getMinutes() / 60;
                const endH = Math.max(startH + 0.5, end.getHours() + end.getMinutes() / 60);
                const top = Math.max(0, (startH - 7) * 64);
                const height = Math.max(28, (endH - startH) * 64 - 4);
                const s = JOB_STATUS_CALENDAR[j.status as JobStatus] ?? JOB_STATUS_CALENDAR.scheduled;
                return (
                  <button key={j.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", j.id)}
                    onClick={() => onOpen(j)} style={{ top, height }}
                    className={`absolute inset-x-1 overflow-hidden rounded-md border-l-2 ${s.bg} ${s.border} cursor-grab p-1.5 text-left hover:brightness-110 active:cursor-grabbing`}>
                    <div className="truncate text-[11px] font-semibold text-white">{j.service ?? j.number}</div>
                    <div className="truncate text-[10px] text-white/60">{j.customer_id ? customerMap[j.customer_id] ?? "—" : "—"}</div>
                    {j.region && <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40"><MapPin className="h-2.5 w-2.5" />{j.region}</div>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile agenda */}
      <div className="space-y-3 md:hidden">
        {weekDates.map((d, i) => {
          const ev = jobs.filter((j) => sameDay(new Date(j.scheduled_start!), d));
          if (!ev.length) return null;
          return (
            <div key={i} className="rounded-xl border border-white/[0.08] bg-[#101820] p-3">
              <h3 className="mb-2 text-sm font-semibold text-white">{DAYS[i]}, {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</h3>
              <div className="space-y-2">
                {ev.map((j) => {
                  const s = JOB_STATUS_CALENDAR[j.status as JobStatus] ?? JOB_STATUS_CALENDAR.scheduled;
                  const t = new Date(j.scheduled_start!);
                  return (
                    <button key={j.id} onClick={() => onOpen(j)} className={`block w-full rounded-lg border-l-2 ${s.bg} ${s.border} p-2 text-left`}>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white">{j.service ?? j.number}</span>
                        <span className="text-white/50">{t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                      <div className="text-[11px] text-white/60">{j.customer_id ? customerMap[j.customer_id] ?? "—" : "—"}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Month grid                                                          */
/* ------------------------------------------------------------------ */

function MonthGrid({ monthAnchor, dates, jobs, customerMap, onOpen, onDrop }: {
  monthAnchor: Date; dates: Date[]; jobs: Job[]; customerMap: Record<string, string>;
  onOpen: (j: Job) => void; onDrop: (id: string, day: Date) => void;
}) {
  const today = new Date();
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820]">
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {DAYS.map((d) => (
          <div key={d} className="border-l border-white/[0.06] p-2 text-center text-[10px] uppercase tracking-wider text-white/40 first:border-l-0">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dates.map((d, i) => {
          const inMonth = d.getMonth() === monthAnchor.getMonth();
          const ev = jobs.filter((j) => sameDay(new Date(j.scheduled_start!), d));
          const isToday = sameDay(d, today);
          return (
            <div key={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); if (id) onDrop(id, d); }}
              className={`min-h-[88px] border-l border-t border-white/[0.04] p-1.5 ${!inMonth ? "bg-black/30" : ""} ${isToday ? "bg-[#FFD200]/[0.04]" : ""}`}>
              <div className={`text-[11px] ${inMonth ? "text-white/80" : "text-white/30"} ${isToday ? "font-bold text-[#FFD200]" : ""}`}>{d.getDate()}</div>
              <div className="mt-1 space-y-0.5">
                {ev.slice(0, 3).map((j) => {
                  const s = JOB_STATUS_CALENDAR[j.status as JobStatus] ?? JOB_STATUS_CALENDAR.scheduled;
                  return (
                    <button key={j.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", j.id)}
                      onClick={() => onOpen(j)}
                      className={`block w-full truncate rounded border-l-2 ${s.bg} ${s.border} px-1.5 py-0.5 text-left text-[10px] text-white cursor-grab hover:brightness-110`}>
                      {new Date(j.scheduled_start!).toLocaleTimeString("en-US", { hour: "numeric" })} {j.customer_id ? customerMap[j.customer_id] ?? j.service ?? j.number : j.service ?? j.number}
                    </button>
                  );
                })}
                {ev.length > 3 && <div className="px-1 text-[9px] text-white/50">+{ev.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
