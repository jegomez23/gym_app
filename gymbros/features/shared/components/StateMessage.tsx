import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";

type StateMessageProps = {
  eyebrow: string;
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

export function StateMessage({
  eyebrow,
  title,
  message,
  actionHref,
  actionLabel,
}: StateMessageProps) {
  return (
    <AppCard className="flex min-h-[16rem] flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-primary-text">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-secondary-text">{message}</p>
      {actionHref && actionLabel && (
        <Link className="mt-6" href={actionHref}>
          <AppButton className="w-full">{actionLabel}</AppButton>
        </Link>
      )}
    </AppCard>
  );
}
