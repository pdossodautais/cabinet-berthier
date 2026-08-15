import { ImageResponse } from "next/og";
import { createClient } from "@repo/shared/supabase/server";
import { formatPrice, getPropertyTypeLabel, getTransactionTypeLabel } from "@repo/shared/utils";

export const alt = "Fiche du bien immobilier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("title, price, city, postal_code, type, transaction_type, surface, rooms")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!property) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#6d3a1a",
            color: "#fff",
            fontSize: 48,
          }}
        >
          Bien non trouvé
        </div>
      ),
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#faf8f5",
          padding: "60px",
        }}
      >
        {/* Top: badges */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              backgroundColor: "#6d3a1a",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {getTransactionTypeLabel(property.transaction_type)}
          </div>
          <div
            style={{
              backgroundColor: "#f0e6dc",
              color: "#6d3a1a",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {getPropertyTypeLabel(property.type)}
          </div>
        </div>

        {/* Middle: title + city */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {property.title}
          </div>
          <div style={{ fontSize: 28, color: "#666" }}>
            {property.city} ({property.postal_code})
          </div>
        </div>

        {/* Bottom: price + details */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: "#6d3a1a" }}>
              {formatPrice(property.price)}
              {property.transaction_type === "location" ? "/mois" : ""}
            </div>
            <div style={{ display: "flex", gap: "24px", fontSize: 22, color: "#888", marginTop: "8px" }}>
              {property.surface > 0 && <span>{property.surface} m²</span>}
              {property.rooms > 0 && (
                <span>
                  {property.rooms} pièce{property.rooms > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* House icon */}
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#6d3a1a" />
            <path
              d="M16 6L6 14v12a2 2 0 002 2h5v-8h6v8h5a2 2 0 002-2V14L16 6z"
              fill="#fff"
            />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
