import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface MiddlewareOptions {
  protectedRoutes?: "all" | string[];
  loginPath?: string;
  defaultRedirect?: string;
}

export async function updateSession(
  request: NextRequest,
  options: MiddlewareOptions = {}
) {
  const {
    protectedRoutes = "all",
    loginPath = "/login",
    defaultRedirect = "/",
  } = options;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if route should be protected
  const pathname = request.nextUrl.pathname;
  const isLoginPath = pathname === loginPath;
  const isAuthCallback = pathname.startsWith("/auth/callback");

  const shouldProtect =
    protectedRoutes === "all"
      ? !isLoginPath && !isAuthCallback
      : protectedRoutes.some((p) => pathname.startsWith(p));

  if (shouldProtect && !user) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (isLoginPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = defaultRedirect;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
