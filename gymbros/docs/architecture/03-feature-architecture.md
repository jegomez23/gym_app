# 03 — Feature Architecture

> **Propósito de este documento:** Diseñar la arquitectura basada en features de Gym Circle. Cada feature del dominio tiene una estructura interna definida, responsabilidades claras y dependencias explícitas. Este documento asegura que cualquier desarrollador sepa exactamente cómo está organizado cada feature y por qué.

---

## Principios de la arquitectura de features

1. **Cada feature es autónoma.** Una feature no debe depender de otra feature. Si dos features comparten lógica, esa lógica se extrae a `lib/` o `components/shared/`.
2. **Cada feature refleja un concepto del dominio.** No creamos features técnicas (como "forms" o "modals"). Creamos features que corresponden a conceptos del producto: Commit, Circle, Progress, etc.
3. **Cada feature contiene todo lo que necesita para funcionar.** Componentes, hooks, acciones, esquemas, tipos y utilidades específicas viven dentro de la feature.
4. **Las features se implementan en orden de dependencias.** Auth primero (sin autenticación no hay app), luego Commit (raíz del sistema), luego Circle y Progress.

---

## Estructura interna de una feature

Cada feature sigue esta estructura:

```
features/[feature]/
├── components/     → Componentes React específicos de la feature
├── hooks/          → TanStack Query hooks (y hooks personalizados)
├── actions/        → Server Actions (mutaciones y consultas del lado servidor)
├── schemas/        → Zod schemas para validación
├── types/          → Tipos específicos de la feature
└── utils/          → Utilidades y funciones helper
```

**Regla:** No todas las subcarpetas son obligatorias. Si una feature no necesita actions (porque toda su lógica es de lectura), simplemente no existe esa carpeta.

---

## Mapa de features

```
features/
├── auth/              ← Feature transversal (necesaria para todo)
├── commit/            ← Core: raíz del sistema
├── circle/            ← Core: compañía en el proceso
├── progress/          ← Core: visibilidad del avance
├── profile/           ← Supporting: identidad del usuario
├── reflection/        ← Supporting: insight personal
├── knowledge/         ← Future: aprendizaje compartido
└── notifications/     ← Future: sistema de notificaciones
```

---

## Feature: Auth

**Propósito:** Gestionar autenticación, registro, inicio de sesión, recuperación de contraseña y protección de rutas.

**Dependencias:** Ninguna (es el punto de entrada al sistema).

**Template de estructura:**

```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── RecoveryForm.tsx
│   └── AuthGuard.tsx        ← Wrapper que protege rutas
├── hooks/
│   └── useAuth.ts           ← TanStack Query + Supabase Auth session
├── actions/
│   ├── login.ts
│   ├── register.ts
│   ├── logout.ts
│   └── recoverPassword.ts
├── schemas/
│   └── authSchema.ts        ← Zod: email, password, etc.
├── types/
│   └── index.ts             ← AuthResponse, LoginInput, etc.
└── utils/
    └── authUtils.ts         ← Helpers de sesión, redirects
```

**Responsabilidades:**

- Login/Register con email y OAuth (Google, GitHub)
- Manejo de sesión (Supabase Auth)
- Protección de rutas (middleware + AuthGuard)
- Recuperación de contraseña
- Redirección post-autenticación

**Lo que NO hace:**

- No gestiona perfiles de usuario (eso es profile/)
- No gestiona onboarding (eso es parte de la primera experiencia)

---

## Feature: Commit

**Propósito:** Gestionar la creación, visualización y gestión de Commits — la unidad atómica del sistema.

**Dependencias:** `auth/` (requiere usuario autenticado).

**Template de estructura:**

```
features/commit/
├── components/
│   ├── CommitForm.tsx           ← Formulario rápido de registro
│   ├── CommitCard.tsx           ← Visualización de un Commit individual
│   ├── CommitTimeline.tsx       ← Lista temporal de Commits
│   ├── CommitButton.tsx         ← Botón de acción rápida (flotante o fijo)
│   └── TodayDashboard.tsx       ← Dashboard principal del día
├── hooks/
│   ├── useCommits.ts            ← TanStack Query: lista paginada
│   ├── useCommit.ts             ← TanStack Query: commit individual
│   └── useCreateCommit.ts       ← TanStack Query: mutación con cache optimista
├── actions/
│   ├── createCommit.ts          ← Server Action: crear Commit
│   └── deleteCommit.ts          ← Server Action: eliminar Commit (con límite de tiempo)
├── schemas/
│   └── commitSchema.ts          ← Zod: validación de Commit
├── types/
│   └── index.ts                 ← Commit, CreateCommitInput, etc.
└── utils/
    └── commitUtils.ts           ← Formateo, validación, helpers
```

**Responsabilidades:**

- Registrar Commits en segundos (mínima fricción)
- Listar Commits con paginación
- Mostrar detalle de Commit individual
- Permitir visibilidad (privado, circle, público)
- Ser la fuente de datos para Progress, Journey, Presence

**Lo que NO hace:**

