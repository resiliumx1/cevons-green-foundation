import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Paperclip } from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { GEORGETOWN_LABEL, georgetownLabel } from "@/lib/georgetown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [open, setOpen] = useState<string | null>(null);

  const { data = [], isLoading, isError, refetch } = useQuery({
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
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not update this message"),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((m) =>
      `${m.name} ${m.email} ${m.subject ?? ""} ${m.message} ${m.reference ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [data, search]);

  const unread = data.filter((m) => m.status === "new").length;

  return (
    <CrmPage>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--crm-text)" }}>
          Messages
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
          Contact-form submissions from the public website
          {unread > 0 ? ` — ${unread} unread` : ""}. Times are {GEORGETOWN_LABEL}.
        </p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search sender, subject or message…"
        className="mb-5 max-w-sm min-h-11"
        aria-label="Search messages"
      />

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
          Loading messages…
        </p>
      ) : isError ? (
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--crm-border)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--crm-text)" }}>
            Messages could not be loaded.
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
            {search ? `No messages match “${search}”.` : "No messages have come in yet."}
          </p>
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
                <button
                  type="button"
                  className="w-full text-left p-3 min-h-11 flex flex-col min-[560px]:flex-row min-[560px]:items-center gap-2"
                  onClick={() => {
                    setOpen(isOpen ? null : m.id);
                    if (!isOpen && m.status === "new") setStatus.mutate({ id: m.id, status: "read" });
                  }}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
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
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "var(--crm-text-muted)" }}>
                    {georgetownLabel(m.created_at)}
                  </span>
                </button>

                {isOpen && (
                  <div
                    className="px-3 pb-3 pt-1 border-t"
                    style={{ borderColor: "var(--crm-border)" }}
                  >
                    <p className="text-xs mb-2" style={{ color: "var(--crm-text-muted)" }}>
                      {m.email}
                      {m.phone ? ` · ${m.phone}` : ""}
                      {m.reference ? ` · ${m.reference}` : ""}
                    </p>
                    <p
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: "var(--crm-text)" }}
                    >
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
                            id: m.id,
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
        </div>
      )}
    </CrmPage>
  );
}
