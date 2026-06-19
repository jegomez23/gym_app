# 01 — Entity Relationship

> **Propósito de este documento:** Diseñar todas las entidades del dominio, sus atributos, relaciones y cardinalidad. Antes de escribir SQL, tener un mapa completo de cómo se relacionan los datos en Gym Circle.

---

## Diagrama ER (textual)

```
┌──────────────────┐
│   auth.users     │ (Supabase)
│  (id, email...)  │
└────────┬─────────┘
         │ 1:1
         ▼
┌───────────────────────────────────────────────────────────────┐
│                        profiles                                │
│  id (FK), name, avatar_url, bio, visibility_preference,       │
│  onboarding_completed, created_at, updated_at, deleted_at      │
└────────┬──────────────────────────────────────────────────────┘
         │ 1:N
         ├────────────────────────────────────────────────────┐
         │                                                    │
         ▼                                                    ▼
┌──────────────────────┐                     ┌──────────────────────────┐
│      commits          │                     │      reflections         │
│  id (PK)              │                     │  id (PK)                 │
│  user_id (FK)         │◄───────────────────►│  user_id (FK)            │
│  title                │   (opcional)        │  commit_id (FK, opc)     │
│  type                 │                     │  content                 │
│  recorded_at          │                     │  type                    │
│  duration_minutes     │                     │  visibility              │
│  intensity            │                     │  created_at              │
│  note                 │                     │  updated_at              │
│  visibility           │                     │  deleted_at              │
│  evidence (JSONB)     │                     └──────────────────────────┘
│  created_at           │
│  deleted_at           │
└────────┬──────────────┘
         │
         │ 1:N (via visibility = 'circle')
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        circle_memberships                        │
│  id (PK)                                                         │
│  user_id (FK) → profiles.id                                      │
│  circle_user_id (FK) → profiles.id                               │
│  status (active/paused/ended)                                    │
│  joined_at                                                       │
│  ended_at                                                        │
│  UNIQUE(user_id, circle_user_id)                                 │
└──────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────────────────────────────┐
│                  supports                     │
│  id (PK)                                      │
│  from_user_id (FK) → profiles.id              │
│  to_user_id (FK) → profiles.id                │
│  message                                      │
│  created_at                                   │
│  deleted_at                                   │
└──────────────────────────────────────────────┘
```

---

## Entidad: Profiles

**Propósito:** Almacenar la información pública y de configuración de cada usuario.

**Responsabilidad:** Ser la identidad del usuario dentro del sistema. Vinculada 1:1 con `auth.users` de Supabase.

| Atributo                | Tipo        | Nullable | Default      | Notas                                       |
| ----------------------- | ----------- | -------- | ------------ | ------------------------------------------- |
| `id`                    | UUID        | No       | `auth.uid()` | FK a auth.users, PK                         |
| `name`                  | TEXT        | No       | -            | Nombre visible                              |
| `avatar_url`            | TEXT        | Sí       | null         | URL del avatar en Supabase Storage          |
| `bio`                   | TEXT        | Sí       | null         | Biografía corta (máx 200 chars)             |
| `visibility_preference` | TEXT        | No       | `'circle'`   | Visibilidad por defecto para nuevos Commits |
| `onboarding_completed`  | BOOLEAN     | No       | `false`      | Si completó el onboarding de 3 pasos        |
| `created_at`            | TIMESTAMPTZ | No       | `now()`      | Registro de creación                        |
| `updated_at`            | TIMESTAMPTZ | No       | `now()`      | Última modificación                         |
| `deleted_at`            | TIMESTAMPTZ | Sí       | null         | Soft delete                                 |

**Cardinalidad:** 1:1 con `auth.users`. 1:N con commits, reflections, circle_memberships.

---

## Entidad: Commits

**Propósito:** Almacenar la unidad atómica del sistema: cada acción disciplinada que una persona registra.

**Responsabilidad:** Ser la fuente de verdad de Progress, Journey, Presence y Shared History.

