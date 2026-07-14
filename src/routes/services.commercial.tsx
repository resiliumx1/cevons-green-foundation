import { createFileRoute } from "@tanstack/react-router";
import { CategoryLandingPage, getCategoryConfig } from "@/components/category/CategoryLandingPage";
import { breadcrumbListJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";

const cfg = getCategoryConfig("commercial");

export const Route = createFileRoute("/services/commercial")({
  head: () => ({
    meta: [
      { title: `${cfg.label} Waste Services | CEVONS Guyana` },
      { name: "description", content: cfg.intro },
      { property: "og:title", content: `${cfg.label} Waste Services — CEVONS` },
      { property: "og:description", content: cfg.intro },
      { property: "og:url", content: "/services/commercial" },
    ],
    links: [{ rel: "canonical", href: "/services/commercial" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: cfg.label, path: "/services/commercial" },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(faqPageJsonLd(cfg.faqs)),
      },
    ],
  }),
  component: () => <CategoryLandingPage category="commercial" />,
});
