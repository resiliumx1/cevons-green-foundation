const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_business_profile";

type GoogleAccount = {
  name?: string;
  accountName?: string;
};

type GoogleLocation = {
  name?: string;
  title?: string;
  storefrontAddress?: {
    locality?: string;
  };
};

type GoogleReviewResponse = {
  reviews?: Array<{
    reviewId?: string;
    name?: string;
    reviewer?: { displayName?: string; profilePhotoUrl?: string };
    starRating?: string;
    comment?: string;
    createTime?: string;
    updateTime?: string;
    reviewReply?: { comment?: string; updateTime?: string };
  }>;
  nextPageToken?: string;
};

export type GoogleBusinessReview = {
  id: string;
  name: string;
  reviewerName: string;
  reviewerPhotoUrl: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  reply: string | null;
  replyUpdatedAt: string | null;
  locationName: string;
  locationLocality: string | null;
};

function credentials() {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const connectionApiKey = process.env["GOOGLE_BUSINESS_PROFILE_API_KEY"];
  if (!lovableApiKey || !connectionApiKey) {
    throw new Error("Google Business Profile is not connected.");
  }
  return {
    Authorization: `Bearer ${lovableApiKey}`,
    "X-Connection-Api-Key": connectionApiKey,
    "Content-Type": "application/json",
  };
}

async function googleRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: { ...credentials(), ...init?.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error(`Google Business Profile request failed [${response.status}]: ${detail}`);
    throw new Error(`Google Business Profile request failed (${response.status}).`);
  }
  if (response.status === 204) return {} as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

function ratingNumber(value?: string) {
  return { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[value ?? ""] ?? 0;
}

async function listAccounts() {
  const result = await googleRequest<{ accounts?: GoogleAccount[] }>(
    "/account_management/v1/accounts",
  );
  return (result.accounts ?? []).filter(
    (account): account is GoogleAccount & { name: string } => Boolean(account.name),
  );
}

async function listLocations(accountName: string) {
  const path = `/business_information/v1/${accountName}/locations?readMask=name,title,storefrontAddress`;
  const result = await googleRequest<{ locations?: GoogleLocation[] }>(path);
  return (result.locations ?? []).filter(
    (location): location is GoogleLocation & { name: string } => Boolean(location.name),
  );
}

async function listLocationReviews(
  accountName: string,
  location: GoogleLocation & { name: string },
) {
  const locationId = location.name.split("/").at(-1);
  if (!locationId) return [];

  const reviews: GoogleBusinessReview[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: "50" });
    if (pageToken) params.set("pageToken", pageToken);
    const result = await googleRequest<GoogleReviewResponse>(
      `/my_business/v4/${accountName}/locations/${locationId}/reviews?${params.toString()}`,
    );
    for (const review of result.reviews ?? []) {
      if (!review.reviewId || !review.name || !review.createTime) continue;
      reviews.push({
        id: review.reviewId,
        name: review.name,
        reviewerName: review.reviewer?.displayName?.trim() || "Anonymous",
        reviewerPhotoUrl: review.reviewer?.profilePhotoUrl ?? null,
        rating: ratingNumber(review.starRating),
        comment: review.comment?.trim() || null,
        createdAt: review.createTime,
        updatedAt: review.updateTime ?? review.createTime,
        reply: review.reviewReply?.comment?.trim() || null,
        replyUpdatedAt: review.reviewReply?.updateTime ?? null,
        locationName: location.title?.trim() || "CEVONS",
        locationLocality: location.storefrontAddress?.locality?.trim() || null,
      });
    }
    pageToken = result.nextPageToken;
  } while (pageToken);

  return reviews;
}

export async function listManagedGoogleReviews() {
  const accounts = await listAccounts();
  const locations = (await Promise.all(accounts.map((account) => listLocations(account.name)))).flatMap(
    (accountLocations, index) =>
      accountLocations.map((location) => ({ accountName: accounts[index].name, location })),
  );
  const reviews = (
    await Promise.all(
      locations.map(({ accountName, location }) => listLocationReviews(accountName, location)),
    )
  ).flat();
  return reviews.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function replyToManagedGoogleReview(reviewName: string, comment: string) {
  const result = await googleRequest<{ comment?: string; updateTime?: string }>(
    `/my_business/v4/${reviewName}/reply`,
    { method: "PUT", body: JSON.stringify({ comment }) },
  );
  return {
    comment: result.comment?.trim() || comment,
    updateTime: result.updateTime ?? new Date().toISOString(),
  };
}