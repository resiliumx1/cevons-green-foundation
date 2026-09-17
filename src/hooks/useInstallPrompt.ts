import { useCallback, useEffect, useState } from "react";

/**
 * Everything needed to invite an admin to install CEVONS Admin on the device
 * they are holding, without ever nagging someone who already did.
 *
 * Chrome/Edge (Android + desktop) fire `beforeinstallprompt`, which we hold on
 * to so a real button can trigger the browser's own install sheet. Safari on
 * iOS/iPadOS gives no such event — there the only route is Share -> Add to
 * Home Screen, so the UI shows those steps instead.
 */

const DISMISS_KEY = "cevons-admin-install-dismissed";
const DISMISS_DAYS = 30;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    // iOS Safari exposes its own flag rather than the display-mode query.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOs = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOs;
}

function dismissedRecently() {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export type InstallPrompt = {
  /** Browser can install it right now with one tap. */
  canInstall: boolean;
  /** iPhone/iPad: manual Add to Home Screen steps are the only option. */
  needsIosSteps: boolean;
  /** Already running as an installed app. */
  installed: boolean;
  /** Hidden because it is installed, or the banner was dismissed recently. */
  dismissed: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  dismiss: () => void;
};

export function useInstallPrompt(): InstallPrompt {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIos() && !isStandalone());
    setDismissed(dismissedRecently());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return "unavailable" as const;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") setInstalled(true);
    return outcome;
  }, [deferred]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* private mode — dismissing for this session is enough */
    }
    setDismissed(true);
  }, []);

  return {
    canInstall: Boolean(deferred) && !installed,
    needsIosSteps: ios && !installed,
    installed,
    dismissed,
    promptInstall,
    dismiss,
  };
}
