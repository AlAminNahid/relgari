export const siteConfig = {
  name: "Relgari",
  nameBn: "রেলগাড়ি",
} as const;

export const NAV_LINKS = [
  { href: "#routes", key: "routes" },
  { href: "#seats", key: "seats" },
  { href: "#how", key: "how" },
] as const;

export const CLASS_KEYS = ["shovan", "schair", "snigdha", "ac"] as const;
export type ClassKey = (typeof CLASS_KEYS)[number];

export const MAX_DAYS_AHEAD = 30;

export const ROUTE_EVENT = "relgari:route";

export const SESSION_COOKIE = "relgari_session";
