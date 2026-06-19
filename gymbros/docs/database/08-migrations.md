# 08 — Migrations

> **Propósito de este documento:** Definir la estrategia de migraciones para Gym Circle. Orden de ejecución, dependencias entre migraciones, versionado, rollback y datos de prueba (seeds).

---

## Principios

1. **Las migraciones son el único mecanismo para modificar el esquema.** No se hacen cambios manuales en producción.
2. **Cada migración es una unidad atómica.** O todo se ejecuta o todo se revierte.
3. **Las migraciones son idempotentes.** `CREATE OR REPLACE`, `IF NOT EXISTS`, `IF EXISTS`.
4. **Las migraciones se versionan con timestamp.** Orden cronológico estricto.
5. **No se modifican migraciones ya aplicadas.** Los cambios nuevos van en nuevas migraciones.

---

## Convención de nombres

```
YYYYMMDD_HHMM_description.sql
```

**Ejemplos:**

```
20260619_0001_create_profiles.sql
20260619_0002_create_commits.sql
20260619_0003_create_reflections.sql
```

---

## Orden de migraciones MVP

### Fase 1: Fundación

| #   | Archivo                              | Dependencias | Tablas        | Rollback                        |
| --- | ------------------------------------ | ------------ | ------------- | ------------------------------- |
| 1   | `20260619_0001_create_functions.sql` | Ninguna      | - (funciones) | `DROP FUNCTION IF EXISTS`       |
| 2   | `20260619_0002_create_profiles.sql`  | 1            | `profiles`    | `DROP TABLE IF EXISTS profiles` |

**Descripción:**

1. Crear funciones base: `update_updated_at_column()`, `handle_new_user()`.
2. Crear tabla `profiles` + trigger `on_auth_user_created` + trigger `update_profiles_updated_at`.

### Fase 2: Core (Commits + Reflections)

| #   | Archivo                                | Dependencias | Tablas        | Rollback                           |
| --- | -------------------------------------- | ------------ | ------------- | ---------------------------------- |
| 3   | `20260619_0003_create_commits.sql`     | 2            | `commits`     | `DROP TABLE IF EXISTS commits`     |
| 4   | `20260619_0004_create_reflections.sql` | 3            | `reflections` | `DROP TABLE IF EXISTS reflections` |

**Descripción:** 3. Crear tabla `commits` + índices. 4. Crear tabla `reflections` + índices + trigger `update_reflections_updated_at`.

### Fase 3: Circle

| #   | Archivo                                       | Dependencias | Tablas               | Rollback                                  |
| --- | --------------------------------------------- | ------------ | -------------------- | ----------------------------------------- |
| 5   | `20260619_0005_create_circle_memberships.sql` | 2            | `circle_memberships` | `DROP TABLE IF EXISTS circle_memberships` |
| 6   | `20260619_0006_create_supports.sql`           | 5            | `supports`           | `DROP TABLE IF EXISTS supports`           |

**Descripción:** 5. Crear tabla `circle_memberships` + índices + trigger `ensure_bidirectional_membership`. 6. Crear tabla `supports` + índices.

### Fase 4: Funciones de consulta

| #   | Archivo                                    | Dependencias | Tablas        | Rollback                  |
| --- | ------------------------------------------ | ------------ | ------------- | ------------------------- |
| 7   | `20260619_0007_create_query_functions.sql` | 5, 6         | - (funciones) | `DROP FUNCTION IF EXISTS` |

**Descripción:** 7. Crear funciones: `get_circle_presence()`, `get_journey_timeline()`, `get_shared_history()`.

### Fase 5: RLS

| #   | Archivo                        | Dependencias | Tablas        | Rollback                |
| --- | ------------------------------ | ------------ | ------------- | ----------------------- |
| 8   | `20260619_0008_enable_rls.sql` | 2-6          | - (políticas) | `DROP POLICY IF EXISTS` |

**Descripción:** 8. Habilitar RLS en todas las tablas. Crear todas las políticas RLS.

### Fase 6: Seeds

| #   | Archivo                            | Dependencias | Tablas    | Rollback               |
| --- | ---------------------------------- | ------------ | --------- | ---------------------- |
| 9   | `20260619_0009_seed_test_data.sql` | 1-8          | - (datos) | `TRUNCATE ... CASCADE` |

**Descripción:** 9. Datos de prueba para desarrollo local.

---

## Dependencias entre migraciones

```
1. functions (sin dependencias)
    │
    ▼
2. profiles (depende de 1)
    │
    ├──► 3. commits (depende de 2)
    │       │
    │       ▼
    │      4. reflections (depende de 3)
    │
    └──► 5. circle_memberships (depende de 2)
            │
            ▼
           6. supports (depende de 5)

7. query_functions (depende de 5, 6)
8. rls_policies (depende de 2-6)
9. seeds (depende de 1-8)
```

---

## Estrategia de rollback

Cada migración debe poder revertirse:

```sql
-- Ejemplo de migración con rollback
-- UP
CREATE TABLE profiles (...);
CREATE TRIGGER ...;

-- DOWN
DROP TRIGGER IF EXISTS ... ON profiles;
DROP TABLE IF EXISTS profiles;
```

