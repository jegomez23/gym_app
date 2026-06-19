# 10 — Query Strategy

> **Propósito de este documento:** Definir cómo accederemos a los datos desde la aplicación. No queremos lógica SQL dispersa. Este documento establece los patrones para consultas, mutaciones, paginación, cache optimista, Realtime e invalidación.

---

## Principios

1. **Server Components para lectura inicial.** La mayoría de datos se cargan en Server Components y se pasan al cliente.
2. **TanStack Query para datos dinámicos.** Refetch, cache, mutaciones con invalidación.
3. **Server Actions para toda escritura.** Nunca escribir directamente desde el cliente.
4. **Las funciones SQL (PostgreSQL) simplifican consultas complejas.** Presence, Journey, Shared History.
5. **RLS es la capa de seguridad.** Las consultas no verifican permisos explícitamente; RLS lo hace.

---

## Patrón: Lectura en Server Components

Para datos que se muestran en la carga inicial de la página:

```tsx
// app/(main)/page.tsx — Server Component
import { createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createServerClient();

  const { data: recentCommits } = await supabase
    .from("commits")
    .select("id, title, type, recorded_at, intensity, visibility")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("recorded_at", { ascending: false })
    .limit(5);

  return <TodayDashboard initialCommits={recentCommits} />;
}
```

**Cuándo usar:** Dashboard inicial, perfil, listas que no necesitan actualización constante.

---

## Patrón: Lectura en Client Components (TanStack Query)

Para datos que necesitan refetch, cache o actualización:

```tsx
// features/commit/hooks/useCommits.ts
import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export function useCommits(userId: string, limit = 20) {
  return useQuery({
    queryKey: ["commits", userId, { limit }],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("commits")
        .select("id, title, type, recorded_at, intensity, visibility")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("recorded_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
}
```

**Cuándo usar:** Timeline de Commits, lista de Reflections, miembros del Circle.

---

## Patrón: Consultas complejas con funciones SQL

Para presencia, Journey e historia compartida, usamos funciones PostgreSQL:

```tsx
// features/circle/hooks/useCirclePresence.ts
export function useCirclePresence() {
  return useQuery({
    queryKey: ["circle", "presence"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      // Llamar a la función PostgreSQL
      const { data, error } = await supabase.rpc("get_circle_presence", {
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 1000, // 10 segundos, la presencia cambia rápido
  });
}
```

**Cuándo usar:** Presence, Journey, Shared History — consultas que agregan datos de múltiples tablas.

---

## Patrón: Mutaciones (Server Actions)

Toda escritura sigue este patrón:

```tsx
// features/commit/actions/createCommit.ts
"use server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().max(150).optional(),
  type: z.string().max(50).optional(),
  duration_minutes: z.number().positive().optional(),
  intensity: z.enum(["light", "steady", "deep"]).optional(),
  note: z.string().max(500).optional(),
  visibility: z.enum(["private", "circle", "public"]).default("private"),
});

export async function createCommit(formData: FormData) {
  const validated = schema.parse(Object.fromEntries(formData));
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("commits")
    .insert({ ...validated, user_id: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/progress");
  return { data };
}
```

**Cuándo usar:** Toda escritura de datos. Server Actions son el único mecanismo.

---

## Patrón: Mutaciones con TanStack Query

```tsx
// features/commit/hooks/useCreateCommit.ts
export function useCreateCommit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommitInput) => {
      const result = await createCommit(input);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["commits"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["circle", "presence"] });
    },
  });
}
```

---

## Patrón: Paginación

Para listas largas (Commits, Reflections):

```tsx
export function useCommitsInfinite(userId: string) {
  return useInfiniteQuery({
    queryKey: ["commits", userId, "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("commits")
        .select("id, title, type, recorded_at")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("recorded_at", { ascending: false })
        .range(pageParam, pageParam + 19); // 20 por página
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length === 20 ? allPages.length * 20 : undefined;
    },
  });
}
```

