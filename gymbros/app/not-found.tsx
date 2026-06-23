import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <p className="text-label uppercase text-accent">404</p>
      <h1 className="text-title text-primary-text">Esta página no existe.</h1>
      <p className="max-w-sm text-body text-secondary-text">
        No encontramos lo que buscabas.
      </p>
      <Link href="/">
        <AppButton variant="secondary">Volver al inicio</AppButton>
      </Link>
    </main>
  );
}
