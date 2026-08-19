import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type InviteInput = { email: string; role: string; redirectTo: string };

const ROLES = ["owner", "admin", "editor", "contributor", "viewer"] as const;

/**
 * Invites someone into the CEVONS Website Admin.
 *
 * Runs entirely server-side because creating an auth account and sending the
 * official invitation email both need privileged access. The caller must be an
 * owner or admin — verified through their own (RLS-scoped) session, never from
 * anything the browser sends.
 */
export const inviteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: InviteInput) => {
    const email = String(input?.email ?? "").trim().toLowerCase();
    const role = String(input?.role ?? "");
    const redirectTo = String(input?.redirectTo ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address.");
    }
    if (!(ROLES as readonly string[]).includes(role)) {
      throw new Error("Choose a valid role.");
    }
    if (!/^https?:\/\//.test(redirectTo)) {
      throw new Error("Invalid redirect target.");
    }
    return { email, role, redirectTo };
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (roleError) throw new Error("Could not verify your access.");
    if (!isAdmin) throw new Error("Only an owner or admin can invite people.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Record the intended role first: the database applies it on first sign-in.
    // A pending invitation for this address may already exist — refresh it
    // instead of inserting a duplicate (unique index on pending emails).
    const expires = new Date(Date.now() + 7 * 86400000).toISOString();
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("invitations")
      .select("id")
      .eq("email", data.email)
      .is("accepted_at", null)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);

    if (existing?.id) {
      const { error: updError } = await supabaseAdmin
        .from("invitations")
        .update({
          role: data.role as never,
          expires_at: expires,
          invited_by: context.userId,
        })
        .eq("id", existing.id);
      if (updError) throw new Error(updError.message);
    } else {
      const { error: invError } = await supabaseAdmin
        .from("invitations")
        .insert({
          email: data.email,
          role: data.role as never,
          expires_at: expires,
          invited_by: context.userId,
        });
      if (invError) throw new Error(invError.message);
    }


    // Try a real invitation first (creates the account). If the person already
    // has an account, fall back to a password-recovery email instead.
    const invite = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      redirectTo: data.redirectTo,
    });

    if (invite.error) {
      const msg = (invite.error.message ?? "").toLowerCase();
      const alreadyExists =
        msg.includes("already been registered") ||
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        invite.error.status === 422;

      if (!alreadyExists) {
        throw new Error(`The invitation email could not be sent: ${invite.error.message}`);
      }

      const recovery = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
        redirectTo: data.redirectTo,
      });
      if (recovery.error) {
        throw new Error(`The invitation email could not be sent: ${recovery.error.message}`);
      }
      return { email: data.email, existingAccount: true };
    }

    return { email: data.email, existingAccount: false };
  });

/**
 * Re-sends an existing pending invitation and extends its expiry.
 * Works whether or not the person ever signed in.
 */
export const resendAdminInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; redirectTo: string }) => {
    const id = String(input?.id ?? "");
    const redirectTo = String(input?.redirectTo ?? "");
    if (!id) throw new Error("Missing invitation.");
    if (!/^https?:\/\//.test(redirectTo)) throw new Error("Invalid redirect target.");
    return { id, redirectTo };
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("is_admin", {
      _user_id: context.userId,
    });
    if (roleError) throw new Error("Could not verify your access.");
    if (!isAdmin) throw new Error("Only an owner or admin can resend invitations.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: readError } = await supabaseAdmin
      .from("invitations")
      .update({ expires_at: new Date(Date.now() + 7 * 86400000).toISOString() })
      .eq("id", data.id)
      .select("email")
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!row?.email) throw new Error("That invitation no longer exists.");

    const invite = await supabaseAdmin.auth.admin.inviteUserByEmail(row.email, {
      redirectTo: data.redirectTo,
    });
    if (invite.error) {
      const recovery = await supabaseAdmin.auth.resetPasswordForEmail(row.email, {
        redirectTo: data.redirectTo,
      });
      if (recovery.error) {
        throw new Error(`The email could not be sent: ${recovery.error.message}`);
      }
      return { email: row.email, existingAccount: true };
    }
    return { email: row.email, existingAccount: false };
  });
