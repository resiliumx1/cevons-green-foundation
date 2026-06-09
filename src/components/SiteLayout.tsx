import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TrustStrip } from "./TrustStrip";
import { PageTransition } from "./motion/PageTransition";
import { ServiceAssistant } from "./chat/ServiceAssistant";
import { SmoothScrollProvider } from "./motion/SmoothScroll";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="min-h-dvh flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <TrustStrip />
        <Footer />
        <ServiceAssistant />
      </div>
    </SmoothScrollProvider>
  );
}

