import type { MetadataRoute } from "next";
import { clientConfig } from "@repo/shared/client-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: clientConfig.agencyFullName,
    short_name: clientConfig.agencyShortName,
    description: clientConfig.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: clientConfig.brand.themeColor,
    theme_color: clientConfig.brand.themeColor,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
