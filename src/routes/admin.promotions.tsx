import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import { canPublish, useAdminIdentity } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { services } from "@/data/services";
import { APPROVED_PALETTES, PALETTE_STYLES } from "@/lib/pageSections";
import { PLACEMENTS, type Promotion } from "@/lib/promotions";
import { GEORGETOWN_LABEL, georgetownInputToUtc, georgetownLabel, utcToGeorgetownInput } from "@/lib/georgetown";

export const Route = createFileRoute("/admin/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PromotionsScreen,
});

const surface = { background: "var(--crm-surface)", borderColor: "var(--crm-border)" } as const;
const field = {
  background: "var(--crm-surface-muted)",
  borderColor: "var(--crm-border)",
  color: "var(--crm-text)",
} as const;

type Draft = {
  title: string;
  body: string;
  cta_label: string;
  cta_href: string;
  placement: string;
  target_services: string[];
  palette: string;
  starts_at: string;
  ends_at: string;
  published: boolean;
};

function toDraft(p?: Promotion): Draft {
  return {
    title: p?.title ?? "",
    body: p?.body ?? "",
    cta_label: p?.cta_label ?? "",
    cta_href: p?.cta_href ?? "",
    placement: p?.placement ?? "site_top_bar",
    target_services: p?.target_services ?? [],
    palette: p?.palette ?? "navy",
    starts_at: utcToGeorgetownInput(p?.starts_at ?? new Date().toISOString()),
    ends_at: utcToGeorgetownInput(p?.ends_at ?? null),
    published: p?.published ?? false,
  };
}

function liveNow(p: Promotion) {
  const now = Date.now();
  return (
    p.published &&
    new Date(p.starts_at).getTime() <= now &&
    (!p.ends_at || new Date(p.ends_at).getTime() > now)
  );
}

