import { defineConfig, env } from 'prisma/config';

// Prisma does not read .env by itself, so load it here (Node 22 can do this without a package).
try {
  process.loadEnvFile('.env');
} catch {
  // No .env file: DATABASE_URL must already be set in the environment.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
