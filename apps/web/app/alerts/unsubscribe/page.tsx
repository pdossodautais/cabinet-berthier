import { createServiceClient } from "@repo/shared/supabase/server";
import { verifyAlertSig } from "@repo/shared/alert-tokens";
import { clientConfig } from "@repo/shared/client-config";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Désinscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UnsubscribeAlertPage({
  searchParams,
}: {
  searchParams: Promise<{ alert?: string; email?: string; sig?: string }>;
}) {
  const { alert, email, sig } = await searchParams;
  let status: "ok" | "bad-sig" | "missing" | "not-found" = "ok";

  if (!alert || !email || !sig) {
    status = "missing";
  } else if (!verifyAlertSig(alert, email, sig)) {
    status = "bad-sig";
  } else {
    // Service role : la HMAC tenant lieu d'autorisation, on bypass RLS pour
    // garantir que l'UPDATE passe. Sans ça le client anon ignore l'update
    // silencieusement (pas de policy update autorisée pour anon) → l'alerte
    // reste active malgré un clic valide.
    // `ilike` au lieu de `eq` pour tolérer les emails avec casse variable
    // dans la DB (certains formulaires n'ont jamais lowercased).
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("property_alerts")
      .update({ is_active: false })
      .eq("id", alert)
      .ilike("email", email)
      .select("id")
      .maybeSingle();
    if (error || !data) status = "not-found";
  }

  return (
    <main className="min-h-[70vh] bg-ivory flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full">
        <div className="text-[10px] uppercase tracking-[0.16em] text-ink-subtle mb-3">
          {clientConfig.agencyName} · Alertes bien
        </div>

        {status === "ok" && (
          <>
            <h1 className="text-[42px] md:text-[52px] font-light tracking-[-0.02em] leading-[1.05] text-ink">
              Alerte <em className="italic">désactivée</em>.
            </h1>
            <p className="text-[15px] text-ink-muted leading-[1.6] mt-5 max-w-md">
              Vous ne recevrez plus d&apos;email pour cette recherche. Les
              autres alertes associées à <span className="font-mono text-ink">{email}</span> restent actives.
            </p>
          </>
        )}

        {status === "missing" && (
          <>
            <h1 className="text-[42px] md:text-[52px] font-light tracking-[-0.02em] leading-[1.05] text-ink">
              Lien <em className="italic">incomplet</em>.
            </h1>
            <p className="text-[15px] text-ink-muted leading-[1.6] mt-5 max-w-md">
              Le lien de désinscription est incomplet. Utilisez directement le
              lien présent dans l&apos;email d&apos;alerte, ou écrivez-nous.
            </p>
          </>
        )}

        {(status === "bad-sig" || status === "not-found") && (
          <>
            <h1 className="text-[42px] md:text-[52px] font-light tracking-[-0.02em] leading-[1.05] text-ink">
              Lien <em className="italic">expiré</em>.
            </h1>
            <p className="text-[15px] text-ink-muted leading-[1.6] mt-5 max-w-md">
              Ce lien n&apos;est pas valide. Il se peut que l&apos;alerte ait
              déjà été désactivée ou que le lien ait été modifié. Vous pouvez
              nous écrire directement pour toute demande.
            </p>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3 text-[13px]">
          <Link
            href="/biens"
            className="inline-flex items-center h-10 px-5 bg-ink text-paper hover:bg-ink-2 transition-colors"
          >
            Voir les biens
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center h-10 px-5 border border-hairline-strong text-ink hover:border-ink transition-colors"
          >
            Nous écrire
          </Link>
        </div>
      </div>
    </main>
  );
}
