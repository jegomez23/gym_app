# 07 — Data Flow

> **Propósito de este documento:** Explicar cómo viajan los datos en Gym Circle desde su origen en Supabase hasta la interfaz de usuario. Este documento describe la filosofía del flujo de datos, los patrones de comunicación entre capas y las reglas para cada tipo de operación.

---

## Filosofía del flujo de datos

1. **El servidor es la fuente de verdad.** Los datos se almacenan y validan en Supabase (PostgreSQL). El cliente nunca es la fuente de verdad de datos persistentes.
2. **Los datos viajan en una dirección clara:** Supabase → Server Action/Server Component → Cliente (TanStack Query) → UI.
3. **Las mutaciones siempre pasan por el servidor.** Nunca se escribe directamente desde el cliente a Supabase. Siempre a través de Server Actions.
4. **El RLS es la última línea de defensa.** Aunque las Server Actions validen permisos, RLS asegura que incluso si una Server Action falla, el dato está protegido.

---

## Diagrama general del flujo de datos

```
                    ┌─────────────────────────────────────────────┐
                    │              SUPABASE (PostgreSQL)           │
                    │  Tablas: commits, profiles, circles, etc.    │
                    │  Seguridad: RLS + Políticas por fila         │
                    └──────────────────┬──────────────────────────┘
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
               ┌──────────────────┐     ┌──────────────────────┐
               │  Server Actions  │     │   Server Components  │
               │  (Mutaciones)    │     │   (Lectura inicial)  │
               └────────┬─────────┘     └──────────┬───────────┘
                        │                          │
                        │                     ┌────┴────┐
                        │                     │   RSC   │
                        │                     │  Data   │
                        │                     └────┬────┘
                        ▼                          │
               ┌──────────────────┐                │
               │  TanStack Query  │◄───────────────┘
               │  (Cache + Sincro)│
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │  Client Comp.    │
               │  (UI)            │
               └──────────────────┘
```

---

## Flujo de lectura de datos

### Lectura en Server Components (recomendada)

Para datos que se muestran en la carga inicial de la página y no necesitan actualización en tiempo real:

```
Server Component
      │
      ▼
createServerClient()
      │
      ▼
supabase.from("commits").select("*")
      │
      ▼
RLS verifica permisos del usuario autenticado
      │
      ▼
Datos se renderizan en el Server Component
      │
      ▼
HTML se envía al cliente
```

**Cuándo usar:**

- Dashboard inicial (Hoy)
- Perfil del usuario
- Lista inicial de Commits
- Métricas de progreso

**Ejemplo:**

```tsx
// app/(main)/page.tsx — Server Component
import { createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createServerClient();

  const { data: commits } = await supabase
    .from("commits")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(5);

  return <TodayDashboard initialCommits={commits} />;
}
```

### Lectura en Client Components (TanStack Query)

Para datos que necesitan actualización en tiempo real o refetch:

```
Client Component
      │
      ▼
useCommits() hook (TanStack Query)
      │
      ▼
createBrowserClient()
      │
      ▼
supabase.from("commits").select("*")
      │
      ▼
RLS verifica permisos (sesión en cookie)
      │
      ▼
TanStack Query cachea el resultado
      │
      ▼
Componente se renderiza con los datos
```

**Cuándo usar:**

- Timeline de Commits (necesita paginación y refetch)
- Presence del Circle (necesita actualización periódica)
- Reflections (necesita cache y mutaciones)

---

## Flujo de escritura de datos

Toda escritura sigue este flujo estricto:

```
Usuario interactúa con UI (ej: click "Registrar Commit")
      │
      ▼
Client Component (CommitForm)
      │
      ▼
React Hook Form valúa con Zod (validación del lado cliente)
      │
      ▼
useCreateCommit() mutation (TanStack Query)
      │
      ▼
Server Action: createCommit()
      │
      ▼
createServerClient()
      │
      ▼
Zod valida nuevamente (validación del lado servidor)
      │
      ▼
supabase.from("commits").insert(data)
      │
      ▼
RLS verifica permisos (user_id = auth.uid())
      │
      ▼
Base de datos inserta el registro
      │
      ▼
revalidatePath() — Next.js revalida Server Components
      │
      ▼
TanStack Query invalida queries relacionadas
      │
      ▼
UI se actualiza con los nuevos datos
```

**Validación en dos capas:**

1. **Cliente (React Hook Form + Zod):** Feedback inmediato al usuario.
2. **Servidor (Server Action + Zod):** Seguridad. Nunca confiar en la validación del cliente.

**Cache optimista (opcional, para Commits):**

```
Usuario crea Commit
      │
      ▼
TanStack Query actualiza el cache inmediatamente
      │
      ▼
UI muestra el Commit como si ya estuviera guardado
      │
      ▼
Server Action se ejecuta en segundo plano
      │
      ▼
  ├── Éxito → Cache actualizado con datos reales
  └── Error → Cache se revierte (rollback)
```

---

## Flujo de datos en Realtime (Presence)

Para la presencia del Circle, usamos Supabase Realtime:

