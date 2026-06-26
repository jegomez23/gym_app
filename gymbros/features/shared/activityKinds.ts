// One movement vocabulary for the whole product. The flow that records a kind and
// the card that expresses it read the same list — `commit.type` stores the value.
// Evidence of an active life, not only a gym session (Phase 49); kept tight so the
// product stays quiet, not a catalog of every possible activity.
export const activityKinds = [
  { value: "training", label: "Entrenamiento" },
  { value: "run", label: "Correr" },
  { value: "ride", label: "Bici" },
  { value: "hike", label: "Montaña" },
  { value: "walk", label: "Caminar" },
  { value: "mobility", label: "Movilidad" },
  { value: "mind", label: "Mente" },
] as const;

export type ActivityKind = (typeof activityKinds)[number]["value"];

// Kinds recorded before the active-life vocabulary still read beautifully — the
// stored value is free text, so no evidence is ever orphaned by a vocabulary change.
const legacyLabels: Record<string, string> = {
  cardio: "Cardio",
  recovery: "Recuperación",
  nutrition: "Nutrición",
};

const labelByValue: Record<string, string> = {
  ...Object.fromEntries(activityKinds.map((kind) => [kind.value, kind.label])),
  ...legacyLabels,
};

/**
 * A human label for a stored movement kind, or null when there is none worth
 * showing (no type, or a free-text value outside the known vocabulary). Silence
 * over a raw machine key.
 */
export function activityKindLabel(
  type: string | null | undefined
): string | null {
  if (!type) {
    return null;
  }

  return labelByValue[type] ?? null;
}
