import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import {
  ChevronRight, Phone, Mail, MoreHorizontal, MessageSquarePlus,
  FileImage, FileText, FilePlus2, Upload, Plus, CheckCircle2,
  ClipboardCheck, CalendarPlus, StickyNote, FileSpreadsheet,
  Send, Inbox, Clock,
} from "lucide-react";
import { WhatsApp } from "@/components/icons/WhatsApp";

export const Route = createFileRoute("/crm/leads/$id")({
  component: LeadDetail,
});

/* ------------------------------------------------------------------ */
/* Mock record — replace with fetched record when backend is wired     */
/* ------------------------------------------------------------------ */

const record = {
  id: "CEV-1245",
  customer: "ABC Holdings",
  contact: "John Mitchell",
  phone: "+592 000 0000",
  email: "john@example.com",
  companyType: "Commercial",
  service: "Dumpster Rental",
  region: "Georgetown",
  location: "East Bank Demerara",
  source: "Website",
  priority: "High",
  assigned: "Romina S.",
  submitted: "May 15, 2026, 10:24 AM",
  status: "Contacted",
  tags: ["Commercial", "Dumpster", "Georgetown", "High Priority"],
};

const summary: Array<[string, string]> = [
  ["Customer Name", record.customer],
  ["Contact Person", record.contact],
  ["Phone", record.phone],
  ["Email", record.email],
  ["Company Type", record.companyType],
  ["Service", record.service],
  ["Region", record.region],
  ["Location", record.location],
  ["Source", record.source],
  ["Priority", record.priority],
  ["Assigned To", record.assigned],
  ["Submitted", record.submitted],
];

const customerDetails: Array<[string, string]> = [
  ["Company", "ABC Holdings"],
  ["Contact Person", "John Mitchell"],
  ["Preferred Contact", "WhatsApp"],
  ["Region", "Georgetown"],
  ["Location", "East Bank Demerara"],
];

const serviceDetails: Array<[string, string]> = [
  ["Service Requested", "Dumpster Rental"],
  ["Waste Type", "General construction waste"],
  ["Preferred Size", "20 Yard"],
  ["Rental Duration", "7 days"],
  ["Preferred Delivery", "May 17, 2026"],
  ["Preferred Pickup", "May 24, 2026"],
  ["Site Access Notes", "Truck access available from main entrance"],
  ["Additional Notes", "Needs quote before confirming"],
];

const statusInfo: Array<[string, string]> = [
  ["Current Stage", "Contacted"],
  ["Next Action", "Send quote and follow up"],
  ["Due Date", "May 16, 2026"],
  ["Quote Status", "Pending"],
  ["Schedule Status", "Not yet scheduled"],
];

const files = [
  { name: "site_photo_1.jpg", size: "2.4 MB", icon: FileImage, color: "#3b82f6" },
  { name: "bin_area.jpg", size: "1.8 MB", icon: FileImage, color: "#3b82f6" },
  { name: "waste_manifest.pdf", size: "412 KB", icon: FileText, color: "#E31B23" },
];

const timeline = [
  { title: "Form submitted", time: "May 15, 10:24 AM", color: "#006B35", icon: ClipboardCheck },
  { title: "Auto confirmation sent", time: "May 15, 10:25 AM", color: "#64748b", icon: Send },
  { title: "WhatsApp message sent", time: "May 15, 10:26 AM", color: "#25D366", icon: WhatsApp },
  { title: "Customer confirmed details", time: "May 15, 11:05 AM", color: "#006B35", icon: CheckCircle2 },
  { title: "Quote requested internally", time: "May 15, 11:20 AM", color: "#FFD200", icon: FileText },
];

const notes = [
  { author: "Romina S.", time: "May 15, 11:30 AM", text: "Customer requested pricing before scheduling." },
  { author: "K. Ali", time: "May 15, 11:45 AM", text: "Site has easy truck access." },
  { author: "Romina S.", time: "May 15, 12:10 PM", text: "May need 20-yard dumpster." },
];

const TABS = ["Overview", "Activity", "Quotes", "Notes", "Files", "Invoices"] as const;
type Tab = typeof TABS[number];

