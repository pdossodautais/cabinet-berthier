"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/select";
import { formatPrice } from "@repo/shared/utils";
import { Calculator } from "lucide-react";

const DURATIONS = [
  { value: "10", label: "10 ans" },
  { value: "15", label: "15 ans" },
  { value: "20", label: "20 ans" },
  { value: "25", label: "25 ans" },
] as const;

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [downPayment, setDownPayment] = useState(() =>
    Math.round(propertyPrice * 0.1),
  );
  const [rate, setRate] = useState(3.5);
  const [years, setYears] = useState("20");

  const result = useMemo(() => {
    const principal = Math.max(0, propertyPrice - downPayment);
    if (principal <= 0 || rate <= 0) {
      return { monthly: 0, totalCost: 0, totalInterest: 0, principal };
    }
    const monthlyRate = rate / 100 / 12;
    const n = Number(years) * 12;
    const monthly =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);
    const totalCost = monthly * n;
    const totalInterest = totalCost - principal;
    return { monthly, totalCost, totalInterest, principal };
  }, [propertyPrice, downPayment, rate, years]);

  const handleDownPayment = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value) || 0;
      setDownPayment(Math.min(val, propertyPrice));
    },
    [propertyPrice],
  );

  const handleRate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number.parseFloat(e.target.value);
      if (!Number.isNaN(val) && val >= 0 && val <= 15) setRate(val);
    },
    [],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Simulateur de mensualités
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mc-down" className="text-xs">
              Apport personnel
            </Label>
            <Input
              id="mc-down"
              type="number"
              value={downPayment}
              onChange={handleDownPayment}
              min={0}
              max={propertyPrice}
              step={1000}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mc-rate" className="text-xs">
              Taux (%)
            </Label>
            <Input
              id="mc-rate"
              type="number"
              value={rate}
              onChange={handleRate}
              min={0}
              max={15}
              step={0.1}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mc-duration" className="text-xs">
            Durée du prêt
          </Label>
          <Select value={years} onValueChange={(v) => v && setYears(v)}>
            <SelectTrigger id="mc-duration" className="w-full">
              <span className="flex flex-1 text-left truncate">
                {DURATIONS.find((d) => d.value === years)?.label}
              </span>
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div role="region" aria-label="Résultats de simulation" aria-live="polite" className="bg-muted/60 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Montant emprunté</span>
            <span className="text-sm font-medium">{formatPrice(result.principal)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-border pt-2">
            <span className="text-sm font-semibold">Mensualité estimée</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(Math.round(result.monthly))}<span className="text-xs font-normal text-muted-foreground">/mois</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Coût total du crédit</span>
            <span>{formatPrice(Math.round(result.totalInterest))}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-tight">
          Simulation indicative, sans valeur contractuelle. Hors assurance emprunteur et frais de dossier.
        </p>
      </CardContent>
    </Card>
  );
}
