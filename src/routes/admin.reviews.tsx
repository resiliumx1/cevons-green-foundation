import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, RefreshCw, Search, Star } from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { PanelSkeleton } from "@/components/admin/Manifest";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { georgetownLabel } from "@/lib/georgetown";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews | CEVONS Website Admin" },
      { name: "description", content: "Review and respond to customer feedback for CEVONS." },
      { property: "og:title", content: "Reviews | CEVONS Website Admin" },
      { property: "og:description", content: "Review and respond to customer feedback for CEVONS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReviewsPage,
});

type Review = Database["public"]["Tables"]["reviews"]["Row"];
type RatingFilter = "all" | "positive" | "neutral" | "critical" | "unanswered";

function toneForRating(rating: number | null) {
  if (rating !== null && rating >= 4) return "positive";
  if (rating !== null && rating >= 3) return "neutral";
  return "critical";
}

function Rating({ value }: { value: number | null }) {
  const safeValue = value === null ? 0 : Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="admin-review-stars" aria-label={value === null ? "Rating unavailable" : `${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={index < safeValue ? "is-filled" : ""} aria-hidden />
      ))}
    </span>
  );
}

function ReviewsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RatingFilter>("all");

  const reviews = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("review_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`admin-reviews-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        void qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [qc]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (reviews.data ?? []).filter((review) => {
      const tone = toneForRating(review.rating);
      if (filter === "unanswered" && review.response) return false;
      if (!["all", "unanswered"].includes(filter) && tone !== filter) return false;
      return !term || `${review.reviewer_name ?? ""} ${review.body ?? ""} ${review.response ?? ""}`.toLowerCase().includes(term);
    });
  }, [filter, reviews.data, search]);

  return (
    <CrmPage className="admin-glass-page space-y-4">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-display text-[24px] sm:text-[30px]">Reviews</h1>
          <p className="text-sm text-[var(--text-2)]">Customer feedback and saved replies in one place.</p>
        </div>
        <Button type="button" className="admin-btn-primary" disabled title="Google Business Profile API access is not connected">
          <RefreshCw aria-hidden /> Sync now
        </Button>
      </header>

      <section className="admin-review-setup" aria-labelledby="reviews-setup-title">
        <AlertCircle aria-hidden />
        <div>
          <h2 id="reviews-setup-title">Google connection required</h2>
          <p>Google has not yet approved or connected Business Profile access. Live syncing and posting replies remain unavailable until that access is ready.</p>
        </div>
      </section>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search aria-hidden />
          <input className="admin-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reviews or replies…" aria-label="Search reviews" />
        </div>
        <select className="admin-select" value={filter} onChange={(event) => setFilter(event.target.value as RatingFilter)} aria-label="Filter reviews">
          <option value="all">All reviews</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="critical">Critical</option>
          <option value="unanswered">Unanswered</option>
        </select>
      </div>

      {reviews.isLoading ? (
        <div className="admin-panel p-5"><PanelSkeleton rows={5} /></div>
      ) : reviews.isError ? (
        <div className="admin-state admin-state-error" role="alert">
          <AlertCircle aria-hidden />
          <div><p className="font-semibold">Reviews could not be loaded.</p><p className="admin-state-detail">{reviews.error instanceof Error ? reviews.error.message : "Unknown error"}</p></div>
        </div>
      ) : rows.length === 0 ? (
        <div className="admin-state admin-state-empty">
          <p className="font-semibold">{reviews.data?.length ? "No reviews match these filters." : "No reviews are stored yet. Reviews will appear here after the Google connection is approved and synced."}</p>
        </div>
      ) : (
        <div className="admin-review-feed" aria-live="polite">
          {rows.map((review) => {
            const tone = toneForRating(review.rating);
            return (
              <article key={review.id} className={`admin-review-card is-${tone}`}>
                <div className="admin-review-head">
                  <div className="min-w-0">
                    <h2>{review.reviewer_name || "Google reviewer"}</h2>
                    <p>{review.review_date ? georgetownLabel(review.review_date) : georgetownLabel(review.created_at)} · {review.source}</p>
                  </div>
                  <Rating value={review.rating} />
                </div>
                <p className="admin-review-body">{review.body || "No written review was provided."}</p>
                <div className="admin-review-reply">
                  <div className="admin-review-reply-title">
                    {review.response ? <CheckCircle2 aria-hidden /> : <AlertCircle aria-hidden />}
                    <strong>{review.response ? "Saved reply" : "Reply needed"}</strong>
                  </div>
                  {review.response ? <p>{review.response}</p> : <p>Reply posting will be available after Google Business Profile access is connected.</p>}
                  <Button type="button" variant="outline" disabled title="Google Business Profile API access is not connected">
                    {review.response ? "Edit reply" : "Write reply"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </CrmPage>
  );
}