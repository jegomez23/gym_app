"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { PillOption } from "@/components/ui/PillOption";
import { useCommitStore } from "@/store/useCommitStore";
import type { CommitFeeling, TrainingFocus } from "@/types/commit";

const trainingOptions: TrainingFocus[] = [
  "Push",
  "Pull",
  "Legs",
  "Upper",
  "Lower",
  "Full Body",
  "Cardio",
  "Mobility",
  "Sport",
  "Other",
];

const trainingOptionLabels: Record<TrainingFocus, string> = {
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

const feelingOptions: CommitFeeling[] = [
  "Strong",
  "Focused",
  "Tired",
  "Heavy",
  "Calm",
  "Proud",
  "Survived",
  "Returning",
];

const feelingOptionLabels: Record<CommitFeeling, string> = {
  Strong: "Fuerte",
  Focused: "Enfocado",
  Tired: "Cansado",
  Heavy: "Pesado",
  Calm: "Calmado",
  Proud: "Orgulloso",
  Survived: "Sobreviví",
  Returning: "Retomando",
};

const stepCopy = [
  {
    eyebrow: "Paso 1",
    title: "¿Qué entrenaste?",
    subtitle: "Nombra el trabajo. Que sea simple y rápido de registrar.",
  },
  {
    eyebrow: "Paso 2",
    title: "¿Cómo se sintió?",
    subtitle: "Sin puntuación. Solo el tono honesto de la sesión.",
  },
  {
    eyebrow: "Paso 3",
    title: "Deja una nota para tu yo del futuro.",
    subtitle: "Reflexión opcional. Una frase tranquila es suficiente.",
  },
] as const;

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-2 grid grid-cols-3 gap-2" aria-label="Progreso del Commit">
      {[0, 1, 2].map((step) => (
        <div
          className={`h-1.5 rounded-full transition ${
            step <= currentStep ? "bg-accent" : "bg-white/10"
          }`}
          key={step}
        />
      ))}
    </div>
  );
}

export default function CommitFlowPage() {
  const router = useRouter();
  const addCommit = useCommitStore((state) => state.addCommit);
  const [step, setStep] = useState(0);
  const [trainingFocus, setTrainingFocus] = useState<TrainingFocus | null>(
    null,
  );
  const [feeling, setFeeling] = useState<CommitFeeling | null>(null);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  const canContinue = useMemo(() => {
    if (step === 0) {
      return Boolean(trainingFocus);
    }

    if (step === 1) {
      return Boolean(feeling);
    }

    return true;
  }, [feeling, step, trainingFocus]);

  function goNext() {
    if (!canContinue) {
      return;
    }

    setStep((currentStep) => Math.min(currentStep + 1, 2));
  }

  function goBack() {
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  }

  function saveCommit() {
    if (!trainingFocus || !feeling) {
      return;
    }

    addCommit({
      trainingFocus,
      feeling,
      reflection,
    });
    setSaved(true);

    window.setTimeout(() => {
      router.push("/");
    }, 650);
  }

  const copy = stepCopy[step];

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Flujo de Commit"
        subtitle="Un ritual privado para convertir la sesión en evidencia."
        title="Registrar sesión"
      >
        <ProgressIndicator currentStep={step} />

        <AppCard className="min-h-[25rem]">
          <div className="flex h-full flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {copy.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal text-primary-text">
                {copy.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-secondary-text">
                {copy.subtitle}
              </p>
            </div>

            {step === 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {trainingOptions.map((option) => (
                  <PillOption
                    active={trainingFocus === option}
                    key={option}
                    label={trainingOptionLabels[option]}
                    onClick={() => setTrainingFocus(option)}
                  />
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {feelingOptions.map((option) => (
                  <PillOption
                    active={feeling === option}
                    key={option}
                    label={feelingOptionLabels[option]}
                    onClick={() => setFeeling(option)}
                  />
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="mt-8">
                <textarea
                  className="min-h-40 w-full resize-none rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-base leading-7 text-primary-text outline-none transition placeholder:text-secondary-text/60 focus:border-[var(--accent-border)]"
                  maxLength={220}
                  onChange={(event) => setReflection(event.target.value)}
                  placeholder="Hoy aparecí porque..."
                  value={reflection}
                />
                <div className="mt-4 rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-sm leading-6 text-secondary-text">
                    {(trainingFocus && trainingOptionLabels[trainingFocus]) ??
                      "Sesión"}{" "}
                    guardada como evidencia. Se sintió{" "}
                    {feeling
                      ? feelingOptionLabels[feeling].toLowerCase()
                      : "honesta"}
                    .
                  </p>
                </div>
              </div>
            )}

            {saved && (
              <p className="mt-6 rounded-2xl bg-[var(--accent-soft)] p-4 text-sm font-medium text-accent">
                Commit guardado. Hoy apareciste.
              </p>
            )}
          </div>
        </AppCard>

        <div className="grid grid-cols-[0.9fr_1.4fr] gap-3">
          <AppButton
            className="w-full"
            disabled={step === 0 || saved}
            onClick={goBack}
            variant="secondary"
          >
            Volver
          </AppButton>
          {step < 2 ? (
            <AppButton
              className="w-full"
              disabled={!canContinue || saved}
              onClick={goNext}
            >
              Continuar
            </AppButton>
          ) : (
            <AppButton className="w-full" disabled={saved} onClick={saveCommit}>
              Guardar Commit
            </AppButton>
          )}
        </div>
      </ScreenContainer>
    </AppShell>
  );
}
