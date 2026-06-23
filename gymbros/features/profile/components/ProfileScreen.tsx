import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatBlock } from "@/components/ui/StatBlock";
import { logoutAction } from "@/features/auth/actions/logout";
import type {
  CircleMembership,
  CirclePresence,
  Profile,
  ProgressSummary,
} from "@/lib/dal";

import { DeleteAccountForm } from "./DeleteAccountForm";
import { ProfileEditForm } from "./ProfileEditForm";

type ProfileScreenProps = {
  profile: Profile;
  progress: ProgressSummary;
  memberships: CircleMembership[];
  presence: CirclePresence[];
};

const productPrinciples = [
  "Sin feed publico",
  "Sin metricas de vanidad",
  "Sin comparacion corporal",
  "Evidencia sobre obsesion",
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildingSince(value: string) {
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileScreen({
  profile,
  progress,
  memberships,
  presence,
}: ProfileScreenProps) {
  return (
    <>
      <AppCard>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg font-semibold text-accent">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-full w-full rounded-full object-cover"
                src={profile.avatarUrl}
              />
            ) : (
              initials(profile.name) || "GC"
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary-text">
              {profile.name}
            </h2>
            <p className="mt-1 text-sm text-secondary-text">
              @{profile.username ?? "pendiente"} - Construyendo desde{" "}
              {buildingSince(profile.createdAt)}
            </p>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-5 text-base leading-7 text-primary-text">
            {profile.bio}
          </p>
        )}
      </AppCard>

      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Editar perfil
        </p>
        <ProfileEditForm profile={profile} />
      </AppCard>

      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Resumen de disciplina
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatBlock label="Commits totales" value={progress.totalCommits} />
          <StatBlock label="Dias activos" value={progress.activeDays} />
          <StatBlock label="Visibilidad" value={profile.visibilityPreference} />
        </div>
      </AppCard>

      <AppCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Circulo privado
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary-text">
              {memberships.length} miembros
            </h2>
          </div>
          <span className="rounded-full border border-[var(--accent-border)] px-4 py-2 text-xs font-semibold text-accent">
            Privado
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatBlock label="Miembros activos" value={presence.length} />
          <StatBlock label="Relaciones" value={memberships.length} />
        </div>
      </AppCard>

      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Principios del producto
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {productPrinciples.map((principle) => (
            <li
              className="flex items-center gap-3 text-sm text-primary-text"
              key={principle}
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              {principle}
            </li>
          ))}
        </ul>
        <form action={logoutAction}>
          <AppButton className="mt-6 w-full" type="submit" variant="secondary">
            Cerrar sesion
          </AppButton>
        </form>
        <DeleteAccountForm />
      </AppCard>
    </>
  );
}
