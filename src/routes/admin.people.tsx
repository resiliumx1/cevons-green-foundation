import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inviteAdminUser, resendAdminInvite } from "@/lib/adminPeople.functions";

import { Loader2, Mail, RotateCcw, ShieldAlert, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelSkeleton,
  georgetownStamp,
  timeAgo,
} from "@/components/admin/Manifest";
import {
  ASSIGNABLE_ROLES,
  ROLE_MEANINGS,
  isAdminRole,
  useAdminIdentity,
  type AdminRole,
} from "@/lib/adminAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/people")({
  head: () => ({
    meta: [
      { title: "People | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  const identity = useAdminIdentity();

  if (identity.loading) {
    return (
      <CrmPage className="space-y-6">
        <PanelSkeleton rows={4} />
      </CrmPage>
    );
  }

  if (!isAdminRole(identity.roles)) {
    return (
      <CrmPage className="space-y-6">
        <div className="admin-state admin-state-error" role="alert">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">You don't have access to this screen.</p>
            <p className="admin-state-detail">
              People is limited to owners and administrators. Ask an administrator if you need access.
            </p>
          </div>
        </div>
      </CrmPage>
    );
  }

  return (
    <CrmPage className="space-y-6">
      <header className="space-y-1">
        <p className="admin-mono" style={{ color: "var(--text-2)" }}>
          Access control · Georgetown time (UTC−4)
        </p>
        <h1 className="admin-display" style={{ fontSize: 30, fontWeight: 800, color: "var(--text)" }}>
          People
        </h1>
      </header>

      <InviteForm />
      <PeopleTable currentUserId={identity.userId} />
      <PendingInvites />
      <RoleLegend />
    </CrmPage>
  );
}

/* ── Invite ────────────────────────────────────────────────────────────── */

function InviteForm() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const sendInvite = useServerFn(inviteAdminUser);

  const invite = useMutation({
    mutationFn: async () => {
      const clean = email.trim().toLowerCase();
      if (!clean) throw new Error("Enter an email address.");
      // The account is created and the email sent server-side, so a brand-new
      // colleague actually receives something they can use.
      return sendInvite({
        data: {
          email: clean,
          role,
          redirectTo: `${window.location.origin}/admin/reset-password`,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(
        res.existingAccount
          ? `${res.email} already had an account — we sent them a link to set a new password.`
          : `Invitation sent to ${res.email}`,
      );
      setEmail("");
      void qc.invalidateQueries({ queryKey: ["admin", "invitations"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not send the invitation."),
  });


  return (
    <Panel title="Invite someone" code="P-10">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          invite.mutate();
        }}
      >
        <label className="flex-1 min-w-[240px]">
          <span className="admin-mono block mb-1" style={{ color: "var(--text-2)" }}>
            Email address
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@cevons.com"
            className="admin-input"
          />
        </label>
        <label className="min-w-[180px]">
          <span className="admin-mono block mb-1" style={{ color: "var(--text-2)" }}>
            Role
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="admin-input"
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="admin-btn-primary" disabled={invite.isPending}>
          {invite.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <UserPlus className="h-4 w-4" aria-hidden />
          )}
          Send invitation
        </button>
      </form>
      <p className="admin-mono mt-3" style={{ color: "var(--text-2)" }}>
        They receive an email to set a password. Their role is applied by the database on first sign-in.
      </p>
    </Panel>
  );
}

/* ── People list ───────────────────────────────────────────────────────── */

type Person = {
  user_id: string;
  email: string | null;
  role: string;
  role_granted_at: string;
  user_created_at: string | null;
};

function PeopleTable({ currentUserId }: { currentUserId: string | null }) {
  const qc = useQueryClient();
  const [pendingRemoval, setPendingRemoval] = useState<Person | null>(null);

  const q = useQuery({
    queryKey: ["admin", "people"],
    queryFn: async (): Promise<Person[]> => {
      const { data, error } = await supabase.rpc("list_admin_people");
      if (error) throw error;
      return (data ?? []) as Person[];
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AdminRole }) => {
      const { error } = await supabase.rpc("admin_set_user_role", {
        _user_id: userId,
        _role: role as never,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role updated.");
      void qc.invalidateQueries({ queryKey: ["admin", "people"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not change that role."),
  });

  const remove = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("admin_remove_user_access", { _user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access removed.");
      setPendingRemoval(null);
      void qc.invalidateQueries({ queryKey: ["admin", "people"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not remove access."),
  });

  const rows = q.data ?? [];

  return (
    <Panel title="Accounts" code="P-11">
      {q.isLoading ? (
        <PanelSkeleton rows={4} />
      ) : q.isError ? (
        <PanelError what="the list of accounts" error={q.error} />
      ) : rows.length === 0 ? (
        <PanelEmpty headline="No one has admin access yet. Invite a colleague above to get started." />
      ) : (
        <table className="admin-stack admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Added</th>
              <th className="text-right">Access</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const isSelf = p.user_id === currentUserId;
              return (
                <tr key={`${p.user_id}-${p.role}`}>
                  <td data-label="Email">{p.email ?? "—"}</td>
                  <td data-label="Role">
                    <select
                      className="admin-input"
                      value={p.role}
                      disabled={isSelf || setRole.isPending}
                      aria-label={`Role for ${p.email ?? p.user_id}`}
                      onChange={(e) =>
                        setRole.mutate({ userId: p.user_id, role: e.target.value as AdminRole })
                      }
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                      {!ASSIGNABLE_ROLES.includes(p.role as (typeof ASSIGNABLE_ROLES)[number]) && (
                        <option value={p.role}>{p.role}</option>
                      )}
                    </select>
                    {isSelf && (
                      <p className="admin-mono mt-1" style={{ color: "var(--text-2)" }}>
                        You can't change your own role
                      </p>
                    )}
                  </td>
                  <td data-label="Added" title={georgetownStamp(p.role_granted_at)}>
                    {timeAgo(p.role_granted_at)}
                  </td>
                  <td data-label="Access" className="text-right">
                    <button
                      type="button"
                      className="admin-btn-danger"
                      disabled={isSelf}
                      onClick={() => setPendingRemoval(p)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden /> Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <AlertDialog open={!!pendingRemoval} onOpenChange={(o) => !o && setPendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove access for {pendingRemoval?.email ?? "this person"}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will no longer be able to open the CEVONS Website Admin. Their account itself is not
              deleted, and you can invite them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep access</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingRemoval && remove.mutate(pendingRemoval.user_id)}
            >
              Remove access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}

/* ── Pending invitations ───────────────────────────────────────────────── */

function PendingInvites() {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["admin", "invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id, email, role, created_at, expires_at, accepted_at")
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation revoked.");
      void qc.invalidateQueries({ queryKey: ["admin", "invitations"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not revoke."),
  });

  const resend = useMutation({
    mutationFn: async (inv: { id: string; email: string }) => {
      const { error } = await supabase
        .from("invitations")
        .update({ expires_at: new Date(Date.now() + 7 * 86400000).toISOString() })
        .eq("id", inv.id);
      if (error) throw error;
      const { error: mailError } = await supabase.auth.resetPasswordForEmail(inv.email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (mailError) throw mailError;
    },
    onSuccess: () => {
      toast.success("Invitation re-sent and expiry extended.");
      void qc.invalidateQueries({ queryKey: ["admin", "invitations"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not resend."),
  });

  const rows = q.data ?? [];

  return (
    <Panel title="Pending invitations" code="P-12">
      {q.isLoading ? (
        <PanelSkeleton rows={2} />
      ) : q.isError ? (
        <PanelError what="pending invitations" error={q.error} />
      ) : rows.length === 0 ? (
        <PanelEmpty headline="No invitations are waiting. Invite a colleague above when you need to add someone." />
      ) : (
        <table className="admin-stack admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Expires</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inv) => {
              const expired = new Date(inv.expires_at).getTime() < Date.now();
              return (
                <tr key={inv.id}>
                  <td data-label="Email">{inv.email}</td>
                  <td data-label="Role">{inv.role}</td>
                  <td data-label="Expires">
                    <span className={expired ? "admin-chip-expired" : "admin-chip-live"}>
                      {expired ? "Expired" : "Valid"}
                    </span>{" "}
                    <span className="admin-mono">{georgetownStamp(inv.expires_at)}</span>
                  </td>
                  <td data-label="Actions" className="text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="admin-btn-quiet"
                      onClick={() => resend.mutate({ id: inv.id, email: inv.email })}
                      disabled={resend.isPending}
                    >
                      <Mail className="h-4 w-4" aria-hidden /> Resend
                    </button>{" "}
                    <button
                      type="button"
                      className="admin-btn-danger"
                      onClick={() => revoke.mutate(inv.id)}
                      disabled={revoke.isPending}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden /> Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function RoleLegend() {
  const legend = useMemo(() => ASSIGNABLE_ROLES.map((r) => ({ role: r, text: ROLE_MEANINGS[r] })), []);
  return (
    <Panel title="What each role can do" code="P-13">
      <table className="admin-stack admin-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Access</th>
          </tr>
        </thead>
        <tbody>
          {legend.map((l) => (
            <tr key={l.role}>
              <td data-label="Role" className="admin-mono">
                {l.role}
              </td>
              <td data-label="Access">{l.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
