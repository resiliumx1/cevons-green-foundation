import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crm/settings")({
  component: SettingsPage,
});

const sections = [
  { title: "Company Profile", desc: "Manage CEVON'S brand details, logo, and contact info." },
  { title: "Team & Roles", desc: "Invite team members and configure permissions." },
  { title: "Service Catalog", desc: "Add and edit services, pricing tiers, and zones." },
  { title: "Pipelines & Statuses", desc: "Customize lead and job pipelines." },
  { title: "Notifications", desc: "Configure email, SMS, and WhatsApp alerts." },
  { title: "Integrations", desc: "Connect calendars, payments, and forms." },
];

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure CEVONS Growth Command.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <button key={s.title} className="text-left bg-[#121a26] border border-white/5 rounded-xl p-5 hover:border-emerald-500/30">
            <h3 className="text-base font-semibold text-white">{s.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
