import type { AuthActionState } from "@/lib/auth/actionState";

type AuthStatusProps = {
  state: AuthActionState;
};

export function AuthStatus({ state }: AuthStatusProps) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const className =
    state.status === "success"
      ? "border-accent-border bg-accent-soft text-accent"
      : "border-(--danger-border) bg-(--danger-soft) text-danger";

  return (
    <p
      aria-live="polite"
      className={`animate-rise rounded-md border p-4 text-caption font-medium ${className}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
