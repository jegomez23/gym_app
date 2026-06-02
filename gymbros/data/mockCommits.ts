import type { Commit } from "@/types/commit";

export const mockCommits: Commit[] = [
  {
    id: "commit-001",
    date: "2026-06-02",
    title: "Reinicio de tren inferior",
    note: "Apareciste con calma. Sostuviste el ritmo y saliste con más claridad.",
    durationMinutes: 48,
    intensity: "Steady",
    evidence: ["Tren inferior", "Movilidad", "Vuelta a casa"],
  },
  {
    id: "commit-002",
    date: "2026-06-01",
    title: "Disciplina de tren superior",
    note: "Sin ruido, sin prisa. Solo una sesión completada con atención.",
    durationMinutes: 42,
    intensity: "Deep",
    evidence: ["Empuje", "Jalón", "Respiración"],
  },
  {
    id: "commit-003",
    date: "2026-05-30",
    title: "Sesión de retorno",
    note: "Protegiste el Momentum con una sesión ligera en lugar de desaparecer.",
    durationMinutes: 24,
    intensity: "Light",
    evidence: ["Movilidad", "Caminata suave", "Estiramiento"],
  },
];
