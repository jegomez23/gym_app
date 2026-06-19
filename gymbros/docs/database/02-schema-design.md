# 02 — Schema Design

> **Propósito de este documento:** Diseñar todas las tablas del MVP de Gym Circle con columnas, tipos, defaults, restricciones, claves y timestamps. Este documento es la especificación completa para las migraciones SQL iniciales.

---

## Principios de diseño

1. **Toda tabla tiene `created_at` y `deleted_at`.** Soft delete como estrategia única. No se eliminan datos.
2. **Toda tabla que se modifica tiene `updated_at`.** Controlada por trigger.
3. **UUIDs como claves primarias.** Evitan colisiones, permiten migraciones y soportan distribución.
4. **TIMESTAMPTZ para fechas.** Zona horaria siempre UTC. No usar timestamp sin zona.
5. **Check constraints para enums.** No usar tipos ENUM de PostgreSQL para que las migraciones sean más flexibles.
6. **FKs explícitas con ON DELETE apropiado.** Cada relación tiene una estrategia justificada.

---

## Tabla: profiles

Vinculada 1:1 con `auth.users` de Supabase. Se crea automáticamente mediante trigger.

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
    avatar_url TEXT CHECK (avatar_url IS NULL OR length(avatar_url) <= 500),
    bio TEXT CHECK (bio IS NULL OR length(bio) <= 200),
    visibility_preference TEXT NOT NULL DEFAULT 'circle'
        CHECK (visibility_preference IN ('private', 'circle', 'public')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Notas:**

- `ON DELETE CASCADE`: si el usuario se elimina de auth.users, su perfil se elimina automáticamente.
- Soft delete: `deleted_at` no nulo indica perfil desactivado. El usuario puede reactivarlo.
- `visibility_preference`: valor por defecto para nuevos Commits (el usuario puede cambiarlo por Commit).

---

## Tabla: commits

Unidad atómica del sistema. Inmutable después de crear (excepto `visibility` y soft delete).

```sql
CREATE TABLE commits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT CHECK (title IS NULL OR length(title) <= 150),
    type TEXT CHECK (type IS NULL OR length(type) <= 50),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    intensity TEXT CHECK (intensity IS NULL OR intensity IN ('light', 'steady', 'deep')),
    note TEXT CHECK (note IS NULL OR length(note) <= 500),
    visibility TEXT NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private', 'circle', 'public')),
    evidence JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX commits_user_id_recorded_at_idx ON commits(user_id, recorded_at DESC);
CREATE INDEX commits_user_id_visibility_idx ON commits(user_id, visibility);
CREATE INDEX commits_recorded_at_idx ON commits(recorded_at DESC);
```

**Notas:**

- `ON DELETE CASCADE`: si el perfil se elimina, sus Commits se eliminan.
- Sin `updated_at`: el Commit es inmutable. Solo puede cambiar `visibility` o ser soft deleted.
- `duration_minutes > 0`: solo válido cuando no es null.
- `evidence` como JSONB array: `["12 reps", "45 min", "3 series"]`.

---

## Tabla: reflections

Insights personales breves. Editables por el propietario.

```sql
CREATE TABLE reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    commit_id UUID REFERENCES commits(id) ON DELETE SET NULL,
    content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 300),
    type TEXT CHECK (type IS NULL OR type IN ('technical', 'emotional', 'identity', 'process')),
    visibility TEXT NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private', 'circle')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX reflections_user_id_created_at_idx ON reflections(user_id, created_at DESC);
CREATE INDEX reflections_commit_id_idx ON reflections(commit_id);

-- Trigger para updated_at
CREATE TRIGGER update_reflections_updated_at
    BEFORE UPDATE ON reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Notas:**

- `ON DELETE SET NULL` en `commit_id`: si se elimina un Commit, la Reflection asociada no se pierde; solo pierde la referencia.
- `updated_at` se actualiza cuando se edita el contenido.

---

## Tabla: circle_memberships

Relaciones bidireccionales. Cada relación genera dos filas (A→B y B→A).

```sql
CREATE TABLE circle_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    circle_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'ended')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, circle_user_id),
    CHECK (user_id != circle_user_id)
);

