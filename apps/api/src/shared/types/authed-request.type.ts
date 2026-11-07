import type { Request } from 'express';
import type { User } from '../../generated/prisma/client.js';

export type AuthedRequest = Request & {
  cookies: Record<string, string | undefined>;
  user: User;
  sessionToken: string;
};
