import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

export function clientIp(req: Request): string {
  const secret = process.env.PROXY_SECRET;
  const given = req.headers['x-relgari-proxy-secret'];
  const claimed = req.headers['x-relgari-client-ip'];
  if (
    secret &&
    typeof given === 'string' &&
    typeof claimed === 'string' &&
    claimed.trim()
  ) {
    const a = Buffer.from(given);
    const b = Buffer.from(secret);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      return claimed.trim().slice(0, 64);
    }
  }
  return req.ip ?? '';
}
