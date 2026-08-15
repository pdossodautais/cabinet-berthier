"use client";

import { createClient } from "@repo/shared/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Building2, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashLoading, setHashLoading] = useState(true);

  // Gérer le flow implicite Supabase :
  //   - succès : `#access_token=...&type=recovery|invite`
  //   - erreur : `#error=access_denied&error_code=otp_expired&error_description=...`
  // Au mount on parse window.location.hash. Sur succès, on fait un HARD nav
  // (window.location.href) plutôt que router.push pour que le middleware SSR
  // voie immédiatement les cookies posés par setSession (sinon on tombe dans
  // une boucle redirect → /login → redirect…).
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      setHashLoading(false);
      return;
    }

    const params = new URLSearchParams(hash.substring(1));

    // Cas 1 — lien expiré ou déjà utilisé (Supabase pousse l'erreur dans le hash)
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");
    if (errorCode || errorDescription) {
      setError(
        "Ce lien d'invitation a expiré ou a déjà été utilisé. Demandez à un administrateur de vous renvoyer une invitation.",
      );
      // Clean l'URL pour éviter de re-trigger l'erreur sur soft refresh
      window.history.replaceState(null, "", window.location.pathname);
      setHashLoading(false);
      return;
    }

    // Cas 2 — pas de tokens, on affiche le form normalement
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken) {
      setHashLoading(false);
      return;
    }

    // Cas 3 — flow d'invitation / recovery : poser la session, puis HARD nav.
    const supabase = createClient();

    // Fallback timeout : si setSession hang (réseau cassé, edge func down)
    // on relâche l'overlay « Validation en cours… » au bout de 8 s avec
    // un message d'erreur explicite plutôt que de laisser l'utilisateur
    // sur un spinner figé indéfiniment.
    const timeoutId = setTimeout(() => {
      console.error("[login] setSession timeout (8 s)");
      setError(
        "La validation prend trop de temps. Veuillez réessayer ou contacter un administrateur.",
      );
      setHashLoading(false);
    }, 8000);

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        clearTimeout(timeoutId);
        if (error) {
          console.error("[login] setSession error:", error);
          setError("Impossible de valider l'invitation. Veuillez réessayer.");
          setHashLoading(false);
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
        const target =
          type === "recovery" || type === "invite" ? "/auth/invitation" : "/";
        // HARD nav : force le middleware SSR à relire les cookies posés
        // par setSession avant de servir la page cible.
        window.location.href = target;
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error("[login] setSession unexpected error:", err);
        setError("Impossible de valider l'invitation. Veuillez réessayer.");
        setHashLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, [router]);

  async function handleForgotPassword() {
    if (!email) {
      setError("Entrez votre email pour réinitialiser le mot de passe.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    setLoading(false);
    if (error) {
      setError("Impossible d'envoyer le lien de réinitialisation.");
    } else {
      setError("");
      alert("Un email de réinitialisation a été envoyé.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  if (hashLoading) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-3 p-6 md:p-10">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Validation en cours…</p>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
          <Building2 className="size-5" />
        </div>
        <span className="text-foreground text-sm font-medium">
          Administration
        </span>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Connexion</CardTitle>
          <CardDescription>Accédez à l&apos;administration</CardDescription>
        </CardHeader>
        <CardContent>
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
                required
                placeholder="admin@agence.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
