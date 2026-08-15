import { PreviewRedirect } from "@/components/preview-redirect";

export const dynamic = "force-dynamic";

/**
 * Ancienne page détail conservée pour compatibilité ascendante (liens
 * externes). Elle redirige immédiatement vers `/estimations?preview=<id>`
 * où le Dialog de détail s'ouvre automatiquement.
 */
export default async function EstimationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreviewRedirect basePath="/estimations" id={id} />;
}
