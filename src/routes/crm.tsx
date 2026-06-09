import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
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
  Recycle,
} from "lucide-react";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CEVONS Growth Command" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CrmLayout,
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

function CrmLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-[#0f1620] text-slate-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-[#0a3622] border-r border-black/40">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFC629] text-[#0a3622]">
            <Recycle className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-widest text-emerald-300/70">CEVONS</div>
            <div className="text-sm font-semibold text-white">Growth Command</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-[#FFC629] text-[#0a3622] font-semibold shadow"
                    : "text-emerald-50/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-700 grid place-items-center text-sm font-semibold">R</div>
            <div className="text-xs leading-tight">
              <div className="font-semibold text-white">Romina</div>
              <div className="text-emerald-200/60">Operations Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#121a26] border-b border-white/5 flex items-center gap-4 px-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search leads, customers, jobs…"
              className="w-full rounded-lg bg-[#0f1620] border border-white/5 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <button className="relative h-9 w-9 grid place-items-center rounded-lg bg-[#0f1620] border border-white/5 hover:border-white/10">
            <Bell className="h-4 w-4 text-slate-300" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#E63946]" />
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a3622]/50 border border-emerald-500/20 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
