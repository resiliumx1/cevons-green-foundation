import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell, Check, Settings as SettingsIcon, X, Info, Inbox, MessageSquare, Star, Megaphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Every kind the database triggers can produce is rendered here. The
 * notification_type enum is: lead | review | message | campaign | system.
 */
export type NotifType = "lead" | "message" | "review" | "campaign" | "system";

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
  message: "messages",
  review: "reviews",
  campaign: "campaigns",
  system: "system",
};

/* Icon colours must read in BOTH admin themes: --emph is bright yellow on dark
   panels and a deep amber on light tiles (≥3:1 for non-text contrast). */
const TYPE_META: Record<NotifType, { label: string; icon: typeof Inbox; color: string }> = {
  lead: { label: "Requests", icon: Inbox, color: "var(--emph)" },
  message: { label: "Messages", icon: MessageSquare, color: "var(--emph)" },
  review: { label: "Reviews", icon: Star, color: "var(--emph)" },
  campaign: { label: "Campaigns", icon: Megaphone, color: "var(--emph)" },
  system: { label: "System", icon: Info, color: "var(--crm-text-muted)" },
};

const FALLBACK_META = { label: "System", icon: Info, color: "var(--crm-text-muted)" };
const KNOWN_TYPES: NotifType[] = ["lead", "message", "review", "campaign", "system"];


