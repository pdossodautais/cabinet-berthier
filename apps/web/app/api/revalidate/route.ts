import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const VALID_TAGS = ["properties", "settings", "agents", "posts", "testimonials"] as const;
type ValidTag = (typeof VALID_TAGS)[number];

/**
 * POST /api/revalidate
 *
 * Invalide le cache ISR pour un tag donné.
 * Appelé par l'admin après création/modification/suppression d'un bien, agent ou paramètre.
 *
 * Body : { tag: "properties" | "settings" | "agents" | "posts" | "testimonials", secret: string }
 *        ou { tag: "property-<slug>", secret: string } pour un bien spécifique
 *
 * Sécurité : requiert REVALIDATION_SECRET dans les env vars.
 */
export async function POST(request: Request) {
  try {
    const { tag, secret } = await request.json();

    if (!process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: "REVALIDATION_SECRET non configuré" },
        { status: 500 },
      );
    }

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: "Secret invalide" }, { status: 401 });
    }

    if (!tag || typeof tag !== "string") {
      return NextResponse.json({ error: "Tag manquant" }, { status: 400 });
    }

    const isValidGlobalTag = VALID_TAGS.includes(tag as ValidTag);
    const isPropertyTag = tag.startsWith("property-");

    if (!isValidGlobalTag && !isPropertyTag) {
      return NextResponse.json(
        { error: `Tag invalide. Tags valides : ${VALID_TAGS.join(", ")}, property-<slug>` },
        { status: 400 },
      );
    }

    revalidateTag(tag, "max");

    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
}