function PromotionsScreen() {
  const qc = useQueryClient();
  const { roles } = useAdminIdentity();
  const mayPublish = canPublish(roles);
  const [editing, setEditing] = useState<Promotion | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Promotion | null>(null);

  const q = useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Promotion[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "promotions"] });

  const del = useMutation({
    mutationFn: async (p: Promotion) => {
      const { error } = await supabase.from("promotions").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Promotion deleted");
      setConfirmDelete(null);
      refresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const rows = q.data ?? [];

  return (
    <CrmPage className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="admin-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--crm-text)" }}>
            Promotions
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--crm-text-muted)" }}>
            Scheduling is checked every time a visitor loads the page, so a promotion goes live and comes down exactly
            on its window — nothing depends on a job running. All times are {GEORGETOWN_LABEL}.
          </p>
        </div>
        <Button type="button" onClick={() => setEditing("new")} style={{ backgroundColor: "#EF7700", color: "#1A1A1A" }}>
          <Plus className="size-4 mr-1.5" /> New promotion
        </Button>
      </header>

      {q.isLoading ? (
        <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
          Loading…
        </p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border p-8 text-sm" style={{ ...surface, color: "var(--crm-text-muted)" }}>
          No promotions yet. Nothing extra is rendered on the public site.
        </div>
      ) : (
        <table className="admin-stack admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Placement</th>
              <th>Window</th>
              <th>State</th>
              <th>Clicks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td data-label="Title">{p.title}</td>
                <td data-label="Placement">
                  {PLACEMENTS.find((x) => x.value === p.placement)?.label ?? p.placement}
                  {p.target_services.length > 0 && (
                    <span className="admin-mono block" style={{ color: "var(--crm-text-muted)" }}>
                      {p.target_services.length} service{p.target_services.length === 1 ? "" : "s"}
                    </span>
                  )}
                </td>
                <td data-label="Window">
                  <span className="admin-mono">
                    {georgetownLabel(p.starts_at)} → {p.ends_at ? georgetownLabel(p.ends_at) : "no end"}
                  </span>
                </td>
                <td data-label="State">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={
                      liveNow(p)
                        ? { backgroundColor: "#2DA339", color: "#1A1A1A" }
                        : { backgroundColor: "var(--crm-surface-muted)", color: "var(--crm-text-muted)" }
                    }
                  >
                    {liveNow(p) ? "Live now" : p.published ? "Scheduled / ended" : "Draft"}
                  </span>
                </td>
                <td data-label="Clicks">{p.click_count}</td>
                <td data-label="Actions">
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    <button
                      type="button"
                      aria-label={`Delete ${p.title}`}
                      onClick={() => setConfirmDelete(p)}
                      className="min-h-[44px] min-w-[44px] grid place-items-center rounded focus:outline-none focus-visible:ring-2"
                      style={{ color: "var(--crm-text-muted)" }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <PromotionForm
          promotion={editing === "new" ? undefined : editing}
          mayPublish={mayPublish}
          onDone={() => {
            setEditing(null);
            refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the promotion “{confirmDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from the site immediately and its click count is lost. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && del.mutate(confirmDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete promotion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CrmPage>
  );
}

function PromotionForm({
  promotion,
  mayPublish,
  onDone,
  onCancel,
}: {
  promotion?: Promotion;
  mayPublish: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<Draft>(toDraft(promotion));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  async function save() {
    if (!d.title.trim()) {
      toast.error("Give the promotion a title.");
      return;
    }
    const startsAt = georgetownInputToUtc(d.starts_at) ?? new Date().toISOString();
    const endsAt = georgetownInputToUtc(d.ends_at);
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
      toast.error("The end time must be after the start time.");
      return;
    }
    const record = {
      title: d.title.trim(),
      body: d.body.trim() || null,
      cta_label: d.cta_label.trim() || null,
      cta_href: d.cta_href.trim() || null,
      placement: d.placement,
      target_services: d.target_services,
      palette: d.palette,
      starts_at: startsAt,
      ends_at: endsAt,
      published: mayPublish ? d.published : false,
    };
    setBusy(true);
    const { error } = promotion
      ? await supabase.from("promotions").update(record).eq("id", promotion.id)
      : await supabase.from("promotions").insert(record);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(promotion ? "Promotion saved." : "Promotion created.");
    onDone();
  }

  const paletteStyle = PALETTE_STYLES[(d.palette as keyof typeof PALETTE_STYLES) ?? "navy"] ?? PALETTE_STYLES.navy;

  return (
    <section className="rounded-xl border p-4 space-y-4" style={surface}>
      <h2 className="admin-display text-[18px] font-bold" style={{ color: "var(--crm-text)" }}>
        {promotion ? "Edit promotion" : "New promotion"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label style={{ color: "var(--crm-text)" }}>Title</Label>
          <Input value={d.title} onChange={(e) => set("title", e.target.value)} style={field} />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: "var(--crm-text)" }}>Placement</Label>
          <select
            value={d.placement}
            onChange={(e) => set("placement", e.target.value)}
            className="w-full min-h-[44px] rounded-lg border px-3 text-sm"
            style={field}
          >
            {PLACEMENTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="admin-mono" style={{ color: "var(--crm-text-muted)" }}>
            {PLACEMENTS.find((p) => p.value === d.placement)?.hint}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: "var(--crm-text)" }}>Body</Label>
        <Textarea rows={2} value={d.body} onChange={(e) => set("body", e.target.value)} style={field} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label style={{ color: "var(--crm-text)" }}>Button label</Label>
          <Input value={d.cta_label} onChange={(e) => set("cta_label", e.target.value)} style={field} />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: "var(--crm-text)" }}>Button link</Label>
          <Input
            value={d.cta_href}
            onChange={(e) => set("cta_href", e.target.value)}
            placeholder="/request-service"
            style={field}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label style={{ color: "var(--crm-text)" }}>Colour combination</Label>
        <div className="flex flex-wrap gap-2">
          {APPROVED_PALETTES.map((p) => {
            const s = PALETTE_STYLES[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => set("palette", p)}
                aria-pressed={d.palette === p}
                className="min-h-[44px] rounded-lg px-4 text-[12px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: s.fill,
                  color: s.text,
                  outline: d.palette === p ? "2px solid var(--crm-text)" : "none",
                  outlineOffset: 2,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <p className="admin-mono" style={{ color: "var(--crm-text-muted)" }}>
          Only combinations that pass contrast are offered — there is deliberately no free colour picker.
        </p>
      </div>

      {d.placement === "service_hero" && (
        <div className="space-y-1.5">
          <Label style={{ color: "var(--crm-text)" }}>Target services</Label>
          <p className="admin-mono" style={{ color: "var(--crm-text-muted)" }}>
            Choose none to show on every service page.
          </p>
          <div className="grid gap-1 sm:grid-cols-2 max-h-64 overflow-auto rounded-lg border p-2" style={field}>
            {services.map((s) => {
              const checked = d.target_services.includes(s.slug);
              return (
                <label key={s.slug} className="flex items-center gap-2 text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      set(
                        "target_services",
                        e.target.checked
                          ? [...d.target_services, s.slug]
                          : d.target_services.filter((x) => x !== s.slug),
                      )
                    }
                  />
                  <span>{s.title}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label style={{ color: "var(--crm-text)" }}>Starts — {GEORGETOWN_LABEL}</Label>
          <Input
            type="datetime-local"
            value={d.starts_at}
            onChange={(e) => set("starts_at", e.target.value)}
            style={field}
          />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: "var(--crm-text)" }}>Ends — {GEORGETOWN_LABEL} (optional)</Label>
          <Input
            type="datetime-local"
            value={d.ends_at}
            onChange={(e) => set("ends_at", e.target.value)}
            style={field}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm" style={{ color: "var(--crm-text)" }}>
        <input
          type="checkbox"
          checked={d.published}
          disabled={!mayPublish}
          onChange={(e) => set("published", e.target.checked)}
        />
        Published — shows on the site inside its window
      </label>
      {!mayPublish && (
        <p className="admin-mono" style={{ color: "var(--crm-text-muted)" }}>
          Your role can save promotions but not publish them.
        </p>
      )}

      <div className="rounded-xl p-4" style={{ backgroundColor: paletteStyle.fill, color: paletteStyle.text }}>
        <p className="font-bold">{d.title || "Preview of the promotion"}</p>
        {d.body && <p className="text-sm mt-1">{d.body}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => void save()} style={{ backgroundColor: "#EF7700", color: "#1A1A1A" }}>
          {busy && <Loader2 className="size-4 mr-1.5 animate-spin" />} Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
