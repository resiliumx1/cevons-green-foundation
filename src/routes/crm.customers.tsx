import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/customers")({
  component: Customers,
});

const customers = [
  { name: "ABC Holdings", contact: "Marlon Persaud", region: "Georgetown", type: "Commercial", jobs: 24, revenue: "$48,200" },
  { name: "Linden Foods Ltd", contact: "Aisha Khan", region: "Linden", type: "Industrial", jobs: 18, revenue: "$36,400" },
  { name: "Berbice Hospital", contact: "Dr. Roy", region: "Berbice", type: "Healthcare", jobs: 12, revenue: "$28,900" },
  { name: "GT Construction", contact: "Devi Nath", region: "Georgetown", type: "Construction", jobs: 31, revenue: "$54,100" },
  { name: "Hotel Tower", contact: "C. Daniels", region: "Georgetown", type: "Hospitality", jobs: 9, revenue: "$12,800" },
  { name: "Marie Singh", contact: "Marie Singh", region: "Georgetown", type: "Residential", jobs: 3, revenue: "$1,260" },
];

function Customers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-sm text-slate-400 mt-1">All accounts and contacts.</p>
      </div>
      <div className="bg-[#121a26] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Primary Contact</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Jobs</th>
              <th className="px-4 py-3 font-medium">Lifetime Revenue</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-700 grid place-items-center text-xs font-semibold text-white">{c.name[0]}</div>
                    <span className="text-white font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{c.contact}</td>
                <td className="px-4 py-3 text-slate-300">{c.region}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">{c.type}</span>
                </td>
                <td className="px-4 py-3 text-slate-300">{c.jobs}</td>
                <td className="px-4 py-3 text-white font-semibold">{c.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
