import type { Station } from "@/types/api";

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
