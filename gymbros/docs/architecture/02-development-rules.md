# 02 — Development Rules

> **Propósito de este documento:** Definir las reglas de desarrollo del proyecto Gym Circle. Este documento debe convertirse en la guía oficial para cualquier desarrollador que se incorpore al proyecto. Cada regla está justificada desde la filosofía del producto y la arquitectura definida.

---

## Convención de nombres

### Archivos y carpetas

| Tipo                      | Convención                | Ejemplo                                    |
| ------------------------- | ------------------------- | ------------------------------------------ |
| Componentes React         | PascalCase                | `CommitCard.tsx`, `CircleDashboard.tsx`    |
| Hooks                     | camelCase prefijo `use`   | `useCommits.ts`, `useCreateCommit.ts`      |
| Server Actions            | camelCase verbo           | `createCommit.ts`, `inviteToCircle.ts`     |
| Schemas (Zod)             | camelCase sufijo `Schema` | `commitSchema.ts`, `circleSchema.ts`       |
| Tipos/Interfaces          | PascalCase                | `Commit`, `CircleMember`                   |
| Utilidades                | camelCase                 | `commitUtils.ts`, `continuity.ts`          |
| Constantes                | camelCase                 | `commitmentTypes.ts`, `supportMessages.ts` |
| Archivos de configuración | kebab-case                | `tailwind.config.ts`, `next.config.mjs`    |
| Carpetas de features      | kebab-case                | `commit/`, `circle/`, `reflection/`        |
| Carpetas de componentes   | kebab-case                | `ui/`, `shared/`                           |

### Componentes

- **Componentes de página:** Sufijo `Page` implícito por el nombre del archivo (Next.js App Router). No añadir `Page` al nombre.
- **Componentes de feature:** Nombre descriptivo sin sufijo. `CommitForm`, `CircleDashboard`.
- **Componentes compartidos:** Nombre genérico. `EmptyState`, `LoadingState`.
- **Componentes de UI base:** Nombres cortos y descriptivos. `Button`, `Card`, `Input`, `Dialog`.

---

## Server Components vs Client Components

### Regla general

**Por defecto, todo es Server Component.** Solo usar `"use client"` cuando sea estrictamente necesario.

### Cuándo usar Client Components (`"use client"`)

1. **Cuando se necesita interactividad del navegador:**
   - `onClick`, `onSubmit`, `onChange`
   - `useState`, `useEffect`, `useReducer`
   - `useRef`, `useCallback`, `useMemo`

2. **Cuando se usan hooks específicos del navegador:**
   - `useRouter` (solo para navegación programática)
   - `useSearchParams` (solo cuando se necesita reactividad)
   - `usePathname` (para UI condicional)
   - TanStack Query hooks
   - Zustand stores

3. **Cuando se usan librerías que requieren el navegador:**
   - Framer Motion (animaciones)
   - React Hook Form (formularios)
   - Cualquier librería que acceda a `window`, `document`, `navigator`

### Cuándo NO usar Client Components

1. **Para renderizar datos que vienen del servidor.** Si el componente solo recibe props y las renderiza, debe ser Server Component.
2. **Para layouts y wrappers.** A menos que tengan interactividad.
3. **Para componentes puramente visuales.** `Badge`, `Avatar`, `Card` — deben ser Server Components.

### Estrategia de colocation

Cuando un componente necesita ser Client Component por una pequeña parte interactiva, extraer solo esa parte a un Client Component hijo y mantener el resto como Server Component.

**Ejemplo:**

```tsx
// ✅ Bien: Server Component principal, Client Component solo para el formulario
// page.tsx (Server Component)
export default function CommitPage() {
  const commits = await getCommits();
  return (
    <div>
      <CommitList commits={commits} /> {/* Server Component */}
      <CommitForm /> {/* Client Component */}
    </div>
  );
}
```

---

## Server Actions

### Reglas de uso

1. **Toda mutación de datos debe usar Server Actions.** No crear API Routes para operaciones CRUD a menos que sea estrictamente necesario (webhooks, third-party).

2. **Las Server Actions viven en `features/[feature]/actions/`.** Un archivo por acción o por grupo relacionado.

3. **Las Server Actions deben ser tipos seguras.** Usar Zod para validar los argumentos de entrada.

```tsx
// ✅ Bien
"use server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { commitSchema } from "../schemas/commitSchema";

export async function createCommit(formData: FormData) {
  const validated = commitSchema.parse(Object.fromEntries(formData));
  const supabase = createServerClient();
  const { data, error } = await supabase.from("commits").insert(validated);
  revalidatePath("/");
  return { data, error };
}
```

