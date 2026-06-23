import type { ReactNode } from "react";

type ScreenContainerProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Optional element rendered at the top as the screen's single anchor. */
  hero?: ReactNode;
};

export function ScreenContainer({
  children,
  eyebrow,
  title,
  subtitle,
  hero,
}: ScreenContainerProps) {
  const hasHeader = Boolean(eyebrow || title || subtitle);

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-40 pt-7 sm:px-6 sm:pt-9">
      {hasHeader && (
        <header className="mb-7 animate-rise">
          {eyebrow && (
            <p className="mb-2 text-label uppercase text-accent">{eyebrow}</p>
          )}
          {title && (
            <h1 className="text-balance text-display text-primary-text">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-3 max-w-[22rem] text-body text-secondary-text">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {hero && <div className="mb-4 animate-rise">{hero}</div>}
      <div className="stagger-children flex flex-1 flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
