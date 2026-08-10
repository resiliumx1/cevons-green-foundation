import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Image as ImageIcon, Inbox, ShieldAlert } from "lucide-react";
import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";
import {
  DocketStrip,
  Panel,
  PanelEmpty,
  PanelError,
  PanelSkeleton,
  georgetownStamp,
  timeAgo,
  type DocketCell,
} from "@/components/admin/Manifest";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Dashboard,
});

const DAY = 24 * 60 * 60 * 1000;

/* ── Real queries only. No analytics provider is connected, so anything
      about traffic, visitors, conversion or load time is reported as
      unavailable rather than estimated. ─────────────────────────────── */

async function fetchDocketData() {
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY).toISOString();
  const since60 = new Date(now - 60 * DAY).toISOString();

  const count = (q: { count: number | null; error: unknown }) => {
    if (q.error) throw q.error;
    return q.count ?? 0;
  };

  const [req30, reqPrev, open, msg30, msgPrev, mediaPub] = await Promise.all([
    supabase.from("service_requests").select("id", { count: "exact", head: true }).gte("created_at", since30),
    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since60)
      .lt("created_at", since30),
    supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).gte("created_at", since30),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since60)
      .lt("created_at", since30),
    supabase.from("media_posts").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  return {
    requests30: count(req30),
    requestsPrev30: count(reqPrev),
    openRequests: count(open),
    messages30: count(msg30),
    messagesPrev30: count(msgPrev),
    mediaPublished: count(mediaPub),
  };
}

function delta(curr: number, prev: number, unit: string) {
  const diff = curr - prev;
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const sign = diff > 0 ? "+" : "";
  return {
    delta: `${sign}${diff} ${unit} vs previous 30 days`,
    deltaDirection: direction as "up" | "down" | "flat",
  };
}

function Dashboard() {
  const docket = useQuery({ queryKey: ["admin", "docket"], queryFn: fetchDocketData });

  const d = docket.data;
  const cells: DocketCell[] = [
    {
      code: "D-01",
      label: "Requests · 30 days",
      value: d?.requests30,
      ...(d ? delta(d.requests30, d.requestsPrev30, "requests") : {}),
    },
    {
      code: "D-02",
      label: "Messages · 30 days",
      value: d?.messages30,
      ...(d ? delta(d.messages30, d.messagesPrev30, "messages") : {}),
    },
    {
      code: "D-03",
      label: "Requests awaiting action",
      value: d?.openRequests,
      delta: d ? "Status still marked new" : undefined,
      deltaDirection: "flat",
    },
    {
      code: "D-04",
      label: "Published media",
      value: d?.mediaPublished,
      delta: d ? "Live on the public site" : undefined,
      deltaDirection: "flat",
    },
  ];

  return (
    <CrmPage className="space-y-6">
      <header className="space-y-1">
        <p className="admin-mono" style={{ color: "var(--text-2)" }}>
          {georgetownStamp(new Date())} · Georgetown, UTC−4
        </p>
        <h1 className="admin-display" style={{ fontSize: 30, fontWeight: 800, color: "var(--text)" }}>
          Dashboard
        </h1>
      </header>

      {docket.isError ? (
        <PanelError what="the key figures" error={docket.error} />
      ) : (
        <DocketStrip cells={cells} loading={docket.isLoading} />
      )}

      <p className="admin-mono" style={{ color: "var(--text-2)" }}>
        Website traffic, visitors and conversion are not shown — no analytics provider is connected yet.
      </p>

      <div className="grid gap-5 xl:grid-cols-2">
        <LatestRequests />
        <MediaAtAGlance />
      </div>

      <NeedsAttention />
    </CrmPage>
  );
}

/* ── Latest requests ───────────────────────────────────────────────────── */

