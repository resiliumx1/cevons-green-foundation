import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import logo from "@/assets/cevons-logo-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import { describeAuthError } from "@/lib/adminAuth";
import { CrmThemeProvider, useCrmTheme } from "@/components/admin/theme";

export const Route = createFileRoute("/admin_/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Forgot Password | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <CrmThemeProvider>
      <ForgotPasswordScreen />
    </CrmThemeProvider>
  );
}

function fmtClock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ForgotPasswordScreen() {
  const { theme } = useCrmTheme();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Seconds left before the emailed link stops working (Supabase default: 1 hour). */
  const [expiresIn, setExpiresIn] = useState(0);
  /** Seconds until a new link may be requested, to avoid rate limiting. */
  const [cooldown, setCooldown] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sent) return;
    tick.current = setInterval(() => {
      setExpiresIn((v) => (v > 0 ? v - 1 : 0));
      setCooldown((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [sent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || cooldown > 0) return;
    setError(null);
    if (!email.trim()) {
      setError("Enter the email address you use to sign in.");
      return;
    }
    setSending(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (resetError) {
        setError(describeAuthError(resetError));
        return;
      }
      setSent(true);
      setExpiresIn(60 * 60);
      setCooldown(60);
    } catch (err) {
      setError(describeAuthError(err as { message?: string }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-crm-theme="manifest" data-theme={theme} className="admin-auth-page">
      <div className="admin-auth-rule" aria-hidden />

      <Link to="/admin/login" className="admin-auth-back">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <span>Back to login</span>
      </Link>

      <main className="admin-auth-main">
        <div className="admin-auth-card">
          <div className="flex flex-col items-center text-center">
            <div className="admin-auth-logo">
              <img src={logo} alt="CEVONS logo" className="h-12 w-12 object-contain" />
            </div>
            <p className="admin-mono admin-auth-eyebrow">Account recovery</p>
            <h1 className="admin-display admin-auth-title">Reset your password</h1>
            <p className="admin-auth-sub">
              We'll email you a secure link that lets you choose a new password.
            </p>
          </div>

          {sent ? (
            <div className="mt-8 space-y-4">
              <div role="status" className="admin-auth-alert admin-auth-alert-ok">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  If an account exists for <strong>{email.trim()}</strong>, a reset link is on its
                  way. It opens the “Set a new password” screen and expires after a short while.
                </span>
              </div>
              <p
                className="admin-mono text-center text-sm"
                style={{ color: expiresIn > 0 ? "var(--text-2)" : "var(--brand-orange)" }}
                role="timer"
                aria-live="off"
              >
                {expiresIn > 0
                  ? `Link expires in ${fmtClock(expiresIn)}`
                  : "That link has now expired — send a fresh one below."}
              </p>
              <ol
                className="space-y-2 text-sm leading-relaxed"
                style={{ color: "var(--text-2)" }}
              >
                <li>1. Open the email on this device, so the link lands in the same browser.</li>
                <li>2. Check spam or junk if it hasn't arrived within a few minutes.</li>
                <li>3. Choose a password of at least 8 characters.</li>
              </ol>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending || cooldown > 0}
                className="admin-auth-submit"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    <span>Sending…</span>
                  </>
                ) : cooldown > 0 ? (
                  `Resend link in ${cooldown}s`
                ) : (
                  "Resend the link"
                )}
              </button>
              {error && (
                <div role="alert" className="admin-auth-alert admin-auth-alert-error">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError(null);
                  }}
                  className="admin-auth-link"
                >
                  Use a different email
                </button>
                <Link to="/admin/login-help" className="admin-auth-link">
                  Still stuck? Get help
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div role="alert" className="admin-auth-alert admin-auth-alert-error">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}
              <div className="relative">
                <label htmlFor="forgot-email" className="admin-mono admin-auth-label">
                  Email address
                </label>
                <Mail className="admin-auth-icon" aria-hidden />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cevons.com"
                  className="admin-auth-input"
                />
              </div>
              <button type="submit" disabled={sending} className="admin-auth-submit">
                {sending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    <span>Sending link…</span>
                  </>
                ) : (
                  "Email me a reset link"
                )}
              </button>
              <p className="admin-auth-foot">
                Remembered it?{" "}
                <Link to="/admin/login" className="admin-auth-link">
                  Back to login
                </Link>
              </p>
            </form>
          )}

          <p className="admin-mono admin-auth-legal">
            Secure internal access for CEVONS team members
          </p>
        </div>
      </main>
    </div>
  );
}