/* ------------------------------------------------------------------ */
/* Small atoms                                                         */
/* ------------------------------------------------------------------ */

function Card({ children, className = "", title, action }: { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }) {
  return (
    <div className={`bg-[#101820] border border-white/[0.08] rounded-xl ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 whitespace-nowrap">{label}</span>
      <span className="text-sm text-slate-200 text-right">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold bg-[#FFD200]/15 text-[#FFD200] border-[#FFD200]/30">
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

function HeaderBtn({ icon: Icon, label, variant = "default" }: { icon: ComponentType<{ className?: string }>; label: string; variant?: "default" | "whatsapp" | "primary" }) {
  const base = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const styles = {
    default: "bg-[#101820] border border-white/[0.08] text-slate-200 hover:border-white/20",
    whatsapp: "bg-[#25D366] text-white hover:brightness-95 border border-[#25D366]",
    primary: "bg-[#FFD200] text-[#101820] font-semibold hover:brightness-95",
  }[variant];
  return (
    <button className={`${base} ${styles}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function LeadDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 animate-fade-in">
        <Link to="/crm/leads" className="hover:text-white">Leads / Requests</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-200 font-mono">{id}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-700/60 grid place-items-center text-base font-bold text-white shrink-0">
            {record.customer.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-[26px] font-bold text-white tracking-tight">{record.id}</h1>
              <StatusBadge status={record.status} />
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{record.customer} · {record.service}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <HeaderBtn icon={Phone} label="Call" />
          <HeaderBtn icon={WhatsApp} label="WhatsApp" variant="whatsapp" />
          <HeaderBtn icon={Mail} label="Email" />
          <HeaderBtn icon={MessageSquarePlus} label="Add Note" variant="primary" />
          <button className="h-9 w-9 grid place-items-center rounded-lg bg-[#101820] border border-white/[0.08] text-slate-300 hover:border-white/20" aria-label="More">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Request Summary */}
        <div className="lg:col-span-3 space-y-5 animate-fade-in">
          <Card title="Request Summary">
            <div className="px-5 py-2 divide-y divide-white/[0.04]">
              {summary.map(([k, v]) => <KV key={k} label={k} value={v} />)}
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-white/[0.06]">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {record.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">{t}</span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* CENTER: Tabs + content */}
        <div className="lg:col-span-6 space-y-5 animate-fade-in" style={{ animationDelay: "60ms" }}>
          <div className="bg-[#101820] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="overflow-x-auto border-b border-white/[0.06]">
              <div className="flex gap-1 p-1.5 min-w-max">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      tab === t ? "bg-[#FFD200] text-[#101820]" : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {tab === "Overview" && <OverviewTab />}
              {tab === "Activity" && <ActivityList />}
              {tab === "Quotes" && <EmptyTab icon={FileSpreadsheet} title="No quote has been sent yet." cta="Create Quote" ctaIcon={FilePlus2} />}
              {tab === "Notes" && <NotesTab />}
              {tab === "Files" && <FilesTab />}
              {tab === "Invoices" && <EmptyTab icon={Inbox} title="No invoices created yet." cta="Create Invoice" ctaIcon={FilePlus2} />}
            </div>
          </div>
        </div>

        {/* RIGHT: Timeline + Next Action + Quick Actions */}
        <div className="lg:col-span-3 space-y-5 animate-fade-in" style={{ animationDelay: "120ms" }}>
          <Card title="Timeline">
            <ol className="p-5 pt-3 space-y-4 relative">
              {timeline.map((t, i) => {
                const Icon = t.icon;
                return (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-7 w-7 rounded-full grid place-items-center" style={{ background: `${t.color}25`, color: t.color }}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                    </div>
                    <div className="pb-3 min-w-0">
                      <p className="text-sm text-white font-medium leading-tight">{t.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.time}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Next Action">
            <div className="p-5 space-y-3">
              <p className="text-base font-semibold text-white">Send quote and follow up</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-300"><Clock className="h-3.5 w-3.5 text-slate-500" /> Due: <span className="text-white">May 16, 2026</span></div>
                <div className="flex items-center gap-2 text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Owner: <span className="text-white">{record.assigned}</span></div>
                <div className="flex items-center gap-2 text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-[#E31B23]" /> Priority: <span className="text-red-400 font-semibold">{record.priority}</span></div>
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95">
                <CheckCircle2 className="h-4 w-4" /> Mark as Complete
              </button>
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="p-3 grid grid-cols-1 gap-1">
              {[
                { icon: WhatsApp, label: "Send WhatsApp" },
                { icon: FilePlus2, label: "Create Quote" },
                { icon: CalendarPlus, label: "Schedule Job" },
                { icon: Upload, label: "Upload File" },
                { icon: StickyNote, label: "Add Internal Note" },
              ].map((q) => {
                const Icon = q.icon;
                return (
                  <button key={q.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/5 hover:text-white text-left">
                    <Icon className="h-4 w-4 text-emerald-400" />
                    {q.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab content                                                         */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">{children}</h4>;
}

function OverviewTab() {
  return (
    <div className="space-y-7">
      <section>
        <SectionTitle>Customer Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 divide-y sm:divide-y-0 divide-white/[0.04]">
          {customerDetails.map(([k, v]) => <KV key={k} label={k} value={v} />)}
        </div>
      </section>

      <section>
        <SectionTitle>Service Details</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 divide-y sm:divide-y-0 divide-white/[0.04]">
          {serviceDetails.map(([k, v]) => <KV key={k} label={k} value={v} />)}
        </div>
      </section>

      <section>
        <SectionTitle>Status Information</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 divide-y sm:divide-y-0 divide-white/[0.04]">
          {statusInfo.map(([k, v]) => <KV key={k} label={k} value={v} />)}
        </div>
      </section>

      <section>
        <SectionTitle>Files</SectionTitle>
        <FileGrid />
      </section>
    </div>
  );
}

function FileGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {files.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.name} className="bg-[#071111] border border-white/[0.08] rounded-lg p-3 hover:border-white/20 transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-lg grid place-items-center mb-2" style={{ background: `${f.color}25`, color: f.color }}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs text-white truncate font-medium">{f.name}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{f.size}</p>
          </div>
        );
      })}
    </div>
  );
}

function ActivityList() {
  return (
    <ol className="space-y-4">
      {timeline.map((t, i) => {
        const Icon = t.icon;
        return (
          <li key={i} className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${t.color}25`, color: t.color }}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{t.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{t.time}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function NotesTab() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="bg-[#071111] border border-white/[0.06] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-emerald-700/60 grid place-items-center text-[10px] font-semibold text-white">
                  {n.author.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </span>
                <span className="text-sm font-semibold text-white">{n.author}</span>
              </div>
              <span className="text-[11px] text-slate-500">{n.time}</span>
            </div>
            <p className="text-sm text-slate-300">{n.text}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#071111] border border-white/[0.08] rounded-lg p-3">
        <textarea
          placeholder="Add an internal note..."
          rows={3}
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <span className="text-[11px] text-slate-500">Only visible to your team</span>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFD200] text-[#101820] text-xs font-semibold hover:brightness-95">
            <Plus className="h-3.5 w-3.5" /> Add Note
          </button>
        </div>
      </div>
    </div>
  );
}

function FilesTab() {
  return (
    <div className="space-y-5">
      <label className="block border-2 border-dashed border-white/15 rounded-xl p-8 text-center hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-colors cursor-pointer">
        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
        <p className="text-sm text-white font-medium">Drag and drop files here</p>
        <p className="text-xs text-slate-400 mt-1">or click to upload</p>
        <input type="file" className="hidden" multiple />
      </label>
      <FileGrid />
    </div>
  );
}

function EmptyTab({ icon: Icon, title, cta, ctaIcon: CtaIcon }: { icon: ComponentType<{ className?: string }>; title: string; cta: string; ctaIcon: ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="h-14 w-14 rounded-full bg-white/5 grid place-items-center mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <button className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFD200] text-[#101820] text-sm font-semibold hover:brightness-95">
        <CtaIcon className="h-4 w-4" /> {cta}
      </button>
    </div>
  );
}
