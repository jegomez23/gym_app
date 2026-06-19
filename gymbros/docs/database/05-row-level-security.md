# 05 — Row Level Security

> **Propósito de este documento:** Diseñar completamente las políticas de Row Level Security (RLS) para Gym Circle. La seguridad debe vivir en PostgreSQL, no en el frontend. Estas políticas asumen que la API es pública: cualquier cliente puede conectarse a Supabase, pero RLS protege cada fila.

---

## Principios RLS

1. **RLS habilitado en TODAS las tablas.** No hay excepciones. Si una tabla no tiene RLS, está expuesta.
2. **Denegar por defecto.** `CREATE POLICY` permite acceso explícito. Lo que no está permitido, está denegado.
3. **El usuario solo ve lo que necesita.** Mínimo privilegio posible.
4. **RLS es la última línea de defensa.** Server Actions también verifican autenticación y autorización, pero RLS asegura que incluso si una Server Action tiene un bug, los datos están protegidos.
5. **Las políticas se prueban con usuarios no autenticados.** Deben fallar.

---

## Habilitar RLS

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE supports ENABLE ROW LEVEL SECURITY;
```

---

## Políticas: profiles

### SELECT

```sql
-- El propio usuario ve su perfil completo
-- Los miembros del Circle ven nombre y avatar
-- Nadie más ve nada
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "profiles_select_circle" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM circle_memberships
            WHERE (user_id = auth.uid() AND circle_user_id = profiles.id
                   OR circle_user_id = auth.uid() AND user_id = profiles.id)
            AND status = 'active'
        )
    );
