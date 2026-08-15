import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Stratégie de cache ────────────────────────────────────
  //
  // Mode actuel : ISR classique (revalidate + unstable_cache)
  //   → lib/data.ts wrappe chaque fonction avec unstable_cache + tags
  //   → les pages exportent `revalidate` pour le cache HTML
  //   → POST /api/revalidate invalide les tags on-demand
  //
  // Mode avancé : Cache Components (décommenter ci-dessous)
  //   → Remplacer unstable_cache par 'use cache' + cacheLife + cacheTag
  //   → Requiert une connexion Supabase active à la build
  //
  // cacheComponents: true,
  // cacheLife: {
  //   properties: { stale: 300, revalidate: 3600, expire: 86400 },
  //   static:     { stale: 300, revalidate: 86400, expire: 604800 },
  // },

  experimental: {
    // Inline CSS in <style> tags instead of <link> — eliminates CSS round-trip
    inlineCss: true,
    // Tree-shake les imports barrel (lucide-react, @repo/ui) pour ne bundler
    // que les icônes/composants réellement utilisés — gain ~100-150KB en prod.
    optimizePackageImports: [
      "lucide-react",
      "@repo/ui",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      // shadcn v4 pousse @base-ui-components/react (~89KB en bundle mobile).
      // Peu d'API utilisées → gros gain potentiel en tree-shake.
      "@base-ui-components/react",
      // @react-email/* n'est utilisé que par packages/emails mais peut fuiter
      // dans les bundles client si jamais importé via un re-export barrel.
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "*.supabase.co" },
      // Placeholders / seed data courants — utiles si le client utilise
      // des URLs externes pour ses covers de blog ou photos agent.
      { hostname: "images.unsplash.com" },
      { hostname: "picsum.photos" },
      { hostname: "fastly.picsum.photos" },
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
