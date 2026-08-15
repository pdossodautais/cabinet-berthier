// Endpoint dev-only : reçoit un POST JSON et l'écrit sur disque
// (au root du monorepo, sous `.tmp-<name>`). Permet au browser de passer un
// gros payload au script Node local (ex. pipeline /ingest-logic-immo).
//
// Sécurité :
//  - 403 en production (NODE_ENV === "production")
//  - Header `X-Ingest-Secret` requis, valeur depuis process.env.REVALIDATE_SECRET
//  - Restriction du nom de fichier : seuls caractères [a-z0-9._-] acceptés
//    pour éviter tout path traversal
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Ingest-Secret",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Disabled in production" },
      { status: 403, headers: CORS },
    );
  }

  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret || req.headers.get("x-ingest-secret") !== expectedSecret) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: CORS },
    );
  }

  const body = await req.json();
  const rawName = req.nextUrl.searchParams.get("name") || "dev-dump.json";
  // Path traversal protection : whitelist des caractères.
  const safeName = rawName.replace(/[^a-z0-9._-]/gi, "_").slice(0, 64);
  // Écriture au root du monorepo (dossier parent de process.cwd() de apps/web)
  const root = process.cwd().replace(/[/\\]apps[/\\]web$/, "");
  const path = join(root, `.tmp-${safeName}`);
  await writeFile(path, JSON.stringify(body, null, 2), "utf8");
  return NextResponse.json(
    { ok: true, path, size: JSON.stringify(body).length },
    { headers: CORS },
  );
}
