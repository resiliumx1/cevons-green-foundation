import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "owner" | "admin" | "editor" | "contributor" | "viewer" | "staff" | "user";

export type AdminIdentity = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  roles: AdminRole[];
};

/**
 * Reads the current admin session and the caller's role rows from `user_roles`.
 * Roles are NEVER read from user_metadata or JWT claims — only from the table,
 * which is protected by RLS (a user may read only their own rows).
 */
export function useAdminIdentity(): AdminIdentity {
  const [state, setState] = useState<AdminIdentity>({
    loading: true,
    userId: null,
    email: null,
    roles: [],
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user ?? null;
      if (!user) {
        if (!cancelled) setState({ loading: false, userId: null, email: null, roles: [] });
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      setState({
        loading: false,
        userId: user.id,
        email: user.email ?? null,
        roles: (roleRows ?? []).map((r) => r.role as AdminRole),
      });
    };

    void load();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void load();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOutAdmin() {
  try {
    localStorage.removeItem("crm-assistant-session");
  } catch {
    // ignore
  }
  await supabase.auth.signOut();
}

/** Maps a Supabase auth error into a specific, actionable message. */
export function describeAuthError(err: { message?: string; status?: number } | null): string {
  const msg = (err?.message ?? "").toLowerCase();
  if (!err) return "";
  if (msg.includes("invalid login credentials")) {
    return "That email and password don't match an account. Check for typos, or ask your administrator to reset your password.";
  }
  if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
    return "This account's email hasn't been confirmed yet. Open the confirmation link we emailed you, or ask your administrator to re-send it.";
  }
  if (err.status === 429 || msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Wait about a minute before trying again.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "Couldn't reach the server. Check your internet connection and try again.";
  }
  if (msg.includes("user not found")) {
    return "No account exists for that email. Accounts are created by an administrator only.";
  }
  return err.message ?? "Sign-in failed.";
}
