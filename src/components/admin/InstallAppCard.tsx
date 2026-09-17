import { useCallback, useState } from "react";
import { Download, Share, Plus, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/**
 * Invites an admin to install CEVONS Admin on the device they are using.
 *
 * "banner" is the dismissible strip on the dashboard; "card" is the permanent
 * block in Settings, which also confirms when the app is already installed.
 */
export function InstallAppCard({ variant = "card" }: { variant?: "card" | "banner" }) {
  const { canInstall, needsIosSteps, installed, dismissed, promptInstall, dismiss } =
    useInstallPrompt();
  const [busy, setBusy] = useState(false);

  const install = useCallback(async () => {
    setBusy(true);
    try {
      const outcome = await promptInstall();
      if (outcome === "accepted") toast.success("CEVONS Admin is installing on this device.");
      if (outcome === "unavailable") {
        toast.message(
          "Use your browser menu and choose “Install app” or “Add to Home screen” to install CEVONS Admin.",
        );
      }
    } finally {
      setBusy(false);
    }
  }, [promptInstall]);

  if (variant === "banner") {
    if (installed || dismissed || (!canInstall && !needsIosSteps)) return null;

    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#EF7700]/30 bg-[#EF7700]/10 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EF7700]/20 text-[#EF7700]">
          <Download className="h-4 w-4" aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-sm text-foreground">
          <span className="font-semibold">Install CEVONS Admin</span>{" "}
          <span className="text-muted-foreground">
            {needsIosSteps
              ? "— tap Share, then “Add to Home Screen” to get it as an app with alerts."
              : "— open it like an app and get alerts for new requests and messages."}
          </span>
        </p>
        {canInstall ? (
          <button
            onClick={install}
            disabled={busy}
            className="rounded-lg bg-[#EF7700] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#EF7700]/90 disabled:opacity-50"
          >
            Install
          </button>
        ) : null}
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-black/5"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#101820] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EF7700]/15 text-[#EF7700]">
          {installed ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <Download className="h-5 w-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-white">Install CEVONS Admin</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            {installed
              ? "This device is already running the installed app. Alerts can be switched on below."
              : "Add CEVONS Admin to your home screen to open it like any other app — full screen, CEVONS icon, and phone alerts for new requests and messages."}
          </p>
        </div>
      </div>

      {!installed && needsIosSteps ? (
        <ol className="mt-4 space-y-2 text-xs text-white/70">
          <li className="flex items-center gap-2">
            <Share className="h-4 w-4 text-[#EF7700]" aria-hidden />
            <span>
              1. Tap the <strong className="text-white">Share</strong> button in Safari.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#EF7700]" aria-hidden />
            <span>
              2. Choose <strong className="text-white">Add to Home Screen</strong>.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#EF7700]" aria-hidden />
            <span>
              3. Open CEVONS Admin from your home screen, then switch alerts on below.
            </span>
          </li>
        </ol>
      ) : null}

      {!installed && !needsIosSteps ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={install}
            disabled={busy || !canInstall}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFD200] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD200]/90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Install app
          </button>
          {!canInstall ? (
            <span className="text-xs text-white/50">
              Not offered by this browser — use its menu and choose “Install app” or “Add to Home
              screen”.
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
