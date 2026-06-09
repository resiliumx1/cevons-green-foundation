import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type ServiceRequest = Database["public"]["Tables"]["service_requests"]["Row"];

export const JOB_STATUSES = ["scheduled", "in_progress", "completed", "cancelled"] as const;
export type JobStatus = typeof JOB_STATUSES[number];

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  scheduled: "bg-[#006B35]/15 text-[#006B35] border-[#006B35]/30",
  in_progress: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  completed: "bg-white/[0.06] text-white/60 border-white/[0.1]",
  cancelled: "bg-red-500/10 text-red-300/70 border-red-500/20",
};

// Color used for calendar event blocks
export const JOB_STATUS_CALENDAR: Record<JobStatus, { bg: string; border: string; dot: string }> = {
  scheduled: { bg: "bg-[#006B35]/15", border: "border-l-[#006B35]", dot: "bg-[#006B35]" },
  in_progress: { bg: "bg-purple-500/15", border: "border-l-purple-400", dot: "bg-purple-400" },
  completed: { bg: "bg-white/[0.06]", border: "border-l-white/30", dot: "bg-white/40" },
  cancelled: { bg: "bg-red-500/10", border: "border-l-red-400/70", dot: "bg-red-400/70" },
};

export function generateJobNumber() {
  const stamp = Date.now().toString().slice(-6);
  return `JOB-${stamp}`;
}

export function useJobs() {
  return useQuery({
    queryKey: ["crm", "jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("scheduled_start", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Job[];
    },
  });
}

export function useCustomersLite() {
  return useQuery({
    queryKey: ["crm", "customers", "lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name, region").order("name");
      if (error) throw error;
      return (data ?? []) as Pick<Customer, "id" | "name" | "region">[];
    },
  });
}

export function useQuotesLite() {
  return useQuery({
    queryKey: ["crm", "quotes", "lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("id, number, customer_id, title")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Pick<Quote, "id" | "number" | "customer_id" | "title">[];
    },
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ["crm", "pending-requests"],
    queryFn: async () => {
      const [reqsR, jobsR] = await Promise.all([
        supabase
          .from("service_requests")
          .select("*")
          .not("preferred_date", "is", null)
          .order("preferred_date", { ascending: true }),
        supabase.from("jobs").select("service_request_id").not("service_request_id", "is", null),
      ]);
      if (reqsR.error) throw reqsR.error;
      if (jobsR.error) throw jobsR.error;
      const claimed = new Set((jobsR.data ?? []).map((j) => j.service_request_id as string));
      return ((reqsR.data ?? []) as ServiceRequest[]).filter(
        (r) => !claimed.has(r.id) && r.status !== "lost" && r.status !== "won",
      );
    },
  });
}

export function useJobMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["crm", "jobs"] });
    qc.invalidateQueries({ queryKey: ["crm", "pending-requests"] });
  };

  const create = useMutation({
    mutationFn: async (payload: Omit<JobInsert, "number"> & { number?: string }) => {
      const { error } = await supabase.from("jobs").insert({
        ...payload,
        number: payload.number ?? generateJobNumber(),
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: JobUpdate }) => {
      const { error } = await supabase.from("jobs").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const scheduleFromRequest = useMutation({
    mutationFn: async ({
      request,
      scheduled_start,
      assigned_to,
    }: {
      request: ServiceRequest;
      scheduled_start: string;
      assigned_to?: string | null;
    }) => {
      const { error: jobErr } = await supabase.from("jobs").insert({
        number: generateJobNumber(),
        service_request_id: request.id,
        customer_id: request.customer_id,
        service: request.service,
        region: request.region,
        address: request.details ? null : null,
        scheduled_start,
        assigned_to: assigned_to ?? null,
        status: "scheduled",
      });
      if (jobErr) throw jobErr;
      await supabase.from("service_requests").update({ status: "scheduled" }).eq("id", request.id);
    },
    onSuccess: invalidate,
  });

  return { create, update, remove, scheduleFromRequest };
}

export function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}
