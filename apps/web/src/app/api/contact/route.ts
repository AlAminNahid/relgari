import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact";
import { sendContactMail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_MESSAGES = 5;
const sent = new Map<string, number[]>();

function tooMany(ip: string, now: number): number {
  const recent = (sent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_MESSAGES) {
    sent.set(ip, recent);
    return Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
  }
  recent.push(now);
  sent.set(ip, recent);
  if (sent.size > 5000) {
    for (const [key, times] of sent) {
      if (times.every((t) => now - t >= WINDOW_MS)) sent.delete(key);
    }
  }
  return 0;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const wait = tooMany(ip, Date.now());
  if (wait > 0) {
    return NextResponse.json(
      { code: "TOO_MANY_REQUESTS" },
      { status: 429, headers: { "Retry-After": String(wait) } },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "INVALID", field: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  const { website, ...message } = parsed.data;
  if (website?.trim()) return NextResponse.json({ ok: true });

  try {
    await sendContactMail(message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact mail failed:", error);
    return NextResponse.json({ code: "SEND_FAILED" }, { status: 502 });
  }
}
