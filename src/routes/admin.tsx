import { createFileRoute, Outlet, Link, useRouterState, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminIdentity, signOutAdmin } from "@/lib/adminAuth";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid,
  Users,
  MessageSquare,
  ContactRound,
  Megaphone,
  BarChart3,
  Star,
  Newspaper,
  FileClock,
  Image as ImageIcon,

  Settings,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  LogOut,
  UserCircle,
} from "lucide-react";

import logo from "@/assets/cevons-logo-transparent.png";
import { NotificationsBell, useNotifications, type NotifType } from "@/components/admin/Notifications";
import { CrmThemeProvider, useCrmTheme, formatGeorgetown } from "@/components/admin/theme";
import { CrmAssistant } from "@/components/admin/Assistant";
import { Toaster } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CrmSectionTransition } from "@/components/motion/CrmMotion";
import { CrmCommandPalette } from "@/components/admin/CommandPalette";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  // Session lives in localStorage, so the gate must run client-side only.
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/admin/login",
        search: { redirect: location.href },
        replace: true,
      });
    }
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CrmRoot,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/admin/leads", label: "Leads / Requests", icon: Users, notifType: "lead" as NotifType },
  { to: "/admin/conversations", label: "Conversations", icon: MessageSquare, notifType: "message" as NotifType },
  { to: "/admin/customers", label: "Customers", icon: ContactRound },
  { to: "/admin/marketing", label: "Marketing", icon: Megaphone, notifType: "campaign" as NotifType },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/reviews", label: "Reviews", icon: Star, notifType: "review" as NotifType },
  { to: "/admin/newsroom", label: "Newsroom", icon: Newspaper },
  { to: "/admin/media", label: "Media", icon: ImageIcon },

  { to: "/admin/audit", label: "Audit Log", icon: FileClock },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as Array<{ to: string; label: string; icon: typeof LayoutGrid; exact?: boolean; notifType?: NotifType }>;


function CrmRoot() {
  const identity = useAdminIdentity();
  const navigate = useNavigate();

  // React to sign-out / token refresh anywhere in the app.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate({ to: "/admin/login", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (identity.loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-white/70">
        Checking your access…
      </div>
    );
  }

  if (identity.roles.length === 0) {
    return <NoAccessScreen email={identity.email} />;
  }

  return (
    <CrmThemeProvider>
      <CrmLayout />
    </CrmThemeProvider>
  );
}

