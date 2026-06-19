# 08 — Coding Roadmap

> **Propósito de este documento:** Definir el orden exacto de implementación del proyecto Gym Circle. Cada sprint está diseñado para minimizar retrabajo, respetar dependencias entre features y entregar valor incremental. Este roadmap cubre desde el primer commit hasta el MVP funcional.

---

## Principios del roadmap

1. **Cada sprint produce algo funcional.** No hay sprints de "solo configuración." Incluso el Sprint 1 debe terminar con una página visible.
2. **Las dependencias determinan el orden.** Auth antes que Commit. Commit antes que Progress. Circle antes que Presence.
3. **No hay deuda técnica deliberada.** Cada sprint debe dejar el código en un estado que permita continuar sin reescribir.
4. **El MVP es la mínima versión filosóficamente correcta.** No la mínima versión técnicamente posible.

---

## Resumen de sprints

| Sprint | Duración | Entrega                                     |
| ------ | -------- | ------------------------------------------- |
| 0      | 1 día    | Inicialización del proyecto + configuración |
| 1      | 3 días   | Auth + Layout + Landing                     |
| 2      | 4 días   | Commit (raíz del sistema)                   |
| 3      | 4 días   | Circle (compañía en el proceso)             |
| 4      | 3 días   | Progress + Journey (visibilidad del avance) |
| 5      | 3 días   | Profile + Reflections                       |
| 6      | 2 días   | Presence + Realtime                         |
| 7      | 3 días   | UX Writing + Identity Language + Pulido     |
| 8      | 2 días   | Testing + Deploy                            |

**Total estimado:** 25 días hábiles (~5 semanas) para MVP.

---

## Sprint 0 — Inicialización (1 día)

**Objetivo:** Proyecto funcionando, configuración completa, equipo listo para desarrollar.

**Tareas:**

