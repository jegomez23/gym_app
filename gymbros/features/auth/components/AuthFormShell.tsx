import type { ReactNode } from "react";
import Link from "next/link";

import { AppCard } from "@/components/ui/AppCard";

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footerLabel?: string;
  footerHref?: string;
  footerText?: string;
};

export function AuthFormShell({
  eyebrow,
  title,
  subtitle,
  children,
  footerLabel,
  footerHref,
  footerText,
}: AuthFormShellProps) {
  return (
    <main className="min-h-dvh bg-background px-5 py-8 text-primary-text">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-lg flex-col justify-center">
        <header className="mb-7 animate-rise">
          <p className="mb-2 text-label uppercase text-accent">{eyebrow}</p>
          <h1 className="text-display text-primary-text">{title}</h1>
          <p className="mt-3 max-w-80 text-body text-secondary-text">
            {subtitle}
          </p>
        </header>

        <div className="animate-rise">
          <AppCard level="hero">{children}</AppCard>
        </div>

        {footerHref && footerLabel && (
          <p className="mt-5 text-center text-caption text-secondary-text">
            {footerText}{" "}
            <Link className="font-semibold text-accent" href={footerHref}>
              {footerLabel}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
