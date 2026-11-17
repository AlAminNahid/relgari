import type { TicketCheck } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export async function verifyTicket(pnr: string): Promise<TicketCheck | null> {
  try {
    const res = await fetch(`${API_URL}/verify/${encodeURIComponent(pnr)}`, {
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as TicketCheck) : null;
  } catch {
    return null;
  }
}
