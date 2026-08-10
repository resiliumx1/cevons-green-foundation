import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2, Users, Bell, GitBranch, Palette, Sparkles, Sun,
  Check, Save, RefreshCw, AlertCircle, Plus, X, Trash2,
  Phone, MapPin, Clock, Award, MessageCircle,
} from "lucide-react";

import { CrmPage } from "@/components/motion/CrmMotion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/crm/settings")({
  head: () => ({ meta: [{ title: "Settings | CEVONS Growth Command" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

/* ─── types ─────────────────────────────────────────────────────────────── */

type Branch = {
  name: string;
  phone: string;
  address: string;
  hours: string;
};

type CompanyProfile = {
  name: string;
  branches: Branch[];
  credentials: { epa?: string; iso?: string };
  whatsappNumber: string;
};

type ServiceItem = {
  name: string;
  specialistReview: boolean;
};

type ServiceCatalog = {
  services: ServiceItem[];
};

type PipelineConfig = {
  stages: string[];
};

type NotificationPref = {
  label: string;
  desc: string;
  on: boolean;
};

type NotificationsConfig = {
  preferences: NotificationPref[];
};

type SettingsMap = {
  company_profile?: CompanyProfile;
  service_catalog?: ServiceCatalog;
  pipeline_stages?: PipelineConfig;
  notifications?: NotificationsConfig;
};

/* ─── default data ──────────────────────────────────────────────────────── */

const DEFAULT_SERVICES: ServiceItem[] = [
  { name: "General Trash Collection", specialistReview: false },
  { name: "Skip Bin / Dumpster Rental", specialistReview: false },
  { name: "Hazardous Waste Disposal", specialistReview: true },
  { name: "Grease Trap & Septic Tank", specialistReview: true },
  { name: "Portable Toilet Rental", specialistReview: false },
  { name: "Contaminated Soil Removal", specialistReview: true },
  { name: "Used Waste Oil Collection", specialistReview: true },
  { name: "Landfill Operations", specialistReview: true },
  { name: "Wastewater Treatment", specialistReview: true },
  { name: "Biohazardous Disposal", specialistReview: true },
  { name: "Product Destruction", specialistReview: false },
  { name: "Document Shredding", specialistReview: false },
  { name: "Tank Cleaning", specialistReview: true },
  { name: "Material Recovery Facility", specialistReview: false },
];

const DEFAULT_STAGES = [
  "New Inquiry", "Auto-Reply Sent", "Contacted", "Details Needed", "Qualified",
  "Specialist Review Required", "Quote Needed", "Quote Sent", "Approval Required",
  "Scheduled", "Dispatched", "Service Completed", "Invoiced", "Review Requested", "Closed",
];

const DEFAULT_NOTIFICATIONS: NotificationPref[] = [
  { label: "New lead alerts", desc: "Get notified when a new request comes in.", on: true },
  { label: "Quote reminders", desc: "Reminders for unsent and expiring quotes.", on: true },
  { label: "Booking reminders", desc: "Daily summary of upcoming bookings.", on: true },
  { label: "Review request alerts", desc: "Notified when feedback requires follow-up.", on: false },
  { label: "Missed call alerts", desc: "Get notified when customer calls are missed.", on: true },
];

const DEFAULT_PROFILE: CompanyProfile = {
  name: "CEVONS Waste Management",
  branches: [
    { name: "Head Office", phone: "+592 000-0000", address: "Georgetown, Guyana", hours: "Mon–Fri 8:00–17:00" },
  ],
  credentials: { epa: "", iso: "" },
  whatsappNumber: "+592 000-0000",
};

/* ─── queries & mutations ───────────────────────────────────────────────── */

function useSettings() {
  return useQuery({
    queryKey: ["crm_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("crm_settings").select("key, value");
      if (error) throw error;
      const map: SettingsMap = {};
      for (const row of data ?? []) {
        map[row.key as keyof SettingsMap] = row.value as any;
      }
      return map;
    },
  });
}

function useUpsertSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Record<string, unknown> }) => {
      const { error } = await supabase.from("crm_settings").upsert(
        { key, value: value as Record<string, any> },
        { onConflict: "key" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_settings"] });
    },
  });
}

/* ─── page ──────────────────────────────────────────────────────────────── */

function SettingsPage() {
  const [active, setActive] = useState("profile");
  const { data: settings, isLoading, isError, error, refetch } = useSettings();
  const upsert = useUpsertSetting();

  const [savedKey, setSavedKey] = useState<string | null>(null);

  const showSaved = useCallback((key: string) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
  }, []);

  const profile: CompanyProfile = useMemo(
    () => ({
      ...DEFAULT_PROFILE,
      ...(settings?.company_profile || {}),
    }),
    [settings?.company_profile]
  );

  const catalog: ServiceCatalog = useMemo(
    () => ({
      services: settings?.service_catalog?.services ?? [...DEFAULT_SERVICES],
    }),
    [settings?.service_catalog]
  );

  const pipeline: PipelineConfig = useMemo(
    () => ({
      stages: settings?.pipeline_stages?.stages ?? [...DEFAULT_STAGES],
    }),
    [settings?.pipeline_stages]
  );

  const notifications: NotificationsConfig = useMemo(
    () => ({
      preferences: settings?.notifications?.preferences ?? [...DEFAULT_NOTIFICATIONS],
    }),
    [settings?.notifications]
  );

  const SECTIONS = [
    { id: "profile", label: "Company Profile", icon: Building2 },
    { id: "team", label: "Team Members", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "pipeline", label: "Pipeline", icon: GitBranch },
    { id: "services", label: "Service Catalog", icon: Award },
    { id: "appearance", label: "Appearance & Theme", icon: Sparkles },
  ];

  return (
    <CrmPage className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-white/60">Configure your company profile, services, pipeline stages, and preferences.</p>
      </div>

      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">Failed to load settings: {(error as Error)?.message || "Unknown error"}</span>
          <button onClick={() => refetch()} className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium hover:bg-red-500/20">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        {/* Sidebar / mobile tab strip */}
        <aside className="rounded-xl border border-white/[0.08] bg-[#101820] p-1.5 lg:p-2 -mx-4 lg:mx-0 rounded-none lg:rounded-xl border-x-0 lg:border-x sticky top-16 z-20 lg:static backdrop-blur supports-[backdrop-filter]:bg-[#101820]/95">
          <nav
            className="flex gap-1 overflow-x-auto lg:flex-col px-2 lg:px-0"
            style={{ scrollSnapType: "x proximity", scrollbarWidth: "none" }}
            aria-label="Settings sections"
          >
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={(e) => {
                    setActive(s.id);
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition snap-start lg:w-full ${
                    isActive
                      ? "bg-[#FFD200]/12 text-[#FFD200] font-semibold"
                      : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                  {isActive && (
                    <span className="lg:hidden absolute -bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#FFD200]" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-6">
          {isLoading ? (
            <SettingsSkeleton />
          ) : (
            <>
              {active === "profile" && (
                <ProfileSection
                  data={profile}
                  onSave={async (v) => {
                    await upsert.mutateAsync({ key: "company_profile", value: v });
                    showSaved("company_profile");
                  }}
                  saving={upsert.isPending}
                  saved={savedKey === "company_profile"}
                />
              )}
              {active === "team" && <TeamSection />}
              {active === "notifications" && (
                <NotificationsSection
                  data={notifications}
                  onSave={async (v) => {
                    await upsert.mutateAsync({ key: "notifications", value: v });
                    showSaved("notifications");
                  }}
                  saving={upsert.isPending}
                  saved={savedKey === "notifications"}
                />
              )}
              {active === "pipeline" && (
                <PipelineSection
                  data={pipeline}
                  onSave={async (v) => {
                    await upsert.mutateAsync({ key: "pipeline_stages", value: v });
                    showSaved("pipeline_stages");
                  }}
                  saving={upsert.isPending}
                  saved={savedKey === "pipeline_stages"}
                />
              )}
              {active === "services" && (
                <ServicesSection
                  data={catalog}
                  onSave={async (v) => {
                    await upsert.mutateAsync({ key: "service_catalog", value: v });
                    showSaved("service_catalog");
                  }}
                  saving={upsert.isPending}
                  saved={savedKey === "service_catalog"}
                />
              )}
              {active === "appearance" && <AppearanceSection />}
            </>
          )}
        </div>
      </div>
    </CrmPage>
  );
}

/* ─── skeleton ──────────────────────────────────────────────────────────── */

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
        <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
        <div className="mt-1 h-3 w-56 rounded bg-white/10 animate-pulse" />
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
              <div className="mt-1 h-9 w-full rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-5 h-9 w-28 rounded bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

/* ─── profile section ─────────────────────────────────────────────────────── */

function ProfileSection({
  data,
  onSave,
  saving,
  saved,
}: {
  data: CompanyProfile;
  onSave: (v: CompanyProfile) => void;
  saving: boolean;
  saved: boolean;
}) {
  const [form, setForm] = useState<CompanyProfile>(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const update = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateBranch = (index: number, patch: Partial<Branch>) => {
    setForm((prev) => ({
      ...prev,
      branches: prev.branches.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));
  };

  const addBranch = () => {
    setForm((prev) => ({
      ...prev,
      branches: [...prev.branches, { name: "", phone: "", address: "", hours: "" }],
    }));
  };

  const removeBranch = (index: number) => {
    setForm((prev) => ({ ...prev, branches: prev.branches.filter((_, i) => i !== index) }));
  };

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <h2 className="font-semibold text-white">Company Profile</h2>
      <p className="text-xs text-white/50">Business details shown across the CRM</p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Company Name"
          value={form.name}
          onChange={(v) => update("name", v)}
          icon={<Building2 className="h-4 w-4 text-white/30" />}
        />
        <Field
          label="WhatsApp Number"
          value={form.whatsappNumber}
          onChange={(v) => update("whatsappNumber", v)}
          icon={<MessageCircle className="h-4 w-4 text-white/30" />}
        />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-medium text-white">Branches / Regions</h3>
        <div className="mt-2 space-y-3">
          {form.branches.map((b, i) => (
            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Branch Name" value={b.name} onChange={(v) => updateBranch(i, { name: v })} />
                <Field
                  label="Phone"
                  value={b.phone}
                  onChange={(v) => updateBranch(i, { phone: v })}
                  icon={<Phone className="h-4 w-4 text-white/30" />}
                />
                <Field
                  label="Address"
                  value={b.address}
                  onChange={(v) => updateBranch(i, { address: v })}
                  icon={<MapPin className="h-4 w-4 text-white/30" />}
                />
                <Field
                  label="Hours"
                  value={b.hours}
                  onChange={(v) => updateBranch(i, { hours: v })}
                  icon={<Clock className="h-4 w-4 text-white/30" />}
                />
              </div>
              {form.branches.length > 1 && (
                <button
                  onClick={() => removeBranch(i)}
                  className="mt-2 flex items-center gap-1 text-xs text-red-300 hover:text-red-200"
                >
                  <Trash2 className="h-3 w-3" /> Remove branch
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addBranch}
          className="mt-2 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06]"
        >
          <Plus className="h-3.5 w-3.5" /> Add branch
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="EPA Certificate #"
          value={form.credentials.epa || ""}
          onChange={(v) => update("credentials", { ...form.credentials, epa: v })}
        />
        <Field
          label="ISO Certificate #"
          value={form.credentials.iso || ""}
          onChange={(v) => update("credentials", { ...form.credentials, iso: v })}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-[#EF7700]">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </section>
  );
}

/* ─── team section (deferred) ───────────────────────────────────────────── */

function TeamSection() {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <h2 className="font-semibold text-white">Team Members</h2>
      <p className="text-xs text-white/50">User management and roles</p>
      <div className="mt-5 flex flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02] py-12 text-center">
        <Users className="h-8 w-8 text-white/20" />
        <p className="mt-2 text-sm font-medium text-white/70">Coming soon</p>
        <p className="mt-1 max-w-xs text-xs text-white/40">
          User management and role-based access will be available once authentication is enabled.
        </p>
      </div>
    </section>
  );
}

/* ─── notifications section ─────────────────────────────────────────────── */

function NotificationsSection({
  data,
  onSave,
  saving,
  saved,
}: {
  data: NotificationsConfig;
  onSave: (v: NotificationsConfig) => void;
  saving: boolean;
  saved: boolean;
}) {
  const [prefs, setPrefs] = useState<NotificationPref[]>(data.preferences);

  useEffect(() => {
    setPrefs(data.preferences);
  }, [data.preferences]);

  const toggle = (index: number) => {
    setPrefs((prev) => prev.map((p, i) => (i === index ? { ...p, on: !p.on } : p)));
  };

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <h2 className="font-semibold text-white">Notification Preferences</h2>
      <p className="text-xs text-white/50">Choose which alerts your team receives. These are placeholders until integrations are connected.</p>
      <div className="mt-4 divide-y divide-white/[0.04]">
        {prefs.map((n, i) => (
          <div key={n.label} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-white">{n.label}</p>
              <p className="text-xs text-white/50">{n.desc}</p>
            </div>
            <Toggle active={n.on} onChange={() => toggle(i)} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onSave({ preferences: prefs })}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-[#EF7700]">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </section>
  );
}

/* ─── pipeline section ──────────────────────────────────────────────────── */

function PipelineSection({
  data,
  onSave,
  saving,
  saved,
}: {
  data: PipelineConfig;
  onSave: (v: PipelineConfig) => void;
  saving: boolean;
  saved: boolean;
}) {
  const [stages, setStages] = useState<string[]>(data.stages);

  useEffect(() => {
    setStages(data.stages);
  }, [data.stages]);

  const updateStage = (index: number, value: string) => {
    setStages((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const addStage = () => {
    setStages((prev) => [...prev, "New Stage"]);
  };

  const removeStage = (index: number) => {
    setStages((prev) => prev.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= stages.length) return;
    setStages((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <h2 className="font-semibold text-white">Pipeline Settings</h2>
      <p className="text-xs text-white/50">Stages used to track requests from inquiry to close</p>
      <div className="mt-4 space-y-2">
        {stages.map((s, i) => (
          <div key={`${i}-${s}`} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFD200]/10 text-xs font-semibold text-[#FFD200]">
              {i + 1}
            </span>
            <input
              value={s}
              onChange={(e) => updateStage(i, e.target.value)}
              className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-white focus:border-[#FFD200]/40 focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded p-1 text-white/30 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === stages.length - 1}
                className="rounded p-1 text-white/30 hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => removeStage(i)}
                className="rounded p-1 text-white/30 hover:bg-red-500/10 hover:text-red-300"
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addStage}
        className="mt-2 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06]"
      >
        <Plus className="h-3.5 w-3.5" /> Add stage
      </button>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onSave({ stages })}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-[#EF7700]">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </section>
  );
}

/* ─── services section ──────────────────────────────────────────────────── */

function ServicesSection({
  data,
  onSave,
  saving,
  saved,
}: {
  data: ServiceCatalog;
  onSave: (v: ServiceCatalog) => void;
  saving: boolean;
  saved: boolean;
}) {
  const [services, setServices] = useState<ServiceItem[]>(data.services);

  useEffect(() => {
    setServices(data.services);
  }, [data.services]);

  const updateName = (index: number, name: string) => {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, name } : s)));
  };

  const toggleSpecialist = (index: number) => {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, specialistReview: !s.specialistReview } : s)));
  };

  const addService = () => {
    setServices((prev) => [...prev, { name: "", specialistReview: false }]);
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <h2 className="font-semibold text-white">Service Catalog</h2>
      <p className="text-xs text-white/50">Services offered and which require specialist review before quoting</p>
      <div className="mt-4 space-y-2">
        {services.map((s, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <input
              value={s.name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder="Service name"
              className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm text-white placeholder:text-white/30 focus:border-[#FFD200]/40 focus:outline-none"
            />
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-white/60">
              <input
                type="checkbox"
                checked={s.specialistReview}
                onChange={() => toggleSpecialist(i)}
                className="h-3.5 w-3.5 accent-[#FFD200]"
              />
              Specialist review
            </label>
            <button
              onClick={() => removeService(i)}
              className="rounded p-1 text-white/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addService}
        className="mt-2 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06]"
      >
        <Plus className="h-3.5 w-3.5" /> Add service
      </button>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onSave({ services })}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-[#EF7700]">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </section>
  );
}

/* ─── appearance section (local) ──────────────────────────────────────────── */

import { useCrmTheme, type CrmTheme } from "@/components/crm/theme";

const THEME_OPTIONS: Array<{
  id: CrmTheme;
  name: string;
  description: string;
  badge?: string;
  swatches: string[];
  preview: { bg: string; sidebar: string; sidebarText: string; accent: string; surface: string; text: string };
}> = [
  {
    id: "emerald",
    name: "Emerald Professional",
    description: "Clean, executive, and easy to use for daily operations.",
    badge: "Recommended",
    swatches: ["#1A1A1A", "#EF7700", "#FFD200", "#E31B23", "#F7F8F5"],
    preview: { bg: "#F7F8F5", sidebar: "#1A1A1A", sidebarText: "#DFF5E9", accent: "#EF7700", surface: "#FFFFFF", text: "#101820" },
  },
  {
    id: "sunset",
    name: "Sunset Marketing",
    description: "Warm, modern, and energetic for marketing-focused teams.",
    swatches: ["#FFF4EA", "#FF8A3D", "#FFD200", "#EF7700", "#FF5A5F"],
    preview: { bg: "#FFF8F1", sidebar: "#FFF4EA", sidebarText: "#334155", accent: "#FF8A3D", surface: "#FFFFFF", text: "#101820" },
  },
];

function ThemePreview({ preview }: { preview: (typeof THEME_OPTIONS)[number]["preview"] }) {
  return (
    <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--crm-border)", background: preview.bg }}>
      <div className="flex h-28">
        <div className="w-1/3 p-2 flex flex-col gap-1.5" style={{ background: preview.sidebar }}>
          <div className="h-2 rounded" style={{ background: preview.sidebarText, opacity: 0.4, width: "70%" }} />
          <div className="h-2 rounded" style={{ background: preview.sidebarText, opacity: 0.25, width: "55%" }} />
          <div className="h-2 rounded" style={{ background: preview.sidebarText, opacity: 0.25, width: "60%" }} />
          <div className="mt-1 h-3 rounded" style={{ background: preview.accent, width: "80%" }} />
        </div>
        <div className="flex-1 p-2 flex flex-col gap-1.5">
          <div className="flex gap-1.5">
            <div className="h-7 flex-1 rounded" style={{ background: preview.surface, border: "1px solid rgba(0,0,0,0.06)" }} />
            <div className="h-7 flex-1 rounded" style={{ background: preview.surface, border: "1px solid rgba(0,0,0,0.06)" }} />
            <div className="h-7 flex-1 rounded" style={{ background: preview.surface, border: "1px solid rgba(0,0,0,0.06)" }} />
          </div>
          <div className="flex-1 rounded" style={{ background: preview.surface, border: "1px solid rgba(0,0,0,0.06)" }} />
        </div>
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useCrmTheme();

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white text-lg">CRM Theme</h2>
          <p className="mt-1 text-sm text-white/60">Choose how CEVONS Growth Command looks for your team.</p>
        </div>
        <Sun className="h-5 w-5 text-white/40" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {THEME_OPTIONS.map((opt) => {
          const selected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className="text-left rounded-xl border p-4 transition focus:outline-none focus-visible:ring-2"
              style={{
                background: "var(--crm-surface)",
                borderColor: selected ? "var(--crm-primary)" : "var(--crm-border)",
                boxShadow: selected ? "0 0 0 2px var(--crm-primary)" : "var(--crm-card-shadow)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold" style={{ color: "var(--crm-text)" }}>{opt.name}</h3>
                    {opt.badge && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ background: "var(--crm-primary)", color: "#fff" }}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: "var(--crm-text-muted)" }}>{opt.description}</p>
                </div>
                <span
                  aria-hidden
                  className="grid place-items-center h-6 w-6 rounded-full border shrink-0"
                  style={{
                    borderColor: selected ? "var(--crm-primary)" : "var(--crm-border)",
                    background: selected ? "var(--crm-primary)" : "transparent",
                    color: "#fff",
                  }}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                </span>
              </div>

              <div className="mt-4">
                <ThemePreview preview={opt.preview} />
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                {opt.swatches.map((c) => (
                  <span
                    key={c}
                    title={c}
                    className="h-5 w-5 rounded-full border"
                    style={{ background: c, borderColor: "rgba(0,0,0,0.08)" }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--crm-text-muted)" }}>
                  {selected ? "Currently applied" : "Click to apply"}
                </span>
                <span
                  className="rounded-md px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background: selected ? "var(--crm-surface-muted)" : "var(--crm-primary)",
                    color: selected ? "var(--crm-text)" : "#fff",
                  }}
                >
                  {selected ? "Applied" : "Apply Theme"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs" style={{ color: "var(--crm-text-muted)" }}>
        Your theme preference is saved on this device.
      </p>
    </section>
  );
}

/* ─── shared field & toggle ─────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-white/50">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 focus-within:border-[#FFD200]/40">
        {icon}
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>
    </div>
  );
}

function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition ${active ? "bg-[#EF7700]" : "bg-white/[0.1]"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${active ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}
