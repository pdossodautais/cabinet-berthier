import { Text } from "@react-email/components";
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
import { formatPrice, formatSurface } from "./_format";

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const BORDER = "#e5e7eb";
const INK = "#111827";
const INK_2 = "#374151";

interface PropertyAlertProps {
  agencyName: string;
  siteUrl: string;
  property: {
    title: string;
    slug: string;
    price: number;
    city: string;
    surface: number;
    rooms: number;
    type: string;
    transaction_type: string;
  };
  /** Liens HMAC pour désinscription (facultatifs). */
  unsubscribe?: { single: string; all: string };
}

export default function PropertyAlert({
  agencyName,
  siteUrl,
  property,
  unsubscribe,
}: PropertyAlertProps) {
  const url = `${siteUrl.replace(/\/+$/, "")}/biens/${property.slug}`;
  const txLabel = property.transaction_type === "location" ? "Location" : "Vente";
  const priceLabel =
    property.transaction_type === "location"
      ? `${formatPrice(property.price)} /mois`
      : formatPrice(property.price);

  return (
    <EmailLayout
      preview={`Nouveau bien qui correspond à votre recherche — ${property.title}`}
      eyebrow={`${agencyName} · ${txLabel}`}
    >
      <Heading>
        Un bien pour vous,
        <br />
        <Italic>ça vaut un coup d&apos;œil.</Italic>
      </Heading>

      <Paragraph>
        Nous venons de publier un bien qui correspond à vos critères de
        recherche. Quelques détails pour vous donner une idée :
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
            <td style={{ padding: "14px 0", verticalAlign: "top", width: "55%" }}>
              <EyebrowInline>Bien</EyebrowInline>
              <Text
                style={{
                  margin: 0,
                  fontFamily: SYSTEM_FONT,
                  fontSize: 18,
                  lineHeight: 1.3,
                  fontWeight: 600,
                  color: INK,
                }}
              >
                {property.title}
              </Text>
            </td>
            <td
              style={{
                padding: "14px 0 14px 16px",
                verticalAlign: "top",
                borderLeft: `1px solid ${BORDER}`,
              }}
            >
              <EyebrowInline>Adresse</EyebrowInline>
              <Text style={{ margin: 0, fontFamily: SYSTEM_FONT, fontSize: 14, color: INK_2 }}>
                {property.city}
              </Text>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              style={{
                padding: "14px 0",
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <table
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
                style={{ borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td style={{ paddingRight: 24 }}>
                      <EyebrowInline>Prix</EyebrowInline>
                      <Text
                        style={{
                          margin: 0,
                          fontFamily: SYSTEM_FONT,
                          fontSize: 20,
                          fontWeight: 600,
                          color: INK,
                        }}
                      >
                        {priceLabel}
                      </Text>
                    </td>
                    <td style={{ paddingRight: 24 }}>
                      <EyebrowInline>Surface</EyebrowInline>
                      <Text style={{ margin: 0, fontFamily: SYSTEM_FONT, fontSize: 14, color: INK_2 }}>
                        {formatSurface(property.surface)}
                      </Text>
                    </td>
                    <td>
                      <EyebrowInline>Pièces</EyebrowInline>
                      <Text style={{ margin: 0, fontFamily: SYSTEM_FONT, fontSize: 14, color: INK_2 }}>
                        {property.rooms}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <Button href={url}>Voir la fiche complète</Button>

      <Divider />

      <Paragraph muted>
        Si l&apos;intérieur vous plaît autant que la fiche, écrivez-nous pour
        organiser une visite — on garde les meilleurs créneaux pour les
        abonnés aux alertes.
      </Paragraph>

      <EmailFooter agencyName={agencyName} unsubscribe={unsubscribe} />
    </EmailLayout>
  );
}
