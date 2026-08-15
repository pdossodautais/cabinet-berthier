"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";
import { createClient } from "@repo/shared/supabase/client";
import { Alert, AlertDescription } from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

const TEST_TOKEN = "test-preview-token";

/**
 * Page d'activation de compte — point d'entrée des liens
 * « Activer mon compte » envoyés par email.
 *
 * 3 modes :
 *   1. `?token=test-preview-token` (email test depuis /parametres)
 *      → Banner jaune d'aperçu, formulaire désactivé, rien ne part en DB.
 *   2. Lien Supabase (flow PKCE ou token_hash dans le hash/searchParams)
 *      → Session déjà établie au moment où la page se monte, on propose
 *         à l'utilisateur de choisir son mot de passe directement ici
 *         pour éviter un aller-retour par /profil.
 *   3. Aucun contexte valide → Invitation expirée / invalide avec
 *      redirection vers /login.
 */
function InvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isPreview = token === TEST_TOKEN;

  const [mode, setMode] = useState<
    "loading" | "preview" | "activate" | "invalid" | "expired"
  >(isPreview ? "preview" : "loading");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Au mount : si preview, on ne fait rien. Sinon on regarde le hash
  // (flow implicite Supabase : #access_token=…&type=invite) et on
  // vérifie qu'une session a bien été établie.
  useEffect(() => {
    if (isPreview) return;

    const supabase = createClient();

    async function verify() {
      const hash = window.location.hash;
      const hashParams = hash
        ? new URLSearchParams(hash.substring(1))
        : null;

      // 1. Erreur Supabase dans le hash (token expiré, déjà consommé…)
      //    Priorité au mode "expired" pour afficher un message clair
      //    plutôt que de tomber en "invalid".
      if (hashParams?.get("error")) {
        const desc = hashParams.get("error_description") || "";
        setError(decodeURIComponent(desc.replace(/\+/g, " ")));
        setMode("expired");
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      // 2. Flow implicite : #access_token=… à échanger en session
      if (hashParams?.get("access_token")) {
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            setMode("invalid");
            return;
          }
          window.history.replaceState(null, "", window.location.pathname);
        }
      }

      // 3. Session déjà établie (via /auth/callback ou hash implicite)
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setEmail(data.user.email ?? null);
        setMode("activate");
      } else {
        setMode("invalid");
      }
    }

    verify();
  }, [isPreview]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPreview) return;

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setSaving(false);

    if (updateError) {
      setError(
        "Impossible d'enregistrer le mot de passe. Le lien a peut-être expiré.",
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* En-tête : logo + nom de l'agence, rappel de l'identité */}
      <div className="flex flex-col items-center gap-2">
        <Image
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          priority
          unoptimized
          className="aspect-square size-10 rounded-md select-none"
        />
        <span className="text-foreground text-sm font-medium">
          {clientConfig.agencyName}
          <span className="text-muted-foreground"> · Administration</span>
        </span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {mode === "preview"
              ? "Aperçu — activation de compte"
              : mode === "expired"
              ? "Lien expiré"
              : mode === "invalid"
              ? "Lien invalide"
              : "Bienvenue dans l'équipe"}
          </CardTitle>
          <CardDescription>
            {mode === "preview"
              ? "Voici la page que votre nouveau collègue verra après avoir cliqué sur son lien d'invitation."
              : mode === "activate"
              ? "Choisissez un mot de passe pour accéder à l'administration."
              : mode === "expired"
              ? "Les liens d'invitation restent valables 1 heure et ne peuvent être utilisés qu'une seule fois. Demandez à un administrateur de vous en renvoyer un nouveau."
              : mode === "invalid"
              ? "Ce lien n'est pas reconnu. Utilisez le lien présent dans votre email d'invitation."
              : "Vérification du lien en cours…"}
          </CardDescription>
        </CardHeader>

        {/* Banner aperçu — uniquement en mode preview */}
        {mode === "preview" && (
          <div className="mx-6 mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
            <Sparkles className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Ceci est un aperçu</p>
              <p className="mt-0.5 text-amber-800/90 dark:text-amber-200/80">
                Rien ne sera enregistré. En conditions réelles, votre
                collègue définit ici son mot de passe puis arrive
                directement dans l&apos;admin.
              </p>
            </div>
          </div>
        )}

        <CardContent>
          {mode === "loading" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="text-primary size-6 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Validation du lien…
              </p>
            </div>
          )}

          {(mode === "invalid" || mode === "expired") && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {mode === "expired"
                    ? error ||
                      "Le lien a expiré ou a déjà été utilisé. Demandez un nouveau lien à un administrateur."
                    : "Ce lien n'est pas reconnu. Utilisez le lien présent dans votre email d'invitation."}
                </AlertDescription>
              </Alert>
              <Button
                render={<Link href="/login" />}
                variant="outline"
                className="w-full"
              >
                Aller à la connexion
              </Button>
            </div>
          )}

          {(mode === "activate" || mode === "preview") && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={mode === "preview" ? "exemple@agence.fr" : email ?? ""}
                  readOnly
                  disabled={mode === "preview"}
                  className="bg-muted/40"
                />
                <p className="text-muted-foreground text-xs">
                  L&apos;adresse à laquelle nous avons envoyé votre
                  invitation.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    required={mode === "activate"}
                    value={mode === "preview" ? "" : password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "preview" ? "Minimum 6 caractères" : undefined
                    }
                    disabled={mode === "preview"}
                    autoComplete="new-password"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    disabled={mode === "preview"}
                    className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 p-1 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={
                      showPwd
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPwd ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Minimum 6 caractères. Vous pourrez le changer plus tard
                  depuis votre profil.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <Input
                  id="confirm"
                  type={showPwd ? "text" : "password"}
                  required={mode === "activate"}
                  value={mode === "preview" ? "" : confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={mode === "preview"}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={saving || mode === "preview"}
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {saving
                  ? "Activation…"
                  : mode === "preview"
                  ? "Activer mon compte (désactivé en aperçu)"
                  : "Activer mon compte"}
              </Button>
            </form>
          )}
        </CardContent>

        {mode === "preview" && (
          <CardFooter className="justify-center border-t pt-4">
            <Button
              render={<Link href="/parametres" />}
              variant="ghost"
              size="sm"
            >
              Fermer l&apos;aperçu
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-3 p-6 md:p-10">
          <Loader2 className="text-primary size-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Chargement…</p>
        </div>
      }
    >
      <InvitationContent />
    </Suspense>
  );
}
