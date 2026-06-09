import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/jobs")({
  component: Jobs,
});

const jobs = [
  { id: "J-5012", customer: "ABC Holdings", service: "Skip Bin Rental", crew: "Team A", date: "Jun 14", status: "Scheduled" },
  { id: "J-5011", customer: "Hotel Tower", service: "Portable Toilet", crew: "Team C", date: "Jun 10", status: "In Progress" },
  { id: "J-5010", customer: "GT Construction", service: "Skip Bin Rental", crew: "Team B", date: "Jun 09", status: "Completed" },
  { id: "J-5009", customer: "Joel Persaud", service: "Septic Tank", crew: "Team B", date: "Jun 06", status: "Completed" },
  { id: "J-5008", customer: "Riverdale Estate", service: "Waste Oil Disposal", crew: "Team A", date: "Jun 06", status: "Completed" },
];

const c: Record<string, string> = {
  Scheduled: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "In Progress": "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Completed: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
};

function Jobs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Jobs</h1>
        <p className="text-sm text-slate-400 mt-1">Active and recent field jobs.</p>
      </div>
      <div className="bg-[#121a26] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Crew</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono text-[#FFC629]">{j.id}</td>
                <td className="px-4 py-3 text-white">{j.customer}</td>
                <td className="px-4 py-3 text-slate-300">{j.service}</td>
                <td className="px-4 py-3 text-slate-300">{j.crew}</td>
                <td className="px-4 py-3 text-slate-300">{j.date}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-medium ${c[j.status]}`}>{j.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
