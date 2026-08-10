import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import logo from "@/assets/cevons-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { describeAuthError } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin_/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase parses the recovery link in the URL and establishes a temporary
  // session; wait for it before showing the form.
  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setHasRecoverySession(!!session);
      setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setHasRecoverySession(!!data.session);
      setReady(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(describeAuthError(updateError));
        return;
      }
      setDone(true);
      setTimeout(() => navigate({ to: "/admin", replace: true }), 1200);
    } catch (err) {
      setError(describeAuthError(err as { message?: string }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020f08] px-4 py-16 text-white">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.06] p-8 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg">
            <img src={logo} alt="CEVONS logo" className="h-10 w-10 object-contain" />
          </div>
          <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#FFD200]">
            CEVONS Website Admin
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Set a new password</h1>
        </div>

        {!ready ? (
          <p className="mt-8 text-center text-sm text-white/70">Checking your reset link…</p>
        ) : !hasRecoverySession ? (
          <div className="mt-8 space-y-4 text-sm text-white/80">
            <div className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-red-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This reset link is missing, expired, or already used. Request a new one from the login page.
              </span>
            </div>
            <Link to="/admin/login" className="block text-center font-medium text-[#FFD200] hover:text-white">
              Back to login
            </Link>
          </div>
        ) : done ? (
          <div className="mt-8 flex items-start gap-2 rounded-2xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-50">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Password updated. Taking you to the admin…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="relative">
              <label htmlFor="new-password" className="sr-only">
                New password
              </label>
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/80" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="h-14 w-full rounded-2xl border border-white/25 bg-white/10 pl-12 pr-4 text-white outline-none placeholder:text-white/70 focus:border-emerald-400/80"
              />
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm new password
              </label>
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/80" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="h-14 w-full rounded-2xl border border-white/25 bg-white/10 pl-12 pr-4 text-white outline-none placeholder:text-white/70 focus:border-emerald-400/80"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-[#101820] disabled:cursor-wait"
              style={{ background: "linear-gradient(90deg, #FFD200 0%, #EF7700 70%, #EF7700 100%)" }}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
