# 11 — Database Roadmap

> **Propósito de este documento:** Definir el orden de implementación de la base de datos por fases. Cada fase debe poder desplegarse independientemente y corresponde a un sprint del roadmap de desarrollo. Este documento conecta la base de datos con el plan de implementación de `docs/architecture/08-coding-roadmap.md`.

---

> **Contrato canonico:** Si este roadmap contradice `docs/database/12-mvp-data-contract.md`, prevalece `12-mvp-data-contract.md`.

## Principios

1. **Cada fase corresponde a un sprint.** La base de datos se implementa en paralelo con el desarrollo de features.
2. **Cada fase es autónoma.** No requiere que fases posteriores existan para funcionar.
3. **Las fases se despliegan en orden.** No se puede saltar una fase.
4. **Cada fase incluye: esquema + RLS + seeds de prueba.**

---

## Fase 0: Setup (Sprint 0)

**Duración:** 1 día

**Objetivo:** Proyecto de Supabase creado, conexión configurada, CLI instalado.

**Tareas:**

- [ ] Crear proyecto en Supabase Dashboard
- [ ] Obtener URL y anon key
- [ ] Configurar variables de entorno locales
- [ ] Instalar Supabase CLI
- [ ] Configurar `supabase/config.toml`
- [ ] Verificar conexión desde la aplicación

**Sin migraciones en esta fase.**

---

## Fase 1: Auth + Profiles (Sprint 1)

**Duración:** 3 días (paralelo al Sprint 1 de desarrollo)

**Objetivo:** Usuarios pueden registrarse, autenticarse y tener perfil.

**Migraciones:**

- `20260619_0001_create_functions.sql` — Funciones base (`update_updated_at_column`, `handle_new_user`)
- `20260619_0002_create_profiles.sql` — Tabla `profiles` + triggers

**Tareas:**

- [ ] Crear migración 0001 (funciones)
- [ ] Crear migración 0002 (profiles)
- [ ] Aplicar migraciones en desarrollo local
- [ ] Verificar que el trigger `on_auth_user_created` funciona al registrar usuario
- [ ] Verificar RLS de profiles (SELECT propio, SELECT Circle, INSERT, UPDATE)
- [ ] Configurar OAuth (Google, GitHub) en Supabase Dashboard
- [ ] Verificar que la aplicación puede leer/escribir perfiles

**Criterio de éxito:** Usuario se registra → perfil se crea automáticamente → puede editar su perfil.

---

## Fase 2: Commits (Sprint 2)

**Duración:** 4 días (paralelo al Sprint 2 de desarrollo)

**Objetivo:** Usuarios pueden crear y ver Commits.

**Migraciones:**

- `20260619_0003_create_commits.sql` — Tabla `commits` + índices

**Tareas:**

- [ ] Crear migración 0003 (commits)
- [ ] Aplicar migración en desarrollo
- [ ] Verificar RLS de commits (SELECT propio, SELECT Circle, SELECT público, INSERT, UPDATE)
- [ ] Verificar índices con EXPLAIN ANALYZE
- [ ] Verificar soft delete (UPDATE deleted_at)
- [ ] Sembrar datos de prueba (Commits de Mara, Noah, Leo)

**Criterio de éxito:** Usuario puede crear Commit, verlo en timeline, cambiar visibilidad, soft delete.

---

## Fase 3: Circle (Sprint 3)

**Duración:** 4 días (paralelo al Sprint 3 de desarrollo)

**Objetivo:** Usuarios pueden crear relaciones de Circle y enviar apoyo.

**Migraciones:**

- `20260619_0005_create_circle_memberships.sql` — Tabla `circle_memberships` + trigger bidireccional
- `20260619_0006_create_supports.sql` — Tabla `supports`

**Tareas:**

