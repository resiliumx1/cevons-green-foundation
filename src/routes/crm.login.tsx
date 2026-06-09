import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import logo from "@/assets/cevons-logo.png";
import bg from "@/assets/cevons-login-bg.jpg";

export const Route = createFileRoute("/crm/login")({
  head: () => ({
    meta: [
      { title: "Log In | CEVONS Growth Command" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // FUTURE INTEGRATION: connect real authentication here
    // (validate credentials, establish session, persist remember-me).
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/crm" });
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020f08] text-white">
      {/* Background image — softly blurred so the glass card stays the hero */}
      <div
        className="absolute inset-0 scale-[1.08] animate-[bgZoom_22s_ease-out_forwards] bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})`, filter: "blur(6px) saturate(110%) brightness(0.7)" }}
        aria-hidden
      />
      {/* Cinematic dark green vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(0,46,28,0.35) 0%, rgba(0,18,11,0.85) 65%, rgba(0,10,6,0.97) 100%)",
        }}
        aria-hidden
      />
      {/* Subtle film grain via noise gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
        aria-hidden
      />

      {/* Atmospheric brand accent glows — green / yellow / red ambient behind card */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(0,168,90,0.45), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-[460px] w-[460px] rounded-full opacity-50 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(255,210,0,0.35), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-[460px] w-[460px] rounded-full opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(227,27,35,0.28), transparent 70%)" }}
        aria-hidden
      />

      {/* Top-left brand */}
      <Link
        to="/"
        className="absolute left-6 top-6 z-10 flex items-center gap-2 text-white/90 transition hover:text-white"
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white shadow-md">
          <img src={logo} alt="CEVON'S" className="h-7 w-7 object-contain" />
        </div>
        <span className="hidden text-sm font-semibold tracking-wide sm:block">CEVON'S</span>
      </Link>

      {/* Card */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="liquid-glass relative w-[460px] max-w-[92vw] animate-[cardIn_0.9s_cubic-bezier(0.2,0.8,0.2,1)_forwards] p-7 md:p-11"
        >
          {/* Liquid sheen — diagonal light reflection across the card */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]"
            aria-hidden
          >
            <div
              className="absolute -inset-[1px] rounded-[32px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 35%, transparent 55%, rgba(255,255,255,0.06) 75%, rgba(255,255,255,0.18) 100%)",
                mixBlendMode: "overlay",
              }}
            />
            {/* Top highlight */}
            <div
              className="absolute inset-x-8 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)" }}
            />
            {/* Side highlight */}
            <div
              className="absolute left-0 inset-y-10 w-px"
              style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.35), transparent)" }}
            />
          </div>


          {/* Logo */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div
                className="absolute inset-0 -m-3 animate-[logoPulse_3s_ease-in-out_infinite] rounded-full blur-xl"
                style={{ background: "radial-gradient(circle, rgba(255,210,0,0.55), rgba(0,168,90,0.3) 60%, transparent 75%)" }}
                aria-hidden
              />
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg ring-1 ring-white/40">
                <img src={logo} alt="CEVON'S logo" className="h-12 w-12 object-contain" />
              </div>
            </div>
            <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#FFD200]">
              CEVONS Growth Command
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-white/75">
              Log in to access CEVONS Growth Command.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Fields */}
          <div className="mt-7 space-y-4">
            <Field delay="0.15s">
              <label htmlFor="login-username" className="sr-only">Email or username</label>
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/80" />
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                required
                placeholder="Email or username"
                className="glass-input"
              />
            </Field>

            <Field delay="0.25s">
              <label htmlFor="login-password" className="sr-only">Password</label>
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/80" />
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Password"
                className="glass-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {showPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </Field>
          </div>

          {/* Options row */}
          <div
            className="mt-5 flex items-center justify-between text-sm opacity-0 animate-[fadeUp_0.6s_ease-out_0.35s_forwards]"
          >
            <label className="flex cursor-pointer items-center gap-2 select-none text-white/85">
              <span className="relative grid h-5 w-5 place-items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer absolute inset-0 h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/40 bg-white/10 transition checked:border-[#00A85A] checked:bg-[#00A85A]"
                />
                <svg
                  className="pointer-events-none relative h-3 w-3 scale-0 text-[#FFD200] transition-transform peer-checked:scale-100"
                  viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="3,8 7,12 13,4" />
                </svg>
              </span>
              Remember me
            </label>
            <button
              type="button"
              className="text-white/85 transition hover:text-[#FFD200]"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group relative mt-6 flex h-[58px] w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] text-base font-bold text-[#101820] opacity-0 shadow-[0_12px_30px_-8px_rgba(255,210,0,0.55)] transition-all duration-200 animate-[fadeUp_0.6s_ease-out_0.45s_forwards] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(255,210,0,0.65)] active:translate-y-0 disabled:cursor-wait disabled:opacity-90"
            style={{ background: "linear-gradient(90deg, #FFD200 0%, #00A85A 70%, #006B35 100%)" }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="text-white">Signing in...</span>
              </>
            ) : (
              "Log In"
            )}
          </button>

          {/* Secondary */}
          <p className="mt-5 text-center text-sm text-white/80 opacity-0 animate-[fadeUp_0.6s_ease-out_0.55s_forwards]">
            Need access?{" "}
            <button type="button" className="font-medium text-[#FFD200] transition hover:text-white">
              Contact your administrator
            </button>
            .
          </p>

          {/* Security note */}
          <p className="mt-6 border-t border-white/10 pt-4 text-center text-[11px] uppercase tracking-wider text-white/55">
            Secure internal access for CEVON'S team members
          </p>
        </form>
      </main>

      <style>{`
        @keyframes bgZoom { from { transform: scale(1.03); } to { transform: scale(1); } }
        @keyframes cardIn {
          0% { opacity: 0; transform: translateY(20px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .glass-input {
          width: 100%;
          height: 56px;
          border-radius: 18px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.35);
          color: #fff;
          padding-left: 48px;
          padding-right: 16px;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }
        .glass-input::placeholder { color: rgba(255,255,255,0.75); }
        .glass-input:focus {
          border-color: #00A85A;
          background: rgba(255,255,255,0.14);
          box-shadow: 0 0 0 3px rgba(255,210,0,0.35), 0 0 24px rgba(0,168,90,0.25);
        }
      `}</style>
    </div>
  );
}

function Field({ children, delay }: { children: React.ReactNode; delay: string }) {
  return (
    <div
      className="relative opacity-0"
      style={{ animation: `fadeUp 0.6s ease-out ${delay} forwards` }}
    >
      {children}
    </div>
  );
}
