import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock, Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import logo from "@/assets/cevons-logo-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import { describeAuthError } from "@/lib/adminAuth";
import { CrmThemeProvider, useCrmTheme } from "@/components/admin/theme";

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
  return (
    <CrmThemeProvider>
      <ResetPasswordScreen />
    </CrmThemeProvider>
  );
}

function ResetPasswordScreen() {
  const { theme } = useCrmTheme();
  
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [reveal, setReveal] = useState(false);

  const rules = useMemo(
    () => [
      { label: "At least 8 characters", ok: password.length >= 8 },
      { label: "One letter", ok: /[A-Za-z]/.test(password) },
      { label: "One number or symbol", ok: /[^A-Za-z]/.test(password) },
    ],
    [password],
  );
  const canSubmit = rules.every((r) => r.ok) && password === confirm;

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
    if (!/[A-Za-z]/.test(password) || !/[^A-Za-z]/.test(password)) {
      setError("Include at least one letter and one number or symbol.");
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
      // Hard navigation: the admin shell re-reads the session and claims the
      // invited role on this first load.
      setTimeout(() => window.location.assign("/admin"), 1200);

    } catch (err) {
      setError(describeAuthError(err as { message?: string }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-crm-theme="manifest" data-theme={theme} className="admin-auth-page">
      <div className="admin-auth-rule" aria-hidden />
      <main className="admin-auth-main">
        <div className="admin-auth-card">
          <div className="flex flex-col items-center text-center">
            <div className="admin-auth-logo">
              <img src={logo} alt="CEVONS logo" className="h-12 w-12 object-contain" />
            </div>
            <p className="admin-mono admin-auth-eyebrow">Internal Access</p>
            <h1 className="admin-display admin-auth-title">Set a new password</h1>
            <p className="admin-auth-sub">CEVONS Website Admin</p>
          </div>

          {!ready ? (
            <p className="mt-8 text-center text-sm" style={{ color: "var(--text-2)" }}>
              Checking your reset link…
            </p>
          ) : !hasRecoverySession ? (
            <div className="mt-8 space-y-4">
              <div role="alert" className="admin-auth-alert admin-auth-alert-error">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>This reset link is missing, expired, or already used. Request a new one from the login page.</span>
              </div>
              <Link to="/admin/login" className="admin-auth-link block text-center">
                Back to login
              </Link>
            </div>
          ) : done ? (
            <div role="status" className="admin-auth-alert admin-auth-alert-ok">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>Password updated. Taking you to the admin…</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              {error && (
                <div role="alert" className="admin-auth-alert admin-auth-alert-error">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}
              <div className="relative">
                <label htmlFor="new-password" className="admin-mono admin-auth-label">
                  New password
                </label>
                <Lock className="admin-auth-icon" aria-hidden />
                <input
                  id="new-password"
                  type={reveal ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="admin-auth-input"
                  aria-describedby="password-rules"
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  className="absolute right-3 bottom-3 text-xs font-semibold"
                  style={{ color: "var(--text-2)" }}
                >
                  {reveal ? "Hide" : "Show"}
                </button>
              </div>

              <ul id="password-rules" className="space-y-1.5 text-xs">
                {rules.map((r) => (
                  <li key={r.label} className="flex items-center gap-2">
                    {r.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--ok, #1f9d55)" }} aria-hidden />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-2)" }} aria-hidden />
                    )}
                    <span style={{ color: r.ok ? "var(--text)" : "var(--text-2)" }}>{r.label}</span>
                  </li>
                ))}
              </ul>

              <div className="relative">
                <label htmlFor="confirm-password" className="admin-mono admin-auth-label">
                  Confirm new password
                </label>
                <Lock className="admin-auth-icon" aria-hidden />
                <input
                  id="confirm-password"
                  type={reveal ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat the password"
                  className="admin-auth-input"
                />
                {confirm.length > 0 && confirm !== password && (
                  <p className="mt-2 text-xs" style={{ color: "var(--brand-orange)" }}>
                    The two passwords don't match yet.
                  </p>
                )}
              </div>
              <button type="submit" disabled={saving || !canSubmit} className="admin-auth-submit">
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    <span>Saving your new password…</span>
                  </>
                ) : (
                  "Update password"
                )}
              </button>
              <p className="text-center text-xs" style={{ color: "var(--text-2)" }}>
                Reset link stopped working?{" "}
                <Link to="/admin/forgot-password" className="admin-auth-link">
                  Send a fresh one
                </Link>
              </p>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
