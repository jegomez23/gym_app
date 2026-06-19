# 04 — Error Handling

> **Propósito de este documento:** Definir cómo gestionamos los errores en Gym Circle. Frontend, backend, Server Actions, Supabase, validaciones, errores de usuario y errores del sistema. Sin ambigüedad.

---

## Filosofía

1. **Los errores no se ocultan.** Si algo falla, debe ser visible para quien pueda resolverlo.
2. **El usuario nunca debe ver un error técnico.** Mensajes claros, humanos, sin códigos de error.
3. **Cada capa maneja sus propios errores.** Server Action captura errores de Supabase. El cliente captura errores de Server Action. La UI muestra errores al usuario.
4. **Los errores se registran.** Error inesperado → log. Error esperado → respuesta controlada.

---

## Categorías de error

| Categoría              | Ejemplos                         | ¿Visible al usuario?  |
| ---------------------- | -------------------------------- | --------------------- |
| Error de validación    | Campo incorrecto, email inválido | Sí (en el campo)      |
| Error de autenticación | Sesión expirada, no autorizado   | Sí (mensaje claro)    |
| Error de negocio       | No puedes invitarte a ti mismo   | Sí (mensaje claro)    |
| Error de base de datos | Timeout, conexión fallida        | No ("Algo salió mal") |
| Error inesperado       | Bug, excepción no capturada      | No ("Algo salió mal") |

---

## Server Actions

### Patrón único

Toda Server Action sigue este patrón:

```tsx
"use server";

import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCommit(input: FormData) {
  try {
    // 1. Validar
    const validated = commitSchema.parse(Object.fromEntries(input));

    // 2. Autenticar
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "No autenticado" };
    }

    // 3. Ejecutar
    const { data, error } = await supabase
      .from("commits")
      .insert({ ...validated, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("[createCommit] Supabase error:", error);
      return { error: "No se pudo crear el Commit. Intenta de nuevo." };
    }

    // 4. Revalidar
    revalidatePath("/");

    // 5. Responder
    return { data };
  } catch (err) {
    // 6. Error inesperado
    if (err instanceof z.ZodError) {
      return { error: "Datos inválidos", fields: err.errors };
    }

    console.error("[createCommit] Unexpected error:", err);
    return { error: "Algo salió mal. Intenta de nuevo." };
  }
}
```

### Reglas

1. **`try/catch` siempre.** No hay Server Action sin try/catch.
2. **Errores de Zod se devuelven como `{ error, fields }`.** El formulario usa `fields` para marcar campos específicos.
3. **Errores de Supabase se registran en consola.** `console.error("[feature/action] message:", error)`.
4. **Errores inesperados se registran y devuelven mensaje genérico.** Nunca expongas el error real al usuario.
5. **Siempre `return { data, error }`.** Nunca `throw` desde una Server Action (Next.js lo maneja como error 500).

---

## Client Components (TanStack Query)

### Errores de consulta

```tsx
function CommitList() {
  const { data, error, isLoading } = useCommits(userId);

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <ErrorState
        message="No pudimos cargar tus Commits"
        action={{ label: "Reintentar", onClick: () => refetch() }}
      />
    );
  }

  return <CommitTimeline commits={data} />;
}
```

### Errores de mutación

```tsx
function CommitForm() {
  const mutation = useCreateCommit();

  const onSubmit = async (data: CreateCommitInput) => {
    try {
      await mutation.mutateAsync(data);
      // Éxito: el formulario se resetea
    } catch (err) {
      // La mutación maneja el error internamente
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {mutation.isError && (
        <Alert variant="error">
          {mutation.error?.message || "Error al crear Commit"}
        </Alert>
      )}
      {/* ...campos... */}
    </form>
  );
}
```

---

## Formularios (React Hook Form + Zod)

### Errores por campo

```tsx
function CommitForm() {
  const form = useForm({
    resolver: zodResolver(commitSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Field label="Título">
        <Input {...form.register("title")} />
        {form.formState.errors.title && (
          <FieldError message={form.formState.errors.title.message} />
        )}
      </Field>
    </form>
  );
}
```

### Errores generales del formulario

```tsx
{
  form.formState.errors.root && (
    <Alert variant="error">{form.formState.errors.root.message}</Alert>
  );
}
```

---

## Errores de autenticación

### Middleware

El middleware redirige al login sin mensaje de error (es esperado).

```tsx
if (!session && !isAuthRoute) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

### AuthGuard

```tsx
function AuthGuard({ children }) {
  const { session, isLoading } = useAuth();

  if (isLoading) return <LoadingState />;
  if (!session) return null; // El middleware redirige

  return children;
}
```

### Errores de login

```tsx
const result = await login(formData);
if (result.error) {
  // Mostrar error específico
  if (result.error === "Invalid login credentials") {
    return { error: "Email o contraseña incorrectos" };
  }
  return { error: "Error al iniciar sesión. Intenta de nuevo." };
}
```

---

## Errores de base de datos (Supabase)

### Timeout

```tsx
const { data, error } = await supabase
  .from("commits")
  .select("*")
  .timeout(10000); // 10 segundos máximo

if (error?.code === "TIMEOUT") {
  return { error: "La consulta tardó demasiado. Intenta de nuevo." };
}
```

### Conflictos (duplicados)

```tsx
if (error?.code === "23505") {
  // unique_violation
  return { error: "Ya existe un Commit con ese título hoy." };
}
```

### No encontrado

```tsx
if (error?.code === "PGRST116") {
  // no rows returned
  return { error: "No encontramos lo que buscas." };
}
```

---

## Errores globales (Error Boundaries)

### `error.tsx` por segmento

```tsx
// app/(main)/error.tsx
"use client";

export default function MainError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2>Algo no salió como esperábamos</h2>
      <p className="text-secondary-text">
        No te preocupes, puedes intentarlo de nuevo.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
```

### `global-error.tsx`

```tsx
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1>Error crítico</h1>
            <p>Recarga la página para continuar.</p>
            <Button onClick={() => window.location.reload()}>Recargar</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

## Logging

| Tipo                        | Método                                        | ¿Dónde?            |
| --------------------------- | --------------------------------------------- | ------------------ |
| Error esperado (validación) | No log                                        | -                  |
| Error de Supabase           | `console.error("[feature] error:", err)`      | Servidor           |
| Error inesperado            | `console.error("[feature] unexpected:", err)` | Servidor           |
| Error de autenticación      | `console.warn("[auth] failed login:", email)` | Servidor           |
| Error de cliente            | `console.error("[component] error:", err)`    | Cliente (dev only) |

**Regla:** No hacer `console.log` en producción. Solo `console.error` para errores. Los logs de desarrollo se eliminan antes del deploy.

---

## Resumen de patrones

| Situación             | Patrón                                    |
| --------------------- | ----------------------------------------- |
| Server Action         | `try/catch` → `{ data, error }`           |
| Validación Zod        | `{ error, fields }` para el formulario    |
| TanStack Query error  | Mostrar `ErrorState` con botón reintentar |
| Mutación error        | `Alert` en el formulario                  |
| Error 404             | `not-found.tsx`                           |
| Error 500             | `error.tsx` con `reset()`                 |
| Error global          | `global-error.tsx` con recargar           |
| Autenticación fallida | Redirigir a login                         |
| Supabase error        | Log + mensaje genérico al usuario         |

## Próximo documento

`docs/engineering/05-security-checklist.md` — Checklist completa de seguridad antes del primer commit.
