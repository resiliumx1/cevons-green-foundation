import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  X,
  Edit3,
  Info,
  MessageCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { whatsappHref } from "@/data/cevonsContact";

const subjects = [
  "General Inquiry",
  "Request Service",
  "Billing",
  "Existing Request",
  "Business Partnership",
  "Other",
];

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

type Stage = "form" | "success" | "duplicate";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  subject: "General Inquiry",
  message: "",
};

const inputClass =
  "w-full rounded-xl border border-[var(--cevons-border,#E5E7EB)] bg-white px-4 py-3 text-sm text-[var(--cevons-dark,#101820)] placeholder:text-[var(--cevons-muted,#64748B)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--cevons-deep-green,#EF7700)]/30 focus:border-[var(--cevons-deep-green,#EF7700)] transition";
const inputErrClass =
  "border-red-400 focus:ring-red-300 focus:border-red-500";

function getUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const pick = (k: string) => params.get(k) || undefined;
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_term: pick("utm_term"),
    utm_content: pick("utm_content"),
    referrer: document.referrer || undefined,
    landing_page: window.location.href,
  };
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [result, setResult] = useState<{ reference: string; received_at?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((p) => ({ ...p, [name]: undefined }));
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) { setFile(null); return; }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError("Unsupported file type. Use JPG, PNG, PDF, or DOC.");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError("File is larger than 10MB.");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Please enter your name.";
    else if (form.fullName.trim().length > 200) next.fullName = "Name is too long.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.phone.trim()) {
      const digits = form.phone.replace(/[^\d]/g, "");
      if (digits.length < 6 || digits.length > 20) next.phone = "Enter a valid phone number.";
    }
    if (!form.message.trim()) next.message = "Please add a message.";
    else if (form.message.trim().length > 5000) next.message = "Message is too long (max 5000).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError(null);
    if (!validate()) return;
    setShowConfirm(true);
  };

  // Focus into dialog when opened
  useEffect(() => {
    if (showConfirm && dialogRef.current) {
      const btn = dialogRef.current.querySelector<HTMLButtonElement>("[data-confirm-send]");
      btn?.focus();
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowConfirm(false); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [showConfirm]);

  useEffect(() => {
    if ((stage === "success" || stage === "duplicate") && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      const heading = panelRef.current.querySelector<HTMLElement>("[data-panel-heading]");
      heading?.focus();
    }
  }, [stage]);

  const uploadAttachment = async (): Promise<string | null> => {
    if (!file) return null;
    const ext = file.name.split(".").pop() || "bin";
    const path = `public/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage
      .from("contact-attachments")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error("Failed to upload attachment");
    return path;
  };

  const handleConfirmSend = async () => {
    setSubmitting(true);
    setNetworkError(null);
    try {
      let attachment_url: string | null = null;
      try {
        attachment_url = await uploadAttachment();
      } catch {
        setNetworkError("We couldn't upload your attachment. Try again or send without it.");
        setSubmitting(false);
        return;
      }

      const payload = {
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
        attachment_url,
        ...getUtm(),
      };

      const { data, error } = await supabase.functions.invoke("submit-contact", { body: payload });
      if (error || !data) throw new Error(error?.message || "Network error");
      if ((data as any).error) throw new Error((data as any).error);

      const res = data as { result: "received" | "duplicate"; reference: string; received_at?: string };
      setResult({ reference: res.reference, received_at: res.received_at });
      setStage(res.result === "duplicate" ? "duplicate" : "success");
      setShowConfirm(false);
    } catch (err: any) {
      setNetworkError(
        err?.message?.includes("Failed to fetch")
          ? "Network error. Check your connection and try again — your message is still here."
          : "Something went wrong sending your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(initialForm);
    setFile(null);
    setErrors({});
    setNetworkError(null);
    setResult(null);
    setStage("form");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyRef = async () => {
    if (!result?.reference) return;
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const firstName = form.fullName.trim().split(/\s+/)[0] || "there";

  // ========= SUCCESS PANEL =========
  if (stage === "success" && result) {
    const waMsg = encodeURIComponent(`Hi CEVONS — following up on my message (ref ${result.reference}).`);
    const waUrl = whatsappHref.includes("?")
      ? `${whatsappHref}&text=${waMsg}`
      : `${whatsappHref}?text=${waMsg}`;
    return (
      <div ref={panelRef} aria-live="polite" className="rounded-2xl border border-[var(--cevons-deep-green,#EF7700)]/20 bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-[var(--cevons-deep-green,#EF7700)] to-[#1A1A1A] px-6 py-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20 animate-[pop_0.5s_ease-out]">
            <svg viewBox="0 0 52 52" className="h-12 w-12 text-[var(--cevons-yellow,#FFD200)]" aria-hidden="true">
              <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="151" strokeDashoffset="151" style={{ animation: "draw 0.8s ease-out forwards" }} />
              <path d="M14 27 l8 8 l16 -18" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="48" strokeDashoffset="48" style={{ animation: "draw 0.5s ease-out 0.5s forwards" }} />
            </svg>
          </div>
          <h2 tabIndex={-1} data-panel-heading className="mt-5 text-white text-3xl md:text-4xl font-extrabold focus:outline-none">
            Message Received!
          </h2>
          <p className="mt-3 text-white/85 max-w-md mx-auto">
            Thank you, {firstName} — we&rsquo;ve received your message and will get back to you within one business day.
          </p>
        </div>

        <div className="px-6 py-7 space-y-5">
          <div className="rounded-xl border border-[var(--cevons-deep-green,#EF7700)]/15 bg-[var(--cevons-cream,#FBF7EE)] px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cevons-muted,#64748B)]">Reference</p>
              <p className="mt-1 font-mono text-xl font-bold text-[var(--cevons-deep-green,#EF7700)]">{result.reference}</p>
            </div>
            <button
              type="button"
              onClick={copyRef}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--cevons-deep-green,#EF7700)]/30 bg-white px-3 py-2 text-sm font-semibold text-[var(--cevons-deep-green,#EF7700)] hover:bg-[var(--cevons-deep-green,#EF7700)] hover:text-white transition"
              aria-label="Copy reference"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="rounded-xl border border-[var(--cevons-border,#E5E7EB)] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cevons-muted,#64748B)] mb-3">What you sent</p>
            <dl className="text-sm space-y-2 text-[var(--cevons-dark,#101820)]">
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-[var(--cevons-muted,#64748B)]">Subject</dt><dd className="font-medium">{form.subject}</dd></div>
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-[var(--cevons-muted,#64748B)]">Email</dt><dd>{form.email}</dd></div>
              {form.phone && <div className="flex gap-2"><dt className="w-20 shrink-0 text-[var(--cevons-muted,#64748B)]">Phone</dt><dd>{form.phone}</dd></div>}
              <div className="flex gap-2"><dt className="w-20 shrink-0 text-[var(--cevons-muted,#64748B)]">Message</dt><dd className="whitespace-pre-wrap">{form.message}</dd></div>
              {file && <div className="flex gap-2"><dt className="w-20 shrink-0 text-[var(--cevons-muted,#64748B)]">File</dt><dd className="flex items-center gap-1"><FileText className="size-4" />{file.name}</dd></div>}
            </dl>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-green flex-1 justify-center py-3"
            >
              <MessageCircle className="size-5" /> WhatsApp Us
            </a>
            <button
              type="button"
              onClick={reset}
              className="btn-base flex-1 justify-center py-3 border-2 border-[var(--cevons-deep-green,#EF7700)] text-[var(--cevons-deep-green,#EF7700)] hover:bg-[var(--cevons-deep-green,#EF7700)] hover:text-white transition"
            >
              <Send className="size-4" /> Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========= DUPLICATE PANEL =========
  if (stage === "duplicate" && result) {
    const receivedDate = result.received_at
      ? new Date(result.received_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : "recently";
    const waMsg = encodeURIComponent(`Hi CEVONS — urgent follow-up on my message (ref ${result.reference}).`);
    const waUrl = whatsappHref.includes("?") ? `${whatsappHref}&text=${waMsg}` : `${whatsappHref}?text=${waMsg}`;
    return (
      <div ref={panelRef} aria-live="polite" className="rounded-2xl border border-[#C45F00]/30 bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-[#EF7700] to-[#C45F00] px-6 py-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/25 ring-4 ring-white/30">
            <Info className="size-10 text-white" />
          </div>
          <h2 tabIndex={-1} data-panel-heading className="mt-5 text-white text-3xl md:text-4xl font-extrabold focus:outline-none">
            We already have your message
          </h2>
          <p className="mt-3 text-white/85 max-w-md mx-auto">
            It looks like you contacted us about this on {receivedDate}. Your message (ref{" "}
            <span className="font-mono font-bold">{result.reference}</span>) is with our team and we&rsquo;ll get back to you soon — no need to resend.
          </p>
        </div>
        <div className="px-6 py-7 space-y-5">
          <p className="text-sm text-[var(--cevons-muted,#64748B)]">
            If it&rsquo;s urgent, send us a quick WhatsApp and we&rsquo;ll prioritize your reference.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-green flex-1 justify-center py-3"
            >
              <MessageCircle className="size-5" /> WhatsApp Us
            </a>
            <button
              type="button"
              onClick={reset}
              className="btn-base flex-1 justify-center py-3 border-2 border-[var(--cevons-deep-green,#EF7700)] text-[var(--cevons-deep-green,#EF7700)] hover:bg-[var(--cevons-deep-green,#EF7700)] hover:text-white transition"
            >
              <Edit3 className="size-4" /> Send a different message
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========= FORM =========
  return (
    <>
      <form onSubmit={handleReview} noValidate className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">Full Name</label>
            <input id="fullName" name="fullName" type="text" value={form.fullName} onChange={onChange} placeholder="John Doe"
              aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "err-fullName" : undefined}
              className={`${inputClass} ${errors.fullName ? inputErrClass : ""}`} />
            {errors.fullName && <p id="err-fullName" className="mt-1 text-xs font-medium text-red-600">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">Email Address</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="john@example.com"
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined}
              className={`${inputClass} ${errors.email ? inputErrClass : ""}`} />
            {errors.email && <p id="err-email" className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">Phone Number</label>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+592 ..."
              aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "err-phone" : undefined}
              className={`${inputClass} ${errors.phone ? inputErrClass : ""}`} />
            {errors.phone && <p id="err-phone" className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">Subject</label>
            <select id="subject" name="subject" value={form.subject} onChange={onChange} className={`${inputClass} appearance-none`}>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-[var(--cevons-dark,#101820)] mb-1.5">Message</label>
          <textarea id="message" name="message" rows={5} value={form.message} onChange={onChange} placeholder="How can we help you?"
            aria-invalid={!!errors.message} aria-describedby={errors.message ? "err-message" : undefined}
            className={`${inputClass} resize-y ${errors.message ? inputErrClass : ""}`} />
          {errors.message && <p id="err-message" className="mt-1 text-xs font-medium text-red-600">{errors.message}</p>}
        </div>

        <div>
          <label className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--cevons-border,#E5E7EB)] px-4 py-3 cursor-pointer hover:bg-[var(--cevons-cream,#FBF7EE)] transition-colors">
            <Upload className="size-5 text-[var(--cevons-muted,#64748B)]" />
            <span className="text-sm text-[var(--cevons-muted,#64748B)] flex-1 truncate">
              {file ? file.name : "Upload attachment (optional) — JPG, PNG, PDF, DOC · max 10MB"}
            </span>
            {file && (
              <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-xs text-[var(--cevons-muted,#64748B)] hover:text-red-600">Remove</button>
            )}
            <input ref={fileInputRef} type="file" className="sr-only" onChange={onFile}
              accept=".jpg,.jpeg,.png,.webp,.gif,.heic,.pdf,.doc,.docx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
          </label>
          {fileError && <p className="mt-1 text-xs font-medium text-red-600">{fileError}</p>}
        </div>

        {networkError && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" /> {networkError}
          </div>
        )}

        <button type="submit" className="btn-base btn-green text-base px-7 py-3.5">
          <Send className="size-4" /> Send Message
        </button>
      </form>

      {/* ========= CONFIRM DIALOG ========= */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-heading"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget && !submitting) setShowConfirm(false); }}
        >
          <div ref={dialogRef} className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-[slideUp_0.25s_ease-out]">
            <div className="px-6 py-5 bg-[var(--cevons-deep-green,#EF7700)] text-white flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cevons-yellow,#FFD200)]">Almost there</p>
                <h3 id="confirm-heading" className="text-xl font-extrabold mt-0.5">Review your message</h3>
              </div>
              <button type="button" onClick={() => !submitting && setShowConfirm(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-white/10 transition disabled:opacity-50" disabled={submitting}>
                <X className="size-5" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1">
              <dl className="text-sm space-y-3">
                <Row label="Name" value={form.fullName} />
                <Row label="Email" value={form.email} />
                {form.phone && <Row label="Phone" value={form.phone} />}
                <Row label="Subject" value={form.subject} />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--cevons-muted,#64748B)] mb-1">Message</dt>
                  <dd className="rounded-lg bg-[var(--cevons-cream,#FBF7EE)] px-4 py-3 text-[var(--cevons-dark,#101820)] max-h-44 overflow-y-auto whitespace-pre-wrap">{form.message}</dd>
                </div>
                {file && (
                  <Row label="Attachment" value={<span className="inline-flex items-center gap-1.5"><FileText className="size-4" />{file.name}</span>} />
                )}
              </dl>
              {networkError && (
                <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" /> {networkError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--cevons-border,#E5E7EB)] bg-white flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button type="button" onClick={() => setShowConfirm(false)} disabled={submitting}
                className="btn-base px-5 py-2.5 border-2 border-[var(--cevons-deep-green,#EF7700)] text-[var(--cevons-deep-green,#EF7700)] hover:bg-[var(--cevons-deep-green,#EF7700)]/5 disabled:opacity-50">
                <Edit3 className="size-4" /> Edit
              </button>
              <button type="button" data-confirm-send onClick={handleConfirmSend} disabled={submitting}
                className="btn-base btn-green px-5 py-2.5 disabled:opacity-70 disabled:cursor-not-allowed">
                {submitting ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : <><CheckCircle2 className="size-4" /> Confirm & Send</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-["] { animation: none !important; }
          [style*="animation"] { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cevons-muted,#64748B)] pt-0.5">{label}</dt>
      <dd className="text-[var(--cevons-dark,#101820)] break-words min-w-0">{value}</dd>
    </div>
  );
}
