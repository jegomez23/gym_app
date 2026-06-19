# 04 — Indexing

> **Propósito de este documento:** Diseñar todos los índices del MVP de Gym Circle. Cada índice debe justificarse por las consultas que optimiza. No queremos índices innecesarios que ralenticen las escrituras.

---

## Filosofía de índices

1. **Cada índice responde a una consulta específica.** No crear índices "por si acaso."
2. **Los índices compuestos primero por columnas de igualdad, luego por rango.** `WHERE user_id = ? ORDER BY recorded_at DESC` → índice en `(user_id, recorded_at)`.
3. **Las FKs no tienen índices automáticos en PostgreSQL.** Hay que crearlos explícitamente.
4. **JSONB no se indexa a menos que haya consultas de filtro sobre su contenido.** (No las hay en MVP.)

---

## Índices para profiles

```sql
-- No se necesitan índices adicionales.
-- La PK (id) ya está indexada automáticamente.
-- profiles no tiene consultas por otros campos.
```

**Consultas que soporta:**

- `SELECT * FROM profiles WHERE id = ?` — PK index.
- `SELECT * FROM profiles WHERE deleted_at IS NULL` — No tiene índice porque no hay muchas filas eliminadas.

---

## Índices para commits

```sql
-- Índice principal: timeline del usuario
CREATE INDEX commits_user_id_recorded_at_idx
    ON commits(user_id, recorded_at DESC);

-- Índice para filtrar por visibilidad
CREATE INDEX commits_user_id_visibility_idx
    ON commits(user_id, visibility);

-- Índice para consultas globales (journey, presence)
CREATE INDEX commits_recorded_at_idx
    ON commits(recorded_at DESC);
```

| Índice                            | Consulta que optimiza                                                        | Coste                                 |
| --------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| `commits_user_id_recorded_at_idx` | Timeline del usuario: `WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 20` | Bajo. Es el índice principal.         |
| `commits_user_id_visibility_idx`  | Filtrar Commits del Circle: `WHERE user_id = ? AND visibility = 'circle'`    | Bajo. Consulta frecuente para Circle. |
| `commits_recorded_at_idx`         | Presence global: `WHERE recorded_at > now() - interval '24 hours'`           | Medio. Solo necesario para presencia. |

**Índices que NO creamos:**

- `commits_type_idx` — No filtramos por tipo de Commit en MVP.
- `commits_intensity_idx` — No filtramos por intensidad.
- `commits_deleted_at_idx` — No filtramos por soft delete (siempre excluimos deleted_at en queries).

---

## Índices para reflections

```sql
-- Timeline de reflections del usuario
CREATE INDEX reflections_user_id_created_at_idx
    ON reflections(user_id, created_at DESC);

-- Búsqueda por Commit asociado
CREATE INDEX reflections_commit_id_idx
    ON reflections(commit_id);
```

| Índice                               | Consulta que optimiza                                                 | Coste                                             |
| ------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------- |
| `reflections_user_id_created_at_idx` | Timeline de Reflections: `WHERE user_id = ? ORDER BY created_at DESC` | Bajo. Principal consulta de Reflections.          |
| `reflections_commit_id_idx`          | Reflections de un Commit: `WHERE commit_id = ?`                       | Bajo. Consulta ocasional desde detalle de Commit. |

---

## Índices para circle_memberships

```sql
-- Mi Circle (membresías donde yo soy user_id)
CREATE INDEX circle_memberships_user_id_idx
    ON circle_memberships(user_id);

-- Quién me tiene en su Circle (membresías donde yo soy circle_user_id)
CREATE INDEX circle_memberships_circle_user_id_idx
    ON circle_memberships(circle_user_id);

-- Filtrar por estado
CREATE INDEX circle_memberships_status_idx
    ON circle_memberships(status);
```

| Índice                                  | Consulta que optimiza                                             | Coste                                       |
| --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| `circle_memberships_user_id_idx`        | Mi Circle activo: `WHERE user_id = ? AND status = 'active'`       | Bajo. Consulta principal de Circle.         |
| `circle_memberships_circle_user_id_idx` | Quién me agregó: `WHERE circle_user_id = ? AND status = 'active'` | Bajo. Necesario para la bidireccionalidad.  |
| `circle_memberships_status_idx`         | Filtrar por estado: `WHERE status = 'active'`                     | Bajo. Útil para presencia y shared history. |

