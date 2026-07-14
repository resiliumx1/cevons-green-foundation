import { Youtube } from "lucide-react";
import type { SocialPlatform } from "@/data/socialLinks";

/** TikTok icon (lucide-react has no first-party TikTok). */
export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.86a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z" />
    </svg>
  );
}

/** Full-color Facebook "f" mark on brand blue. */
export function FacebookColorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.87 11.85V15.47H7.08V12h3.05V9.36c0-3.02 1.79-4.69 4.54-4.69 1.32 0 2.7.24 2.7.24v2.97h-1.52c-1.5 0-1.96.93-1.96 1.88V12h3.34l-.53 3.47h-2.81v8.38A12 12 0 0 0 24 12Z"
      />
      <path
        fill="#FFFFFF"
        d="m16.68 15.47.53-3.47h-3.34V9.76c0-.95.46-1.88 1.96-1.88h1.52V4.91s-1.38-.24-2.7-.24c-2.75 0-4.54 1.67-4.54 4.69V12H7.08v3.47h3.05v8.38a12.09 12.09 0 0 0 3.74 0v-8.38h2.81Z"
      />
    </svg>
  );
}

/** Full-color Instagram glyph with brand gradient. */
export function InstagramColorIcon({ className }: { className?: string }) {
  const gradId = "ig-grad";
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
      <rect x="2" y="2" width="20" height="20" rx="5" fill={`url(#${gradId})`} />
      <path
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        d="M17 7.5h0M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"
      />
      <circle cx="17" cy="7.5" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}

export function SocialGlyph({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  switch (platform) {
    case "facebook":
      return <FacebookColorIcon className={className} />;
    case "instagram":
      return <InstagramColorIcon className={className} />;
    case "youtube":
      return <Youtube className={className} />;
    case "tiktok":
      return <TikTokIcon className={className} />;
  }
}