- No calcula métricas de progreso (eso es progress/)
- No gestiona el Circle (eso es circle/)
- No captura Reflections (eso es reflection/)

---

## Feature: Circle

**Propósito:** Gestionar las relaciones entre personas que comparten un proceso de mejora, la presencia compartida y la historia colectiva.

**Dependencias:** `auth/` (requiere usuario autenticado), `commit/` (la presencia se deriva de Commits).

**Template de estructura:**

```
features/circle/
├── components/
│   ├── CircleDashboard.tsx         ← Vista principal del Circle
│   ├── CircleMemberCard.tsx        ← Tarjeta de un miembro
│   ├── CirclePresencePulse.tsx     ← Indicador de presencia agregada
│   ├── CircleInviteForm.tsx        ← Formulario de invitación
│   ├── CircleSupportForm.tsx       ← Enviar apoyo a un miembro
│   └── CircleSharedHistory.tsx     ← Historia compartida con un miembro
├── hooks/
│   ├── useCircleMembers.ts         ← TanStack Query: miembros del Circle
│   ├── useCirclePresence.ts        ← TanStack Query: presencia
│   └── useCircleSharedHistory.ts   ← TanStack Query: historia compartida
├── actions/
│   ├── inviteToCircle.ts           ← Server Action: invitar
│   ├── acceptInvite.ts             ← Server Action: aceptar invitación
│   ├── removeFromCircle.ts         ← Server Action: remover
│   └── sendSupport.ts              ← Server Action: enviar apoyo
├── schemas/
│   └── circleSchema.ts             ← Zod: validación de invitación, apoyo
├── types/
│   └── index.ts                    ← CircleMember, CircleInvite, Support
└── utils/
    └── circleUtils.ts              ← Cálculo de shared history, presencia
```

**Responsabilidades:**

- Gestionar membresías bidireccionales
- Calcular y mostrar presencia del Circle
- Calcular y mostrar historia compartida
- Gestionar invitaciones
- Facilitar envío de apoyo entre miembros

**Lo que NO hace:**

- No es un chat (no hay mensajería instantánea)
- No es una red social (no hay feed, no hay publicaciones)
- No gestiona perfiles individuales (eso es profile/)

---

## Feature: Progress

**Propósito:** Calcular y visualizar las métricas de continuidad, el Journey (línea de tiempo narrativa) y los patrones del proceso.

**Dependencias:** `auth/`, `commit/` (las métricas se derivan de Commits).

**Template de estructura:**

```
features/progress/
├── components/
│   ├── ProgressHeader.tsx          ← Métrica principal + tiempo en proceso
│   ├── JourneyTimeline.tsx         ← Visualización orgánica del Journey
│   ├── WeeklyPulse.tsx             ← Indicador de ritmo semanal
│   └── PatternCard.tsx             ← Patrones detectados
├── hooks/
│   └── useProgress.ts              ← TanStack Query: métricas de progreso
├── actions/
│   └── getProgress.ts              ← Server Action: consulta de métricas
├── types/
│   └── index.ts                    ← ProgressMetrics, JourneyPoint, Pattern
└── utils/
    ├── continuity.ts               ← Cálculos de continuidad, frecuencia
    └── narrative.ts                 ← Generación de lenguaje narrativo
```

**Responsabilidades:**

- Calcular continuidad (días en proceso, frecuencia semanal)
- Generar datos para la visualización del Journey
- Detectar patrones (días fuertes, pausas, regresos)
- Generar lenguaje narrativo del progreso
- Proveer métricas al perfil y al dashboard

**Lo que NO hace:**

- No almacena progreso (se calcula de Commits en tiempo real)
- No compara progreso entre personas
- No establece objetivos o metas

---

## Feature: Profile

**Propósito:** Gestionar la identidad del usuario dentro del sistema: nombre, foto, estadísticas personales, configuración.

**Dependencias:** `auth/`.

**Template de estructura:**

```
features/profile/
├── components/
│   ├── ProfileHeader.tsx           ← Nombre, foto, métrica principal
│   ├── ProfileStats.tsx            ← Estadísticas del usuario
│   └── ProfileSettings.tsx         ← Configuración (privacidad, preferencias)
├── hooks/
│   └── useProfile.ts               ← TanStack Query: perfil del usuario
├── actions/
│   └── updateProfile.ts            ← Server Action: actualizar perfil
├── schemas/
│   └── profileSchema.ts            ← Zod: validación de perfil
├── types/
│   └── index.ts                    ← Profile, ProfileUpdate
└── utils/
    └── profileUtils.ts             ← Formateo, validación
```

**Responsabilidades:**

- Mostrar perfil del usuario
- Permitir edición de perfil (nombre, foto, biografía corta)
- Mostrar estadísticas personales (commits totales, tiempo en proceso)
- Gestionar configuración de privacidad (visibilidad por defecto)
- Gestionar preferencias de notificación

**Lo que NO hace:**

- No es un perfil público tipo red social
- No muestra comparaciones con otros
- No gestiona el Circle (eso es circle/)

---

## Feature: Reflection

