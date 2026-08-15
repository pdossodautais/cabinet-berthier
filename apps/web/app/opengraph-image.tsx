import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { clientConfig } from "@repo/shared/client-config";

// OG image par défaut — héritée par toutes les pages sans opengraph-image.tsx
// dédié. Tous les textes viennent de `.client-config.json` — change le logo
// dans `public/logo.jpg` et le reste suit automatiquement.

export const alt = clientConfig.ogImage.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getLogoDataUri(): Promise<string | null> {
  // Support logo.jpg (client-specific après /brand-swap) ou logo.svg (placeholder template)
  for (const name of ["logo.jpg", "logo.png", "logo.svg"]) {
    try {
      const buffer = await readFile(join(process.cwd(), "public", name));
      const mime = name.endsWith(".svg") ? "image/svg+xml" : name.endsWith(".png") ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    } catch {
      // continue
    }
  }
  return null;
}

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export default async function OGImage() {
  const logoUri = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: clientConfig.brand.themeColor,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {logoUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUri}
              width={72}
              height={72}
              alt=""
              style={{ display: "block" }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                border: "1.5px solid #1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 600,
                color: "#1a1a1a",
                letterSpacing: "0.02em",
              }}
            >
              {monogram(clientConfig.agencyName)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: "#1a1a1a",
                letterSpacing: "-0.01em",
              }}
            >
              {clientConfig.agencyName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#8a7e6d",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {clientConfig.logoSubtitle}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 500,
              color: "#1a1a1a",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {clientConfig.tagline}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#4a4239",
              lineHeight: 1.5,
              maxWidth: 760,
              marginTop: 8,
            }}
          >
            {clientConfig.ogImage.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #d8cdbb",
            paddingTop: "28px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "#8a7e6d",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {clientConfig.ogImage.footerLeft}
          </div>
          <div
            style={{
              fontSize: 14,
              color: clientConfig.brand.accentColor,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {clientConfig.ogImage.footerRight}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
