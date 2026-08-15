import { createServiceClient } from "@repo/shared/supabase/server";
import { verifyAllForEmailSig } from "@repo/shared/alert-tokens";
import { clientConfig } from "@repo/shared/client-config";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Désinscription — toutes les alertes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UnsubscribeAllPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sig?: string }>;
}) {
  const { email, sig } = await searchParams;
  let status: "ok" | "bad-sig" | "missing" = "ok";
  let count = 0;

  if (!email || !sig) {
    status = "missing";
  } else if (!verifyAllForEmailSig(email, sig)) {
    status = "bad-sig";
  } else {
    // Service role : HMAC vérifiée → on bypass RLS pour garantir l'UPDATE.
    // `ilike` tolère les emails stockés avec casse variable dans la DB.
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from("property_alerts")
      .update({ is_active: false })
      .ilike("email", email)
      .eq("is_active", true)
      .select("id");
    count = data?.length ?? 0;
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
              Toutes vos alertes sont <em className="italic">désactivées</em>.
            </h1>
            <p className="text-[15px] text-ink-muted leading-[1.6] mt-5 max-w-md">
              {count === 0
                ? "Aucune alerte active pour cet email. Rien à désactiver."
                : count === 1
                  ? "Votre alerte a bien été désactivée. Vous ne recevrez plus d'email."
                  : `Vos ${count} alertes ont été désactivées. Vous ne recevrez plus d'email.`}
            </p>
          </>
        )}

        {(status === "missing" || status === "bad-sig") && (
          <>
            <h1 className="text-[42px] md:text-[52px] font-light tracking-[-0.02em] leading-[1.05] text-ink">
              Lien <em className="italic">{status === "missing" ? "incomplet" : "expiré"}</em>.
            </h1>
            <p className="text-[15px] text-ink-muted leading-[1.6] mt-5 max-w-md">
              Ce lien n&apos;est pas valide. Utilisez directement le lien
              présent dans un email d&apos;alerte récent, ou écrivez-nous.
            </p>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3 text-[13px]">
          <Link
            href="/biens"
            className="inline-flex items-center h-10 px-5 bg-ink text-paper hover:bg-ink-2 transition-colors"
          >
            Créer une nouvelle alerte
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
