import { cn } from "@repo/ui/utils";

type AddressLinkProps = {
  /** Adresse principale (rue, n°). Obligatoire pour le label/fallback. */
  address: string;
  /** Ville (ex. "Paris") — concaténée à l'adresse pour le query Google Maps. */
  city?: string;
  /** Code postal (ex. "75116"). */
  postalCode?: string;
  /** Pays — utilisé uniquement dans le fallback texte. Default: "France". */
  country?: string;
  /** Latitude WGS84. Si fourni avec `lng`, prime sur le query texte. */
  lat?: number | null;
  /** Longitude WGS84. */
  lng?: number | null;
  /** URL Google Maps custom (ex. `clientConfig.contact.mapsUrl`). Prime sur tout le reste. */
  href?: string;
  /** Classes additionnelles. */
  className?: string;
  /** Désactive le style underline par défaut (pour l'usage inline dans un texte). */
  unstyled?: boolean;
  /** Contenu du `<a>` — par défaut, l'adresse formatée. */
  children?: React.ReactNode;
};

/**
 * Wrapper `<a>` qui ouvre une adresse dans Google Maps dans un nouvel onglet.
 *
 * Priorité du lien (du plus prioritaire au moins prioritaire) :
 *  1. `href` explicite (typiquement `clientConfig.contact.mapsUrl`)
 *  2. Coordonnées `lat,lng` → `?query=lat,lng` (recommandé pour les biens)
 *  3. Adresse texte → `?query=adresse encodée`
 *
 * Convention liens externes : `target="_blank" rel="noopener noreferrer"`.
 */
export function AddressLink({
  address,
  city,
  postalCode,
  country = "France",
  lat,
  lng,
  href,
  className,
  unstyled,
  children,
}: AddressLinkProps) {
  const full = [address, postalCode, city, country].filter(Boolean).join(", ");

  const url =
    href ||
    (typeof lat === "number" && typeof lng === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Ouvrir dans Google Maps (nouvelle fenêtre)`}
      className={cn(
        !unstyled &&
          "hover:text-[color:var(--cobalt)] transition-colors underline-offset-4 decoration-dotted hover:decoration-[color:var(--cobalt)]",
        className,
      )}
    >
      {children ?? full}
    </a>
  );
}
