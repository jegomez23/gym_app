import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { DocumentScreen } from "@/features/evidence/components/DocumentScreen";
import { getDocumentViewModel } from "@/features/evidence/queries";
import { activityKindLabel } from "@/features/shared";

export const dynamic = "force-dynamic";

function longDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewModel = await getDocumentViewModel(id);

  if (viewModel.status !== "ready") {
    notFound();
  }

  const { document } = viewModel;
  const movement = activityKindLabel(document.type);
  const title = document.title || movement || "Evidencia";

  return (
    <AppShell>
      <ScreenContainer
        eyebrow={movement ?? "Documento"}
        subtitle={`Apareciste el ${longDate(document.recordedAt)}.`}
        title={title}
      >
        <DocumentScreen document={document} isOwner={viewModel.isOwner} />
      </ScreenContainer>
    </AppShell>
  );
}
