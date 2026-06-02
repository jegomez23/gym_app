import type { ReactNode } from "react";

type ScreenContainerProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function ScreenContainer({
  children,
  eyebrow,
  title,
  subtitle,
}: ScreenContainerProps) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-48 pt-7 sm:px-6 sm:pt-9">
      {(eyebrow || title || subtitle) && (
        <header className="mb-7">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          )}
          {title && (
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-normal text-primary-text">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-3 max-w-[22rem] text-sm leading-6 text-secondary-text">
              {subtitle}
            </p>
          )}
        </header>
      )}
      <div className="flex flex-1 flex-col gap-4">{children}</div>
    </div>
  );
}
