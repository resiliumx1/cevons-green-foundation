import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
  Settings,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Globe,
  LogOut,
  UserCircle,
} from "lucide-react";

import logo from "@/assets/cevons-logo-transparent.png";
import { NotificationsBell, useNotifications, type NotifType } from "@/components/crm/Notifications";
import { CrmThemeProvider, useCrmTheme } from "@/components/crm/theme";
import { CrmAssistant } from "@/components/crm/Assistant";
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
import { toast } from "sonner";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CEVONS Growth Command" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CrmRoot,
});

const nav = [
  { to: "/crm", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/crm/leads", label: "Leads / Requests", icon: Users, notifType: "lead" as NotifType },
  { to: "/crm/conversations", label: "Conversations", icon: MessageSquare, notifType: "message" as NotifType },
  { to: "/crm/customers", label: "Customers", icon: ContactRound },
  { to: "/crm/marketing", label: "Marketing", icon: Megaphone, notifType: "campaign" as NotifType },
  { to: "/crm/reports", label: "Reports", icon: BarChart3 },
  { to: "/crm/reviews", label: "Reviews", icon: Star, notifType: "review" as NotifType },
  { to: "/crm/settings", label: "Settings", icon: Settings },
] as Array<{ to: string; label: string; icon: typeof LayoutGrid; exact?: boolean; notifType?: NotifType }>;


function CrmRoot() {
  return (
    <CrmThemeProvider>
      <CrmLayout />
    </CrmThemeProvider>
  );
}

function CrmLayout() {
  const { theme } = useCrmTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadByType, markTypeRead } = useNotifications();

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
            alt="CEVON'S"
            className="h-11 w-11 object-contain"
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
          />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <div className="text-[15px] font-extrabold tracking-[0.04em]" style={{ color: "#ffffff" }}>
              CEVON&apos;S
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] mt-0.5" style={{ color: "#F5C518" }}>
              Growth Command
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
              to={item.to as "/crm"}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`crm-nav-item group relative flex items-center gap-3 rounded-xl text-[13.5px] transition-colors ${
                collapsed ? "justify-center h-11 w-11 mx-auto" : "px-3 py-2.5"
              } ${active ? "is-active" : ""}`}
            >
              {/* Active background pill (shared element) */}
              {active && (
                <motion.span
                  layoutId="crm-nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl -z-0"
                  style={{
                    background: "linear-gradient(180deg, rgba(245,197,24,0.14), rgba(245,197,24,0.06))",
                    boxShadow: "inset 0 0 0 1px rgba(245,197,24,0.22)",
                  }}
                />
              )}
              {/* Gold left accent bar */}
              {active && !collapsed && (
                <motion.span
                  layoutId="crm-nav-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                  style={{ background: "#F5C518", boxShadow: "0 0 12px rgba(245,197,24,0.6)" }}
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
                    style={{ background: "#F5C518", color: "#1a1a1a" }}
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
                {count > 0 && <span className="ml-1.5 text-[#F5C518]">· {count}</span>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer / collapse */}
      <div className="mt-2 px-3 pt-3 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`crm-nav-item w-full hidden md:flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
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
    <div data-crm-theme={theme} className="flex min-h-screen">
      <Toaster richColors position="top-right" />
      {/* Desktop sidebar */}
      <aside
        className={`crm-sidebar hidden md:flex flex-col transition-[width] duration-200 ${
          collapsed ? "w-[72px]" : "w-64 lg:w-72"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="crm-sidebar fixed left-0 top-0 bottom-0 w-72 z-50 md:hidden flex flex-col">
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
        <header className="crm-header h-16 flex items-center gap-3 px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-lg border"
            style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--crm-text-faint)" }} />
            <input
              type="search"
              placeholder="Search leads, services, customers..."
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--crm-surface-muted)",
                borderColor: "var(--crm-border)",
                color: "var(--crm-text)",
              }}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <CrmAssistant />
            <NotificationsBell />
            <button
              className="h-9 w-9 grid place-items-center rounded-lg border"
              style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <Link
              to="/"
              className="hidden sm:grid h-9 place-items-center rounded-lg border px-3 text-xs font-medium transition-colors hover:opacity-90"
              style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
              title="Back to website"
            >
              <Globe className="h-4 w-4 mr-1.5" />
              <span>Back to site</span>
            </Link>
            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l" style={{ borderColor: "var(--crm-border)" }}>
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold" style={{ color: "var(--crm-text)" }}>Romina S.</div>
                <div className="text-[11px]" style={{ color: "var(--crm-text-muted)" }}>Marketing Lead</div>
              </div>
              <div className="h-9 w-9 rounded-full grid place-items-center text-sm font-semibold text-white"
                   style={{ background: "linear-gradient(135deg, var(--crm-primary-bright), var(--crm-primary))" }}>
                R
              </div>
            </div>
          </div>
        </header>

        <main className="crm-main flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <CrmSectionTransition>
            <Outlet />
          </CrmSectionTransition>
        </main>

        {/* Mobile bottom nav (primary items) */}
        <nav className="crm-bottom-nav md:hidden fixed bottom-0 left-0 right-0 grid grid-cols-5 z-30">
          {nav.slice(0, 5).map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as "/crm"}
                className="crm-nav-item flex flex-col items-center justify-center py-2.5 text-[10px] gap-1 rounded-none"
                data-active={active}
                style={active ? { color: "var(--crm-sidebar-text-active)", background: "var(--crm-sidebar-active)" } : undefined}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
