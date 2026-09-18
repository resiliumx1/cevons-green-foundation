import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Panel } from "@/components/admin/Manifest";
import { supabase } from "@/integrations/supabase/client";

/**
 * Import of a platform's own analytics export (for example the CSV TikTok
 * Studio lets you download). Only figures present in the file are saved —
 * nothing is filled in, averaged or guessed for missing days.
 */

type ParsedRow = { day: string; followers: number | null; profileViews: number | null };

type Parsed = {
  rows: ParsedRow[];
  hasFollowers: boolean;
  hasProfileViews: boolean;
  onlyNewFollowers: boolean;
  skipped: number;
};

const nf = new Intl.NumberFormat("en-US");

/** Splits one CSV line, honouring quoted values. */
function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === delimiter && !quoted) {
      out.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  out.push(cell);
  return out.map((c) => c.trim().replace(/^"|"$/g, ""));
}

function toDay(value: string): string | null {
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const slash = text.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})$/);
  if (slash) {
    // TikTok Studio exports month/day/year.
    const [, m, d, y] = slash;
    return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function toNumber(value: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned));
}

export function parseDailyCsv(text: string): Parsed {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) throw new Error("That file is empty.");

  const delimiter = (lines[0]!.match(/\t/g)?.length ?? 0) > (lines[0]!.match(/,/g)?.length ?? 0) ? "\t" : ",";

  // The header is the first row that has a date-like column name.
  let headerIndex = lines.findIndex((l) => /date|day/i.test(l));
  if (headerIndex < 0) headerIndex = 0;
  const header = splitLine(lines[headerIndex]!, delimiter).map((h) => h.toLowerCase());

  const dateCol = header.findIndex((h) => /^(date|day)\b/.test(h) || /date/.test(h));
  const totalFollowerCol = header.findIndex(
    (h) => /follower/.test(h) && !/(new|net|gain|lost|change)/.test(h),
  );
  const newFollowerCol = header.findIndex((h) => /follower/.test(h) && /(new|net|gain)/.test(h));
  const profileViewCol = header.findIndex((h) => /profile\s*view/.test(h));

  if (dateCol < 0) throw new Error("No date column was found in that file.");
  if (totalFollowerCol < 0 && profileViewCol < 0) {
    throw new Error(
      newFollowerCol >= 0
        ? "That file only lists new followers per day, not the total. Export the followers overview that shows the total count."
        : "No follower or profile-view column was found in that file.",
    );
  }

  const seen = new Map<string, ParsedRow>();
  let skipped = 0;
  for (const line of lines.slice(headerIndex + 1)) {
    const cells = splitLine(line, delimiter);
    const day = toDay(cells[dateCol] ?? "");
    if (!day) {
      skipped += 1;
      continue;
    }
    const followers = totalFollowerCol >= 0 ? toNumber(cells[totalFollowerCol] ?? "") : null;
    const profileViews = profileViewCol >= 0 ? toNumber(cells[profileViewCol] ?? "") : null;
    if (followers === null && profileViews === null) {
      skipped += 1;
      continue;
    }
    seen.set(day, { day, followers, profileViews });
  }

  const rows = [...seen.values()].sort((a, b) => a.day.localeCompare(b.day));
  if (!rows.length) throw new Error("No dated figures could be read from that file.");

  return {
    rows,
    hasFollowers: rows.some((r) => r.followers !== null),
    hasProfileViews: rows.some((r) => r.profileViews !== null),
    onlyNewFollowers: totalFollowerCol < 0 && newFollowerCol >= 0,
    skipped,
  };
}

export function DailyStatsImport({
  platform,
  label,
  code = "TT-I",
}: {
  platform: "tiktok" | "facebook" | "instagram";
  label: string;
  code?: string;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File | null) => {
    setParsed(null);
    setError(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      setParsed(parseDailyCsv(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file could not be read.");
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!parsed) return 0;
      const payload = parsed.rows.map((r) => ({
        platform,
        day: r.day,
        followers: r.followers,
        profile_views: r.profileViews,
        source: "manual",
        note: `${label} export: ${fileName}`.slice(0, 200),
      }));
      for (let i = 0; i < payload.length; i += 200) {
        const { error: err } = await supabase
          .from("social_daily_stats")
          .upsert(payload.slice(i, i + 200), { onConflict: "platform,day" });
        if (err) throw err;
      }
      return payload.length;
    },
    onSuccess: (count) => {
      toast.success(`Imported ${nf.format(count ?? 0)} days from ${label}.`);
      setParsed(null);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
      void qc.invalidateQueries({ queryKey: ["admin-social-daily", platform] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Those figures could not be imported."),
  });

  return (
    <Panel title={`Import ${label} analytics export`} code={code}>
      <p className="text-sm" style={{ color: "var(--crm-text-muted)" }}>
        Download the analytics export from {label} Studio (a .csv file) and upload it here. Only the
        dates and figures inside the file are saved, so reports can show real history from before
        daily recording started. Figures typed in by hand for the same day are replaced by the file.
      </p>

      <div className="admin-toolbar mt-3 flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="admin-select"
          onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className="admin-btn-quiet"
          disabled={!parsed || save.isPending}
          onClick={() => save.mutate()}
        >
          <Upload className="h-4 w-4" aria-hidden />
          {save.isPending ? "Importing…" : "Import these days"}
        </button>
      </div>

      {error && (
        <div role="status" className="admin-state admin-state-empty items-start mt-3">
          <div>
            <p className="font-semibold">That file couldn't be used.</p>
            <p className="admin-state-detail">{error}</p>
          </div>
        </div>
      )}

      {parsed && (
        <div className="mt-3 text-sm" style={{ color: "var(--crm-text)" }}>
          <p>
            <strong>{nf.format(parsed.rows.length)} days</strong> found, from{" "}
            {parsed.rows[0]!.day} to {parsed.rows[parsed.rows.length - 1]!.day}.
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--crm-text-muted)" }}>
            {parsed.hasFollowers ? "Follower totals included. " : "No follower totals in this file. "}
            {parsed.hasProfileViews ? "Profile views included. " : "No profile views in this file. "}
            {parsed.skipped > 0 ? `${nf.format(parsed.skipped)} rows without a usable date or figure were left out.` : ""}
          </p>
        </div>
      )}
    </Panel>
  );
}