function relTime(iso: string): string {
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ---------- Shared store hook ----------
export function useNotifications(opts?: { onArrive?: (row: NotificationRow) => void }) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);

  // Keep the latest callback + prefs in refs so the realtime subscription is
  // set up exactly once and never reads a stale closure.
  const onArriveRef = useRef(opts?.onArrive);
  onArriveRef.current = opts?.onArrive;
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

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
          const row = payload.new as NotificationRow;
          setItems((cur) => (cur.some((x) => x.id === row.id) ? cur : [row, ...cur].slice(0, 200)));
          // Only announce kinds we render, and only when the category is enabled.
          const prefKey = PREF_KEY[row.type];
          if (KNOWN_TYPES.includes(row.type) && prefKey && prefsRef.current[prefKey]) {
            onArriveRef.current?.(row);
          }
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
    () => items.filter((n) => KNOWN_TYPES.includes(n.type) && prefs[PREF_KEY[n.type]]),
    [items, prefs],
  );

  const unreadCount = useMemo(() => visible.filter((n) => !n.read).length, [visible]);

  const unreadByType = useMemo(() => {
    const m = { lead: 0, message: 0, review: 0, campaign: 0, system: 0 } as Record<NotifType, number>;
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

/** How many arrival previews may stack under the bell before we collapse the rest. */
const MAX_ARRIVAL_CARDS = 3;
const ARRIVAL_TIMEOUT_MS = 6000;

/**
 * A single arrival preview. Owns its own dismissal timer so hovering or
 * focusing one card does not affect the others.
 */
function ArrivalCard({
  item, onOpen, onDismiss, reduceMotion,
}: {
  item: NotificationRow;
  onOpen: (item: NotificationRow) => void;
  onDismiss: (id: string) => void;
  reduceMotion: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const meta = TYPE_META[item.type] ?? FALLBACK_META;
  const Icon = meta.icon;

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => onDismiss(item.id), ARRIVAL_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [paused, item.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.18, ease: "easeOut" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative rounded-xl border shadow-2xl overflow-hidden"
      style={{
        background: "var(--crm-surface)",
        borderColor: "var(--crm-border)",
        color: "var(--crm-text)",
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="w-full text-left flex gap-3 pl-3.5 pr-10 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--crm-primary,#c89b3c)]"
      >
        <span
          className="h-8 w-8 shrink-0 rounded-lg grid place-items-center"
          style={{ background: "var(--admin-orange)", color: "var(--admin-charcoal)" }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 block">
          <span className="block text-[11px] uppercase tracking-wide font-semibold" style={{ color: "var(--crm-text-muted)" }}>
            {meta.label}
          </span>
          <span className="block text-sm font-semibold leading-6 mt-0.5 line-clamp-2 break-words [overflow-wrap:anywhere]" style={{ color: "var(--crm-text)" }}>
            {item.title}
          </span>
          {item.body && (
            <span className="block text-[12.5px] leading-5 mt-1 line-clamp-2 break-words [overflow-wrap:anywhere]" style={{ color: "var(--crm-text-muted)" }}>
              {item.body}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="absolute top-2 right-2 h-6 w-6 grid place-items-center rounded hover:opacity-80"
        style={{ color: "var(--crm-text-muted)" }}
        aria-label="Dismiss this alert"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [arrivals, setArrivals] = useState<NotificationRow[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();
  const reduceMotion = !!useReducedMotion();

  const handleArrive = useCallback((row: NotificationRow) => {
    setArrivals((cur) => (cur.some((x) => x.id === row.id) ? cur : [row, ...cur].slice(0, 12)));
    setAnnouncement(`${row.title}${row.body ? `. ${row.body}` : ""}`);
    setPulse(true);
  }, []);

  const n = useNotifications({ onArrive: handleArrive });

  // The attention cue is brief and never runs under reduced motion.
  useEffect(() => {
    if (!pulse) return;
    const t = window.setTimeout(() => setPulse(false), 1400);
    return () => window.clearTimeout(t);
  }, [pulse]);

  const dismissArrival = useCallback((id: string) => {
    setArrivals((cur) => cur.filter((x) => x.id !== id));
  }, []);

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

  const handleArrivalOpen = useCallback(async (item: NotificationRow) => {
    setArrivals([]);
    await n.markRead([item.id]);
    if (item.link) navigate({ to: item.link });
  }, [n, navigate]);

  const visibleArrivals = arrivals.slice(0, MAX_ARRIVAL_CARDS);
  const overflowArrivals = arrivals.length - visibleArrivals.length;
  const showArrivals = !open && arrivals.length > 0;

  return (
    <div className="relative">
      <span aria-live="polite" className="sr-only">{announcement}</span>
      <button
        onClick={() => { setOpen((v) => !v); setArrivals([]); }}
        className="relative h-9 w-9 grid place-items-center rounded-lg border"
        style={{ background: "var(--crm-surface-muted)", borderColor: "var(--crm-border)", color: "var(--crm-text)" }}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {pulse && !reduceMotion && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ boxShadow: "0 0 0 0 var(--admin-orange)" }}
            animate={{ boxShadow: ["0 0 0 0 var(--admin-orange)", "0 0 0 6px rgba(239,119,0,0)"] }}
            transition={{ duration: 0.9, repeat: 1, ease: "easeOut" }}
          />
        )}
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

      {/* Arrival previews, anchored under the bell */}
      <div className="absolute right-0 top-full mt-2 z-[60] w-[320px] max-w-[calc(100vw-1.5rem)] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence initial={false}>
          {showArrivals && visibleArrivals.map((item) => (
            <div key={item.id} className="pointer-events-auto">
              <ArrivalCard
                item={item}
                onOpen={handleArrivalOpen}
                onDismiss={dismissArrival}
                reduceMotion={reduceMotion}
              />
            </div>
          ))}
          {showArrivals && overflowArrivals > 0 && (
            <motion.button
              key="more"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setArrivals([]); setOpen(true); }}
              className="pointer-events-auto rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-lg"
              style={{
                background: "var(--crm-surface-muted)",
                borderColor: "var(--crm-border)",
                color: "var(--crm-text)",
              }}
            >
              +{overflowArrivals} more
            </motion.button>
          )}
        </AnimatePresence>
      </div>


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
              <div className="flex items-center gap-1.5 px-3 py-2 border-b overflow-x-auto [scrollbar-width:none]" style={{ borderColor: "var(--crm-border)" }}>
                {(["all", "unread", ...KNOWN_TYPES] as FilterKey[]).map((k) => {
                  const active = filter === k;
                  const label = k === "all" ? "All" : k === "unread" ? "Unread" : (TYPE_META[k as NotifType]?.label ?? "System");
                  return (
                    <button
                      key={k}
                      onClick={() => setFilter(k)}
                      className="shrink-0 text-[11px] px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors"
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
                  className="ml-2 shrink-0 text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1 disabled:opacity-40 hover:opacity-80 whitespace-nowrap"
                  style={{ color: "var(--crm-text)", borderColor: "var(--crm-border)" }}
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
                        const meta = TYPE_META[item.type] ?? FALLBACK_META;
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
                              className="w-full text-left px-4 py-3.5 flex gap-3.5 border-b transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--crm-primary,#c89b3c)]"
                              style={{
                                borderColor: "var(--crm-border)",
                                background: item.read ? "transparent" : "color-mix(in srgb, var(--crm-primary, #c89b3c) 8%, transparent)",
                              }}
                            >
                              <div className="h-9 w-9 shrink-0 rounded-lg grid place-items-center"
                                style={{ background: "var(--crm-surface-muted)", color: meta.color }}>
                                <Icon className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                  <p className="text-sm font-semibold leading-6 flex-1 break-words [overflow-wrap:anywhere]" style={{ color: "var(--crm-text)" }}>
                                    {item.title}
                                  </p>
                                  {!item.read && (
                                    <span aria-label="Unread" className="mt-2 h-2 w-2 rounded-full shrink-0" style={{ background: "var(--crm-primary, #c89b3c)" }} />
                                  )}
                                </div>
                                {item.body && (
                                  <p className="text-[12.5px] leading-5 mt-1 line-clamp-3 break-words [overflow-wrap:anywhere]" style={{ color: "var(--crm-text-muted)" }}>
                                    {item.body}
                                  </p>
                                )}
                                <p className="text-[11px] mt-1.5 font-medium" style={{ color: "var(--crm-text-muted)" }}>
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
    </div>

  );
}
