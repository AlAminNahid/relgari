import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/config/site";
import type { Booking } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export async function getBooking(id: string): Promise<Booking | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/bookings/${encodeURIComponent(id)}`, {
      headers: { Cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Booking) : null;
  } catch {
    return null;
  }
}
