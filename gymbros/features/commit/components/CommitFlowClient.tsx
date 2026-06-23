"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { PillOption } from "@/components/ui/PillOption";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import { publishCommitAction } from "../actions/publishCommit";

const commitFormSchema = z.object({
  title: z.string().trim().min(1, "Nombra la accion.").max(150),
  type: z.string().trim().max(50).optional(),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .or(z.literal("")),
  intensity: z.enum(["light", "steady", "deep"]),
  note: z.string().trim().max(500).optional(),
  reflectionContent: z.string().trim().max(300).optional(),
  visibility: z.enum(["private", "circle", "public"]),
});

type CommitFormValues = z.input<typeof commitFormSchema>;

const trainingOptions = [
  { value: "training", label: "Entrenamiento" },
  { value: "mobility", label: "Movilidad" },
  { value: "cardio", label: "Cardio" },
  { value: "recovery", label: "Recuperacion" },
  { value: "nutrition", label: "Nutricion" },
  { value: "mind", label: "Mente" },
] as const;

const intensityOptions = [
  { value: "light", label: "Ligero" },
  { value: "steady", label: "Constante" },
  { value: "deep", label: "Profundo" },
] as const;

const visibilityOptions = [
  { value: "private", label: "Privado" },
  { value: "circle", label: "Circulo" },
  { value: "public", label: "Publico" },
] as const;

type TrainingType = (typeof trainingOptions)[number]["value"];
type IntensityType = (typeof intensityOptions)[number]["value"];
type VisibilityType = (typeof visibilityOptions)[number]["value"];

const stepCopy = [
  {
    eyebrow: "Paso 1",
    title: "Que accion quieres registrar",
    subtitle: "Nombra el trabajo. Que sea simple y rapido de registrar.",
  },
  {
    eyebrow: "Paso 2",
    title: "Como se sintio",
    subtitle: "Sin puntuacion. Solo el tono honesto de la sesion.",
  },
  {
    eyebrow: "Paso 3",
    title: "Deja una nota para tu yo del futuro.",
    subtitle: "Reflection opcional, siempre asociada a este Commit.",
  },
] as const;

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div
      aria-label="Progreso del Commit"
      className="mb-2 grid grid-cols-3 gap-2"
    >
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

export function CommitFlowClient() {
  const router = useRouter();
  const [actionState, formAction, pending] = useActionState(
    publishCommitAction,
    initialActionState
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (actionState.status === "success") {
      router.push("/");
    }
  }, [router, actionState.status]);
  const [title, setTitle] = useState("");
  const [trainingType, setTrainingType] = useState<TrainingType>("training");
  const [intensity, setIntensity] = useState<IntensityType>("steady");
  const [visibility, setVisibility] = useState<VisibilityType>("circle");
  const form = useForm<CommitFormValues>({
    resolver: zodResolver(commitFormSchema),
    defaultValues: {
      title: "",
      type: "training",
      durationMinutes: "",
      intensity: "steady",
      note: "",
      reflectionContent: "",
      visibility: "circle",
    },
  });

  const canContinue = useMemo(() => {
    if (step === 0) {
      return Boolean(title.trim()) && Boolean(trainingType);
    }

    if (step === 1) {
      return Boolean(intensity);
    }

    return true;
  }, [intensity, step, title, trainingType]);

  const titleField = form.register("title");

  function selectTrainingType(value: TrainingType) {
    setTrainingType(value);
    form.setValue("type", value, { shouldValidate: true });
  }

  function selectIntensity(value: IntensityType) {
    setIntensity(value);
    form.setValue("intensity", value, { shouldValidate: true });
  }

  function selectVisibility(value: VisibilityType) {
    setVisibility(value);
    form.setValue("visibility", value, { shouldValidate: true });
  }

  async function guardSubmit(event: FormEvent<HTMLFormElement>) {
    const isValid = await form.trigger();
    if (!isValid) {
      event.preventDefault();
    }
  }

  const copy = stepCopy[step];

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5"
      onSubmit={guardSubmit}
    >
      <input name="type" type="hidden" value={trainingType} />
      <input name="intensity" type="hidden" value={intensity} />
      <input name="visibility" type="hidden" value={visibility} />
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
            <div className="mt-8 flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm text-secondary-text">
                Nombre del Commit
                <input
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
                  placeholder="Lower body restart"
                  {...titleField}
                  onChange={(event) => {
                    titleField.onChange(event);
                    setTitle(event.target.value);
                  }}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {trainingOptions.map((option) => (
                  <PillOption
                    active={trainingType === option.value}
                    key={option.value}
                    label={option.label}
                    onClick={() => selectTrainingType(option.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 flex flex-col gap-5">
              <div className="flex flex-wrap gap-2">
                {intensityOptions.map((option) => (
                  <PillOption
                    active={intensity === option.value}
                    key={option.value}
                    label={option.label}
                    onClick={() => selectIntensity(option.value)}
                  />
                ))}
              </div>
              <label className="flex flex-col gap-2 text-sm text-secondary-text">
                Duracion en minutos
                <input
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
                  inputMode="numeric"
                  placeholder="45"
                  {...form.register("durationMinutes")}
                />
                {form.formState.errors.durationMinutes && (
                  <span className="text-xs text-red-400">
                    Ingresa un numero positivo o deja el campo vacio.
                  </span>
                )}
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 flex flex-col gap-5">
              <textarea
                className="min-h-32 w-full resize-none rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-base leading-7 text-primary-text outline-none transition placeholder:text-secondary-text/60 focus:border-[var(--accent-border)]"
                maxLength={500}
                placeholder="Hoy apareci porque..."
                {...form.register("note")}
              />
              <textarea
                className="min-h-32 w-full resize-none rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-base leading-7 text-primary-text outline-none transition placeholder:text-secondary-text/60 focus:border-[var(--accent-border)]"
                maxLength={300}
                placeholder="Reflection opcional"
                {...form.register("reflectionContent")}
              />
              <div className="flex flex-wrap gap-2">
                {visibilityOptions.map((option) => (
                  <PillOption
                    active={visibility === option.value}
                    key={option.value}
                    label={option.label}
                    onClick={() => selectVisibility(option.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </AppCard>

      <FormStatus state={actionState} />

      <div className="grid grid-cols-[0.9fr_1.4fr] gap-3">
        <AppButton
          className="w-full"
          disabled={step === 0 || pending}
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
          type="button"
          variant="secondary"
        >
          Volver
        </AppButton>
        {step < 2 ? (
          <AppButton
            className="w-full"
            disabled={!canContinue || pending}
            onClick={() => setStep((current) => Math.min(current + 1, 2))}
            type="button"
          >
            Continuar
          </AppButton>
        ) : (
          <AppButton className="w-full" disabled={pending} type="submit">
            {pending ? "Guardando..." : "Guardar Commit"}
          </AppButton>
        )}
      </div>
    </form>
  );
}
