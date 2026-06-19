# 01 — Folder Structure

> **Propósito de este documento:** Definir la estructura completa del repositorio de Gym Circle. Cada carpeta debe tener un propósito claro, reglas sobre qué puede contener y qué nunca debería contener, ejemplos y dependencias permitidas. El objetivo es que cualquier desarrollador pueda encontrar dónde va cualquier archivo sin dudar.

---

## Principios de organización

1. **Feature-based first, type-based second.** El código se organiza primero por feature (commit, circle, progress), luego por tipo (components, hooks, actions). Esto facilita la navegación y el aislamiento.
2. **Colocación explícita.** Cada carpeta tiene un propósito definido. Si un archivo no encaja claramente en una carpeta, es señal de que la abstracción es incorrecta.
3. **Sin barrels forzados.** Los barrel files (`index.ts`) solo se crean cuando hay beneficio real (re-exportar múltiples componentes de una feature). No se crean por defecto.
4. **Progresión de madurez.** Las carpetas `features/` contienen código más específico del dominio. Las carpetas `lib/` contienen código genérico y reutilizable. `app/` contiene solo el enrutamiento y layouts.

---

## Estructura completa

```
gym-circle/
│
├── app/                          # Next.js App Router — solo enrutamiento y layouts
│   ├── (auth)/                   # Route group para autenticación
│   │   ├── login/
│   │   ├── register/
│   │   └── recovery/
│   │
│   ├── (main)/                   # Route group para app autenticada (layout compartido)
│   │   ├── layout.tsx            # Layout principal con navegación
│   │   ├── page.tsx              # Dashboard / Hoy
│   │   ├── commit/
│   │   │   ├── page.tsx          # Crear Commit (cliente)
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Detalle de Commit (servidor)
│   │   ├── circle/
│   │   │   ├── page.tsx          # Dashboard del Circle
│   │   │   └── [memberId]/
│   │   │       └── page.tsx      # Perfil de miembro del Circle
│   │   ├── progress/
│   │   │   └── page.tsx          # Progreso y Journey
│   │   ├── profile/
│   │   │   ├── page.tsx          # Perfil propio
│   │   │   └── settings/
│   │   │       └── page.tsx      # Configuración
│   │   └── reflections/
│   │       └── page.tsx          # Reflections (diario personal)
│   │
│   ├── layout.tsx                # Layout raíz (fonts, metadata, providers)
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   └── globals.css               # Estilos globales, variables CSS
│
├── components/                   # Componentes compartidos (no de feature)
│   ├── ui/                       # Componentes base del sistema de diseño
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   └── ...                   # Componentes generados por shadcn/ui
│   │
│   └── shared/                   # Componentes compartidos entre features
│       ├── LoadingState.tsx
│       ├── EmptyState.tsx        # Estados vacíos con diseño filosófico
│       ├── ErrorBoundary.tsx
│       └── VisibilityBadge.tsx   # Indicador 🔒 👥 🌍
│
├── features/                     # Código organizado por feature de dominio
│   ├── commit/
│   │   ├── components/
│   │   │   ├── CommitForm.tsx        # Formulario rápido de Commit
│   │   │   ├── CommitCard.tsx        # Visualización de un Commit
│   │   │   ├── CommitTimeline.tsx    # Timeline de Commits
│   │   │   └── CommitButton.tsx      # Botón flotante rápido
│   │   ├── hooks/
│   │   │   ├── useCommits.ts         # TanStack Query: lista de Commits
│   │   │   └── useCreateCommit.ts    # TanStack Query: mutación
│   │   ├── actions/
│   │   │   └── createCommit.ts       # Server Action
│   │   ├── schemas/
│   │   │   └── commitSchema.ts       # Zod schemas
│   │   ├── types/
│   │   │   └── index.ts             # Tipos específicos del Commit
│   │   └── utils/
│   │       └── commitUtils.ts       # Utilidades (format, validation, etc.)
│   │
│   ├── circle/
│   │   ├── components/
│   │   │   ├── CircleDashboard.tsx
│   │   │   ├── CircleMemberCard.tsx
│   │   │   ├── CirclePresencePulse.tsx
│   │   │   ├── CircleInviteForm.tsx
│   │   │   └── CircleSupportForm.tsx
│   │   ├── hooks/
│   │   │   ├── useCirclePresence.ts
│   │   │   ├── useCircleMembers.ts
│   │   │   └── useCircleSharedHistory.ts
│   │   ├── actions/
│   │   │   ├── inviteToCircle.ts
│   │   │   ├── acceptInvite.ts
│   │   │   └── sendSupport.ts
│   │   ├── schemas/
│   │   │   └── circleSchema.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── circleUtils.ts
│   │
│   ├── progress/
│   │   ├── components/
│   │   │   ├── ProgressHeader.tsx
│   │   │   ├── JourneyTimeline.tsx
│   │   │   ├── WeeklyPulse.tsx
│   │   │   └── PatternCard.tsx
│   │   ├── hooks/
│   │   │   └── useProgress.ts
│   │   ├── actions/
│   │   │   └── getProgress.ts        # Server Action de lectura
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── continuity.ts         # Cálculos de continuidad
│   │       └── narrative.ts          # Generación de narrativa Journey
│   │
│   ├── profile/
│   │   ├── components/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileStats.tsx
│   │   │   └── ProfileSettings.tsx
│   │   ├── hooks/
│   │   │   └── useProfile.ts
│   │   ├── actions/
│   │   │   └── updateProfile.ts
│   │   ├── schemas/
│   │   │   └── profileSchema.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── profileUtils.ts
│   │
│   ├── reflection/
│   │   ├── components/
│   │   │   ├── ReflectionPrompt.tsx
│   │   │   ├── ReflectionCard.tsx
│   │   │   └── ReflectionTimeline.tsx
│   │   ├── hooks/
│   │   │   └── useReflections.ts
│   │   ├── actions/
│   │   │   └── createReflection.ts
│   │   ├── schemas/
│   │   │   └── reflectionSchema.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── reflectionUtils.ts
│   │
│   ├── knowledge/                   # Future: puede no existir en MVP
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── auth/                        # Feature transversal de autenticación
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── RegisterForm.tsx
│       │   └── AuthGuard.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── actions/
│       │   ├── login.ts
│       │   ├── register.ts
│       │   └── logout.ts
│       ├── schemas/
│       │   └── authSchema.ts
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           └── authUtils.ts
│
├── lib/                             # Código genérico, reutilizable, sin dependencia de feature
│   ├── supabase/
│   │   ├── client.ts                 # Cliente Supabase para el navegador
│   │   ├── server.ts                 # Cliente Supabase para Server Components/Server Actions
│   │   ├── admin.ts                  # Cliente con service_role (solo para operaciones admin seguras)
│   │   └── middleware.ts             # Middleware de Auth
│   │
│   ├── utils/
│   │   ├── cn.ts                     # clsx + tailwind-merge (shadcn utility)
│   │   ├── date.ts                   # Formateo de fechas
│   │   ├── momentum.ts               # Cálculo del estado Momentum
│   │   ├── continuity.ts             # Cálculo de continuidad
│   │   ├── identity.ts               # Funciones de refuerzo de identidad (lenguaje)
│   │   └── visibility.ts             # Lógica de visibilidad (público/circle/privado)
│   │
│   ├── validators/
│   │   └── index.ts                  # Validaciones reutilizables (Zod)
│   │
│   └── constants/
│       ├── index.ts                  # Constantes globales
│       ├── commitment-types.ts       # Tipos de Commit sugeridos
│       ├── support-messages.ts       # Mensajes de apoyo predefinidos
│       └── identity-language.ts      # Catálogo de lenguaje de refuerzo de identidad
│
├── hooks/                            # Hooks genéricos (no específicos de feature)
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   ├── useScrollRestoration.ts
│   └── useVisibility.ts              # Hook para manejar visibilidad de contenido
│
├── providers/                        # Providers de React (Context, QueryClient, etc.)
│   ├── query-provider.tsx            # TanStack Query Provider
│   ├── auth-provider.tsx             # Auth Provider (sesión)
│   ├── theme-provider.tsx            # Tema (si aplica)
│   └── identity-provider.tsx         # Proveedor de lenguaje de identidad contextual
│
├── stores/                           # Zustand stores (solo estado UI efímero)
│   ├── ui-store.ts                   # Estado de UI global (modales, sidebar, etc.)
│   └── commit-form-store.ts          # Estado del formulario de Commit (no enviado aún)
│
├── types/                            # Tipos globales compartidos
│   ├── index.ts
│   ├── commit.ts                     # Tipos del dominio Commit
│   ├── circle.ts                     # Tipos del dominio Circle
│   ├── user.ts                       # Tipos del dominio User
│   ├── progress.ts                   # Tipos del dominio Progress
│   └── reflection.ts                 # Tipos del dominio Reflection
│
├── config/                           # Configuración del proyecto
│   ├── site.ts                       # Metadatos del sitio (nombre, descripción, URL)
│   ├── navigation.ts                 # Configuración de navegación (items, orden)
│   └── features.ts                   # Feature flags (MVP, V2, experimental)
│
├── styles/                           # Estilos globales y tokens
│   └── tokens.ts                     # Tokens de diseño (opcional, si Tailwind no cubre algo)
│
├── public/                           # Archivos estáticos
│   ├── images/
│   ├── fonts/                        # Fuentes locales (si aplica)
│   └── icons/                        # Favicons, OG images
│
├── supabase/                         # Configuración de Supabase
│   ├── migrations/                   # Migraciones SQL
│   ├── seed.sql                      # Datos de prueba
│   ├── policies/                     # Políticas RLS (organizadas por tabla)
│   │   ├── commits.sql
│   │   ├── circle_memberships.sql
│   │   └── reflections.sql
│   └── functions/                    # Funciones SQL (PostgreSQL functions)
│       ├── get_continuity.sql
│       └── get_journey_timeline.sql
│
├── tests/                            # Tests
│   ├── unit/
│   │   ├── lib/
│   │   ├── features/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       ├── commit.spec.ts
│       ├── circle.spec.ts
│       └── auth.spec.ts
│
├── docs/                             # Documentación del proyecto (ya creada)
│   ├── 00-observations.md
│   ├── ...
│
├── .env.example                      # Variables de entorno de ejemplo
├── .env.local                        # Variables de entorno locales (gitignored)
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## Propósito y reglas por carpeta

### `app/` — Solo enrutamiento y layouts

**Propósito:** Contener únicamente los archivos que Next.js App Router necesita para definir rutas, layouts, loading states y error boundaries.

**Qué puede contener:**

- `page.tsx` — La página de cada ruta (debe ser mínima, delegar en features)
- `layout.tsx` — Layouts de cada segmento
- `loading.tsx` — Estados de carga
- `error.tsx` — Estados de error
- `not-found.tsx` — 404

**Qué nunca debería contener:**

- Lógica de negocio
- Lógica de acceso a datos compleja
- Componentes grandes o específicos de feature (deben vivir en `features/`)

**Ejemplo de page.tsx bien diseñada:**

```tsx
// app/(main)/page.tsx
import { TodayDashboard } from "@/features/commit/components/TodayDashboard";

