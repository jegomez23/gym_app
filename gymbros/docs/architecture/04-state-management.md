# 04 — State Management

> **Propósito de este documento:** Definir la estrategia completa de gestión de estado en Gym Circle. Cada tipo de estado (servidor, UI, URL, formulario) tiene un lugar específico y reglas claras. No debe haber duplicación ni estado innecesario.

---

## Principios

1. **Cada pieza de estado vive en un solo lugar.** No duplicar estado. Si un dato está en TanStack Query, no debe estar también en Zustand.
2. **El estado se clasifica por su fuente de verdad:** servidor, cliente, URL o formulario.
3. **Menos estado es mejor.** Si un dato puede calcularse a partir de otros datos, calcularlo en lugar de almacenarlo.
4. **El estado UI debe ser efímero.** Si la persona cierra y vuelve a abrir la aplicación, el estado UI puede perderse. El estado que debe persistir va al servidor.

---

## Las cuatro categorías de estado

| Categoría        | Tecnología                    | ¿Qué almacena?                         | ¿Persiste?    |
| ---------------- | ----------------------------- | -------------------------------------- | ------------- |
| **Server State** | TanStack Query                | Commits, Circle, Progress, Profile     | Sí (Supabase) |
| **UI State**     | Zustand / React State         | Modales, filtros, onboarding step      | No            |
| **URL State**    | useSearchParams / usePathname | Parámetros de ruta, filtros de página  | Sí (URL)      |
| **Form State**   | React Hook Form               | Formularios (Commit, Reflection, etc.) | No            |

---

## 1. Server State — TanStack Query

### ¿Qué va aquí?

Todos los datos que viven en Supabase y se necesitan desde el cliente:

- Commits del usuario
- Miembros del Circle
- Presence del Circle
- Métricas de Progress
- Reflections
- Perfil del usuario

### ¿Cómo se organiza?

Cada feature tiene sus propios hooks de TanStack Query:

```tsx
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
    staleTime: 30 * 1000, // 30 segundos
  });
}
```

### Query Keys

Estructura de query keys:

```
["commits", userId]                    → Lista de Commits
["commits", userId, commitId]          → Commit individual
["circle", userId, "members"]          → Miembros del Circle
["circle", userId, "presence"]         → Presence del Circle
["progress", userId]                   → Métricas de progreso
["profile", userId]                    → Perfil del usuario
["reflections", userId]                → Reflections
```

### Mutaciones

Cada mutación debe:

1. Validar los datos con Zod
2. Ejecutar la Server Action
3. Invalidar las queries afectadas

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
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["commits", data.userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", data.userId] });
    },
  });
}
```

### Cache optimista

Para Commits (donde la velocidad de feedback es crítica), usar cache optimista:

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
});
```

---

## 2. UI State — Zustand + React State

### ¿Qué va en Zustand (compartido)?

Estado UI que necesitan múltiples componentes no relacionados:

```tsx
// stores/ui-store.ts
interface UIStore {
  // Modales
  isCommitModalOpen: boolean;
  isReflectionModalOpen: boolean;

  // Onboarding
  onboardingStep: number;
  onboardingCompleted: boolean;

  // Filtros temporales (no persisten)
  activeTab: "today" | "week" | "month";
  circleFilter: "all" | "active" | "returning";
}
```

### ¿Qué va en React State (local)?

Estado que solo necesita un componente:

```tsx
// ✅ Bien: estado local en un Client Component
function CommitForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CommitType>("training");
  // Este estado solo importa a CommitForm
}
```

### Lo que NUNCA va en Zustand

- Commits (deben venir de TanStack Query)
- Miembros del Circle
- Métricas de progreso
- Datos del perfil
- Cualquier cosa que persista en Supabase

---

## 3. URL State — useSearchParams

### ¿Qué va en la URL?

Estado que debe ser compartible o que define la vista actual:

- Filtros de timeline (`?period=month`)
- ID del miembro del Circle (`?member=abc123`)
- Página actual (`?page=2`)
- Pestaña activa en vistas de tabs (`?tab=progress`)

### ¿Por qué?

- La URL es compartible
- Persiste al refrescar la página
- Permite navegación con el botón de atrás/adelante

