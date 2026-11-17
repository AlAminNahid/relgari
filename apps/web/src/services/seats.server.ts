import type { SeatQuery } from "@/services/seats";
import type { ApiErrorCode, SeatMap } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export type SeatMapOutcome =
  | { ok: true; data: SeatMap }
  | { ok: false; code: ApiErrorCode | "UNAVAILABLE" };

export async function fetchSeatMap(q: SeatQuery): Promise<SeatMapOutcome> {
  try {
    const query = new URLSearchParams({
      from: q.from,
      to: q.to,
      date: q.date,
      class: q.cls,
    });
    const res = await fetch(`${API_URL}/trains/${q.train}/seats?${query}`, {
      cache: "no-store",
    });
    if (res.ok) return { ok: true, data: (await res.json()) as SeatMap };
    const body = (await res.json().catch(() => null)) as {
      code?: ApiErrorCode;
    } | null;
    return { ok: false, code: body?.code ?? "UNAVAILABLE" };
  } catch {
    return { ok: false, code: "UNAVAILABLE" };
  }
}
