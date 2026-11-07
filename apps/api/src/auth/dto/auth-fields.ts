import { z } from 'zod';
import { NID_PATTERN, PHONE_PATTERN } from '../../shared/constants/auth.constants.js';

export type AuthErrorKey =
  'name' | 'phone' | 'nid' | 'passwordShort' | 'passwordLong' | 'passwordEmpty';

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '').replace(/^\+?88(?=01)/, '');
}

export const phoneField = z
  .string()
  .refine((v) => PHONE_PATTERN.test(normalizePhone(v)), 'phone');
export const nidField = z.string().regex(NID_PATTERN, 'nid');

const ERROR_KEYS: ReadonlySet<string> = new Set<AuthErrorKey>([
  'name',
  'phone',
  'nid',
  'passwordShort',
  'passwordLong',
  'passwordEmpty',
]);

const FIELD_FALLBACK: Record<string, AuthErrorKey> = {
  name: 'name',
  phone: 'phone',
  nid: 'nid',
  password: 'passwordEmpty',
};

export function getFieldErrors(
  error: z.ZodError,
): Record<string, AuthErrorKey> {
  const errors: Record<string, AuthErrorKey> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    const key = ERROR_KEYS.has(issue.message)
      ? (issue.message as AuthErrorKey)
      : FIELD_FALLBACK[field];
    if (key && !(field in errors)) errors[field] = key;
  }
  return errors;
}
