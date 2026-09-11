/**
 * Server-only Google reporting helpers.
 *
 * Reads GA4 (Data API) and Search Console (Search Analytics API) with a
 * service account. The credential never leaves this file's runtime: no value
 * is returned to the browser, logged, or embedded in an error message.
 *
 * Read-only by design — the only scopes requested are the two `.readonly`
 * scopes below.
 */

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
].join(" ");

export class AnalyticsConfigError extends Error {}
export class AnalyticsPermissionError extends Error {}

function b64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

type Credential = { clientEmail: string; privateKey: string };

function readCredential(): Credential {
  const raw = process.env["GOOGLE_SERVICE_ACCOUNT_KEY"];
  const email = process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"];
  if (!raw) throw new AnalyticsConfigError("Google service account key is not configured.");

  let privateKey = raw.trim();
  let clientEmail = (email ?? "").trim();

  if (privateKey.startsWith("{")) {
    try {
      const parsed = JSON.parse(privateKey) as { private_key?: string; client_email?: string };
      privateKey = String(parsed.private_key ?? "");
      clientEmail = clientEmail || String(parsed.client_email ?? "");
    } catch {
      throw new AnalyticsConfigError("Google service account key is not valid JSON.");
    }
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  if (!privateKey.includes("PRIVATE KEY") || !clientEmail) {
    throw new AnalyticsConfigError("Google service account credentials are incomplete.");
  }
  return { clientEmail, privateKey };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const { clientEmail, privateKey } = readCredential();
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claim}`),
  );
  const assertion = `${header}.${claim}.${b64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    // Body can echo the assertion; never surface it.
    throw new AnalyticsPermissionError(
      `Google rejected the service account sign-in (${res.status}).`,
    );
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new AnalyticsPermissionError("Google returned no access token.");
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return json.access_token;
}

async function googleFetch(url: string, body: unknown): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  void 0;
  if (res.status === 401 || res.status === 403) {
    throw new AnalyticsPermissionError(
      "The reporting account does not have access to this Google property yet.",
    );
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

/* ── GA4 ─────────────────────────────────────────────────────────────── */

export type GaRow = { key: string; value: number; secondary?: number };

function propertyId(): string {
  const id = (process.env["GA4_PROPERTY_ID"] ?? "").trim().replace(/^properties\//, "");
  if (!id) throw new AnalyticsConfigError("The GA4 property is not configured.");
  return id;
}

export async function runGa4Report(days: number) {
  const property = propertyId();
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:batchRunReports`;
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];

  const json = await googleFetch(url, {
    requests: [
      {
        dateRanges,
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
        ],
      },
      {
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 400,
      },
      {
        dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      },
      {
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "averageSessionDuration" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 8,
      },
      {
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 5,
      },
    ],
  });

  const reports: any[] = json.reports ?? [];
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const totalsRow = reports[0]?.rows?.[0]?.metricValues ?? [];
  const rowsOf = (r: any, valueIndex = 0, secondIndex?: number): GaRow[] =>
    (r?.rows ?? []).map((row: any) => ({
      key: String(row.dimensionValues?.[0]?.value ?? ""),
      value: num(row.metricValues?.[valueIndex]?.value),
      ...(secondIndex !== undefined
        ? { secondary: num(row.metricValues?.[secondIndex]?.value) }
        : {}),
    }));

  return {
    totals: {
      sessions: num(totalsRow[0]?.value),
      users: num(totalsRow[1]?.value),
      pageViews: num(totalsRow[2]?.value),
      bounceRate: num(totalsRow[3]?.value),
    },
    daily: rowsOf(reports[1]),
    channels: rowsOf(reports[2]),
    pages: rowsOf(reports[3], 0, 1),
    devices: rowsOf(reports[4]),
  };
}

/* ── Search Console ──────────────────────────────────────────────────── */

function siteUrl(): string {
  const site = (process.env["SEARCH_CONSOLE_SITE_URL"] ?? "").trim();
  if (!site) throw new AnalyticsConfigError("The Search Console property is not configured.");
  return site;
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

export async function runSearchConsoleReport(days: number) {
  const site = siteUrl();
  const base = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  // Search Console data lags ~2 days; ask for a window that ends there.
  const range = { startDate: isoDaysAgo(days + 2), endDate: isoDaysAgo(2) };

  const [totals, queries, pages] = await Promise.all([
    googleFetch(base, { ...range, dimensions: [], rowLimit: 1 }),
    googleFetch(base, { ...range, dimensions: ["query"], rowLimit: 10 }),
    googleFetch(base, { ...range, dimensions: ["page"], rowLimit: 10 }),
  ]);

  type ScRow = { key: string; clicks: number; impressions: number; ctr: number; position: number };
  const mapRows = (json: any): ScRow[] =>
    (json.rows ?? []).map((r: any) => ({
      key: String(r.keys?.[0] ?? ""),
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr: Number(r.ctr ?? 0),
      position: Number(r.position ?? 0),
    }));

  const t = totals.rows?.[0];
  return {
    site,
    range,
    totals: {
      clicks: Number(t?.clicks ?? 0),
      impressions: Number(t?.impressions ?? 0),
      ctr: Number(t?.ctr ?? 0),
      position: Number(t?.position ?? 0),
    },
    queries: mapRows(queries),
    pages: mapRows(pages),
  };
}
