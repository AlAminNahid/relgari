import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const api = process.env.API_URL ?? "http://127.0.0.1:4000";
  const target = new URL(
    request.nextUrl.pathname.replace(/^\/api/, "") + request.nextUrl.search,
    api,
  );

  const headers = new Headers(request.headers);
  headers.delete("x-relgari-client-ip");
  headers.delete("x-relgari-proxy-secret");

  const secret = process.env.PROXY_SECRET;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  if (secret && ip) {
    headers.set("x-relgari-client-ip", ip);
    headers.set("x-relgari-proxy-secret", secret);
  }
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = { matcher: "/api/:path*" };
