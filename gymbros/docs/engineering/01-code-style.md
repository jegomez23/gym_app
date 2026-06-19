# 01 — Code Style

> **Propósito de este documento:** Definir completamente el estilo de código del proyecto Gym Circle. Este documento elimina cualquier ambigüedad sobre nombres, organización, imports y estructura. Cualquier desarrollador debe poder escribir código que se vea como si lo hubiera escrito la misma persona.

---

## Nombres

| Elemento             | Convención                  | Ejemplo                                 |
| -------------------- | --------------------------- | --------------------------------------- |
| Componentes React    | PascalCase                  | `CommitCard`, `CircleDashboard`         |
| Hooks                | camelCase con prefijo `use` | `useCommits`, `useCreateCommit`         |
| Server Actions       | camelCase, verbo            | `createCommit`, `inviteToCircle`        |
| Funciones            | camelCase, verbo            | `formatDate()`, `calculateContinuity()` |
| Constantes           | camelCase                   | `commitmentTypes`, `supportMessages`    |
| Tipos/Interfaces     | PascalCase                  | `interface Commit`, `type Visibility`   |
| Archivos TS/TSX      | camelCase                   | `commitSchema.ts`, `commitUtils.ts`     |
| Carpetas             | kebab-case                  | `commit/`, `circle/`, `ui/`             |
| Variables booleanas  | prefijo `is`, `has`, `can`  | `isLoading`, `hasError`, `canSubmit`    |
| Props de componentes | camelCase                   | `userId`, `onSubmit`, `initialData`     |

### Prohibido

- No usar `_` como prefijo de variable privada. Si una función es privada, está en el scope correcto.
- No usar prefijos húngaros (`strName`, `intCount`). TypeScript tiene tipos.
- No usar abreviaturas crípticas (`btn`, `cfg`, `usr`). Preferir `button`, `config`, `user`.

---

## Componentes

### Estructura

```tsx
// ✅ Bien
interface CommitCardProps {
  commit: Commit;
  className?: string;
  onSelect?: (id: string) => void;
}

export function CommitCard({ commit, className, onSelect }: CommitCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3>{commit.title}</h3>
      <p>{commit.note}</p>
    </div>
  );
}
```

### Reglas

- **Un componente por archivo.** Excepto componentes pequeños (menos de 30 líneas) que sean claramente parte del mismo.
- **Props explícitas.** Usar `interface` para props, siempre con nombre `[Componente]Props`.
- **Sin default exports.** Usar `export function` nombrado. Esto facilita refactors y búsquedas.
- **Orden en el archivo:** imports → types/interfaces → componente principal → subcomponentes (si aplica).
- **`"use client"`** debe ser la primera línea si el componente es Client Component.

---

## Hooks

### Estructura

```tsx
// ✅ Bien
import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Commit } from "@/types/commit";

export function useCommits(userId: string) {
  return useQuery({
    queryKey: ["commits", userId],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("commits")
        .select("*")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false });
      return data as Commit[];
    },
    staleTime: 30 * 1000,
  });
}
```

### Reglas

- **Prefijo `use` obligatorio.**
- **Named export** (no default).
- **Query keys con prefijo de feature.** `["commits", userId]`, no `["data"]`.
- **Retornar objeto con `{ data, error, isLoading }`** explícitamente.

---

## Server Actions

### Estructura

```tsx
// ✅ Bien
"use server";

import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().min(1).max(100),
  type: z.enum(["training", "nutrition", "rest", "mind"]),
});

export async function createCommit(input: FormData) {
  const validated = schema.parse(Object.fromEntries(input));
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("commits")
    .insert({
      ...validated,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/");
  return { data };
}
```

### Reglas

- **`"use server"` como primera línea.**
- **Validar con Zod siempre.**
- **Retornar `{ data, error }`.**
- **Revalidar rutas afectadas.**
- **Named export.**

---

## Imports

### Orden

1. Librerías externas (React, Next.js, Supabase SDK)
2. Librerías de UI (shadcn/ui, Framer Motion)
3. Providers y stores
4. Componentes (alias `@/`)
5. Hooks (alias `@/`)
6. Utilidades y tipos
7. Estilos (solo cuando es necesario)

