import { cn } from "@repo/ui/utils";
import { clientConfig } from "@repo/shared/client-config";
import Image from "next/image";

type AgencyLogoProps = {
  className?: string;
  size?: number;
  variant?: "default" | "mark" | "inverse";
  showTagline?: boolean;
};

/**
 * Logo de l'agence — lit le nom et le sous-titre depuis `.client-config.json`.
 *
 * Variants :
 *  - `mark` : juste le monogramme carré (favicon/icône)
 *  - `default` : monogramme + wordmark (+ tagline optionnelle)
 *  - `inverse` : même que default, texte clair sur fond sombre
 *
 * L'image source est `public/logo.jpg` (remplacer par le logo du client).
 * Si le fichier est absent, Next/Image affiche un placeholder — utiliser
 * `/brand-swap` pour le régénérer depuis le logo du client.
 */
export function AgencyLogo({
  className,
  size = 22,
  variant = "default",
  showTagline = true,
}: AgencyLogoProps) {
  const taglineColor =
    variant === "inverse" ? "oklch(0.85 0.015 80)" : "oklch(0.55 0 0)";
  const markSize = size + 18;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5",
        variant === "inverse" ? "text-foreground" : "text-foreground",
        className,
      )}
      aria-label={clientConfig.logoAlt}
    >
      <Image
        src="/logo.svg"
        alt=""
        aria-hidden="true"
        width={markSize}
        height={markSize}
        priority
        unoptimized
        className="shrink-0 select-none rounded"
        style={{ width: markSize, height: markSize }}
      />
      {variant !== "mark" && (
        <div className="leading-none tracking-[0.005em]">
          <div
            style={{
              fontSize: size,
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            {clientConfig.agencyName}
          </div>
          {showTagline && (
            <div
              className="mt-[3px]"
              style={{
                fontSize: 9,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: taglineColor,
              }}
            >
              {clientConfig.logoSubtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
