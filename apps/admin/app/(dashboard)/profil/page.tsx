import { createClient } from "@repo/shared/supabase/server";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { KeyRound } from "lucide-react";

import { NotificationPreferences } from "@/components/notification-preferences";
import { IdentityForm, PasswordForm } from "@/components/profile-form";
import {
  SettingsSection,
  SettingsShell,
  type SettingsNavItem,
} from "@/components/settings-shell";
import { getNotificationPreferences } from "@/lib/actions/notifications";

export const dynamic = "force-dynamic";

// icon = string clé du registry du Shell — Lucide n'est pas sérialisable
// à travers la frontière Server/Client.
const SECTIONS: SettingsNavItem[] = [
  { id: "identite", label: "Identité", icon: "userRound" },
  { id: "securite", label: "Sécurité", icon: "shield" },
  { id: "notifications", label: "Notifications", icon: "bell" },
];

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const email = user.email || "";
  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";
  const avatarUrl = user.user_metadata?.avatar_url || null;
  const isSetup = params.setup === "1";

  const preferences = await getNotificationPreferences();

  return (
    <SettingsShell
      eyebrow="Compte"
      title="Mon profil"
      description="Votre identité telle qu'affichée dans l'admin et dans les signatures d'emails, la sécurité de votre compte, et vos préférences de notifications."
      sections={SECTIONS}
    >
      {isSetup && (
        <Alert>
          <KeyRound />
          <AlertTitle>Bienvenue !</AlertTitle>
          <AlertDescription>
            Votre compte a été activé. Complétez votre identité et définissez
            un mot de passe ci-dessous.
          </AlertDescription>
        </Alert>
      )}

      <SettingsSection
        id="identite"
        title="Identité"
        description="Photo, prénom, nom, adresse email. Ces informations apparaissent dans les emails que vous envoyez aux clients."
      >
        <div className="rounded-xl border bg-card p-6">
          <IdentityForm
            email={email}
            firstName={firstName}
            lastName={lastName}
            avatarUrl={avatarUrl}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        id="securite"
        title={isSetup ? "Définir votre mot de passe" : "Sécurité"}
        description={
          isSetup
            ? "Choisissez un mot de passe pour vous connecter à l'avenir. Minimum 6 caractères."
            : "Changez votre mot de passe régulièrement, surtout si vous partagez un ordinateur."
        }
      >
        <div className="rounded-xl border bg-card p-6">
          <PasswordForm isSetup={isSetup} />
        </div>
      </SettingsSection>

      <SettingsSection
        id="notifications"
        title="Notifications par email"
        description="Cochez les événements pour lesquels recevoir un email. Les préférences sont enregistrées automatiquement à chaque changement."
      >
        <NotificationPreferences preferences={preferences} />
      </SettingsSection>
    </SettingsShell>
  );
}