```tsx
// ✅ Bien: filtros en URL
function CommitTimeline() {
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "week";
  const page = Number(searchParams.get("page")) || 1;
}
```

---

## 4. Form State — React Hook Form

### ¿Qué va aquí?

Todo formulario del producto:

- Formulario de Commit
- Formulario de Reflection
- Formulario de invitación al Circle
- Formulario de perfil
- Formularios de autenticación

### ¿Por qué React Hook Form?

- Rendimiento: evita rerenders innecesarios
- Integración natural con Zod para validación
- Manejo de errores por campo
- Soporte para formularios complejos

```tsx
// ✅ Bien
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commitSchema } from "../schemas/commitSchema";

function CommitForm() {
  const form = useForm({
    resolver: zodResolver(commitSchema),
    defaultValues: {
      title: "",
      type: "training",
      visibility: "private",
    },
  });
}
```

---

## Árbol de decisión para estado

```
¿El dato viene del servidor (Supabase)?
│
├── Sí → ¿Se necesita en el cliente?
│       ├── Sí → TanStack Query
│       └── No → Server Component (no almacenar en cliente)
│
└── No → ¿El dato pertenece a un solo componente?
        ├── Sí → React State (useState)
        └── No → ¿Debe persistir al refrescar?
                ├── Sí → URL State (useSearchParams)
                └── No → Zustand
```

---

## Mapa completo de estado

| Dato                      | Categoría    | Tecnología                | Persiste |
| ------------------------- | ------------ | ------------------------- | -------- |
| Lista de Commits          | Server State | TanStack Query            | Sí       |
| Commit individual         | Server State | TanStack Query            | Sí       |
| Miembros del Circle       | Server State | TanStack Query            | Sí       |
| Presence del Circle       | Server State | TanStack Query (Realtime) | Sí       |
| Shared History            | Server State | TanStack Query            | Sí       |
| Métricas de Progress      | Server State | TanStack Query            | Sí       |
| Datos del Journey         | Server State | TanStack Query            | Sí       |
| Reflections               | Server State | TanStack Query            | Sí       |
| Perfil del usuario        | Server State | TanStack Query            | Sí       |
| Modal activo              | UI State     | Zustand                   | No       |
| Onboarding step           | UI State     | Zustand                   | No       |
| Filtro de timeline        | URL State    | useSearchParams           | Sí (URL) |
| Página actual             | URL State    | useSearchParams           | Sí (URL) |
| Formulario de Commit      | Form State   | React Hook Form           | No       |
| Formulario de Reflection  | Form State   | React Hook Form           | No       |
| Título del Commit (input) | UI State     | useState (local)          | No       |

---

## Decisiones tomadas

1. Cuatro categorías de estado: Server (TanStack Query), UI (Zustand/React State), URL (useSearchParams), Form (React Hook Form).
2. TanStack Query para todo dato que venga de Supabase y se necesite en el cliente.
3. Zustand solo para estado UI compartido entre múltiples componentes.
4. React State para estado local de un solo componente.
5. useSearchParams para estado de UI que debe persistir en la URL.
6. React Hook Form + Zod para formularios.
7. Cache optimista para mutaciones de Commit.

## Alternativas descartadas

- **TanStack Query para todo.** Descartado porque los filtros de UI no necesitan caching ni invalidación.
- **Zustand para datos del servidor.** Descartado porque Zustand no maneja sincronización con el servidor.
- **Redux.** Descartado por excesivo para el alcance del proyecto.
- **Context API para estado UI compartido.** Descartado porque causa rerenders innecesarios y es más verboso que Zustand.

## Riesgos

- Que TanStack Query se use también para datos que solo se necesitan en Server Components (desperdicio de recursos).
- Que Zustand crezca y empiece a almacenar datos del servidor (violación de la separación).
- Que el cache optimista cause inconsistencias si la mutación falla y el rollback no se maneja correctamente.

## Preguntas abiertas

- ¿Debemos usar TanStack Query también para datos de Server Components que se renderizan en cliente? Decisión: no, Server Components deben obtener los datos directamente.
- ¿Necesitamos estado de "draft" persistente para Commits no terminados? Decisión inicial: no, usar Zustand temporal.

## Próximo documento

`docs/architecture/05-routing.md` — Estructura completa de rutas, layouts, route groups y navegación.