-- Índices
CREATE INDEX circle_memberships_user_id_idx ON circle_memberships(user_id);
CREATE INDEX circle_memberships_circle_user_id_idx ON circle_memberships(circle_user_id);
CREATE INDEX circle_memberships_status_idx ON circle_memberships(status);
```

**Notas:**

- `UNIQUE(user_id, circle_user_id)`: evita duplicados.
- `CHECK (user_id != circle_user_id)`: no auto-relación.
- `ON DELETE CASCADE`: si un perfil se elimina, sus membresías se eliminan.
- La bidireccionalidad se mantiene en la capa de aplicación (cada relación tiene dos filas).

---

## Tabla: supports

Interacciones de apoyo entre miembros del Circle. Inmutable.

```sql
CREATE TABLE supports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL CHECK (length(message) >= 1 AND length(message) <= 200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CHECK (from_user_id != to_user_id)
);

-- Índices
CREATE INDEX supports_to_user_id_idx ON supports(to_user_id, created_at DESC);
CREATE INDEX supports_from_user_id_idx ON supports(from_user_id, created_at DESC);
```

**Notas:**

- Sin FK a circle_memberships: el apoyo debe sobrevivir aunque la membresía cambie de estado.
- Sin `updated_at`: inmutable después de crear.
- `ON DELETE CASCADE`: si un perfil se elimina, sus supports se eliminan.

---

## Tabla: progress_snapshots (opcional, post-MVP)

Métricas precalculadas para rendimiento.

```sql
CREATE TABLE progress_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_commits INTEGER NOT NULL DEFAULT 0,
    weekly_frequency NUMERIC(4,2) NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_days_in_process INTEGER NOT NULL DEFAULT 0,
    returns_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, snapshot_date)
);

CREATE INDEX progress_snapshots_user_id_date_idx
    ON progress_snapshots(user_id, snapshot_date DESC);
```

**Nota:** No implementar en MVP. Evaluar cuando el cálculo de progreso sea lento.

---

## Trigger function: update_updated_at()

Función genérica para actualizar `updated_at` automáticamente.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Trigger function: handle_new_user()

Crea perfil automáticamente cuando un usuario se registra en Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

---

## Resumen de tablas MVP

| Tabla                | Columnas | FKs                   | Índices | Core |
| -------------------- | -------- | --------------------- | ------- | ---- |
| `profiles`           | 9        | 1 (auth.users)        | 0 (PK)  | Sí   |
| `commits`            | 11       | 1 (profiles)          | 3       | Sí   |
| `reflections`        | 9        | 2 (profiles, commits) | 2       | No   |
| `circle_memberships` | 7        | 2 (profiles ×2)       | 3       | Sí   |
| `supports`           | 6        | 2 (profiles ×2)       | 2       | No   |

**Total:** 5 tablas, 8 FKs, 10 índices.

---

## Decisiones tomadas

1. **5 tablas en MVP**: profiles, commits, reflections, circle_memberships, supports.
2. **Soft delete en todas**: `deleted_at` en todas. Los datos nunca se pierden.
3. **Commits inmutables**: sin `updated_at`. Solo cambia `visibility`.
4. **Reflections editables**: con `updated_at`. El insight personal puede refinarse.
5. **Circle bidireccional**: dos filas por relación. Simplifica consultas.
6. **Supports sin FK a circle_memberships**: el apoyo sobrevive a cambios de membresía.
7. **JSONB para evidence**: flexible, sin esquema fijo.
8. **Triggers para `updated_at` y creación de perfil**.

## Alternativas descartadas

- **Enums de PostgreSQL en lugar de CHECK constraints.** Descartado porque las migraciones de enums son más complejas. CHECK constraints son más flexibles.
- **Cascade eliminar supports al eliminar circle_membership.** Descartado porque el apoyo es parte de la historia compartida y debe sobrevivir.
- **Tabla de commit_types.** Descartado porque los tipos son libres (texto definido por usuario). Evaluar si se estandarizan.
- **Tabla de moods separada.** Descartado porque el mood se almacena como columna en commits (intensity).

## Riesgos

- La inmutabilidad de Commits puede frustrar a usuarios que quieran corregir errores. Solución: permitir editar `title` y `note` en el futuro si es necesario.
- La bidireccionalidad de circle_memberships requiere lógica de aplicación para mantener ambas filas sincronizadas.
- Soft delete puede llevar a acumulación de datos. Monitorear crecimiento.

## Preguntas abiertas

- ¿Debemos añadir un campo `mood` a commits? Decisión: no en MVP. Evaluar para v2.
- ¿Debe `updated_at` en reflections actualizarse también al cambiar `visibility`? Decisión: sí, cualquier cambio cuenta.
- ¿Progress snapshots deben actualizarse con trigger o background job? Decisión: background job (cron diario).

## Próximo documento

`docs/database/03-relations.md` — Documentación detallada de relaciones, cardinalidad y estrategias ON DELETE.
