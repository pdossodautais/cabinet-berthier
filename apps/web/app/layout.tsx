import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@repo/ui/tooltip";
import { Toaster } from "@repo/ui/sonner";
import { getSettings } from "@/lib/data";
import Link from "next/link";
import { clientConfig } from "@repo/shared/client-config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

import { ServiceWorkerRegister } from "@/components/sw-register";
import { Analytics } from "@/components/analytics";
import { validateEnv } from "@/lib/env";
import "./globals.css";

validateEnv();

// Variantes réduites à l'essentiel pour éviter les warnings « preloaded
// but not used within a few seconds » : on préchargeait 15+ variantes
// quand seules 4-5 servent au-dessus du fold.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

const jetBrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: clientConfig.brand.themeColor,
};

export const metadata: Metadata = {
  title: {
    default: `${clientConfig.agencyFullName} — ${clientConfig.region}`,
    template: `%s · ${clientConfig.agencyFullName}`,
  },
  description: clientConfig.description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${interTight.variable} ${jetBrains.variable} h-full antialiased`}
    >
      <head>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link
              rel="preconnect"
              href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            />
            <link
              rel="dns-prefetch"
              href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            />
          </>
        )}
        <link rel="dns-prefetch" href="https://plausible.io" />
        <link
          rel="preconnect"
          href="https://tiles.openfreemap.org"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://tiles.openfreemap.org" />
        <Analytics />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Link
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium"
            >
              Aller au contenu principal
            </Link>

            <SiteHeader settings={settings} />

            <main id="main-content" className="flex-1 fade-in">
              {children}
            </main>

            <SiteFooter settings={settings} />
          </div>

          <ServiceWorkerRegister />
          <Toaster richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
