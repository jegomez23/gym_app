# 06 — Authentication

> **Propósito de este documento:** Diseñar el sistema completo de autenticación de Gym Circle. Este documento cubre el flujo de autenticación, manejo de sesiones, protección de rutas, integración con Supabase Auth, Row Level Security y la experiencia de onboarding post-registro.

---

## Stack de autenticación

| Componente                    | Tecnología                                                |
| ----------------------------- | --------------------------------------------------------- |
| Proveedor de Auth             | Supabase Auth                                             |
| Métodos de autenticación      | Email + contraseña, Google OAuth, GitHub OAuth            |
| Manejo de sesión              | Supabase SSR (server-side rendering)                      |
| Middleware de protección      | Next.js Middleware + Supabase SSR                         |
| Perfil de usuario             | Tabla `profiles` en PostgreSQL (vinculada a `auth.users`) |
| Autorización a nivel de datos | Row Level Security (RLS)                                  |

---

## Flujo de autenticación

### 1. Registro

```
Usuario → /register → RegisterForm → Server Action (register.ts)
                                           │
                                           ▼
                                    Supabase Auth
                                           │
                                           ▼
                                    Crear usuario en auth.users
                                           │
                                           ▼
                                    Trigger: crear perfil en profiles
                                           │
                                           ▼
                                    Iniciar sesión automáticamente
                                           │
                                           ▼
                                    Redirigir a / (dashboard)
                                           │
                                           ▼
                                    Mostrar flujo de onboarding
```

**Server Action de registro:**

```tsx
// features/auth/actions/register.ts
"use server";
import { createServerClient } from "@/lib/supabase/server";
import { authSchema } from "../schemas/authSchema";

export async function register(formData: FormData) {
  const validated = authSchema.parse(Object.fromEntries(formData));
  const supabase = createServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        name: validated.name,
      },
    },
  });

  if (error) return { error: error.message };

  // El trigger en PostgreSQL crea el perfil automáticamente
  return { data };
}
```

### 2. Inicio de sesión

```
Usuario → /login → LoginForm → Server Action (login.ts)
                                      │
                                      ▼
                               Supabase Auth
                                      │
                                      ▼
                               Validar credenciales
                                      │
                                      ▼
                               Crear sesión (cookie SSR)
                                      │
                                      ▼
                               Redirigir a / (dashboard)
```

**Server Action de login:**

```tsx
// features/auth/actions/login.ts
"use server";
import { createServerClient } from "@/lib/supabase/server";
import { authSchema } from "../schemas/authSchema";

export async function login(formData: FormData) {
  const validated = authSchema.parse(Object.fromEntries(formData));
  const supabase = createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (error) return { error: error.message };
  return { data };
}
```

### 3. Cierre de sesión

```tsx
// features/auth/actions/logout.ts
"use server";
import { createServerClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

### 4. OAuth (Google, GitHub)

```
Usuario → /login → Click "Continuar con Google"
                      │
                      ▼
               Server Action → Supabase Auth signInWithOAuth
                      │
                      ▼
               Redirigir a /callback después de OAuth
                      │
                      ▼
               /callback → Intercambiar código por sesión
                      │
                      ▼
               Redirigir a / (dashboard)
