export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "youtube";

export interface SocialLink {
  platform: SocialPlatform;
  name: string;
  handle: string;
  url: string;
  enabled: boolean;
  /** Accent color of the platform's brand (used for hover glow). */
  accent: string;
}

export const socialLinks: Record<SocialPlatform, SocialLink> = {
  facebook: {
    platform: "facebook",
    name: "Facebook",
    handle: "@cevonswastemanagement",
    url: "https://www.facebook.com/cevonswastemanagement",
    enabled: true,
    accent: "#1877F2",
  },
  instagram: {
    platform: "instagram",
    name: "Instagram",
    handle: "@cevonsenvironmental",
    url: "https://www.instagram.com/cevonsenvironmental/",
    enabled: true,
    accent: "#E1306C",
  },
  tiktok: {
    platform: "tiktok",
    name: "TikTok",
    handle: "Coming soon",
    url: "",
    enabled: false,
    accent: "#000000",
  },
  youtube: {
    platform: "youtube",
    name: "YouTube",
    handle: "Coming soon",
    url: "",
    enabled: false,
    accent: "#FF0000",
  },
};

export const socialLinksList: SocialLink[] = [
  socialLinks.facebook,
  socialLinks.instagram,
  socialLinks.tiktok,
  socialLinks.youtube,
];
