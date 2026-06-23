import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        404
      </p>
      <h1 className="text-2xl font-semibold text-primary-text">
        Esta pagina no existe.
      </h1>
      <p className="max-w-sm text-sm leading-6 text-secondary-text">
        No encontramos lo que buscabas.
      </p>
      <Link
        className="rounded-full border border-white/8 px-6 py-3 text-sm font-semibold text-secondary-text transition hover:bg-white/5"
        href="/"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