4. **Toda Server Action debe revalidar las rutas afectadas.** Usar `revalidatePath` o `revalidateTag` después de mutaciones exitosas.

5. **Las Server Actions no deben exponer datos sensibles.** Validar permisos dentro de la acción usando RLS o verificaciones explícitas.

### Cuándo NO usar Server Actions

- Para operaciones de solo lectura (usar Server Components con TanStack Query en cliente si es necesario).
- Para webhooks o endpoints externos (usar API Routes).
- Para operaciones que requieren streaming de datos (usar Route Handlers).

---

## TanStack Query

### Reglas de uso

1. **TanStack Query para todo estado del servidor en el cliente.** Si un dato viene de Supabase y se necesita en un Client Component, usar TanStack Query.

2. **Los hooks de TanStack Query viven en `features/[feature]/hooks/`.**

```tsx
// ✅ Bien
// features/commit/hooks/useCommits.ts
export function useCommits(userId: string) {
  return useQuery({
    queryKey: ["commits", userId],
    queryFn: async () => {
      const supabase = createServerClient();
      const { data } = await supabase
        .from("commits")
        .select("*")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false });
      return data;
    },
  });
}
```

3. **Usar queryKey por feature.** La clave debe incluir el nombre de la feature y los parámetros relevantes.
   - ✅ `["commits", userId]`
   - ✅ `["circle-presence", circleId]`
   - ❌ `["data"]` (demasiado genérico)

4. **Usar mutations con cache optimista cuando la UX lo requiera.** Especialmente para Commits (mostrar inmediatamente el resultado mientras se guarda en servidor).

5. **Configurar staleTime globalmente.** `staleTime: 30 * 1000` (30 segundos) es un buen default. Ajustar por feature según necesidad.

6. **No usar TanStack Query para datos que solo se necesitan en Server Components.** Usar Server Components directamente.

---

## Zustand

### Reglas de uso

1. **Zustand solo para estado UI efímero y compartido.** No para datos del servidor.

2. **Lo que SÍ puede estar en Zustand:**
   - Estado de modales (abierto/cerrado)
   - Estado del formulario de Commit no enviado (draft)
   - Estado del onboarding (paso actual)
   - Preferencias temporales de UI (filtros, orden)

3. **Lo que NO puede estar en Zustand:**
   - Commits del usuario (deben venir de TanStack Query)
   - Datos del Circle
   - Métricas de Progress
   - Cualquier cosa que persista en Supabase

4. **Un store por dominio de UI.** No crear un store monolítico.

```tsx
// ✅ Bien
// stores/ui-store.ts
export const useUIStore = create<UIStore>((set) => ({
  isCommitModalOpen: false,
  setCommitModalOpen: (open) => set({ isCommitModalOpen: open }),
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),
}));
```

---

## Organización de imports

### Orden de imports

1. Librerías externas (React, Next.js, Supabase)
2. Librerías de UI/layout (shadcn/ui, Framer Motion)
3. Hooks y stores (TanStack Query hooks, Zustand)
4. Componentes (ruta relativa o alias `@/`)
5. Utilidades y tipos
6. Estilos (CSS, Tailwind)

```tsx
// ✅ Bien
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useCommits } from "@/features/commit/hooks/useCommits";
import { useUIStore } from "@/stores/ui-store";

import { CommitForm } from "@/features/commit/components/CommitForm";

import { cn } from "@/lib/utils/cn";
import type { Commit } from "@/types/commit";

import "./styles.css"; // solo cuando sea necesario
```

### Alias de imports

Usar el alias `@/` configurado en `tsconfig.json` para imports absolutos:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Manejo de errores

### Server Actions

- Toda Server Action debe devolver un objeto con `{ data, error }` o lanzar un error manejable.
- Usar `try/catch` en cada Server Action.
- Los errores de validación (Zod) deben devolverse al formulario, no lanzarse.

```tsx
// ✅ Bien
export async function createCommit(formData: FormData) {
  try {
    const validated = commitSchema.parse(Object.fromEntries(formData));
    const supabase = createServerClient();
    const { data, error } = await supabase.from("commits").insert(validated);
    if (error) return { error: error.message };
    revalidatePath("/");
    return { data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: err.errors };
    }
    return { error: "Error inesperado" };
  }
}
```

### Client Components

- Usar Error Boundaries para capturar errores de renderizado.
- Los errores de mutación deben mostrarse en el formulario correspondiente.
- Los errores de consulta (TanStack Query) deben manejarse con estados de error en el componente.

```tsx
// ✅ Bien
const { data, error, isLoading } = useCommits(userId);
if (isLoading) return <LoadingState />;
if (error) return <ErrorState message={error.message} />;
```

