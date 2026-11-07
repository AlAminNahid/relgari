import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/config/site";
import type { AuthUser } from "@/types/api";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as AuthUser) : null;
  } catch {
    return null;
  }
}
