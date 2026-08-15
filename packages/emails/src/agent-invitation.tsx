import {
  EmailLayout,
  Heading,
  Italic,
  Paragraph,
  Button,
  Divider,
  EmailFooter,
} from "./_layout";

interface AgentInvitationProps {
  agencyName: string;
  firstName: string;
  inviteUrl: string;
}

export default function AgentInvitation({
  agencyName,
  firstName,
  inviteUrl,
}: AgentInvitationProps) {
  return (
    <EmailLayout
      preview={`Vous êtes invité(e) à rejoindre ${agencyName}`}
      eyebrow={`${agencyName} · Invitation`}
    >
      <Heading>
        Bienvenue,
        <br />
        <Italic>votre compte vous attend.</Italic>
      </Heading>

      <Paragraph>Bonjour {firstName},</Paragraph>

      <Paragraph>
        Vous avez été ajouté(e) en tant qu&apos;agent dans l&apos;espace
        d&apos;administration de {agencyName}. Cliquez sur le bouton ci-dessous
        pour activer votre compte et définir votre mot de passe.
      </Paragraph>

      <Button href={inviteUrl}>Activer mon compte</Button>

      <Paragraph muted>
        Ce lien d&apos;activation est personnel et expire après 24 heures. Si
        le bouton ne fonctionne pas, copiez-collez cette adresse dans votre
        navigateur :
        <br />
        <span style={{ wordBreak: "break-all", fontSize: 11 }}>
          {inviteUrl}
        </span>
      </Paragraph>

      <Divider />

      <EmailFooter agencyName={agencyName} />
    </EmailLayout>
  );
}
