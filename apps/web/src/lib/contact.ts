import { z } from "zod";

export type ContactErrorKey = "name" | "email" | "message";

export const MESSAGE_MAX = 1000;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name")
    .max(100, "name")
    .regex(/^[\p{L}\p{M}\s'.-]+$/u, "name"),
  email: z.string().trim().max(200, "email").email("email"),
  message: z.string().trim().min(1, "message").max(MESSAGE_MAX, "message"),
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
