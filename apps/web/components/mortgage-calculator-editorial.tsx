"use client";

import { useState } from "react";
import { formatPriceShort } from "@repo/shared/utils";

export function MortgageCalculatorEditorial({
  propertyPrice,
}: {
  propertyPrice: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // Mensualité indicative — 80% emprunté, 25 ans, ~3,45 % → diviseur ≈ 300
  const monthly = Math.round((propertyPrice * 0.8) / 300);

  return (
    <div>
      <div className="h-eyebrow mb-4" style={{ color: "var(--cobalt)" }}>
        ¶ Simulation mensuelle
      </div>

      <div className="space-y-3 text-[13px]">
        <div className="flex justify-between">
          <span>Apport</span>
          <span className="tabular">20 %</span>
        </div>
        <div className="flex justify-between">
          <span>Durée</span>
          <span className="tabular">25 ans</span>
        </div>
        <div className="flex justify-between">
          <span>Taux</span>
          <span className="tabular">3,45 %</span>
        </div>
        <div className="flex justify-between pt-3 rule font-medium">
          <span>Mensualité</span>
          <span className="tabular" style={{ color: "var(--cobalt)" }}>
            {formatPriceShort(monthly)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full mt-4 h-small-caps py-3 text-left"
        style={{ color: "var(--cobalt)" }}
      >
        {expanded ? "Masquer les détails" : "Ajuster la simulation →"}
      </button>

      {expanded && (
        <p
          className="text-[11px] leading-relaxed pt-3 rule"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          Simulation indicative basée sur 80 % empruntés sur 25 ans à 3,45 %.
          Hors assurance emprunteur et frais de dossier — sans valeur
          contractuelle. Pour affiner, {contactPhone()}.
        </p>
      )}
    </div>
  );
}

function contactPhone() {
  return "contactez-nous";
}
