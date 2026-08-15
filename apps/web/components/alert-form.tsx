"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitPropertyAlert } from "@/lib/actions/alerts";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Bell, CheckCircle2 } from "lucide-react";

export function AlertForm() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
      // Reset state when dialog closes
      setStatus("idle");
      setErrorMsg("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Bell className="mr-2 h-4 w-4" />
        Me notifier
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {status === "success" ? (
          <>
            <DialogHeader>
              <DialogTitle>{"Alerte enregistr\u00E9e"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="text-sm text-muted-foreground">
                {"Votre alerte a bien \u00E9t\u00E9 cr\u00E9\u00E9e. Vous recevrez un e-mail lorsqu\u2019un bien correspondant sera publi\u00E9."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{"Cr\u00E9er une alerte"}</DialogTitle>
              <DialogDescription>
                {"Recevez une alerte quand un bien correspondant \u00E0 votre recherche est publi\u00E9."}
              </DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              {/* Pass current search params as hidden fields */}
              {["transaction", "type", "ville", "prix_max", "surface_min", "pieces"].map((key) => {
                const val = searchParams.get(key);
                return val ? <input key={key} type="hidden" name={key} value={val} /> : null;
              })}

              <div className="space-y-2">
                <Label htmlFor="alert-email">Adresse e-mail *</Label>
                <Input
                  id="alert-email"
                  name="email"
                  type="email"
                  required
                  aria-required="true"
                  aria-describedby={errorMsg ? "alert-form-error" : undefined}
                  placeholder="votre@email.fr"
                />
              </div>

              {errorMsg && (
                <p id="alert-form-error" role="alert" className="text-sm text-destructive">{errorMsg}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Enregistrement..." : "Cr\u00E9er l\u2019alerte"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
