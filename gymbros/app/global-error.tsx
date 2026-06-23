"use client";

import { useEffect } from "react";

// Root-level boundary. Catches errors thrown in the root layout / providers,
// which the per-segment app/error.tsx cannot recover. Must render its own
// <html>/<body> and use inline styles, since the CSS pipeline or layout may be
// the thing that failed.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "1rem",
          textAlign: "center",
          background: "#0c0f0a",
          color: "#f5f6f4",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
          No pudimos cargar la aplicacion.
        </h1>
        <p
          style={{
            maxWidth: "24rem",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "#a7afa3",
            margin: 0,
          }}
        >
          Ocurrio un error inesperado al iniciar. Intenta de nuevo.
        </p>
        <button
          onClick={reset}
          type="button"
          style={{
            borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            padding: "0.75rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#f5f6f4",
            cursor: "pointer",
          }}
        >
          Intentar de nuevo
        </button>
      </body>
    </html>
  );
}
