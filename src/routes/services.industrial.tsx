import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage, getCategoryConfig } from "@/components/category/CategoryLandingPage";
import { breadcrumbListJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";

const cfg = getCategoryConfig("industrial");

export const Route = createFileRoute("/services/industrial")({
  head: () => ({
    meta: [
      { title: `${cfg.label} & Regulated Waste Services | CEVONS Guyana` },
      { name: "description", content: cfg.intro },
      { property: "og:title", content: `${cfg.label} Waste Services — CEVONS` },
      { property: "og:description", content: cfg.intro },
      { property: "og:url", content: "/services/industrial" },
    ],
    links: [{ rel: "canonical", href: "/services/industrial" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: cfg.label, path: "/services/industrial" },
          ]),
        ),
      },
    ],
  }),
  component: () => <CategoryLandingPage category="industrial" />,
});
