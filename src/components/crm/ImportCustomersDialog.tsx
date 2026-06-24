import { useCallback, useMemo, useRef, useState } from "react";
import Papa, { type ParseResult } from "papaparse";
import {
  X, Upload, FileSpreadsheet, ArrowRight, ArrowLeft, CheckCircle2,
  AlertTriangle, Loader2, FileWarning,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "upload" | "map" | "preview" | "done";

type CustomerField =
  | "name" | "type" | "contact_name" | "email" | "phone"
  | "region" | "address" | "notes" | "";

const FIELD_LABELS: Record<Exclude<CustomerField, "">, string> = {
  name: "Name / Company *",
  type: "Type (residential/commercial/industrial)",
  contact_name: "Contact name",
  email: "Email",
  phone: "Phone",
  region: "Region",
  address: "Address",
  notes: "Notes",
};

const ALL_FIELDS: Exclude<CustomerField, "">[] = [
  "name", "type", "contact_name", "email", "phone", "region", "address", "notes",
];

// Heuristic header → field auto-mapping
function autoMap(header: string): CustomerField {
  const h = header.trim().toLowerCase().replace(/[_\s-]+/g, "");
  if (!h) return "";
  if (["name", "company", "companyname", "customer", "customername", "businessname", "fullname"].includes(h)) return "name";
  if (["type", "customertype", "category", "segment"].includes(h)) return "type";
  if (["contact", "contactname", "primarycontact", "owner", "firstname", "lastname"].includes(h)) return "contact_name";
  if (["email", "emailaddress", "mail", "e-mail"].includes(h) || h.includes("email")) return "email";
  if (["phone", "phonenumber", "mobile", "tel", "telephone", "cell", "contactnumber"].includes(h) || h.includes("phone")) return "phone";
  if (["region", "area", "city", "town", "branch", "location"].includes(h)) return "region";
  if (["address", "street", "streetaddress", "mailingaddress"].includes(h)) return "address";
  if (["notes", "note", "comment", "comments", "remarks", "description"].includes(h)) return "notes";
  return "";
}

function normalizeType(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (v.startsWith("res")) return "residential";
  if (v.startsWith("com")) return "commercial";
  if (v.startsWith("ind")) return "industrial";
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Row = Record<string, string>;

type PreparedRow = {
  index: number;          // original CSV row index
  data: {
    name: string;
    type: string | null;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    region: string | null;
    address: string | null;
    notes: string | null;
    source: string;
  };
  issues: string[];       // blocking issues
  warnings: string[];     // non-blocking
  isDuplicate: boolean;
  duplicateId?: string;
};

const CHUNK_SIZE = 200;
const MAX_ROWS = 20000;

export function ImportCustomersDialog({
  open, onClose, onImported,
}: { open: boolean; onClose: () => void; onImported: () => void }) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [mapping, setMapping] = useState<Record<string, CustomerField>>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [duplicateAction, setDuplicateAction] = useState<"skip" | "update">("skip");

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    imported: number; updated: number; skipped: number; duplicates: number; invalid: number;
    errors: string[];
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("upload"); setFileName(""); setHeaders([]); setRows([]);
    setMapping({}); setParseError(null); setParsing(false);
    setDuplicateAction("skip"); setImporting(false); setProgress(0); setResult(null);
  }, []);

  const close = () => { reset(); onClose(); };

  const handleFile = useCallback((file: File) => {
    setParseError(null);
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setParseError("Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    setParsing(true);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: "greedy",
      worker: false,
      transformHeader: (h) => h.trim(),
      complete: (res: ParseResult<Row>) => {
        setParsing(false);
        const fields = res.meta.fields ?? [];
        const data = (res.data ?? []).filter((r) => Object.values(r ?? {}).some((v) => (v ?? "").toString().trim() !== ""));
        if (fields.length === 0 || data.length === 0) {
          setParseError("Could not detect any rows or columns in this CSV.");
          return;
        }
        if (data.length > MAX_ROWS) {
          setParseError(`File too large: ${data.length.toLocaleString()} rows (max ${MAX_ROWS.toLocaleString()}).`);
          return;
        }
        setHeaders(fields);
        setRows(data);
        const auto: Record<string, CustomerField> = {};
        const used = new Set<CustomerField>();
        for (const h of fields) {
          const m = autoMap(h);
          if (m && !used.has(m)) { auto[h] = m; used.add(m); } else auto[h] = "";
        }
        setMapping(auto);
        setStep("map");
      },
      error: (err) => {
        setParsing(false);
        setParseError(err.message || "Failed to parse CSV.");
      },
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const mappedFields = useMemo(() => {
    const set = new Set<CustomerField>();
    Object.values(mapping).forEach((v) => v && set.add(v));
    return set;
  }, [mapping]);

  const hasName = mappedFields.has("name");

  // Build prepared rows once we have a mapping
  const prepareRows = useCallback(async (): Promise<PreparedRow[]> => {
    // Inverse: field → csv header
    const fieldToHeader: Partial<Record<Exclude<CustomerField, "">, string>> = {};
    for (const [header, field] of Object.entries(mapping)) {
      if (field && !fieldToHeader[field]) fieldToHeader[field] = header;
    }

    const get = (row: Row, field: Exclude<CustomerField, "">): string =>
      (fieldToHeader[field] ? (row[fieldToHeader[field]!] ?? "") : "").toString().trim();

    // Collect emails to check for duplicates
    const emails = Array.from(
      new Set(
        rows.map((r) => get(r, "email").toLowerCase()).filter((e) => e && EMAIL_RE.test(e)),
      ),
    );

    let existingByEmail = new Map<string, string>(); // email → id
    if (emails.length) {
      // Chunk the IN query to avoid URL length limits
      for (let i = 0; i < emails.length; i += 200) {
        const slice = emails.slice(i, i + 200);
        const { data, error } = await supabase
          .from("customers")
          .select("id, email")
          .in("email", slice);
        if (error) throw error;
        for (const c of data ?? []) {
          if (c.email) existingByEmail.set(c.email.toLowerCase(), c.id as string);
        }
      }
    }

    return rows.map((r, idx) => {
      const name = get(r, "name");
      const email = get(r, "email").toLowerCase();
      const typeRaw = get(r, "type");
      const type = typeRaw ? normalizeType(typeRaw) : null;
      const issues: string[] = [];
      const warnings: string[] = [];
      if (!name) issues.push("Missing name");
      if (email && !EMAIL_RE.test(email)) issues.push("Invalid email");
      if (typeRaw && !type) warnings.push(`Unrecognized type "${typeRaw}" — will be left blank`);
      const duplicateId = email && EMAIL_RE.test(email) ? existingByEmail.get(email) : undefined;
      return {
        index: idx + 2, // +2 = header row + 1-indexed
        data: {
          name,
          type,
          contact_name: get(r, "contact_name") || null,
          email: email && EMAIL_RE.test(email) ? email : null,
          phone: get(r, "phone") || null,
          region: get(r, "region") || null,
          address: get(r, "address") || null,
          notes: get(r, "notes") || null,
          source: "csv-import",
        },
        issues,
        warnings,
        isDuplicate: !!duplicateId,
        duplicateId,
      };
    });
  }, [rows, mapping]);

  const [prepared, setPrepared] = useState<PreparedRow[] | null>(null);

  const goPreview = async () => {
    if (!hasName) {
      toast.error("Please map a CSV column to Name / Company before continuing.");
      return;
    }
    try {
      setParsing(true);
      const p = await prepareRows();
      setPrepared(p);
      setStep("preview");
    } catch (e) {
      console.error(e);
      toast.error("Failed to validate rows. Please try again.");
    } finally {
      setParsing(false);
    }
  };

  const counts = useMemo(() => {
    if (!prepared) return { valid: 0, invalid: 0, duplicates: 0 };
    let valid = 0, invalid = 0, duplicates = 0;
    for (const r of prepared) {
      if (r.issues.length) invalid++;
      else if (r.isDuplicate) duplicates++;
      else valid++;
    }
    return { valid, invalid, duplicates };
  }, [prepared]);

  const runImport = async () => {
    if (!prepared) return;
    setImporting(true); setProgress(0);
    const errors: string[] = [];
    let imported = 0, updated = 0, skipped = 0, duplicates = 0, invalid = 0;

    const toInsert: PreparedRow["data"][] = [];
    const toUpdate: Array<{ id: string; data: PreparedRow["data"] }> = [];

    for (const r of prepared) {
      if (r.issues.length) { invalid++; continue; }
      if (r.isDuplicate) {
        duplicates++;
        if (duplicateAction === "update" && r.duplicateId) {
          toUpdate.push({ id: r.duplicateId, data: r.data });
        } else {
          skipped++;
        }
        continue;
      }
      toInsert.push(r.data);
    }

    const totalOps = toInsert.length + toUpdate.length;
    let done = 0;

    try {
      // Inserts in chunks
      for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
        const chunk = toInsert.slice(i, i + CHUNK_SIZE);
        const { error, data } = await supabase.from("customers").insert(chunk).select("id");
        if (error) {
          errors.push(`Insert batch ${i}: ${error.message}`);
        } else {
          imported += (data ?? []).length;
        }
        done += chunk.length;
        setProgress(totalOps ? Math.round((done / totalOps) * 100) : 100);
      }
      // Updates (smaller batches; one row at a time to keep it simple & safe)
      for (const u of toUpdate) {
        const { error } = await supabase.from("customers").update(u.data).eq("id", u.id);
        if (error) errors.push(`Update ${u.id}: ${error.message}`);
        else updated++;
        done += 1;
        setProgress(totalOps ? Math.round((done / totalOps) * 100) : 100);
      }
      setResult({ imported, updated, skipped, duplicates, invalid, errors });
      setStep("done");
      onImported();
    } catch (e) {
      console.error(e);
      errors.push(e instanceof Error ? e.message : "Unknown error");
      setResult({ imported, updated, skipped, duplicates, invalid, errors });
      setStep("done");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={importing ? undefined : close} />
      <div
        className="relative z-[91] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border shadow-2xl"
        style={{ background: "#0F1720", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: "rgba(0,107,53,0.18)", color: "#27c374" }}>
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-white">Import Customers from CSV</h2>
            <p className="text-xs text-white/60">Bulk import contacts into the customers table.</p>
          </div>
          <Stepper step={step} />
          <button onClick={close} disabled={importing} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 disabled:opacity-40" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === "upload" && (
            <UploadStep
              dragOver={dragOver}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onPick={() => fileInputRef.current?.click()}
              parsing={parsing}
              error={parseError}
            />
          )}
          {step === "map" && (
            <MapStep
              headers={headers}
              mapping={mapping}
              setMapping={setMapping}
              rows={rows}
              hasName={hasName}
              mappedFields={mappedFields}
            />
          )}
          {step === "preview" && prepared && (
            <PreviewStep
              prepared={prepared}
              counts={counts}
              duplicateAction={duplicateAction}
              setDuplicateAction={setDuplicateAction}
              importing={importing}
              progress={progress}
            />
          )}
          {step === "done" && result && <DoneStep result={result} />}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t px-5 py-3" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0B1118" }}>
          <div className="text-xs text-white/50">
            {fileName && step !== "done" && <span className="inline-flex items-center gap-1"><FileSpreadsheet className="h-3 w-3" /> {fileName} — {rows.length.toLocaleString()} rows</span>}
          </div>
          <div className="flex items-center gap-2">
            {step === "map" && (
              <>
                <button onClick={() => setStep("upload")} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={goPreview}
                  disabled={!hasName || parsing}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#FFD200] px-3 py-1.5 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50"
                >
                  {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </button>
              </>
            )}
            {step === "preview" && (
              <>
                <button onClick={() => setStep("map")} disabled={importing} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={runImport}
                  disabled={importing || (counts.valid === 0 && !(duplicateAction === "update" && counts.duplicates > 0))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#EF7700] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#EF7700]/90 disabled:opacity-50"
                >
                  {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing… {progress}%</> : <>Import {counts.valid}{duplicateAction === "update" ? ` + update ${counts.duplicates}` : ""}</>}
                </button>
              </>
            )}
            {step === "done" && (
              <button onClick={close} className="inline-flex items-center gap-1 rounded-lg bg-[#FFD200] px-3 py-1.5 text-sm font-semibold text-black hover:bg-[#FFD200]/90">
                Done
              </button>
            )}
          </div>
        </footer>

        <input
          ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </div>
    </div>
  );
}

