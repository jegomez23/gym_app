"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { AuthStatus } from "@/features/auth/components/AuthStatus";
import { initialAuthActionState } from "@/lib/auth/actionState";

import { createProfileAction } from "../actions/createProfile";

type OnboardingFormProps = {
  defaultName: string;
  defaultTimezone: string;
  defaultLocale: string;
  returnTo?: string;
};

export function OnboardingForm({
  defaultName,
  defaultTimezone,
  defaultLocale,
  returnTo = "/",
}: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    createProfileAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="returnTo" type="hidden" value={returnTo} />
      <Field
        helper="Solo minúsculas, números y guion bajo."
        htmlFor="onboarding-username"
        label="Username"
      >
        <Input
          autoComplete="username"
          id="onboarding-username"
          maxLength={30}
          minLength={3}
          name="username"
          pattern="[a-z0-9_]+"
          placeholder="alex_training"
          required
        />
      </Field>
      <Field htmlFor="onboarding-name" label="Tu nombre">
        <Input
          autoComplete="name"
          defaultValue={defaultName}
          id="onboarding-name"
          maxLength={100}
          name="name"
          required
        />
      </Field>
      <Field htmlFor="onboarding-bio" label="Bio">
        <Textarea
          className="min-h-24"
          id="onboarding-bio"
          maxLength={200}
          name="bio"
          placeholder="Estoy construyendo disciplina, una sesión a la vez."
        />
      </Field>
      <input name="avatarUrl" type="hidden" value="" />
      <input name="timezone" type="hidden" value={defaultTimezone} />
      <input name="locale" type="hidden" value={defaultLocale} />
      <input name="visibilityPreference" type="hidden" value="circle" />
      <AuthStatus state={state} />
      <AppButton loading={pending} type="submit">
        {pending ? "Creando perfil" : "Entrar a Gym Circle"}
      </AppButton>
    </form>
  );
}
