import { z } from 'zod';

const base64Bytes = (min: number, exact = false) =>
  z.string().refine(
    (v) => {
      const length = Buffer.from(v, 'base64').length;
      return exact ? length === min : length >= min;
    },
    exact
      ? `must be exactly ${min} bytes, base64 encoded`
      : `must be at least ${min} bytes, base64 encoded`,
  );

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  NID_ENCRYPTION_KEY: base64Bytes(32, true),
  NID_HASH_SECRET: base64Bytes(32),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const problems = result.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`,
    );
    throw new Error(`Invalid environment settings: ${problems.join('; ')}`);
  }
  return result.data;
}
