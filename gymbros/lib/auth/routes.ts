export const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export const authRoutes = ["/login", "/signup", "/forgot-password"] as const;

export const privateRoutes = [
  "/commit",
  "/archive",
  "/circle",
  "/profile",
] as const;

export const onboardingRoute = "/onboarding";

export function isRouteMatch(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function safeReturnTo(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  if (isRouteMatch(value, authRoutes)) {
    return "/";
  }

  return value;
}
