import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CrmPage } from "@/components/motion/CrmMotion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/crm/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar | CEVONS Growth Command" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CalendarPage,
});

type EventType = "scheduled" | "review" | "followup" | "completed";

interface Event {
  id: string;
  title: string;
  customer: string;
  region?: string;
  day: number; // 0-6 (Mon-Sun)
  hour: number; // 24h
  duration: number; // hours
  type: EventType;
}

const EVENTS: Event[] = [
  { id: "1", title: "Dumpster Rental", customer: "ABC Holdings", region: "Georgetown", day: 0, hour: 8, duration: 2, type: "scheduled" },
  { id: "2", title: "Skip Bin Rental", customer: "Guyana Builders Inc.", region: "Linden", day: 0, hour: 10, duration: 2, type: "scheduled" },
  { id: "3", title: "Portable Toilet", customer: "Premier Hotel", region: "Georgetown", day: 0, hour: 13, duration: 2, type: "scheduled" },
  { id: "4", title: "Waste Oil Review", customer: "National Foods Ltd.", region: "Georgetown", day: 1, hour: 9, duration: 2, type: "review" },
  { id: "5", title: "Septic Tank Clearance", customer: "John Persaud", region: "Berbice", day: 1, hour: 11, duration: 2, type: "scheduled" },
  { id: "6", title: "Quote Follow-up", customer: "R&R Manufacturing", day: 1, hour: 14, duration: 1, type: "followup" },
  { id: "7", title: "Dumpster Pickup", customer: "City Mall", region: "Georgetown", day: 2, hour: 10, duration: 1, type: "completed" },
  { id: "8", title: "Portable Toilet Drop", customer: "Ocean View Resort", region: "Essequibo", day: 3, hour: 8, duration: 3, type: "scheduled" },
  { id: "9", title: "Specialist Site Visit", customer: "Demerara Sugar", region: "EBD", day: 4, hour: 13, duration: 2, type: "review" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DATES = ["May 16", "May 17", "May 18", "May 19", "May 20", "May 21", "May 22"];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7AM-5PM

const TYPE_STYLES: Record<EventType, { bg: string; border: string; dot: string; label: string }> = {
  scheduled: {
    bg: "bg-[#006B35]/15",
    border: "border-l-[#006B35]",
    dot: "bg-[#006B35]",
    label: "Scheduled",
  },
  review: {
    bg: "bg-[#E31B23]/15",
    border: "border-l-[#E31B23]",
    dot: "bg-[#E31B23]",
    label: "Specialist Review",
  },
  followup: {
    bg: "bg-[#FFD200]/15",
    border: "border-l-[#FFD200]",
    dot: "bg-[#FFD200]",
    label: "Quote Follow-up",
  },
  completed: {
    bg: "bg-white/[0.05]",
    border: "border-l-white/30",
    dot: "bg-white/40",
    label: "Completed",
  },
};

function CalendarPage() {
  const [view, setView] = useState<"Today" | "Week" | "Month">("Week");

  const today = EVENTS.filter((e) => e.day === 0).sort((a, b) => a.hour - b.hour);

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Calendar</h1>
        <p className="text-sm text-white/60">
          View scheduled service activity, follow-ups, and appointments.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-white/[0.08]">
          {(["Today", "Week", "Month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm transition ${
                view === v ? "bg-[#FFD200] text-black" : "bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/80 hover:bg-white/[0.06]">
          <CalendarIcon className="h-4 w-4" />
          May 16 – 22, 2025
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/70 hover:bg-white/[0.06]">
          <Filter className="h-3.5 w-3.5" /> Region
        </button>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/70 hover:bg-white/[0.06]">
          <Filter className="h-3.5 w-3.5" /> Service
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-lg border border-white/[0.08] p-1.5 text-white/70 hover:bg-white/[0.06]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-lg border border-white/[0.08] p-1.5 text-white/70 hover:bg-white/[0.06]">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-1.5 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
            <Plus className="h-4 w-4" /> Add Booking
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-white/60">
        {(Object.keys(TYPE_STYLES) as EventType[]).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${TYPE_STYLES[t].dot}`} />
            {TYPE_STYLES[t].label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        {/* Calendar Grid - Desktop */}
        <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.06]">
            <div className="p-2" />
            {DAYS.map((d, i) => (
              <div key={d} className="border-l border-white/[0.06] p-2 text-center">
                <div className="text-[10px] uppercase tracking-wider text-white/40">{d}</div>
                <div className="mt-0.5 text-sm font-semibold text-white">{DATES[i].split(" ")[1]}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[60px_repeat(7,1fr)]">
            {/* Hour rail */}
            <div className="border-r border-white/[0.06]">
              {HOURS.map((h) => (
                <div key={h} className="h-16 border-b border-white/[0.04] px-2 py-1 text-[10px] text-white/40">
                  {h > 12 ? h - 12 : h}{h >= 12 ? "PM" : "AM"}
                </div>
              ))}
            </div>
            {DAYS.map((_, dayIdx) => (
              <div key={dayIdx} className="relative border-r border-white/[0.06]">
                {HOURS.map((h) => (
                  <div key={h} className="h-16 border-b border-white/[0.04]" />
                ))}
                {EVENTS.filter((e) => e.day === dayIdx).map((e) => {
                  const top = (e.hour - 7) * 64;
                  const height = e.duration * 64 - 4;
                  const s = TYPE_STYLES[e.type];
                  return (
                    <div
                      key={e.id}
                      style={{ top, height }}
                      className={`absolute inset-x-1 overflow-hidden rounded-md border-l-2 ${s.bg} ${s.border} p-1.5`}
                    >
                      <div className="truncate text-[11px] font-semibold text-white">{e.title}</div>
                      <div className="truncate text-[10px] text-white/60">{e.customer}</div>
                      {e.region && (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40">
                          <MapPin className="h-2.5 w-2.5" />
                          {e.region}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Agenda */}
        <div className="space-y-3 md:hidden">
          {DAYS.map((d, i) => {
            const dayEvents = EVENTS.filter((e) => e.day === i);
            if (!dayEvents.length) return null;
            return (
              <div key={d} className="rounded-xl border border-white/[0.08] bg-[#101820] p-3">
                <h3 className="mb-2 text-sm font-semibold text-white">
                  {d}, {DATES[i]}
                </h3>
                <div className="space-y-2">
                  {dayEvents.map((e) => {
                    const s = TYPE_STYLES[e.type];
                    return (
                      <div key={e.id} className={`rounded-lg border-l-2 ${s.bg} ${s.border} p-2`}>
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-white">{e.title}</span>
                          <span className="text-white/50">{e.hour > 12 ? e.hour - 12 : e.hour}:00 {e.hour >= 12 ? "PM" : "AM"}</span>
                        </div>
                        <div className="text-[11px] text-white/60">{e.customer}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's Schedule */}
        <aside className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Today's Schedule
          </h3>
          <p className="mt-0.5 text-xs text-white/50">Mon, May 16</p>
          <div className="mt-3 space-y-2">
            {today.map((e) => {
              const s = TYPE_STYLES[e.type];
              return (
                <div
                  key={e.id}
                  className={`rounded-lg border border-white/[0.06] border-l-2 ${s.border} bg-white/[0.02] p-2.5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-white">{e.title}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-white/50">
                      <Clock className="h-3 w-3" />
                      {e.hour > 12 ? e.hour - 12 : e.hour}:00
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-white/60">{e.customer}</div>
                  {e.region && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-white/40">
                      <MapPin className="h-2.5 w-2.5" /> {e.region}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </CrmPage>
  );
}
