import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Globe2, MonitorSmartphone, LineChart, Plug } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { CrmPage } from "@/components/motion/CrmMotion";
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from "@/components/admin/Manifest";

export const Route = createFileRoute("/admin/traffic")({
  head: () => ({
    meta: [
      { title: "Traffic | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TrafficPage,
});

/**
 * Traffic.
 *
 * There is NO analytics provider connected to this website. Nothing on this
 * screen may invent a visitor number. The three analytics sections render an
 * honest "not connected" state describing what connecting will enable.
 *
 * The two panels that DO show figures read first-party rows from
 * `service_requests` — real outcomes of the website, not page views — and say
 * so in their own copy.
 */

const DAYS = 30;

type RequestRow = {
  created_at: string;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
};

function useRequestActivity() {
  return useQuery({
    queryKey: ["admin-traffic-requests", DAYS],
    queryFn: async (): Promise<RequestRow[]> => {
      const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("service_requests")
        .select("created_at, landing_page, referrer, utm_source")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RequestRow[];
    },
  });
}

/** Georgetown is UTC−4 with no DST, so a fixed shift gives the local day. */
function georgetownDayKey(iso: string): string {
  return new Date(new Date(iso).getTime() - 4 * 3_600_000).toISOString().slice(0, 10);
}

function tally(rows: RequestRow[], pick: (r: RequestRow) => string | null) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const raw = pick(r);
    const key = raw && raw.trim() ? raw.trim() : null;
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function NotConnected({ what, enables }: { what: string; enables: string }) {
  return (
    <div className="admin-state admin-state-empty items-start">
      <Plug className="h-4 w-4 shrink-0" aria-hidden style={{ marginTop: 3, color: "var(--admin-orange)" }} />
      <div>
        <p className="font-semibold">No analytics provider is connected yet.</p>
        <p className="admin-state-detail">
          {what} needs a page-analytics provider on the public website. Once one is connected, {enables}
        </p>
      </div>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li className="flex items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--text)" }} title={label}>
        {label}
      </span>
      <span aria-hidden className="hidden h-2 w-32 overflow-hidden rounded-full sm:block" style={{ background: "var(--track)" }}>
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: "var(--admin-orange)" }} />
      </span>
      <span className="admin-mono w-8 text-right" style={{ color: "var(--text-2)" }}>
        {value}
      </span>
    </li>
  );
}

function TrafficPage() {
  const { data: rows, isLoading, isError, error } = useRequestActivity();

  const byDay = (() => {
    if (!rows) return [] as Array<[string, number]>;
    const map = new Map<string, number>();
    for (let i = DAYS - 1; i >= 0; i--) {
      map.set(georgetownDayKey(new Date(Date.now() - i * 86_400_000).toISOString()), 0);
    }
    for (const r of rows) {
      const k = georgetownDayKey(r.created_at);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()];
  })();

  const peak = Math.max(1, ...byDay.map(([, n]) => n));
  const total = byDay.reduce((a, [, n]) => a + n, 0);

  const landing = rows ? tally(rows, (r) => r.landing_page) : [];
  const sources = rows ? tally(rows, (r) => r.utm_source ?? r.referrer) : [];

  return (
    <CrmPage>
      <div className="admin-stack-lg">
        <header>
          <span className="admin-mono" style={{ color: "var(--text-2)" }}>Overview / Traffic</span>
          <h1 className="admin-display admin-h1">Traffic</h1>
          <p className="admin-lede">
            Page analytics are not connected. Everything shown below with a figure comes from forms submitted
            on the website, in Georgetown time (UTC−4).
          </p>
        </header>

        <Panel title="Visitors over time" code="TRF-01">
          <NotConnected
            what="A visitors-over-time chart"
            enables="this panel will show sessions and unique visitors per day, with period comparison."
          />
        </Panel>

        <Panel
          title="Form submissions over time"
          code="TRF-02"
          action={<Link to="/admin/leads" className="admin-link-btn">Open Requests</Link>}
        >
          {isLoading ? (
            <PanelSkeleton rows={4} />
          ) : isError ? (
            <PanelError what="form submissions" error={error} />
          ) : total === 0 ? (
            <PanelEmpty
              headline="No requests have come in during the last 30 days. Share the request form to start collecting them."
              action={<Link to="/admin/promotions" className="admin-link-btn">Run a promotion</Link>}
            />
          ) : (
            <>
              <p className="admin-note">
                <LineChart className="h-4 w-4" aria-hidden /> {total} request{total === 1 ? "" : "s"} in the last 30 days.
                First-party form data, not page analytics.
              </p>
              <div className="admin-spark" role="img" aria-label={`${total} requests over the last 30 days`}>
                {byDay.map(([day, n]) => (
                  <span
                    key={day}
                    className="admin-spark-bar"
                    style={{ height: `${Math.max(3, Math.round((n / peak) * 100))}%` }}
                    title={`${day}: ${n}`}
                  />
                ))}
              </div>
            </>
          )}
        </Panel>

        <div className="admin-grid-2">
          <Panel title="Top pages" code="TRF-03">
            <NotConnected
              what="Ranking your most-viewed pages"
              enables="this panel will list pages by views, average time and exit rate."
            />
            <div className="admin-subhead">
              <BarChart3 className="h-4 w-4" aria-hidden /> Landing pages of submitted requests
            </div>
            {isLoading ? (
              <PanelSkeleton rows={3} />
            ) : isError ? (
              <PanelError what="landing pages" error={error} />
            ) : landing.length === 0 ? (
              <PanelEmpty headline="No landing page was recorded on recent requests yet." />
            ) : (
              <ul className="admin-bars">
                {landing.map(([label, n]) => (
                  <BarRow key={label} label={label} value={n} max={landing[0][1]} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Referrers" code="TRF-04">
            <NotConnected
              what="A full referrer breakdown"
              enables="this panel will show which search engines, social platforms and sites send visitors."
            />
            <div className="admin-subhead">
              <Globe2 className="h-4 w-4" aria-hidden /> Sources recorded on submitted requests
            </div>
            {isLoading ? (
              <PanelSkeleton rows={3} />
            ) : isError ? (
              <PanelError what="referrers" error={error} />
            ) : sources.length === 0 ? (
              <PanelEmpty headline="No referrer or campaign source was recorded on recent requests yet." />
            ) : (
              <ul className="admin-bars">
                {sources.map(([label, n]) => (
                  <BarRow key={label} label={label} value={n} max={sources[0][1]} />
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title="Devices" code="TRF-05">
          <div className="admin-subhead">
            <MonitorSmartphone className="h-4 w-4" aria-hidden /> Desktop, tablet and mobile split
          </div>
          <NotConnected
            what="A device breakdown"
            enables="this panel will show the desktop, tablet and mobile split, plus browser and screen widths."
          />
        </Panel>
      </div>
    </CrmPage>
  );
}
