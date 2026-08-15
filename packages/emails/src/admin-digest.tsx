import {
  EmailLayout,
  Heading,
  Paragraph,
  Button,
  Divider,
  EmailFooter,
} from "./_layout";

interface AdminDigestProps {
  agencyName: string;
  event: "new_contact" | "new_estimation" | "new_property";
  summary: string;
  detailUrl: string;
  detailLabel: string;
}

export default function AdminDigest({
  agencyName,
  event,
  summary,
  detailUrl,
  detailLabel,
}: AdminDigestProps) {
  const titles: Record<AdminDigestProps["event"], string> = {
    new_contact: "Nouveau message.",
    new_estimation: "Nouvelle estimation.",
    new_property: "Nouveau bien publié.",
  };

  return (
    <EmailLayout
      preview={`${agencyName} — ${titles[event]}`}
      eyebrow={`${agencyName} · Notifications admin`}
    >
      <Heading>{titles[event]}</Heading>

      <Paragraph>
        <span style={{ whiteSpace: "pre-line" }}>{summary}</span>
      </Paragraph>

      <Button href={detailUrl}>{detailLabel}</Button>

      <Divider />

      <Paragraph muted>
        Vous recevez ce message parce que vous avez activé les notifications
        administrateur dans Paramètres. Désactivez-les à tout moment.
      </Paragraph>

      <EmailFooter agencyName={agencyName} />
    </EmailLayout>
  );
}
