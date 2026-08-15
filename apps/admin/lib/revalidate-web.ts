/**
 * Invalide le cache ISR du site public après une modification admin.
 *
 * Appelle POST /api/revalidate sur le site web avec le tag + paths à invalider.
 * En dev, le port du web est dynamique (autoPort). On essaye NEXT_PUBLIC_SITE_URL
 * puis des ports communs en fallback (3000, 3001, ..., 65535 autoPort dev).
 */

const DEV_PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

type Payload = {
  tag: string;
  /** Paths supplémentaires à revalidate (ex: "/") pour invalider le SSG */
  paths?: string[];
};

async function postTo(url: string, body: Payload & { secret: string }) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function revalidateWeb(...tags: string[]): Promise<void> {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) return;

  // Paths associés à chaque tag (pour invalider aussi les pages SSG)
  const pathsByTag: Record<string, string[]> = {
    properties: ["/", "/biens", "/favoris"],
    testimonials: ["/", "/temoignages"],
    posts: ["/", "/blog"],
    settings: ["/", "/contact", "/a-propos", "/temoignages"],
    agents: ["/a-propos", "/contact"],
  };

  // URLs à essayer : l'URL configurée + les ports dev en fallback
  const urls: string[] = [];
  if (configuredUrl) urls.push(configuredUrl);
  if (process.env.NODE_ENV !== "production") {
    for (const p of DEV_PORTS) {
      const u = `http://localhost:${p}`;
      if (u !== configuredUrl) urls.push(u);
    }
  }

  await Promise.allSettled(
    tags.flatMap((tag) => {
      const paths = pathsByTag[tag] ?? [];
      return urls.map(async (base) => {
        const ok = await postTo(`${base}/api/revalidate`, {
          tag,
          paths,
          secret,
        });
        // En dev on s'arrête dès qu'un port répond (évite de spammer les logs)
        return ok;
      });
    }),
  );
}
