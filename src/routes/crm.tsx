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
} from "lucide-react";
import logo from "@/assets/cevons-logo.png";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CEVONS Growth Command" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CrmLayout,
});

// NOTE: front-end only — all data on child pages is mock data.
// Future integrations (lead intake, messaging, calendar sync, billing, reviews)
// can be wired into the corresponding route components.
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

function CrmLayout() {
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
            <div className="text-sm font-bold text-white tracking-wide">CEVON'S</div>
            <div className="text-[11px] uppercase tracking-widest text-emerald-200/70">Growth Command</div>
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[#FFD200] text-[#002E1F] font-semibold shadow-sm"
                  : "text-emerald-50/80 hover:bg-white/5 hover:text-white"
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
        className={`hidden md:flex items-center gap-3 mx-2 mb-3 mt-2 px-3 py-2.5 rounded-lg text-sm text-emerald-50/80 hover:bg-white/5 hover:text-white transition-colors ${
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
    <div className="flex min-h-screen bg-[#071111] text-slate-100">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#002E1F] border-r border-black/40 transition-[width] duration-200 ${
          collapsed ? "w-[72px]" : "w-64 lg:w-72"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#002E1F] border-r border-black/40 z-50 md:hidden flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
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
        <header className="h-16 bg-[#0a1414] border-b border-white/5 flex items-center gap-3 px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden h-9 w-9 grid place-items-center rounded-lg bg-[#101820] border border-white/5 text-slate-300"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search leads, services, customers..."
              className="w-full rounded-lg bg-[#101820] border border-white/[0.08] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              className="relative h-9 w-9 grid place-items-center rounded-lg bg-[#101820] border border-white/[0.08] hover:border-white/20 text-slate-300"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E31B23]" />
            </button>
            <button
              className="h-9 w-9 grid place-items-center rounded-lg bg-[#101820] border border-white/[0.08] hover:border-white/20 text-slate-300"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-white/[0.08]">
              <div className="text-right leading-tight">
                <div className="text-sm font-semibold text-white">Romina S.</div>
                <div className="text-[11px] text-slate-400">Marketing Lead</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 grid place-items-center text-sm font-semibold text-white">
                R
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom nav (primary items) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#002E1F] border-t border-black/40 grid grid-cols-5 z-30">
          {nav.slice(0, 5).map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as "/crm"}
                className={`flex flex-col items-center justify-center py-2.5 text-[10px] gap-1 ${
                  active ? "text-[#FFD200]" : "text-emerald-50/70"
                }`}
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
