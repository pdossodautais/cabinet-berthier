import { PreviewRedirect } from "@/components/preview-redirect";

export const dynamic = "force-dynamic";

/**
 * Ancienne page détail conservée pour compatibilité ascendante (liens
 * externes, emails). Elle redirige immédiatement vers `/contacts?preview=<id>`
 * où le Dialog de détail s'ouvre automatiquement.
 */
export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreviewRedirect basePath="/contacts" id={id} />;
}
