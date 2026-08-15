import {
  EmailLayout,
  Heading,
  Italic,
  Paragraph,
  Divider,
  EmailFooter,
} from "./_layout";

interface EstimationConfirmationProps {
  agencyName: string;
  firstName: string;
}

export default function EstimationConfirmation({
  agencyName,
  firstName,
}: EstimationConfirmationProps) {
  return (
    <EmailLayout
      preview={`Votre demande d'estimation est en route, ${firstName}`}
      eyebrow={`${agencyName} · Estimation`}
    >
      <Heading>
        Demande reçue,
        <br />
        <Italic>on prépare votre évaluation.</Italic>
      </Heading>

      <Paragraph>Bonjour {firstName},</Paragraph>

      <Paragraph>
        Merci pour votre demande d&apos;estimation. Un agent de l&apos;équipe
        vous contacte dans les prochains jours ouvrés pour convenir d&apos;un
        rendez-vous sur place — la visite nous permet d&apos;affiner la
        fourchette et d&apos;ajuster à la réalité du marché local.
      </Paragraph>

      <Paragraph muted>
        En attendant, rassemblez si possible : le titre de propriété, le
        dernier relevé DPE/GES, les derniers diagnostics, et les éventuels
        travaux récents. Rien d&apos;obligatoire, mais cela accélère le
        chiffrage final.
      </Paragraph>

      <Divider />

      <EmailFooter agencyName={agencyName} />
    </EmailLayout>
  );
}
