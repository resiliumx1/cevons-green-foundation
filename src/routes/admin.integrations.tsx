import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { PlugZap, RefreshCw, Send, History } from "lucide-react";
import { toast } from "sonner";

import { CrmPage } from "@/components/motion/CrmMotion";
import { Panel, PanelEmpty, PanelError, PanelSkeleton, DocketStrip } from "@/components/admin/Manifest";
import {
  getCesQueueStatus,
  runCesBackfillPage,
  runCesDrain,
  retryCesFailures,
  runCesReconcile,
} from "@/lib/cesOutbox.functions";

export const Route = createFileRoute("/admin/integrations")({
  head: () => ({
    meta: [
      { title: "Connections | CEVONS Website Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: IntegrationsPage,
});

/**
 * Connections.
 *
 * Shows the state of the hand-off that sends every website request to the CES
 * Marketing Inbox. Sending is queued and retried in the background; nothing
 * here can affect or delete a customer's original request.
 */
function IntegrationsPage() {
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getCesQueueStatus);
  const backfill = useServerFn(runCesBackfillPage);
  const drain = useServerFn(runCesDrain);
  const retry = useServerFn(retryCesFailures);
  const reconcile = useServerFn(runCesReconcile);

  const [cursor, setCursor] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const status = useQuery({
    queryKey: ["ces-queue-status"],
    queryFn: () => fetchStatus({ data: undefined as never }),
    staleTime: 30_000,
  });

  const ready = status.data?.config.ready ?? false;

  const backfillPage = useMutation({
    mutationFn: () =>
      backfill({ data: { entityType: "service_request", after: cursor, pageSize: 50 } }),
    onSuccess: (r) => {
      setCursor(r.nextCursor);
      setProgress(
        `Queued ${r.queued} of ${r.scanned} checked — ${r.alreadyQueued} were already waiting. ` +
          (r.nextCursor ? "More history left; press again to continue." : "All retained requests are queued."),
      );
      toast.success(r.nextCursor ? "Page queued" : "Backfill complete");
      void qc.invalidateQueries({ queryKey: ["ces-queue-status"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not queue this page."),
  });

  const sendNow = useMutation({
    mutationFn: () => drain({ data: { limit: 25 } }),
    onSuccess: (r) => {
      if (!r.configured) {
        toast.error("The CES address and shared key are not saved yet.");
        return;
      }
      toast.success(`Sent ${r.sent} of ${r.attempted}. ${r.failed} failed.`);
      setProgress(
        r.failures.length
          ? `Failures: ${r.failures.map((f) => `${f.reference ?? "—"} (${f.error})`).join("; ")}`
          : `Sent ${r.sent} request${r.sent === 1 ? "" : "s"}.`,
      );
      void qc.invalidateQueries({ queryKey: ["ces-queue-status"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Sending failed."),
  });

  const retryAll = useMutation({
    mutationFn: () => retry({ data: undefined as never }),
    onSuccess: (r) => {
      toast.success(`${r.reset} put back in line.`);
      void qc.invalidateQueries({ queryKey: ["ces-queue-status"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not retry."),
  });

  const checkCes = useMutation({
    mutationFn: () => reconcile({ data: { limit: 200, requeueMissing: false } }),
    onSuccess: (r) => {
      if (r.error) {
        toast.error(r.error);
        return;
      }
      toast.success(`Checked ${r.checked}: ${r.matched} confirmed by CES.`);
      setProgress(
        r.missing.length
          ? `CES is missing ${r.missing.length}: ${r.missing
              .slice(0, 10)
              .map((m) => m.reference ?? m.externalId)
              .join(", ")}. Use “Retry failures” or resend to send them again.`
          : `All ${r.matched} checked requests are present in CES.`,
      );
      void qc.invalidateQueries({ queryKey: ["ces-queue-status"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not check CES."),
  });

  return (
    <CrmPage>
      <div className="admin-stack">
        <Panel title="CES Marketing Inbox" code="INT-01">
          {status.isLoading ? (
            <PanelSkeleton rows={3} />
          ) : status.isError ? (
            <PanelError what="the CES connection" error={status.error} />
          ) : (
            <>
              <DocketStrip
                cells={[
                  { code: "WAI", label: "Waiting", value: String(status.data!.counts.pending) },
                  { code: "SNT", label: "Sent", value: String(status.data!.counts.sent) },
                  { code: "RTY", label: "Retrying", value: String(status.data!.counts.failed) },
                  { code: "STK", label: "Stuck", value: String(status.data!.counts.dead) },
                ]}
              />
              <p className="admin-note">
                <PlugZap className="h-4 w-4" aria-hidden />
                {ready
                  ? `Connected to ${status.data!.config.host}. Requests are sent automatically and retried if CES is down.`
                  : "Not connected yet. The CES address and shared key still need to be saved, and CES must confirm the exact format it expects. Sending stays paused until then."}
              </p>
              <p className="admin-note">
                <History className="h-4 w-4" aria-hidden />
                {status.data!.retained.serviceRequests} service requests and{" "}
                {status.data!.retained.contactMessages} contact messages are kept on this website. Nothing
                here removes or changes them.
              </p>
            </>
          )}
        </Panel>

        <Panel title="Send and catch up" code="INT-02">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-link-btn"
              disabled={!ready || sendNow.isPending}
              onClick={() => sendNow.mutate()}
            >
              <Send className="h-4 w-4" aria-hidden /> {sendNow.isPending ? "Sending…" : "Send waiting requests"}
            </button>
            <button
              type="button"
              className="admin-link-btn"
              disabled={!ready || backfillPage.isPending}
              onClick={() => backfillPage.mutate()}
            >
              <History className="h-4 w-4" aria-hidden />{" "}
              {backfillPage.isPending ? "Queueing…" : cursor ? "Queue next page of history" : "Queue past requests"}
            </button>
            <button
              type="button"
              className="admin-link-btn"
              disabled={!ready || retryAll.isPending}
              onClick={() => retryAll.mutate()}
            >
              <RefreshCw className="h-4 w-4" aria-hidden /> Retry failures
            </button>
          </div>
          {!ready && (
            <p className="admin-note">
              These controls stay switched off until the connection is saved and tested, so no history can be
              sent by accident.
            </p>
          )}
          {progress && (
            <p className="admin-note" role="status">
              {progress}
            </p>
          )}
          <p className="admin-note">
            Past requests are marked as history, so CES does not raise a new alert for them. Running it again
            never sends the same request twice.
          </p>
        </Panel>

        <Panel title="Recent problems" code="INT-03">
          {status.isLoading ? (
            <PanelSkeleton rows={2} />
          ) : (status.data?.recentFailures.length ?? 0) === 0 ? (
            <PanelEmpty headline="No delivery problems recorded." />
          ) : (
            <ul className="admin-bars">
              {status.data!.recentFailures.map((f) => (
                <li key={`${f.reference}-${f.attempts}`} className="text-sm" style={{ color: "var(--text)" }}>
                  <span className="admin-mono">{f.reference ?? "—"}</span> · {f.entityType.replace("_", " ")} ·{" "}
                  attempt {f.attempts}
                  {f.lastStatusCode ? ` · code ${f.lastStatusCode}` : ""}
                  <span className="block text-xs" style={{ color: "var(--text-2)" }}>
                    {f.lastError}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </CrmPage>
  );
}
