"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitPropertyAlert } from "@/lib/actions/alerts";
import { Bell, CheckCircle2 } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";

const inputCls =
  "h-12 px-4 bg-paper border border-hairline-strong text-[14px] text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:border-ink w-full transition-colors duration-200";

/**
 * Variante inline de l'AlertForm — même server action mais sans Dialog,
 * rendue directement dans la page (ex. empty state de /biens). Récupère
 * les filtres actifs via useSearchParams et les sauvegarde avec l'email.
 */
export function PropertyAlertInline() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMsg("");
    const result = await submitPropertyAlert(formData);
    if ("error" in result && result.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="card-cobalt-border animate-fade-up flex items-start gap-3 p-5 border border-ok/30 bg-ok/5"
      >
        <CheckCircle2
          className="h-5 w-5 text-ok mt-0.5 shrink-0"
          strokeWidth={1.3}
        />
        <div>
          <p className="text-[14px] font-medium text-ink">C&apos;est noté.</p>
          <p className="text-[13px] text-ink-muted mt-1 leading-[1.6]">
            Vous recevrez un e-mail dès qu&apos;un bien correspondant à votre
            recherche est publié.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {/* Reprise des filtres actifs — mêmes clés que l'AlertForm Dialog. */}
      {["transaction", "type", "ville", "prix_max", "surface_min", "pieces"].map(
        (key) => {
          const val = searchParams.get(key);
          return val ? (
            <input key={key} type="hidden" name={key} value={val} />
          ) : null;
        },
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex-1 block">
          <span className="sr-only">Votre email</span>
          <Input
            name="email"
            type="email"
            required
            aria-required="true"
            aria-describedby={errorMsg ? "alert-inline-error" : undefined}
            placeholder="vous@exemple.fr"
            className={inputCls}
            disabled={status === "loading"}
          />
        </label>
        <Button
          type="submit"
          disabled={status === "loading"}
          variant="ghost"
          className="group btn-fill h-12 px-5 bg-ink text-paper text-[13px] font-medium tracking-[0.02em] hover:bg-ink-2 transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap rounded-none border-0"
        >
          <span className="relative z-[1] inline-flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 icon-scale" strokeWidth={1.3} />
            {status === "loading" ? "Envoi…" : "Me prévenir"}
          </span>
        </Button>
      </div>

      {errorMsg && (
        <p
          id="alert-inline-error"
          role="alert"
          className="animate-fade-up text-[12px] text-destructive"
        >
          {errorMsg}
        </p>
      )}

      <p className="text-[11px] text-ink-subtle leading-[1.55]">
        Vos critères actuels sont sauvegardés. Désabonnement en un clic depuis
        l&apos;e-mail. Limite de 3 alertes par adresse.
      </p>
    </form>
  );
}
