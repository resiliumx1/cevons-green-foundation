import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import axe from "axe-core";
import { socialLinksList } from "@/data/socialLinks";

// Mock router Link → plain <a> so we can render Footer without RouterProvider.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof to === "string" ? to : "#"} {...rest}>
      {children}
    </a>
  ),
}));

// Mock the settings context so useT is a simple identity translator.
vi.mock("@/contexts/SettingsContext", () => ({
  useT: () => (key: string) => key,
}));

// Mock NewsletterSignup to avoid pulling unrelated providers.
vi.mock("@/components/NewsletterSignup", () => ({
  NewsletterSignup: () => <div data-testid="newsletter" />,
}));

import { Footer } from "@/components/Footer";

async function runAxe(container: HTMLElement) {
  const results = await axe.run(container, {
    // Color-contrast needs real CSS resolution; jsdom can't compute it
    // reliably, so we scope the audit to ARIA / name / role / structure rules.
    runOnly: {
      type: "rule",
      values: [
        "button-name",
        "link-name",
        "aria-allowed-attr",
        "aria-valid-attr",
        "aria-valid-attr-value",
        "aria-required-attr",
        "aria-hidden-focus",
        "image-alt",
        "label",
        "duplicate-id-aria",
        "role-img-alt",
      ],
    },
  });
  return results.violations;
}

const focusRingClasses = [
  "focus-visible:ring-2",
  "focus-visible:ring-cevons-yellow",
];

describe("Footer social icons — accessibility", () => {
  afterEach(() => cleanup());

  it("every social control has an accessible name in both enabled and disabled states", () => {
    render(<Footer />);
    for (const s of socialLinksList) {
      const expected = s.enabled && s.url
        ? `Follow CEVONS on ${s.name}`
        : `${s.name} — Coming soon`;
      // Either an <a> (enabled) or a role="img" <span> (disabled).
      const el = screen.getByLabelText(expected);
      expect(el).toBeInTheDocument();
      if (s.enabled && s.url) {
        expect(el.tagName).toBe("A");
        expect(el).toHaveAttribute("href", s.url);
        expect(el).toHaveAttribute("rel", expect.stringContaining("noopener"));
        expect(el).toHaveAttribute("target", "_blank");
      } else {
        expect(el).toHaveAttribute("role", "img");
      }
      // Focus-visible ring tokens are present on every social control.
      for (const cls of focusRingClasses) {
        expect(el.className).toContain(cls);
      }
    }
  });

  it("admin login icon-only link has an aria-label", () => {
    render(<Footer />);
    expect(screen.getByLabelText("Admin login")).toBeInTheDocument();
  });

  it("passes axe ARIA/name checks in light mode", async () => {
    const { container } = render(
      <div data-theme="light">
        <Footer />
      </div>,
    );
    expect(await runAxe(container)).toEqual([]);
  });

  it("passes axe ARIA/name checks in dark mode", async () => {
    document.documentElement.classList.add("dark");
    const { container } = render(
      <div className="dark">
        <Footer />
      </div>,
    );
    const violations = await runAxe(container);
    document.documentElement.classList.remove("dark");
    expect(violations).toEqual([]);
  });
});
