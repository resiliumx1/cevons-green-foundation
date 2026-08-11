import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { NotFoundPage } from "../components/NotFoundPage";
import { SmoothScrollProvider } from "../components/motion/SmoothScroll";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { organizationJsonLd } from "../lib/seo/jsonLd";
import { ServiceAssistant } from "../components/chat/ServiceAssistant";


function NotFoundComponent() {
  if (typeof document !== "undefined") {
    document.title = "404 Page Not Found | CEVONS Environmental Services";
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
  }
  return <NotFoundPage />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CEVONS Environmental Services Inc." },
      { name: "description", content: "Reliable waste management and environmental services across Guyana." },
      { name: "author", content: "CEVONS Environmental Services Inc." },
      { property: "og:site_name", content: "CEVONS Environmental Services" },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#FFFFFF", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0E0C0A", media: "(prefers-color-scheme: dark)" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: OG_IMAGE_WIDTH },
      { property: "og:image:height", content: OG_IMAGE_HEIGHT },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Open+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" },
      // (LCP hero preload lives on the home route so other pages don't pay for it.)
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationJsonLd()),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-charcoal)]"
          style={{
            backgroundColor: "var(--brand-orange)",
            color: "var(--text-on-orange)",
          }}
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Password-recovery and invitation links always come back to the site root,
 * because that is the only redirect target the auth service accepts. Forward
 * those arrivals to the admin "Set a new password" screen, keeping the link
 * fragment intact so the session (or the error) is still readable there.
 */
function RecoveryLinkRedirect() {
  useEffect(() => {
    const { hash, pathname } = window.location;
    if (!hash || pathname.startsWith("/admin/reset-password")) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const isRecovery =
      type === "recovery" ||
      type === "invite" ||
      (params.has("access_token") && params.has("refresh_token")) ||
      params.get("error_code") === "otp_expired";
    if (!isRecovery) return;
    window.location.replace(`/admin/reset-password${hash}`);
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isCrm = pathname.startsWith("/admin");


  return (
    <QueryClientProvider client={queryClient}>
      <RecoveryLinkRedirect />
      <SettingsProvider>

        <CurrencyProvider>
          <SmoothScrollProvider enabled={!isCrm}>
            <Outlet />
            {!isCrm && <ServiceAssistant />}
          </SmoothScrollProvider>
        </CurrencyProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
