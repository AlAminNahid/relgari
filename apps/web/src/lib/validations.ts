import { z } from "zod";

export type AuthErrorKey =
  | "name"
  | "phone"
  | "nid"
  | "passwordShort"
  | "passwordEmpty";

const PHONE_PATTERN = /^(\+?88)?01[3-9]\d{8}$/;
const NID_PATTERN = /^(\d{10}|\d{13}|\d{17})$/;

export const cleanPhone = (value: string) => value.replace(/[\s-]/g, "");

const phone = z
  .string()
  .refine((v) => PHONE_PATTERN.test(cleanPhone(v)), "phone");

export const loginSchema = z.object({
  phone,
  password: z.string().min(1, "passwordEmpty"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "name"),
  phone,
  nid: z.string().regex(NID_PATTERN, "nid"),
  password: z.string().min(6, "passwordShort"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export function getFieldErrors(
  error: z.ZodError,
): Record<string, AuthErrorKey> {
  const errors: Record<string, AuthErrorKey> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    if (!(field in errors)) errors[field] = issue.message as AuthErrorKey;
  }
  return errors;
}
