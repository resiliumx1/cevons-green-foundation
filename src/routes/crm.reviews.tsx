import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

export const Route = createFileRoute("/crm/reviews")({
  component: Reviews,
});

const reviews = [
  { name: "Marlon P.", rating: 5, text: "Very professional team and reliable scheduling. Will use again.", date: "Jun 08, 2026" },
  { name: "Aisha K.", rating: 5, text: "On-time delivery and great communication. Highly recommended.", date: "Jun 05, 2026" },
  { name: "C. Daniels", rating: 4, text: "Good service overall, would appreciate earlier arrival windows.", date: "Jun 02, 2026" },
  { name: "Devi N.", rating: 5, text: "Best waste service in Georgetown. Always responsive.", date: "May 29, 2026" },
];

function Reviews() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-sm text-slate-400 mt-1">Customer feedback across channels.</p>
        </div>
        <div className="bg-[#121a26] border border-white/5 rounded-xl px-5 py-3 text-right">
          <div className="text-3xl font-bold text-[#FFC629]">4.8</div>
          <div className="flex justify-end text-[#FFC629]">
            {[1,2,3,4,5].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
          </div>
          <div className="text-xs text-slate-400 mt-1">312 reviews</div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r, i) => (
          <div key={i} className="bg-[#121a26] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-700 grid place-items-center text-sm font-semibold text-white">{r.name[0]}</div>
                <div>
                  <div className="text-white text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.date}</div>
                </div>
              </div>
              <div className="flex text-[#FFC629]">
                {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}
              </div>
            </div>
            <p className="text-sm text-slate-300">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
