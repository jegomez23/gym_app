# 07 — Triggers & Functions

> **Propósito de este documento:** Documentar todos los triggers y funciones PostgreSQL necesarios para el MVP de Gym Circle. Solo se incluyen los que mejoran la consistencia del dominio o automatizan procesos necesarios. No se añade lógica por comodidad.

---

## Filosofía

1. **Triggers solo para consistencia del dominio.** No para lógica de negocio. La lógica de negocio vive en Server Actions.
2. **Funciones solo para operaciones complejas o reutilizables.** No crear funciones para consultas simples que pueden hacerse directamente.
3. **SECURITY DEFINER solo cuando es necesario.** Por defecto, SECURITY INVOKER.

---

## Trigger: update_updated_at_column()

**Propósito:** Actualizar automáticamente la columna `updated_at` en tablas que se modifican.

**Tablas que lo usan:** `profiles`, `reflections`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Triggers asociados:**

```sql
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
    BEFORE UPDATE ON reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Justificación:** Automatizar el mantenimiento de `updated_at` evita errores humanos y asegura consistencia.

---

## Trigger: handle_new_user()

**Propósito:** Crear automáticamente un perfil en `profiles` cuando un usuario se registra en Supabase Auth.

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

**Justificación:** No podemos depender de que la Server Action de registro cree el perfil. El trigger asegura que siempre haya un perfil, incluso si el registro ocurre por OAuth o por un flujo que no pase por nuestra Server Action.

**SECURITY DEFINER:** Necesario porque el trigger se ejecuta en el contexto de `auth.users`, al que el usuario normal no tiene acceso.

---

## Function: get_circle_presence()

**Propósito:** Obtener el estado de presencia del Circle de un usuario (quiénes han hecho Commits recientemente).

```sql
CREATE OR REPLACE FUNCTION get_circle_presence(p_user_id UUID)
RETURNS TABLE (
    member_id UUID,
    member_name TEXT,
    last_commit_at TIMESTAMPTZ,
    is_active_today BOOLEAN,
    current_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        c.last_commit_at,
        c.last_commit_at >= NOW() - INTERVAL '24 hours' AS is_active_today,
        -- Streak calculation (simplified for MVP)
        COUNT(*) FILTER (
            WHERE c.last_commit_at >= NOW() - INTERVAL '7 days'
        )::INTEGER AS current_streak
    FROM circle_memberships cm
    JOIN profiles p ON p.id = cm.circle_user_id
    LEFT JOIN LATERAL (
        SELECT recorded_at AS last_commit_at
        FROM commits
        WHERE user_id = cm.circle_user_id
            AND deleted_at IS NULL
            AND visibility IN ('circle', 'public')
        ORDER BY recorded_at DESC
        LIMIT 1
    ) c ON TRUE
    WHERE cm.user_id = p_user_id
        AND cm.status = 'active'
        AND p.deleted_at IS NULL
    ORDER BY c.last_commit_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Justificación:** Calcular la presencia del Circle requiere un JOIN entre circle_memberships, profiles y commits. Una función SQL simplifica la consulta y puede optimizarse más fácilmente que una consulta construida en la aplicación.

**STABLE:** La función no modifica la base de datos, permitiendo optimizaciones de planificación.

---

## Function: get_journey_timeline()

**Propósito:** Obtener los puntos para la visualización del Journey de un usuario.

```sql
CREATE OR REPLACE FUNCTION get_journey_timeline(
    p_user_id UUID,
    p_days INTEGER DEFAULT 90
)
RETURNS TABLE (
    commit_date DATE,
    commit_count BIGINT,
    has_reflection BOOLEAN,
    intensity_mode TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.recorded_at::DATE AS commit_date,
        COUNT(*)::BIGINT AS commit_count,
        BOOL_OR(r.id IS NOT NULL) AS has_reflection,
        MODE() WITHIN GROUP (ORDER BY c.intensity) AS intensity_mode
    FROM commits c
    LEFT JOIN reflections r ON r.commit_id = c.id AND r.deleted_at IS NULL
    WHERE c.user_id = p_user_id
        AND c.deleted_at IS NULL
        AND c.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY c.recorded_at::DATE
    ORDER BY c.recorded_at::DATE DESC;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Justificación:** El Journey requiere agregación diaria de Commits. Hacer esto en SQL es más eficiente que traer todos los Commits y agregar en la aplicación.

**Nota:** Para MVP, esta función es aceptable. Si el rendimiento es insuficiente, se puede reemplazar por una tabla `progress_snapshots` actualizada periódicamente.

---

## Function: get_shared_history()

**Propósito:** Obtener la historia compartida entre dos miembros del Circle.

```sql
CREATE OR REPLACE FUNCTION get_shared_history(
    p_user_id UUID,
    p_circle_user_id UUID
)
RETURNS TABLE (
    days_connected INTEGER,
    total_commits_shared BIGINT,
    supports_sent BIGINT,
    supports_received BIGINT,
    first_commit_at TIMESTAMPTZ
) AS $$
DECLARE
    v_joined_at TIMESTAMPTZ;
BEGIN
    -- Obtener fecha de conexión
    SELECT joined_at INTO v_joined_at
    FROM circle_memberships
    WHERE user_id = p_user_id AND circle_user_id = p_circle_user_id;

    RETURN QUERY
    SELECT
        EXTRACT(DAY FROM NOW() - v_joined_at)::INTEGER AS days_connected,
        COUNT(DISTINCT c.id)::BIGINT AS total_commits_shared,
        COUNT(DISTINCT s_from.id) FILTER (WHERE s_from.from_user_id = p_user_id)::BIGINT AS supports_sent,
        COUNT(DISTINCT s_to.id) FILTER (WHERE s_to.to_user_id = p_user_id)::BIGINT AS supports_received,
        MIN(c.recorded_at) AS first_commit_at
    FROM circle_memberships cm
    LEFT JOIN commits c ON (
        c.user_id = p_circle_user_id
        AND c.deleted_at IS NULL
        AND c.visibility IN ('circle', 'public')
    )
    LEFT JOIN supports s_from ON (
        s_from.from_user_id = p_user_id
        AND s_from.to_user_id = p_circle_user_id
        AND s_from.deleted_at IS NULL
    )
    LEFT JOIN supports s_to ON (
        s_to.from_user_id = p_circle_user_id
        AND s_to.to_user_id = p_user_id
        AND s_to.deleted_at IS NULL
    )
    WHERE cm.user_id = p_user_id
        AND cm.circle_user_id = p_circle_user_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Justificación:** La historia compartida agrega datos de múltiples tablas (circle_memberships, commits, supports). Una función simplifica la consulta y asegura consistencia.

---

## Function: ensure_bidirectional_membership()

**Propósito:** Trigger que asegura la bidireccionalidad de circle_memberships. Cuando se crea una fila A→B, automáticamente crea B→A.

```sql
CREATE OR REPLACE FUNCTION ensure_bidirectional_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está insertando una membresía activa
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        -- Crear la membresía inversa si no existe
        INSERT INTO circle_memberships (user_id, circle_user_id, status, joined_at)
        VALUES (NEW.circle_user_id, NEW.user_id, 'active', NEW.joined_at)
        ON CONFLICT (user_id, circle_user_id) DO UPDATE
        SET status = 'active',
            ended_at = NULL,
            joined_at = CASE
                WHEN circle_memberships.status = 'ended' THEN NEW.joined_at
                ELSE circle_memberships.joined_at
            END;
    END IF;

    -- Si se está actualizando una membresía a 'ended' o 'paused'
    IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        UPDATE circle_memberships
        SET status = NEW.status,
            ended_at = CASE WHEN NEW.status = 'ended' THEN NOW() ELSE NULL END
        WHERE user_id = NEW.circle_user_id
            AND circle_user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_bidirectional_membership_trigger
    AFTER INSERT OR UPDATE ON circle_memberships
    FOR EACH ROW
    EXECUTE FUNCTION ensure_bidirectional_membership();
```

**Justificación:** Automatizar la bidireccionalidad elimina el riesgo de inconsistencias. La aplicación crea una fila (A→B) y el trigger crea automáticamente la fila inversa (B→A).

---

## Resumen de funciones y triggers MVP

| Nombre                                    | Tipo              | Tabla/Función        | Propósito                              |
| ----------------------------------------- | ----------------- | -------------------- | -------------------------------------- |
| `update_updated_at_column()`              | Function          | -                    | Actualiza `updated_at` automáticamente |
| `handle_new_user()`                       | Function          | -                    | Crea perfil al registrarse             |
| `on_auth_user_created`                    | Trigger           | `auth.users`         | Ejecuta `handle_new_user`              |
| `update_profiles_updated_at`              | Trigger           | `profiles`           | Mantiene `updated_at`                  |
| `update_reflections_updated_at`           | Trigger           | `reflections`        | Mantiene `updated_at`                  |
| `get_circle_presence()`                   | Function (STABLE) | -                    | Presencia del Circle                   |
| `get_journey_timeline()`                  | Function (STABLE) | -                    | Datos para Journey visual              |
| `get_shared_history()`                    | Function (STABLE) | -                    | Historia compartida                    |
| `ensure_bidirectional_membership()`       | Function          | -                    | Crea membresía inversa                 |
| `ensure_bidirectional_membership_trigger` | Trigger           | `circle_memberships` | Ejecuta bidireccionalidad              |

---

## Decisiones tomadas

1. **3 funciones de consulta** (STABLE) para presencia, Journey e historia compartida.
2. **3 triggers de consistencia** para `updated_at`, creación de perfil y bidireccionalidad de Circle.
3. **SECURITY DEFINER solo en `handle_new_user`** porque necesita acceso a `auth.users`.
4. **Las funciones de consulta son STABLE** para permitir optimizaciones del planificador.
5. **La bidireccionalidad se maneja con trigger** en lugar de en la aplicación para evitar inconsistencias.

## Alternativas descartadas

- **Manejar bidireccionalidad solo en la aplicación.** Descartado porque si una Server Action falla después de crear una fila, la relación queda inconsistente.
- **Función para calcular Progress.** Descartado porque el Progress se calcula en la aplicación (o en `progress_snapshots` si el rendimiento lo requiere).
- **Trigger para evitar soft delete de perfiles con Commits activos.** Descartado por simplicidad; el soft delete es suficiente.

## Riesgos

- El trigger `ensure_bidirectional_membership` puede causar recursión si no se maneja correctamente (actualizar la fila inversa dispara el trigger nuevamente). La condición `TG_OP = 'INSERT'` y `ON CONFLICT` mitigan esto.
- `get_circle_presence()` puede ser lento con muchos miembros en el Circle. Monitorear y optimizar si es necesario.
- `get_journey_timeline()` puede ser lento con muchos Commits. Considerar `progress_snapshots` si el rendimiento es insuficiente.

## Preguntas abiertas

- ¿Debemos añadir una función `get_progress_metrics()` para centralizar el cálculo de progreso? Decisión: no en MVP, calcular en la aplicación.
- ¿El trigger de bidireccionalidad debe manejar el caso de "rechazar invitación"? Decisión: sí, si se inserta con status = 'ended', no se crea la fila inversa.

## Próximo documento

`docs/database/08-migrations.md` — Estrategia de migraciones: orden, dependencias, versionado, rollback y seeds.
