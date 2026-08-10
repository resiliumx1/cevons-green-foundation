import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight, Phone, Mail, MoreHorizontal, MessageSquarePlus,
  FileText, FilePlus2, Plus, CheckCircle2,
  CalendarPlus, StickyNote, AlertTriangle, RefreshCw, Inbox,
  UserPlus2, DollarSign, ClipboardCheck, Send, Download,
} from "lucide-react";
import { WhatsApp } from "@/components/icons/WhatsApp";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/crm/leads/$id")({
  component: LeadDetail,
});

type Lead = Database["public"]["Tables"]["service_requests"]["Row"];
type Activity = Database["public"]["Tables"]["activities"]["Row"];

const STATUSES = ["new", "contacted", "quoted", "scheduled", "won", "lost"] as const;
type Status = typeof STATUSES[number];
const STATUS_LABEL: Record<Status, string> = {
  new: "New", contacted: "Contacted", quoted: "Quoted",
  scheduled: "Scheduled", won: "Won", lost: "Lost",
};
const STATUS_COLOR: Record<Status, string> = {
  new: "#0ea5e9", contacted: "#FFD200", quoted: "#f59e0b",
  scheduled: "#10b981", won: "#059669", lost: "#ef4444",
};

const ACTIVITY_META: Record<string, { icon: ComponentType<{ className?: string }>; color: string; label: string }> = {
  note: { icon: StickyNote, color: "#94a3b8", label: "Note" },
  call: { icon: Phone, color: "#3b82f6", label: "Call" },
  whatsapp: { icon: WhatsApp, color: "#25D366", label: "WhatsApp" },
  sms: { icon: MessageSquarePlus, color: "#a855f7", label: "SMS" },
  email: { icon: Mail, color: "#FFD200", label: "Email" },
  status_change: { icon: ClipboardCheck, color: "#EF7700", label: "Status change" },
};

type ActivityType = keyof typeof ACTIVITY_META;
const COMMS: ActivityType[] = ["call", "whatsapp", "sms", "email"];

/* ------------------------------------------------------------------ */
/* Atoms                                                               */
/* ------------------------------------------------------------------ */