1. Inicializar proyecto Next.js con App Router + TypeScript
2. Configurar TailwindCSS v4 + PostCSS
3. Instalar shadcn/ui y configurar componentes base (Button, Card, Input, Dialog, Avatar, Badge)
4. Configurar ESLint + Prettier
5. Configurar Supabase (proyecto, Auth, base de datos)
6. Crear estructura de carpetas según `01-folder-structure.md`
7. Configurar variables de entorno (`.env.example`, `.env.local`)
8. Configurar alias `@/` en `tsconfig.json`
9. Configurar TanStack Query Provider
10. Configurar Framer Motion
11. Configurar Vitest + Playwright
12. Configurar middleware de Supabase SSR
13. Crear `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
14. Crear `lib/utils/cn.ts` (shadcn utility)
15. Crear `config/site.ts` (metadatos del sitio)
16. Crear `config/features.ts` (feature flags)
17. Crear `providers/query-provider.tsx`
18. Crear `app/globals.css` con variables CSS de la marca
19. Crear `app/layout.tsx` con providers globales
20. Primer commit: "chore: initial project setup"

**Archivos creados:**

- `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`
- `lib/supabase/*`, `lib/utils/cn.ts`
- `providers/query-provider.tsx`
- `config/site.ts`, `config/features.ts`
- `app/layout.tsx`, `app/globals.css`
- `components/ui/*` (shadcn components)
- `vitest.config.ts`, `playwright.config.ts`

**Criterio de éxito:** `npm run dev` funciona, Supabase conectado, shadcn/ui componentes renderizan.

---

## Sprint 1 — Auth + Layout + Landing (3 días)

**Objetivo:** Usuario puede registrarse, iniciar sesión y ver el layout principal.

**Día 1 — Auth (Server Actions + RLS):**

1. Crear tabla `profiles` con trigger de auto-creación
2. Crear políticas RLS para `profiles`
3. Crear `features/auth/schemas/authSchema.ts` (Zod)
4. Crear `features/auth/actions/register.ts`
5. Crear `features/auth/actions/login.ts`
6. Crear `features/auth/actions/logout.ts`
7. Crear `features/auth/hooks/useAuth.ts`
8. Crear `providers/auth-provider.tsx`

**Día 2 — Auth UI + Middleware:** 9. Crear `features/auth/components/LoginForm.tsx` 10. Crear `features/auth/components/RegisterForm.tsx` 11. Crear `features/auth/components/RecoveryForm.tsx` 12. Crear `features/auth/components/AuthGuard.tsx` 13. Crear `app/(auth)/login/page.tsx` 14. Crear `app/(auth)/register/page.tsx` 15. Crear `app/(auth)/recovery/page.tsx` 16. Configurar middleware de autenticación

**Día 3 — Layout principal + Navegación:** 17. Crear `components/layout/AppShell.tsx` 18. Crear `components/layout/BottomNavigation.tsx` 19. Crear `app/(main)/layout.tsx` (layout con bottom nav) 20. Crear `app/(main)/page.tsx` (dashboard vacío con placeholder) 21. Crear `app/(main)/loading.tsx` (skeleton) 22. Crear `app/(main)/error.tsx` 23. Crear `app/not-found.tsx` 24. Crear `components/shared/LoadingState.tsx` 25. Crear `components/shared/EmptyState.tsx` 26. Crear `components/shared/ErrorBoundary.tsx`

**Criterio de éxito:** Usuario puede registrarse, iniciar sesión, ver layout con bottom nav, cerrar sesión.

---

## Sprint 2 — Commit (4 días)

**Objetivo:** Usuario puede registrar Commits, ver su timeline y dashboard del día.

**Día 1 — Base de datos + Tipos:**

1. Crear tabla `commits` en Supabase
2. Crear políticas RLS para `commits`
3. Crear `types/commit.ts` (tipos globales)
4. Crear `features/commit/types/index.ts` (tipos específicos)
5. Crear `features/commit/schemas/commitSchema.ts` (Zod)
6. Crear `lib/constants/commitment-types.ts` (tipos de Commit sugeridos)

**Día 2 — Server Actions + Hooks:** 7. Crear `features/commit/actions/createCommit.ts` 8. Crear `features/commit/actions/deleteCommit.ts` 9. Crear `features/commit/hooks/useCommits.ts` (TanStack Query) 10. Crear `features/commit/hooks/useCommit.ts` (individual) 11. Crear `features/commit/hooks/useCreateCommit.ts` (mutación con cache optimista) 12. Crear `features/commit/utils/commitUtils.ts`

**Día 3 — Componentes de Commit:** 13. Crear `features/commit/components/CommitForm.tsx` (React Hook Form + Zod) 14. Crear `features/commit/components/CommitCard.tsx` 15. Crear `features/commit/components/CommitTimeline.tsx` 16. Crear `features/commit/components/CommitButton.tsx` (botón flotante) 17. Crear `features/commit/components/TodayDashboard.tsx`

**Día 4 — Rutas + Integración:** 18. Crear `app/(main)/commit/page.tsx` 19. Crear `app/(main)/commit/[id]/page.tsx` 20. Crear `app/(main)/commit/loading.tsx` 21. Crear `app/(main)/commit/error.tsx` 22. Integrar TodayDashboard en `app/(main)/page.tsx` 23. Probar flujo completo: crear Commit → ver en timeline → ver detalle

**Criterio de éxito:** Usuario puede registrar un Commit en segundos, verlo en el dashboard, ver timeline, ver detalle.

---

## Sprint 3 — Circle (4 días)

**Objetivo:** Usuario puede invitar personas a su Circle, ver miembros y enviar apoyo.

**Día 1 — Base de datos + Tipos:**

1. Crear tabla `circle_memberships` en Supabase
2. Crear políticas RLS para `circle_memberships`
3. Crear `types/circle.ts` (tipos globales)
4. Crear `features/circle/types/index.ts`
5. Crear `features/circle/schemas/circleSchema.ts` (Zod)
6. Crear `lib/constants/support-messages.ts` (mensajes de apoyo predefinidos)

**Día 2 — Server Actions + Hooks:** 7. Crear `features/circle/actions/inviteToCircle.ts` 8. Crear `features/circle/actions/acceptInvite.ts` 9. Crear `features/circle/actions/removeFromCircle.ts` 10. Crear `features/circle/actions/sendSupport.ts` 11. Crear `features/circle/hooks/useCircleMembers.ts` 12. Crear `features/circle/hooks/useCirclePresence.ts` 13. Crear `features/circle/utils/circleUtils.ts`

**Día 3 — Componentes de Circle:** 14. Crear `features/circle/components/CircleDashboard.tsx` 15. Crear `features/circle/components/CircleMemberCard.tsx` 16. Crear `features/circle/components/CircleInviteForm.tsx` 17. Crear `features/circle/components/CircleSupportForm.tsx` 18. Crear `features/circle/components/CircleSharedHistory.tsx`

**Día 4 — Rutas + Integración:** 19. Crear `app/(main)/circle/page.tsx` 20. Crear `app/(main)/circle/invite/page.tsx` 21. Crear `app/(main)/circle/[memberId]/page.tsx` 22. Crear `app/(main)/circle/loading.tsx` 23. Crear `app/(main)/circle/error.tsx` 24. Probar flujo completo: invitar → aceptar → ver miembros → enviar apoyo

**Criterio de éxito:** Usuario puede invitar a alguien, ver miembros del Circle, enviar apoyo, ver historia compartida.

---

## Sprint 4 — Progress + Journey (3 días)

**Objetivo:** Usuario puede ver su progreso, Journey visual y métricas de continuidad.

**Día 1 — Lógica de Progress:**

1. Crear `features/progress/utils/continuity.ts` (cálculos de continuidad)
2. Crear `features/progress/utils/narrative.ts` (generación de lenguaje narrativo)
3. Crear `features/progress/types/index.ts`
4. Crear `features/progress/actions/getProgress.ts` (Server Action de lectura)
5. Crear `features/progress/hooks/useProgress.ts`

**Día 2 — Componentes de Progress:** 6. Crear `features/progress/components/ProgressHeader.tsx` 7. Crear `features/progress/components/JourneyTimeline.tsx` 8. Crear `features/progress/components/WeeklyPulse.tsx` 9. Crear `features/progress/components/PatternCard.tsx`

**Día 3 — Rutas + Integración:** 10. Crear `app/(main)/progress/page.tsx` 11. Crear `app/(main)/progress/journey/page.tsx` 12. Crear `app/(main)/progress/loading.tsx` 13. Crear `app/(main)/progress/error.tsx` 14. Integrar métricas de Progress en el dashboard (TodayDashboard) 15. Probar: registrar Commits → ver progreso actualizado

**Criterio de éxito:** Usuario ve métricas de continuidad, Journey visual, pulso semanal. Las métricas se actualizan al crear Commits.

---

## Sprint 5 — Profile + Reflections (3 días)

**Objetivo:** Usuario puede ver/editar su perfil y capturar Reflections.

**Día 1 — Profile:**

1. Crear `features/profile/schemas/profileSchema.ts`
2. Crear `features/profile/actions/updateProfile.ts`
3. Crear `features/profile/hooks/useProfile.ts`
4. Crear `features/profile/components/ProfileHeader.tsx`
5. Crear `features/profile/components/ProfileStats.tsx`
6. Crear `features/profile/components/ProfileSettings.tsx`
7. Crear `app/(main)/profile/page.tsx`
8. Crear `app/(main)/profile/settings/page.tsx`

**Día 2 — Reflections:** 9. Crear tabla `reflections` en Supabase 10. Crear políticas RLS para `reflections` 11. Crear `features/reflection/schemas/reflectionSchema.ts` 12. Crear `features/reflection/actions/createReflection.ts` 13. Crear `features/reflection/hooks/useReflections.ts` 14. Crear `features/reflection/components/ReflectionPrompt.tsx` 15. Crear `features/reflection/components/ReflectionCard.tsx` 16. Crear `features/reflection/components/ReflectionTimeline.tsx`

**Día 3 — Rutas + Integración:** 17. Crear `app/(main)/reflections/page.tsx` 18. Crear `app/(main)/reflections/loading.tsx` 19. Crear `app/(main)/reflections/error.tsx` 20. Integrar ReflectionPrompt después de crear Commit 21. Probar flujo completo: crear Commit → reflexionar → ver reflections

**Criterio de éxito:** Usuario puede ver/editar perfil, crear Reflections, ver timeline de Reflections.

---

## Sprint 6 — Presence + Realtime (2 días)

**Objetivo:** El Circle se siente vivo con presencia en tiempo real.

**Día 1 — Realtime:**

1. Configurar Supabase Realtime para tabla `commits`
2. Crear `features/circle/hooks/useCirclePresence.ts` (con suscripción Realtime)
3. Crear `features/circle/components/CirclePresencePulse.tsx`
4. Integrar Presence en CircleDashboard

**Día 2 — Shared History:** 5. Crear `features/circle/hooks/useCircleSharedHistory.ts` 6. Crear `features/circle/components/CircleSharedHistory.tsx` 7. Integrar Shared History en CircleDashboard 8. Probar: crear Commit → ver presencia actualizada en tiempo real

**Criterio de éxito:** Al crear un Commit, la presencia del Circle se actualiza sin recargar la página.

---

## Sprint 7 — UX Writing + Identity Language + Pulido (3 días)

**Objetivo:** La aplicación habla el lenguaje de Gym Circle. Cada mensaje refuerza identidad.

**Día 1 — Identity Language:**

1. Crear `lib/constants/identity-language.ts` (catálogo de frases)
2. Crear `providers/identity-provider.tsx`
3. Revisar todos los mensajes del sistema (loading, error, empty states)
4. Reemplazar lenguaje transaccional por lenguaje de identidad

**Día 2 — UX Writing:** 5. Escribir microcopy para cada interacción:

- CommitForm: "¿Qué hiciste hoy?" → "¿Quién estás intentando ser?"
- EmptyState de Commits: "Aún no hay Commits" → "Tu proceso empieza aquí"
- Regreso: "Has vuelto después de X días" → "Bienvenido de vuelta. Seguimos."

6. Escribir mensajes de apoyo del Circle
7. Escribir narrativa del Journey

**Día 3 — Pulido visual:** 8. Revisar consistencia de espaciados, colores, tipografía 9. Añadir animaciones suaves (Framer Motion) en transiciones clave 10. Revisar estados vacíos de todas las secciones 11. Revisar responsive design (mobile-first) 12. Probar flujo completo de principio a fin

**Criterio de éxito:** La aplicación se siente coherente, calmada y con identidad propia.

---

## Sprint 8 — Testing + Deploy (2 días)

**Objetivo:** Tests pasan, aplicación desplegada en producción.

**Día 1 — Testing:**

1. Tests unitarios (Vitest) para `lib/utils/*`, `features/*/utils/*`
2. Tests de integración para Server Actions críticas (createCommit, inviteToCircle)
3. Tests E2E (Playwright) para flujos críticos:
   - Registro → Login → Dashboard
   - Crear Commit → Ver en timeline
   - Invitar al Circle → Ver presencia
4. Configurar CI/CD (GitHub Actions)

**Día 2 — Deploy:** 5. Configurar proyecto en Vercel 6. Configurar variables de entorno en Vercel 7. Configurar Supabase (producción) 8. Migraciones de base de datos 9. Deploy inicial 10. Verificar funcionamiento en producción 11. Configurar dominio personalizado (si aplica) 12. Documentar proceso de deploy en `docs/development/deploy.md`

**Criterio de éxito:** Tests pasan, aplicación desplegada en producción, flujos críticos funcionan.

---

## MVP: Lo que incluye y lo que NO incluye

### Incluye (Core)

- ✅ Autenticación (email + OAuth)
- ✅ Layout principal con bottom navigation (5 secciones)
- ✅ Commits (crear, ver, timeline, dashboard)
- ✅ Circle (invitar, miembros, apoyo, shared history)
- ✅ Progress (continuidad, Journey, pulso semanal)
- ✅ Profile (perfil, estadísticas, configuración)
- ✅ Reflections (crear, ver, timeline)
- ✅ Presence (Realtime para Circle)
- ✅ UX Writing con lenguaje de identidad
- ✅ Estados vacíos, loading, error

### NO incluye (Supporting/Future)

- ❌ Knowledge (aprendizaje compartido)
- ❌ Notificaciones push
- ❌ PRs (Personal Records)
- ❌ Retos compartidos
- ❌ Explorar personas
- ❌ Modo oscuro
- ❌ Múltiples idiomas
- ❌ Onboarding interactivo (solo el mínimo de 3 pasos)

---

## Dependencias entre sprints

```
Sprint 0 (Setup)
    │
    ▼
Sprint 1 (Auth + Layout)
    │
    ▼
Sprint 2 (Commit) ──────────────────┐
    │                               │
    ├──► Sprint 3 (Circle)          │
    │         │                     │
    │         ▼                     │
    │    Sprint 6 (Presence)        │
    │                               │
    ├──► Sprint 4 (Progress)        │
    │                               │
    └──► Sprint 5 (Profile + Refl) ◄┘
              │
              ▼
         Sprint 7 (UX Writing)
              │
              ▼
         Sprint 8 (Testing + Deploy)
```

**Regla:** No empezar un sprint si el anterior no está completo y aprobado.

---

## Decisiones tomadas

1. 9 sprints (0-8) para MVP, total ~25 días hábiles.
2. Orden: Setup → Auth → Commit → Circle → Progress → Profile/Reflections → Presence → UX → Test/Deploy.
3. MVP incluye 6 features core (auth, commit, circle, progress, profile, reflection).
4. Knowledge y Notifications quedan fuera del MVP.
5. Cada sprint produce algo funcional y desplegable.

## Riesgos

- Sprint 0 puede alargarse si hay problemas de configuración (Supabase, Vercel, dependencias).
- Sprint 3 (Circle) depende de tener al menos 2 usuarios registrados. Puede requerir pruebas con cuentas de prueba.
- Sprint 6 (Presence) depende de Supabase Realtime, que puede tener limitaciones en el plan gratuito.
- El UX Writing (Sprint 7) puede requerir iteraciones si el tono no es el correcto.

## Preguntas abiertas

- ¿Debemos hacer deploy después de cada sprint o solo al final? Decisión: deploy continuo (Vercel preview deployments por branch).
- ¿Quién revisa y aprueba cada sprint? Decisión: el fundador (tú) revisa y aprueba antes de pasar al siguiente.
- ¿Los tests E2E deben ser parte del CI/CD? Decisión: sí, pero solo los críticos (auth, commit, circle).

## Próximo paso

Con este documento, la FASE 2 — Software Architecture está completa. El siguiente paso es la **FASE 3 — Base de datos**, donde diseñaremos el esquema completo de PostgreSQL con entidades, relaciones, índices, políticas RLS y migraciones.
