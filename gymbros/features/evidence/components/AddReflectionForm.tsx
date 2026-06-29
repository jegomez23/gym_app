"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { Textarea } from "@/components/ui/Field";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import { addReflectionAction } from "../actions/addReflection";

type AddReflectionFormProps = {
  commitId: string;
};

export function AddReflectionForm({ commitId }: AddReflectionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    addReflectionAction,
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="flex flex-col gap-3" ref={formRef}>
      <label
        className="text-body font-medium text-primary-text"
        htmlFor="evidence-reflection"
      >
        Añade a este documento
      </label>
      <p className="text-caption text-secondary-text">
        Lo que aprendiste, lo que sentiste, lo que quieres recordar. Sin prisa.
      </p>
      <input name="commitId" type="hidden" value={commitId} />
      <Textarea
        className="min-h-24 text-body leading-7"
        id="evidence-reflection"
        maxLength={300}
        name="content"
        placeholder="Lo que me llevo de este día."
      />
      <FormStatus state={state} />
      <AppButton loading={pending} type="submit" variant="secondary">
        {pending ? "Guardando" : "Guardar"}
      </AppButton>
    </form>
  );
}
