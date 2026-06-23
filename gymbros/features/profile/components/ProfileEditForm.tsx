"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { AuthStatus } from "@/features/auth/components/AuthStatus";
import { initialAuthActionState } from "@/lib/auth/actionState";
import type { Profile } from "@/lib/dal";

import { updateProfileAction } from "../actions/updateProfile";

type ProfileEditFormProps = {
  profile: Profile;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialAuthActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Username
        <input
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={profile.username ?? ""}
          maxLength={30}
          minLength={3}
          name="username"
          pattern="[a-z0-9_]+"
          required
        />
        <span className="text-xs leading-5 text-secondary-text/80">
          Solo minusculas, numeros y guion bajo. Te pueden invitar por este
          nombre.
        </span>
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Display name
        <input
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={profile.name}
          maxLength={100}
          name="name"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Bio
        <textarea
          className="min-h-24 resize-none rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={profile.bio ?? ""}
          maxLength={200}
          name="bio"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Avatar URL
        <input
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={profile.avatarUrl ?? ""}
          maxLength={500}
          name="avatarUrl"
          placeholder="Storage llega en la fase final"
        />
        <span className="text-xs leading-5 text-secondary-text/80">
          Placeholder sin upload todavia: pega una URL temporal si necesitas una
          imagen.
        </span>
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Visibilidad
        <select
          className="cursor-pointer rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={profile.visibilityPreference}
          name="visibilityPreference"
        >
          <option value="circle">Circulo — solo miembros de tu circulo</option>
          <option value="private">Privado — solo tu</option>
          <option value="public">Publico — cualquiera</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Timezone
        <input
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={profile.timezone}
          maxLength={80}
          name="timezone"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Locale
        <input
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={profile.locale}
          maxLength={20}
          minLength={2}
          name="locale"
          required
        />
      </label>
      <AuthStatus state={state} />
      <AppButton disabled={pending} type="submit" variant="secondary">
        {pending ? "Guardando" : "Guardar perfil"}
      </AppButton>
    </form>
  );
}
