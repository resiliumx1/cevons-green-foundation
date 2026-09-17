import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Inbox, Mail, Bell, Menu } from "lucide-react";
import type { NotifType } from "./Notifications";

/**
 * App-style bottom tab bar for phones: one-thumb access to the sections an
 * admin checks most. Hidden from lg up, where the sidebar does the job.
 * Counts come from the same useNotifications data as the header bell.
 */
export function MobileTabBar({
  unreadTotal,
  unreadByType,
  onOpenMenu,
}: {
  unreadTotal: number;
  unreadByType: Record<NotifType, number>;
  onOpenMenu: () => void;
}) {
  // Highlight from the pending location too, so the tab moves the moment a
  // link is tapped rather than when the next section finishes loading.
  const pathname = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });

  const linkTab = (
    to: string,
    label: string,
    Icon: typeof LayoutGrid,
    active: boolean,
    count: number,
    tone: string,
  ) => (
    <Link
      key={to}
      to={to as "/admin"}
      aria-current={active ? "page" : undefined}
      aria-label={count > 0 ? `${label}, ${count} unread` : label}
      className={`admin-tabbar-item ${active ? "is-active" : ""}`}
    >
      <span className="relative grid place-items-center">
        <span className={`admin-tabbar-ico admin-tabbar-ico-${tone}`}>
          <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} aria-hidden />
        </span>
        {count > 0 && (
          <span className="admin-tabbar-badge">{count > 99 ? "99+" : count}</span>
        )}
      </span>
      <span className="admin-tabbar-label">{label}</span>
    </Link>
  );

  const buttonTab = (
    key: string,
    label: string,
    Icon: typeof LayoutGrid,
    onClick: () => void,
    count = 0,
    tone = "slate",
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `${label}, ${count} unread` : label}
      className="admin-tabbar-item"
    >
      <span className="relative grid place-items-center">
        <span className={`admin-tabbar-ico admin-tabbar-ico-${tone}`}>
          <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} aria-hidden />
        </span>
        {count > 0 && (
          <span className="admin-tabbar-badge">{count > 99 ? "99+" : count}</span>
        )}
      </span>
      <span className="admin-tabbar-label">{label}</span>
    </button>
  );

  return (
    <nav className="admin-tabbar lg:hidden" aria-label="Quick sections">
      {linkTab("/admin", "Home", LayoutGrid, pathname === "/admin", 0)}
      {linkTab(
        "/admin/leads",
        "Requests",
        Inbox,
        pathname.startsWith("/admin/leads"),
        unreadByType.lead,
      )}
      {linkTab(
        "/admin/messages",
        "Messages",
        Mail,
        pathname.startsWith("/admin/messages"),
        unreadByType.message,
      )}
      {buttonTab("alerts", "Alerts", Bell, () => {
        window.dispatchEvent(new Event("admin:open-notifications"));
      }, unreadTotal)}
      {buttonTab("menu", "Menu", Menu, onOpenMenu)}
    </nav>
  );
}