**Propósito:** Capturar insights personales breves que emergen del proceso de mejora. Conectar la acción con el aprendizaje y la identidad.

**Dependencias:** `auth/`, `commit/` (opcional, puede asociarse a un Commit).

**Template de estructura:**

```
features/reflection/
├── components/
│   ├── ReflectionPrompt.tsx        ← Pregunta que invita a reflexionar
│   ├── ReflectionCard.tsx          ← Visualización de una Reflection
│   └── ReflectionTimeline.tsx      ← Lista temporal de Reflections
├── hooks/
│   └── useReflections.ts           ← TanStack Query: lista de Reflections
├── actions/
│   └── createReflection.ts         ← Server Action: crear Reflection
├── schemas/
│   └── reflectionSchema.ts         ← Zod: validación
├── types/
│   └── index.ts                    ← Reflection, CreateReflectionInput
└── utils/
    └── reflectionUtils.ts          ← Formateo, helpers
```

**Responsabilidades:**

- Sugerir momentos de reflexión (post-Commit, post-regreso, fin de semana)
- Capturar insights breves (máximo 300 caracteres)
- Asociar Reflections a Commits o momentos temporales
- Permitir visibilidad (privado, circle)

**Lo que NO hace:**

- No es un diario personal extenso
- No es obligatorio
- No se gamifica

---

## Feature: Knowledge (Future)

**Propósito:** Gestionar el aprendizaje compartido dentro del Circle. Contenido útil que emerge del proceso.

**Dependencias:** `auth/`, `circle/`.

**Estructura (cuando se implemente):**

```
features/knowledge/
├── components/
│   ├── SavedContentList.tsx
│   ├── SharedLearningCard.tsx
│   └── ShareLearningForm.tsx
├── hooks/
│   └── useKnowledge.ts
├── actions/
│   ├── saveContent.ts
│   └── shareLearning.ts
├── schemas/
│   └── knowledgeSchema.ts
├── types/
│   └── index.ts
└── utils/
    └── knowledgeUtils.ts
```

**Nota:** No implementar en MVP.

---

## Feature: Notifications (Future)

**Propósito:** Sistema de notificaciones diseñado bajo el principio de "tecnología sin adicción".

**Dependencias:** `auth/`, `circle/`, `commit/`.

**Estructura (cuando se implemente):**

```
features/notifications/
├── components/
│   ├── NotificationBell.tsx
│   └── NotificationList.tsx
├── hooks/
│   └── useNotifications.ts
├── actions/
│   └── markAsRead.ts
├── types/
│   └── index.ts
└── utils/
    └── notificationUtils.ts
```

**Nota:** No implementar en MVP. Requiere Supabase Realtime o Edge Functions.

---

## Reglas de comunicación entre features

```
auth/ ──────────────► commit/
  │                       │
  │                       ▼
  │                  progress/
  │                       │
  ├────────────────────► circle/
  │                       │
  │                       ▼
  │                  reflection/
  │
  └────► profile/
```

**Reglas:**

1. Las flechas indican dirección de dependencia. `commit/` depende de `auth/`, no al revés.
2. Ninguna feature importa directamente de otra feature. La comunicación ocurre a través de:
   - **Server Components:** Una página puede combinar datos de múltiples features.
   - **lib/:** Código compartido que varias features necesitan.
   - **TanStack Query:** Cada feature tiene sus propios hooks de consulta.
3. Si una feature necesita datos de otra, esos datos se obtienen a través de su propia capa de datos, no importando directamente de la otra feature.

---

## Decisiones tomadas

1. 7 features definidas: auth, commit, circle, progress, profile, reflection, knowledge.
2. knowledge/ y notifications/ son Future y no se implementan en MVP.
3. Cada feature tiene estructura homogénea (components, hooks, actions, schemas, types, utils).
4. Las features no se importan entre sí. La comunicación es a través de lib/ o páginas.
5. El orden de implementación es estricto: auth → commit → circle → progress → profile → reflection.

## Alternativas descartadas

- **Features planas (sin subcarpetas).** Descartado porque cuando una feature crece, es difícil navegar sin subcarpetas.
- **Todas las features en una carpeta components/ global.** Descartado porque viola el principio de autonomía de features.
- **Compartir tipos entre features a través de imports directos.** Descartado porque crea acoplamiento. Los tipos compartidos van a types/ global.

## Riesgos

- Que las features terminen importando de otras features por conveniencia. Esto debe detectarse en code review.
- Que la carpeta lib/ crezca demasiado al extraer código compartido. Monitorear y subdividir si es necesario.
- Que las features reflection/ y knowledge/ queden desiertas por no ser core.

## Preguntas abiertas

- ¿Debe haber una feature específica para onboarding o vive dentro de auth/?
- ¿Las notificaciones deben ser una feature separada o un hook transversal?
- ¿Debe profile/ incluir la configuración de privacidad global?

## Próximo documento

`docs/architecture/04-state-management.md` — Gestión completa del estado: cuándo usar React State, URL State, TanStack Query y Zustand.
