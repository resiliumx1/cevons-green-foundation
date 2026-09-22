import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Search, Send, Star, X } from "lucide-react";
import { runReviewFollowups, sendReviewFollowup } from "@/lib/reviewFollowups.functions";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { GEORGETOWN_LABEL, georgetownLabel } from "@/lib/georgetown";
import { PanelSkeleton, PanelError, DocketStrip } from "@/components/admin/Manifest";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReviewsPage,
});

type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number | null;
  body: string | null;
  source: string;
  status: string;
  response: string | null;
  review_date: string | null;
  created_at: string;
};

/** How a rating is flagged in the list and in the Alerts tab. */
function ratingFlag(rating: number | null) {
  if (rating === null) return { label: "No rating", tone: "#64748B" };
  if (rating <= 2) return { label: `Poor · ${rating}★`, tone: "#DC2626" };
  if (rating === 3) return { label: "Mixed · 3★", tone: "#D97706" };
  return { label: `Positive · ${rating}★`, tone: "#15803D" };
}

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="size-3.5"
          aria-hidden
          style={{
            color: n <= rating ? "#EA6A00" : "var(--crm-text-faint)",
            fill: n <= rating ? "#EA6A00" : "transparent",
          }}
        />
      ))}
    </span>
  );
}

type RatingFilter = "all" | "low" | "mixed" | "high" | "none";

function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [source, setSource] = useState("all");

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, reviewer_name, rating, body, source, status, response, review_date, created_at",
        )
        .order("review_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

  const sources = useMemo(
    () => Array.from(new Set(data.map((r) => r.source))).sort(),
    [data],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      if (source !== "all" && r.source !== source) return false;
      const rating = r.rating;
      if (ratingFilter === "none" && rating !== null) return false;
      if (ratingFilter === "low" && !(rating !== null && rating <= 2)) return false;
      if (ratingFilter === "mixed" && rating !== 3) return false;
      if (ratingFilter === "high" && !(rating !== null && rating >= 4)) return false;
      if (
        q &&
        !`${r.reviewer_name ?? ""} ${r.body ?? ""} ${r.source} ${r.response ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [data, search, ratingFilter, source]);

  const rated = data.filter((r) => r.rating !== null);
  const average =
    rated.length > 0
      ? (rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length).toFixed(1)
      : null;
  const lowCount = data.filter((r) => r.rating !== null && r.rating <= 2).length;
  const unanswered = data.filter((r) => !r.response).length;
  const filtersActive = !!search || ratingFilter !== "all" || source !== "all";

  return (
    <CrmPage className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>
            Reviews
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
            Read-only. Every review saved here also appears in Alerts, flagged by its rating.
            Times are {GEORGETOWN_LABEL}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="admin-btn-quiet"
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </div>

      <DocketStrip
        loading={isLoading}
        cells={[
          { code: "REV-A", label: "Reviews", value: data.length },
          average
            ? { code: "REV-B", label: "Average rating", value: `${average}★` }
            : { code: "REV-B", label: "Average rating", unavailable: "No rated reviews yet." },
          { code: "REV-C", label: "Poor (1–2★)", value: lowCount },
          { code: "REV-D", label: "Without a reply", value: unanswered },
        ]}
      />

      <FollowupsPanel />

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search aria-hidden />
          <input
            className="admin-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviewer, text or reply…"
            aria-label="Search reviews"
            type="search"
          />
        </div>
        <select
          className="admin-select"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
          aria-label="Filter by rating"
        >
          <option value="all">All ratings</option>
          <option value="low">Poor (1–2★)</option>
          <option value="mixed">Mixed (3★)</option>
          <option value="high">Positive (4–5★)</option>
          <option value="none">No rating</option>
        </select>
        <select
          className="admin-select"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          aria-label="Filter by source"
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button
            type="button"
            className="admin-btn-quiet"
            onClick={() => {
              setSearch("");
              setRatingFilter("all");
              setSource("all");
            }}
          >
            <X className="h-4 w-4" aria-hidden /> Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}
        >
          <PanelSkeleton rows={5} />
        </div>
      ) : isError ? (
        <PanelError what="reviews" error={error} />
      ) : rows.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}
        >
          <Star className="size-6 mx-auto mb-2" style={{ color: "var(--crm-text-faint)" }} />
          <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
            {filtersActive
              ? "No reviews match these filters."
              : "No reviews have been recorded yet. Reviews saved to CEVONS appear here and raise an alert, flagged by rating."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const flag = ratingFlag(r.rating);
            return (
              <article
                key={r.id}
                className="rounded-xl border p-3"
                style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5"
                    style={{ background: flag.tone, color: "#FFFFFF" }}
                  >
                    {flag.label}
                  </span>
                  <Stars rating={r.rating} />
                  <span className="font-semibold truncate" style={{ color: "var(--crm-text)" }}>
                    {r.reviewer_name || "Anonymous"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--crm-text-muted)" }}>
                    {r.source}
                  </span>
                  <span
                    className="text-xs ml-auto shrink-0"
                    style={{ color: "var(--crm-text-muted)" }}
                  >
                    {r.review_date ?? georgetownLabel(r.created_at)}
                  </span>
                </div>
                {r.body && (
                  <p
                    className="text-sm mt-2 whitespace-pre-wrap"
                    style={{ color: "var(--crm-text)" }}
                  >
                    {r.body}
                  </p>
                )}
                {r.response ? (
                  <div
                    className="mt-3 rounded-lg border p-2"
                    style={{ borderColor: "var(--crm-border)" }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide mb-1"
                      style={{ color: "var(--crm-text-muted)" }}
                    >
                      Reply on record
                    </p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--crm-text)" }}>
                      {r.response}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs mt-2" style={{ color: "var(--crm-text-muted)" }}>
                    No reply recorded.
                  </p>
                )}
              </article>
            );
          })}
          <p className="text-xs pt-1" style={{ color: "var(--crm-text-muted)" }}>
            Showing {rows.length} of {data.length} reviews.
          </p>
        </div>
      )}
    </CrmPage>
  );
}