- [ ] Crear migración 0005 (circle_memberships)
- [ ] Crear migración 0006 (supports)
- [ ] Aplicar migraciones en desarrollo
- [ ] Verificar trigger bidireccional (crear A→B genera B→A automáticamente)
- [ ] Verificar RLS de circle_memberships (solo involucrados pueden ver)
- [ ] Verificar RLS de supports (solo involucrados pueden ver)
- [ ] Verificar supports inmutables (sin UPDATE)
- [ ] Sembrar datos de prueba (Circle entre Mara, Noah, Leo)

**Criterio de éxito:** Usuario A invita a B → B acepta → ambos ven la membresía activa → pueden enviarse apoyo.

---

## Fase 4: Reflections (Sprint 5)

**Duración:** 2 días (paralelo al Sprint 5 de desarrollo)

**Objetivo:** Usuarios pueden crear Reflections asociadas obligatoriamente a Commits.

**Migraciones:**

- `20260619_0004_create_reflections.sql` — Tabla `reflections` + índices + trigger `updated_at`

**Tareas:**

- [ ] Crear migración 0004 (reflections)
- [ ] Aplicar migración en desarrollo
- [ ] Verificar RLS de reflections (SELECT propio, SELECT Circle, INSERT, UPDATE)
- [ ] Verificar que `commit_id` es obligatorio y que no existen Reflections independientes
- [ ] Verificar trigger `updated_at` en reflections
- [ ] Sembrar datos de prueba

**Criterio de éxito:** Usuario puede crear Reflection asociada a un Commit, editarla, verla en timeline.

---

## Fase 5: Funciones de consulta (Sprint 4-6)

**Duración:** 3 días (paralelo a Sprints 4 y 6)

**Objetivo:** Funciones SQL para presencia, Journey e historia compartida.

**Migraciones:**

- `20260619_0007_create_query_functions.sql` — `get_circle_presence()`, `get_journey_timeline()`, `get_shared_history()`

**Tareas:**

- [ ] Crear migración 0007 (funciones)
- [ ] Probar `get_circle_presence()` con datos de prueba
- [ ] Probar `get_journey_timeline()` con diferentes rangos de fechas
- [ ] Probar `get_shared_history()` con miembros del Circle
- [ ] Verificar rendimiento con EXPLAIN ANALYZE
- [ ] Verificar que RLS se aplica (SECURITY INVOKER)

**Criterio de éxito:** Las funciones devuelven datos correctos y respetan RLS.

---

## Fase 6: RLS Completo + Storage (Sprint 7)

**Duración:** 2 días

**Objetivo:** Políticas RLS completas y buckets de Storage configurados.

**Migraciones:**

- `20260619_0008_enable_rls.sql` — Habilitar RLS y crear todas las políticas
- Configuración de Storage en SQL Editor o Dashboard

**Tareas:**

- [ ] Crear migración 0008 (RLS)
- [ ] Verificar políticas RLS para todas las tablas
- [ ] Probar con usuario no autenticado (debe fallar todo)
- [ ] Probar con usuario autenticado pero sin permisos (debe fallar)
- [ ] Probar con usuario con permisos correctos (debe funcionar)
- [ ] Crear buckets en Supabase Storage (avatars, evidence)
- [ ] Configurar políticas RLS de Storage
- [ ] Verificar subida/descarga de avatares
- [ ] Verificar subida/descarga de evidencia

**Criterio de éxito:** Usuario no autenticado no puede leer/escribir nada. Usuario autenticado solo puede leer/escribir sus datos y los de su Circle.

---

## Fase 7: Seeds + Realtime (Sprint 6-8)

**Duración:** 2 días

**Objetivo:** Datos de prueba completos y Realtime configurado para presencia.

**Migraciones:**

- `20260619_0009_seed_test_data.sql` — Datos de prueba
- Configuración de Realtime en Dashboard

**Tareas:**

- [ ] Crear migración 0009 (seeds)
- [ ] Sembrar datos de prueba completos
- [ ] Habilitar Realtime para tabla commits en Dashboard
- [ ] Verificar que los cambios en commits disparan eventos Realtime
- [ ] Verificar que la presencia del Circle se actualiza en tiempo real

