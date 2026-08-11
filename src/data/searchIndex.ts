import { services } from "@/data/services";

export type SearchGroup = "Services" | "Pages" | "Quick actions";

export type SearchEntry = {
  id: string;
  name: string;
  desc: string;
  to: string;
  group: SearchGroup;
  /** extra match terms (synonyms) */
  keywords?: string[];
  /** external / non-router link */
  external?: boolean;
};

const serviceEntries: SearchEntry[] = services
  .filter((s) => !s.retired && !s.comingSoon && s.categories.length > 0)
  .map((s) => ({
  id: `svc-${s.slug}`,
  name: s.title,
  desc: s.shortBody,
  to: s.path,
  group: "Services",
  keywords: s.categories,
}));

const pageEntries: SearchEntry[] = [
  { id: "pg-home", name: "Home", desc: "CEVONS Environmental Services — waste and recycling in Guyana.", to: "/", group: "Pages" },
  { id: "pg-services", name: "Services", desc: "Browse every residential, commercial, and industrial service.", to: "/services", group: "Pages", keywords: ["all", "list"] },
  { id: "pg-industries", name: "Industries", desc: "Sectors we serve across Guyana.", to: "/industries", group: "Pages" },
  { id: "pg-locations", name: "Locations", desc: "Branches and service areas.", to: "/locations", group: "Pages", keywords: ["branch", "map", "areas"] },
  { id: "pg-resources", name: "Resources", desc: "Guides, downloads, and useful information.", to: "/resources", group: "Pages", keywords: ["guides", "faq"] },
  { id: "pg-about", name: "About", desc: "Who we are and how we work.", to: "/about", group: "Pages", keywords: ["company", "team"] },
  { id: "pg-careers", name: "Careers", desc: "Open roles and life at CEVONS.", to: "/careers", group: "Pages", keywords: ["jobs", "hiring", "vacancy"] },
  { id: "pg-contact", name: "Contact", desc: "Phone, WhatsApp, email, and our contact form.", to: "/contact", group: "Pages", keywords: ["email", "call", "reach"] },
  { id: "pg-track", name: "Track Request", desc: "Check the status of an existing service request.", to: "/track-request", group: "Pages", keywords: ["status", "reference", "order"] },
  { id: "pg-request", name: "Request a Service", desc: "Start the booking wizard and tell us what you need.", to: "/request-service", group: "Pages", keywords: ["book", "quote", "schedule"] },
];

const quickActions: SearchEntry[] = [
  { id: "qa-book", name: "Book now", desc: "Start a service request in the booking wizard.", to: "/request-service", group: "Quick actions", keywords: ["book", "schedule", "order", "request"] },
  { id: "qa-bin", name: "Book a bin", desc: "Reserve a dumpster or skip bin for your project.", to: "/request-service?service=skip-bin-dumpster-rental", group: "Quick actions", keywords: ["bin", "dumpster", "skip", "container", "book a bin"] },
  { id: "qa-scrap", name: "Sell scrap metal", desc: "We buy ferrous, non-ferrous, cable, and lead batteries.", to: "/services/scrap-metal-recycling", group: "Quick actions", keywords: ["sell", "scrap", "metal", "copper", "buy"] },
  { id: "qa-rates", name: "Prices & rates", desc: "Scrap metal rates are updated every two weeks — contact us for today's rates.", to: "/services/scrap-metal-recycling", group: "Quick actions", keywords: ["price", "prices", "rate", "rates", "cost", "pricing"] },
  { id: "qa-sizes", name: "Skip bin sizes", desc: "Compare 10, 20 and 52 cu yd bins", to: "/services/skip-bin-dumpster-rental", group: "Quick actions", keywords: ["size", "sizes", "10", "20", "cubic"] },
  { id: "qa-contact", name: "Contact us", desc: "Phone, WhatsApp, and email — talk to the team.", to: "/contact", group: "Quick actions", keywords: ["phone", "whatsapp", "call", "email", "contact"] },
];

export const searchIndex: SearchEntry[] = [...serviceEntries, ...pageEntries, ...quickActions];

export const popularActions: SearchEntry[] = [
  quickActions[0], // Book now
  quickActions[2], // Sell scrap metal
  quickActions[4], // Skip bin sizes
  quickActions[5], // Contact us
];

const GROUP_ORDER: SearchGroup[] = ["Services", "Pages", "Quick actions"];

function scoreEntry(entry: SearchEntry, q: string, tokens: string[]): number {
  const name = entry.name.toLowerCase();
  const desc = entry.desc.toLowerCase();
  const keys = (entry.keywords ?? []).map((k) => k.toLowerCase());
  let score = 0;

  if (name === q) score += 200;
  if (name.startsWith(q)) score += 120;
  if (name.includes(q)) score += 80;
  if (keys.some((k) => k === q)) score += 90;
  if (keys.some((k) => k.startsWith(q))) score += 60;
  if (keys.some((k) => k.includes(q))) score += 40;
  if (desc.includes(q)) score += 20;

  for (const t of tokens) {
    if (name.split(/[^a-z0-9]+/).some((w) => w.startsWith(t))) score += 30;
    if (keys.some((k) => k.split(/[^a-z0-9]+/).some((w) => w.startsWith(t)))) score += 18;
    if (desc.split(/[^a-z0-9]+/).some((w) => w.startsWith(t))) score += 8;
  }
  return score;
}

export function searchSite(query: string, limit = 7): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);

  return searchIndex
    .map((entry) => ({ entry, score: scoreEntry(entry, q, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const g = GROUP_ORDER.indexOf(a.entry.group) - GROUP_ORDER.indexOf(b.entry.group);
      if (g !== 0) return g;
      return a.entry.name.localeCompare(b.entry.name);
    })
    .slice(0, limit)
    .map((r) => r.entry);
}

export function groupResults(entries: SearchEntry[]): { group: SearchGroup; items: SearchEntry[] }[] {
  return GROUP_ORDER.map((group) => ({ group, items: entries.filter((e) => e.group === group) })).filter(
    (g) => g.items.length > 0,
  );
}
