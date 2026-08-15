import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
  Link,
} from "@react-email/components";
import type { ReactNode } from "react";
import clientConfigJson from "../../../.client-config.json";

/**
 * Accent dynamique lu une seule fois au chargement du module depuis
 * `.client-config.json` (source unique de vérité, validée par Zod côté
 * `@repo/shared/client-config`). Import JSON direct pour éviter une
 * dépendance circulaire au niveau workspace (`@repo/shared` consomme déjà
 * `@repo/emails` via les templates resend).
 */
const accent =
  (clientConfigJson as { brand?: { accentColor?: string } }).brand
    ?.accentColor || "#111827";

/**
 * Tokens éditoriaux — calqués sur le système éditorial du thème
 * (cf. packages/ui/src/brand.css) : palette ivory/paper/ink + serif
 * Cormorant Garamond pour les titres, Inter Tight pour le corps,
 * JetBrains Mono pour les eyebrows et références.
 *
 * L'accent (CTA, liens) vient de `.client-config.json#brand.accentColor`
 * pour rester template-friendly. Le reste de la palette est fixé pour
 * garantir la même charte sur tous les clients qui adoptent ce template
 * éditorial. Hex direct uniquement (Outlook ne lit pas oklch / var()).
 */
const tokens = {
  ivory: "#f4ede0",
  paper: "#faf6ec",
  bg: "#faf6ec",
  border: "#ebe2d0",
  ink: "#0b1020",
  ink2: "#1a2238",
  inkMuted: "#5e6373",
  inkSubtle: "#8a8e9c",
  gold: "#b08a3e",
  serif:
    "'Cormorant Garamond', Cormorant, Georgia, 'Times New Roman', serif",
  sans: "'Inter Tight', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace",
} as const;

/**
 * Wrapper éditorial partagé par tous les emails transactionnels.
 * Reproduit le système éditorial du thème : fond ivory (chaud), card paper avec
 * filet bone, eyebrow mono uppercase letter-spaced (chapter-mark), serif
 * Cormorant pour les titres. L'accent est dynamique (`.client-config.json`).
 * Inline styles uniquement (Outlook / Gmail / Apple Mail).
 */
export function EmailLayout({
  preview,
  eyebrow,
  children,
}: {
  preview: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: tokens.ivory,
          fontFamily: tokens.sans,
          color: tokens.ink,
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "40px 24px 56px",
          }}
        >
          <Text
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: tokens.inkSubtle,
              fontWeight: 400,
              fontFamily: tokens.mono,
            }}
          >
            ¶ {eyebrow}
          </Text>

          <Section
            style={{
              backgroundColor: tokens.paper,
              border: `1px solid ${tokens.border}`,
              padding: "36px 32px",
              marginTop: 14,
            }}
          >
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Titre principal — serif Cormorant Garamond (équivalent .h-display du site). */
export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: "0 0 20px",
        fontFamily: tokens.serif,
        fontSize: 32,
        fontWeight: 500,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color: tokens.ink,
      }}
    >
      {children}
    </Text>
  );
}

/** Italique serif (équivalent .h-italic du site, accent éditorial). */
export function Italic({ children }: { children: ReactNode }) {
  return (
    <em
      style={{
        fontStyle: "italic",
        fontFamily: tokens.serif,
        fontWeight: 400,
        color: accent,
      }}
    >
      {children}
    </em>
  );
}

/** Paragraphe de corps — 15px Inter Tight, line-height 1.65 (cf. site). */
export function Paragraph({
  children,
  mono = false,
  muted = false,
}: {
  children: ReactNode;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <Text
      style={{
        margin: "0 0 14px",
        fontSize: mono ? 12 : 15,
        lineHeight: 1.65,
        fontFamily: mono ? tokens.mono : tokens.sans,
        color: muted ? tokens.inkMuted : tokens.ink2,
        letterSpacing: mono ? "0.06em" : "normal",
      }}
    >
      {children}
    </Text>
  );
}

export function Divider() {
  return (
    <Hr
      style={{
        border: 0,
        borderTop: `1px solid ${tokens.border}`,
        margin: "24px 0",
      }}
    />
  );
}

/**
 * Bouton éditorial — équivalents .btn-ink (variant="dark"), .btn-cobalt
 * (variant="accent" qui suit `.client-config.json#brand.accentColor`),
 * et .btn-ghost (variant="outline").
 */
export function Button({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "accent" | "outline";
}) {
  const styles =
    variant === "accent"
      ? { bg: accent, border: accent, color: tokens.paper }
      : variant === "dark"
        ? { bg: tokens.ink, border: tokens.ink, color: tokens.paper }
        : { bg: "transparent", border: tokens.ink, color: tokens.ink };
  return (
    <table
      role="presentation"
      cellPadding="0"
      cellSpacing="0"
      style={{ borderCollapse: "collapse", margin: "8px 0 4px" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: styles.bg,
              border: `1px solid ${styles.border}`,
              padding: "12px 22px",
            }}
          >
            <Link
              href={href}
              style={{
                color: styles.color,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 500,
                textDecoration: "none",
                fontFamily: tokens.sans,
              }}
            >
              {children}
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Label éditorial (.h-eyebrow du site) — mono uppercase letter-spaced. */
export function EyebrowInline({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: "0 0 6px",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: tokens.inkSubtle,
        fontFamily: tokens.mono,
        fontWeight: 400,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * Footer standard : signature + (optionnel) liens de désinscription.
 * Les liens unsubscribe utilisent l'accent dynamique du client.
 */
export function EmailFooter({
  agencyName,
  unsubscribe,
}: {
  agencyName: string;
  unsubscribe?: { single?: string; all?: string };
}) {
  return (
    <>
      <Divider />
      <Text
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
          color: tokens.inkMuted,
          fontFamily: tokens.sans,
        }}
      >
        À bientôt,
        <br />
        L&apos;équipe {agencyName}
      </Text>

      {unsubscribe && (unsubscribe.single || unsubscribe.all) && (
        <Text
          style={{
            margin: "20px 0 0",
            paddingTop: 16,
            borderTop: `1px solid ${tokens.border}`,
            fontSize: 12,
            lineHeight: 1.6,
            color: tokens.inkMuted,
            fontFamily: tokens.sans,
          }}
        >
          Vous recevez cet email parce que vous avez créé une alerte sur notre
          site.{" "}
          {unsubscribe.single && (
            <Link
              href={unsubscribe.single}
              style={{ color: accent, textDecoration: "underline" }}
            >
              Désactiver cette alerte
            </Link>
          )}
          {unsubscribe.single && unsubscribe.all && " · "}
          {unsubscribe.all && (
            <Link
              href={unsubscribe.all}
              style={{ color: accent, textDecoration: "underline" }}
            >
              Me désabonner de toutes
            </Link>
          )}
        </Text>
      )}
    </>
  );
}
