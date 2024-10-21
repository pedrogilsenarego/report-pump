import { RouterKeys } from "@/constants/router";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Add any routes that should be protected
export const protectedPaths = [
  RouterKeys.MAIN,
  RouterKeys.ANALYTICS,
  RouterKeys.INSTALLATIONS,
  RouterKeys.SETTINGS,
  RouterKeys.USERS,
];

// Utility function to check if a path is protected
const isProtectedPath = (pathname: string) => {
  return protectedPaths.some((protectedPath) =>
    pathname.startsWith(protectedPath)
  );
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();

  const url = new URL(request.url);

  if (data.session) {
    if (
      url.pathname === "/auth" ||
      url.pathname === "/signup" ||
      url.pathname === "/"
    ) {
      return NextResponse.redirect(new URL(RouterKeys.MAIN, request.url));
    }
    return supabaseResponse;
  } else {
    if (isProtectedPath(url.pathname)) {
      return NextResponse.redirect(
        new URL(`/auth?next=${url.pathname}`, request.url)
      );
    }
    return supabaseResponse;
  }
}
