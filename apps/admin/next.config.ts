import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "*.supabase.co" },
    ],
  },
  headers: async () => {
    // Les headers de cache `immutable` cassent Turbopack en dev (le chunk
    // est recompilé mais le navigateur garde l'ancien 1 an). On les réserve
    // à la prod — Next.js lui-même warn là-dessus au démarrage sinon.
    const isDev = process.env.NODE_ENV !== "production";
    return [
      ...(isDev
        ? []
        : [
            {
              source: "/_next/static/(.*)",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
            {
              source: "/_next/image(.*)",
              headers: [
                { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
              ],
            },
          ]),
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
