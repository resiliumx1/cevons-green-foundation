import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  CalendarCheck,
  FileText,
  Briefcase,
  Receipt,
  UserSquare2,
  Megaphone,
  BarChart3,
  Star,
  Settings,
  Bell,
  Search,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Globe,
} from "lucide-react";
import logo from "@/assets/cevons-logo.png";
import { CrmThemeProvider, useCrmTheme } from "@/components/crm/theme";
import { CrmAssistant } from "@/components/crm/Assistant";
import { Toaster } from "@/components/ui/sonner";
import { CrmSectionTransition } from "@/components/motion/CrmMotion";

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
  { to: "/crm", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/crm/leads", label: "Leads / Requests", icon: Users },
  { to: "/crm/conversations", label: "Conversations", icon: MessageSquare },
  { to: "/crm/calendar", label: "Calendar", icon: Calendar },
  { to: "/crm/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/crm/quotes", label: "Quotes", icon: FileText },
  { to: "/crm/jobs", label: "Jobs", icon: Briefcase },
  { to: "/crm/invoices", label: "Invoices", icon: Receipt },
  { to: "/crm/customers", label: "Customers", icon: UserSquare2 },
  { to: "/crm/marketing", label: "Marketing", icon: Megaphone },
  { to: "/crm/reports", label: "Reports", icon: BarChart3 },
  { to: "/crm/reviews", label: "Reviews", icon: Star },
  { to: "/crm/settings", label: "Settings", icon: Settings },
] as Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }>;

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

  const SidebarContent = (
    <>
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <div className="h-10 w-10 shrink-0 rounded-lg bg-white grid place-items-center overflow-hidden">
          <img src={logo} alt="CEVON'S" className="h-8 w-8 object-contain" />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <div className="text-sm font-bold tracking-wide" style={{ color: "var(--crm-sidebar-text)" }}>CEVON'S</div>
            <div className="text-[11px] uppercase tracking-widest opacity-70" style={{ color: "var(--crm-sidebar-text)" }}>Growth Command</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as "/crm"}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`crm-nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? "is-active shadow-sm" : ""
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`crm-nav-item hidden md:flex items-center gap-3 mx-2 mb-3 mt-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          collapsed ? "justify-center" : ""
        }`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </>
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
            <button
              className="relative h-9 w-9 grid place-items-center rounded-lg border"
              style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full" style={{ background: "var(--crm-red)" }} />
            </button>
            <button
              className="h-9 w-9 grid place-items-center rounded-lg border"
              style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
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
