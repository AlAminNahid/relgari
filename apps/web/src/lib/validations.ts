import { z } from "zod";

export type AuthErrorKey =
  | "name"
  | "phone"
  | "nid"
  | "passwordShort"
  | "passwordLong"
  | "passwordEmpty";

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 128;

const PHONE_PATTERN = /^01[3-9]\d{8}$/;
const NID_PATTERN = /^(\d{10}|\d{13}|\d{17})$/;

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "").replace(/^\+?88(?=01)/, "");
}

const phone = z
  .string()
  .refine((v) => PHONE_PATTERN.test(normalizePhone(v)), "phone");

export const loginSchema = z.object({
  phone,
  password: z
    .string()
    .min(1, "passwordEmpty")
    .max(PASSWORD_MAX, "passwordLong"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "name").max(60, "name"),
  phone,
  nid: z.string().regex(NID_PATTERN, "nid"),
  password: z
    .string()
    .min(PASSWORD_MIN, "passwordShort")
    .max(PASSWORD_MAX, "passwordLong"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

const ERROR_KEYS: ReadonlySet<string> = new Set<AuthErrorKey>([
  "name",
  "phone",
  "nid",
  "passwordShort",
  "passwordLong",
  "passwordEmpty",
]);

const FIELD_FALLBACK: Record<string, AuthErrorKey> = {
  name: "name",
  phone: "phone",
  nid: "nid",
  password: "passwordEmpty",
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
