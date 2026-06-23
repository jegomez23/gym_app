"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
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
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Username
        <input
          autoComplete="username"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          maxLength={30}
          minLength={3}
          name="username"
          pattern="[a-z0-9_]+"
          placeholder="alex_training"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Display name
        <input
          autoComplete="name"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          defaultValue={defaultName}
          maxLength={100}
          name="name"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Bio
        <textarea
          className="min-h-24 resize-none rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          maxLength={200}
          name="bio"
          placeholder="Estoy construyendo disciplina, una sesion a la vez."
        />
      </label>
      <input name="avatarUrl" type="hidden" value="" />
      <input name="timezone" type="hidden" value={defaultTimezone} />
      <input name="locale" type="hidden" value={defaultLocale} />
      <input name="visibilityPreference" type="hidden" value="circle" />
      <AuthStatus state={state} />
      <AppButton disabled={pending} type="submit">
        {pending ? "Creando perfil" : "Entrar a Gym Circle"}
      </AppButton>
    </form>
  );
}
