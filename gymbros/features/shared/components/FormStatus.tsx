import type { ActionState } from "../actionState";

type FormStatusProps = {
  state: ActionState;
};

export function FormStatus({ state }: FormStatusProps) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const className =
    state.status === "success"
      ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-accent"
      : "border-red-400/30 bg-red-500/10 text-red-100";

  return (
    <p
      aria-live="polite"
      className={`rounded-2xl border p-4 text-sm font-medium ${className}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
