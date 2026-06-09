import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/calendar")({
  component: CalendarView,
});

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const events: Record<number, { label: string; color: string }[]> = {
  3: [{ label: "Skip drop - ABC", color: "bg-emerald-500" }],
  5: [{ label: "Septic - J. Persaud", color: "bg-[#FFC629]" }],
  9: [{ label: "Site survey", color: "bg-sky-500" }, { label: "Quote review", color: "bg-emerald-500" }],
  14: [{ label: "Skip rental - ABC", color: "bg-emerald-500" }],
  18: [{ label: "Portable toilet pickup", color: "bg-[#FFC629]" }],
  22: [{ label: "Medical waste collection", color: "bg-[#E63946]" }],
};

function CalendarView() {
  const cells = Array.from({ length: 35 }, (_, i) => i - 1); // start offset
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-slate-400 mt-1">June 2026 · Scheduled service activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm rounded-lg bg-[#121a26] border border-white/5 text-slate-200">Today</button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-[#FFC629] text-[#0a3622] font-semibold">Month</button>
          <button className="px-3 py-1.5 text-sm rounded-lg bg-[#121a26] border border-white/5 text-slate-200">Week</button>
        </div>
      </div>
      <div className="bg-[#121a26] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/5">
          {days.map((d) => (
            <div key={d} className="px-3 py-2 text-xs uppercase tracking-wider text-slate-400 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c) => {
            const day = c;
            const valid = day >= 1 && day <= 30;
            const ev = valid ? events[day] : undefined;
            return (
              <div key={c} className="min-h-[96px] border-b border-r border-white/5 p-2">
                {valid && (
                  <>
                    <div className={`text-xs font-medium mb-1 ${day === 9 ? "text-[#FFC629]" : "text-slate-300"}`}>{day}</div>
                    <div className="space-y-1">
                      {ev?.map((e, i) => (
                        <div key={i} className={`${e.color} text-[10px] text-white rounded px-1.5 py-0.5 truncate`}>{e.label}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
