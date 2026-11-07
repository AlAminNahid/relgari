import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Where the NestJS API listens. The browser never calls it directly: it calls /api/... on this site,
// and Next.js forwards the request. That keeps cookies same-site and needs no CORS settings.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
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
