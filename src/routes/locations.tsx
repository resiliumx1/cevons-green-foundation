import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/locations")({
  head: () => ({ meta: [{ title: "Locations — CEVON'S" }, { name: "description", content: "Serving Georgetown, Linden and Berbice." }], links: [{ rel: "canonical", href: "/locations" }] }),
  component: () => (
    <SiteLayout>
      <section className="bg-cevons-deep-green text-white">
        <div className="container-cevons py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-extrabold">Locations</h1>
          <p className="mt-4 text-white/80 max-w-xl">Proudly serving Georgetown, Linden and Berbice.</p>
        </div>
        <div className="brand-ribbon" />
      </section>
      <section className="section-y container-cevons">
        <p className="text-cevons-muted">Detailed location pages coming soon.</p>
      </section>
    </SiteLayout>
  ),
});
