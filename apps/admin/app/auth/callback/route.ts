import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@repo/shared/supabase/server";
import { sendAgentWelcome } from "@repo/shared/resend";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Origine canonique injectée dans les emails sortants (welcome) : on
  // force `NEXT_PUBLIC_ADMIN_URL` quand elle existe, pour que la
  // destination soit toujours celle de prod — peu importe si le
  // callback est exécuté depuis un dev local ou un tunnel.
  const publicAdminUrl = (
    process.env.NEXT_PUBLIC_ADMIN_URL || origin
  ).replace(/\/+$/, "");

  const supabase = await createClient();

  async function isFirstSignIn(): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    return !auth?.user?.user_metadata?.welcomed_at;
  }

  async function handleFirstSignIn() {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      // Premier sign-in : on marque via user_metadata et on envoie le welcome.
      if (user.user_metadata?.welcomed_at) return;

      const admin = await createServiceClient();
      const { data: agent } = await admin
        .from("agents")
        .select("first_name")
        .eq("user_id", user.id)
        .single();
      if (!agent) return;

      const { data: settings } = await admin
        .from("settings")
        .select("value")
        .eq("key", "agency_name")
        .single();
      const agencyName = settings?.value || "Notre agence";

      await sendAgentWelcome({
        to: user.email!,
        agencyName,
        firstName: agent.first_name,
        adminUrl: publicAdminUrl,
      }).catch(() => {});

      // Marque l'utilisateur pour ne plus renvoyer de welcome au prochain login.
      await admin.auth.admin
        .updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            welcomed_at: new Date().toISOString(),
          },
        })
        .catch(() => {});
    } catch {
      // Non-bloquant : si l'email échoue, on laisse quand même l'utilisateur
      // accéder au profil.
    }
  }

  /**
   * Après une session valide : détecte first sign-in AVANT
   * handleFirstSignIn (qui écrit welcomed_at), puis oriente vers
   * /auth/invitation pour la définition du mot de passe (premier
   * login d'une invitation) ou /profil?setup=1 (reset suivant).
   */
  async function finishAuth() {
    const firstSignIn = await isFirstSignIn();
    await handleFirstSignIn();
    const target = firstSignIn ? "/auth/invitation" : "/profil?setup=1";
    return NextResponse.redirect(`${origin}${target}`);
  }

  // Cas 1 : PKCE flow (code d'échange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return finishAuth();
  }

  // Cas 2 : Lien d'invitation avec token_hash (envoyé via Resend)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "invite" | "email",
    });
    if (!error) return finishAuth();
  }

  // Fallthrough : ni PKCE code ni token_hash utilisable. Généralement
  // Supabase a renvoyé une erreur (token expiré, déjà consommé…) dans
  // le hash fragment — on préserve ce hash en redirigeant vers
  // /auth/invitation qui sait le parser et afficher un message clair.
  return NextResponse.redirect(`${origin}/auth/invitation`);
}
