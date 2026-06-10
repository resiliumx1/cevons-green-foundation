import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, Copy, Check, Save, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_BASE = "https://cevons.com";

type UtmLink = {
  id: string;
  label: string | null;
  base_url: string;
  full_url: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  created_at: string;
};

function buildUrl(base: string, params: Record<string, string>) {
  const trimmed = base.trim();
  if (!trimmed) return "";
  let url: URL;
  try {
    url = new URL(trimmed.match(/^https?:\/\//i) ? trimmed : `https://${trimmed}`);
  } catch {
    return "";
  }
  (["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const).forEach((k) => {
    const v = params[k]?.trim();
    if (v) url.searchParams.set(k, v);
    else url.searchParams.delete(k);
  });
  return url.toString();
}

export function UtmLinkBuilder() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    base_url: DEFAULT_BASE,
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    label: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fullUrl = useMemo(
    () =>
      buildUrl(form.base_url, {
        utm_source: form.utm_source,
        utm_medium: form.utm_medium,
        utm_campaign: form.utm_campaign,
        utm_term: form.utm_term,
        utm_content: form.utm_content,
      }),
    [form],
  );

  const savedQ = useQuery({
    queryKey: ["utm_links"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("utm_links")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as UtmLink[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!fullUrl) throw new Error("Enter a valid base URL first.");
      if (!form.utm_source.trim() || !form.utm_medium.trim() || !form.utm_campaign.trim()) {
        throw new Error("Source, medium, and campaign are required to save.");
      }
      const { error } = await (supabase as any).from("utm_links").insert({
        label: form.label.trim() || null,
        base_url: form.base_url.trim(),
        full_url: fullUrl,
        utm_source: form.utm_source.trim() || null,
        utm_medium: form.utm_medium.trim() || null,
        utm_campaign: form.utm_campaign.trim() || null,
        utm_term: form.utm_term.trim() || null,
        utm_content: form.utm_content.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setErr(null);
      qc.invalidateQueries({ queryKey: ["utm_links"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("utm_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["utm_links"] }),
  });

  const copy = async (text: string, id: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1400);
    } catch {
      /* noop */
    }
  };

  const field = (key: keyof typeof form, label: string, placeholder: string, required = false) => (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="text-[#FFD200] ml-1">*</span>}
      </span>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg bg-[#071111] border border-white/[0.08] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
      />
    </label>
  );

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#FFD200]/15 grid place-items-center">
            <Link2 className="h-4 w-4 text-[#FFD200]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">UTM Link Builder</h2>
            <p className="text-xs text-slate-400">Generate tagged campaign URLs for ads, email, WhatsApp, and print.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {field("base_url", "Base URL", "https://cevons.com/services", true)}
        {field("label", "Internal Label", "e.g. Aug Facebook Reels")}
        {field("utm_source", "utm_source", "facebook", true)}
        {field("utm_medium", "utm_medium", "social", true)}
        {field("utm_campaign", "utm_campaign", "aug_reels", true)}
        {field("utm_term", "utm_term", "waste pickup")}
        {field("utm_content", "utm_content", "cta_button")}
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Generated URL</div>
        <div className="flex items-center gap-2 rounded-lg border border-[#FFD200]/30 bg-[#FFD200]/[0.04] px-3 py-2.5">
          <code className="flex-1 text-xs text-slate-100 break-all font-mono">
            {fullUrl || <span className="text-slate-500">Fill in the form to generate a tagged URL…</span>}
          </code>
          <button
            type="button"
            onClick={() => copy(fullUrl, "preview")}
            disabled={!fullUrl}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#FFD200] text-[#101820] text-xs font-semibold hover:brightness-95 disabled:opacity-50"
          >
            {copiedId === "preview" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedId === "preview" ? "Copied" : "Copy"}
          </button>
          {fullUrl && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-slate-300 hover:bg-white/5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending || !fullUrl}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {save.isPending ? "Saving…" : "Save Link"}
        </button>
        <button
          type="button"
          onClick={() =>
            setForm({ base_url: DEFAULT_BASE, utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "", label: "" })
          }
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 text-slate-300 text-sm hover:bg-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      {/* Saved list */}
      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Recently Saved</h3>
          <span className="text-[10px] text-slate-500 tabular-nums">{savedQ.data?.length ?? 0}</span>
        </div>
        {savedQ.isLoading ? (
          <p className="text-xs text-slate-500">Loading…</p>
        ) : (savedQ.data?.length ?? 0) === 0 ? (
          <p className="text-xs text-slate-500">No links saved yet. Generate one above and click Save.</p>
        ) : (
          <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {savedQ.data!.map((l) => (
              <li key={l.id} className="rounded-lg border border-white/[0.06] bg-[#071111] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {l.label || `${l.utm_campaign ?? "campaign"} · ${l.utm_source ?? ""}`.trim()}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{l.full_url}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {([
                        ["src", l.utm_source],
                        ["med", l.utm_medium],
                        ["camp", l.utm_campaign],
                      ] as const)
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                            <span className="text-slate-500">{k}:</span> {v}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copy(l.full_url, l.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 text-slate-300"
                      aria-label="Copy"
                    >
                      {copiedId === l.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => del.mutate(l.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 text-red-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
