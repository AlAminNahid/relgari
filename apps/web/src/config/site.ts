export const siteConfig = {
  name: "Relgari",
  nameBn: "রেলগাড়ি",
} as const;

export const NAV_LINKS = [
  { href: "/#routes", key: "routes" },
  { href: "/#seats", key: "seats" },
  { href: "/#how", key: "how" },
] as const;

export const CLASS_KEYS = ["schair", "snigdha", "acs", "ac"] as const;
export type ClassKey = (typeof CLASS_KEYS)[number];
export const DEFAULT_CLASS: ClassKey = "schair";

export const MAX_DAYS_AHEAD = 10;

export const SEAT_CHECK_MS = 3_000;
export const SEAT_RELOAD_MS = 30_000;

export const BOARD_STATIONS = ["DAC", "CGP", "SYL", "RAJ", "KLN"] as const;

export const SESSION_COOKIE = "relgari_session";
