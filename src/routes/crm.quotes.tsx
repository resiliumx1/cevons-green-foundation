import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/quotes")({
  component: Quotes,
});

const quotes = [
  { id: "Q-2087", customer: "ABC Holdings", service: "Skip Bin Rental", amount: "$1,840", sent: "Jun 09", status: "Pending" },
  { id: "Q-2086", customer: "Marie Singh", service: "Dumpster Rental", amount: "$420", sent: "Jun 09", status: "Viewed" },
  { id: "Q-2085", customer: "Linden Foods Ltd", service: "Commercial Pickup", amount: "$3,200", sent: "Jun 08", status: "Accepted" },
  { id: "Q-2084", customer: "Berbice Hospital", service: "Medical Waste", amount: "$5,640", sent: "Jun 08", status: "Pending" },
  { id: "Q-2083", customer: "Hotel Tower", service: "Portable Toilet", amount: "$960", sent: "Jun 07", status: "Declined" },
];

const c: Record<string, string> = {
  Pending: "bg-[#FFC629]/15 text-[#FFC629] border-[#FFC629]/30",
  Viewed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Declined: "bg-[#E63946]/15 text-red-400 border-[#E63946]/30",
};

function Quotes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quotes</h1>
        <p className="text-sm text-slate-400 mt-1">Open and recent quotes sent to customers.</p>
      </div>
      <div className="bg-[#121a26] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
                <th className="px-4 py-3 font-medium">Quote</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Sent</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[#FFC629]">{q.id}</td>
                  <td className="px-4 py-3 text-white">{q.customer}</td>
                  <td className="px-4 py-3 text-slate-300">{q.service}</td>
                  <td className="px-4 py-3 text-white font-semibold">{q.amount}</td>
                  <td className="px-4 py-3 text-slate-400">{q.sent}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-medium ${c[q.status]}`}>{q.status}</span>
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