| Atributo           | Tipo        | Nullable | Default             | Notas                                              |
| ------------------ | ----------- | -------- | ------------------- | -------------------------------------------------- |
| `id`               | UUID        | No       | `gen_random_uuid()` | PK                                                 |
| `user_id`          | UUID        | No       | -                   | FK a profiles.id                                   |
| `title`            | TEXT        | Sí       | null                | Nombre o etiqueta del Commit                       |
| `type`             | TEXT        | Sí       | null                | Categoría: training, nutrition, rest, mind, custom |
| `recorded_at`      | TIMESTAMPTZ | No       | `now()`             | Cuándo ocurrió la acción                           |
| `duration_minutes` | INTEGER     | Sí       | null                | Duración en minutos                                |
| `intensity`        | TEXT        | Sí       | null                | `'light'`, `'steady'`, `'deep'`                    |
| `note`             | TEXT        | Sí       | null                | Reflexión breve o nota                             |
| `visibility`       | TEXT        | No       | `'private'`         | `'private'`, `'circle'`, `'public'`                |
| `evidence`         | JSONB       | Sí       | `'[]'`              | Array de strings: series, páginas, minutos         |
| `created_at`       | TIMESTAMPTZ | No       | `now()`             | Registro de creación                               |
| `deleted_at`       | TIMESTAMPTZ | Sí       | null                | Soft delete                                        |

**Restricciones:**

- `CHECK (intensity IN ('light', 'steady', 'deep'))`
- `CHECK (visibility IN ('private', 'circle', 'public'))`
- `CHECK (duration_minutes > 0)` cuando no es null

**Cardinalidad:** N:1 con profiles. 1:N con reflections (opcional).

---

## Entidad: Reflections

**Propósito:** Almacenar insights personales breves que conectan la acción con la identidad.

**Responsabilidad:** Capturar el aprendizaje que emerge del proceso. Es supporting, no core.

| Atributo     | Tipo        | Nullable | Default             | Notas                                                   |
| ------------ | ----------- | -------- | ------------------- | ------------------------------------------------------- |
| `id`         | UUID        | No       | `gen_random_uuid()` | PK                                                      |
| `user_id`    | UUID        | No       | -                   | FK a profiles.id                                        |
| `commit_id`  | UUID        | Sí       | null                | FK a commits.id (opcional)                              |
| `content`    | TEXT        | No       | -                   | Máximo 300 caracteres                                   |
| `type`       | TEXT        | Sí       | null                | `'technical'`, `'emotional'`, `'identity'`, `'process'` |
| `visibility` | TEXT        | No       | `'private'`         | `'private'`, `'circle'`                                 |
| `created_at` | TIMESTAMPTZ | No       | `now()`             | Registro de creación                                    |
| `updated_at` | TIMESTAMPTZ | Sí       | null                | Última edición                                          |
| `deleted_at` | TIMESTAMPTZ | Sí       | null                | Soft delete                                             |

**Restricciones:**

- `CHECK (length(content) <= 300)`
- `CHECK (visibility IN ('private', 'circle'))`

**Cardinalidad:** N:1 con profiles. N:1 con commits (opcional).

---

## Entidad: Circle Memberships

**Propósito:** Almacenar las relaciones bidireccionales entre personas que comparten un proceso.

**Responsabilidad:** Ser la base del Circle. Cada relación genera dos filas (A→B y B→A).

| Atributo         | Tipo        | Nullable | Default             | Notas                             |
| ---------------- | ----------- | -------- | ------------------- | --------------------------------- |
| `id`             | UUID        | No       | `gen_random_uuid()` | PK                                |
| `user_id`        | UUID        | No       | -                   | FK a profiles.id (persona A)      |
| `circle_user_id` | UUID        | No       | -                   | FK a profiles.id (persona B)      |
| `status`         | TEXT        | No       | `'active'`          | `'active'`, `'paused'`, `'ended'` |
| `joined_at`      | TIMESTAMPTZ | No       | `now()`             | Desde cuándo están conectados     |
| `ended_at`       | TIMESTAMPTZ | Sí       | null                | Si status = 'ended'               |
| `created_at`     | TIMESTAMPTZ | No       | `now()`             | Registro de creación              |

**Restricciones:**

- `UNIQUE (user_id, circle_user_id)`
- `CHECK (user_id != circle_user_id)` — No auto-relación
- `CHECK (status IN ('active', 'paused', 'ended'))`