---

## Patrón: Cache optimista

Para Commits (donde el feedback inmediato es importante):

```tsx
useMutation({
  mutationFn: createCommit,
  onMutate: async (newCommit) => {
    await queryClient.cancelQueries({ queryKey: ["commits", userId] });
    const previous = queryClient.getQueryData(["commits", userId]);

    queryClient.setQueryData(["commits", userId], (old) => [newCommit, ...old]);

    return { previous };
  },
  onError: (err, newCommit, context) => {
    queryClient.setQueryData(["commits", userId], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["commits", userId] });
  },
});
```

---

## Patrón: Realtime (Presence del Circle)

```tsx
// Ver docs/database/09-supabase-implementation.md para el código completo
// Resumen:
// 1. Suscribirse a INSERT en tabla commits vía Supabase Realtime
// 2. Invalidar query de presencia al recibir evento
// 3. TanStack Query refetch automático
```

---

## Mapa de queries MVP

| Consulta            | Patrón                    | Tabla/Función            | Cache      |
| ------------------- | ------------------------- | ------------------------ | ---------- |
| Perfil propio       | Server Component          | `profiles`               | -          |
| Commits recientes   | Server Component          | `commits`                | -          |
| Timeline de Commits | TanStack Query (infinite) | `commits`                | 30s        |
| Detalle de Commit   | TanStack Query            | `commits`                | 1min       |
| Crear Commit        | Server Action + Mutation  | `commits`                | Invalidate |
| Circle members      | TanStack Query            | `circle_memberships`     | 1min       |
| Circle presence     | TanStack Query + Realtime | `get_circle_presence()`  | 10s        |
| Shared history      | TanStack Query            | `get_shared_history()`   | 5min       |
| Journey timeline    | TanStack Query            | `get_journey_timeline()` | 1min       |
| Progress metrics    | TanStack Query            | Calculado en app         | 1min       |
| Reflections         | TanStack Query            | `reflections`            | 1min       |
| Crear Reflection    | Server Action + Mutation  | `reflections`            | Invalidate |
| Enviar support      | Server Action + Mutation  | `supports`               | Invalidate |
| Perfil (editar)     | Server Action             | `profiles`               | Invalidate |

---

## Decisiones tomadas

1. **Server Components para carga inicial.** Disminuye el JS del cliente y mejora rendimiento.
2. **TanStack Query para refetch y cache.** No reinventar la rueda.
3. **Funciones SQL para consultas complejas.** Presence, Journey, Shared History.
4. **Cache optimista para Commits.** La acción principal debe sentirse instantánea.
5. **Invalidación múltiple.** Crear un Commit invalida commits, progress y presence.
6. **Realtime solo para presencia.** No saturar con canales innecesarios.

## Alternativas descartadas

- **Todas las consultas en Server Components.** Descartado porque las páginas necesitarían recargarse para ver cambios.
- **Todas las consultas en TanStack Query.** Descartado porque añade complejidad innecesaria a datos que solo se ven una vez.
- **GraphQL.** Descartado por excesivo para el volumen de datos.

## Riesgos

- Las funciones SQL pueden ser lentas si se llaman con mucha frecuencia. Monitorear y considerar caché adicional.
- La invalidación múltiple puede causar demasiados refetches si no se configura correctamente.
- El cache optimista puede causar inconsistencias si la Server Action falla y el rollback no es correcto.

## Preguntas abiertas

- ¿Debemos usar `revalidateTag` en lugar de `revalidatePath` para más granularidad? Decisión: `revalidatePath` para MVP.
- ¿Las funciones SQL deben ser SECURITY INVOKER o SECURITY DEFINER? Decisión: SECURITY INVOKER para que RLS se aplique.

## Próximo documento

`docs/database/11-database-roadmap.md` — Orden de implementación de la base de datos por fases.
