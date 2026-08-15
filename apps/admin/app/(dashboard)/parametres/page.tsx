import { createClient } from "@repo/shared/supabase/server";

import {
  AdminNotificationsForm,
  AgencyCoordinatesForm,
  ReviewsForm,
  SocialLinksForm,
  TestEmailsCard,
} from "@/components/settings-forms";
import {
  SettingsSection,
  SettingsShell,
  type SettingsNavItem,
} from "@/components/settings-shell";

export const dynamic = "force-dynamic";

// icon = string clé du registry du Shell — Lucide n'est pas sérialisable
// à travers la frontière Server/Client.
const SECTIONS: SettingsNavItem[] = [
  { id: "coordonnees", label: "Coordonnées", icon: "mapPin" },
  { id: "reseaux", label: "Réseaux sociaux", icon: "share2" },
  { id: "avis", label: "Avis clients", icon: "star" },
  { id: "notifications-admin", label: "Notifications admin", icon: "bell" },
  { id: "test-emails", label: "Tester les emails", icon: "mail" },
];

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("settings").select("*");

  const settingsMap = Object.fromEntries(
    (settings || []).map((s) => [s.key, s.value]),
  );

  return (
    <SettingsShell
      eyebrow="Agence"
      title="Paramètres"
      description="Coordonnées publiques, présence sur les réseaux sociaux, avis clients et notifications administratives. Chaque bloc se sauvegarde indépendamment."
      sections={SECTIONS}
    >
      <SettingsSection
        id="coordonnees"
        title="Coordonnées"
        description="Affichées dans le footer du site, sur la page Contact et dans les emails envoyés aux clients."
      >
        <AgencyCoordinatesForm settings={settingsMap} />
      </SettingsSection>

      <SettingsSection
        id="reseaux"
        title="Réseaux sociaux"
        description="Liens vers vos profils. Affichés en icônes dans le footer — laissez vide pour masquer une plateforme."
      >
        <SocialLinksForm settings={settingsMap} />
      </SettingsSection>

      <SettingsSection
        id="avis"
        title="Avis clients"
        description="Lien vers Google Business ou une plateforme d'avis. Ouvert au clic sur le bouton « Laisser un avis » de la page Témoignages."
      >
        <ReviewsForm settings={settingsMap} />
      </SettingsSection>

      <SettingsSection
        id="notifications-admin"
        title="Notifications administrateur"
        description="Reçoit un email récapitulatif à chaque événement côté site, indépendamment des préférences des agents. Un bouton « Tester » permet de vérifier la config Resend sans attendre un événement réel."
      >
        <AdminNotificationsForm settings={settingsMap} />
      </SettingsSection>

      <SettingsSection
        id="test-emails"
        title="Tester les emails"
        description="Envoyez un aperçu de chaque template (confirmations client, réponses, alertes bien, invitations d'agents…) à l'adresse de votre choix pour valider la charte et la configuration Resend."
      >
        <TestEmailsCard settings={settingsMap} />
      </SettingsSection>
    </SettingsShell>
  );
}
