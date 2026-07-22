import { useRef, useState, type KeyboardEvent } from "react";

export interface BrandedVideoProps {
  videoId: string;
  title: string;
  poster: string;
  className?: string;
}

export function BrandedVideo({ videoId, title, poster, className }: BrandedVideoProps) {
  const [active, setActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const activate = () => {
    if (active) return;
    setActive(true);
    // Move focus into the iframe once mounted
    requestAnimationFrame(() => {
      iframeRef.current?.focus();
    });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden rounded-2xl shadow-lift bg-black ${className ?? ""}`}
    >
      {!active ? (
        <>
          <img
            src={poster}
            alt={`${title} — video thumbnail`}
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget;
              const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              if (img.src !== fallback) img.src = fallback;
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Scrim for title legibility */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.25) 100%)",
            }}
          />
          {/* Title */}
          <div className="absolute left-4 bottom-4 right-20 z-10 text-white">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-90"
              style={{ color: "#FFFFFF" }}
            >
              Watch
            </p>
            <p className="text-base md:text-lg font-semibold leading-tight" style={{ color: "#FFFFFF" }}>
              {title}
            </p>
          </div>
          {/* Play button */}
          <button
            type="button"
            onClick={activate}
            onKeyDown={onKey}
            aria-label={`Play video: ${title}`}
            className="branded-video-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              width: 76,
              height: 76,
              minWidth: 44,
              minHeight: 44,
              background: "#FFFFFF",
              border: "3px solid var(--brand-navy)",
              boxShadow: "0 8px 26px rgba(0,0,0,0.45)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              aria-hidden
              style={{ color: "var(--brand-navy)", marginLeft: 4 }}
            >
              <path fill="currentColor" d="M8 5v14l11-7z" />
            </svg>
          </button>
        </>
      ) : (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      )}
    </div>
  );
}

export default BrandedVideo;
