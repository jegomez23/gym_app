import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
import { activityKindLabel } from "@/features/shared";
import type { CommitDetail } from "@/lib/dal";

import { AddReflectionForm } from "./AddReflectionForm";

type DocumentScreenProps = {
  document: CommitDetail;
  isOwner: boolean;
};

const intensityLabels: Record<string, string> = {
  light: "Ligero",
  steady: "Constante",
  deep: "Profundo",
};

const intensityColor: Record<string, string> = {
  light: "var(--intensity-light)",
  steady: "var(--intensity-steady)",
  deep: "var(--intensity-deep)",
};

const visibilityLabels: Record<string, string> = {
  private: "Privado",
  circle: "Círculo",
  public: "Público",
};

function longDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function DocumentScreen({ document, isOwner }: DocumentScreenProps) {
  const movement = activityKindLabel(document.type);
  // The account: the original note (legacy) first, then every reflection in full,
  // oldest to newest — the experience as it was preserved and added to over time.
  const account = [...document.reflections].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  const hasAccount = Boolean(document.note) || account.length > 0;

  return (
    <>
      {/* The facts of the day: how long, with what intensity, who can see it. */}
      <AppCard level="quiet">
        <div className="flex flex-wrap items-center gap-2">
          {movement && (
            <span className="rounded-full border border-white/8 px-3 py-1 text-caption font-semibold text-secondary-text">
              {movement}
            </span>
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1 text-caption font-semibold text-secondary-text">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: document.intensity
                  ? intensityColor[document.intensity]
                  : "var(--text-secondary)",
              }}
            />
            {document.intensity
              ? intensityLabels[document.intensity]
              : "Sin ritmo"}
          </span>
          {document.durationMinutes && (
            <span className="rounded-full border border-white/8 px-3 py-1 text-caption font-semibold text-secondary-text">
              {document.durationMinutes} min
            </span>
          )}
          <span className="rounded-full border border-white/8 px-3 py-1 text-caption font-semibold text-secondary-text">
            {visibilityLabels[document.visibility]}
          </span>
        </div>

        {!isOwner && (
          <div className="mt-5 flex items-center gap-3 border-t border-white/8 pt-5">
            <Avatar
              name={document.profile.name}
              size={36}
              src={document.profile.avatarUrl}
            />
            <p className="text-body text-primary-text">
              {document.profile.name}
            </p>
          </div>
        )}
      </AppCard>

      {/* The experience itself, in the person's own words. */}
      {hasAccount ? (
        <section className="flex flex-col gap-4">
          {document.note && (
            <AppCard>
              <p className="whitespace-pre-line text-body leading-7 text-primary-text">
                {document.note}
              </p>
            </AppCard>
          )}
          {account.map((reflection) => (
            <AppCard key={reflection.id}>
              <p className="whitespace-pre-line text-body leading-7 text-primary-text">
                {reflection.content}
              </p>
              <p className="mt-3 text-label uppercase text-secondary-text">
                {shortDate(reflection.createdAt)}
              </p>
            </AppCard>
          ))}
        </section>
      ) : (
        isOwner && (
          <p className="px-1 text-body leading-7 text-secondary-text">
            Apareciste el {longDate(document.recordedAt)}. Cuando quieras, deja
            por escrito lo que fue.
          </p>
        )
      )}

      {/* Documentation grows: the owner can add to the account at any time. */}
      {isOwner && (
        <div className="border-t border-white/8 pt-6">
          <AddReflectionForm commitId={document.id} />
        </div>
      )}
    </>
  );
}
