"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Map, LayoutGrid, Bell, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { submitPropertyAlert } from "@/lib/actions/alerts";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";

const labelCls =
  "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";

const inputCls =
  "h-12 px-4 bg-paper border border-hairline-strong text-[14px] text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:border-ink w-full transition-colors duration-200";

const fabBase =
  "lg:hidden fixed z-40 inline-flex items-center gap-2 h-12 px-5 rounded-full bg-ink text-paper text-[13px] font-medium tracking-[0.02em] shadow-[0_8px_24px_oklch(0_0_0/0.18)] hover:bg-ink-2 transition-all";

export function MobileBottomBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("vue") || "split";
  const isMap = view === "map";

  const toggleView = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (isMap) params.delete("vue");
    else params.set("vue", "map");
    router.push(`/biens?${params.toString()}`);
  }, [router, searchParams, isMap]);

  return (
    <>
      {/* FAB gauche — toggle Carte / Liste */}
      <Button
        type="button"
        onClick={toggleView}
        variant="ghost"
        className={`group ${fabBase} bottom-5 left-5 border-0 hover:scale-[1.03] active:scale-[0.97]`}
        aria-pressed={isMap}
      >
        {isMap ? (
          <>
            <LayoutGrid className="h-4 w-4 icon-scale" strokeWidth={1.4} />
            Liste
          </>
        ) : (
          <>
            <Map className="h-4 w-4 icon-scale" strokeWidth={1.4} />
            Carte
          </>
        )}
      </Button>

      {/* FAB droite — alerte (icône seule) */}
      <AlertFab />
    </>
  );
}

function AlertFab() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
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

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setStatus("idle");
      setErrorMsg("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Créer une alerte"
            className="group lg:hidden fixed bottom-5 right-5 z-40 inline-flex items-center justify-center w-12 h-12 rounded-full bg-paper text-ink border border-hairline-strong shadow-[0_8px_24px_oklch(0_0_0/0.14)] hover:border-ink hover:scale-[1.05] active:scale-[0.95] transition-all duration-300"
          />
        }
      >
        <Bell className="h-4 w-4 icon-scale" strokeWidth={1.4} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-paper border-hairline-strong">
        {status === "success" ? (
          <>
            <DialogHeader>
              <span className={labelCls}>Alerte enregistrée</span>
              <DialogTitle className="text-2xl font-normal tracking-[-0.01em] mt-1">
                C&apos;est noté.
              </DialogTitle>
            </DialogHeader>
            <div className="animate-fade-up flex flex-col items-start gap-3 py-4">
              <CheckCircle2 className="h-7 w-7 text-ok" strokeWidth={1.3} />
              <p className="text-[14px] text-ink-muted leading-relaxed">
                Vous recevrez un e-mail dès qu&apos;un bien correspondant à
                votre recherche sera publié.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="ghost"
                className="group btn-fill h-11 px-5 bg-ink text-paper text-[13px] font-medium hover:bg-ink-2 transition-all duration-300 rounded-none border-0"
              >
                <span className="relative z-[1]">Fermer</span>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <span className={labelCls}>Recherche sauvegardée</span>
              <DialogTitle className="text-2xl font-normal tracking-[-0.01em] mt-1">
                Créer une alerte
              </DialogTitle>
              <DialogDescription className="text-[13px] text-ink-muted mt-1 leading-relaxed">
                Nous vous préviendrons dès qu&apos;un bien correspondant à votre
                recherche est publié.
              </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4 mt-2">
              {[
                "transaction",
                "type",
                "ville",
                "prix_max",
                "surface_min",
                "pieces",
              ].map((key) => {
                const val = searchParams.get(key);
                return val ? (
                  <input key={key} type="hidden" name={key} value={val} />
                ) : null;
              })}
              <label className="block">
                <span className={`${labelCls} block mb-1.5`}>
                  Votre email *
                </span>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="vous@exemple.fr"
                  className={inputCls}
                />
              </label>
              {errorMsg && (
                <p role="alert" className="animate-fade-up text-[12px] text-destructive">
                  {errorMsg}
                </p>
              )}
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  variant="ghost"
                  className="h-11 px-5 border border-hairline-strong text-ink text-[13px] hover:border-ink hover:bg-[color:var(--ivory-raw)] transition-colors duration-200 rounded-none"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  variant="ghost"
                  className="group btn-fill h-11 px-5 bg-ink text-paper text-[13px] font-medium hover:bg-ink-2 disabled:opacity-60 transition-all duration-300 rounded-none border-0"
                >
                  <span className="relative z-[1]">
                    {status === "loading"
                      ? "Enregistrement…"
                      : "Créer l'alerte"}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
