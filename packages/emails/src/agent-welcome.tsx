import {
  EmailLayout,
  Heading,
  Italic,
  Paragraph,
  Button,
  Divider,
  EmailFooter,
  EyebrowInline,
} from "./_layout";

interface AgentWelcomeProps {
  agencyName: string;
  firstName: string;
  adminUrl: string;
}

export default function AgentWelcome({
  agencyName,
  firstName,
  adminUrl,
}: AgentWelcomeProps) {
  return (
    <EmailLayout
      preview={`Votre compte ${agencyName} est actif`}
      eyebrow={`${agencyName} · Bienvenue`}
    >
      <Heading>
        Bienvenue {firstName},
        <br />
        <Italic>votre compte est actif.</Italic>
      </Heading>

      <Paragraph>
        Vous pouvez désormais accéder à l&apos;espace d&apos;administration
        pour gérer les biens, répondre aux demandes clients et configurer vos
        préférences de notification.
      </Paragraph>

      <Button href={adminUrl}>Accéder à l&apos;administration</Button>

      <Divider />

      <EyebrowInline>Pour commencer</EyebrowInline>
      <Paragraph muted>
        · Complétez votre profil (photo, biographie, téléphone) dans l&apos;onglet
        Profil.
      </Paragraph>
      <Paragraph muted>
        · Activez les notifications pour les nouveaux contacts et demandes
        d&apos;estimation.
      </Paragraph>
      <Paragraph muted>
        · Parcourez le catalogue de biens et les derniers messages reçus.
      </Paragraph>

      <EmailFooter agencyName={agencyName} />
    </EmailLayout>
  );
}