```

**¿Qué ve cada quién?**
| Usuario | Propio perfil | Perfil de miembros del Circle | Perfil de no miembros |
|---------|---------------|------------------------------|----------------------|
| Autenticado | Todo | Nombre, avatar, bio | Nada |
| No autenticado | Nada | Nada | Nada |

### INSERT

```sql
-- Solo el propio usuario puede crear su perfil
-- (El trigger handle_new_user crea el perfil automáticamente)
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());
```

### UPDATE

```sql
-- Solo el propio usuario puede editar su perfil
CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
```

### DELETE

```sql
-- Soft delete: solo el propio usuario puede "eliminar" su perfil
-- (Establece deleted_at, no elimina físicamente)
CREATE POLICY "profiles_delete" ON profiles
    FOR UPDATE
    USING (id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (id = auth.uid() AND deleted_at IS NOT NULL);
```

**Nota:** No hay DELETE físico. El soft delete se hace con UPDATE de `deleted_at`.

---

## Políticas: commits

### SELECT

```sql
-- El propietario ve todos sus Commits (no eliminados)
-- El Circle ve Commits con visibility = 'circle' de sus miembros
-- El público ve Commits con visibility = 'public'
CREATE POLICY "commits_select_own" ON commits
    FOR SELECT
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "commits_select_circle" ON commits
    FOR SELECT
    USING (
        visibility = 'circle'
        AND deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM circle_memberships
            WHERE user_id = commits.user_id
            AND circle_user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "commits_select_public" ON commits
    FOR SELECT
    USING (visibility = 'public' AND deleted_at IS NULL);
```

### INSERT

```sql
-- Solo el propietario puede crear sus Commits
CREATE POLICY "commits_insert" ON commits
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

### UPDATE

```sql
-- Solo el propietario puede actualizar visibility o soft delete
-- No puede modificar recorded_at, type, intensity
CREATE POLICY "commits_update" ON commits
    FOR UPDATE
    USING (user_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (user_id = auth.uid());
```

### DELETE

```sql
-- No hay DELETE físico. Soft delete vía UPDATE.
-- La política de UPDATE cubre el soft delete.
```

---

## Políticas: reflections

### SELECT

```sql
-- El propietario ve todas sus Reflections
-- El Circle ve Reflections con visibility = 'circle'
CREATE POLICY "reflections_select_own" ON reflections
    FOR SELECT
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "reflections_select_circle" ON reflections
    FOR SELECT
    USING (
        visibility = 'circle'
        AND deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM circle_memberships
            WHERE user_id = reflections.user_id
            AND circle_user_id = auth.uid()
            AND status = 'active'
        )
    );
```

### INSERT

```sql
-- Solo el propietario puede crear sus Reflections
CREATE POLICY "reflections_insert" ON reflections
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

### UPDATE

```sql
-- Solo el propietario puede editar sus Reflections
-- (Reflections son editables, a diferencia de Commits)
CREATE POLICY "reflections_update" ON reflections
    FOR UPDATE
    USING (user_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (user_id = auth.uid());
```

### DELETE

```sql
-- Soft delete vía UPDATE. Cubierto por reflections_update.
```

---

## Políticas: circle_memberships

### SELECT

```sql
-- Solo las dos personas involucradas ven la membresía
CREATE POLICY "memberships_select" ON circle_memberships
    FOR SELECT
    USING (
        (user_id = auth.uid() OR circle_user_id = auth.uid())
        AND deleted_at IS NULL
    );
```

### INSERT

```sql
-- Solo puedes crear membresías donde tú eres user_id
-- (La aplicación creará dos filas: A→B y B→A)
CREATE POLICY "memberships_insert" ON circle_memberships
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
```

### UPDATE

```sql
-- Cualquiera de las dos personas puede actualizar el estado
CREATE POLICY "memberships_update" ON circle_memberships
    FOR UPDATE
    USING (user_id = auth.uid() OR circle_user_id = auth.uid())
    WITH CHECK (user_id = auth.uid() OR circle_user_id = auth.uid());
```

### DELETE

```sql
-- Soft delete vía UPDATE. Cubierto por memberships_update.
```

---

## Políticas: supports

### SELECT

```sql
-- El remitente y el destinatario ven el support
CREATE POLICY "supports_select" ON supports
    FOR SELECT
    USING (
        (from_user_id = auth.uid() OR to_user_id = auth.uid())
        AND deleted_at IS NULL
    );
```

### INSERT

```sql
-- Solo puedes enviar supports como from_user_id
CREATE POLICY "supports_insert" ON supports
    FOR INSERT
    WITH CHECK (from_user_id = auth.uid());
```

### UPDATE

```sql
-- Los supports son inmutables. No se actualizan.
-- No hay UPDATE policy.
```

### DELETE

```sql
-- Soft delete: solo el remitente puede eliminar su support
-- (Cubierto por UPDATE de deleted_at)
-- No hay política de DELETE físico.
```

---

## Resumen de políticas

| Tabla              | SELECT                                                                      | INSERT                 | UPDATE                                      | DELETE                              |
| ------------------ | --------------------------------------------------------------------------- | ---------------------- | ------------------------------------------- | ----------------------------------- |
| profiles           | Propio + Circle nombre/avatar                                               | Solo propio (trigger)  | Solo propio                                 | Soft delete (UPDATE)                |
| commits            | Propio + Circle (si visibility = circle) + Público (si visibility = public) | Solo propietario       | Solo propietario (visibility y soft delete) | No (soft delete vía UPDATE)         |
| reflections        | Propio + Circle (si visibility = circle)                                    | Solo propietario       | Solo propietario                            | Soft delete (UPDATE)                |
| circle_memberships | Involucrados                                                                | Solo como user_id      | Involucrados                                | Soft delete (UPDATE)                |
| supports           | Involucrados                                                                | Solo como from_user_id | No (inmutable)                              | Soft delete solo remitente (UPDATE) |

---

## Decisiones tomadas

1. **RLS en todas las tablas.** Sin excepciones.
2. **Denegar por defecto.** Solo se concede acceso explícito.
3. **SELECT policies separadas por visibilidad.** `_own`, `_circle`, `_public` donde aplica.
4. **Supports inmutables.** Sin UPDATE policy.
5. **Circle memberships visibles solo para involucrados.** Nadie más ve quién está en el Circle de quién.
6. **Soft delete vía UPDATE.** No hay DELETE físico.

## Alternativas descartadas

- **Política única de SELECT.** Descartado porque la visibilidad varía según el rol (propio, circle, público).
- **Permitir SELECT público de profiles.** Descartado porque viola la privacidad. Solo nombre y avatar son visibles para el Circle.
- **Permitir DELETE físico.** Descartado porque usamos soft delete.

## Riesgos

- Las policies con subqueries (EXISTS en circle_memberships) pueden ser lentas si hay muchas membresías. Los índices en `circle_memberships.user_id` y `circle_memberships.circle_user_id` mitigan esto.
- Las policies de SELECT para Commits requieren tres policies separadas; PostgreSQL aplica todas y devuelve la unión. Esto puede ser confuso en debugging.
- Si un usuario se autentica pero su perfil no existe (raro, pero posible si el trigger falla), todas las consultas devolverán vacío.

## Preguntas abiertas

- ¿Debemos permitir SELECT de `profiles.avatar_url` y `profiles.name` para el Circle, o solo `name`? Decisión: ambos.
- ¿Supports debe permitir que el destinatario elimine supports recibidos? Decisión: no, solo el remitente.
- ¿Debe haber una política para que el admin (service_role) pueda leer todo? Decisión: sí, mediante el cliente admin con service_role key.

## Próximo documento

`docs/database/06-storage.md` — Definición de buckets de almacenamiento, permisos, tamaños y nomenclatura.
