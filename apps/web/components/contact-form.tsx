"use client";

import { submitContactForm } from "@/lib/actions/contacts";
import { useRef, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@repo/ui/utils";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";

const labelCls = "block";
const fieldWrap = "flex flex-col gap-1.5";
const fieldLabelCls =
  "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";
const inputCls =
  "h-12 px-4 bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary transition-colors duration-200";

export function ContactForm({
  propertyId,
  defaultMessage,
}: {
  propertyId?: string;
  /** Message pré-rempli — utile depuis un contexte (« Demander une
   *  visite » sur une fiche bien). L'utilisateur peut l'éditer. */
  defaultMessage?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [ts] = useState(() => Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMsg("");
    const result = await submitContactForm(formData);
    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setStatus("success");
      formRef.current?.reset();
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      {propertyId && <input type="hidden" name="property_id" value={propertyId} />}
      {/* Honeypot anti-spam : hors écran + autofill désactivé sur les
          3 gestionnaires principaux (1Password, LastPass, Dashlane).
          Un user legit ne le remplira jamais, un bot oui. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <label>
          Ne pas remplir
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
          />
        </label>
      </div>
      <input type="hidden" name="_ts" value={ts} />

      {status === "success" && (
        <div
          role="alert"
          className="animate-fade-up flex items-start gap-3 border border-primary/40 bg-primary/5 p-4 text-[13px]"
        >
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-foreground">Message envoyé.</p>
            <p className="text-muted-foreground mt-0.5">
              Nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div
          role="alert"
          id="contact-form-error"
          className="animate-fade-up border border-destructive/30 bg-destructive/5 text-destructive p-4 text-[13px]"
        >
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className={labelCls}>
          <div className={fieldWrap}>
            <span className={fieldLabelCls}>Prénom *</span>
            <Input
              name="first_name"
              required
              aria-required="true"
              aria-describedby={status === "error" ? "contact-form-error" : undefined}
              className={inputCls}
            />
          </div>
        </label>
        <label className={labelCls}>
          <div className={fieldWrap}>
            <span className={fieldLabelCls}>Nom *</span>
            <Input
              name="last_name"
              required
              aria-required="true"
              className={inputCls}
            />
          </div>
        </label>
      </div>

      <label className={labelCls}>
        <div className={fieldWrap}>
          <span className={fieldLabelCls}>Email *</span>
          <Input
            name="email"
            type="email"
            required
            aria-required="true"
            className={inputCls}
          />
        </div>
      </label>

      <label className={labelCls}>
        <div className={fieldWrap}>
          <span className={fieldLabelCls}>Téléphone</span>
          <Input
            name="phone"
            type="tel"
            pattern="[0-9\s\+\-\.]{6,20}"
            title="Numéro de téléphone valide"
            className={inputCls}
          />
        </div>
      </label>

      <label className={labelCls}>
        <div className={fieldWrap}>
          <span className={fieldLabelCls}>Message *</span>
          <Textarea
            name="message"
            rows={5}
            required
            aria-required="true"
            defaultValue={defaultMessage}
            placeholder="Dites-nous en plus sur votre projet…"
            className={cn(inputCls, "!h-auto py-3 leading-relaxed resize-none")}
          />
        </div>
      </label>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        En envoyant ce message, vous acceptez notre{" "}
        <a href="/confidentialite" className="underline hover:text-foreground transition-colors">
          politique de confidentialité
        </a>
        .
      </p>

      <Button
        type="submit"
        disabled={status === "loading"}
        variant="ghost"
        className="group btn-shimmer inline-flex items-center justify-center gap-2 w-full h-12 bg-primary text-primary-foreground text-[13px] font-medium tracking-[0.02em] hover:bg-primary/90 disabled:opacity-60 transition-all duration-300 rounded-none border-0"
      >
        <span className="relative z-[1] inline-flex items-center gap-2">
          {status === "loading" ? "Envoi en cours…" : (
            <>
              Envoyer <ArrowRight className="h-4 w-4 group-arrow" strokeWidth={1.3} />
            </>
          )}
        </span>
      </Button>
    </form>
  );
}
