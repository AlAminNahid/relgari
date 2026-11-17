import type { NextRequest } from "next/server";

// Forwards /api/* to the NestJS API. The browser only ever talks to this website, which keeps
// cookies on one site and needs no CORS settings.
//
// It is done here, by hand, and not with a plain rewrite, so we control exactly what the API receives:
// the API only meets the website's servers, so without help it would count every visitor as the same
// one for its rate limits. The visitor's real address travels with PROXY_SECRET, which the API
// checks, so nobody else can claim an address.
export const dynamic = "force-dynamic";

// What is passed on to the API, and what comes back to the browser. Nothing else crosses.
const FORWARD_REQUEST = [
  "content-type",
  "cookie",
  "accept",
  "accept-language",
  "user-agent",
];
const FORWARD_RESPONSE = [
  "content-type",
  "cache-control",
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
];

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const api = process.env.API_URL ?? "http://127.0.0.1:4000";
  const target = new URL(
    `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
    api,
  );

  const headers = new Headers();
  for (const name of FORWARD_REQUEST) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const secret = process.env.PROXY_SECRET;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  if (secret && ip) {
    headers.set("x-relgari-client-ip", ip);
    headers.set("x-relgari-proxy-secret", secret);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return Response.json({ code: "INTERNAL" }, { status: 502 });
  }

  const out = new Headers();
  for (const name of FORWARD_RESPONSE) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  // A response can carry several cookies, and each one must be passed on separately.
  for (const cookie of upstream.headers.getSetCookie()) {
    out.append("set-cookie", cookie);
  }
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export {
  forward as GET,
  forward as POST,
  forward as PUT,
  forward as PATCH,
  forward as DELETE,
};
