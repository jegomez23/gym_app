import type { Commit, MomentumState } from "@/types/commit";

export function getMomentumState(commits: Commit[]): MomentumState {
  if (commits.length >= 2) {
    return "High";
  }

  if (commits.length === 1) {
    return "Base";
  }

  return "Recovering";
}

export function getMomentumMessage(momentum: MomentumState): string {
  const messages: Record<MomentumState, string> = {
    High: "Estás construyendo evidencia. Mantén este día simple e intencional.",
    Base: "Una sesión honesta basta para sostener el ritmo.",
    Recovering: "Vuelve con calma. El próximo Commit importa más que la pausa.",
  };

  return messages[momentum];
}