function NoAccessScreen({ email }: { email: string | null }) {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">This account has no access yet</h1>
        <p className="text-sm text-white/70">
          {email ? `${email} is signed in, but ` : ""}no role has been assigned to this account. Contact your
          administrator to be granted access to CEVONS Website Admin.
        </p>
        <button
          type="button"
          onClick={async () => {
            await signOutAdmin();
            navigate({ to: "/admin/login", replace: true });
          }}
          className="mx-auto flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}


function CrmLayout() {
  const { theme } = useCrmTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Auto-collapse sidebar on tablet widths (768-1023) to free up content space.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { unreadByType, markTypeRead } = useNotifications();

  // Cmd/Ctrl+K opens the global command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto mark-as-read when the user opens a section that maps to a notification type.
  useEffect(() => {
    for (const item of nav) {
      if (!item.notifType) continue;
      const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
      if (active && unreadByType[item.notifType] > 0) {
        void markTypeRead(item.notifType);
      }
    }
  }, [pathname, unreadByType, markTypeRead]);

  const SidebarContent = (
    <TooltipProvider delayDuration={150}>
      {/* Brand lockup */}
      <div className={`flex items-center gap-3 px-4 pt-5 pb-4 ${collapsed ? "justify-center px-2" : ""}`}>
        <div
          className="h-11 w-11 shrink-0 grid place-items-center"
        >
          <img
            src={logo}
            alt="CEVONS"
            className="h-11 w-11 object-contain"
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
          />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <div className="admin-display text-[16px] font-extrabold tracking-[0.02em]" style={{ color: "#FFFFFF" }}>
              CEVONS
            </div>
            <div className="admin-mono mt-0.5" style={{ color: "#FCE722" }}>
              Website Admin
            </div>
          </div>
        )}
      </div>
      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,197,24,0.35), transparent)" }} />

      {/* Nav */}
      <nav className={`crm-sidebar-scroll flex-1 overflow-y-auto py-4 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          const count = item.notifType ? unreadByType[item.notifType] : 0;

          const row = (
            <Link
              key={item.to}
              to={item.to as "/admin"}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`crm-nav-item group relative flex items-center gap-3 rounded-xl text-[13.5px] transition-colors ${
                collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"
              } ${active ? "is-active" : ""}`}
              style={{ color: active ? "#1A1A1A" : "#FFFFFF" }}
            >
              {/* Active background pill (shared element) */}
              {active && (
                <motion.span
                  layoutId="crm-nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl -z-0"
                  style={{
                    background: "#EF7700",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.20)",
                  }}
                />
              )}
              {/* Gold left accent bar */}
              {active && !collapsed && (
                <motion.span
                  layoutId="crm-nav-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                  style={{ background: "#FCE722" }}
                />
              )}

              <span className="relative shrink-0 z-10 grid place-items-center">
                <Icon size={20} strokeWidth={1.75} className="transition-colors" />
                <AnimatePresence>
                  {collapsed && count > 0 && (
                    <motion.span
                      key="dot"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 h-2 w-2 rounded-full ring-2"
                      style={{ background: "#F5C518", boxShadow: "0 0 6px rgba(245,197,24,0.8)", ["--tw-ring-color" as never]: "var(--crm-sidebar)" }}
                    />
                  )}
                </AnimatePresence>
              </span>
              {!collapsed && (
                <span className="truncate flex-1 z-10">{item.label}</span>
              )}
              <AnimatePresence>
                {!collapsed && count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="relative z-10 ml-auto min-w-[20px] h-[18px] px-1.5 grid place-items-center rounded-full text-[10px] font-bold"
                    style={{ background: "#FCE722", color: "#1A1A1A" }}
                  >
                    {count > 99 ? "99+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );

          if (!collapsed) return <div key={item.to}>{row}</div>;
          return (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>{row}</TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="font-medium">
                {item.label}
                {count > 0 && <span className="ml-1.5 text-[#EF7700]">· {count}</span>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer / collapse */}
      <div className="mt-2 px-3 pt-3 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`crm-nav-item w-full hidden min-[900px]:flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeftOpen size={20} strokeWidth={1.75} />
            : <PanelLeftClose size={20} strokeWidth={1.75} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </TooltipProvider>
  );

  return (
    <div data-crm-theme="manifest" data-theme={theme} className="flex min-h-screen">
      <Toaster richColors position="top-right" />
      <CrmCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      {/* Desktop sidebar */}
      <aside
        className={`crm-sidebar hidden min-[900px]:flex flex-col transition-[width] duration-200 ${
          collapsed ? "w-[72px]" : "w-64 lg:w-72"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 min-[900px]:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="crm-sidebar fixed left-0 top-0 bottom-0 w-72 z-50 min-[900px]:hidden flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 opacity-70 hover:opacity-100"
              style={{ color: "var(--crm-sidebar-text)" }}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <StatusTape />

        <header className="crm-header h-16 flex items-center gap-3 px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="min-[900px]:hidden h-11 w-11 grid place-items-center rounded-lg border"
            style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="relative flex-1 max-w-md flex items-center rounded-lg border pl-9 pr-3 py-2 text-sm text-left transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2"
            style={{
              background: "var(--crm-surface-muted)",
              borderColor: "var(--crm-border)",
              color: "var(--crm-text-faint)",
              ["--tw-ring-color" as never]: "var(--crm-primary)",
            }}
            aria-label="Open search"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <span className="truncate">Search leads, services, customers…</span>
            <kbd
              className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-mono"
              style={{ borderColor: "var(--crm-border)", color: "var(--crm-text-muted)", background: "var(--crm-surface)" }}
            >
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <CrmAssistant />
            <NotificationsBell />
            <Link
              to="/"
              className="hidden sm:grid h-9 place-items-center rounded-lg border px-3 text-xs font-medium transition-colors hover:opacity-90"
              style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
              title="Back to website"
            >
              <Globe className="h-4 w-4 mr-1.5" />
              <span>Back to site</span>
            </Link>
            <ProfileMenu />
          </div>
        </header>

        <main className="crm-main flex-1 p-4 md:p-6 lg:p-8 pb-24 min-[900px]:pb-8">
          <CrmSectionTransition>
            <Outlet />
          </CrmSectionTransition>
        </main>

        {/* Mobile bottom nav — scrollable, all sections, active highlight */}
        <nav
          className="admin-tabbar crm-bottom-nav min-[900px]:hidden fixed bottom-0 left-0 right-0 z-30 overflow-x-auto overflow-y-hidden"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          aria-label="CRM sections"
        >
          <div className="flex min-w-max items-stretch px-1">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              const count = item.notifType ? unreadByType[item.notifType] : 0;
              const shortLabel = item.label.split(" ")[0].replace("/", "");
              return (
                <Link
                  key={item.to}
                  to={item.to as "/admin"}
                  className="crm-nav-item relative flex min-w-[68px] flex-col items-center justify-center gap-1 px-3 py-2 text-[10px] font-medium snap-start"
                  style={
                    active
                      ? { color: "#FCE722" }
                      : { color: "#FFFFFF" }
                  }
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="crm-bottom-active"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute top-0 left-2 right-2 h-[3px] rounded-b-full"
                      style={{ background: "#FCE722" }}
                    />
                  )}
                  <span className="relative">
                    <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.2 : 1.75} />
                    {count > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 grid place-items-center rounded-full text-[9px] font-bold"
                        style={{ background: "#FCE722", color: "#1A1A1A" }}
                      >
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </span>
                  <span className="truncate max-w-[64px] leading-none">{shortLabel}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const { email, roles } = useAdminIdentity();
  const label = email ?? "Signed in";
  const initial = (email ?? "?").charAt(0).toUpperCase();
  const roleLabel = roles.length ? roles.join(", ") : "No role";

  const handleLogout = async () => {
    await signOutAdmin();
    toast.success("Signed out");
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l rounded-r-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 transition-opacity hover:opacity-90"
          style={{ borderColor: "var(--crm-border)", ["--tw-ring-color" as never]: "var(--crm-primary)" }}
          aria-label="Open account menu"
        >
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold max-w-[180px] truncate" style={{ color: "var(--crm-text)" }}>{label}</div>
            <div className="text-[11px] capitalize" style={{ color: "var(--crm-text-muted)" }}>{roleLabel}</div>
          </div>
          <div
            className="h-9 w-9 rounded-full grid place-items-center text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--crm-primary-bright), var(--crm-primary))" }}
          >
            {initial}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold capitalize">{roleLabel}</span>
          <span className="text-[11px] font-normal text-muted-foreground break-all">{label}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast("Profile coming soon")}>
          <UserCircle className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate({ to: "/admin/settings" })}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => { void handleLogout(); }}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


/**
 * Status tape — a weighbridge-ticket style strip across the top of the shell.
 * Shows Georgetown (UTC-4) time; all timestamps are stored in UTC.
 */
function StatusTape() {
  const { theme, toggleTheme } = useCrmTheme();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="admin-tape">
      <span className="admin-mono admin-tape-item">CEVONS Website Admin</span>
      <span className="admin-tape-sep" aria-hidden />
      <span className="admin-mono admin-tape-item">
        Georgetown {formatGeorgetown(now, { hour: "2-digit", minute: "2-digit", hour12: false })} · UTC−4
      </span>
      <button type="button" onClick={toggleTheme} className="admin-tape-toggle admin-mono ml-auto">
        {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>
    </div>
  );
}
