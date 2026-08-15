import Link from "next/link";
import { formatPrice } from "@repo/shared/utils";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";
import { PropertyImage } from "@repo/ui/property-image";
import { FavoriteButton } from "./favorite-button";

const PLACEHOLDER_PALETTES = [
  "p-warm",
  "p-cool",
  "p-night",
  "p-dusk",
  "p-stone",
  "p-roof",
];

function parseParisArrondissement(postal: string | null | undefined): string {
  if (!postal) return "";
  const m = /^750?(\d{1,2})$/.exec(postal.trim());
  if (!m) return "";
  const n = Number(m[1]);
  if (n < 1 || n > 20) return "";
  return n === 1 ? "1ᵉʳ" : `${n}ᵉ`;
}

/** Titles Logic-Immo arrivent souvent ALL-CAPS ou all-lowercase. On normalise. */
function normalizeTitle(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  // All caps → sentence case (1re lettre majuscule, reste minuscules, préserve mots techniques en maj.)
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
    return trimmed
      .toLowerCase()
      .replace(/(^|[\s·,/()-])([a-zàâäéèêëîïôöùûüç])/g, (_, p, c) => p + c.toUpperCase())
      .replace(/\b(Dpe|Dvs|Rdc|M²|Rer)\b/g, (m) => m.toUpperCase());
  }
  // All lower case → capitalize 1st letter
  if (trimmed === trimmed.toLowerCase()) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
  return trimmed;
}

/** Prix court éditorial — plus précis que formatPriceShort pour les loyers. */
function formatEditorialPrice(price: number, isRent: boolean): string {
  if (!price) return "—";
  if (isRent) {
    // Pour les loyers, on affiche le montant précis jusqu'à 10k, sinon k€
    if (price < 10_000) {
      return `${price.toLocaleString("fr-FR")} €`;
    }
    return `${Math.round(price / 1000)} k€`;
  }
  // Vente
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `${m.toFixed(m === Math.floor(m) ? 0 : 1).replace(".", ",")} M€`;
  }
  if (price >= 1_000) return `${Math.round(price / 1000)} k€`;
  return `${price} €`;
}

export function PropertyCardMagazine({
  property,
  index = 0,
  priority = false,
  static: isStatic = false,
}: {
  property: PropertyWithMedia;
  index?: number;
  priority?: boolean;
  /** Désactive toutes les animations (card-lift, group-zoom, overlays,
   *  highlight, tag-hover). Utile sur /biens où l'on veut une grille sobre. */
  static?: boolean;
}) {
  const cover = property.property_media?.[0]?.url;
  const palette = PLACEHOLDER_PALETTES[index % PLACEHOLDER_PALETTES.length];
  const isRent = property.transaction_type === "location";
  const isSold = Boolean(property.sold_at);
  const soldLabel = isRent ? "Loué" : "Vendu";
  const typeLabel =
    property.type.charAt(0).toUpperCase() + property.type.slice(1);
  const arrondissement = parseParisArrondissement(property.postal_code);
  const rooms = property.rooms || 1;
  const bedrooms = property.bedrooms || 0;
  const title = normalizeTitle(property.title);
  const priceText = formatEditorialPrice(property.price, isRent);

  return (
    <Link
      href={`/biens/${property.slug}`}
      className={isStatic ? "block" : "group block card-lift"}
    >
      <article>
        <div
          className={`placeholder-photo ${palette} ${isStatic ? "" : "img-overlay-cobalt"} relative overflow-hidden mb-5`}
          style={{ aspectRatio: "5 / 6" }}
        >
          {cover && (
            <div
              className={`${isStatic ? "absolute inset-0" : "absolute inset-0 group-zoom"}${isSold ? " opacity-70 grayscale-[35%]" : ""}`}
            >
              <PropertyImage
                src={cover}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 380px"
                priority={priority}
              />
            </div>
          )}
          <div className="absolute top-3 right-3 z-20">
            <FavoriteButton propertyId={property.id} />
          </div>
          {isSold ? (
            <div
              className="absolute top-3 left-3 px-2 py-1 text-[10px] tracking-[0.22em] uppercase z-20 mono"
              style={{ background: "oklch(0.45 0.18 25)", color: "white" }}
            >
              {soldLabel}
            </div>
          ) : null}
          <div
            className={`${isStatic ? "" : "tag-hover "}absolute bottom-3 left-3 px-2 py-1 text-[10px] tracking-[0.22em] uppercase z-20 mono`}
            style={{ background: "var(--cobalt)", color: "white" }}
          >
            {typeLabel}
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-1.5 gap-3">
          <div
            className="mono text-[11px] tracking-[0.18em] uppercase truncate"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
            }}
          >
            {arrondissement
              ? `Paris ${arrondissement}`
              : property.city || "—"}
          </div>
          <div
            className={`h-display tabular whitespace-nowrap ml-auto${isStatic ? "" : " transition-transform duration-300 group-hover:-translate-x-0.5"}`}
            style={{
              fontSize: 20,
              lineHeight: 1,
              color: "var(--cobalt)",
            }}
          >
            {priceText}
            {isRent && (
              <span
                className="mono ml-1 tracking-[0.12em]"
                style={{ fontSize: 10 }}
              >
                /mois
              </span>
            )}
          </div>
        </div>
        <h3
          className={`h-display mb-1${isStatic ? "" : " transition-colors"}`}
          style={{ fontSize: 22, lineHeight: 1.15 }}
        >
          {isStatic ? title : <span className="link-highlight-cobalt">{title}</span>}
        </h3>
        <div
          className="text-[13px]"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
          }}
        >
          {property.surface > 0 && `${property.surface} m² · `}
          {rooms} pièce{rooms > 1 ? "s" : ""}
          {bedrooms > 0 && ` · ${bedrooms} ch.`}
        </div>
      </article>
    </Link>
  );
}
