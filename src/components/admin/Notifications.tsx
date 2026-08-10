import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Check, Settings as SettingsIcon, X, Users, Star, MessageSquare,
  Megaphone, Info, Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type NotifType = "lead" | "review" | "message" | "campaign" | "system";

export interface NotificationRow {
  id: string;
  type: NotifType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface NotifPrefs {
  leads: boolean;
  reviews: boolean;
  messages: boolean;
  campaigns: boolean;
  system: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  leads: true, reviews: true, messages: true, campaigns: true, system: true,
};

const PREF_KEY: Record<NotifType, keyof NotifPrefs> = {
  lead: "leads",
  review: "reviews",
  message: "messages",
  campaign: "campaigns",
  system: "system",
};

const TYPE_META: Record<NotifType, { label: string; icon: typeof Users; color: string }> = {
  lead: { label: "Leads", icon: Users, color: "var(--crm-primary-bright)" },
  review: { label: "Reviews", icon: Star, color: "#f5c451" },
  message: { label: "Messages", icon: MessageSquare, color: "#5ec3ff" },
  campaign: { label: "Campaigns", icon: Megaphone, color: "#c084fc" },
  system: { label: "System", icon: Info, color: "var(--crm-text-muted)" },
};

function relTime(iso: string): string {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ---------- Shared store hook ----------
export function useNotifications() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: n }, { data: p }] = await Promise.all([
        supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("notification_preferences").select("*").eq("id", "default").maybeSingle(),
      ]);
      if (cancelled) return;
      if (n) setItems(n as NotificationRow[]);
      if (p) setPrefs({
        leads: p.leads, reviews: p.reviews, messages: p.messages,
        campaigns: p.campaigns, system: p.system,
      });
    })();

    const ch = supabase
      .channel(`crm-notifications-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setItems((cur) => [payload.new as NotificationRow, ...cur].slice(0, 200));
        } else if (payload.eventType === "UPDATE") {
          setItems((cur) => cur.map((x) => x.id === (payload.new as NotificationRow).id ? (payload.new as NotificationRow) : x));
        } else if (payload.eventType === "DELETE") {
          setItems((cur) => cur.filter((x) => x.id !== (payload.old as NotificationRow).id));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notification_preferences" }, (payload) => {
        const p = payload.new as NotifPrefs | undefined;
        if (p) setPrefs({
          leads: p.leads, reviews: p.reviews, messages: p.messages,
          campaigns: p.campaigns, system: p.system,
        });
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  const visible = useMemo(
    () => items.filter((n) => prefs[PREF_KEY[n.type]]),
    [items, prefs],
  );

  const unreadCount = useMemo(() => visible.filter((n) => !n.read).length, [visible]);

  const unreadByType = useMemo(() => {
    const m: Record<NotifType, number> = { lead: 0, review: 0, message: 0, campaign: 0, system: 0 };
    for (const n of visible) if (!n.read) m[n.type]++;
    return m;
  }, [visible]);

  const markRead = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    setItems((cur) => cur.map((x) => ids.includes(x.id) ? { ...x, read: true } : x));
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  }, []);

  const markAllRead = useCallback(async () => {
    const ids = visible.filter((n) => !n.read).map((n) => n.id);
    await markRead(ids);
  }, [visible, markRead]);

  const markTypeRead = useCallback(async (type: NotifType) => {
    const ids = items.filter((n) => n.type === type && !n.read).map((n) => n.id);
    await markRead(ids);
  }, [items, markRead]);

  const savePrefs = useCallback(async (next: NotifPrefs) => {
    setPrefs(next);
    await supabase.from("notification_preferences").update({
      ...next, updated_at: new Date().toISOString(),
    }).eq("id", "default");
  }, []);

  return { items: visible, allItems: items, prefs, unreadCount, unreadByType, markRead, markAllRead, markTypeRead, savePrefs };
}

// ---------- Bell + Panel ----------
type FilterKey = "all" | "unread" | NotifType;

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const navigate = useNavigate();
  const n = useNotifications();

  // close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = useMemo(() => {
    if (filter === "all") return n.items;
    if (filter === "unread") return n.items.filter((x) => !x.read);
    return n.items.filter((x) => x.type === filter);
  }, [n.items, filter]);

  const handleClick = async (item: NotificationRow) => {
    await n.markRead([item.id]);
    if (item.link) {
      setOpen(false);
      navigate({ to: item.link });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 grid place-items-center rounded-lg border"
        style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        <AnimatePresence>
          {n.unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full text-[10px] font-bold"
              style={{ background: "var(--crm-red, #ef4444)", color: "#fff" }}
            >
              {n.unreadCount > 99 ? "99+" : n.unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="fixed top-16 right-4 md:right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border shadow-2xl flex flex-col overflow-hidden"
              style={{
                background: "var(--crm-surface)",
                borderColor: "var(--crm-border)",
                color: "var(--crm-text)",
                maxHeight: "min(640px, calc(100vh - 5rem))",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--crm-border)" }}>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {n.unreadCount > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--crm-surface-muted)", color: "var(--crm-text-muted)" }}>
                      {n.unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPrefs((v) => !v)}
                    className="h-7 w-7 grid place-items-center rounded hover:opacity-80"
                    style={{ color: "var(--crm-text-muted)" }}
                    aria-label="Preferences"
                    title="Notification preferences"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="h-7 w-7 grid place-items-center rounded hover:opacity-80"
                    style={{ color: "var(--crm-text-muted)" }}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Prefs panel */}
              <AnimatePresence initial={false}>
                {showPrefs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b"
                    style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface-muted)" }}
                  >
                    <div className="px-4 py-3 space-y-2">
                      <div className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--crm-text-muted)" }}>
                        Which notifications to show
                      </div>
                      {(Object.keys(TYPE_META) as NotifType[]).map((t) => {
                        const meta = TYPE_META[t];
                        const Icon = meta.icon;
                        const key = PREF_KEY[t];
                        const on = n.prefs[key];
                        return (
                          <label key={t} className="flex items-center justify-between gap-2 cursor-pointer py-1">
                            <span className="flex items-center gap-2 text-sm">
                              <Icon className="h-4 w-4" style={{ color: meta.color }} />
                              <span style={{ color: "var(--crm-text)" }}>New {meta.label.toLowerCase()}</span>
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={on}
                              onClick={() => n.savePrefs({ ...n.prefs, [key]: !on })}
                              className="relative w-9 h-5 rounded-full transition-colors"
                              style={{ background: on ? "var(--crm-primary, #c89b3c)" : "var(--crm-border)" }}
                            >
                              <motion.span
                                layout
                                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
                                style={{ left: on ? "calc(100% - 18px)" : 2 }}
                              />
                            </button>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters + actions */}
              <div className="flex items-center gap-1 px-3 py-2 border-b overflow-x-auto" style={{ borderColor: "var(--crm-border)" }}>
                {(["all", "unread", "lead", "review", "message", "campaign"] as FilterKey[]).map((k) => {
                  const active = filter === k;
                  const label = k === "all" ? "All" : k === "unread" ? "Unread" : TYPE_META[k as NotifType].label;
                  return (
                    <button
                      key={k}
                      onClick={() => setFilter(k)}
                      className="text-[11px] px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors"
                      style={{
                        background: active ? "var(--crm-primary, #c89b3c)" : "transparent",
                        color: active ? "#1a1a1a" : "var(--crm-text-muted)",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
                <button
                  onClick={n.markAllRead}
                  disabled={n.unreadCount === 0}
                  className="ml-auto text-[11px] px-2 py-1 rounded-md flex items-center gap-1 disabled:opacity-40 hover:opacity-80 whitespace-nowrap"
                  style={{ color: "var(--crm-text-muted)" }}
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-2">
                    <Inbox className="h-8 w-8" style={{ color: "var(--crm-text-faint)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--crm-text)" }}>You're all caught up</p>
                    <p className="text-xs" style={{ color: "var(--crm-text-muted)" }}>No notifications to show.</p>
                  </div>
                ) : (
                  <ul>
                    <AnimatePresence initial={false}>
                      {filtered.map((item) => {
                        const meta = TYPE_META[item.type];
                        const Icon = meta.icon;
                        return (
                          <motion.li
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                          >
                            <button
                              onClick={() => handleClick(item)}
                              className="w-full text-left px-4 py-3 flex gap-3 border-b transition-colors hover:opacity-95"
                              style={{
                                borderColor: "var(--crm-border)",
                                background: item.read ? "transparent" : "color-mix(in srgb, var(--crm-primary, #c89b3c) 8%, transparent)",
                              }}
                            >
                              <div className="h-8 w-8 shrink-0 rounded-lg grid place-items-center"
                                style={{ background: "var(--crm-surface-muted)", color: meta.color }}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                  <p className="text-sm font-semibold leading-snug flex-1" style={{ color: "var(--crm-text)" }}>
                                    {item.title}
                                  </p>
                                  {!item.read && (
                                    <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: "var(--crm-primary, #c89b3c)" }} />
                                  )}
                                </div>
                                {item.body && (
                                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--crm-text-muted)" }}>
                                    {item.body}
                                  </p>
                                )}
                                <p className="text-[10px] mt-1 uppercase tracking-wide" style={{ color: "var(--crm-text-faint)" }}>
                                  {relTime(item.created_at)}
                                </p>
                              </div>
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
