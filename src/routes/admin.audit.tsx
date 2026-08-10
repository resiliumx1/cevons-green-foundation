import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileClock, Filter, RefreshCw, Search, Mail, Truck, Plus, ArrowRightLeft, Pencil } from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/crm/audit")({
  head: () => ({ meta: [{ title: "Audit Log | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: AuditPage,
});

type AuditRow = {
  id: string;
  entity_type: "contact_message" | "service_request" | string;
  entity_id: string;
  reference: string | null;
  action: "created" | "status_changed" | "updated" | string;
  old_status: string | null;
  new_status: string | null;
  changed_fields: string[] | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
};

type EntityFilter = "all" | "contact_message" | "service_request";
type ActionFilter = "all" | "created" | "status_changed" | "updated";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ActionIcon({ action }: { action: string }) {
  if (action === "created") return <Plus className="h-4 w-4 text-emerald-400" />;
  if (action === "status_changed") return <ArrowRightLeft className="h-4 w-4 text-[#EF7700]" />;
  if (action === "updated") return <Pencil className="h-4 w-4 text-blue-300" />;
  return <FileClock className="h-4 w-4 text-white/60" />;
}

function EntityBadge({ type }: { type: string }) {
  const isMsg = type === "contact_message";
  const Icon = isMsg ? Mail : Truck;
  const label = isMsg ? "Message" : type === "service_request" ? "Request" : type;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/70">
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function AuditPage() {
  const [entity, setEntity] = useState<EntityFilter>("all");
  const [action, setAction] = useState<ActionFilter>("all");
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["audit_log", entity, action],
    queryFn: async () => {
      let q = supabase
        .from("audit_log" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (entity !== "all") q = q.eq("entity_type", entity);
      if (action !== "all") q = q.eq("action", action);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as AuditRow[];
    },
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(
      (r) =>
        r.reference?.toLowerCase().includes(q) ||
        r.note?.toLowerCase().includes(q) ||
        r.new_status?.toLowerCase().includes(q) ||
        r.old_status?.toLowerCase().includes(q) ||
        r.changed_fields?.some((f) => f.toLowerCase().includes(q)),
    );
  }, [data, query]);

  return (
    <CrmPage>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              <FileClock className="h-6 w-6 text-[#EF7700]" /> Audit Log
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Track when contact messages and service requests are created, updated, and processed.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/80 hover:bg-white/[0.06]"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-[#101820] p-3">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as EntityFilter)}
            className="rounded-md border border-white/[0.08] bg-black/30 px-2 py-1 text-sm text-white/80"
          >
            <option value="all">All entities</option>
            <option value="contact_message">Contact messages</option>
            <option value="service_request">Service requests</option>
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ActionFilter)}
            className="rounded-md border border-white/[0.08] bg-black/30 px-2 py-1 text-sm text-white/80"
          >
            <option value="all">All actions</option>
            <option value="created">Created</option>
            <option value="status_changed">Status changed</option>
            <option value="updated">Updated</option>
          </select>
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference, status, field…"
              className="w-64 rounded-md border border-white/[0.08] bg-black/30 py-1 pl-8 pr-2 text-sm text-white/80 placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-white/50">Loading audit trail…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/50">
              <FileClock className="mx-auto h-8 w-8 text-white/30" />
              <p className="mt-2">No audit events match these filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {rows.map((r) => (
                <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="mt-0.5"><ActionIcon action={r.action} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <EntityBadge type={r.entity_type} />
                      {r.reference && (
                        <span className="font-mono text-[11px] text-white/50">{r.reference}</span>
                      )}
                      <span className="font-medium text-white capitalize">{r.action.replace("_", " ")}</span>
                      {r.action === "status_changed" && (
                        <span className="text-xs text-white/60">
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5">{r.old_status ?? "—"}</span>
                          <span className="mx-1">→</span>
                          <span className="rounded bg-[#EF7700]/15 px-1.5 py-0.5 text-[#EF7700]">{r.new_status ?? "—"}</span>
                        </span>
                      )}
                      {r.action === "created" && r.new_status && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs text-emerald-300">{r.new_status}</span>
                      )}
                    </div>
                    {r.note && <p className="mt-0.5 text-xs text-white/60">{r.note}</p>}
                    {r.changed_fields && r.changed_fields.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.changed_fields.map((f) => (
                          <span key={f} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/60">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-white/40">
                    <div>{timeAgo(r.created_at)}</div>
                    <div className="mt-0.5">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-3 text-xs text-white/40">
          Showing up to 500 most recent events. Only staff and admins can view this log.
        </p>
      </div>
    </CrmPage>
  );
}
