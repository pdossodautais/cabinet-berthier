import { PreviewRedirect } from "@/components/preview-redirect";

export const dynamic = "force-dynamic";

/**
 * Ancienne page d'édition conservée pour compatibilité ascendante. Elle
 * redirige vers `/blog?preview=<id>` où le Sheet d'édition s'ouvre
 * automatiquement.
 */
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreviewRedirect basePath="/blog" id={id} />;
}
