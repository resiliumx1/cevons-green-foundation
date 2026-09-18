/** Values shared by the browser and the server for reports. */
export const REPORT_SOURCES = [
  "requests",
  "messages",
  "traffic",
  "tiktok",
  "facebook",
  "instagram",
] as const;

export type ReportSource = (typeof REPORT_SOURCES)[number];
