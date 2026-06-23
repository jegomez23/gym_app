import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  authRoutes,
  isRouteMatch,
  onboardingRoute,
  privateRoutes,
} from "@/lib/auth/routes";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/supabase/types/database.generated";

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function loginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "returnTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  if (
    !publicEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPrivate = isRouteMatch(pathname, privateRoutes);
  const isOnboarding = pathname === onboardingRoute;
  const isAuthEntry = isRouteMatch(pathname, authRoutes);

  if (!user) {
    if (isPrivate || isOnboarding) {
      return loginRedirect(request);
    }

    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  const profileReady = Boolean(
    profile?.onboarding_completed && !profile.deleted_at
  );

  if (isAuthEntry) {
    return redirectTo(request, profileReady ? "/" : onboardingRoute);
  }

  if (!profileReady && isPrivate) {
    const onboardingUrl = new URL(onboardingRoute, request.url);
    onboardingUrl.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(onboardingUrl);
  }

  if (profileReady && isOnboarding) {
    return redirectTo(request, "/");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
