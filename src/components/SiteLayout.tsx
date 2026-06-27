import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageTransition } from "./motion/PageTransition";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}