```tsx
// ✅ Bien
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCreateCommit } from "../hooks/useCreateCommit";

import { cn } from "@/lib/utils/cn";
import type { Commit } from "@/types/commit";
```

### Reglas

- **Un grupo de imports por tipo.** Separar con línea en blanco.
- **Imports absolutos con `@/`.** No usar rutas relativas para imports que cruzan features.
- **Rutas relativas solo dentro de la misma feature.**
- **No barrel files forzados.** Solo crear `index.ts` si hay beneficio real (re-exportar múltiples).
- **Type imports con `import type`.** Separar tipos de valores.

---

## Funciones

### Reglas

- **Nombre descriptivo.** `calculateContinuity(commits)` en lugar de `calc(commits)`.
- **Una responsabilidad.** Si una función hace más de una cosa, dividirla.
- **Máximo 30 líneas.** Si una función supera este límite, refactorizar.
- **Return temprano.** Validar condiciones al inicio y salir rápido.

```tsx
// ✅ Bien
export function calculateContinuity(commits: Commit[]): ContinuityMetrics {
  if (commits.length === 0) {
    return { totalDays: 0, frequency: 0, currentStreak: 0 };
  }

  const sorted = [...commits].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  // ... resto de la lógica
}
```

---

## Tipos e Interfaces

### Reglas

- **`interface` para objetos del dominio.** `interface Commit { ... }`
- **`type` para uniones, utilidades y props.** `type Visibility = "private" | "circle" | "public"`
- **Sin `any`.** Usar `unknown` y validar con Zod.
- **Tipos generados de Supabase.** No escribir tipos de tablas manualmente.
- **Tipos explícitos en funciones públicas.** Tipos inferidos solo en funciones internas.

```tsx
// ✅ Bien
export interface Commit {
  id: string;
  userId: string;
  title: string | null;
  recordedAt: string;
  visibility: Visibility;
}

export type Visibility = "private" | "circle" | "public";
export type CommitType = "training" | "nutrition" | "rest" | "mind";
```

---

## Constantes

### Reglas

- **camelCase.** `commitmentTypes`, `supportMessages`.
- **Una constante por concepto.** No agrupar constantes no relacionadas en el mismo archivo.
- **Valores mágicos prohibidos.** Toda constante debe tener un nombre.
- **Archivo por categoría.** `commitment-types.ts`, `support-messages.ts`.

---

## Comentarios

### Reglas

- **Explicar el "por qué", no el "qué".** El código debe ser auto-explicativo sobre lo que hace.
- **Comentarios en inglés.** El proyecto es en español en UX, pero el código en inglés.
- **JSDoc para funciones públicas.** Descripción breve + params + return.

```tsx
/**
 * Calcula la continuidad de una persona basada en sus Commits.
 *
 * @param commits - Lista de Commits del usuario, ordenados por fecha descendente
 * @returns Métricas de continuidad (días totales, frecuencia, racha actual)
 */
export function calculateContinuity(commits: Commit[]): ContinuityMetrics {
```

---

## Resumen

| Aspecto        | Convención                                                |
| -------------- | --------------------------------------------------------- |
| Nombres        | PascalCase para componentes, camelCase para todo lo demás |
| Componentes    | Named export, una por archivo, props con interface        |
| Hooks          | `use` prefijo, named export, TanStack Query               |
| Server Actions | `"use server"`, Zod, `{ data, error }`, `revalidatePath`  |
| Imports        | 6 grupos ordenados, alias `@/`, `import type`             |
| Funciones      | Una responsabilidad, máximo 30 líneas, return temprano    |
| Tipos          | `interface` para dominio, `type` para uniones, sin `any`  |
| Constantes     | camelCase, un concepto por archivo                        |
| Comentarios    | "por qué", no "qué"; JSDoc en funciones públicas          |

## Próximo documento

`docs/engineering/02-git-workflow.md` — Rama, commits, PR, releases, Conventional Commits.
