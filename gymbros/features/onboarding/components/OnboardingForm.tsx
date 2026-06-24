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
    <form action={formAction} className="flex flex-col gap-8">
      <input name="returnTo" type="hidden" value={returnTo} />

      {/* The one question the product exists to remember. Its own breathing room. */}
      <div className="flex flex-col gap-3">
        <label
          className="text-heading text-primary-text"
          htmlFor="onboarding-identity"
        >
          ¿En quién te estás convirtiendo?
        </label>
        <p className="text-body text-secondary-text">
          Una frase. La tuya. Puedes dejarla para después.
        </p>
        <Textarea
          className="min-h-28 text-body leading-7"
          id="onboarding-identity"
          maxLength={140}
          name="identityStatement"
          placeholder="Alguien que aparece, incluso los días difíciles."
        />
      </div>

      {/* The practical fields stay quiet and small — they are not the point. */}
      <div className="flex flex-col gap-4 border-t border-white/8 pt-6">
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
        <Field
          helper="Solo minúsculas, números y guion bajo. Te pueden invitar por este nombre."
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
      </div>

      <input name="avatarUrl" type="hidden" value="" />
      <input name="timezone" type="hidden" value={defaultTimezone} />
      <input name="locale" type="hidden" value={defaultLocale} />
      <input name="visibilityPreference" type="hidden" value="circle" />
      <AuthStatus state={state} />
      <AppButton loading={pending} type="submit">
        {pending ? "Entrando" : "Entrar a Gym Circle"}
      </AppButton>
    </form>
  );
}
