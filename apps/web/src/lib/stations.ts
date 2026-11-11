import type { Station } from "@/types/api";

export function stationName(station: Station, locale: string) {
  return locale === "bn" ? station.nameBn : station.nameEn;
}

const clean = (text: string) => text.trim().toLowerCase();

export function stationMatches(station: Station, query: string) {
  const q = clean(query);
  return (
    clean(station.nameEn).includes(q) ||
    station.nameBn.includes(query.trim()) ||
    clean(station.code).startsWith(q)
  );
}

export function findStation(stations: Station[], text: string) {
  const q = clean(text);
  if (!q) return undefined;
  return stations.find(
    (s) =>
      clean(s.nameEn) === q || s.nameBn === text.trim() || clean(s.code) === q,
  );
}
