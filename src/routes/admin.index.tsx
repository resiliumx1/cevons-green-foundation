import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { PullToRefresh } from "@/components/admin/PullToRefresh";
import {
  ArrowRight,
  Image as ImageIcon,
  Inbox,
  ShieldAlert,
  FileText,
  Mail,
  Truck,
  Megaphone,
  Users,
  Layers,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CrmPage } from "@/components/motion/CrmMotion";
import { georgetownLabel } from "@/lib/georgetown";
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
  const qc = useQueryClient();
  const docket = useQuery({ queryKey: ["admin", "docket"], queryFn: fetchDocketData });

  const refreshAll = useCallback(
    () => qc.refetchQueries({ queryKey: ["admin"], type: "active" }),
    [qc],
  );

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
    <PullToRefresh onRefresh={refreshAll}>
    <CrmPage className="space-y-5 sm:space-y-6">
      <header className="space-y-1">
        <p className="admin-mono truncate" style={{ color: "var(--text-2)" }}>
          {georgetownStamp(new Date())} · Georgetown, UTC−4
        </p>
        <h1
          className="admin-display text-[24px] sm:text-[30px]"
          style={{ fontWeight: 800, color: "var(--text)" }}
        >
          Dashboard
        </h1>
        <p className="text-[13px] sm:text-sm" style={{ color: "var(--text-2)" }}>
          Everything you can change on cevons.com, in one place. Start with a shortcut below.
        </p>
      </header>

      <Shortcuts openRequests={d?.openRequests} />

      {docket.isError ? (
        <PanelError what="the key figures" error={docket.error} />
      ) : (
        <DocketStrip cells={cells} loading={docket.isLoading} />
      )}

      <p className="admin-mono" style={{ color: "var(--text-2)" }}>
        Website traffic, visitors and conversion are not shown — no analytics provider is connected yet.
      </p>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
        <RecentActivity />
        <LatestRequests />
      </div>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
        <MediaAtAGlance />
        <GoingLiveNext />
      </div>

      <NeedsAttention />
    </CrmPage>
  );
}

/* ── Shortcuts — the main admin tasks, one tap away ────────────────────── */

type Shortcut = {
  to: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  count?: number;
};

