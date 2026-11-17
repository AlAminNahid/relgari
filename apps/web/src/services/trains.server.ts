import type { ApiErrorCode, TrainSearch } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export type TrainSearchOutcome =
  | { ok: true; data: TrainSearch }
  | { ok: false; code: ApiErrorCode | "UNAVAILABLE" };

export async function searchTrains(
  from: string,
  to: string,
  date: string,
): Promise<TrainSearchOutcome> {
  try {
    const query = new URLSearchParams({ from, to, date });
    const res = await fetch(`${API_URL}/trains/search?${query}`, {
      cache: "no-store",
    });
    if (res.ok) return { ok: true, data: (await res.json()) as TrainSearch };
    const body = (await res.json().catch(() => null)) as {
      code?: ApiErrorCode;
    } | null;
    return { ok: false, code: body?.code ?? "UNAVAILABLE" };
  } catch {
    return { ok: false, code: "UNAVAILABLE" };
  }
}