/* ---------- Step components ---------- */

function Stepper({ step }: { step: Step }) {
  const steps: Step[] = ["upload", "map", "preview", "done"];
  const i = steps.indexOf(step);
  return (
    <div className="hidden md:flex items-center gap-1.5 mr-2">
      {steps.map((s, idx) => (
        <div key={s} className="flex items-center gap-1.5">
          <div className={`h-1.5 w-6 rounded-full ${idx <= i ? "bg-[#EF7700]" : "bg-white/10"}`} />
        </div>
      ))}
    </div>
  );
}

function UploadStep(props: {
  dragOver: boolean; parsing: boolean; error: string | null;
  onDragOver: (e: React.DragEvent) => void; onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void; onPick: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={props.onPick}
        onDragOver={props.onDragOver}
        onDragLeave={props.onDragLeave}
        onDrop={props.onDrop}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
          props.dragOver ? "border-[#FFD200] bg-[#FFD200]/5" : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
        }`}
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#EF7700]/15 text-[#27c374]">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-white">Drop your CSV here, or click to browse</p>
        <p className="text-xs text-white/60">Up to {MAX_ROWS.toLocaleString()} rows. First row must be the header.</p>
        {props.parsing && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-white/70"><Loader2 className="h-3 w-3 animate-spin" /> Parsing…</p>
        )}
      </button>
      {props.error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4" /> <span>{props.error}</span>
        </div>
      )}
      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white/70">
        <p className="font-semibold text-white/80 mb-1">Tips</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>The CSV must include a column for <span className="text-white">Name</span> or <span className="text-white">Company</span>.</li>
          <li>Type column will be normalized to residential / commercial / industrial.</li>
          <li>Duplicates are detected by email.</li>
        </ul>
      </div>
    </div>
  );
}

function MapStep(props: {
  headers: string[]; mapping: Record<string, CustomerField>;
  setMapping: (m: Record<string, CustomerField>) => void;
  rows: Row[]; hasName: boolean; mappedFields: Set<CustomerField>;
}) {
  const setOne = (h: string, v: CustomerField) => {
    // Prevent the same field being used twice
    const next = { ...props.mapping };
    if (v) for (const k of Object.keys(next)) if (next[k] === v && k !== h) next[k] = "";
    next[h] = v;
    props.setMapping(next);
  };
  return (
    <div>
      <p className="text-sm text-white/70 mb-3">Map each CSV column to a customer field. Unmapped columns will be ignored.</p>
      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase text-white/60">
            <tr>
              <th className="px-3 py-2 font-medium">CSV column</th>
              <th className="px-3 py-2 font-medium">Sample value</th>
              <th className="px-3 py-2 font-medium">Maps to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {props.headers.map((h) => {
              const sample = props.rows.slice(0, 5).map((r) => r[h]).find((v) => v && v.toString().trim() !== "") ?? "";
              return (
                <tr key={h} className="hover:bg-white/[0.03]">
                  <td className="px-3 py-2 font-medium text-white">{h}</td>
                  <td className="px-3 py-2 text-white/60 truncate max-w-[14rem]">{sample.toString().slice(0, 60) || "—"}</td>
                  <td className="px-3 py-2">
                    <select
                      value={props.mapping[h] ?? ""}
                      onChange={(e) => setOne(h, e.target.value as CustomerField)}
                      className="w-full rounded-md border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#EF7700]"
                    >
                      <option value="">— Ignore —</option>
                      {ALL_FIELDS.map((f) => (
                        <option key={f} value={f} disabled={props.mappedFields.has(f) && props.mapping[h] !== f}>
                          {FIELD_LABELS[f]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!props.hasName && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          <FileWarning className="h-4 w-4" /> Map a column to <span className="font-semibold">Name / Company</span> to continue.
        </div>
      )}
    </div>
  );
}

function PreviewStep(props: {
  prepared: PreparedRow[];
  counts: { valid: number; invalid: number; duplicates: number };
  duplicateAction: "skip" | "update";
  setDuplicateAction: (v: "skip" | "update") => void;
  importing: boolean;
  progress: number;
}) {
  const sample = props.prepared.slice(0, 10);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Valid" value={props.counts.valid} tone="text-[#27c374]" />
        <Stat label="Duplicates" value={props.counts.duplicates} tone="text-[#FFD200]" />
        <Stat label="Invalid" value={props.counts.invalid} tone="text-red-300" />
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
        <p className="text-xs font-semibold text-white/80 mb-2">When a customer's email matches an existing record:</p>
        <div className="flex gap-2 text-sm">
          {(["skip", "update"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => props.setDuplicateAction(opt)}
              className={`rounded-md px-3 py-1.5 border ${
                props.duplicateAction === opt
                  ? "border-[#EF7700] bg-[#EF7700]/15 text-[#27c374]"
                  : "border-white/10 text-white/70 hover:bg-white/5"
              }`}
            >
              {opt === "skip" ? "Skip duplicates" : "Update existing"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase text-white/50 mb-2">Preview (first 10 rows)</p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.04] text-left text-[11px] uppercase text-white/60">
              <tr>
                <th className="px-2 py-2">Row</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Phone</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {sample.map((r) => {
                const status = r.issues.length
                  ? { label: "Invalid", cls: "text-red-300 bg-red-500/15", title: r.issues.join("; ") }
                  : r.isDuplicate
                  ? { label: "Duplicate", cls: "text-[#FFD200] bg-[#FFD200]/15", title: "Email matches existing customer" }
                  : { label: "OK", cls: "text-[#27c374] bg-[#EF7700]/20", title: "Will be imported" };
                return (
                  <tr key={r.index} className="text-white/85 hover:bg-white/[0.03]">
                    <td className="px-2 py-1.5 text-white/50">{r.index}</td>
                    <td className="px-2 py-1.5">
                      <span title={status.title} className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="px-2 py-1.5">{r.data.name || <span className="text-red-300">—</span>}</td>
                    <td className="px-2 py-1.5">{r.data.email || "—"}</td>
                    <td className="px-2 py-1.5">{r.data.phone || "—"}</td>
                    <td className="px-2 py-1.5">{r.data.type || "—"}</td>
                    <td className="px-2 py-1.5">{r.data.region || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {props.prepared.length > 10 && (
          <p className="mt-2 text-xs text-white/50">…and {(props.prepared.length - 10).toLocaleString()} more rows.</p>
        )}
      </div>

      {props.importing && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#EF7700] transition-all" style={{ width: `${props.progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-white/60">Importing… {props.progress}%</p>
        </div>
      )}
    </div>
  );
}

function DoneStep({ result }: { result: { imported: number; updated: number; skipped: number; duplicates: number; invalid: number; errors: string[] } }) {
  return (
    <div className="text-center py-4">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#EF7700]/20 text-[#27c374]">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white">Import complete</h3>
      <p className="text-sm text-white/60">{result.imported + result.updated} record{result.imported + result.updated === 1 ? "" : "s"} written to your customers.</p>

      <div className="mt-5 grid grid-cols-2 gap-2 text-left md:grid-cols-4">
        <Stat label="Imported" value={result.imported} tone="text-[#27c374]" />
        <Stat label="Updated" value={result.updated} tone="text-blue-300" />
        <Stat label="Skipped (dupes)" value={result.skipped} tone="text-[#FFD200]" />
        <Stat label="Invalid" value={result.invalid} tone="text-red-300" />
      </div>

      {result.errors.length > 0 && (
        <div className="mt-4 text-left rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <p className="font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {result.errors.length} error{result.errors.length === 1 ? "" : "s"}</p>
          <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
            {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[11px] uppercase text-white/50">{label}</p>
      <p className={`text-xl font-bold ${tone}`}>{value.toLocaleString()}</p>
    </div>
  );
}
