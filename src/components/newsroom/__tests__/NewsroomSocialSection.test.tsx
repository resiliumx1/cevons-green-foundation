import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, cleanup, within } from "@testing-library/react";
import {
  FacebookEmbed,
  NewsroomSocialSection,
} from "@/components/newsroom/NewsroomSocialSection";
import { socialLinks } from "@/data/socialLinks";

describe("FacebookEmbed fallback behaviour", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Remove any FB SDK script between tests.
    document.getElementById("facebook-jssdk")?.remove();
    // @ts-expect-error - clear any leaked FB global
    delete window.FB;
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("swaps to the branded Facebook fallback within ~5s when no iframe ever renders", async () => {
    const { container } = render(<FacebookEmbed />);

    // Initially shows the FB Page Plugin container, NOT the fallback.
    expect(container.querySelector(".fb-page")).toBeInTheDocument();
    expect(
      screen.queryByText(/View our latest posts on Facebook/i),
    ).not.toBeInTheDocument();

    // Let the IntersectionObserver microtask flush.
    await act(async () => {
      await Promise.resolve();
    });

    // Walk past the 5-second iframe-detection window.
    await act(async () => {
      vi.advanceTimersByTime(5500);
    });

    // Fallback card is now visible — never an empty box.
    expect(
      screen.getByText(/View our latest posts on Facebook/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Follow CEVONS on Facebook/i }),
    ).toHaveAttribute("href", socialLinks.facebook.url);
    expect(container.querySelector(".fb-page")).not.toBeInTheDocument();
  });

  it("keeps the embed (no fallback) when an iframe appears before the timeout", async () => {
    const { container } = render(<FacebookEmbed />);

    await act(async () => {
      await Promise.resolve();
    });

    // Simulate the FB SDK injecting an <iframe> into the .fb-page container.
    const fbPage = container.querySelector(".fb-page")!;
    const iframe = document.createElement("iframe");
    iframe.src = "about:blank";
    fbPage.appendChild(iframe);

    // Detection interval fires every 300ms.
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // No fallback messaging — embed is considered loaded.
    expect(
      screen.queryByText(/View our latest posts on Facebook/i),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".fb-page iframe")).toBeInTheDocument();

    // Even past the timeout, fallback must not appear retroactively.
    await act(async () => {
      vi.advanceTimersByTime(8000);
    });
    expect(
      screen.queryByText(/View our latest posts on Facebook/i),
    ).not.toBeInTheDocument();
  });
});

describe("NewsroomSocialSection — no empty boxes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.getElementById("facebook-jssdk")?.remove();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("Instagram preview always renders the branded fallback (never empty)", () => {
    render(<NewsroomSocialSection />);
    expect(
      screen.getByText(/View our latest posts on Instagram/i),
    ).toBeInTheDocument();
    const link = screen.getAllByRole("link", {
      name: /Follow CEVONS on Instagram/i,
    });
    expect(link.length).toBeGreaterThan(0);
  });

  it("after the Facebook timeout, both preview slots show visible content", async () => {
    const { container } = render(<NewsroomSocialSection />);

    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });

    // Both fallback headings present → no empty preview box.
    expect(
      screen.getByText(/View our latest posts on Facebook/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/View our latest posts on Instagram/i),
    ).toBeInTheDocument();

    // Every preview slot has non-empty rendered text content.
    const previewRow = container.querySelector(
      ".grid.grid-cols-1.lg\\:grid-cols-2",
    )!;
    expect(previewRow).toBeTruthy();
    for (const child of Array.from(previewRow.children)) {
      expect((child.textContent ?? "").trim().length).toBeGreaterThan(0);
    }
  });
});

// Silence the unused-import lint guard if it ever complains.
void within;
