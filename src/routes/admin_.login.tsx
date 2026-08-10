import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import logo from "@/assets/cevons-logo-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import { describeAuthError } from "@/lib/adminAuth";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/admin")
        ? search.redirect
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log In | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  // If a session already exists, skip the form.
  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) {
        navigate({ to: redirect ?? "/admin", replace: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(describeAuthError(authError));
        return;
      }
      navigate({ to: redirect ?? "/admin", replace: true });
    } catch (err) {
      setError(describeAuthError(err as { message?: string }));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter your email address above first, then choose “Forgot password?”.");
      return;
    }
    setResetting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (resetError) {
        setError(describeAuthError(resetError));
        return;
      }
      setNotice(
        "If an account exists for that email, a password reset link is on its way. The link opens the reset page and expires shortly.",
      );
    } catch (err) {
      setError(describeAuthError(err as { message?: string }));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div data-crm-theme="manifest" className="admin-auth-page">
      {/* Navy field with a single orange rule — no glass, no off-palette green */}
      <div className="admin-auth-rule" aria-hidden />

      <Link to="/" className="admin-auth-back">
        <img src={logo} alt="" className="h-7 w-7 object-contain" aria-hidden />
        <span>Back to cevons.com</span>
      </Link>

      <main className="admin-auth-main">
        <form onSubmit={handleSubmit} className="admin-auth-card">
          <div className="flex flex-col items-center text-center">
            <div className="admin-auth-logo">
              <img src={logo} alt="CEVONS logo" className="h-12 w-12 object-contain" />
            </div>
            <p className="admin-mono admin-auth-eyebrow">Internal Access</p>
            <h1 className="admin-display admin-auth-title">CEVONS Website Admin</h1>
            <p className="admin-auth-sub">Sign in to manage the CEVONS website.</p>
          </div>

          {error && (
            <div role="alert" className="admin-auth-alert admin-auth-alert-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div role="status" className="admin-auth-alert admin-auth-alert-ok">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{notice}</span>
            </div>
          )}

          <div className="mt-7 space-y-4">
            <div className="relative">
              <label htmlFor="login-email" className="admin-mono admin-auth-label">
                Email address
              </label>
              <Mail className="admin-auth-icon" aria-hidden />
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cevons.com"
                className="admin-auth-input"
              />
            </div>

            <div className="relative">
              <label htmlFor="login-password" className="admin-mono admin-auth-label">
                Password
              </label>
              <Lock className="admin-auth-icon" aria-hidden />
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="admin-auth-input pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="admin-auth-eye"
              >
                {showPw ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="admin-auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button type="button" onClick={handleForgot} disabled={resetting} className="admin-auth-link">
              {resetting ? "Sending…" : "Forgot password?"}
            </button>
          </div>

          <button type="submit" disabled={loading} className="admin-auth-submit">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span>Signing in…</span>
              </>
            ) : (
              "Log in"
            )}
          </button>

          <p className="admin-auth-foot">Need access? Contact your administrator.</p>
          <p className="admin-mono admin-auth-legal">Secure internal access for CEVONS team members</p>
        </form>
      </main>
    </div>
  );
}
