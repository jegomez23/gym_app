"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
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
      className="mt-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4"
    >
      <label
        className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text"
        htmlFor="support-to-user"
      >
        Enviar apoyo
      </label>
      <select
        className="mt-3 h-12 w-full rounded-2xl border border-white/8 bg-[#111410] px-4 text-sm text-primary-text outline-none focus:border-[var(--accent-border)]"
        id="support-to-user"
        name="toUserId"
        required
      >
        {members.map((member) => (
          <option key={member.memberId} value={member.memberId}>
            {member.memberName}
          </option>
        ))}
      </select>
      <textarea
        aria-label="Mensaje de apoyo"
        className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-primary-text outline-none placeholder:text-secondary-text/60 focus:border-[var(--accent-border)]"
        maxLength={200}
        name="message"
        placeholder="Te vi aparecer hoy."
        required
      />
      <AppButton className="mt-3 w-full" disabled={pending} type="submit">
        {pending ? "Enviando" : "Enviar apoyo"}
      </AppButton>
      <FormStatus state={state} />
    </form>
  );
}
