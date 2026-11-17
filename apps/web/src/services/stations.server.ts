import type { DepartureBoard, Station } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export async function getStations(): Promise<Station[]> {
  try {
    const res = await fetch(`${API_URL}/stations`, {
      next: { revalidate: 300 },
    });
    return res.ok ? ((await res.json()) as Station[]) : [];
  } catch {
    return [];
  }
}

export async function getDepartureBoard(
  code: string,
): Promise<DepartureBoard | null> {
  try {
    const res = await fetch(`${API_URL}/trains/board?station=${code}&limit=6`, {
      next: { revalidate: 30 },
    });
    return res.ok ? ((await res.json()) as DepartureBoard) : null;
  } catch {
    return null;
  }
}
