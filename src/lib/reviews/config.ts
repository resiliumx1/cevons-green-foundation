/** Shape stored in crm_settings under the key `review_followup`. */
export interface ReviewFollowupSettings {
  enabled: boolean;
  reviewUrl: string;
  delayHours: number;
}

export const DEFAULT_REVIEW_FOLLOWUP: ReviewFollowupSettings = {
  enabled: false,
  reviewUrl: "",
  delayHours: 24,
};

/** Only a secure https link is ever accepted as the review destination. */
export function normalizeReviewFollowup(value: unknown): ReviewFollowupSettings {
  const v = (value ?? {}) as Partial<ReviewFollowupSettings>;
  const url = String(v.reviewUrl ?? "").trim();
  const hours = Number(v.delayHours);
  return {
    enabled: Boolean(v.enabled),
    reviewUrl: /^https:\/\//i.test(url) ? url : "",
    delayHours: Number.isFinite(hours) ? Math.min(720, Math.max(0, Math.round(hours))) : 24,
  };
}
