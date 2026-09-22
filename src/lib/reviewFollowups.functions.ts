/**
 * Admin-only controls for the Google review follow-up automation.
 * Every call verifies the signed-in user is staff before any send happens.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(context: { supabase: any; userId: string }) {
  const { data: isStaff, error } = await context.supabase.rpc("is_staff", {
    _user_id: context.userId,
  });
  if (error) throw new Error("Could not verify your access.");
  if (!isStaff) throw new Error("Only CEVONS staff can send review follow-ups.");
}

export const sendReviewFollowup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ followupId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertStaff(context as any);
    const { sendReviewFollowupNow } = await import("@/lib/reviews/followups.server");
    return sendReviewFollowupNow(data.followupId);
  });

export const runReviewFollowups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context as any);
    const { drainReviewFollowups } = await import("@/lib/reviews/followups.server");
    return drainReviewFollowups(25);
  });
