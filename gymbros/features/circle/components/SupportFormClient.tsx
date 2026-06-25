"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { Select, Textarea } from "@/components/ui/Field";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";
import type { CirclePresence } from "@/lib/dal";

import { sendSupportAction } from "../actions/sendSupport";

type SupportFormClientProps = {
  members: CirclePresence[];
};

export function SupportFormClient({ members }: SupportFormClientProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    sendSupportAction,
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  if (members.length === 0) {
    return null;
  }

  return (
    <form
      action={formAction}
      className="mt-4 rounded-lg border border-white/8 bg-surface-quiet p-4"
    >
      <label
        className="text-label uppercase text-secondary-text"
        htmlFor="support-to-user"
      >
        Enviar apoyo
      </label>
      <Select className="mt-3" id="support-to-user" name="toUserId" required>
        {members.map((member) => (
          <option key={member.memberId} value={member.memberId}>
            {member.memberName}
          </option>
        ))}
      </Select>
      <Textarea
        aria-label="Mensaje de apoyo"
        className="mt-3 min-h-24"
        maxLength={200}
        name="message"
        placeholder="Te vi aparecer hoy."
        required
      />
      <AppButton className="mt-3 w-full" loading={pending} type="submit">
        {pending ? "Enviando" : "Enviar apoyo"}
      </AppButton>
      {state.status === "success" ? (
        <p
          className="animate-rise mt-3 rounded-md border border-accent-border bg-accent-soft p-4 text-caption text-accent"
          role="status"
        >
          Llegó. Acabas de aparecer por alguien.
        </p>
      ) : (
        <div className="mt-3">
          <FormStatus state={state} />
        </div>
      )}
    </form>
  );
}
