import { headers } from "next/headers";

export async function apiHeaders(): Promise<Record<string, string>> {
  const secret = process.env.PROXY_SECRET;
  if (!secret) return {};
  const incoming = await headers();
  const ip =
    incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    incoming.get("x-real-ip") ||
    "";
  return ip
    ? { "x-relgari-client-ip": ip, "x-relgari-proxy-secret": secret }
    : {};
}
