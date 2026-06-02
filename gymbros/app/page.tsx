"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { AppButton } from "@/components/ui/AppButton";
import { ChapterCard } from "@/components/gym/ChapterCard";
import { CirclePulseCard } from "@/components/gym/CirclePulseCard";
import { CommitCard } from "@/components/gym/CommitCard";
import { EvidenceStrip } from "@/components/gym/EvidenceStrip";
import { MomentumCard } from "@/components/gym/MomentumCard";
import { ReflectionPromptCard } from "@/components/gym/ReflectionPromptCard";
import { getMomentumMessage } from "@/lib/utils/momentum";
import { useCircleStore } from "@/store/useCircleStore";
import { useCommitStore } from "@/store/useCommitStore";
import type { MomentumState } from "@/types/commit";

const momentumInsights: Record<MomentumState, string> = {
  High: "Estás en flujo. Protege el ritmo, no persigas intensidad.",
  Base: "Estable no es promedio. Estable es donde se construye disciplina.",
  Recovering: "Estás reconstruyendo. No necesitas compensar. Solo vuelve.",
};

export default function TodayHubPage() {
  const router = useRouter();
  const { commits, latestCommit, momentum } = useCommitStore();
  const trainedTodayCount = useCircleStore((state) => state.trainedTodayCount);

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="GYM CIRCLE"
        subtitle="Un registro silencioso de quien te estás convirtiendo."
        title="Hoy"
      >
        <div className="-mt-2 mb-2 rounded-full border border-white/8 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-secondary-text shadow-[0_14px_45px_rgb(0_0_0/0.24)]">
          Hoy no se trata de hacer más. Se trata de aparecer con intención.
        </div>

        <ChapterCard />

        <MomentumCard
          insight={momentumInsights[momentum]}
          message={getMomentumMessage(momentum)}
          momentum={momentum}
        />

        <EvidenceStrip commits={commits} />

        {latestCommit && (
          <CommitCard commit={latestCommit} eyebrow="Último Commit" />
        )}

        <CirclePulseCard trainedTodayCount={trainedTodayCount} />

        <ReflectionPromptCard />

        <div className="mt-2">
          <p className="mb-3 text-center text-sm text-secondary-text">
            ¿Listo para sumar evidencia?
          </p>
          <AppButton
            className="h-15 w-full text-base shadow-[0_22px_60px_var(--accent-glow)]"
            onClick={() => router.push("/commit")}
          >
            Registrar sesión
          </AppButton>
        </div>
      </ScreenContainer>
    </AppShell>
  );
}
