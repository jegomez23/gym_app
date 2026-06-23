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
        <header className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal text-primary-text">
            {title}
          </h1>
          <p className="mt-3 max-w-[22rem] text-sm leading-6 text-secondary-text">
            {subtitle}
          </p>
        </header>

        <AppCard>{children}</AppCard>

        {footerHref && footerLabel && (
          <p className="mt-5 text-center text-sm text-secondary-text">
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
