import Link from "next/link";

import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
import { activityKindLabel } from "@/features/shared";

import type { PublicDocument } from "../queries";

type ExploreScreenProps = {
  documents: PublicDocument[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function PublicDocumentCard({ document }: { document: PublicDocument }) {
  const { commit, author } = document;
  const movement = activityKindLabel(commit.type);
  const title = commit.title || movement || "Evidencia";

  return (
    <Link
      aria-label={`Abrir ${title} de ${author.name}`}
      className="block rounded-[inherit] outline-none transition-colors duration-[var(--duration-base)] focus-visible:ring-2 focus-visible:ring-accent"
      href={`/evidence/${commit.id}`}
    >
      <AppCard className="transition-colors duration-[var(--duration-base)] hover:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Avatar name={author.name} size={36} src={author.avatarUrl} />
          <div>
            <p className="text-body text-primary-text">{author.name}</p>
            <p className="text-label uppercase text-secondary-text">
              {movement ? `${movement} · ` : ""}
              {formatDate(commit.recordedAt)}
            </p>
          </div>
        </div>
        <h2 className="mt-4 text-heading text-primary-text">{title}</h2>
      </AppCard>
    </Link>
  );
}

export function ExploreScreen({ documents }: ExploreScreenProps) {
  if (documents.length === 0) {
    return (
      <AppCard className="flex min-h-72 flex-col justify-center" level="hero">
        <p className="text-label uppercase text-accent">La biblioteca</p>
        <h2 className="mt-4 text-title text-primary-text">
          Aquí vivirá la práctica de otros.
        </h2>
        <p className="mt-3 text-body leading-7 text-secondary-text">
          Cuando alguien deja ver lo que hace, su documentación aparece aquí,
          para leerla con calma. Todavía no hay nada público. Puedes ser quien
          lo empiece.
        </p>
      </AppCard>
    );
  }

  return (
    <>
      {documents.map((document) => (
        <PublicDocumentCard document={document} key={document.commit.id} />
      ))}
    </>
  );
}
