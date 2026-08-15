import {
  EmailLayout,
  Heading,
  Italic,
  Paragraph,
  Divider,
  EmailFooter,
} from "./_layout";

interface ContactReplyProps {
  agencyName: string;
  contactFirstName: string;
  message: string;
}

export default function ContactReply({
  agencyName,
  contactFirstName,
  message,
}: ContactReplyProps) {
  return (
    <EmailLayout
      preview={`Réponse de ${agencyName}`}
      eyebrow={`${agencyName} · Réponse`}
    >
      <Heading>
        Bonjour {contactFirstName},
        <br />
        <Italic>voici notre retour.</Italic>
      </Heading>

      <Paragraph>
        <span style={{ whiteSpace: "pre-line" }}>{message}</span>
      </Paragraph>

      <Divider />

      <EmailFooter agencyName={agencyName} />
    </EmailLayout>
  );
}
