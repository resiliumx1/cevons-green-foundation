import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources — CEVON'S" }, { name: "description", content: "Guides and resources for waste management." }], links: [{ rel: "canonical", href: "/resources" }] }),
  component: () => (
    <SiteLayout>
      <section className="bg-cevons-deep-green text-white">
        <div className="container-cevons py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-extrabold">Resources</h1>
        </div>
        <div className="brand-ribbon" />
      </section>
      <section className="section-y container-cevons">
        <p className="text-cevons-muted">Resources and guides coming soon.</p>
      </section>
    </SiteLayout>
  ),
});