**Criterio de éxito:** Datos de prueba disponibles en desarrollo. Commits nuevos aparecen en presencia del Circle sin recargar.

---

## Resumen de fases

| Fase                 | Sprint | Migraciones | Tablas                           | Funciones                                                           |
| -------------------- | ------ | ----------- | -------------------------------- | ------------------------------------------------------------------- |
| 0 - Setup            | 0      | -           | -                                | -                                                                   |
| 1 - Auth + Profiles  | 1      | 0001, 0002  | `profiles`                       | `update_updated_at`, `handle_new_user`                              |
| 2 - Commits          | 2      | 0003        | `commits`                        | -                                                                   |
| 3 - Circle           | 3      | 0005, 0006  | `circle_memberships`, `supports` | `ensure_bidirectional`                                              |
| 4 - Reflections      | 5      | 0004        | `reflections`                    | -                                                                   |
| 5 - Query Functions  | 4, 6   | 0007        | -                                | `get_circle_presence`, `get_journey_timeline`, `get_shared_history` |
| 6 - RLS + Storage    | 7      | 0008        | -                                | Políticas RLS                                                       |
| 7 - Seeds + Realtime | 6, 8   | 0009        | -                                | Realtime configurado                                                |

---

## Dependencias entre fases

```
Fase 0 (Setup)
    │
    ▼
Fase 1 (Auth + Profiles) ← Sprint 1
    │
    ├──► Fase 2 (Commits) ← Sprint 2
    │       │
    │       └──► Fase 4 (Reflections) ← Sprint 5
    │
    ├──► Fase 3 (Circle) ← Sprint 3
    │       │
    │       └──► (Supports en misma fase)
    │
    └──────────────────────┐
                           ▼
                    Fase 5 (Query Functions) ← Sprint 4, 6
                           │
                           ▼
                    Fase 6 (RLS + Storage) ← Sprint 7
                           │
                           ▼
                    Fase 7 (Seeds + Realtime) ← Sprint 6, 8
```

---

## Decisiones tomadas

1. **8 fases (0-7)** que corresponden a los sprints del roadmap de desarrollo.
2. **Cada fase es autónoma y desplegable independientemente.**
3. **Las fases de base de datos se ejecutan en paralelo con los sprints de desarrollo.**
4. **RLS se implementa al final (Fase 6)** para evitar tener que modificar políticas cuando se añadan nuevas tablas.
5. **Seeds al final (Fase 7)** porque requieren que todas las tablas existan.

## Alternativas descartadas

- **Todas las migraciones en un solo despliegue.** Descartado porque dificulta el debugging y el rollback.
- **RLS al principio.** Descartado porque las políticas cambian al añadir nuevas tablas.
- **Seeds antes de RLS.** Descartado porque los seeds deben probarse con RLS activo.

## Riesgos

- La Fase 6 (RLS) puede romper funcionalidad existente si las políticas son incorrectas. Probar exhaustivamente.
- La Fase 5 (Query Functions) depende de que Circle y Commits existan. No puede implementarse antes de la Fase 2 y 3.
- Realtime (Fase 7) puede tener problemas de conexión en entornos de desarrollo local.

## Preguntas abiertas

- ¿Debemos añadir una fase de "migraciones de producción" para el deploy inicial? Decisión: sí, ejecutar todas las migraciones en orden en producción antes del primer deploy.
- ¿Los seeds de prueba deben ejecutarse automáticamente en entornos de preview? Decisión: no, solo en desarrollo local.

## Próximo paso

Con este documento, la **FASE 3 — Database Design** está completa.

El siguiente paso es ejecutar el plan: comenzar con la **Fase 0 (Setup)** y luego el **Sprint 1** según `docs/engineering/09-first-commit-plan.md` y `docs/architecture/08-coding-roadmap.md`.

**Toda la documentación del proyecto Gym Circle está completa:** 30+ documentos que cubren desde la filosofía del producto hasta el diseño detallado de la base de datos, pasando por la arquitectura del software, las reglas de ingeniería y el plan de implementación.
