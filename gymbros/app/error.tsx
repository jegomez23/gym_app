"use client";

import { useEffect } from "react";
import Link from "next/link";

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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Algo salio mal
      </p>
      <h1 className="text-2xl font-semibold text-primary-text">
        No pudimos cargar esta pagina.
      </h1>
      <p className="max-w-sm text-sm leading-6 text-secondary-text">
        Ocurrio un error inesperado. Intenta de nuevo o vuelve al inicio.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-full border border-white/8 px-6 py-3 text-sm font-semibold text-primary-text transition hover:bg-white/5"
          onClick={reset}
          type="button"
        >
          Intentar de nuevo
        </button>
        <Link
          className="rounded-full border border-white/8 px-6 py-3 text-sm font-semibold text-secondary-text transition hover:bg-white/5"
          href="/"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
