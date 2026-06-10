import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare, Phone, Mail, StickyNote, Send, Plus, Search, X,
  ArrowDownLeft, ArrowUpRight, Info, ExternalLink,
} from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { ContactMessagesInbox } from "@/components/crm/ContactMessagesInbox";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/crm/conversations")({
  head: () => ({ meta: [{ title: "Conversations | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: ConversationsPage,
});

type ActivityType = "call" | "whatsapp" | "sms" | "email" | "note";
type Direction = "inbound" | "outbound";
type EntityType = "lead" | "customer";

const COMM_TYPES: ActivityType[] = ["call", "whatsapp", "sms", "email", "note"];

interface ActivityRow {
  id: string;
  related_type: string;
  related_id: string;
  type: string;
  direction: string | null;
  body: string | null;
  created_by: string | null;
  created_at: string;
}

interface ContactLite {
  id: string;
  kind: EntityType;
  name: string;
  email: string | null;
  phone: string | null;
  meta: string;
}

const TYPE_ICON: Record<ActivityType, any> = {
  call: Phone, whatsapp: MessageSquare, sms: MessageSquare, email: Mail, note: StickyNote,
};
const TYPE_STYLE: Record<ActivityType, string> = {
  call: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  whatsapp: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/30",
  sms: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  email: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  note: "bg-white/[0.06] text-white/70 border-white/[0.12]",
};

function fmtRelative(iso: string) {
  const d = new Date(iso); const now = Date.now(); const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
}
function waLink(phone?: string | null, text?: string) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  const t = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${t}`;
}

// ─── data ──────────────────────────────────────────────────────────────

function useActivities() {
  return useQuery({
    queryKey: ["conversations:activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .in("type", COMM_TYPES)
        .in("related_type", ["lead", "customer"])
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as ActivityRow[];
    },
  });
}
function useContacts() {
  return useQuery({
    queryKey: ["conversations:contacts"],
    queryFn: async (): Promise<ContactLite[]> => {
      const [leadsRes, customersRes] = await Promise.all([
        supabase.from("service_requests").select("id, reference, name, email, phone, service").order("created_at", { ascending: false }).limit(500),
        supabase.from("customers").select("id, name, email, phone, type").order("name").limit(500),
      ]);
      if (leadsRes.error) throw leadsRes.error;
      if (customersRes.error) throw customersRes.error;
      const leads: ContactLite[] = (leadsRes.data ?? []).map((l: any) => ({
        id: l.id, kind: "lead", name: l.name ?? "Unnamed lead", email: l.email, phone: l.phone,
        meta: `Lead${l.reference ? ` ${l.reference}` : ""}${l.service ? ` · ${l.service}` : ""}`,
      }));
      const customers: ContactLite[] = (customersRes.data ?? []).map((c: any) => ({
        id: c.id, kind: "customer", name: c.name ?? "Unnamed customer", email: c.email, phone: c.phone,
        meta: `Customer${c.type ? ` · ${c.type}` : ""}`,
      }));
      return [...customers, ...leads];
    },
  });
}

// ─── page ──────────────────────────────────────────────────────────────

interface ThreadKey { kind: EntityType; id: string }

function ConversationsPage() {
  const { data: activities, isLoading, isError, error, refetch } = useActivities();
  const { data: contacts } = useContacts();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ActivityType>("all");
  const [selected, setSelected] = useState<ThreadKey | null>(null);
  const [composing, setComposing] = useState<{ contact?: ContactLite } | null>(null);

  const contactsById = useMemo(() => {
    const map = new Map<string, ContactLite>();
    (contacts ?? []).forEach((c) => map.set(`${c.kind}:${c.id}`, c));
    return map;
  }, [contacts]);

  // group activities by entity
  const threads = useMemo(() => {
    const map = new Map<string, { key: ThreadKey; items: ActivityRow[]; latest: ActivityRow }>();
    for (const a of activities ?? []) {
      if (typeFilter !== "all" && a.type !== typeFilter) continue;
      if (a.related_type !== "lead" && a.related_type !== "customer") continue;
      const k = `${a.related_type}:${a.related_id}`;
      const existing = map.get(k);
      if (!existing) map.set(k, { key: { kind: a.related_type as EntityType, id: a.related_id }, items: [a], latest: a });
      else existing.items.push(a);
    }
    let list = Array.from(map.values()).sort((x, y) => +new Date(y.latest.created_at) - +new Date(x.latest.created_at));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(({ key, latest }) => {
        const c = contactsById.get(`${key.kind}:${key.id}`);
        return (c?.name?.toLowerCase().includes(s) || c?.email?.toLowerCase().includes(s) ||
          c?.phone?.toLowerCase().includes(s) || (latest.body ?? "").toLowerCase().includes(s));
      });
    }
    return list;
  }, [activities, typeFilter, search, contactsById]);

  const selectedThread = selected ? threads.find((t) => t.key.kind === selected.kind && t.key.id === selected.id) : null;
  const selectedContact = selected ? contactsById.get(`${selected.kind}:${selected.id}`) : null;

  return (
    <CrmPage className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Conversations</h1>
          <p className="mt-1 text-sm text-white/60">Internal communication log for leads and customers.</p>
        </div>
        <button onClick={() => setComposing({})} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
          <Plus className="h-4 w-4" /> Log entry
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#FFD200]/30 bg-[#FFD200]/[0.06] px-4 py-3.5">
        <div className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-[#FFD200]/15 text-[#FFD200]">
          <Info className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-[#FFD200]">Manual log only — for now</p>
          <p className="text-[13px] leading-relaxed text-white/90">
            Live WhatsApp, SMS, and email sync arrives with the GoHighLevel integration.
            Until then, log calls and messages here so each customer's history stays complete.
          </p>
        </div>
      </div>

      <ContactMessagesInbox />


      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        {/* threads list */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820]">
          <div className="space-y-2 border-b border-white/[0.06] p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search threads…"
                className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {(["all", ...COMM_TYPES] as const).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`rounded-md border px-2 py-1 text-[11px] capitalize transition ${
                    typeFilter === t
                      ? "border-[#FFD200]/50 bg-[#FFD200]/15 text-[#FFD200]"
                      : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                  }`}>
                  {t === "all" ? "All" : t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-white/50">Loading threads…</div>
            ) : isError ? (
              <div className="p-6 text-sm text-red-300">
                <p>{(error as Error)?.message}</p>
                <button onClick={() => refetch()} className="mt-2 rounded border border-red-300/40 px-2 py-1 text-xs hover:bg-red-500/20">Retry</button>
              </div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-7 w-7 text-white/30" />
                <p className="mt-2 text-sm text-white/60">No conversations yet.</p>
                <button onClick={() => setComposing({})} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-1.5 text-xs font-semibold text-black">
                  <Plus className="h-3 w-3" /> Log first entry
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {threads.map(({ key, latest, items }) => {
                  const c = contactsById.get(`${key.kind}:${key.id}`);
                  const name = c?.name ?? `Unknown ${key.kind}`;
                  const isActive = selected?.kind === key.kind && selected.id === key.id;
                  const Icon = TYPE_ICON[(latest.type as ActivityType)] ?? StickyNote;
                  return (
                    <li key={`${key.kind}:${key.id}`}>
                      <button onClick={() => setSelected(key)}
                        className={`flex w-full items-start gap-3 px-3 py-3 text-left transition ${isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"}`}>
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#006B35] text-xs font-semibold text-white">
                          {initials(name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-white">{name}</span>
                            <span className="flex-shrink-0 text-[10px] text-white/40">{fmtRelative(latest.created_at)}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0 text-[9px] uppercase tracking-wider ${TYPE_STYLE[(latest.type as ActivityType)] ?? TYPE_STYLE.note}`}>
                              <Icon className="h-2.5 w-2.5" /> {latest.type}
                            </span>
                            <span className="text-[10px] text-white/40">{key.kind}</span>
                            <span className="text-[10px] text-white/40">· {items.length} entr{items.length === 1 ? "y" : "ies"}</span>
                          </div>
                          <p className="mt-1 truncate text-xs text-white/60">{latest.body ?? "—"}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* thread view */}
        <div className="flex min-h-[500px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820]">
          {!selectedThread || !selected ? (
            <div className="flex flex-1 items-center justify-center p-10 text-center">
              <div>
                <MessageSquare className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 text-sm text-white/60">Select a thread to view its history.</p>
              </div>
            </div>
          ) : (
            <ThreadView
              key={`${selected.kind}:${selected.id}`}
              contact={selectedContact ?? { id: selected.id, kind: selected.kind, name: `Unknown ${selected.kind}`, email: null, phone: null, meta: selected.kind }}
              items={selectedThread.items}
              onLog={(prefill) => setComposing({ contact: selectedContact ?? undefined, ...prefill })}
            />
          )}
        </div>
      </div>

      {composing && (
        <ComposerModal
          initialContact={composing.contact}
          contacts={contacts ?? []}
          onClose={() => setComposing(null)}
        />
      )}
    </CrmPage>
  );
}

// ─── thread view ───────────────────────────────────────────────────────

function ThreadView({
  contact, items, onLog,
}: { contact: ContactLite; items: ActivityRow[]; onLog: (prefill?: any) => void }) {
  const sorted = [...items].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  const wa = waLink(contact.phone);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#006B35] text-sm font-semibold text-white">
            {initials(contact.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">{contact.name}</h2>
              <span className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/60">{contact.kind}</span>
            </div>
            <p className="text-xs text-white/50">{contact.meta}</p>
            <p className="text-xs text-white/40">
              {contact.phone ?? "no phone"}{contact.email ? ` · ${contact.email}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/15"
              onClick={() => onLog({ type: "whatsapp", direction: "outbound", body: "WhatsApp opened" })}>
              <MessageSquare className="h-3.5 w-3.5" /> WhatsApp <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          )}
          <button onClick={() => onLog()} className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#FFD200]/90">
            <Plus className="h-3.5 w-3.5" /> Log entry
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-white/40">No entries yet.</p>
        ) : sorted.map((a) => {
          const t = (a.type as ActivityType);
          const Icon = TYPE_ICON[t] ?? StickyNote;
          const inbound = a.direction === "inbound";
          return (
            <div key={a.id} className={`flex gap-3 ${inbound ? "" : "flex-row-reverse"}`}>
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${TYPE_STYLE[t] ?? TYPE_STYLE.note}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className={`max-w-[75%] rounded-2xl border px-3 py-2 ${
                inbound ? "rounded-tl-sm border-white/[0.08] bg-white/[0.04]" : "rounded-tr-sm border-[#006B35]/30 bg-[#006B35]/10"
              }`}>
                <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/50">
                  <span>{a.type}</span>
                  {a.direction && (
                    <span className="flex items-center gap-0.5">
                      {inbound ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />} {a.direction}
                    </span>
                  )}
                  <span>· {fmtRelative(a.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-white/90">{a.body ?? "—"}</p>
                {a.created_by && <p className="mt-1 text-[10px] text-white/40">by {a.created_by}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── composer ──────────────────────────────────────────────────────────

function ComposerModal({
  initialContact, contacts, onClose,
}: { initialContact?: ContactLite; contacts: ContactLite[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [contactKey, setContactKey] = useState<string>(
    initialContact ? `${initialContact.kind}:${initialContact.id}` : "",
  );
  const [type, setType] = useState<ActivityType>("note");
  const [direction, setDirection] = useState<Direction>("outbound");
  const [body, setBody] = useState("");

  const contact = contacts.find((c) => `${c.kind}:${c.id}` === contactKey);

  const log = useMutation({
    mutationFn: async () => {
      if (!contact) throw new Error("Pick a contact");
      if (!body.trim()) throw new Error("Add a message or note");
      const payload: any = {
        related_type: contact.kind,
        related_id: contact.id,
        type,
        direction: type === "note" ? null : direction,
        body: body.trim(),
        created_by: "crm",
      };
      const { error } = await supabase.from("activities").insert(payload);
      if (error) throw error;
      // touch last_contacted_at on leads when it's a comm (not just a note)
      if (contact.kind === "lead" && type !== "note") {
        await supabase.from("service_requests").update({ last_contacted_at: new Date().toISOString() }).eq("id", contact.id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations:activities"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
  });

  const wa = type === "whatsapp" ? waLink(contact?.phone, body) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0B1117] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-base font-semibold text-white">Log conversation entry</h2>
          <button onClick={onClose} className="rounded p-1.5 text-white/60 hover:bg-white/[0.06]"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <Field label="Contact">
            <select value={contactKey} onChange={(e) => setContactKey(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none">
              <option value="">— Pick a lead or customer —</option>
              <optgroup label="Customers">
                {contacts.filter((c) => c.kind === "customer").map((c) => (
                  <option key={`${c.kind}:${c.id}`} value={`${c.kind}:${c.id}`}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</option>
                ))}
              </optgroup>
              <optgroup label="Leads">
                {contacts.filter((c) => c.kind === "lead").map((c) => (
                  <option key={`${c.kind}:${c.id}`} value={`${c.kind}:${c.id}`}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</option>
                ))}
              </optgroup>
            </select>
          </Field>

          <Field label="Type">
            <div className="flex flex-wrap gap-1.5">
              {COMM_TYPES.map((t) => {
                const Icon = TYPE_ICON[t];
                const active = type === t;
                return (
                  <button key={t} onClick={() => setType(t)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs capitalize transition ${
                      active ? TYPE_STYLE[t] : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                    }`}>
                    <Icon className="h-3.5 w-3.5" /> {t}
                  </button>
                );
              })}
            </div>
          </Field>

          {type !== "note" && (
            <Field label="Direction">
              <div className="flex gap-1.5">
                {(["inbound", "outbound"] as Direction[]).map((d) => (
                  <button key={d} onClick={() => setDirection(d)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs capitalize transition ${
                      direction === d
                        ? "border-[#FFD200]/50 bg-[#FFD200]/15 text-[#FFD200]"
                        : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                    }`}>
                    {d === "inbound" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />} {d}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Field label={type === "note" ? "Note" : "Body / summary"}>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5}
              placeholder={type === "call" ? "Call summary, outcome, next steps…" : type === "note" ? "Internal note…" : "Message body…"}
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#FFD200]/40 focus:outline-none" />
          </Field>

          {log.isError && <p className="text-sm text-red-300">{(log.error as Error)?.message}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] px-5 py-3">
          <div>
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-2 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/15">
                <MessageSquare className="h-3.5 w-3.5" /> Open WhatsApp <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06]">Cancel</button>
            <button disabled={log.isPending} onClick={() => log.mutate()}
              className="flex items-center gap-1.5 rounded-lg bg-[#FFD200] px-3 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50">
              <Send className="h-4 w-4" /> {log.isPending ? "Saving…" : "Log entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-white/50">{label}</span>
      {children}
    </label>
  );
}
