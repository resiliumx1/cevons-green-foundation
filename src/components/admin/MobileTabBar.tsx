import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Inbox, Mail, Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";
import type { NotifType } from "./Notifications";

/**
 * App-style floating bottom tab bar for phones: one-thumb access to the
 * sections an admin checks most. Hidden from lg up, where the sidebar does the
 * job. Counts come from the same useNotifications data as the header bell.
 *
 * A single shared amber highlight slides between tabs via a layout animation
 * (transform-only), so the motion stays cheap and reduced-motion friendly.
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

  const iconStack = (
    Icon: typeof LayoutGrid,
    active: boolean,
    count: number,
  ) => (
    <span className="admin-tabbar-iconwrap">
      {active && (
        <motion.span
          layoutId="admin-tabbar-pill"
          className="admin-tabbar-pill"
          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
          aria-hidden
        />
      )}
      <Icon
        className="admin-tabbar-svg h-[21px] w-[21px]"
        strokeWidth={1.9}
        aria-hidden
      />
      {count > 0 && (
        <span className="admin-tabbar-badge">{count > 99 ? "99+" : count}</span>
      )}
    </span>
  );

  const linkTab = (
    to: string,
    label: string,
    Icon: typeof LayoutGrid,
    active: boolean,
    count: number,
  ) => (
    <Link
      key={to}
      to={to as "/admin"}
      aria-current={active ? "page" : undefined}
      aria-label={count > 0 ? `${label}, ${count} unread` : label}
      className={`admin-tabbar-item ${active ? "is-active" : ""}`}
    >
      {iconStack(Icon, active, count)}
      <span className="admin-tabbar-label">{label}</span>
    </Link>
  );

  const buttonTab = (
    key: string,
    label: string,
    Icon: typeof LayoutGrid,
    onClick: () => void,
    count = 0,
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `${label}, ${count} unread` : label}
      className="admin-tabbar-item"
    >
      {iconStack(Icon, false, count)}
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
      {buttonTab("menu", "Menu", Menu, onOpenMenu, 0)}
    </nav>
  );
}