### Errores globales

- Usar `error.tsx` en cada segmento de ruta para errores de página.
- Usar `global-error.tsx` para errores no recuperables.

---

## Tipado

### Reglas

1. **Tipos explícitos, no inferidos.** Aunque TypeScript infiera tipos correctamente, los tipos de las funciones principales deben ser explícitos.

2. **Preferir `interface` sobre `type` para objetos del dominio.** `interface` es extensible y produce mejores mensajes de error.

```tsx
// ✅ Bien
export interface Commit {
  id: string;
  userId: string;
  title: string | null;
  recordedAt: string;
  durationMinutes: number | null;
  visibility: "private" | "circle" | "public";
}
```

3. **Usar `type` para uniones, utilidades y props de componentes.**

```tsx
// ✅ Bien
export type Visibility = "private" | "circle" | "public";
export type CommitType = "training" | "nutrition" | "rest" | "mind" | "custom";
```

4. **No usar `any`.** Si el tipo es desconocido, usar `unknown` y validar con Zod.

5. **Los tipos compartidos entre features viven en `types/`.** Los tipos específicos de una feature viven en `features/[feature]/types/`.

6. **Los tipos de Supabase se generan con `supabase gen types`.** No escribirlos manualmente.

---

## Componentes

### Reglas

1. **Un componente, una responsabilidad.** Si un componente hace más de una cosa, dividirlo.

2. **Componentes de feature no deben importar de otras features.** Si necesitan compartir lógica, extraerla a `lib/`.

3. **Props explícitas, no `rest props`.** Cada prop debe estar documentada.

4. **Componentes de UI (shadcn/ui) son la base.** Personalizarlos solo cuando sea necesario para la identidad de Gym Circle.

5. **Usar `cn()` de `lib/utils/cn` para combinar clases de Tailwind.**

```tsx
// ✅ Bien
import { cn } from "@/lib/utils/cn";

export function CommitCard({ commit, className }: CommitCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3>{commit.title}</h3>
    </div>
  );
}
```

---

## Performance

### Reglas

1. **Minimizar Client Components.** Cada `"use client"` aumenta el bundle del cliente.

2. **Usar `React.memo` solo cuando haya rerenders innecesarios medibles.** No aplicar por defecto.

3. **Las imágenes deben usar el componente `Image` de Next.js** con lazy loading.

4. **Las páginas deben usar `loading.tsx`** para mejorar la percepción de velocidad.

5. **Las consultas pesadas deben hacerse en Server Components** y pasarse como props a Client Components.

---

## Testing

### Reglas

1. **Tests unitarios con Vitest** para funciones puras (utilidades, cálculos de continuidad, validaciones).

2. **Tests de integración** para Server Actions y flujos de datos.

3. **Tests E2E con Playwright** para flujos críticos: registro, Commit completo, interacción Circle.

4. **Cobertura mínima:** 80% en `lib/`, 70% en `features/*/utils/`, 50% en `features/*/actions/`.

---

## Decisiones tomadas

1. Server Components por defecto, Client Components solo cuando sea necesario.
2. Server Actions para toda mutación de datos.
3. TanStack Query para estado del servidor en el cliente.
4. Zustand solo para estado UI efímero.
5. Tipos explícitos con `interface` para dominio, `type` para utilidades.
6. Imports con alias `@/` para imports absolutos.
7. Orden estricto de imports.
8. Manejo de errores con `{ data, error }` en Server Actions.

## Alternativas descartadas

- **API Routes para CRUD.** Descartado porque Server Actions simplifican la arquitectura.
- **Context API para estado UI.** Descartado porque Zustand es más eficiente y simple.
- **Tipos inferidos.** Descartado porque los tipos explícitos mejoran la legibilidad y el DX.

## Riesgos

- Server Actions son relativamente nuevos; podrían cambiar su API en futuras versiones de Next.js.
- La disciplina de no importar entre features puede romperse si no se refuerza en code review.
- El tipado manual puede quedar desincronizado con el esquema de Supabase si no se generan los tipos automáticamente.

## Preguntas abiertas

- ¿Deberíamos usar `@tanstack/react-query` v5 o esperar a v6?
- ¿Framer Motion o CSS transitions para animaciones? Decisión inicial: Framer Motion para animaciones complejas, CSS transitions para micro-interacciones.
- ¿Playwright o Cypress para E2E? Decisión inicial: Playwright.

## Próximo documento

`docs/architecture/03-feature-architecture.md` — Arquitectura basada en features: estructura interna de cada feature, responsabilidades y dependencias.
