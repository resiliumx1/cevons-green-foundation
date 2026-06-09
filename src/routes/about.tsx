import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — CEVON'S Environmental Services" }, { name: "description", content: "About CEVON'S Environmental Services Inc." }], links: [{ rel: "canonical", href: "/about" }] }),
  component: () => (
    <SiteLayout>
      <section className="bg-cevons-deep-green text-white">
        <div className="container-cevons py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-extrabold">About CEVON'S</h1>
          <p className="mt-4 text-white/80 max-w-xl">Building a cleaner Guyana since 1997.</p>
        </div>
        <div className="brand-ribbon" />
      </section>
      <section className="section-y container-cevons">
        <p className="text-cevons-muted">Full company story coming soon.</p>
      </section>
    </SiteLayout>
  ),
});
