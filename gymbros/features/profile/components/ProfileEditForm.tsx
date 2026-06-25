"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";
import type { Profile } from "@/lib/dal";

import { updateProfileAction } from "../actions/updateProfile";

type ProfileEditFormProps = {
  profile: Profile;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      {/* The vow comes first, with room to breathe. Editing it is not admin. */}
      <div className="mb-5 flex flex-col gap-2">
        <label
          className="text-body font-medium text-primary-text"
          htmlFor="profile-identity"
        >
          En quién te estás convirtiendo
        </label>
        <p className="text-caption text-secondary-text">
          Cámbiala cuando deje de ser cierta. Sin prisa.
        </p>
        <Textarea
          className="min-h-24 text-body leading-7"
          defaultValue={profile.identityStatement ?? ""}
          id="profile-identity"
          maxLength={140}
          name="identityStatement"
          placeholder="Alguien que aparece, incluso los días difíciles."
        />
      </div>
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
      <Field
        helper="Quién puede ver tu evidencia."
        htmlFor="profile-visibility"
        label="Visibilidad"
      >
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
      <FormStatus state={state} />
      <AppButton loading={pending} type="submit" variant="secondary">
        {pending ? "Guardando" : "Guardar perfil"}
      </AppButton>
    </form>
  );
}
