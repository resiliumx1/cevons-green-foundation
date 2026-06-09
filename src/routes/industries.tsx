import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/industries")({
  head: () => ({ meta: [{ title: "Industries — CEVON'S" }, { name: "description", content: "Industries we serve across Guyana." }], links: [{ rel: "canonical", href: "/industries" }] }),
  component: () => (
    <SiteLayout>
      <section className="bg-cevons-deep-green text-white">
        <div className="container-cevons py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-extrabold">Industries</h1>
          <p className="mt-4 text-white/80 max-w-xl">Specialized environmental solutions across the industries we serve.</p>
        </div>
        <div className="brand-ribbon" />
      </section>
      <section className="section-y container-cevons">
        <p className="text-cevons-muted">Industry pages coming soon.</p>
      </section>
    </SiteLayout>
  ),
});