export default function HomePage() {
  return <TodayDashboard />;
}
```

---

### `components/` — Componentes compartidos

**Propósito:** Contener componentes que no pertenecen a una feature específica y pueden reutilizarse en múltiples features.

**Subcarpetas:**

- `ui/` — Componentes base del sistema de diseño (shadcn/ui personalizados)
- `shared/` — Componentes compartidos entre features (EmptyState, LoadingState, etc.)

**Qué nunca debería contener:**

- Componentes específicos de una feature (deben vivir en `features/[feature]/components/`)
- Lógica de negocio

---

### `features/` — Código organizado por feature de dominio

**Propósito:** Contener todo el código específico de cada feature del dominio Gym Circle.

**Estructura interna de cada feature:**

```
features/[feature]/
├── components/     → Componentes React específicos de la feature
├── hooks/          → TanStack Query hooks (useCommits, useCircle, etc.)
├── actions/        → Server Actions (mutaciones)
├── schemas/        → Zod schemas para validación
├── types/          → Tipos específicos de la feature (si no están en types/ global)
└── utils/          → Utilidades específicas de la feature
```

**Reglas:**

- Una feature NO debe importar directamente de otra feature. Si necesita compartir código, debe extraerse a `lib/` o `components/shared/`.
- Las features pueden importar de `lib/`, `components/`, `hooks/`, `types/`, `config/`.
- Cada feature debe ser autónoma: si mañana eliminamos la feature `reflection/`, el resto del proyecto no debe romperse.

**Features en orden de implementación:**

1. `auth/` — Necesario primero (sin auth no hay app)
2. `commit/` — Core del producto
3. `circle/` — Core, depende de tener usuarios
4. `progress/` — Core, depende de Commits
5. `profile/` — Supporting
6. `reflection/` — Supporting (MVP+)
7. `knowledge/` — Future (no implementar en MVP)

---

### `lib/` — Código genérico reutilizable

**Propósito:** Contener código que no pertenece a ninguna feature específica y puede ser usado por cualquier parte del proyecto.

**Subcarpetas:**

- `lib/supabase/` — Clientes de Supabase (browser, server, admin) y middleware
- `lib/utils/` — Funciones de utilidad genéricas
- `lib/validators/` — Validaciones reutilizables con Zod
- `lib/constants/` — Constantes globales, catálogos de lenguaje

**Reglas:**

- El código en `lib/` NO debe importar de `features/`, `components/`, `stores/`
- El código en `lib/` debe ser puro o depender solo de librerías externas

---

### `hooks/` — Hooks genéricos

**Propósito:** Hooks de React que no están ligados a una feature específica.

**Qué puede contener:**

- `useMediaQuery` — Responsive design
- `useDebounce` — Debounce para inputs
- `useScrollRestoration` — Restaurar scroll

**Qué nunca debería contener:**

- Hooks específicos de dominio (useCommits, useCircle — deben vivir en `features/[feature]/hooks/`)

---

### `providers/` — React Providers

**Propósito:** Proveedores de contexto de React que envuelven la aplicación.

**Qué puede contener:**

- `query-provider.tsx` — TanStack QueryClient
- `auth-provider.tsx` — Sesión de Supabase Auth
- `identity-provider.tsx` — Lenguaje de identidad contextual

---

### `stores/` — Zustand stores

**Propósito:** Estado UI efímero compartido entre componentes.

**Qué puede contener:**

- Estado de UI global (modal activo, sidebar, onboarding step)
- Estado de formularios no enviados (commit form draft)

**Qué nunca debería contener:**

- Datos del servidor (deben ir en TanStack Query)
- Estado que requiera persistencia o consistencia entre usuarios

---

### `types/` — Tipos globales

**Propósito:** Definiciones de tipos TypeScript compartidas entre features.

**Reglas:**

- Los tipos específicos de una feature pueden vivir en `features/[feature]/types/` en lugar de aquí
- `types/` es para tipos que necesitan dos o más features

---

### `config/` — Configuración del proyecto

**Propósito:** Configuración centralizada del proyecto.

**Qué puede contener:**

- Metadatos del sitio (nombre, descripción, URL)
- Configuración de navegación (ítems del menú, orden)
- Feature flags (qué está activo en MVP vs V2)

---

### `supabase/` — Configuración de base de datos

**Propósito:** Todo lo relacionado con la base de datos Supabase.

**Subcarpetas:**

- `migrations/` — Migraciones SQL versionadas
- `policies/` — Políticas RLS organizadas por tabla
- `functions/` — Funciones PostgreSQL (get_continuity, get_journey, etc.)

**Reglas:**

- Las migraciones deben ser idempotentes: `CREATE OR REPLACE`, `IF NOT EXISTS`
- Cada política RLS debe tener un comentario explicando qué protege y por qué

---

### `tests/` — Tests

**Propósito:** Tests unitarios, de integración y end-to-end.

**Subcarpetas:**

- `unit/` — Tests unitarios con Vitest
- `integration/` — Tests de integración
- `e2e/` — Tests end-to-end con Playwright

---

## Dependencias permitidas entre capas

```
app/ → features/ (pages importan componentes de features)
app/ → components/ (layouts pueden usar UI components)
app/ → lib/ (para metadata, config)

