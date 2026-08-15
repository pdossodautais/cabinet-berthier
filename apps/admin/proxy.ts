import { type NextRequest } from "next/server";
import { updateSession } from "@repo/shared/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request, {
    protectedRoutes: "all",
    loginPath: "/login",
    defaultRedirect: "/",
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|ico|webp|gif|webmanifest)$).*)",
  ],
};
