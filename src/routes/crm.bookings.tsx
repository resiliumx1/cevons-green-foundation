import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/bookings")({
  component: Bookings,
});

const bookings = [
  { id: "BK-3401", customer: "ABC Holdings", service: "Skip Bin (12 yd³)", date: "Jun 14, 2026", time: "7:00 AM", crew: "Team A", status: "Confirmed" },
  { id: "BK-3400", customer: "Marie Singh", service: "Dumpster 8 yd³", date: "Jun 12, 2026", time: "9:30 AM", crew: "Team B", status: "Pending" },
  { id: "BK-3399", customer: "Linden Foods Ltd", service: "Commercial Pickup", date: "Jun 11, 2026", time: "6:00 AM", crew: "Team A", status: "Confirmed" },
  { id: "BK-3398", customer: "Hotel Tower", service: "Portable Toilet", date: "Jun 10, 2026", time: "2:00 PM", crew: "Team C", status: "In Progress" },
  { id: "BK-3397", customer: "GT Construction", service: "Skip Bin (10 yd³)", date: "Jun 09, 2026", time: "8:00 AM", crew: "Team B", status: "Confirmed" },
];

const statusColor: Record<string, string> = {
  Confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Pending: "bg-[#FFC629]/15 text-[#FFC629] border-[#FFC629]/30",
  "In Progress": "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

function Bookings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-sm text-slate-400 mt-1">Scheduled service appointments and crew assignments.</p>
      </div>
      <div className="bg-[#121a26] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Crew</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[#FFC629]">{b.id}</td>
                  <td className="px-4 py-3 text-white">{b.customer}</td>
                  <td className="px-4 py-3 text-slate-300">{b.service}</td>
                  <td className="px-4 py-3 text-slate-300">{b.date}</td>
                  <td className="px-4 py-3 text-slate-300">{b.time}</td>
                  <td className="px-4 py-3 text-slate-300">{b.crew}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-medium ${statusColor[b.status]}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
