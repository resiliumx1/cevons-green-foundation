import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BarChart3, Globe2, MonitorSmartphone, LineChart, Search, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { CrmPage } from "@/components/motion/CrmMotion";
import { Panel, PanelEmpty, PanelError, PanelSkeleton, DocketStrip } from "@/components/admin/Manifest";
import { getSiteAnalytics, type ReportState, type SiteAnalytics } from "@/lib/siteAnalytics.functions";
import { getHistoricalSnapshot } from "@/lib/historicalSnapshot.functions";
import { landingPathname } from "@/lib/ces/contract";

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
 * Visitor figures come from Google Analytics and Google Search Console, read
 * server-side with a reporting account — the browser never sees a credential.
 * The two request panels read first-party rows from `service_requests`, real
 * outcomes of the website rather than page views, and say so in their copy.
 */

const FORM_DAYS = 30;
const PERIODS = [7, 28, 90] as const;

type RequestRow = {
  created_at: string;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
};

function useRequestActivity() {
  return useQuery({
    queryKey: ["admin-traffic-requests", FORM_DAYS],
    queryFn: async (): Promise<RequestRow[]> => {
      const since = new Date(Date.now() - FORM_DAYS * 86_400_000).toISOString();
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

function ReportNotice({ state, message }: { state: ReportState; message?: string }) {
  const headline =
    state === "unconfigured"
      ? "This report isn't set up yet."
      : state === "permission"
        ? "The reporting account can't read this property yet."
        : "This report is temporarily unavailable.";
  return (
    <div role="status" className="admin-state admin-state-empty items-start">
      <div>
        <p className="font-semibold">{headline}</p>
        {message && <p className="admin-state-detail">{message}</p>}
      </div>
    </div>
  );
}

/** Plain-language explanation of why Google Search shows nothing. */
function SearchDiagnostics({ d }: { d: NonNullable<SiteAnalytics["search"]["diagnostics"]> }) {
  const lines: string[] = [];
  if (d.verdict === "unconfigured") {
    lines.push("No Google Search property is set up for this site yet.");
  } else if (d.verdict === "property-missing") {
    lines.push(
      `The reporting account cannot see ${d.configuredProperty ?? "the configured property"}. It can see: ${
        d.availableProperties.join(", ") || "no properties at all"
      }.`,
    );
  } else if (d.verdict === "no-permission") {
    lines.push("The reporting account is not approved to read this property in Google Search Console.");
  } else if (d.verdict === "request-error") {
    lines.push("Google Search did not answer the request properly. This is a temporary problem on the connection.");
  } else {
    lines.push(
      `Google confirms the property ${d.configuredProperty ?? ""} and accepts the request, but returns no search rows at all.`,
    );
    lines.push("That means Google has recorded no clicks or appearances for this site yet — nothing was deleted.");
  }
  return (
    <div role="status" className="admin-state admin-state-empty items-start">
      <div>
        <p className="font-semibold">Why this is empty</p>
        {lines.map((l) => (
          <p key={l} className="admin-state-detail">{l}</p>
        ))}
        {d.windows.length > 0 && (
          <p className="admin-state-detail admin-mono">
            Checked:{" "}
            {d.windows
              .map((w) => `${w.days === 480 ? "16 months" : `${w.days} days`} → ${w.rowCount} rows (${w.status})`)
              .join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

function BarRow({ label, value, max, note }: { label: string; value: string | number; max: number; note?: string }) {
  const numeric = typeof value === "number" ? value : Number(value) || 0;
  const pct = max > 0 ? Math.round((numeric / max) * 100) : 0;
  return (
    <li className="flex items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--text)" }} title={label}>
        {label}
        {note && <span className="ml-2 text-xs" style={{ color: "var(--text-2)" }}>{note}</span>}
      </span>
      <span aria-hidden className="hidden h-2 w-32 overflow-hidden rounded-full sm:block" style={{ background: "var(--track)" }}>
        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: "var(--admin-orange)" }} />
      </span>
      <span className="admin-mono w-12 text-right" style={{ color: "var(--text-2)" }}>
        {value}
      </span>
    </li>
  );
}

const nf = new Intl.NumberFormat("en-US");
const pct1 = (v: number) => `${(v * 100).toFixed(1)}%`;

const dayLabel = (raw: string) => raw.slice(0, 10);

/**
 * Historical traffic — Lovable hosting snapshot.
 *
 * A fixed set of figures captured once on 11 September 2026 from the Lovable
 * hosting analytics for this project, kept so the earlier months are not lost.
 * It is a separate record: it is not live, it is not Google Analytics and it is
 * not Google Search, and its counts must never be added to those.
 */
function HistoricalSnapshotPanels() {
  const fetchSnapshot = useServerFn(getHistoricalSnapshot);
  const snap = useQuery({
    queryKey: ["admin-historical-snapshot"],
    queryFn: () => fetchSnapshot({ data: undefined as never }),
    staleTime: 60 * 60_000,
  });

  if (snap.isLoading) {
    return (
      <Panel title="Historical traffic — Lovable hosting snapshot" code="HST-01">
        <PanelSkeleton rows={3} />
      </Panel>
    );
  }
  if (snap.isError) {
    return (
      <Panel title="Historical traffic — Lovable hosting snapshot" code="HST-01">
        <PanelError what="the stored historical snapshot" error={snap.error} />
      </Panel>
    );
  }
  if (!snap.data) {
    return (
      <Panel title="Historical traffic — Lovable hosting snapshot" code="HST-01">
        <PanelEmpty headline="No historical snapshot has been stored for this website." />
      </Panel>
    );
  }

  const s = snap.data;
  const p = s.payload;
  const peakVisitors = Math.max(1, ...p.dailyVisitors.map((d) => d.value));
  const groups: Array<{ key: string; title: string; code: string }> = [
    { key: "page", title: "Snapshot — most-viewed pages", code: "HST-02" },
    { key: "source", title: "Snapshot — where visits came from", code: "HST-03" },
    { key: "device", title: "Snapshot — devices", code: "HST-04" },
    { key: "country", title: "Snapshot — countries", code: "HST-05" },
  ];

  return (
    <>
      <Panel title="Historical traffic — Lovable hosting snapshot" code="HST-01">
        <DocketStrip
          cells={[
            { code: "VIS", label: "Visits", value: nf.format(p.totals.visitors) },
            { code: "PVW", label: "Page views", value: nf.format(p.totals.pageviews) },
            { code: "PPV", label: "Views per visit", value: p.totals.pageviewsPerVisit.toFixed(2) },
            { code: "BNC", label: "Bounce rate", value: `${p.totals.bounceRate}%` },
          ]}
        />
        <p className="admin-note">
          <Archive className="h-4 w-4" aria-hidden />
          Source: {p.source}. Period asked for: {dayLabel(s.requestedStart)} to {dayLabel(s.requestedEnd)}.
          Captured once on {dayLabel(s.fetchedAt)} — these figures are fixed and do not update.
        </p>
        <p className="admin-note">
          Days actually returned: {s.coverage.buckets} between {dayLabel(s.coverage.firstBucket ?? "")} and{" "}
          {dayLabel(s.coverage.lastBucket ?? "")}. The provider included an 11 September day even though the
          period was asked to end at midnight on 11 September, so that day is partial.
        </p>
        <p className="admin-note">
          These counts are a separate record from Google Analytics and Google Search on this page. Do not add
          them together, and do not read the daily figures as separate people — the same person visiting on
          two days is counted on both.
        </p>
        <div className="admin-subhead">Visits per day (snapshot)</div>
        <div
          className="admin-spark"
          role="img"
          aria-label={`${p.totals.visitors} visits recorded across ${s.coverage.buckets} days in the stored snapshot`}
        >
          {p.dailyVisitors.map((d) => (
            <span
              key={d.date}
              className="admin-spark-bar"
              style={{ height: `${Math.max(3, Math.round((d.value / peakVisitors) * 100))}%` }}
              title={`${dayLabel(d.date)}: ${d.value} visits`}
            />
          ))}
        </div>
        <p className="admin-note">
          Average time on the site in this snapshot: {Math.round(p.totals.sessionDuration / 60)} min{" "}
          {p.totals.sessionDuration % 60}s.
        </p>
      </Panel>

      <div className="admin-grid-2">
        {groups.map((g) => {
          const b = p.breakdowns[g.key];
          return (
            <Panel key={g.key} title={g.title} code={g.code}>
              {!b || b.data.length === 0 ? (
                <PanelEmpty headline="This snapshot holds no figures for this breakdown." />
              ) : (
                <ul className="admin-bars">
                  {b.data.map((row) => (
                    <BarRow key={row.label} label={row.label} value={row.value} max={b.data[0].value} />
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}

function TrafficPage() {
  const [days, setDays] = useState<(typeof PERIODS)[number]>(28);
  const fetchAnalytics = useServerFn(getSiteAnalytics);

  const analytics = useQuery({
    queryKey: ["admin-site-analytics", days],
    queryFn: () => fetchAnalytics({ data: { days } }),
    staleTime: 5 * 60_000,
  });

  const { data: rows, isLoading, isError, error } = useRequestActivity();

  const byDay = (() => {
    if (!rows) return [] as Array<[string, number]>;
    const map = new Map<string, number>();
    for (let i = FORM_DAYS - 1; i >= 0; i--) {
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

  // Query strings and ad click ids stay stored on each request for
  // attribution; this summary groups them by page path only.
  const landing = rows ? tally(rows, (r) => landingPathname(r.landing_page)) : [];
  const sources = rows ? tally(rows, (r) => r.utm_source ?? r.referrer) : [];

  const ga = analytics.data?.ga;
  const gsc = analytics.data?.search;
  const gaOk = ga?.state === "ok" && ga.data;
  const gscOk = gsc?.state === "ok" && gsc.data;

  const gaPeak = Math.max(1, ...(gaOk ? ga.data!.daily.map((d) => d.value) : [0]));

  return (
    <CrmPage>
      <div className="admin-stack-lg">
        <header>
          <span className="admin-mono" style={{ color: "var(--text-2)" }}>Overview / Traffic</span>
          <h1 className="admin-display admin-h1">Traffic</h1>
          <p className="admin-lede">
            Visitor figures come from Google Analytics and Google Search. Request figures come from
            forms submitted on the website, in Georgetown time (UTC−4).
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Reporting period">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDays(p)}
                aria-pressed={days === p}
                className="admin-link-btn"
                style={
                  days === p
                    ? { background: "var(--admin-orange)", color: "#fff", borderColor: "var(--admin-orange)" }
                    : undefined
                }
              >
                Last {p} days
              </button>
            ))}
          </div>
        </header>

        <Panel title="Visitors" code="TRF-01">
          {analytics.isLoading ? (
            <PanelSkeleton rows={3} />
          ) : analytics.isError ? (
            <PanelError what="website analytics" error={analytics.error} />
          ) : !gaOk ? (
            <ReportNotice state={ga?.state ?? "error"} message={ga?.message} />
          ) : (
            <>
              <DocketStrip
                cells={[
                  { code: "SES", label: "Sessions", value: nf.format(ga.data!.totals.sessions) },
                  { code: "USR", label: "Visitors", value: nf.format(ga.data!.totals.users) },
                  { code: "PVW", label: "Page views", value: nf.format(ga.data!.totals.pageViews) },
                  { code: "BNC", label: "Bounce rate", value: pct1(ga.data!.totals.bounceRate) },
                ]}
              />
              {ga.data!.totals.sessions === 0 ? (
                <PanelEmpty headline={`Google Analytics recorded no visits in the last ${days} days.`} />
              ) : (
                <>
                  <p className="admin-note">
                    <Users className="h-4 w-4" aria-hidden /> Sessions per day, last {days} days.
                    Visitor counting started when the Google tag was installed, so earlier
                    periods show nothing because they were never measured.
                  </p>
                  <div className="admin-spark" role="img" aria-label={`${ga.data!.totals.sessions} sessions over the last ${days} days`}>
                    {ga.data!.daily.map((d) => (
                      <span
                        key={d.key}
                        className="admin-spark-bar"
                        style={{ height: `${Math.max(3, Math.round((d.value / gaPeak) * 100))}%` }}
                        title={`${d.key}: ${d.value}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Panel>

        <div className="admin-grid-2">
          <Panel title="Where visitors come from" code="TRF-02">
            <div className="admin-subhead">
              <Globe2 className="h-4 w-4" aria-hidden /> Sessions by channel
            </div>
            {analytics.isLoading ? (
              <PanelSkeleton rows={3} />
            ) : !gaOk ? (
              <ReportNotice state={ga?.state ?? "error"} message={ga?.message} />
            ) : ga.data!.channels.length === 0 ? (
              <PanelEmpty headline="No traffic sources were recorded for this period." />
            ) : (
              <ul className="admin-bars">
                {ga.data!.channels.map((c) => (
                  <BarRow key={c.key} label={c.key} value={c.value} max={ga.data!.channels[0].value} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Most-viewed pages" code="TRF-03">
            <div className="admin-subhead">
              <BarChart3 className="h-4 w-4" aria-hidden /> Page views
            </div>
            {analytics.isLoading ? (
              <PanelSkeleton rows={3} />
            ) : !gaOk ? (
              <ReportNotice state={ga?.state ?? "error"} message={ga?.message} />
            ) : ga.data!.pages.length === 0 ? (
              <PanelEmpty headline="No page views were recorded for this period." />
            ) : (
              <ul className="admin-bars">
                {ga.data!.pages.map((p) => (
                  <BarRow
                    key={p.key}
                    label={p.key}
                    value={p.value}
                    max={ga.data!.pages[0].value}
                    note={p.secondary ? `${Math.round(p.secondary)}s avg` : undefined}
                  />
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title="Google Search" code="TRF-04">
          {analytics.isLoading ? (
            <PanelSkeleton rows={3} />
          ) : !gscOk ? (
            <>
              <ReportNotice state={gsc?.state ?? "error"} message={gsc?.message} />
              {gsc?.diagnostics && <SearchDiagnostics d={gsc.diagnostics} />}
            </>
          ) : (
            <>
              <DocketStrip
                cells={[
                  { code: "CLK", label: "Clicks", value: nf.format(gsc.data!.totals.clicks) },
                  { code: "IMP", label: "Impressions", value: nf.format(gsc.data!.totals.impressions) },
                  { code: "CTR", label: "Click rate", value: pct1(gsc.data!.totals.ctr) },
                  { code: "POS", label: "Avg. position", value: gsc.data!.totals.position.toFixed(1) },
                ]}
              />
              <p className="admin-note">
                <Search className="h-4 w-4" aria-hidden /> {gsc.data!.range.startDate} to {gsc.data!.range.endDate}.
                Google Search data is always a couple of days behind.
              </p>
              {gsc.data!.queries.length === 0 ? (
                <>
                  <PanelEmpty headline="Google Search reported no searches for this period." />
                  {gsc?.diagnostics && <SearchDiagnostics d={gsc.diagnostics} />}
                </>
              ) : (
                <>
                  <div className="admin-subhead">Top searches</div>
                  <ul className="admin-bars">
                    {gsc.data!.queries.map((q) => (
                      <BarRow
                        key={q.key}
                        label={q.key}
                        value={q.clicks}
                        max={Math.max(1, gsc.data!.queries[0].clicks)}
                        note={`${nf.format(q.impressions)} shown · pos ${q.position.toFixed(1)}`}
                      />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </Panel>

        <Panel title="Devices" code="TRF-05">
          <div className="admin-subhead">
            <MonitorSmartphone className="h-4 w-4" aria-hidden /> Desktop, tablet and mobile split
          </div>
          {analytics.isLoading ? (
            <PanelSkeleton rows={3} />
          ) : !gaOk ? (
            <ReportNotice state={ga?.state ?? "error"} message={ga?.message} />
          ) : ga.data!.devices.length === 0 ? (
            <PanelEmpty headline="No device information was recorded for this period." />
          ) : (
            <ul className="admin-bars">
              {ga.data!.devices.map((d) => (
                <BarRow key={d.key} label={d.key} value={d.value} max={ga.data!.devices[0].value} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Form submissions over time"
          code="TRF-06"
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
          <Panel title="Landing pages of requests" code="TRF-07">
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

          <Panel title="Sources of requests" code="TRF-08">
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
      </div>
    </CrmPage>
  );
}
