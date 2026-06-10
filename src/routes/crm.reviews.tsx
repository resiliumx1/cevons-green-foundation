import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star, Send, ThumbsUp, AlertCircle, MoreHorizontal, MessageSquare,
  Search, Plus, X, Edit3, Eye, CheckCircle2, Globe, Facebook,
  ChevronDown, RefreshCw,
} from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/crm/reviews")({
  head: () => ({ meta: [{ title: "Reviews | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: ReviewsPage,
});

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewStatus = "pending" | "published" | "hidden" | "responded";
type ReviewSource = "google" | "facebook" | "manual";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  published: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  hidden: "bg-white/[0.06] text-white/50 border-white/[0.1]",
  responded: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Pending", published: "Published", hidden: "Hidden", responded: "Responded",
};

const SOURCES: ReviewSource[] = ["google", "facebook", "manual"];
const SOURCE_ICONS: Record<ReviewSource, typeof Globe> = {
  google: Globe,
  facebook: Facebook,
  manual: MessageSquare,
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ─── queries ─────────────────────────────────────────────────────────── */

function useReviews() {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ReviewRow[];
    },
  });
}

function useCustomersLite() {
  return useQuery({
    queryKey: ["reviews:customers-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name").limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ─── page ────────────────────────────────────────────────────────────── */

function ReviewsPage() {
  const { data: reviews, isLoading, isError, error, refetch } = useReviews();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | ReviewSource>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");
  const [editing, setEditing] = useState<ReviewRow | "new" | null>(null);
  const [responding, setResponding] = useState<ReviewRow | null>(null);

  const filtered = useMemo(() => {
    return (reviews ?? []).filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (ratingFilter !== "all" && String(r.rating) !== ratingFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${r.reviewer_name ?? ""} ${r.body ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [reviews, statusFilter, sourceFilter, ratingFilter, search]);

  const kpis = useMemo(() => {
    const list = reviews ?? [];
    const ratings = list.map((r) => r.rating ?? 0).filter((n) => n > 0);
    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "0.0";
    const positive = list.filter((r) => (r.rating ?? 0) >= 4).length;
    const needsFollowUp = list.filter((r) => r.status === "pending" && (r.rating ?? 0) <= 3).length;
    return [
      { label: "Total Reviews", value: String(list.length), icon: MessageSquare, tone: "text-white", bg: "bg-white/10" },
      { label: "Average Rating", value: `${avg} / 5`, icon: Star, tone: "text-[#FFD200]", bg: "bg-[#FFD200]/10" },
      { label: "Positive (4–5★)", value: String(positive), icon: ThumbsUp, tone: "text-[#006B35]", bg: "bg-[#006B35]/10" },
      { label: "Needs Follow-Up", value: String(needsFollowUp), icon: AlertCircle, tone: "text-[#E31B23]", bg: "bg-[#E31B23]/10" },
    ];
  }, [reviews]);

  const distribution = useMemo(() => {
    const list = reviews ?? [];
    const counts = [5, 4, 3, 2, 1].map((stars) => list.filter((r) => r.rating === stars).length);
    const max = Math.max(...counts, 1);
    return { labels: [5, 4, 3, 2, 1], counts, max };
  }, [reviews]);

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Reviews & Reputation</h1>
          <p className="mt-1 text-sm text-white/60">Track customer feedback and review request activity.</p>
        </div>
        <button onClick={() => setEditing("new")} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {/* Automation placeholder note */}
      <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
          <div>
            <p className="text-sm font-semibold text-white">Automated review requests coming soon</p>
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              Live Google/Facebook review sync and automated review request workflows will connect here when the GoHighLevel integration is enabled. For now, reviews are managed manually.
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/50">{k.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{k.value}</p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.bg}`}>
                  <Icon className={`h-4 w-4 ${k.tone}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating distribution */}
      <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
        <h2 className="text-sm font-semibold text-white">Rating Distribution</h2>
        <div className="mt-4 space-y-2">
          {distribution.labels.map((stars, i) => {
            const count = distribution.counts[i];
            const pct = Math.round((count / distribution.max) * 100);
            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex w-12 items-center gap-0.5 text-xs text-white/70">
                  <span>{stars}</span>
                  <Star className="h-3 w-3 fill-[#FFD200] text-[#FFD200]" />
                </div>
                <div className="flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-2 rounded-full bg-[#FFD200]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-white/60">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101820] p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviewer or review text..."
            className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "pending", "published", "hidden", "responded"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg border px-3 py-2 text-xs capitalize transition ${
                statusFilter === s
                  ? "border-[#FFD200]/50 bg-[#FFD200]/15 text-[#FFD200]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {s === "all" ? "All Status" : STATUS_LABEL[s as ReviewStatus]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "google", "facebook", "manual"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`rounded-lg border px-3 py-2 text-xs capitalize transition ${
                sourceFilter === s
                  ? "border-[#FFD200]/50 bg-[#FFD200]/15 text-[#FFD200]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {s === "all" ? "All Sources" : s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "5", "4", "3", "2", "1"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(r)}
              className={`rounded-lg border px-3 py-2 text-xs transition ${
                ratingFilter === r
                  ? "border-[#FFD200]/50 bg-[#FFD200]/15 text-[#FFD200]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {r === "all" ? "All Ratings" : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-10 text-center text-white/50">Loading reviews…</div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-semibold">Couldn't load reviews</p>
          <p className="mt-1 opacity-80">{(error as Error)?.message}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-lg border border-red-300/40 px-3 py-1 text-xs hover:bg-red-500/20">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-white/30" />
          <p className="mt-3 text-white/70">No reviews match your filters.</p>
          <button onClick={() => setEditing("new")} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black">
            <Plus className="h-4 w-4" /> Add first review
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820] md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
                  <tr>
                    {["Reviewer", "Rating", "Source", "Status", "Review Date", "Response", ""].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{r.reviewer_name ?? "Anonymous"}</div>
                        {r.body && <div className="max-w-xs truncate text-xs text-white/60">{r.body}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <Stars n={r.rating ?? 0} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] capitalize text-white/70">
                          {(() => { const I = SOURCE_ICONS[r.source as ReviewSource] || MessageSquare; return <I className="h-3 w-3" />; })()}
                          {r.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] capitalize ${STATUS_STYLES[r.status as ReviewStatus] ?? STATUS_STYLES.pending}`}>
                          {STATUS_LABEL[r.status as ReviewStatus] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70">{fmtDate(r.review_date)}</td>
                      <td className="px-4 py-3">
                        {r.response ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#006B35]">
                            <CheckCircle2 className="h-3 w-3" /> Replied
                          </span>
                        ) : (
                          <span className="text-xs text-white/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button title="Respond" onClick={() => setResponding(r)} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button title="Edit" onClick={() => setEditing(r)} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06] hover:text-white">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((r) => {
              const SourceIcon = SOURCE_ICONS[r.source as ReviewSource] || MessageSquare;
              return (
                <div key={r.id} className="rounded-xl border border-white/[0.08] bg-[#101820] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white">{r.reviewer_name ?? "Anonymous"}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-white/60">
                        <SourceIcon className="h-3 w-3" />
                        <span className="capitalize">{r.source}</span>
                        <span>·</span>
                        <span>{fmtDate(r.review_date)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] capitalize ${STATUS_STYLES[r.status as ReviewStatus] ?? STATUS_STYLES.pending}`}>
                      {STATUS_LABEL[r.status as ReviewStatus] ?? r.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Stars n={r.rating ?? 0} />
                  </div>
                  {r.body && <p className="mt-2 text-sm text-white/80">{r.body}</p>}
                  {r.response && (
                    <div className="mt-2 rounded-lg border border-[#006B35]/20 bg-[#006B35]/10 p-2 text-xs text-[#006B35]">
                      <span className="font-semibold">Response:</span> {r.response}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setResponding(r)} className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white/80 hover:bg-white/[0.06]">
                      <MessageSquare className="h-3 w-3" /> {r.response ? "Edit Response" : "Respond"}
                    </button>
                    <button onClick={() => setEditing(r)} className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white/80 hover:bg-white/[0.06]">
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {editing && (
        <ReviewEditor
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {responding && (
        <ResponseEditor
          review={responding}
          onClose={() => setResponding(null)}
        />
      )}
    </CrmPage>
  );
}

/* ─── stars ───────────────────────────────────────────────────────────── */

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-[#FFD200] text-[#FFD200]" : "text-white/20"}`} />
      ))}
    </div>
  );
}

/* ─── review editor (add / edit) ─────────────────────────────────────── */

function ReviewEditor({ initial, onClose }: { initial: ReviewRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const isNew = !initial;
  const { data: customers } = useCustomersLite();

  const [reviewerName, setReviewerName] = useState(initial?.reviewer_name ?? "");
  const [rating, setRating] = useState<number>(initial?.rating ?? 5);
  const [source, setSource] = useState<ReviewSource>((initial?.source as ReviewSource) ?? "manual");
  const [status, setStatus] = useState<ReviewStatus>((initial?.status as ReviewStatus) ?? "pending");
  const [body, setBody] = useState(initial?.body ?? "");
  const [reviewDate, setReviewDate] = useState<string>(initial?.review_date ?? new Date().toISOString().slice(0, 10));
  const [customerId, setCustomerId] = useState<string | null>(initial?.customer_id ?? null);
  const [response, setResponse] = useState(initial?.response ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        reviewer_name: reviewerName.trim() || null,
        rating,
        source,
        status,
        body: body.trim() || null,
        review_date: reviewDate || null,
        customer_id: customerId,
        response: response.trim() || null,
      };
      if (isNew) {
        const { data, error } = await supabase.from("reviews").insert(payload).select().single();
        if (error) throw error;
        return data as unknown as ReviewRow;
      }
      const { data, error } = await supabase.from("reviews").update(payload).eq("id", initial!.id).select().single();
      if (error) throw error;
      return data as unknown as ReviewRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      onClose();
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      if (!initial) return;
      const { error } = await supabase.from("reviews").delete().eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-lg flex-col border-l border-white/[0.08] bg-[#0B1117] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{isNew ? "Add Review" : "Edit Review"}</h2>
            <p className="text-xs text-white/50">{isNew ? "Manually log a review from any source." : "Update review details or status."}</p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06]"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Field label="Reviewer Name">
            <input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="e.g. John Persaud"
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rating">
              <div className="flex items-center gap-1">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button key={n} onClick={() => setRating(n)} className="rounded p-1 hover:bg-white/[0.06]">
                    <Star className={`h-6 w-6 ${n <= rating ? "fill-[#FFD200] text-[#FFD200]" : "text-white/20"}`} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Review Date">
              <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Source">
              <select value={source} onChange={(e) => setSource(e.target.value as ReviewSource)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as ReviewStatus)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
                {(["pending", "published", "hidden", "responded"] as ReviewStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Linked Customer">
            <select value={customerId ?? ""} onChange={(e) => setCustomerId(e.target.value || null)}
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
              <option value="">— None —</option>
              {(customers ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Review Body">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="What did the reviewer say?"
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>

          <Field label="Response">
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} placeholder="Your public or internal response..."
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4">
          <div>
            {!isNew && (
              <button onClick={() => del.mutate()} className="rounded-lg px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10">
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.04]">Cancel</button>
            <button onClick={() => save.mutate()} disabled={save.isPending}
              className="rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-60">
              {save.isPending ? "Saving…" : isNew ? "Add Review" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── response editor (quick respond) ─────────────────────────────────── */

function ResponseEditor({ review, onClose }: { review: ReviewRow; onClose: () => void }) {
  const qc = useQueryClient();
  const [response, setResponse] = useState(review.response ?? "");
  const [status, setStatus] = useState<ReviewStatus>((review.status as ReviewStatus) ?? "pending");

  const save = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          response: response.trim() || null,
          status: response.trim() ? "responded" : status,
        })
        .eq("id", review.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-lg flex-col border-l border-white/[0.08] bg-[#0B1117] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Respond to Review</h2>
            <p className="text-xs text-white/50">{review.reviewer_name ?? "Anonymous"} · <Stars n={review.rating ?? 0} /></p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06]"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {review.body && (
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-white/50">Original Review</p>
              <p className="mt-2 text-sm text-white/80">{review.body}</p>
            </div>
          )}

          <Field label="Your Response">
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={5} placeholder="Write a thoughtful response..."
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>

          <Field label="Change Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as ReviewStatus)}
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
              {(["pending", "published", "hidden", "responded"] as ReviewStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.04]">Cancel</button>
          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-60">
            {save.isPending ? "Saving…" : "Save Response"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── field wrapper ───────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">{label}</label>
      {children}
    </div>
  );
}
