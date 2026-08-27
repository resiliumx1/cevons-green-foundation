import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  KeyRound,
  MailQuestion,
  ShieldAlert,
  UserPlus,
  LifeBuoy,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import logo from "@/assets/cevons-logo-transparent.png";
import { CrmThemeProvider, useCrmTheme } from "@/components/admin/theme";

export const Route = createFileRoute("/admin_/login-help")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Login Help | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginHelpPage,
});

function LoginHelpPage() {
  return (
    <CrmThemeProvider>
      <LoginHelpScreen />
    </CrmThemeProvider>
  );
}

type HelpItem = {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; to: string };
};

const ITEMS: HelpItem[] = [
  {
    icon: KeyRound,
    title: "I forgot my password",
    body:
      "Request a reset link. It arrives by email and opens the “Set a new password” screen, where you choose a new password of at least 8 characters.",
    action: { label: "Reset my password", to: "/admin/forgot-password" },
  },
  {
    icon: MailQuestion,
    title: "The reset email hasn't arrived",
    body:
      "Give it a few minutes, then check spam and junk. Make sure you used the exact address your account was created with — a reset link is only sent to a known address.",
  },
  {
    icon: Clock,
    title: "My link says it expired or was already used",
    body:
      "Reset links are single-use and short-lived. Request a fresh one, and open it on the same device and browser you asked from.",
    action: { label: "Send a fresh link", to: "/admin/forgot-password" },
  },
  {
    icon: ShieldAlert,
    title: "I'm signed in but pages look empty",
    body:
      "Your account exists but may not carry a role yet. Roles decide what you can see: viewers read, contributors draft, editors publish, admins manage people and settings. Ask an administrator to set yours.",
  },
  {
    icon: UserPlus,
    title: "I don't have an account yet",
    body:
      "Admin accounts are created by invitation only. An administrator adds you under People, and you'll receive an invitation email that sets your password on first use.",
  },
  {
    icon: LifeBuoy,
    title: "Nothing here worked",
    body:
      "Contact an existing administrator. They can re-send your invitation, trigger a reset on your behalf, or correct the email address on your account.",
  },
];

function LoginHelpScreen() {
  const { theme } = useCrmTheme();

  return (
    <div data-crm-theme="manifest" data-theme={theme} className="admin-auth-page">
      <div className="admin-auth-rule" aria-hidden />

      <Link to="/admin/login" className="admin-auth-back">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <span>Back to login</span>
      </Link>

      <main className="admin-auth-main">
        <div className="admin-auth-card" style={{ maxWidth: "44rem" }}>
          <div className="flex flex-col items-center text-center">
            <div className="admin-auth-logo">
              <img src={logo} alt="CEVONS logo" className="h-12 w-12 object-contain" />
            </div>
            <p className="admin-mono admin-auth-eyebrow">Support</p>
            <h1 className="admin-display admin-auth-title">Login help</h1>
            <p className="admin-auth-sub">
              Common ways back into the CEVONS Website Admin.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {ITEMS.map(({ icon: Icon, title, body, action }) => (
              <section
                key={title}
                className="rounded-xl p-4 sm:p-5"
                style={{
                  background: "var(--surface-2, rgba(255,255,255,0.04))",
                  border: "1px solid var(--line-1, rgba(255,255,255,0.12))",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "var(--brand-orange)", color: "var(--text-on-orange)" }}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2
                      className="text-[15px] font-semibold leading-snug"
                      style={{ color: "var(--text-1)" }}
                    >
                      {title}
                    </h2>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "var(--text-2)" }}
                    >
                      {body}
                    </p>
                    {action && (
                      <Link to={action.to} className="admin-auth-link mt-2 inline-block">
                        {action.label}
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <p className="admin-auth-foot">
            <Link to="/admin/login" className="admin-auth-link">
              Return to login
            </Link>
          </p>
          <p className="admin-mono admin-auth-legal">
            Secure internal access for CEVONS team members
          </p>
        </div>
      </main>
    </div>
  );
}
