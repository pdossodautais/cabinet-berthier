import { ENERGY_RATINGS, DPE_COLORS, GES_COLORS } from "@repo/shared/constants";

function RatingScale({ label, ariaPrefix, activeRating, colors }: {
  label: string;
  ariaPrefix: string;
  activeRating: string;
  colors: Record<string, { bg: string; text: string }>;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="space-y-0.5">
        {ENERGY_RATINGS.map((rating, idx) => {
          const isActive = rating === activeRating;
          return (
            <div key={rating} className="flex items-center gap-1">
              <div
                role="img"
                aria-label={`Classe ${ariaPrefix} ${rating}${isActive ? ", classe actuelle" : ""}`}
                className={`h-5 text-xs flex items-center px-1.5 font-bold ${isActive ? "ring-2 ring-foreground ring-offset-1 ring-offset-background" : "opacity-60"}`}
                style={{ width: `${40 + idx * 15}px`, backgroundColor: colors[rating].bg, color: colors[rating].text }}
              >
                {rating}
              </div>
              {isActive && <span className="text-xs font-bold" aria-hidden="true">&#9668;</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DPEDisplay({ energyRating, ghgRating }: { energyRating: string | null; ghgRating: string | null }) {
  if (!energyRating && !ghgRating) return null;

  return (
    <div className="flex gap-6">
      {energyRating && <RatingScale label="DPE - Consommation énergétique" ariaPrefix="énergie" activeRating={energyRating} colors={DPE_COLORS} />}
      {ghgRating && <RatingScale label="GES - Émissions de gaz" ariaPrefix="GES" activeRating={ghgRating} colors={GES_COLORS} />}
    </div>
  );
}
