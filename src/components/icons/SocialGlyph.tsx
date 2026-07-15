import type { SocialPlatform } from "@/data/socialLinks";

/**
 * Social platform glyphs — each rendered in its true brand identity,
 * designed to sit inside a WHITE circular chip in the footer.
 * The glyph itself carries the brand colour; the chip is uniform white.
 */

export function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#1877F2"
        d="M13.5 21.95V13.5h2.83l.42-3.28H13.5V8.13c0-.95.26-1.6 1.63-1.6h1.74V3.6a23.5 23.5 0 0 0-2.54-.13c-2.51 0-4.23 1.53-4.23 4.35v2.4H7.28v3.28h2.82v8.45a10 10 0 0 0 3.4 0Z"
      />
    </svg>
  );
}

export function InstagramGlyph({ className }: { className?: string }) {
  const gradId = "ig-grad-chip";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={gradId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#FDF497" />
          <stop offset="5%" stopColor="#FDF497" />
          <stop offset="45%" stopColor="#FD5949" />
          <stop offset="60%" stopColor="#D6249F" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.6" fill={`url(#${gradId})`} />
      <circle cx="12" cy="12" r="3.6" fill="none" stroke="#FFFFFF" strokeWidth="1.7" />
      <circle cx="17" cy="7" r="1.05" fill="#FFFFFF" />
    </svg>
  );
}

export function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#FF0000"
        d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-5.58Z"
      />
      <path fill="#FFFFFF" d="M9.75 15.5V8.5L15.75 12l-6 3.5Z" />
    </svg>
  );
}

export function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#000000"
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.86a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24Z"
      />
    </svg>
  );
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#25D366"
        d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.554-5.338 11.89-11.893 11.89a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"
      />
    </svg>
  );
}

// Backwards-compatible exports for any legacy imports.
export const FacebookColorIcon = FacebookGlyph;
export const InstagramColorIcon = InstagramGlyph;
export const TikTokIcon = TikTokGlyph;

export function SocialGlyph({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  switch (platform) {
    case "facebook":
      return <FacebookGlyph className={className} />;
    case "instagram":
      return <InstagramGlyph className={className} />;
    case "youtube":
      return <YoutubeGlyph className={className} />;
    case "tiktok":
      return <TikTokGlyph className={className} />;
  }
}
