import { ImageResponse } from "next/og";
import { clientConfig } from "@repo/shared/client-config";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export default function Icon512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: clientConfig.brand.accentColor,
          borderRadius: 96,
          fontFamily: "Georgia, serif",
          fontSize: 300,
          fontWeight: 500,
          color: clientConfig.brand.themeColor,
          letterSpacing: "-0.05em",
        }}
      >
        {monogram(clientConfig.agencyName)}
      </div>
    ),
    size,
  );
}
