import { createFileRoute } from "@tanstack/react-router";
import { Star, Send, ThumbsUp, AlertCircle, MoreHorizontal, MessageSquare } from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
export const Route = createFileRoute("/crm/reviews")({
  head: () => ({ meta: [{ title: "Reviews | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: ReviewsPage,
});

type ReqStatus = "Sent" | "Opened" | "Reviewed" | "Needs Follow-Up";

const STATUS_STYLES: Record<ReqStatus, string> = {
  Sent: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Opened: "bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30",
  Reviewed: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  "Needs Follow-Up": "bg-[#E31B23]/15 text-[#E31B23] border-[#E31B23]/30",
};

const KPIS = [
  { label: "Review Requests Sent", value: "84", icon: Send, tone: "text-blue-300", bg: "bg-blue-500/10" },
  { label: "Positive Feedback", value: "62", icon: ThumbsUp, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
  { label: "Needs Follow-Up", value: "5", icon: AlertCircle, tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10" },
  { label: "Average Rating", value: "4.7", icon: Star, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
];

const REQUESTS: { customer: string; service: string; date: string; status: ReqStatus; followup: boolean }[] = [
  { customer: "ABC Holdings", service: "Dumpster Rental", date: "May 14", status: "Reviewed", followup: false },
  { customer: "Premier Hotel", service: "Portable Toilet", date: "May 13", status: "Opened", followup: false },
  { customer: "Guyana Builders Inc.", service: "Skip Bin Rental", date: "May 12", status: "Sent", followup: false },
  { customer: "City Mall", service: "Commercial Garbage", date: "May 10", status: "Needs Follow-Up", followup: true },
  { customer: "John Persaud", service: "Septic Tank Clearance", date: "May 9", status: "Reviewed", followup: false },
  { customer: "Demerara Sugar", service: "Industrial Waste", date: "May 7", status: "Needs Follow-Up", followup: true },
];

const FEEDBACK: { type: "positive" | "neutral" | "negative"; customer: string; service: string; rating: number; text: string; date: string }[] = [
  { type: "positive", customer: "ABC Holdings", service: "Dumpster Rental", rating: 5, text: "Fast delivery and professional crew. Will use again for our next project.", date: "May 14" },
  { type: "positive", customer: "John Persaud", service: "Septic Tank", rating: 5, text: "Great service, on time and tidy. Highly recommended.", date: "May 9" },
  { type: "neutral", customer: "Riverside Estates", service: "Skip Bin", rating: 3, text: "Service was fine, but the bin arrived later than scheduled.", date: "May 6" },
  { type: "negative", customer: "City Mall", service: "Commercial Garbage", rating: 2, text: "Pickup was missed twice this week. Needs internal follow-up urgently.", date: "May 10" },
];

const FEEDBACK_STYLES = {
  positive: { bg: "bg-[#006B35]/8", border: "border-[#006B35]/30", tone: "text-[#006B35]", label: "Positive" },
  neutral: { bg: "bg-[#FFD200]/8", border: "border-[#FFD200]/30", tone: "text-[#FFD200]", label: "Neutral" },
  negative: { bg: "bg-[#E31B23]/8", border: "border-[#E31B23]/30", tone: "text-[#E31B23]", label: "Needs Follow-Up" },
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-[#FFD200] text-[#FFD200]" : "text-white/20"}`} />
      ))}
    </div>
  );
}

function ReviewsPage() {
  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Reviews & Reputation</h1>
          <p className="mt-1 text-sm text-white/60">Track customer feedback and review request activity.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Star className="h-4 w-4" /> Request Review
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">{k.label}</p>
                  <p className="mt-2 flex items-baseline gap-1 text-2xl font-semibold text-white">
                    {k.value}
                    {k.label === "Average Rating" && <span className="text-sm text-white/40">/ 5</span>}
                  </p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.bg}`}>
                  <Icon className={`h-4 w-4 ${k.tone}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Requests */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101820]">
        <div className="border-b border-white/[0.06] p-5">
          <h2 className="text-sm font-semibold text-white">Review Requests</h2>
          <p className="text-xs text-white/50">Status of recently sent feedback requests</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
              <tr>{["Customer", "Service", "Request Date", "Status", "Follow-up", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {REQUESTS.map((r, i) => (
                <tr key={i} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{r.customer}</td>
                  <td className="px-4 py-3 text-white/80">{r.service}</td>
                  <td className="px-4 py-3 text-white/60">{r.date}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[r.status]}`}>{r.status}</span></td>
                  <td className="px-4 py-3">
                    {r.followup ? <span className="text-xs text-[#E31B23]">Yes</span> : <span className="text-xs text-white/40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right"><button className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Feedback */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
        <h2 className="text-sm font-semibold text-white">Customer Feedback</h2>
        <p className="text-xs text-white/50">Recent feedback grouped by sentiment</p>
        <div className="mt-4 space-y-3">
          {FEEDBACK.map((f, i) => {
            const s = FEEDBACK_STYLES[f.type];
            return (
              <div key={i} className={`rounded-lg border ${s.border} ${s.bg} p-4`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{f.customer}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${s.border} ${s.tone}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-white/60">{f.service} · {f.date}</p>
                  </div>
                  <Stars n={f.rating} />
                </div>
                <div className="mt-2 flex items-start gap-2 text-sm text-white/80">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                  <p>{f.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CrmPage>
  );
}
