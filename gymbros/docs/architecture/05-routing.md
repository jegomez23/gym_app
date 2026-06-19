# 05 — Routing

> **Propósito de este documento:** Definir la estructura completa de rutas de Gym Circle, incluyendo layouts, route groups, loading states, error boundaries, middleware de autenticación y navegación. Este documento asegura que la estructura de rutas refleje la arquitectura del dominio y la filosofía del producto.

---

## Principios de diseño de rutas

1. **Las rutas reflejan el dominio, no la interfaz.** Los nombres de ruta corresponden a conceptos del producto (/commit, /circle, /progress), no a acciones técnicas (/form, /list, /detail).
2. **La navegación debe ser predecible.** Un usuario debe poder intuir dónde está y cómo llegar a cualquier sección.
3. **Las rutas deben ser compartibles.** Toda ruta principal debe tener una URL única que pueda compartirse.
4. **Los layouts anidados reflejan la jerarquía del dominio.** El layout principal (navegación global) envuelve todas las rutas autenticadas. Layouts específicos envuelven sub-secciones.

---

## Estructura de rutas

```
/                              ← Landing / Login (público)
│
├── (auth)/                    ← Route group para autenticación (público)
│   ├── login                  ← Inicio de sesión
│   ├── register               ← Registro
│   ├── recovery               ← Recuperación de contraseña
│   └── callback               ← Callback de OAuth
│
├── (main)/                    ← Route group para app autenticada (requiere auth)
│   ├── layout.tsx             ← Layout principal con bottom navigation
│   ├── page.tsx               ← Dashboard / Hoy (raíz de la app)
│   │
│   ├── commit/                ← Feature: Commit
│   │   ├── page.tsx           ← Crear Commit (formulario rápido)
│   │   └── [id]/
│   │       └── page.tsx       ← Detalle de Commit individual
│   │
│   ├── circle/                ← Feature: Circle
│   │   ├── page.tsx           ← Dashboard del Circle (presencia)
│   │   ├── invite/
│   │   │   └── page.tsx       ← Invitar personas
│   │   └── [memberId]/
│   │       └── page.tsx       ← Perfil de miembro del Circle
│   │
│   ├── progress/              ← Feature: Progress
│   │   ├── page.tsx           ← Progreso general + Journey
│   │   └── journey/
│   │       └── page.tsx       ← Vista detallada del Journey
│   │
│   ├── reflections/           ← Feature: Reflection
│   │   └── page.tsx           ← Reflections personales
│   │
│   └── profile/               ← Feature: Profile
│   │   ├── page.tsx           ← Perfil del usuario
│   │   └── settings/
│   │       └── page.tsx       ← Configuración
│   │
│   └── ... (páginas futuras)
│
├── layout.tsx                 ← Layout raíz (fonts, metadata, providers globales)
├── not-found.tsx              ← Página 404 personalizada
├── error.tsx                  ← Error boundary global
└── loading.tsx                ← Loading state global
```

---

## Route Groups

### `(auth)/` — Grupo público

**Propósito:** Agrupar todas las rutas relacionadas con autenticación. Estas rutas son accesibles sin sesión.

**Layout:** Layout mínimo (sin navegación, sin footer de la app). Solo el formulario y el branding.

**Rutas:**
| Ruta | Propósito | Componente principal |
|------|-----------|---------------------|
| `/login` | Inicio de sesión | `LoginForm` |
| `/register` | Registro | `RegisterForm` |
| `/recovery` | Recuperación de contraseña | `RecoveryForm` |
| `/callback` | Callback OAuth | `OAuthCallback` (automático) |

### `(main)/` — Grupo autenticado

**Propósito:** Agrupar todas las rutas de la aplicación que requieren autenticación.

**Layout:** Layout principal con bottom navigation (5 secciones: Hoy, Circle, Progress, Reflections, Profile).

**Rutas:** Ver estructura arriba.

---

## Layouts

### Layout raíz (`app/layout.tsx`)

```tsx
// app/layout.tsx — Server Component
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          {" "}
          {/* TanStack Query */}
          <AuthProvider>
            {" "}
            {/* Sesión de Supabase */}
            <IdentityProvider>
              {" "}
              {/* Lenguaje de identidad contextual */}
              {children}
            </IdentityProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Responsabilidades:**

- Proveer TanStack QueryClient
- Proveer sesión de Supabase Auth
- Proveer lenguaje de identidad contextual (UX Writing)
- Cargar fuentes y metadata global

### Layout principal (`app/(main)/layout.tsx`)

```tsx
// app/(main)/layout.tsx — Server Component
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen">
      <AppShell>
        {" "}
        {/* Estructura base: header + main + bottom nav */}
        <BottomNavigation /> {/* Navegación inferior: 5 secciones */}
        <main>{children}</main>
      </AppShell>
    </div>
  );
}
```

**Responsabilidades:**

- Proveer la estructura visual principal (AppShell)
- Renderizar la navegación inferior (BottomNavigation)
- Renderizar el contenido de la ruta activa

---

## Loading States

### `loading.tsx` por segmento

Cada segmento de ruta debe tener su propio `loading.tsx` para mostrar un estado de carga mientras se renderizan los Server Components.

```
app/(main)/
├── loading.tsx           ← Loading global de la app (skeleton genérico)
├── commit/
│   ├── loading.tsx       ← Loading de la página de Commit
│   └── [id]/
│       └── loading.tsx   ← Loading del detalle de Commit
├── circle/
│   ├── loading.tsx       ← Loading del Dashboard del Circle
│   └── [memberId]/
│       └── loading.tsx   ← Loading del perfil del miembro
├── progress/
│   └── loading.tsx       ← Loading del progreso
├── reflections/
│   └── loading.tsx       ← Loading de reflections
└── profile/
    └── loading.tsx       ← Loading del perfil
