import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Download, Phone, Send, Sparkles } from "lucide-react";
import {
  ServiceActionButton,
  ServiceActionRow,
} from "@/components/services/ServiceActionButton";

export const Route = createFileRoute("/dev/service-action-button")({
  head: () => ({
    meta: [
      { title: "ServiceActionButton — Visual Story" },
      { name: "robots", content: "noindex,nofollow" },
      {
        name: "description",
        content:
          "Internal visual story for the ServiceActionButton component: variants, sizes, layouts, and interactive states.",
      },
    ],
  }),
  component: StoryPage,
});

function Section({
  title,
  description,
  children,
  bg = "#FFFFFF",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <section
      className="rounded-2xl border border-black/5 p-6 md:p-8 shadow-[0_1px_0_rgba(16,24,32,0.03)]"
      style={{ background: bg }}
    >
      <header className="mb-5">
        <h2 className="text-lg font-bold tracking-tight text-[var(--cevons-deep-green)]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-black/60">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/5 bg-white p-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/45">
        {label}
      </span>
      {children}
    </div>
  );
}

function StoryPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-orange)]">
            Component Story
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--cevons-deep-green)]">
            ServiceActionButton
          </h1>
          <p className="max-w-2xl text-sm text-black/60">
            Visual verification page for the reusable service CTA. Hover and
            keyboard-focus each button below to confirm sheen, lift, arrow
            slide, and focus-ring behavior across variants, sizes, and layout
            widths.
          </p>
        </header>

        {/* Variants */}
        <Section
          title="Variants"
          description="Two canonical variants used on every service card."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card label="learn (outlined)">
              <ServiceActionButton to="/services" variant="learn">
                Learn more
              </ServiceActionButton>
            </Card>
            <Card label="request (filled orange)">
              <ServiceActionButton to="/request-service" variant="request">
                Request
              </ServiceActionButton>
            </Card>
          </div>
        </Section>

        {/* Sizes */}
        <Section
          title="Sizes"
          description="Compact (sm) vs standard (md). Both remain full-width of parent."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card label="size = sm">
              <ServiceActionButton to="/services" variant="learn" size="sm">
                Learn more
              </ServiceActionButton>
              <ServiceActionButton
                to="/request-service"
                variant="request"
                size="sm"
              >
                Request
              </ServiceActionButton>
            </Card>
            <Card label="size = md (default)">
              <ServiceActionButton to="/services" variant="learn" size="md">
                Learn more
              </ServiceActionButton>
              <ServiceActionButton
                to="/request-service"
                variant="request"
                size="md"
              >
                Request
              </ServiceActionButton>
            </Card>
          </div>
        </Section>

        {/* Custom icons + labels */}
        <Section
          title="Custom icons & labels"
          description="Icon slot accepts any Lucide icon; label is any ReactNode."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card label="Send">
              <ServiceActionButton
                to="/request-service"
                variant="request"
                icon={Send}
              >
                Send request
              </ServiceActionButton>
            </Card>
            <Card label="Phone">
              <ServiceActionButton to="/contact" variant="learn" icon={Phone}>
                Call us
              </ServiceActionButton>
            </Card>
            <Card label="Download">
              <ServiceActionButton
                to="/services"
                variant="learn"
                icon={Download}
              >
                Brochure
              </ServiceActionButton>
            </Card>
            <Card label="Sparkles">
              <ServiceActionButton
                to="/request-service"
                variant="request"
                icon={Sparkles}
              >
                Get a quote
              </ServiceActionButton>
            </Card>
          </div>
        </Section>

        {/* ServiceActionRow */}
        <Section
          title="ServiceActionRow"
          description="Standard 2-up layout used on every /services card."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Card label="Row (md)">
              <ServiceActionRow
                learnTo="/services/dumpster-rental"
                ariaTitle="Dumpster Rental"
              />
            </Card>
            <Card label="Row (sm) + custom labels">
              <ServiceActionRow
                learnTo="/services/skip-bin"
                ariaTitle="Skip Bin"
                size="sm"
                learnLabel="Details"
                requestLabel="Get quote"
              />
            </Card>
          </div>
        </Section>

        {/* Width contexts */}
        <Section
          title="Width contexts"
          description="Verify button rendering at narrow, medium, and wide container widths."
        >
          <div className="space-y-6">
            {[220, 340, 520, 780].map((w) => (
              <div key={w} className="flex items-center gap-4">
                <span className="w-16 text-[11px] font-mono text-black/45">
                  {w}px
                </span>
                <div style={{ width: w }}>
                  <ServiceActionRow
                    learnTo="/services/portable-toilet"
                    ariaTitle="Portable Toilet"
                    size={w < 340 ? "sm" : "md"}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* On dark background */}
        <Section
          title="On dark surface"
          description="Sanity check contrast when placed over a dark card background."
          bg="#1A1A1A"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <ServiceActionRow
                learnTo="/services/grease-trap"
                ariaTitle="Grease Trap"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <ServiceActionButton
                to="/request-service"
                variant="request"
                icon={ArrowRight}
              >
                Request service
              </ServiceActionButton>
            </div>
          </div>
        </Section>

        {/* Interactive state cheatsheet */}
        <Section
          title="Interaction checklist"
          description="Manually verify each item on the buttons above."
        >
          <ul className="grid gap-2 text-sm text-black/70 sm:grid-cols-2">
            <li>• Hover request → sheen sweep left→right, lift, deeper shadow</li>
            <li>• Hover learn → fills deep-green, text turns white, lift</li>
            <li>• Hover either → arrow icon nudges right</li>
            <li>• Tab focus → visible ring (orange or deep-green)</li>
            <li>• Active click → scales down slightly (0.98)</li>
            <li>• Long labels → do not wrap (whitespace-nowrap)</li>
          </ul>
        </Section>
      </div>
    </main>
  );
}
