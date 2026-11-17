import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// /api/* is forwarded to the NestJS API by src/proxy.ts (it reads API_URL when the request arrives).
// The browser never calls the API directly, which keeps cookies same-site and needs no CORS settings.
const nextConfig: NextConfig = {
  // Tailwind CSS v4 loader for Turbopack (came with the Next.js template).
  turbopack: {
    // Pin the project root to this folder. Without it Next.js guesses the repo root (it sees ../../.git)
    // and leaves stray build folders behind.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
};

// Language comes from a cookie, not from the URL (no /bn prefix).
const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

export default withNextIntl(nextConfig);