**Nota:** Para la consulta más frecuente (`WHERE user_id = ? AND status = 'active'`), PostgreSQL puede usar `circle_memberships_user_id_idx` y filtrar por status sin índice adicional (si hay pocos status diferentes). Si el rendimiento es insuficiente, crear `circle_memberships_user_id_status_idx`.

---

## Índices para supports

```sql
-- Supports recibidos (timeline)
CREATE INDEX supports_to_user_id_idx
    ON supports(to_user_id, created_at DESC);

-- Supports enviados (timeline)
CREATE INDEX supports_from_user_id_idx
    ON supports(from_user_id, created_at DESC);
```

| Índice                      | Consulta que optimiza                                              | Coste                                 |
| --------------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| `supports_to_user_id_idx`   | Apoyos recibidos: `WHERE to_user_id = ? ORDER BY created_at DESC`  | Bajo. Consulta principal de supports. |
| `supports_from_user_id_idx` | Apoyos enviados: `WHERE from_user_id = ? ORDER BY created_at DESC` | Bajo. Consulta ocasional.             |

---

## Resumen de índices MVP

| Tabla              | Índice                                  | Columnas                          | Tipo   |
| ------------------ | --------------------------------------- | --------------------------------- | ------ |
| commits            | `commits_user_id_recorded_at_idx`       | `(user_id, recorded_at DESC)`     | B-tree |
| commits            | `commits_user_id_visibility_idx`        | `(user_id, visibility)`           | B-tree |
| commits            | `commits_recorded_at_idx`               | `(recorded_at DESC)`              | B-tree |
| reflections        | `reflections_user_id_created_at_idx`    | `(user_id, created_at DESC)`      | B-tree |
| reflections        | `reflections_commit_id_idx`             | `(commit_id)`                     | B-tree |
| circle_memberships | `circle_memberships_user_id_idx`        | `(user_id)`                       | B-tree |
| circle_memberships | `circle_memberships_circle_user_id_idx` | `(circle_user_id)`                | B-tree |
| circle_memberships | `circle_memberships_status_idx`         | `(status)`                        | B-tree |
| supports           | `supports_to_user_id_idx`               | `(to_user_id, created_at DESC)`   | B-tree |
| supports           | `supports_from_user_id_idx`             | `(from_user_id, created_at DESC)` | B-tree |

**Total:** 10 índices en 4 tablas. 0 índices en profiles (PK es suficiente).

---

## Decisiones tomadas

1. **10 índices en MVP.** Todos B-tree. No hay índices GIN, GiST ni hash.
2. **Índices compuestos para las consultas principales.** `(user_id, recorded_at DESC)` es el más importante.
3. **Índices individuales para FKs.** PostgreSQL no indexa FKs automáticamente.
4. **Sin índices en profiles.** La PK es suficiente para las consultas esperadas.
5. **Sin índices en JSONB.** No hay consultas de filtro sobre `evidence`.

## Alternativas descartadas

- **Índice en `commits.type`.** Descartado porque no filtramos por tipo en MVP.
- **Índice en `commits.deleted_at`.** Descartado porque siempre excluimos `deleted_at` en condiciones `WHERE`, y pocos registros estarán eliminados.
- **Índice GIN en `evidence` (JSONB).** Descartado porque no hacemos consultas sobre el contenido de evidence.
- **Índice parcial en `circle_memberships` con `WHERE status = 'active'`.** Descartado por simplicidad; evaluar si el rendimiento lo requiere.

## Riesgos

- El índice `commits_recorded_at_idx` puede ser grande si hay millones de Commits. Monitorear tamaño.
- La ausencia de índice en `deleted_at` puede hacer que las consultas con soft delete scanneen muchas filas. Solución: asegurar que las consultas siempre incluyan `deleted_at IS NULL`.
- PostgreSQL puede no usar un índice si el planner estima que scanear la tabla es más rápido (tablas pequeñas). Esto es normal.

## Preguntas abiertas

- ¿Necesitamos un índice compuesto `circle_memberships (user_id, status)`? Decisión inicial: no, `user_id` + filtro `status` es suficientemente rápido.
- ¿Debemos añadir un índice en `commits.user_id` solo? No, el índice compuesto `(user_id, recorded_at)` cubre esa consulta.

## Próximo documento

`docs/database/05-row-level-security.md` — Diseño completo de RLS: quién puede leer, insertar, actualizar y borrar en cada tabla.