function Shortcuts({ openRequests }: { openRequests?: number }) {
  const unread = useQuery({
    queryKey: ["admin", "unread-messages"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      if (error) throw error;
      return count ?? 0;
    },
  });

  const items: Shortcut[] = [
    { to: "/admin/pages", icon: FileText, title: "Edit a page", sub: "Change wording on any public page" },
    { to: "/admin/images", icon: ImageIcon, title: "Replace a photo", sub: "Swap any image on the site" },
    {
      to: "/admin/leads",
      icon: Truck,
      title: "Service requests",
      sub: "Bookings from the request wizard",
      ...(openRequests ? { count: openRequests } : {}),
    },
    {
      to: "/admin/messages",
      icon: Mail,
      title: "Messages",
      sub: "Contact-form enquiries",
      ...(unread.data ? { count: unread.data } : {}),
    },
    { to: "/admin/media", icon: Upload, title: "Media library", sub: "Slides, gallery and announcements" },
    { to: "/admin/promotions", icon: Megaphone, title: "Promotions", sub: "Schedule an offer or notice" },
    { to: "/admin/people", icon: Users, title: "People", sub: "Invite teammates and set roles" },
    { to: "/admin/audit", icon: Layers, title: "Activity log", sub: "Who changed what, and when" },
  ];

  return (
    <section aria-labelledby="admin-shortcuts-heading" className="space-y-3">
      <h2 id="admin-shortcuts-heading" className="admin-mono" style={{ color: "var(--text-2)" }}>
        Quick actions
      </h2>
      <div className="admin-shortcuts">
        {items.map(({ to, icon: Icon, title, sub, count }) => (
          <Link key={to} to={to} className="admin-shortcut">
            <span className="admin-shortcut-icon">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="admin-shortcut-title block">{title}</span>
              <span className="admin-shortcut-sub block">{sub}</span>
            </span>
            {count ? (
              <span className="admin-shortcut-count" aria-label={`${count} awaiting attention`}>
                {count}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Recent activity — a single merged, real feed ──────────────────────── */

type ActivityItem = {
  id: string;
  at: string;
  text: string;
  meta: string;
  icon: LucideIcon;
  to?: { path: "/admin/leads/$id"; id: string } | { path: "/admin/messages" | "/admin/media" };
};

function RecentActivity() {
  const q = useQuery({
    queryKey: ["admin", "recent-activity"],
    queryFn: async (): Promise<ActivityItem[]> => {
      const [requests, messages, media] = await Promise.all([
        supabase
          .from("service_requests")
          .select("id, reference, name, service, status, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("contact_messages")
          .select("id, name, subject, status, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("media_posts")
          .select("id, title, kind, published, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      if (requests.error) throw requests.error;
      if (messages.error) throw messages.error;
      if (media.error) throw media.error;

      const items: ActivityItem[] = [
        ...(requests.data ?? []).map((r) => ({
          id: `r-${r.id}`,
          at: r.created_at as string,
          text: `${r.name ?? "Someone"} requested ${r.service ?? "a service"}`,
          meta: `Request ${r.reference ?? ""} · ${r.status}`,
          icon: Truck,
          to: { path: "/admin/leads/$id" as const, id: r.id },
        })),
        ...(messages.data ?? []).map((m) => ({
          id: `m-${m.id}`,
          at: m.created_at as string,
          text: `${m.name} sent a message${m.subject ? `: ${m.subject}` : ""}`,
          meta: `Contact form · ${m.status}`,
          icon: Mail,
          to: { path: "/admin/messages" as const },
        })),
        ...(media.data ?? []).map((p) => ({
          id: `p-${p.id}`,
          at: p.created_at as string,
          text: `${p.published ? "Published" : "Drafted"} “${p.title || "untitled"}”`,
          meta: `Media · ${p.kind}`,
          icon: ImageIcon,
          to: { path: "/admin/media" as const },
        })),
      ];

      return items
        .filter((i) => !!i.at)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 8);
    },
  });

  const items = q.data ?? [];

  return (
    <Panel
      title="Recent activity"
      code="P-00"
      action={
        <Link to="/admin/audit" className="admin-link-btn">
          Full log <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      }
    >
      {q.isLoading ? (
        <PanelSkeleton rows={5} />
      ) : q.isError ? (
        <PanelError what="recent activity" error={q.error} />
      ) : items.length === 0 ? (
        <PanelEmpty headline="Nothing has happened yet. New requests, messages and media changes show up here as they land." />
      ) : (
        <ul className="admin-feed">
          {items.map((i) => {
            const Icon = i.icon;
            const body = (
              <>
                <span className="admin-feed-icon">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="admin-feed-text block">{i.text}</span>
                  <span className="admin-feed-meta block" title={georgetownStamp(i.at)}>
                    {i.meta} · {timeAgo(i.at)}
                  </span>
                </span>
              </>
            );
            return (
              <li key={i.id} className="admin-feed-item">
                {i.to && "id" in i.to ? (
                  <Link
                    to="/admin/leads/$id"
                    params={{ id: i.to.id }}
                    className="flex min-w-0 flex-1 items-start gap-3"
                  >
                    {body}
                  </Link>
                ) : i.to ? (
                  <Link to={i.to.path} className="flex min-w-0 flex-1 items-start gap-3">
                    {body}
                  </Link>
                ) : (
                  <span className="flex min-w-0 flex-1 items-start gap-3">{body}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
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

  const rows = q.data ?? [];

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
      ) : rows.length === 0 ? (
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
            {rows.map((r) => (
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


/* ── Going live next — genuinely scheduled items only ──────────────────── */

type ScheduledRow = { id: string; label: string; kind: string; at: string };

function GoingLiveNext() {
  const q = useQuery({
    queryKey: ["admin", "going-live-next"],
    queryFn: async (): Promise<ScheduledRow[]> => {
      const nowIso = new Date().toISOString();
      const [media, promos, sections] = await Promise.all([
        supabase
          .from("media_posts")
          .select("id, title, kind, publish_at")
          .eq("published", true)
          .gt("publish_at", nowIso)
          .order("publish_at", { ascending: true })
          .limit(10),
        supabase
          .from("promotions")
          .select("id, title, starts_at")
          .eq("published", true)
          .gt("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(10),
        supabase
          .from("page_sections")
          .select("id, kind, updated_at, payload, draft_payload, published")
          .limit(50),
      ]);
      if (media.error) throw media.error;
      if (promos.error) throw promos.error;
      if (sections.error) throw sections.error;

      const rows: ScheduledRow[] = [
        ...(media.data ?? []).map((m) => ({
          id: `m-${m.id}`,
          label: m.title || "Untitled media",
          kind: `Media · ${m.kind}`,
          at: m.publish_at as string,
        })),
        ...(promos.data ?? []).map((p) => ({
          id: `p-${p.id}`,
          label: p.title,
          kind: "Promotion",
          at: p.starts_at as string,
        })),
      ];
      return rows.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()).slice(0, 8);
    },
  });

  const rows = q.data ?? [];

  return (
    <Panel
      title="Going live next"
      code="P-04"
      action={
        <Link to="/admin/promotions" className="admin-link-btn">
          Promotions <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      }
    >
      {q.isLoading ? (
        <PanelSkeleton rows={2} />
      ) : q.isError ? (
        <PanelError what="the schedule" error={q.error} />
      ) : rows.length === 0 ? (
        <PanelEmpty headline="Nothing is scheduled ahead. Media items and promotions with a future start time appear here." />
      ) : (
        <table className="admin-stack admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Goes live</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-label="Item">{r.label}</td>
                <td data-label="Type">{r.kind}</td>
                <td data-label="Goes live" className="admin-mono">{georgetownLabel(r.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}
