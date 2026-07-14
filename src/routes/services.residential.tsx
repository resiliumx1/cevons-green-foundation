import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage, getCategoryConfig } from "@/components/category/CategoryLandingPage";
import { breadcrumbListJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";

const cfg = getCategoryConfig("residential");

export const Route = createFileRoute("/services/residential")({
  head: () => ({
    meta: [
      { title: `${cfg.label} Waste Services | CEVONS Guyana` },
      { name: "description", content: cfg.intro },
      { property: "og:title", content: `${cfg.label} Waste Services — CEVONS` },
      { property: "og:description", content: cfg.intro },
      { property: "og:url", content: "/services/residential" },
    ],
    links: [{ rel: "canonical", href: "/services/residential" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: cfg.label, path: "/services/residential" },
          ]),
        ),
      },
    ],
  }),
  component: () => <CategoryLandingPage category="residential" />,
});