function LatestRequests() {
  const q = useQuery({
    queryKey: ["admin", "latest-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("id, reference, service, category, region, created_at, status")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Panel
      title="Latest requests"
      code="P-01"
      action={
        <Link to="/admin/leads" className="admin-link-btn">
          Open leads <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      }
    >
      {q.isLoading ? (
        <PanelSkeleton rows={4} />
      ) : q.isError ? (
        <PanelError what="the latest requests" error={q.error} />
      ) : q.data.length === 0 ? (
        <PanelEmpty
          headline="No service requests have come in yet. The booking wizard on the public site feeds this list."
          action={
            <Link to="/request-service" className="admin-link-btn">
              View the booking wizard <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
      ) : (
        <table className="admin-stack admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Service</th>
              <th>Branch</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {q.data.map((r) => (
              <tr key={r.id}>
                <td data-label="Reference">
                  <Link to="/admin/leads/$id" params={{ id: r.id }} className="admin-mono admin-link">
                    {r.reference}
                  </Link>
                </td>
                <td data-label="Service">{r.service ?? r.category ?? "—"}</td>
                <td data-label="Branch">{r.region ?? "Not stated"}</td>
                <td data-label="Received" title={georgetownStamp(r.created_at)}>
                  {timeAgo(r.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

/* ── Media at a glance ─────────────────────────────────────────────────── */

type MediaRow = {
  id: string;
  kind: string;
  title: string;
  caption: string | null;
  published: boolean;
  image_w: number | null;
  image_h: number | null;
};

function useMediaPosts() {
  return useQuery({
    queryKey: ["admin", "media-posts"],
    queryFn: async (): Promise<MediaRow[]> => {
      const { data, error } = await supabase
        .from("media_posts")
        .select("id, kind, title, caption, published, image_w, image_h");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function MediaAtAGlance() {
  const q = useMediaPosts();
  const rows = q.data ?? [];
  const kinds: Array<{ key: string; label: string }> = [
    { key: "slide", label: "Homepage slides" },
    { key: "gallery", label: "Gallery images" },
    { key: "announcement", label: "Announcements" },
  ];

  return (
    <Panel
      title="Media at a glance"
      code="P-02"
      action={
        <Link to="/admin/media" className="admin-link-btn">
          Manage media <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      }
    >
      {q.isLoading ? (
        <PanelSkeleton rows={3} />
      ) : q.isError ? (
        <PanelError what="the media counts" error={q.error} />
      ) : rows.length === 0 ? (
        <PanelEmpty
          headline="Nothing has been uploaded yet. Add a homepage slide, a gallery image or an announcement to get started."
          action={
            <Link to="/admin/media" className="admin-link-btn">
              <ImageIcon className="h-4 w-4" aria-hidden /> Upload the first item
            </Link>
          }
        />
      ) : (
        <table className="admin-stack admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Published</th>
              <th>Draft</th>
            </tr>
          </thead>
          <tbody>
            {kinds.map((k) => {
              const of = rows.filter((r) => r.kind === k.key);
              return (
                <tr key={k.key}>
                  <td data-label="Type">{k.label}</td>
                  <td data-label="Published">{of.filter((r) => r.published).length}</td>
                  <td data-label="Draft">{of.filter((r) => !r.published).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

/* ── Needs attention — only checks that can actually be run ────────────── */

function NeedsAttention() {
  const q = useMediaPosts();
  const rows = q.data ?? [];

  const issues: Array<{ id: string; text: string }> = [];
  for (const r of rows) {
    if (!r.title?.trim()) {
      issues.push({ id: `${r.id}-title`, text: `A ${r.kind} has no title.` });
    }
    if (r.kind === "announcement" && !r.caption?.trim()) {
      issues.push({ id: `${r.id}-caption`, text: `Announcement “${r.title || "untitled"}” has no caption, so it renders as a heading with nothing under it.` });
    }
    if (r.kind === "slide" && r.published && r.image_w && r.image_h && r.image_h > r.image_w) {
      issues.push({
        id: `${r.id}-portrait`,
        text: `Published slide “${r.title || "untitled"}” is a portrait photo — it shows with blurred side fills in the hero.`,
      });
    }
  }

  return (
    <Panel
      title="Needs attention"
      code="P-03"
      action={
        <Link to="/admin/media" className="admin-link-btn">
          Fix in media <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      }
    >
      {q.isLoading ? (
        <PanelSkeleton rows={2} />
      ) : q.isError ? (
        <PanelError what="the content checks" error={q.error} />
      ) : issues.length === 0 ? (
        <PanelEmpty headline="Every media item has a title and a caption, and no published slide is portrait. Nothing needs fixing right now." />
      ) : (
        <ul className="space-y-2">
          {issues.map((i) => (
            <li key={i.id} className="admin-issue">
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="admin-mono mt-4" style={{ color: "var(--text-2)" }}>
        <Inbox className="mr-1 inline h-3 w-3" aria-hidden />
        Checks run against media_posts only. Traffic and performance checks need an analytics provider.
      </p>
    </Panel>
  );
}