**Reglas:**

- Rollback en orden inverso al de aplicación.
- `DROP TABLE IF EXISTS ... CASCADE` para tablas.
- `DROP FUNCTION IF EXISTS ...` para funciones.
- `DROP POLICY IF EXISTS ...` para políticas RLS.
- `DROP TRIGGER IF EXISTS ...` para triggers.

---

## Seeds (datos de prueba)

```sql
-- 20260619_0009_seed_test_data.sql
-- Datos de prueba para desarrollo local
-- NO ejecutar en producción

-- Usuarios de prueba (requiere auth.users, crear manualmente en Supabase)
-- Estos usuarios deben existir en auth.users antes de ejecutar este seed
INSERT INTO profiles (id, name, onboarding_completed) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Mara', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Noah', TRUE),
    ('00000000-0000-0000-0000-000000000003', 'Iris', FALSE),
    ('00000000-0000-0000-0000-000000000004', 'Leo', TRUE);

-- Circle memberships (bidireccional)
INSERT INTO circle_memberships (user_id, circle_user_id, status) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'active'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'active'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'active'),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'active');

-- Commits de prueba
INSERT INTO commits (user_id, title, type, recorded_at, intensity, visibility) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Reinicio de tren inferior', 'training', NOW() - INTERVAL '1 day', 'steady', 'circle'),
    ('00000000-0000-0000-0000-000000000001', 'Disciplina de tren superior', 'training', NOW() - INTERVAL '2 days', 'deep', 'circle'),
    ('00000000-0000-0000-0000-000000000002', 'Sesión de retorno', 'training', NOW() - INTERVAL '1 day', 'light', 'circle'),
    ('00000000-0000-0000-0000-000000000004', 'Full body constante', 'training', NOW(), 'steady', 'circle');

-- Supports de prueba
INSERT INTO supports (from_user_id, to_user_id, message) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Bien ahí'),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Qué constancia');
```

---

## Ubicación de archivos

```
supabase/
├── migrations/
│   ├── 20260619_0001_create_functions.sql
│   ├── 20260619_0002_create_profiles.sql
│   ├── 20260619_0003_create_commits.sql
│   ├── 20260619_0004_create_reflections.sql
│   ├── 20260619_0005_create_circle_memberships.sql
│   ├── 20260619_0006_create_supports.sql
│   ├── 20260619_0007_create_query_functions.sql
│   ├── 20260619_0008_enable_rls.sql
│   └── 20260619_0009_seed_test_data.sql
├── seed.sql                    ← Symlink o copia de 0009 para desarrollo
└── migrate.sh                  ← Script para aplicar migraciones
```

---

## Script de migración (migrate.sh)

```bash
#!/bin/bash
# Aplica migraciones en orden
# Uso: ./supabase/migrate.sh <db_url>

DB_URL=$1
MIGRATIONS_DIR="supabase/migrations"

if [ -z "$DB_URL" ]; then
    echo "Uso: ./supabase/migrate.sh <db_url>"
    exit 1
fi

echo "Aplicando migraciones..."
for file in $(ls $MIGRATIONS_DIR/*.sql | sort); do
    echo "  → $(basename $file)"
    psql "$DB_URL" -f "$file" -q
    if [ $? -ne 0 ]; then
        echo "Error en $(basename $file). Deteniendo."
        exit 1
    fi
done
echo "Migraciones aplicadas correctamente."
```

---

## Decisiones tomadas

1. **9 migraciones en MVP.** 6 de esquema + 1 de funciones + 1 de RLS + 1 de seeds.
2. **Migraciones con timestamp.** Orden cronológico estricto.
3. **Rollback explícito.** Cada migración tiene su contraparte DOWN.
4. **Seeds separados de las migraciones de esquema.** Los seeds son datos de prueba, no estructura.
5. **Script bash para aplicar migraciones.** Simple y predecible.

## Alternativas descartadas

- **Usar herramientas de migración de Supabase (CLI).** Descartado porque queremos control total sobre el orden y contenido.
- **Migraciones con Prisma.** Descartado porque no usamos Prisma.
- **Un solo archivo SQL con todo.** Descartado porque dificulta el debugging y rollback.

## Riesgos

- El script `migrate.sh` no maneja transacciones entre migraciones. Si la migración 3 falla, las migraciones 1 y 2 ya se aplicaron.
- Los seeds de prueba en producción podrían exponer datos si no se ejecutan en el entorno correcto.
- La migración RLS (0008) debe aplicarse después de crear las tablas. Si se aplica antes, las políticas fallarán.

## Preguntas abiertas

- ¿Debemos usar Supabase CLI (`supabase db push`) en lugar de scripts manuales? Decisión inicial: manual para control total. Evaluar Supabase CLI para CI/CD.
- ¿Los seeds deben ser un archivo separado o parte de la migración 0008? Decisión: separado, para no mezclar datos de prueba con esquema.

## Próximo documento

`docs/database/09-supabase-implementation.md` — Traducción de todo lo anterior a la configuración de Supabase: Auth, Storage, Realtime, Edge Functions, CLI.