features/ → lib/ ✓
features/ → components/ ✓ (solo ui y shared)
features/ → hooks/ ✓
features/ → types/ ✓
features/ → config/ ✓
features/ → providers/ ✓
features/ → stores/ ✓ (solo estado UI)
features/ → features/ ✗ (una feature no importa de otra)

lib/ → lib/ ✓
lib/ → (nada de features, components, stores) ✗

hooks/ → lib/ ✓
hooks/ → (nada de features) ✗

providers/ → lib/ ✓
providers/ → hooks/ (ocasionalmente)

stores/ → lib/ ✓
stores/ → types/ ✓
stores/ → features/ ✗
```

---

## Decisiones tomadas

1. **Feature-based sobre type-based.** El código se organiza primero por feature, luego por tipo. Esto es mejor para escalar porque cada feature es autónoma.
2. **Sin barrel files forzados.** Solo se crean cuando hay beneficio real (re-exportar múltiples componentes).
3. **Server Actions en lugar de API Routes.** Las mutaciones viven en `features/[feature]/actions/` como Server Actions. Esto reduce la complejidad.
4. **Tipos pueden vivir en dos lugares.** Tipos globales en `types/`, tipos específicos de feature en `features/[feature]/types/`.
5. **Stores mínimos.** Solo Zustand para estado UI efímero. TanStack Query para datos del servidor.

## Alternativas descartadas

- **Organización type-based (components/, hooks/, actions/ todo junto).** Descartado porque cuando el proyecto crece, es difícil encontrar qué archivos pertenecen a qué feature.
- **Colocar todo en app/.** Descartado porque `app/` debe ser solo enrutamiento. Mezclar lógica de negocio con rutas dificulta el mantenimiento.
- **Monolito de tipos.** Descartado porque tener todos los tipos en un solo lugar crea dependencias innecesarias entre features no relacionadas.

## Riesgos

- Que las features terminen importando de otras features a través de atajos. La disciplina de no importar entre features debe reforzarse en code review.
- Que la carpeta `features/` crezca demasiado. Si una feature tiene más de 10 archivos, probablemente deba subdividirse.
- Que la carpeta `lib/` se convierta en un cajón de sastre. Cada archivo en `lib/` debe tener un propósito claro.

## Preguntas abiertas

- ¿Deberíamos usar `src/` directory? (Algunos proyectos Next.js ponen todo dentro de `src/`). Decisión inicial: no, a menos que sea necesario para organización.
- ¿Los tests deben vivir junto al archivo que prueban o en `tests/` separado? Decisión inicial: en `tests/` separado por feature.

## Próximo documento

`docs/architecture/02-development-rules.md` — Reglas de desarrollo: Server vs Client Components, Server Actions, TanStack Query, Zustand, convenciones de nombres, manejo de errores.
