import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Paperclip, Search, RefreshCw, CheckCheck, X } from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { GEORGETOWN_LABEL, georgetownLabel } from "@/lib/georgetown";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/admin/Manifest";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({
    meta: [
      { title: "Messages | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MessagesPage,
});

type Message = {
  id: string;
  reference: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  attachment_url: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  read: "Read",
  handled: "Handled",
};

type StatusFilter = "all" | "new" | "read" | "handled";
type SortKey = "newest" | "oldest" | "name" | "status";

const DAY = 24 * 60 * 60 * 1000;
type RangeFilter = "all" | "7" | "30" | "90";

function StatusChip({ status }: { status: string }) {
  const isNew = status === "new";
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5 shrink-0"
      style={
        isNew
          ? { background: "#EF7700", color: "#1A1A1A" }
          : status === "handled"
            ? { background: "#2DA339", color: "#1A1A1A" }
            : { background: "var(--crm-surface-muted)", color: "var(--crm-text-muted)" }
      }
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function MessagesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatusFilter] = useState<StatusFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");
  const [attachmentsOnly, setAttachmentsOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select(
          "id, reference, name, email, phone, subject, message, status, attachment_url, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase.from("contact_messages").update({ status }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      qc.invalidateQueries({ queryKey: ["admin", "unread-messages"] });
      if (vars.ids.length > 1) {
        toast.success(`${vars.ids.length} messages marked ${STATUS_LABEL[vars.status] ?? vars.status}`);
      }
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not update these messages"),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cutoff = range === "all" ? 0 : Date.now() - Number(range) * DAY;
    const filtered = data.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (attachmentsOnly && !m.attachment_url) return false;
      if (cutoff && new Date(m.created_at).getTime() < cutoff) return false;
      if (
        q &&
        !`${m.name} ${m.email} ${m.phone ?? ""} ${m.subject ?? ""} ${m.message} ${m.reference ?? ""}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    const order: Record<string, number> = { new: 0, read: 1, handled: 2 };
    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "status") return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      const av = new Date(a.created_at).getTime();
      const bv = new Date(b.created_at).getTime();
      return sort === "oldest" ? av - bv : bv - av;
    });
  }, [data, search, status, range, attachmentsOnly, sort]);

  const unread = data.filter((m) => m.status === "new").length;
  const filtersActive = !!search || status !== "all" || range !== "all" || attachmentsOnly;
  const allChecked = rows.length > 0 && rows.every((m) => selected.has(m.id));

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRange("all");
    setAttachmentsOnly(false);
  };
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) rows.forEach((m) => next.delete(m.id));
    else rows.forEach((m) => next.add(m.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const bulk = (nextStatus: string) => {
    setStatus.mutate(
      { ids: Array.from(selected), status: nextStatus },
      { onSuccess: () => setSelected(new Set()) },
    );
  };

  return (
    <CrmPage className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>
            Messages
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
            Contact-form submissions from the public website
            {unread > 0 ? ` — ${unread} unread` : ""}. Times are {GEORGETOWN_LABEL}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="admin-btn-quiet"
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </div>

      {/* Toolbar: search, filter, sort */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search aria-hidden />
          <input
            className="admin-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sender, email, subject, reference or message…"
            aria-label="Search messages"
            type="search"
          />
        </div>
        <select
          className="admin-select"
          value={status}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="handled">Handled</option>
        </select>
        <select
          className="admin-select"
          value={range}
          onChange={(e) => setRange(e.target.value as RangeFilter)}
          aria-label="Filter by date received"
        >
          <option value="all">Any date</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <select
          className="admin-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort messages"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Sender A–Z</option>
          <option value="status">Unread first</option>
        </select>
        <label
          className="inline-flex min-h-11 items-center gap-2 px-2 text-sm"
          style={{ color: "var(--crm-text)" }}
        >
          <input
            type="checkbox"
            checked={attachmentsOnly}
            onChange={(e) => setAttachmentsOnly(e.target.checked)}
          />
          With attachment
        </label>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="admin-btn-quiet">
            <X className="h-4 w-4" aria-hidden /> Clear
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="admin-bulkbar" role="region" aria-label="Bulk actions">
          <strong>{selected.size} selected</strong>
          <button type="button" className="admin-btn-quiet" disabled={setStatus.isPending} onClick={() => bulk("read")}>
            <MailOpen className="h-4 w-4" aria-hidden /> Mark read
          </button>
          <button type="button" className="admin-btn-quiet" disabled={setStatus.isPending} onClick={() => bulk("handled")}>
            <CheckCheck className="h-4 w-4" aria-hidden /> Mark handled
          </button>
          <button type="button" className="admin-btn-quiet" disabled={setStatus.isPending} onClick={() => bulk("new")}>
            <Mail className="h-4 w-4" aria-hidden /> Mark unread
          </button>
          <button type="button" className="admin-btn-quiet ml-auto" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--crm-text-muted)" }}>
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          Select all {rows.length} shown
        </label>
      )}

      {isLoading ? (
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}
        >
          <PanelSkeleton rows={6} />
        </div>
      ) : isError ? (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--crm-border)" }}>
          <p className="text-sm mb-1" style={{ color: "var(--crm-text)" }}>
            Messages could not be loaded.
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--crm-text-muted)" }}>
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button className="min-h-11" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: "var(--crm-border)", background: "var(--crm-surface)" }}
        >
          <Mail className="size-6 mx-auto mb-2" style={{ color: "var(--crm-text-faint)" }} />
          <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
            {filtersActive
              ? "No messages match these filters."
              : "No messages have come in yet. Enquiries from the website contact form land here."}
          </p>
          {filtersActive && (
            <button type="button" onClick={clearFilters} className="admin-btn-quiet mt-4">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((m) => {
            const isOpen = open === m.id;
            return (
              <article
                key={m.id}
                className="rounded-xl border"
                style={{ background: "var(--crm-surface)", borderColor: "var(--crm-border)" }}
              >
                <div className="flex items-start gap-2 p-3">
                  <input
                    type="checkbox"
                    className="mt-2"
                    checked={selected.has(m.id)}
                    onChange={() => toggleOne(m.id)}
                    aria-label={`Select message from ${m.name}`}
                  />
                  <button
                    type="button"
                    className="flex-1 text-left min-h-11 flex flex-col min-[560px]:flex-row min-[560px]:items-center gap-2"
                    onClick={() => {
                      setOpen(isOpen ? null : m.id);
                      if (!isOpen && m.status === "new") setStatus.mutate({ ids: [m.id], status: "read" });
                    }}
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-2 min-w-0 flex-1">
                      <StatusChip status={m.status} />
                      <span className="font-semibold truncate" style={{ color: "var(--crm-text)" }}>
                        {m.name}
                      </span>
                      <span className="text-xs truncate" style={{ color: "var(--crm-text-muted)" }}>
                        {m.subject || "No subject"}
                      </span>
                      {m.attachment_url && (
                        <Paperclip className="size-3.5 shrink-0" style={{ color: "var(--crm-text-faint)" }} />
                      )}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "var(--crm-text-muted)" }}>
                      {georgetownLabel(m.created_at)}
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: "var(--crm-border)" }}>
                    <p className="text-xs mb-2" style={{ color: "var(--crm-text-muted)" }}>
                      {m.email}
                      {m.phone ? ` · ${m.phone}` : ""}
                      {m.reference ? ` · ${m.reference}` : ""}
                    </p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--crm-text)" }}>
                      {m.message}
                    </p>
                    {m.attachment_url && (
                      <a
                        href={m.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm mt-3 underline min-h-11"
                        style={{ color: "var(--crm-text)" }}
                      >
                        <Paperclip className="size-4" /> Attachment
                      </a>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button asChild className="min-h-11">
                        <a href={`mailto:${m.email}${m.subject ? `?subject=Re: ${encodeURIComponent(m.subject)}` : ""}`}>
                          Reply by email
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        disabled={setStatus.isPending}
                        onClick={() =>
                          setStatus.mutate({
                            ids: [m.id],
                            status: m.status === "handled" ? "read" : "handled",
                          })
                        }
                      >
                        <MailOpen className="size-4 mr-2" />
                        {m.status === "handled" ? "Mark as not handled" : "Mark as handled"}
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          <p className="text-xs pt-1" style={{ color: "var(--crm-text-muted)" }}>
            Showing {rows.length} of {data.length} messages.
          </p>
        </div>
      )}
    </CrmPage>
  );
}
