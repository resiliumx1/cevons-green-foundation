import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { socialLinksList, socialLinks, type SocialLink } from "@/data/socialLinks";
import { SocialGlyph } from "@/components/icons/SocialGlyph";

/* ------------------------------- Follow Cards ------------------------------- */

function FollowCard({ s, index }: { s: SocialLink; index: number }) {
  const disabled = !s.enabled || !s.url;
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${index * 90}ms`,
        // expose accent as CSS var for the glow
        ["--social-accent" as never]: s.accent,
      }}
      className={`group relative rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.04] p-5 md:p-6 shadow-sm overflow-hidden transition-all duration-500 motion-reduce:transition-none ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:transform-none`}
    >
      {/* Accent glow on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 motion-reduce:transition-none"
        style={{
          background:
            "radial-gradient(120px 80px at 20% 0%, color-mix(in srgb, var(--social-accent) 28%, transparent), transparent 60%)",
        }}
      />
      <div className="relative flex items-start gap-4">
        <span
          className="size-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
          style={{ backgroundColor: s.accent }}
          aria-hidden="true"
        >
          <SocialGlyph platform={s.platform} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="font-extrabold text-[var(--cevons-dark,#101820)] dark:text-white text-lg leading-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {s.name}
          </p>
          <p className="text-sm text-[var(--cevons-muted,#64748B)] dark:text-white/60 truncate">
            {s.handle}
          </p>
        </div>
      </div>

      <div className="relative mt-5">
        {disabled ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--cevons-muted,#64748B)] dark:text-white/60 text-xs font-semibold px-3 py-1.5 cursor-not-allowed"
            aria-label={`${s.name} — Coming soon`}
            title="Coming soon"
          >
            Coming soon
          </span>
        ) : (
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow CEVONS on ${s.name}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EF7700] text-white text-sm font-bold px-4 py-2 hover:brightness-110 transition-all hover:gap-2 motion-reduce:hover:gap-1.5"
          >
            Follow <ArrowUpRight className="size-4" />
          </a>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Facebook Page Plugin --------------------------- */

export function FacebookEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        // Inject FB SDK if not already present.
        const existing = document.getElementById("facebook-jssdk");
        if (!existing) {
          const script = document.createElement("script");
          script.id = "facebook-jssdk";
          script.async = true;
          script.defer = true;
          script.crossOrigin = "anonymous";
          script.src =
            "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
          script.onerror = () => !cancelled && setFailed(true);
          document.body.appendChild(script);
        } else {
          // Re-parse if SDK already loaded.
          // @ts-expect-error - FB injected globally
          if (window.FB?.XFBML?.parse) window.FB.XFBML.parse(container);
        }

        // Detect render success: FB injects an <iframe> into the .fb-page div.
        const startedAt = Date.now();
        const interval = setInterval(() => {
          if (cancelled) return;
          const iframe = container.querySelector("iframe");
          if (iframe) {
            clearInterval(interval);
            setLoaded(true);
          } else if (Date.now() - startedAt > 5000) {
            clearInterval(interval);
            setFailed(true);
          }
        }, 300);

        timeout = setTimeout(() => {
          if (!cancelled && !loaded) setFailed(true);
        }, 7000);
      },
      { threshold: 0.1 },
    );
    io.observe(container);

    return () => {
      cancelled = true;
      io.disconnect();
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return <FallbackCard s={socialLinks.facebook} />;

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.04] p-4 overflow-hidden">
      <div ref={containerRef} className="min-h-[500px] flex justify-center">
        <div
          className="fb-page"
          data-href="https://www.facebook.com/cevonswastemanagement"
          data-tabs="timeline"
          data-width="500"
          data-height="500"
          data-small-header="false"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        />
      </div>
    </div>
  );
}

/* ------------------------------- Fallback card ------------------------------ */

function FallbackCard({ s }: { s: SocialLink }) {
  return (
    <div
      className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.04] p-8 md:p-10 flex flex-col items-center text-center min-h-[500px] justify-center"
      style={{ ["--social-accent" as never]: s.accent }}
    >
      <span
        className="size-16 rounded-2xl flex items-center justify-center text-white shadow-md mb-5"
        style={{ backgroundColor: s.accent }}
        aria-hidden="true"
      >
        <SocialGlyph platform={s.platform} className="size-7" />
      </span>
      <h4
        className="text-xl md:text-2xl font-extrabold text-[var(--cevons-dark,#101820)] dark:text-white"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        View our latest posts on {s.name}
      </h4>
      <p className="mt-2 max-w-sm text-sm text-[var(--cevons-muted,#64748B)] dark:text-white/65">
        Follow {s.handle} to stay up to date with CEVONS news, community events,
        and behind-the-scenes from across Guyana.
      </p>
      {s.enabled && s.url ? (
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow CEVONS on ${s.name}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#EF7700] text-white text-sm font-bold px-5 py-2.5 hover:brightness-110 transition-all hover:gap-3 motion-reduce:hover:gap-2"
        >
          Visit {s.name} <ArrowUpRight className="size-4" />
        </a>
      ) : (
        <span className="mt-6 inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 text-[var(--cevons-muted,#64748B)] dark:text-white/60 text-xs font-semibold px-4 py-2">
          Coming soon
        </span>
      )}
    </div>
  );
}

/* --------------------------------- Section --------------------------------- */

export function NewsroomSocialSection() {
  return (
    <section
      className="section-y bg-[var(--cevons-cream,#FBF7EE)] dark:bg-white/[0.02]"
      aria-labelledby="socials-heading"
    >
      <div className="container-cevons">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EF7700] mb-2">
            Stay Connected
          </p>
          <h2
            id="socials-heading"
            className="text-3xl md:text-5xl font-extrabold text-[var(--cevons-deep-green,#EF7700)] dark:text-white"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Follow CEVONS
          </h2>
          <p className="mt-3 text-[var(--cevons-muted,#64748B)] dark:text-white/65">
            From our trucks to the community — follow along for the latest
            updates from across Guyana.
          </p>
        </div>

        {/* Follow cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {socialLinksList.map((s, i) => (
            <FollowCard key={s.platform} s={s} index={i} />
          ))}
        </div>

        {/* Live previews */}
        <div className="mt-12 md:mt-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EF7700] mb-4 text-center">
            From Our Socials
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            <FacebookEmbed />
            <FallbackCard s={socialLinks.instagram} />
          </div>
        </div>
      </div>
    </section>
  );
}
