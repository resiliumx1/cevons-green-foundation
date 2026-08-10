import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Inbox, Phone, ChevronDown, ChevronUp, ExternalLink, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContactMessage {
  id: string;
  reference: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  attachment_url: string | null;
  status: string;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ContactMessagesInbox() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, reference, name, email, phone, subject, message, attachment_url, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as ContactMessage[];
    },
  });

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ status: "read" }).eq("id", id);
    refetch();
  };

  const newCount = (data ?? []).filter((m) => m.status === "new").length;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101820]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-[#FFD200]" />
          <h2 className="text-sm font-semibold text-white">Contact form inbox</h2>
          {newCount > 0 && (
            <span className="rounded-full bg-[#FFD200] px-2 py-0.5 text-[11px] font-bold text-black">{newCount} new</span>
          )}
          <span className="text-xs text-white/40">{data?.length ?? 0} total</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-white/60" /> : <ChevronDown className="h-4 w-4 text-white/60" />}
      </button>

      {open && (
        <div className="max-h-[420px] overflow-y-auto border-t border-white/[0.06]">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-white/50">Loading…</div>
          ) : !data || data.length === 0 ? (
            <div className="p-6 text-center text-sm text-white/50">
              <Mail className="mx-auto h-6 w-6 text-white/30" />
              <p className="mt-2">No contact messages yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {data.map((m) => {
                const isExp = expanded === m.id;
                return (
                  <li key={m.id} className={`px-4 py-3 ${m.status === "new" ? "bg-[#FFD200]/[0.04]" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => setExpanded(isExp ? null : m.id)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-white truncate">{m.name}</span>
                          {m.status === "new" && <span className="rounded bg-[#FFD200] px-1.5 py-0.5 text-[10px] font-bold text-black">NEW</span>}
                          {m.reference && <span className="font-mono text-[11px] text-white/40">{m.reference}</span>}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-white/60">
                          <span className="text-white/80">{m.subject || "—"}</span> · {m.message.slice(0, 90)}
                          {m.message.length > 90 ? "…" : ""}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-white/40">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                          {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                          {m.attachment_url && <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />attachment</span>}
                          <span>{timeAgo(m.created_at)}</span>
                        </div>
                      </button>
                      {m.status === "new" && (
                        <button onClick={() => markRead(m.id)} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] text-white/70 hover:bg-white/[0.06]">
                          Mark read
                        </button>
                      )}
                    </div>
                    {isExp && (
                      <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/30 p-3 text-sm text-white/80 whitespace-pre-wrap">
                        {m.message}
                        {m.attachment_url && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={async () => {
                                const path = m.attachment_url!.startsWith("http")
                                  ? null
                                  : m.attachment_url!;
                                if (!path) { window.open(m.attachment_url!, "_blank"); return; }
                                const { data } = await supabase.storage
                                  .from("contact-attachments")
                                  .createSignedUrl(path, 60 * 10);
                                if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                              }}
                              className="inline-flex items-center gap-1 text-xs text-[#FFD200] hover:underline"
                            >
                              <Paperclip className="h-3 w-3" /> View attachment <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