```
Usuario completa un Commit
      │
      ▼
Server Action inserta en commits
      │
      ▼
Cambio en tabla commits (INSERT)
      │
      ▼
Supabase Realtime emite el cambio
      │
      ▼
Client Component (CircleDashboard)
      │
      ▼
Suscribe a canal Realtime: commits_channel
      │
      ▼
TanStack Query invalida query de presencia
      │
      ▼
UI actualiza indicador de presencia
```

```tsx
// features/circle/hooks/useCirclePresence.ts
export function useCirclePresence(circleId: string) {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();

  useEffect(() => {
    // Suscribirse a cambios en Commits del Circle
    const channel = supabase
      .channel("circle-commits")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "commits" },
        () => {
          // Invalidar query de presencia para refrescar
          queryClient.invalidateQueries({
            queryKey: ["circle", circleId, "presence"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId]);

  return useQuery({
    queryKey: ["circle", circleId, "presence"],
    queryFn: () => getCirclePresence(circleId),
  });
}
```

---

## Flujo de datos en Server Actions

### Estructura de una Server Action completa

```tsx
// features/commit/actions/createCommit.ts
"use server";

import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { commitSchema } from "../schemas/commitSchema";

export async function createCommit(input: FormData | CreateCommitInput) {
  // 1. Validar en servidor (nunca confiar en cliente)
  const validated = commitSchema.parse(
    input instanceof FormData ? Object.fromEntries(input) : input
  );

  // 2. Obtener cliente autenticado
  const supabase = createServerClient();

  // 3. Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // 4. Insertar con user_id forzado (el RLS también protege)
  const { data, error } = await supabase
    .from("commits")
    .insert({
      ...validated,
      user_id: user.id,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // 5. Revalidar rutas afectadas
  revalidatePath("/");
  revalidatePath(`/commit/${data.id}`);

  // 6. Devolver datos (TanStack Query los usará)
  return { data };
}
```

### Reglas para Server Actions

1. **Siempre validar en servidor** con Zod (nunca confiar en validación del cliente).
2. **Siempre verificar autenticación** dentro de la acción.
3. **Siempre usar `revalidatePath`** después de mutaciones exitosas.
4. **Devolver `{ data, error }`** para que el cliente pueda manejarlos.
5. **Nunca exponer el service_role key** en Server Actions. Usar siempre anon key + RLS.
6. **Las Server Actions son asíncronas.** Usar `async/await`.

---

## Dependencias entre capas

```
Server Components
    │
    ├── Pueden llamar a createServerClient() directamente
    ├── Pueden llamar a Server Actions (para formularios)
    └── Pasan datos iniciales a Client Components como props

Server Actions
    │
    ├── Crean createServerClient() para cada operación
    ├── Validan con Zod
    ├── Usan RLS como seguridad
    └── Revalidan rutas con revalidatePath()

Client Components
    │
    ├── Usan TanStack Query para datos del servidor
    ├── Usan React Hook Form para formularios
    ├── Usan Zustand para estado UI
    └── Llaman a Server Actions para mutaciones

TanStack Query
    │
    ├── Cachea datos del servidor
    ├── Provee loading/error states
    ├── Sincroniza con Server Actions via invalidateQueries
    └── Soporta cache optimista
```

---

## Decisiones tomadas

1. Server Components para lectura inicial de datos (carga rápida, SEO).
2. TanStack Query para datos dinámicos en el cliente (refetch, cache, sincronización).
3. Server Actions para toda escritura de datos (seguridad, validación en servidor).
4. Validación en dos capas: cliente (Zod + React Hook Form) y servidor (Zod en Server Action).
5. RLS como capa de seguridad adicional (defensa en profundidad).
6. Supabase Realtime para presencia del Circle (actualización en vivo).

## Alternativas descartadas

- **Escritura directa desde el cliente (supabase.from().insert()).** Descartado porque expone la lógica de negocio y evita la validación en servidor.
- **API Routes para CRUD.** Descartado porque Server Actions simplifican el flujo (no necesitas definir endpoints HTTP).
- **GraphQL.** Descartado por excesivo para el volumen de datos de Gym Circle.
- **tRPC.** Descartado porque Server Actions + TanStack Query cubren las mismas necesidades con menos abstracción.

## Riesgos

- Server Components pueden quedarse obsoletos si no se revalidan correctamente. Usar `revalidatePath` y `revalidateTag` consistentemente.
- TanStack Query puede sobrecargar de peticiones si `staleTime` es muy bajo. Configurar valores adecuados (30s default).
- Realtime puede ser costoso si hay muchos suscriptores. Usar Realtime solo para Presence, no para todas las tablas.

## Preguntas abiertas

- ¿Necesitaremos un sistema de colas (Bull, RabbitMQ) para operaciones asíncronas (notificaciones, cálculos pesados)? Decisión inicial: no en MVP.
- ¿Debemos usar `revalidateTag` en lugar de `revalidatePath` para más granularidad? Decisión inicial: `revalidatePath`, migrar a tags si es necesario.
- ¿La presencia del Circle debe usar Realtime o polling cada N segundos? Decisión inicial: Realtime para MVP, poll como fallback.

## Próximo documento

`docs/architecture/08-coding-roadmap.md` — El plan de implementación ordenado por sprints, con dependencias claras y minimización de retrabajo.
