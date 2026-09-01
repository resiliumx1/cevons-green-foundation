import { useCallback, useEffect, useState } from "react";
import { BellRing, BellOff, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  PUSH_MESSAGE,
  currentPushToken,
  disablePush,
  enablePush,
  pushIsConfigured,
} from "@/lib/push/enablePush";
import { registerPushToken, unregisterPushToken } from "@/lib/push.functions";

/**
 * Lets an admin switch phone/desktop push alerts on for the device they are
 * using right now. Each device is registered separately, exactly like a
 * native app.
 */
export function PushDevicesCard() {
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    void currentPushToken().then((token) => {
      if (!alive) return;
      setEnabled(Boolean(token));
      setChecking(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const turnOn = useCallback(async () => {
    setBusy(true);
    try {
      const result = await enablePush();
      if (result.status !== "registered" || !result.token) {
        toast.error(PUSH_MESSAGE[result.status]);
        return;
      }
      await registerPushToken({
        data: { token: result.token, userAgent: navigator.userAgent },
      });
      setEnabled(true);
      toast.success("Alerts are on for this device.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not switch alerts on.");
    } finally {
      setBusy(false);
    }
  }, []);

  const turnOff = useCallback(async () => {
    setBusy(true);
    try {
      const token = await disablePush();
      if (token) await unregisterPushToken({ data: { token } });
      setEnabled(false);
      toast.success("Alerts are off for this device.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not switch alerts off.");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EF7700]/15 text-[#EF7700]">
          <Smartphone className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-white">Alerts on this device</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            Get a phone notification the moment a service request, message or review comes in — even
            when the admin is closed. Install CEVONS Admin to your home screen first for the best
            experience, then switch alerts on from the installed app.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {enabled ? (
          <button
            onClick={turnOff}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50"
          >
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
            Turn alerts off
          </button>
        ) : (
          <button
            onClick={turnOn}
            disabled={busy || checking}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50"
          >
            {busy || checking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="h-4 w-4" />
            )}
            {checking ? "Checking…" : "Turn alerts on"}
          </button>
        )}
        <span className="text-xs text-white/50">
          {enabled
            ? "This device will receive alerts."
            : pushIsConfigured()
              ? "Alerts are off for this device."
              : PUSH_MESSAGE["not-configured"]}
        </span>
      </div>
    </section>
  );
}
