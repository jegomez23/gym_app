"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
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
  { value: "light", label: "Ligero", icon: "feeling-light" },
  { value: "steady", label: "Constante", icon: "feeling-steady" },
  { value: "deep", label: "Profundo", icon: "feeling-deep" },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  icon: IconName;
}>;

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
    eyebrow: "Lo que hiciste",
    title: "¿Qué hiciste hoy?",
    subtitle: "Nómbralo simple. Apareciste, eso es lo que cuenta.",
  },
  {
    eyebrow: "Cómo se sintió",
    title: "¿Cómo se sintió?",
    subtitle: "Sin puntuación. Solo el tono honesto del momento.",
  },
  {
    eyebrow: "Una nota para después",
    title: "Deja una nota para tu yo del futuro.",
    subtitle: "Opcional. Algo que quieras recordar más adelante.",
  },
] as const;

function FeelingTile({
  icon,
  label,
  active,
  onClick,
}: {
  icon: IconName;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`flex min-h-24 flex-1 flex-col items-center justify-center gap-2 rounded-lg border p-3 transition duration-(--duration-fast) ease-out-soft active:scale-95 ${
        active
          ? "border-accent-border bg-accent-soft text-accent"
          : "border-white/8 bg-white/3 text-secondary-text hover:text-primary-text"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon name={icon} size={26} />
      <span className="text-caption font-medium">{label}</span>
    </button>
  );
}

function ShowingUpMoment({
  name,
  identityStatement,
  onDone,
}: {
  name: string;
  identityStatement?: string | null;
  onDone: () => void;
}) {
  const firstName = name.trim().split(" ")[0] || name;
  const vow = identityStatement?.trim();

  return (
    <button
      aria-label="Continuar"
      className="animate-fade fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/92 px-8 text-center backdrop-blur-xl"
      onClick={onDone}
      type="button"
    >
      <span className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent ring-1 ring-accent-border">
        <Icon name="check" size={34} strokeWidth={2.25} />
      </span>
      <div className="animate-rise">
        <p className="text-label uppercase text-secondary-text">
          Quedó registrado
        </p>
        <h2 className="mt-3 text-display text-primary-text">Apareciste.</h2>
        {vow ? (
          // What was just sealed is proof of the vow they wrote themselves.
          <>
            <p className="mx-auto mt-4 max-w-80 text-body italic leading-7 text-primary-text">
              “{vow}”
            </p>
            <p className="mx-auto mt-3 max-w-80 text-body text-secondary-text">
              {firstName}, una prueba más.
            </p>
          </>
        ) : (
          <p className="mx-auto mt-3 max-w-80 text-body text-secondary-text">
            {firstName}, una prueba más de quién estás eligiendo ser.
          </p>
        )}
      </div>
      <p className="animate-fade text-caption text-secondary-text/70">
        Toca para continuar
      </p>
    </button>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div aria-label="Progreso" className="mb-2 grid grid-cols-3 gap-2">
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

export function CommitFlowClient({
  name,
  identityStatement,
  lastReflection,
}: {
  name: string;
  identityStatement?: string | null;
  lastReflection?: string | null;
}) {
  const router = useRouter();
  const [actionState, formAction, pending] = useActionState(
    publishCommitAction,
    initialActionState
  );
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [showDuration, setShowDuration] = useState(false);

  // The act is sealed: hold a quiet moment of recognition before returning home.
  const celebrating = actionState.status === "success";

  function goToStep(next: number) {
    setDirection(next > step ? "forward" : "back");
    setStep(Math.min(Math.max(next, 0), 2));
  }

  function finishCelebration() {
    router.push("/");
  }

  useEffect(() => {
    if (!celebrating) {
      return;
    }

    const timeout = setTimeout(() => router.push("/"), 2800);
    return () => clearTimeout(timeout);
  }, [celebrating, router]);
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
      {celebrating && (
        <ShowingUpMoment
          identityStatement={identityStatement}
          name={name}
          onDone={finishCelebration}
        />
      )}
      <input name="type" type="hidden" value={trainingType} />
      <input name="intensity" type="hidden" value={intensity} />
      <input name="visibility" type="hidden" value={visibility} />
      <ProgressIndicator currentStep={step} />

      <AppCard className="min-h-[25rem]" level="hero">
        <div
          className={`flex h-full flex-col ${
            direction === "forward"
              ? "animate-slide-right"
              : "animate-slide-left"
          }`}
          key={step}
        >
          <div>
            <p className="text-label uppercase text-accent">{copy.eyebrow}</p>
            <h2 className="mt-3 text-title text-primary-text">{copy.title}</h2>
            <p className="mt-2 text-body text-secondary-text">
              {copy.subtitle}
            </p>
          </div>

          {step === 0 && (
            <div className="mt-8 flex flex-col gap-5">
              {lastReflection && (
                <div className="rounded-md border border-white/6 bg-white/3 p-4">
                  <p className="text-label uppercase text-secondary-text">
                    La última vez escribiste
                  </p>
                  <p className="mt-2 text-body italic leading-6 text-primary-text">
                    “{lastReflection}”
                  </p>
                </div>
              )}
              <Field htmlFor="commit-title" label="¿Qué hiciste?">
                <Input
                  id="commit-title"
                  placeholder="Tren inferior, vuelta a empezar"
                  {...titleField}
                  onChange={(event) => {
                    titleField.onChange(event);
                    setTitle(event.target.value);
                  }}
                />
              </Field>
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
              <div className="flex gap-2">
                {intensityOptions.map((option) => (
                  <FeelingTile
                    active={intensity === option.value}
                    icon={option.icon}
                    key={option.value}
                    label={option.label}
                    onClick={() => selectIntensity(option.value)}
                  />
                ))}
              </div>
              {showDuration ? (
                <Field
                  error={
                    form.formState.errors.durationMinutes
                      ? "Ingresa un número positivo o deja el campo vacío."
                      : undefined
                  }
                  htmlFor="commit-duration"
                  label="Duración en minutos"
                >
                  <Input
                    autoFocus
                    id="commit-duration"
                    inputMode="numeric"
                    invalid={Boolean(form.formState.errors.durationMinutes)}
                    placeholder="45"
                    {...form.register("durationMinutes")}
                  />
                </Field>
              ) : (
                <button
                  className="self-start text-caption text-secondary-text underline-offset-4 transition hover:text-primary-text hover:underline"
                  onClick={() => setShowDuration(true)}
                  type="button"
                >
                  + Añadir duración
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 flex flex-col gap-5">
              <Textarea
                aria-label="Nota personal"
                className="min-h-32"
                maxLength={500}
                placeholder="Hoy aparecí porque..."
                {...form.register("note")}
              />
              <Textarea
                aria-label="Nota para tu yo del futuro"
                className="min-h-32"
                maxLength={300}
                placeholder="Algo que quieras recordar más adelante (opcional)"
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
          onClick={() => goToStep(step - 1)}
          type="button"
          variant="secondary"
        >
          Volver
        </AppButton>
        {step < 2 ? (
          <AppButton
            className="w-full"
            disabled={!canContinue || pending}
            onClick={() => goToStep(step + 1)}
            type="button"
          >
            Continuar
          </AppButton>
        ) : (
          <AppButton className="w-full" loading={pending} type="submit">
            {pending ? "Guardando" : "Dejar evidencia"}
          </AppButton>
        )}
      </div>
    </form>
  );
}
