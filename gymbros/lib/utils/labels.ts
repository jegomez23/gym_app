import type {
  CommitFeeling,
  CommitIntensity,
  MomentumState,
  TrainingFocus,
} from "@/types/commit";
import type { SupportReaction } from "@/types/circle";

const momentumLabels: Record<MomentumState, string> = {
  High: "Alto",
  Base: "Base",
  Recovering: "Retomando",
};

const trainingLabels: Record<TrainingFocus, string> = {
  Push: "Empuje",
  Pull: "Jalón",
  Legs: "Pierna",
  Upper: "Tren superior",
  Lower: "Tren inferior",
  "Full Body": "Cuerpo completo",
  Cardio: "Cardio",
  Mobility: "Movilidad",
  Sport: "Deporte",
  Other: "Otro",
};

const feelingLabels: Record<CommitFeeling, string> = {
  Strong: "Fuerte",
  Focused: "Enfocado",
  Tired: "Cansado",
  Heavy: "Pesado",
  Calm: "Calmado",
  Proud: "Orgulloso",
  Survived: "Sobreviví",
  Returning: "Retomando",
};

const intensityLabels: Record<CommitIntensity, string> = {
  Light: "Ligero",
  Steady: "Constante",
  Deep: "Profundo",
};

const reactionLabels: Record<SupportReaction, string> = {
  Respect: "Respeto",
  "Keep Going": "Sigue",
  "Proud of You": "Orgulloso de ti",
};

export function getMomentumLabel(momentum: MomentumState) {
  return momentumLabels[momentum];
}

export function getTrainingLabel(training: TrainingFocus | string) {
  return training in trainingLabels
    ? trainingLabels[training as TrainingFocus]
    : training;
}

export function getFeelingLabel(
  feeling: CommitFeeling | CommitIntensity | string
) {
  if (feeling in feelingLabels) {
    return feelingLabels[feeling as CommitFeeling];
  }

  if (feeling in intensityLabels) {
    return intensityLabels[feeling as CommitIntensity];
  }

  return feeling;
}

export function getReactionLabel(reaction: SupportReaction) {
  return reactionLabels[reaction];
}

export function getCircleNameLabel(circleName: string) {
  return circleName === "Quiet Strength" ? "Fuerza Silenciosa" : circleName;
}
