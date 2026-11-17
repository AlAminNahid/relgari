import { apiHeaders } from "@/services/api-headers.server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/config/site";
import type { Booking, PurchaseLimit } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export async function getBooking(id: string): Promise<Booking | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/bookings/${encodeURIComponent(id)}`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${token}`,
        ...(await apiHeaders()),
      },
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Booking) : null;
  } catch {
    return null;
  }
}

export async function listBookings(): Promise<Booking[]> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return [];
  try {
    const res = await fetch(`${API_URL}/bookings`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${token}`,
        ...(await apiHeaders()),
      },
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Booking[]) : [];
  } catch {
    return [];
  }
}

export async function getLimit(): Promise<PurchaseLimit | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/bookings/limits`, {
      headers: {
        Cookie: `${SESSION_COOKIE}=${token}`,
        ...(await apiHeaders()),
      },
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as PurchaseLimit) : null;
  } catch {
    return null;
  }
}