```

---

## Manejo de sesiones

### Middleware (`lib/supabase/middleware.ts`)

El middleware se ejecuta en cada petición y protege las rutas autenticadas.

```tsx
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const supabase = createServerClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/recovery");

  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/images") ||
    request.nextUrl.pathname === "/";

  if (!session && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Server Client (`lib/supabase/server.ts`)

Cliente de Supabase para Server Components y Server Actions. Usa cookies SSR.

```tsx
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.delete(name, options);
        },
      },
    }
  );
}
```

### Browser Client (`lib/supabase/client.ts`)

Cliente de Supabase para Client Components. No tiene acceso directo a cookies (las maneja el middleware).

```tsx
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Auth Provider (`providers/auth-provider.tsx`)

Provider que comparte la sesión con toda la aplicación.

```tsx
// providers/auth-provider.tsx
"use client";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export function AuthProvider({ children }) {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        router.refresh();
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
}
```

---

## Tabla de perfiles

Cuando un usuario se registra, un trigger en PostgreSQL crea automáticamente su perfil en la tabla `profiles`.

```sql
-- Tabla de perfiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  visibility_preference TEXT NOT NULL DEFAULT 'circle'
    CHECK (visibility_preference IN ('private', 'circle', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: crear perfil al registrarse
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## Row Level Security (RLS)

### Políticas por tabla

**Tabla `profiles`:**

```sql
-- Los perfiles son visibles para el propio usuario y su Circle
CREATE POLICY "profiles_visibility" ON profiles
  FOR SELECT
  USING (
    id = auth.uid()  -- Propio perfil
    OR EXISTS (       -- Miembros del Circle
      SELECT 1 FROM circle_memberships
      WHERE (user_id = auth.uid() AND circle_user_id = profiles.id)
      OR (circle_user_id = auth.uid() AND user_id = profiles.id)
    )
  );

-- Solo el propio usuario puede editar su perfil
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

**Tabla `commits`:**

```sql
-- Commits visibles según su nivel de visibilidad
CREATE POLICY "commits_select" ON commits
  FOR SELECT
  USING (
    user_id = auth.uid()  -- Propios Commits
    OR (
      visibility = 'circle'
      AND EXISTS (        -- Miembros del Circle
        SELECT 1 FROM circle_memberships
        WHERE user_id = commits.user_id
        AND circle_user_id = auth.uid()
      )
    )
    OR visibility = 'public'  -- Commits públicos
  );

-- Solo el propietario puede crear/editar/eliminar
CREATE POLICY "commits_insert" ON commits
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "commits_delete" ON commits
  FOR DELETE
  USING (user_id = auth.uid());
```

**Tabla `circle_memberships`:**

```sql
-- Solo ves tus propias membresías
CREATE POLICY "memberships_select" ON circle_memberships
  FOR SELECT
  USING (user_id = auth.uid() OR circle_user_id = auth.uid());

-- Solo puedes crear membresías donde tú eres user_id
CREATE POLICY "memberships_insert" ON circle_memberships
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

---

## Onboarding post-registro

Después del registro, el usuario pasa por un breve flujo de onboarding (no más de 3 pasos):

### Paso 1: Nombre y foto

- Si el registro fue con email, se pide nombre.
- Si fue con OAuth, se usa el nombre del proveedor.
- Opcional: foto de perfil.

### Paso 2: Primer Commit

- Se invita al usuario a hacer su primer Commit.
- No como obligación, como bienvenida: "Este es tu primer paso."
- El Commit se registra con un título especial ("Primer Commit") que marca el inicio del Journey.

### Paso 3: Circle

- Se pregunta si conoce a alguien que ya esté en Gym Circle.
- Se muestra opción de invitar por email o compartir enlace.
- Se explica brevemente qué es el Circle.

### Estado de onboarding

El estado del onboarding se almacena en la tabla `profiles`:

```sql
ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
```

Si `onboarding_completed = FALSE`, la aplicación redirige al flujo de onboarding en lugar del dashboard.

---

## Protección de rutas en componentes

Además del middleware, se usa un componente `AuthGuard` para proteger contenido renderizado:

```tsx
// features/auth/components/AuthGuard.tsx
"use client";
import { useAuth } from "../hooks/useAuth";

export function AuthGuard({ children }) {
  const { session, isLoading } = useAuth();

  if (isLoading) return <LoadingState />;
  if (!session) return null; // El middleware redirige antes de llegar aquí

  return children;
}
```

---

## Decisiones tomadas

1. Supabase Auth como único proveedor de autenticación.
2. Email + contraseña + OAuth (Google, GitHub).
3. Manejo de sesión con Supabase SSR (cookies).
4. Middleware de Next.js para protección de rutas.
5. Trigger PostgreSQL para crear perfil automáticamente al registrarse.
6. RLS como capa de autorización a nivel de base de datos.
7. Onboarding de 3 pasos post-registro (nombre, primer Commit, Circle).
8. AuthGuard como capa adicional de protección en componentes.

## Alternativas descartadas

- **Auth0 / Clerk.** Descartado porque Supabase Auth es suficiente y está integrado con Supabase (base de datos, RLS, Storage).
- **JWT manual.** Descartado porque Supabase maneja sesiones JWT automáticamente.
- **Onboarding largo (>3 pasos).** Descartado porque aumenta la fricción inicial. El onboarding debe ser mínimo.
- **Onboarding obligatorio sin skip.** Descartado porque algunas personas quieren explorar antes de comprometerse.

## Riesgos

- Si el trigger de creación de perfil falla, el usuario se queda sin perfil pero con sesión activa. Implementar retry o fallback.
- OAuth puede fallar si la configuración del proveedor (Google, GitHub) no está correcta en Supabase.
- El middleware de auth puede afectar el rendimiento si se ejecuta en cada petición. Optimizar con `matcher`.

## Preguntas abiertas

- ¿Debe permitirse el registro solo con OAuth (sin email/contraseña)? Decisión inicial: ambos.
- ¿Debe haber verificación de email? Decisión inicial: opcional (confirm_email = false en MVP, true después).
- ¿El onboarding debe ser saltable completamente? Decisión inicial: sí, con un botón "Explorar primero."

## Próximo documento

`docs/architecture/07-data-flow.md` — Cómo viajan los datos desde Supabase hasta la UI: repositorios, Server Actions, TanStack Query, componentes.
