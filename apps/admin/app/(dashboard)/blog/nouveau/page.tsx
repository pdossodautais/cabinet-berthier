import { PreviewRedirect } from "@/components/preview-redirect";

export const dynamic = "force-dynamic";

/**
 * Ancienne page de création conservée pour compatibilité ascendante. Elle
 * redirige vers `/blog?preview=new` où le Sheet de création s'ouvre
 * automatiquement.
 */
export default async function NewPostPage() {
  return <PreviewRedirect basePath="/blog" id="new" />;
}
