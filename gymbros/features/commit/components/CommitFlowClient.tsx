"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PillOption } from "@/components/ui/PillOption";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";
import type { ReflectionType } from "@/lib/dal";

import { publishCommitAction } from "../actions/publishCommit";

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

// Optional, never mandatory: the user's own quiet classification of their note.
// "Emoción" is what makes the Protected state reachable from their own words.
const reflectionTypeOptions = [
  { value: "identity", label: "Identidad" },
  { value: "process", label: "Proceso" },
  { value: "emotional", label: "Emoción" },
  { value: "technical", label: "Técnica" },
] as const satisfies ReadonlyArray<{ value: ReflectionType; label: string }>;

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

// The act is sealed. This moment rests until the user chooses to leave it —
// it never auto-advances (Interaction System: nothing rushes, the interface waits).
function ShowingUpMoment({
  name,
  identityStatement,
  isFirstCommit,
  onDone,
}: {
  name: string;
  identityStatement?: string | null;
  isFirstCommit: boolean;
  onDone: () => void;
}) {
  const firstName = name.trim().split(" ")[0] || name;
  const vow = identityStatement?.trim();
  // The first proof is named as the first; every one after is "one more". The
  // recognition is the same calm size either way — effort is met with proportion,
  // not escalation (Interaction System). Only the words tell the truth of the moment.
  const proof = isFirstCommit ? "tu primera prueba" : "una prueba más";

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
          {isFirstCommit ? "Tu primera evidencia" : "Quedó registrado"}
        </p>
        <h2 className="mt-3 text-display text-primary-text">Apareciste.</h2>
        {vow ? (
          // What was just sealed is proof of the vow they wrote themselves.
          <>
            <p className="mx-auto mt-4 max-w-80 text-body italic leading-7 text-primary-text">
              “{vow}”
            </p>
            <p className="mx-auto mt-3 max-w-80 text-body text-secondary-text">
              {firstName}, {proof}.
            </p>
          </>
        ) : (
          <p className="mx-auto mt-3 max-w-80 text-body text-secondary-text">
            {firstName}, {proof} de quién estás eligiendo ser.
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
  isFirstCommit = false,
}: {
  name: string;
  identityStatement?: string | null;
  isFirstCommit?: boolean;
}) {
  const router = useRouter();
  const [actionState, formAction, pending] = useActionState(
    publishCommitAction,
    initialActionState
  );
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [showDuration, setShowDuration] = useState(false);

  // One source of truth per field: every value lives in controlled state mirrored to
  // an always-mounted hidden input, so it survives a step unmounting as the user moves
  // back and forth. This once excluded the submit-step text (note, reflection) — but
  // "Volver" from the final step unmounted those native inputs and silently discarded
  // the user's written words. Everything is controlled now. The Server Action's Zod
  // schema is the single validation boundary — no client-side form library duplicates it.
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [trainingType, setTrainingType] = useState<TrainingType>("training");
  const [intensity, setIntensity] = useState<IntensityType>("steady");
  const [visibility, setVisibility] = useState<VisibilityType>("circle");
  const [note, setNote] = useState("");
  const [reflectionContent, setReflectionContent] = useState("");
  const [reflectionType, setReflectionType] = useState<ReflectionType | null>(
    null
  );

  const recognized = actionState.status === "success";

  function goToStep(next: number) {
    setDirection(next > step ? "forward" : "back");
    setStep(Math.min(Math.max(next, 0), 2));
  }

  const canContinue = useMemo(() => {
    if (step === 0) {
      return Boolean(title.trim()) && Boolean(trainingType);
    }

    if (step === 1) {
      return Boolean(intensity);
    }

    return true;
  }, [intensity, step, title, trainingType]);

  // Tapping the active type again clears it — the classification stays optional.
  function toggleReflectionType(value: ReflectionType) {
    setReflectionType((current) => (current === value ? null : value));
  }

  // Before the final step, the only single-line inputs (title, duration) would
  // implicitly submit the form on Enter — on a mobile keyboard's "Go" key, that
  // seals the commit prematurely with defaults. Enter advances the flow instead;
  // it never publishes. (Textareas keep their newline; the submit step is untouched.)
  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    const target = event.target as HTMLElement;
    if (event.key !== "Enter" || target.tagName === "TEXTAREA" || step >= 2) {
      return;
    }

    event.preventDefault();
    if (canContinue) {
      goToStep(step + 1);
    }
  }

  const copy = stepCopy[step];

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5"
      onKeyDown={handleKeyDown}
    >
      {recognized && (
        <ShowingUpMoment
          identityStatement={identityStatement}
          isFirstCommit={isFirstCommit}
          name={name}
          onDone={() => router.push("/")}
        />
      )}
      <input name="title" type="hidden" value={title} />
      <input name="durationMinutes" type="hidden" value={durationMinutes} />
      <input name="type" type="hidden" value={trainingType} />
      <input name="intensity" type="hidden" value={intensity} />
      <input name="visibility" type="hidden" value={visibility} />
      <input name="note" type="hidden" value={note} />
      <input name="reflectionContent" type="hidden" value={reflectionContent} />
      <input name="reflectionType" type="hidden" value={reflectionType ?? ""} />
      <ProgressIndicator currentStep={step} />

      <AppCard className="min-h-100" level="hero">
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
              <Field htmlFor="commit-title" label="¿Qué hiciste?">
                <Input
                  id="commit-title"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Tren inferior, vuelta a empezar"
                  value={title}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                {trainingOptions.map((option) => (
                  <PillOption
                    active={trainingType === option.value}
                    key={option.value}
                    label={option.label}
                    onClick={() => setTrainingType(option.value)}
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
                    onClick={() => setIntensity(option.value)}
                  />
                ))}
              </div>
              {showDuration ? (
                <Field htmlFor="commit-duration" label="Duración en minutos">
                  <Input
                    autoFocus
                    id="commit-duration"
                    inputMode="numeric"
                    onChange={(event) => setDurationMinutes(event.target.value)}
                    placeholder="45"
                    value={durationMinutes}
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
                onChange={(event) => setNote(event.target.value)}
                placeholder="Hoy aparecí porque..."
                value={note}
              />
              <Textarea
                aria-label="Nota para tu yo del futuro"
                className="min-h-32"
                maxLength={300}
                onChange={(event) => setReflectionContent(event.target.value)}
                placeholder="Algo que quieras recordar más adelante (opcional)"
                value={reflectionContent}
              />
              <div>
                <p className="text-label uppercase text-secondary-text">
                  ¿Qué tipo de nota es? · opcional
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {reflectionTypeOptions.map((option) => (
                    <PillOption
                      active={reflectionType === option.value}
                      key={option.value}
                      label={option.label}
                      onClick={() => toggleReflectionType(option.value)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibilityOptions.map((option) => (
                  <PillOption
                    active={visibility === option.value}
                    key={option.value}
                    label={option.label}
                    onClick={() => setVisibility(option.value)}
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
