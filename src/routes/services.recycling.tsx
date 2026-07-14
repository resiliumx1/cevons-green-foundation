import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage, getCategoryConfig } from "@/components/category/CategoryLandingPage";
import { breadcrumbListJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";

const cfg = getCategoryConfig("recycling");

export const Route = createFileRoute("/services/recycling")({
  head: () => ({
    meta: [
      { title: `${cfg.label} & Resource Recovery | CEVONS Guyana` },
      { name: "description", content: cfg.intro },
      { property: "og:title", content: `${cfg.label} Programs — CEVONS` },
      { property: "og:description", content: cfg.intro },
      { property: "og:url", content: "/services/recycling" },
    ],
    links: [{ rel: "canonical", href: "/services/recycling" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: cfg.label, path: "/services/recycling" },
          ]),
        ),
      },
    ],
  }),
  component: () => <CategoryLandingPage category="recycling" />,
});
