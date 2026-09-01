/**
 * Browser-side push registration for the CEVONS Admin app.
 *
 * Uses Firebase Cloud Messaging. Everything here is browser-only and must be
 * called from a real user gesture — browsers refuse permission prompts
 * otherwise, and refuse them entirely inside a cross-origin iframe (the
 * Lovable editor preview).
 */

const appId = import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID"] as
  | string
  | undefined;
const vapidKey = import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY"] as
  | string
  | undefined;

export const firebaseConfig = {
  apiKey: import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY"] as
    | string
    | undefined,
  projectId: import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID"] as
    | string
    | undefined,
  appId,
  messagingSenderId: appId?.split(":")[1] ?? "",
};

export type PushStatus =
  | "registered"
  | "not-configured"
  | "unsupported"
  | "open-in-new-tab"
  | "denied"
  | "failed";

export type PushResult = { status: PushStatus; token?: string; detail?: string };

export function pushIsConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      appId &&
      vapidKey &&
      firebaseConfig.messagingSenderId,
  );
}

/** Human copy for every non-success outcome, written for a non-technical admin. */
export const PUSH_MESSAGE: Record<Exclude<PushStatus, "registered">, string> = {
  "not-configured":
    "Push notifications aren’t set up for this site yet. Ask your developer to finish the notification connection.",
  unsupported:
    "This browser can’t show push notifications. On iPhone, add CEVONS Admin to your home screen first, then try again from the installed app.",
  "open-in-new-tab":
    "Open the admin in its own browser tab (or the installed app) and try again — notifications can’t be switched on inside the preview window.",
  denied:
    "Notifications are blocked for this site. Allow them in your browser’s site settings, then try again.",
  failed: "Something went wrong switching notifications on. Please try again.",
};

async function loadMessaging() {
  const [{ initializeApp, getApps, getApp }, messaging] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ]);
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
  return { app, ...messaging };
}

/** True when this browser already holds an FCM registration for this site. */
export async function currentPushToken(): Promise<string | null> {
  if (!pushIsConfigured()) return null;
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (Notification.permission !== "granted") return null;
  try {
    const { app, getMessaging, getToken, isSupported } = await loadMessaging();
    if (!(await isSupported())) return null;
    const registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (!registration) return null;
    return await getToken(getMessaging(app), { vapidKey: vapidKey!, serviceWorkerRegistration: registration });
  } catch {
    return null;
  }
}

/** Ask for permission, register the messaging worker and return the device token. */
export async function enablePush(): Promise<PushResult> {
  if (!pushIsConfigured()) return { status: "not-configured" };
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return { status: "unsupported" };
  }
  if (window.top !== window.self) return { status: "open-in-new-tab" };

  try {
    const { app, getMessaging, getToken, isSupported } = await loadMessaging();
    if (!(await isSupported())) return { status: "unsupported" };

    const permission =
      Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission !== "granted") return { status: "denied" };

    const query = new URLSearchParams(firebaseConfig as Record<string, string>).toString();
    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${query}`);
    const token = await getToken(getMessaging(app), {
      vapidKey: vapidKey!,
      serviceWorkerRegistration: registration,
    });
    return token ? { status: "registered", token } : { status: "denied" };
  } catch (error) {
    return { status: "failed", detail: error instanceof Error ? error.message : String(error) };
  }
}

/** Drop the token for this device and remove the messaging worker. */
export async function disablePush(): Promise<string | null> {
  try {
    const token = await currentPushToken();
    const { app, getMessaging, deleteToken } = await loadMessaging();
    try {
      await deleteToken(getMessaging(app));
    } catch {
      /* token may already be gone */
    }
    const registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    await registration?.unregister();
    return token;
  } catch {
    return null;
  }
}
