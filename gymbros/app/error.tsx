"use client";

import { useEffect } from "react";
import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error so it is captured by server/browser logs in production.
    // Replace with an error reporting integration (e.g. Sentry) when available.
    console.error("[route-error]", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <p className="text-label uppercase text-accent">Algo salió mal</p>
      <h1 className="text-title text-primary-text">
        No pudimos cargar esta página.
      </h1>
      <p className="max-w-sm text-body text-secondary-text">
        Ocurrió un error inesperado. Intenta de nuevo o vuelve al inicio.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <AppButton onClick={reset} variant="secondary">
          Intentar de nuevo
        </AppButton>
        <Link href="/">
          <AppButton variant="ghost">Volver al inicio</AppButton>
        </Link>
      </div>
    </main>
  );
}
