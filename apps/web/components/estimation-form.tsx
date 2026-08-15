"use client";

import { submitEstimationForm } from "@/lib/actions/estimations";
import { useRef, useState } from "react";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
import { Alert, AlertDescription } from "@repo/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { CheckCircle2 } from "lucide-react";
import { PROPERTY_TYPES } from "@repo/shared/constants";

export function EstimationForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ts] = useState(() => Date.now());
  const [propertyType, setPropertyType] = useState<string>(
    PROPERTY_TYPES[0].value,
  );
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMsg("");
    const result = await submitEstimationForm(formData);
    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setStatus("success");
      formRef.current?.reset();
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="_ts" value={ts} />

      {status === "success" && (
        <Alert role="alert">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Demande envoyée avec succès !</p>
            <p className="text-sm text-muted-foreground mt-1">
              Un agent vous contactera dans les plus brefs délais.
            </p>
          </AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <Alert variant="destructive" role="alert" id="estimation-form-error">
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="est_first_name">Prénom *</Label>
          <Input id="est_first_name" name="first_name" required aria-required="true" aria-describedby={status === "error" ? "estimation-form-error" : undefined} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="est_last_name">Nom *</Label>
          <Input id="est_last_name" name="last_name" required aria-required="true" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="est_email">Email *</Label>
          <Input id="est_email" name="email" type="email" required aria-required="true" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="est_phone">Téléphone</Label>
          <Input
            id="est_phone"
            name="phone"
            type="tel"
            pattern="[0-9\s\+\-\.]{6,20}"
            title="Numéro de téléphone valide"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="est_address">Adresse du bien *</Label>
        <Input
          id="est_address"
          name="address"
          required
          aria-required="true"
          placeholder="12 rue de la Paix"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="est_city">Ville *</Label>
          <Input id="est_city" name="city" required aria-required="true" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="est_postal_code">Code postal</Label>
          <Input id="est_postal_code" name="postal_code" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="est_property_type">Type de bien *</Label>
          <Select
            name="property_type"
            value={propertyType}
            onValueChange={(v) => v && setPropertyType(v)}
            required
          >
            <SelectTrigger id="est_property_type" aria-required="true">
              <span>
                {PROPERTY_TYPES.find((t) => t.value === propertyType)?.label ||
                  ""}
              </span>
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="est_surface">Surface (m²)</Label>
          <Input id="est_surface" name="surface" type="number" min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="est_rooms">Pièces</Label>
          <Input id="est_rooms" name="rooms" type="number" min={1} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="est_message">Informations complémentaires</Label>
        <Textarea
          id="est_message"
          name="message"
          rows={3}
          placeholder="État du bien, travaux récents, particularités..."
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={status === "loading"}
      >
        {status === "loading"
          ? "Envoi en cours..."
          : "Demander une estimation gratuite"}
      </Button>
    </form>
  );
}