**Cardinalidad:** N:1 con profiles (user_id). N:1 con profiles (circle_user_id). Ambos lados de la relación.

---

## Entidad: Supports

**Propósito:** Almacenar las interacciones de apoyo entre miembros del Circle.

**Responsabilidad:** Ser parte de la memoria compartida del Circle. Inmutable después de creado.

| Atributo       | Tipo        | Nullable | Default             | Notas                           |
| -------------- | ----------- | -------- | ------------------- | ------------------------------- |
| `id`           | UUID        | No       | `gen_random_uuid()` | PK                              |
| `from_user_id` | UUID        | No       | -                   | FK a profiles.id (quien envía)  |
| `to_user_id`   | UUID        | No       | -                   | FK a profiles.id (quien recibe) |
| `message`      | TEXT        | No       | -                   | Mensaje de apoyo                |
| `created_at`   | TIMESTAMPTZ | No       | `now()`             | Registro de creación            |
| `deleted_at`   | TIMESTAMPTZ | Sí       | null                | Soft delete (solo remitente)    |

**Restricciones:**

- `CHECK (from_user_id != to_user_id)`

**Cardinalidad:** N:1 con profiles (from_user_id). N:1 con profiles (to_user_id).

---

## Resumen de entidades MVP

| Entidad             | Tabla                   | PK                     | FK                                                 | Core/Supporting |
| ------------------- | ----------------------- | ---------------------- | -------------------------------------------------- | --------------- |
| Usuario autenticado | `auth.users` (Supabase) | `id`                   | -                                                  | Core            |
| Perfil              | `profiles`              | `id` (FK a auth.users) | -                                                  | Core            |
| Commit              | `commits`               | `id`                   | `user_id` → profiles                               | Core            |
| Reflection          | `reflections`           | `id`                   | `user_id` → profiles, `commit_id` → commits        | Supporting      |
| Circle Member       | `circle_memberships`    | `id`                   | `user_id` → profiles, `circle_user_id` → profiles  | Core            |
| Support             | `supports`              | `id`                   | `from_user_id` → profiles, `to_user_id` → profiles | Supporting      |

---

## Decisiones tomadas

1. **6 entidades en MVP**: profiles, commits, reflections, circle_memberships, supports.
2. **Circle memberships es bidireccional**: dos filas por relación. Esto simplifica las consultas (cada persona ve su Circle como "filas donde user_id = yo").
3. **Soft delete en todas las tablas**: ningún dato se elimina realmente. `deleted_at` indica que está "eliminado".
4. **Evidence como JSONB**: flexible para diferentes tipos de evidencia sin necesidad de esquema fijo.
5. **Supports sin FK a circle_memberships**: no se valida que from/to sean miembros activos del Circle (podría haber apoyo entre personas que ya no están en el Circle, y la historia compartida debe conservarse).

## Alternativas descartadas

- **Circle memberships como tabla única con una fila por relación.** Descartado porque las consultas serían más complejas (OR en ambos lados en lugar de WHERE simple).
- **Evidence como tabla separada.** Descartado porque agregaría complejidad innecesaria para un array simple de strings.
- **FK de supports a circle_memberships.** Descartado porque el apoyo debe sobrevivir a cambios en el estado de la membresía.

## Riesgos

- La bidireccionalidad de circle_memberships requiere mantener sincronizadas ambas filas (si A→B está activa, B→A también debe estarlo).
- Soft delete puede llevar a acumulación de datos. Monitorear tamaño de tablas.
- JSONB en evidence no permite consultas eficientes sobre su contenido (pero no es necesario para el dominio).

## Preguntas abiertas

- ¿Necesitamos una tabla de `commit_types` o los tipos son libres (texto definido por usuario)? Decisión: libres por ahora, evaluar tabla si los tipos se estandarizan.
- ¿Supports necesita restricción de frecuencia? Decisión: no en MVP.
- ¿Debe haber un límite de circle_memberships activas por usuario? Decisión: 15 máximo.

## Próximo documento

`docs/database/02-schema-design.md` — Diseño completo de tablas con columnas, tipos, defaults, restricciones y timestamps.