```

### Diseño de loading states

Los loading states deben ser coherentes con la filosofía del producto: **calma, no ansiedad**.

- No usar spinners animados rápidamente. Usar skeletons suaves.
- No mostrar mensajes de "cargando...". Mostrar la estructura de la página vacía (skeleton).
- Las transiciones deben ser suaves (opacity fade).

---

## Error States

### `error.tsx` por segmento

Cada segmento debe tener su propio `error.tsx` para manejar errores de forma contextual.

```
app/(main)/
├── error.tsx              ← Error global de la app
├── commit/
│   ├── error.tsx          ← Error en Commit
│   └── [id]/
│       └── error.tsx      ← Error en detalle de Commit
├── circle/
│   ├── error.tsx          ← Error en Circle
│   └── [memberId]/
│       └── error.tsx      ← Error en perfil de miembro
├── progress/
│   └── error.tsx          ← Error en progreso
├── reflections/
│   └── error.tsx          ← Error en reflections
└── profile/
    └── error.tsx          ← Error en perfil
```

### Diseño de error states

- Mensaje claro y humano: "Algo no salió como esperábamos. Vuelve a intentarlo."
- Botón de "Reintentar" (que recarga el segmento).
- Sin tecnicismos. Sin códigos de error.
- Opción de volver al inicio.

---

## Middleware de autenticación

```tsx
// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  const supabase = createServerClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/(auth)");

  if (!session && !isAuthRoute) {
    // Redirigir al login si no hay sesión
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isAuthRoute) {
    // Redirigir al dashboard si ya hay sesión
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
```

**Reglas:**

- Si no hay sesión y la ruta no es pública → redirigir a `/login`.
- Si hay sesión y la ruta es de auth (`/login`, `/register`) → redirigir al dashboard (`/`).
- Las rutas públicas son solo las de `(auth)/`.
- Las rutas estáticas (`/images/*`, `/fonts/*`) no deben pasar por el middleware.

---

## Bottom Navigation

La navegación principal de la aplicación autenticada consta de 5 secciones en un bottom navigation:

| Ícono | Sección     | Ruta           | Propósito                                                     |
| ----- | ----------- | -------------- | ------------------------------------------------------------- |
| ○     | Hoy         | `/`            | Dashboard principal: estado del día, Commit rápido, presencia |
| ◎     | Circle      | `/circle`      | Presencia y actividad del Circle                              |
| ▸     | Progress    | `/progress`    | Journey, métricas de continuidad, patrones                    |
| ◇     | Reflections | `/reflections` | Insights personales                                           |
| ◉     | Perfil      | `/profile`     | Perfil, estadísticas, configuración                           |

**Reglas de navegación:**

- La sección activa se resalta visualmente.
- Todas las secciones están siempre visibles en el bottom navigation.
- No hay navegación anidada en el bottom nav (cada sección tiene su propia jerarquía interna).
- La navegación es inmediata (no hay transiciones lentas).

---

## Navegación secundaria y contextual

Además del bottom navigation, existe navegación secundaria:

**Navegación contextual:**

- Desde un Commit se puede ir a su Reflection asociada.
- Desde el Circle se puede ir al perfil de un miembro.
- Desde el perfil se puede ir a la configuración.
- Desde Progress se puede ir al detalle del Journey.

**Breadcrumbs conceptuales:**
No se muestran literalmente como breadcrumbs, pero la jerarquía debe ser clara:

- Circle → Miembro → (perfil del miembro)
- Commit → Detalle → (reflection asociada)

---

## Rutas futuras (post-MVP)

| Ruta             | Propósito                      | Feature        |
| ---------------- | ------------------------------ | -------------- |
| `/knowledge`     | Aprendizaje compartido         | knowledge/     |
| `/notifications` | Centro de notificaciones       | notifications/ |
| `/explore`       | Descubrir personas (si aplica) | future         |
| `/challenges`    | Retos compartidos              | future         |

---

## Decisiones tomadas

1. Route groups: `(auth)/` para público, `(main)/` para autenticado.
2. 5 secciones en bottom navigation: Hoy, Circle, Progress, Reflections, Perfil.
3. Cada segmento de ruta tiene su propio `loading.tsx` y `error.tsx`.
4. Middleware de autenticación con Supabase SSR.
5. Layout raíz con providers globales (Query, Auth, Identity).
6. Layout principal con AppShell + BottomNavigation.

## Alternativas descartadas

- **Sidebar navigation en lugar de bottom nav.** Descartado porque la aplicación es principalmente mobile-first. Bottom nav es más ergonómico en móvil.
- **Rutas planas sin route groups.** Descartado porque los route groups permiten layouts diferenciados para auth vs app.
- **Sin middleware de autenticación (protección por componente).** Descartado porque el middleware es más seguro (protege antes de renderizar).

## Riesgos

- Que las rutas crezcan y el bottom navigation tenga que expandirse (no hacerlo; mantener máximo 5 secciones).
- Que las rutas dinámicas (`[id]`, `[memberId]`) se vuelvan complejas de manejar. Mantener una convención clara.
- Que el middleware de auth afecte el rendimiento si no se configura correctamente.

## Preguntas abiertas

- ¿Debe haber una página de "onboarding" después del registro? ¿Ruta separada o flujo dentro del dashboard?
- ¿La landing page debe ser parte de la app o una web separada? Decisión inicial: separada (landing page marketing).
- ¿Debe haber rutas para "retos compartidos" en MVP? Decisión: no, es post-MVP.

## Próximo documento

`docs/architecture/06-authentication.md` — Sistema completo de autenticación: flujo, sesiones, protección de rutas, RLS y onboarding.
