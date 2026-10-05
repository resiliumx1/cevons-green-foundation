import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type GoogleBusinessReviewDto = {
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

const replyInput = z.object({
  reviewName: z
    .string()
    .regex(/^accounts\/\d+\/locations\/\d+\/reviews\/[A-Za-z0-9_-]+$/),
  comment: z.string().trim().min(1, "Write a reply first.").max(4096, "Keep the reply under 4,096 characters."),
});

async function requireStaff(context: {
  supabase: { rpc: (name: string, args: { _user_id: string }) => PromiseLike<{ data: unknown; error: unknown }> };
  userId: string;
}) {
  const { data: isStaff, error } = await context.supabase.rpc("is_staff", {
    _user_id: context.userId,
  });
  if (error) throw new Error("Could not verify your access.");
  if (!isStaff) throw new Error("Only CEVONS staff can manage Google review replies.");
}

export const listGoogleBusinessReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context);
    const { listManagedGoogleReviews } = await import("./google.server");
    return listManagedGoogleReviews();
  });

export const postGoogleBusinessReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => replyInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const { replyToManagedGoogleReview } = await import("./google.server");
    return replyToManagedGoogleReview(data.reviewName, data.comment);
  });