function Card({ children, className = "", title, action }: { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }) {
  return (
    <div className={`bg-[#101820] border border-white/[0.08] rounded-xl ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 whitespace-nowrap">{label}</span>
      <span className="text-sm text-slate-200 text-right break-words min-w-0">{value}</span>
    </div>
  );
}
function StatusPill({ status }: { status: string }) {
  const s = (STATUSES as readonly string[]).includes(status) ? (status as Status) : "new";
  const color = STATUS_COLOR[s];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold" style={{ background: `${color}1f`, color, borderColor: `${color}55` }}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABEL[s]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function LeadDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const leadQ = useQuery({
    queryKey: ["crm", "lead", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_requests").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Lead | null;
    },
  });

  const actsQ = useQuery({
    queryKey: ["crm", "lead-activities", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("related_type", "lead")
        .eq("related_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Activity[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["crm", "lead", id] });
    qc.invalidateQueries({ queryKey: ["crm", "lead-activities", id] });
    qc.invalidateQueries({ queryKey: ["crm", "leads"] });
  };

  const logActivity = async (type: ActivityType, body?: string | null, direction?: "inbound" | "outbound") => {
    await supabase.from("activities").insert({ related_type: "lead", related_id: id, type, body: body ?? null, direction: direction ?? null });
  };

  const updateLead = useMutation({
    mutationFn: async (patch: Partial<Lead> & { _statusLog?: string }) => {
      const { _statusLog, ...rest } = patch;
      const { error } = await supabase.from("service_requests").update(rest).eq("id", id);
      if (error) throw error;
      if (_statusLog) await logActivity("status_change", _statusLog);
    },
    onSuccess: invalidate,
  });

  const addActivity = useMutation({
    mutationFn: async ({ type, body, direction }: { type: ActivityType; body: string; direction?: "inbound" | "outbound" }) => {
      await logActivity(type, body, direction);
      if (COMMS.includes(type)) {
        await supabase.from("service_requests").update({ last_contacted_at: new Date().toISOString() }).eq("id", id);
      }
    },
    onSuccess: invalidate,
  });

  const convertToCustomer = useMutation({
    mutationFn: async () => {
      const lead = leadQ.data;
      if (!lead) return;
      if (lead.customer_id) return;
      const { data: cust, error } = await supabase.from("customers").insert({
        name: lead.name ?? "Unknown",
        type: lead.customer_type === "residential" || lead.customer_type === "commercial" || lead.customer_type === "industrial" ? lead.customer_type : null,
        contact_name: lead.name,
        email: lead.email,
        phone: lead.phone,
        region: lead.region,
        address: null,
      }).select("id").single();
      if (error) throw error;
      await supabase.from("service_requests").update({ customer_id: cust.id }).eq("id", id);
    },
    onSuccess: invalidate,
  });

  const createQuote = useMutation({
    mutationFn: async () => {
      const lead = leadQ.data;
      if (!lead) return;
      const number = `Q-${Date.now().toString().slice(-6)}`;
      const total = Number(lead.estimated_value ?? 0);
      const { error } = await supabase.from("quotes").insert({
        number,
        service_request_id: id,
        customer_id: lead.customer_id,
        title: lead.service ?? "Service quote",
        line_items: [{ item: lead.service ?? "Service", qty: 1, price: total }],
        subtotal: total, tax: 0, total,
        status: "draft",
      });
      if (error) throw error;
      await logActivity("note", `Draft quote ${number} created`);
    },
    onSuccess: invalidate,
  });

  const scheduleJob = useMutation({
    mutationFn: async ({ when }: { when: string }) => {
      const lead = leadQ.data;
      if (!lead) return;
      const number = `J-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("jobs").insert({
        number,
        service_request_id: id,
        customer_id: lead.customer_id,
        service: lead.service,
        region: lead.region,
        scheduled_start: when,
        status: "scheduled",
      });
      if (error) throw error;
      await supabase.from("service_requests").update({ status: "scheduled" }).eq("id", id);
      await logActivity("status_change", `Job ${number} scheduled`);
    },
    onSuccess: invalidate,
  });

  if (leadQ.isLoading) {
    return <div className="p-8 text-sm text-slate-400 animate-pulse">Loading lead…</div>;
  }
  if (leadQ.isError) {
    return (
      <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-8 text-center max-w-md mx-auto mt-10">
        <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-white font-semibold">Couldn't load lead</p>
        <button onClick={() => leadQ.refetch()} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-white/10 rounded-lg text-slate-200 hover:text-white">
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    );
  }
  const lead = leadQ.data;
  if (!lead) {
    return (
      <div className="bg-[#101820] border border-white/[0.08] rounded-xl p-12 text-center max-w-md mx-auto mt-10">
        <Inbox className="h-8 w-8 text-slate-400 mx-auto mb-3" />
        <p className="text-sm text-white font-semibold">Lead not found</p>
        <Link to="/crm/leads" className="mt-4 inline-block text-xs font-semibold text-emerald-400 hover:text-emerald-300">Back to leads</Link>
      </div>
    );
  }

  const initials = (lead.name ?? "L").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const details = (lead.details ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 animate-fade-in">
        <Link to="/crm/leads" className="hover:text-white">Leads / Requests</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-200 font-mono">{lead.reference}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-700/60 grid place-items-center text-base font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-[26px] font-bold text-white tracking-tight">{lead.reference}</h1>
              <StatusPill status={lead.status} />
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{lead.name ?? "—"} · {lead.service ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lead.phone && <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#101820] border border-white/[0.08] text-slate-200 hover:border-white/20"><Phone className="h-4 w-4" /> Call</a>}
          {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#25D366] text-white hover:brightness-95"><WhatsApp className="h-4 w-4" /> WhatsApp</a>}
          {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#101820] border border-white/[0.08] text-slate-200 hover:border-white/20"><Mail className="h-4 w-4" /> Email</a>}
          <button className="h-9 w-9 grid place-items-center rounded-lg bg-[#101820] border border-white/[0.08] text-slate-300 hover:border-white/20" aria-label="More"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Status switcher */}
      <Card className="p-3 animate-fade-in">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 pl-1">Stage</span>
          {STATUSES.map((s) => {
            const active = lead.status === s;
            return (
              <button key={s} onClick={() => updateLead.mutate({ status: s, _statusLog: `Status changed to ${STATUS_LABEL[s]}` })}
                disabled={updateLead.isPending || active}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${active ? "border-transparent" : "border-white/10 text-slate-300 hover:bg-white/5"}`}
                style={active ? { background: `${STATUS_COLOR[s]}1f`, color: STATUS_COLOR[s], borderColor: `${STATUS_COLOR[s]}55` } : undefined}>
                {STATUS_LABEL[s]}
              </button>
            );
          })}
        </div>
        {lead.status === "lost" && (
          <div className="mt-3 pl-1">
            <label className="text-[11px] uppercase tracking-wider text-slate-500">Lost reason</label>
            <input
              defaultValue={lead.lost_reason ?? ""}
              onBlur={(e) => { if (e.currentTarget.value !== (lead.lost_reason ?? "")) updateLead.mutate({ lost_reason: e.currentTarget.value }); }}
              placeholder="Why was this lost?"
              className="mt-1 w-full max-w-md rounded-lg bg-[#071111] border border-white/[0.08] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        )}
      </Card>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Request summary + attribution */}
        <div className="lg:col-span-4 space-y-5 animate-fade-in">
          <Card title="Request Summary">
            <div className="px-5 py-2 divide-y divide-white/[0.04]">
              <KV label="Service" value={lead.service ?? "—"} />
              <KV label="Category" value={lead.category ?? "—"} />
              <KV label="Customer Type" value={lead.customer_type ?? "—"} />
              <KV label="Region" value={lead.region ?? "—"} />
              <KV label="Preferred Date" value={lead.preferred_date ?? "—"} />
              <KV label="Preferred Time" value={lead.preferred_time ?? "—"} />
              <KV label="Contact Method" value={lead.contact_method ?? "—"} />
              <KV label="Company" value={lead.company ?? "—"} />
              <KV label="Submitted" value={new Date(lead.created_at).toLocaleString()} />
            </div>
          </Card>

          <Card title="Contact">
            <div className="px-5 py-2 divide-y divide-white/[0.04]">
              <KV label="Name" value={lead.name ?? "—"} />
              <KV label="Phone" value={lead.phone ?? "—"} />
              <KV label="Email" value={lead.email ?? "—"} />
            </div>
          </Card>

          {lead.message && (
            <Card title="Message">
              <p className="p-5 text-sm text-slate-200 whitespace-pre-wrap">{lead.message}</p>
            </Card>
          )}

          {Object.keys(details).length > 0 && (
            <Card title="Details">
              <div className="px-5 py-2 divide-y divide-white/[0.04]">
                {Object.entries(details).map(([k, v]) => (
                  <KV key={k} label={k.replace(/_/g, " ")} value={typeof v === "object" ? JSON.stringify(v) : String(v)} />
                ))}
              </div>
            </Card>
          )}

          {lead.file_urls && lead.file_urls.length > 0 && (
            <Card title="Files">
              <div className="p-5 space-y-2">
                {lead.file_urls.map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noopener"
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 truncate">
                    <Download className="h-4 w-4 shrink-0" />
                    <span className="truncate">{u.split("/").pop() ?? `File ${i + 1}`}</span>
                  </a>
                ))}
              </div>
            </Card>
          )}

          <Card title="Attribution">
            <div className="px-5 py-2 divide-y divide-white/[0.04]">
              <KV label="Reference" value={<span className="font-mono">{lead.reference}</span>} />
              <KV label="Source" value={lead.utm_source ?? "Direct"} />
              <KV label="Medium" value={lead.utm_medium ?? "—"} />
              <KV label="Campaign" value={lead.utm_campaign ?? "—"} />
              <KV label="Term" value={lead.utm_term ?? "—"} />
              <KV label="Content" value={lead.utm_content ?? "—"} />
              <KV label="Referrer" value={lead.referrer ?? "—"} />
              <KV label="Landing Page" value={lead.landing_page ?? "—"} />
            </div>
          </Card>
        </div>

        {/* CENTER: Activity timeline + add */}
        <div className="lg:col-span-5 space-y-5 animate-fade-in" style={{ animationDelay: "60ms" }}>
          <Card title="Activity">
            <div className="p-5">
              <ActivityComposer onSubmit={(type, body, direction) => addActivity.mutate({ type, body, direction })} pending={addActivity.isPending} />
              <div className="mt-6">
                {actsQ.isLoading ? (
                  <p className="text-sm text-slate-400 animate-pulse">Loading activity…</p>
                ) : actsQ.isError ? (
                  <p className="text-sm text-red-400">Couldn't load activity.</p>
                ) : (actsQ.data ?? []).length === 0 ? (
                  <div className="text-center py-8">
                    <Inbox className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No activity yet.</p>
                  </div>
                ) : (
                  <ol className="space-y-4">
                    {(actsQ.data ?? []).map((a) => {
                      const meta = ACTIVITY_META[a.type] ?? ACTIVITY_META.note;
                      const Icon = meta.icon;
                      return (
                        <li key={a.id} className="flex gap-3 items-start">
                          <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${meta.color}25`, color: meta.color }}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">
                              {meta.label}{a.direction ? ` · ${a.direction}` : ""}
                            </p>
                            {a.body && <p className="text-sm text-slate-300 mt-0.5 whitespace-pre-wrap">{a.body}</p>}
                            <p className="text-[11px] text-slate-500 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Assignment, value, quick actions */}
        <div className="lg:col-span-3 space-y-5 animate-fade-in" style={{ animationDelay: "120ms" }}>
          <Card title="Assignment & Value">
            <div className="p-5 space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500">Assigned to</label>
                <input
                  defaultValue={lead.assigned_to ?? ""}
                  onBlur={(e) => { const v = e.currentTarget.value.trim() || null; if (v !== (lead.assigned_to ?? null)) updateLead.mutate({ assigned_to: v }); }}
                  placeholder="Owner name"
                  className="mt-1 w-full rounded-lg bg-[#071111] border border-white/[0.08] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-500">Estimated value ($)</label>
                <input
                  type="number"
                  defaultValue={lead.estimated_value ?? ""}
                  onBlur={(e) => { const v = e.currentTarget.value ? Number(e.currentTarget.value) : null; if (v !== (lead.estimated_value ?? null)) updateLead.mutate({ estimated_value: v }); }}
                  className="mt-1 w-full rounded-lg bg-[#071111] border border-white/[0.08] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              {lead.last_contacted_at && (
                <p className="text-[11px] text-slate-500">Last contacted {new Date(lead.last_contacted_at).toLocaleString()}</p>
              )}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="p-3 grid grid-cols-1 gap-1">
              <QuickAction icon={UserPlus2} label={lead.customer_id ? "Customer linked" : "Convert to customer"} disabled={!!lead.customer_id || convertToCustomer.isPending} onClick={() => convertToCustomer.mutate()} />
              <QuickAction icon={FilePlus2} label="Create draft quote" onClick={() => createQuote.mutate()} disabled={createQuote.isPending} />
              <QuickAction icon={CalendarPlus} label="Schedule job (now+1 day)" onClick={() => {
                const when = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
                scheduleJob.mutate({ when });
              }} disabled={scheduleJob.isPending} />
              <QuickAction icon={DollarSign} label="Mark Won" onClick={() => updateLead.mutate({ status: "won", _statusLog: "Marked as Won" })} disabled={lead.status === "won"} />
              <QuickAction icon={CheckCircle2} label="Back to Leads" onClick={() => navigate({ to: "/crm/leads" })} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, disabled }: { icon: ComponentType<{ className?: string }>; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/5 hover:text-white text-left disabled:opacity-50 disabled:cursor-not-allowed">
      <Icon className="h-4 w-4 text-emerald-400" />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Activity composer                                                   */
/* ------------------------------------------------------------------ */

function ActivityComposer({ onSubmit, pending }: { onSubmit: (type: ActivityType, body: string, direction?: "inbound" | "outbound") => void; pending: boolean }) {
  const [type, setType] = useState<ActivityType>("note");
  const [body, setBody] = useState("");
  const [direction, setDirection] = useState<"outbound" | "inbound">("outbound");
  const isComms = COMMS.includes(type);

  const submit = () => {
    if (!body.trim()) return;
    onSubmit(type, body.trim(), isComms ? direction : undefined);
    setBody("");
  };

  return (
    <div className="bg-[#071111] border border-white/[0.08] rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {(Object.keys(ACTIVITY_META) as ActivityType[]).filter((t) => t !== "status_change").map((t) => {
          const m = ACTIVITY_META[t];
          const Icon = m.icon;
          const active = type === t;
          return (
            <button key={t} onClick={() => setType(t)}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border ${active ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-slate-300 hover:bg-white/5"}`}>
              <Icon className="h-3.5 w-3.5" /> {m.label}
            </button>
          );
        })}
        {isComms && (
          <div className="ml-auto inline-flex p-0.5 bg-white/5 rounded-md">
            {(["outbound", "inbound"] as const).map((d) => (
              <button key={d} onClick={() => setDirection(d)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${direction === d ? "bg-[#EF7700] text-white" : "text-slate-400 hover:text-white"}`}>{d}</button>
            ))}
          </div>
        )}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={type === "note" ? "Add an internal note…" : `Log ${ACTIVITY_META[type].label.toLowerCase()} details…`}
        rows={3}
        className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
      />
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <span className="text-[11px] text-slate-500">{isComms ? "Logging will update last contacted time" : "Only visible to your team"}</span>
        <button onClick={submit} disabled={pending || !body.trim()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFD200] text-[#101820] text-xs font-semibold hover:brightness-95 disabled:opacity-50">
          {type === "note" ? <Plus className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
          {pending ? "Saving…" : type === "note" ? "Add Note" : "Log Activity"}
        </button>
      </div>
    </div>
  );
}
