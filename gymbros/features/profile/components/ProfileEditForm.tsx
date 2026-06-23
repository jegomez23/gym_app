"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
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
      <Field
        helper="Solo minúsculas, números y guion bajo. Te pueden invitar por este nombre."
        htmlFor="profile-username"
        label="Username"
      >
        <Input
          defaultValue={profile.username ?? ""}
          id="profile-username"
          maxLength={30}
          minLength={3}
          name="username"
          pattern="[a-z0-9_]+"
          required
        />
      </Field>
      <Field htmlFor="profile-name" label="Tu nombre">
        <Input
          defaultValue={profile.name}
          id="profile-name"
          maxLength={100}
          name="name"
          required
        />
      </Field>
      <Field htmlFor="profile-bio" label="Bio">
        <Textarea
          className="min-h-24"
          defaultValue={profile.bio ?? ""}
          id="profile-bio"
          maxLength={200}
          name="bio"
        />
      </Field>
      <Field
        helper="Placeholder sin upload todavía: pega una URL temporal si necesitas una imagen."
        htmlFor="profile-avatar"
        label="Avatar URL"
      >
        <Input
          defaultValue={profile.avatarUrl ?? ""}
          id="profile-avatar"
          maxLength={500}
          name="avatarUrl"
          placeholder="Storage llega en la fase final"
        />
      </Field>
      <Field htmlFor="profile-visibility" label="Visibilidad">
        <Select
          defaultValue={profile.visibilityPreference}
          id="profile-visibility"
          name="visibilityPreference"
        >
          <option value="circle">Círculo — solo miembros de tu círculo</option>
          <option value="private">Privado — solo tú</option>
          <option value="public">Público — cualquiera</option>
        </Select>
      </Field>
      <Field htmlFor="profile-timezone" label="Timezone">
        <Input
          defaultValue={profile.timezone}
          id="profile-timezone"
          maxLength={80}
          name="timezone"
          required
        />
      </Field>
      <Field htmlFor="profile-locale" label="Locale">
        <Input
          defaultValue={profile.locale}
          id="profile-locale"
          maxLength={20}
          minLength={2}
          name="locale"
          required
        />
      </Field>
      <AuthStatus state={state} />
      <AppButton loading={pending} type="submit" variant="secondary">
        {pending ? "Guardando" : "Guardar perfil"}
      </AppButton>
    </form>
  );
}
