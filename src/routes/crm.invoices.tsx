import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/invoices")({
  component: Invoices,
});

const invoices = [
  { id: "INV-9182", customer: "ABC Holdings", amount: "$1,840", issued: "Jun 09", due: "Jun 23", status: "Sent" },
  { id: "INV-9181", customer: "Linden Foods Ltd", amount: "$3,200", issued: "Jun 08", due: "Jun 22", status: "Paid" },
  { id: "INV-9180", customer: "GT Construction", amount: "$2,100", issued: "Jun 07", due: "Jun 21", status: "Paid" },
  { id: "INV-9179", customer: "Joel Persaud", amount: "$640", issued: "Jun 06", due: "Jun 20", status: "Overdue" },
  { id: "INV-9178", customer: "Hotel Tower", amount: "$960", issued: "Jun 05", due: "Jun 19", status: "Sent" },
];

const c: Record<string, string> = {
  Sent: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Overdue: "bg-[#E63946]/15 text-red-400 border-[#E63946]/30",
};

function Invoices() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-slate-400 mt-1">Billing and payment status.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#121a26] border border-white/5 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-400">Outstanding</div>
            <div className="text-lg font-bold text-[#FFC629]">$3,440</div>
          </div>
          <div className="bg-[#121a26] border border-white/5 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-400">Paid this month</div>
            <div className="text-lg font-bold text-emerald-400">$24,180</div>
          </div>
        </div>
      </div>
      <div className="bg-[#121a26] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono text-[#FFC629]">{i.id}</td>
                <td className="px-4 py-3 text-white">{i.customer}</td>
                <td className="px-4 py-3 text-white font-semibold">{i.amount}</td>
                <td className="px-4 py-3 text-slate-300">{i.issued}</td>
                <td className="px-4 py-3 text-slate-300">{i.due}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-medium ${c[i.status]}`}>{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
