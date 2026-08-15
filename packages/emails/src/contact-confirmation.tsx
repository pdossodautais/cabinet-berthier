import {
  EmailLayout,
  Heading,
  Italic,
  Paragraph,
  Divider,
  EmailFooter,
} from "./_layout";

interface ContactConfirmationProps {
  agencyName: string;
  firstName: string;
}

export default function ContactConfirmation({
  agencyName,
  firstName,
}: ContactConfirmationProps) {
  return (
    <EmailLayout
      preview={`Merci pour votre message, ${firstName}`}
      eyebrow={`${agencyName} · Accusé de réception`}
    >
      <Heading>
        Message bien reçu,
        <br />
        <Italic>on vous répond vite.</Italic>
      </Heading>

      <Paragraph>Bonjour {firstName},</Paragraph>

      <Paragraph>
        Merci pour votre message — il nous est bien parvenu. Un membre de
        l&apos;équipe revient vers vous dans les meilleurs délais, généralement
        sous 24 heures ouvrées.
      </Paragraph>

      <Paragraph muted>
        En attendant, n&apos;hésitez pas à parcourir notre sélection de biens
        si vous ne l&apos;avez pas déjà fait.
      </Paragraph>

      <Divider />

      <EmailFooter agencyName={agencyName} />
    </EmailLayout>
  );
}
