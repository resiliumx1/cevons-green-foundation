import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, MapPin, User, Calendar, AlertCircle, UserCheck, Globe, Tag, CheckCircle2,
  FileImage, FileText, MessageCircle, Phone, Mail,
} from "lucide-react";

export const Route = createFileRoute("/crm/leads/$id")({
  component: LeadDetail,
});

const tabs = ["Overview", "Activity", "Quotes", "Notes", "Files", "Invoices"] as const;
type Tab = typeof tabs[number];

const timeline = [
  { icon: FileText, label: "Form submitted", time: "Jun 09 · 09:14", color: "bg-emerald-500" },
  { icon: MessageCircle, label: "WhatsApp message sent", time: "Jun 09 · 09:22", color: "bg-[#FFC629]" },
  { icon: MessageCircle, label: "Customer replied", time: "Jun 09 · 10:05", color: "bg-emerald-500" },
  { icon: FileText, label: "Quote requested", time: "Jun 09 · 10:30", color: "bg-sky-500" },
];

const files = [
  { name: "site_photo_1.jpg", icon: FileImage, color: "text-sky-400" },
  { name: "bin_area.jpg", icon: FileImage, color: "text-sky-400" },
  { name: "waste_manifest.pdf", icon: FileText, color: "text-red-400" },
];

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-white/5 grid place-items-center text-emerald-400 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-sm text-white truncate">{value}</div>
      </div>
    </div>
  );
}

function LeadDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/crm/leads" className="h-8 w-8 grid place-items-center rounded-lg bg-[#121a26] border border-white/5 text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="text-xs text-slate-400 font-mono">{id}</div>
          <h1 className="text-2xl font-bold text-white">ABC Holdings</h1>
        </div>
        <span className="ml-2 inline-flex px-2.5 py-0.5 rounded-full border bg-[#FFC629]/15 text-[#FFC629] border-[#FFC629]/30 text-xs font-medium">Contacted</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left panel */}
        <aside className="xl:col-span-3 space-y-4">
          <div className="bg-[#121a26] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400">Customer Info</h3>
            <Field icon={User} label="Contact" value="Marlon Persaud" />
            <Field icon={Phone} label="Phone" value="+592 555 0142" />
            <Field icon={Mail} label="Email" value="ops@abcholdings.gy" />
          </div>
          <div className="bg-[#121a26] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400">Request Details</h3>
            <Field icon={MapPin} label="Location" value="Lot 22, Industrial Site" />
            <Field icon={Tag} label="Service" value="Skip Bin Rental (12 yd³)" />
            <Field icon={Calendar} label="Service Date" value="Jun 14, 2026" />
            <Field icon={AlertCircle} label="Priority" value="High" />
            <Field icon={UserCheck} label="Assigned To" value="Romina" />
            <Field icon={Globe} label="Source" value="WhatsApp" />
            <Field icon={MapPin} label="Region" value="Georgetown" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {["Commercial", "Repeat", "Industrial"].map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <section className="xl:col-span-6 space-y-4">
          <div className="bg-[#121a26] border border-white/5 rounded-xl">
            <div className="flex border-b border-white/5 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t ? "border-[#FFC629] text-white" : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="p-5 space-y-6">
              {tab === "Overview" && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Customer Details</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      ABC Holdings operates a multi-site industrial facility in Georgetown. Primary contact: Marlon Persaud,
                      Operations Lead. Recurring service relationship since 2024.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Service Details</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      12-yard skip bin requested for industrial debris clearance. On-site placement near loading bay.
                      Estimated 4-day rental with optional swap.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Request Notes</h4>
                    <div className="rounded-lg bg-[#0f1620] border border-white/5 p-3 text-sm text-slate-300">
                      Customer requested early-morning drop-off before 7am due to operations schedule. Confirm gate access with security.
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Uploaded Files</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {files.map((f) => {
                        const Icon = f.icon;
                        return (
                          <div key={f.name} className="rounded-lg border border-white/5 bg-[#0f1620] p-3 flex flex-col items-center gap-2">
                            <div className="h-16 w-full rounded bg-white/5 grid place-items-center">
                              <Icon className={`h-7 w-7 ${f.color}`} />
                            </div>
                            <div className="text-xs text-slate-300 truncate w-full text-center">{f.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
              {tab !== "Overview" && (
                <div className="py-16 text-center text-slate-400 text-sm">No {tab.toLowerCase()} to display yet.</div>
              )}
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="xl:col-span-3 space-y-4">
          <div className="bg-[#121a26] border border-white/5 rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-4">Activity</h3>
            <ol className="relative border-l border-white/10 ml-3 space-y-5">
              {timeline.map((e, i) => {
                const Icon = e.icon;
                return (
                  <li key={i} className="ml-4">
                    <span className={`absolute -left-[9px] h-4 w-4 rounded-full ${e.color} ring-4 ring-[#121a26] grid place-items-center`}>
                      <Icon className="h-2.5 w-2.5 text-white" />
                    </span>
                    <div className="text-sm text-white">{e.label}</div>
                    <div className="text-xs text-slate-400">{e.time}</div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="bg-[#121a26] border border-white/5 rounded-xl p-5">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Next Action</h3>
            <div className="rounded-lg bg-[#FFC629]/10 border border-[#FFC629]/30 p-3">
              <div className="text-sm font-semibold text-white">Send quote and follow up</div>
              <div className="text-xs text-[#FFC629] mt-1">Due Jun 10, 2026</div>
            </div>
            <button className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Mark as Complete
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
