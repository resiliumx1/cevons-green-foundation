import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Users, Bell, GitBranch, Palette, MoreHorizontal, Check, Sparkles, Sun } from "lucide-react";
import { useCrmTheme, type CrmTheme } from "@/components/crm/theme";

export const Route = createFileRoute("/crm/settings")({
  head: () => ({ meta: [{ title: "Settings | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

const TEAM = [
  { name: "Sarah Khan", role: "Marketing Lead", access: "Full", status: "Active" },
  { name: "Marcus Thomas", role: "Service Coordinator", access: "Full", status: "Active" },
  { name: "Anita Persaud", role: "Intake Staff", access: "Standard", status: "Active" },
  { name: "David Liu", role: "Management", access: "Full", status: "Active" },
  { name: "Carlos Rivera", role: "Field / Dispatch User", access: "Limited", status: "Active" },
  { name: "Jessica Reid", role: "Intake Staff", access: "Standard", status: "Invited" },
];

const NOTIFICATIONS = [
  { label: "New lead alerts", desc: "Get notified when a new request comes in.", on: true },
  { label: "Quote reminders", desc: "Reminders for unsent and expiring quotes.", on: true },
  { label: "Booking reminders", desc: "Daily summary of upcoming bookings.", on: true },
  { label: "Review request alerts", desc: "Notified when feedback requires follow-up.", on: false },
  { label: "Missed call alerts", desc: "Get notified when customer calls are missed.", on: true },
];

const STAGES = [
  "New Inquiry", "Auto-Reply Sent", "Contacted", "Details Needed", "Qualified",
  "Specialist Review Required", "Quote Needed", "Quote Sent", "Approval Required",
  "Scheduled", "Dispatched", "Service Completed", "Invoiced", "Review Requested", "Closed",
];

const BRAND = [
  { name: "Green", hex: "#00A85A" },
  { name: "Deep Green", hex: "#006837" },
  { name: "Yellow", hex: "#FFD200" },
  { name: "Red", hex: "#E31B23" },
];

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "team", label: "Team Members", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "branding", label: "Branding", icon: Palette },
];

function Toggle({ on }: { on: boolean }) {
  const [active, setActive] = useState(on);
  return (
    <button
      onClick={() => setActive(!active)}
      className={`relative h-5 w-9 rounded-full transition ${active ? "bg-[#00A85A]" : "bg-white/[0.1]"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${active ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

function SettingsPage() {
  const [active, setActive] = useState("profile");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-white/60">Manage front-end preferences and team visibility settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-xl border border-white/[0.08] bg-[#101820] p-2">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-[#FFD200]/10 text-[#FFD200]" : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-6">
          {active === "profile" && (
            <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
              <h2 className="font-semibold text-white">Profile</h2>
              <p className="text-xs text-white/50">Personal account information</p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00A85A]/20 text-xl font-semibold text-[#00A85A]">SK</div>
                <button className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/80 hover:bg-white/[0.06]">Change Avatar</button>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Name" value="Sarah Khan" />
                <Field label="Role" value="Marketing Lead" />
                <Field label="Email" value="sarah@cevons.gy" />
                <Field label="Phone" value="+592 000-0000" />
              </div>
              <button className="mt-5 rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90">Save Changes</button>
            </section>
          )}

          {active === "team" && (
            <section className="rounded-xl border border-white/[0.08] bg-[#101820]">
              <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                <div>
                  <h2 className="font-semibold text-white">Team Members</h2>
                  <p className="text-xs text-white/50">Manage who has access to Growth Command</p>
                </div>
                <button className="rounded-lg bg-[#FFD200] px-3 py-1.5 text-sm font-semibold text-black hover:bg-[#FFD200]/90">Invite Member</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-white/50">
                    <tr>{["Name", "Role", "Access Level", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {TEAM.map((m) => (
                      <tr key={m.name} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00A85A]/20 text-xs font-semibold text-[#00A85A]">
                              {m.name.split(" ").map((p) => p[0]).join("")}
                            </div>
                            <span className="text-white">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/80">{m.role}</td>
                        <td className="px-4 py-3"><span className="rounded border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 text-xs text-white/70">{m.access}</span></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                            m.status === "Active" ? "border-[#00A85A]/30 bg-[#00A85A]/10 text-[#00A85A]" : "border-[#FFD200]/30 bg-[#FFD200]/10 text-[#FFD200]"
                          }`}>{m.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right"><button className="rounded p-1 text-white/50 hover:bg-white/[0.06] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {active === "notifications" && (
            <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
              <h2 className="font-semibold text-white">Notification Preferences</h2>
              <p className="text-xs text-white/50">Choose which alerts your team receives</p>
              <div className="mt-4 divide-y divide-white/[0.04]">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{n.label}</p>
                      <p className="text-xs text-white/50">{n.desc}</p>
                    </div>
                    <Toggle on={n.on} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "pipeline" && (
            <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
              <h2 className="font-semibold text-white">Pipeline Settings</h2>
              <p className="text-xs text-white/50">Stages used to track requests from inquiry to close</p>
              <div className="mt-4 space-y-2">
                {STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD200]/10 text-xs font-semibold text-[#FFD200]">{i + 1}</span>
                    <span className="flex-1 text-sm text-white">{s}</span>
                    <button className="text-xs text-white/40 hover:text-white">Edit</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === "branding" && (
            <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
              <h2 className="font-semibold text-white">Branding</h2>
              <p className="text-xs text-white/50">CEVON'S brand palette used across the dashboard</p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {BRAND.map((c) => (
                  <div key={c.name} className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a1218]">
                    <div className="h-24" style={{ background: c.hex }} />
                    <div className="p-3">
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="font-mono text-xs text-white/50">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-white/50">{label}</label>
      <input defaultValue={value} className="mt-1 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none" />
    </div>
  );
}
