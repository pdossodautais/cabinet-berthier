import { clientConfig } from "@repo/shared/client-config";
import { cn } from "@repo/ui/utils";

/** Monogramme agence (initiales du nom) — sert de watermark discret
 *  dans le placeholder, renforce la brand sans peser. */
const MONOGRAM = clientConfig.agencyName
  .split(/\s+/)
  .filter(Boolean)
  .map((w) => w[0])
  .slice(0, 3)
  .join("")
  .toUpperCase();

/**
 * Placeholder pour un bien sans photo publiée. Deux variants :
 * - `compact` → property card / row card / slider empty state
 * - `detail` → hero gallery de /biens/[slug] quand aucune media
 *
 * Chaque variant combine :
 *   · un dégradé neutre
 *   · un watermark monogramme (opacité faible)
 *   · un label avec filets
 *   · une icône Home pour indiquer « bien immobilier »
 */
export function PropertyImagePlaceholder({
  variant = "compact",
  className,
  message = "Photos bientôt disponibles",
}: {
  variant?: "compact" | "detail";
  className?: string;
  message?: string;
}) {
  const isDetail = variant === "detail";
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        "bg-gradient-to-br from-ivory via-ivory-2 to-[oklch(0.92_0.018_75)]",
        className,
      )}
      aria-hidden="true"
    >
      {/* Pattern diagonal très discret — signature visuelle sans bruit. */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--ink) 0 1px, transparent 1px 14px)",
        }}
      />

      {/* Monogramme centré, très transparent — accent brand.
          Caché en variant compact trop petit pour être lisible. */}
      {isDetail && (
        <div className="absolute inset-0 flex items-center justify-center select-none">
          <span
            className="font-light tracking-[-0.04em] text-brass-deep opacity-[0.14]"
            style={{ fontSize: "min(22vw, 260px)", lineHeight: 1 }}
          >
            {MONOGRAM}
          </span>
        </div>
      )}

      {/* Label filet — pile au centre pour compact, ancré bas pour detail
          (laisse respirer le monogramme). */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center text-ink-muted",
          isDetail && "justify-end pb-10 md:pb-16",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 font-sans font-medium uppercase tracking-[0.14em]",
            isDetail ? "text-[12px]" : "text-[10px]",
          )}
        >
          <span
            className="h-px w-5 bg-hairline-strong"
            aria-hidden="true"
          />
          {message}
          <span
            className="h-px w-5 bg-hairline-strong"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
