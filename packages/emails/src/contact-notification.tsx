import { Text } from "@react-email/components";
import {
  EmailLayout,
  Heading,
  Italic,
  Paragraph,
  Divider,
  EmailFooter,
  EyebrowInline,
} from "./_layout";

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO_FONT = "ui-monospace, Menlo, Consolas, monospace";
const BORDER = "#e5e7eb";
const INK = "#111827";
const INK_2 = "#374151";

interface ContactNotificationProps {
  agencyName: string;
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    message: string;
  };
}

export default function ContactNotification({
  agencyName,
  contact,
}: ContactNotificationProps) {
  return (
    <EmailLayout
      preview={`Nouveau message de ${contact.first_name} ${contact.last_name}`}
      eyebrow={`${agencyName} · Nouveau contact`}
    >
      <Heading>
        Un message arrive,
        <br />
        <Italic>pour vous.</Italic>
      </Heading>

      <Paragraph>
        Nouveau message envoyé via le formulaire de contact du site.
      </Paragraph>

      <table
        role="presentation"
        cellPadding="0"
        cellSpacing="0"
        style={{
          width: "100%",
          margin: "8px 0 18px",
          borderCollapse: "collapse",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "14px 0", verticalAlign: "top", width: "50%" }}>
              <EyebrowInline>Nom</EyebrowInline>
              <Text
                style={{
                  margin: 0,
                  fontFamily: SYSTEM_FONT,
                  fontSize: 16,
                  fontWeight: 600,
                  color: INK,
                }}
              >
                {contact.first_name} {contact.last_name}
              </Text>
            </td>
            <td
              style={{
                padding: "14px 0 14px 16px",
                verticalAlign: "top",
                borderLeft: `1px solid ${BORDER}`,
              }}
            >
              <EyebrowInline>Email</EyebrowInline>
              <Text
                style={{
                  margin: 0,
                  fontFamily: SYSTEM_FONT,
                  fontSize: 14,
                  color: INK_2,
                  wordBreak: "break-all",
                }}
              >
                {contact.email}
              </Text>
            </td>
          </tr>
          {contact.phone && (
            <tr>
              <td
                colSpan={2}
                style={{
                  padding: "14px 0",
                  borderTop: `1px solid ${BORDER}`,
                }}
              >
                <EyebrowInline>Téléphone</EyebrowInline>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: MONO_FONT,
                    fontSize: 14,
                    color: INK,
                  }}
                >
                  {contact.phone}
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <EyebrowInline>Message</EyebrowInline>
      <Paragraph>
        <span style={{ whiteSpace: "pre-line" }}>{contact.message}</span>
      </Paragraph>

      <Divider />

      <EmailFooter agencyName={agencyName} />
    </EmailLayout>
  );
}
