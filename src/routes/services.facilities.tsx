import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage, getCategoryConfig } from "@/components/category/CategoryLandingPage";
import { breadcrumbListJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";

const cfg = getCategoryConfig("facilities");

export const Route = createFileRoute("/services/facilities")({
  head: () => ({
    meta: [
      { title: `${cfg.label} & Environmental Infrastructure | CEVONS Guyana` },
      { name: "description", content: cfg.intro },
      { property: "og:title", content: `${cfg.label} — CEVONS` },
      { property: "og:description", content: cfg.intro },
      { property: "og:url", content: "/services/facilities" },
    ],
    links: [{ rel: "canonical", href: "/services/facilities" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: cfg.label, path: "/services/facilities" },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(faqPageJsonLd(cfg.faqs)),
      },
    ],
  }),
  component: () => <CategoryLandingPage category="facilities" />,
});
