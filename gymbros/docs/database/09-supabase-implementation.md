# 09 — Supabase Implementation

> **Propósito de este documento:** Traducir todo el diseño de base de datos a la configuración concreta de Supabase: Auth, Storage, Realtime, Edge Functions, CLI, entornos y desarrollo local.

---

## Resumen de configuración

| Servicio       | Configuración                               | Estado |
| -------------- | ------------------------------------------- | ------ |
| Auth           | Email + contraseña + OAuth (Google, GitHub) | MVP    |
| Database       | PostgreSQL 15+ con RLS                      | MVP    |
| Storage        | 2 buckets: avatars, evidence                | MVP    |
| Realtime       | Presencia del Circle (tabla commits)        | MVP    |
| Edge Functions | No en MVP                                   | Future |

---

## 1. Auth

### Configuración en Supabase Dashboard

**Providers:**

- Email: Habilitado. Confirmación de email: deshabilitada en MVP (habilitar después).
- Google: Habilitado. Client ID y Secret desde Google Cloud Console.
- GitHub: Habilitado. Client ID y Secret desde GitHub OAuth Apps.

**URLs de redirección:**

```
http://localhost:3000/auth/callback  (desarrollo)
https://gymcircle.vercel.app/auth/callback  (producción)
```

**Configuración de sesión:**

- Access token expiry: 1 hora
- Refresh token expiry: 30 días
- Max refresh tokens: 5

### Clientes de Supabase

**Browser client (`lib/supabase/client.ts`):**

```tsx
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server client (`lib/supabase/server.ts`):**

```tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.delete(name, options);
        },
      },
    }
  );
}
```

**Admin client (`lib/supabase/admin.ts`):**

```tsx
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

**Nota:** El admin client solo se usa en operaciones que requieren saltarse RLS (tareas administrativas, migraciones). Nunca se expone al cliente.

---

## 2. Database

### Configuración inicial

1. Crear proyecto en Supabase Dashboard
2. Obtener `Project URL` y `anon key` de la página de configuración de la API
3. Configurar variables de entorno locales

### Migraciones

Las migraciones se aplican manualmente o con el script `migrate.sh`:

```bash
# Desarrollo local
./supabase/migrate.sh "postgresql://postgres:password@localhost:54322/postgres"

# Producción
./supabase/migrate.sh $SUPABASE_DB_URL
```

**Nota:** En producción, usar la URL de conexión directa a PostgreSQL desde Supabase Dashboard (Settings → Database → Connection string).

### Generación de tipos

```bash
supabase gen types typescript --local > types/supabase.ts
```

Este comando genera tipos TypeScript automáticamente desde el esquema de la base de datos. Los tipos generados deben usarse en lugar de tipos manuales para las tablas.

---

## 3. Storage

### Buckets

| Bucket     | Público      | Tamaño máximo | Tipos MIME                        |
| ---------- | ------------ | ------------- | --------------------------------- |
| `avatars`  | Sí (lectura) | 5MB           | image/jpeg, image/png, image/webp |
| `evidence` | No           | 20MB          | image/jpeg, image/png, image/webp |

### Creación de buckets

```sql
-- Ejecutar en SQL Editor de Supabase
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('evidence', 'evidence', FALSE, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp']);
```

### Políticas RLS para Storage

Las políticas de Storage se definen en `docs/database/06-storage.md` y se incluyen en la migración `0008_enable_rls.sql`.

---

## 4. Realtime

### Habilitar Realtime

En Supabase Dashboard:

1. Ir a Database → Replication
2. Habilitar Realtime para la tabla `commits`
3. Eventos: INSERT (solo necesitamos detectar nuevos Commits para presencia)

### Uso en la aplicación

```tsx
// features/circle/hooks/useCirclePresence.ts
export function useCirclePresence(circleId: string) {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel("circle-commits")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "commits" },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["circle", circleId, "presence"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId]);

  return useQuery({
    queryKey: ["circle", circleId, "presence"],
    queryFn: () => getCirclePresence(circleId),
  });
}
```

**Nota:** En MVP, Realtime solo se usa para presencia del Circle. No para notificaciones ni otros fines.

---

## 5. Edge Functions (Future)

No se implementan en MVP. Se evaluarán para:

- Procesamiento de imágenes (redimensionar avatares)
- Notificaciones push
- Cálculos pesados de progreso

---

## 6. CLI de Supabase

### Instalación

```bash
npm install -g supabase
# o
brew install supabase/tap/supabase
```

### Inicialización

```bash
supabase init
```

### Desarrollo local

```bash
supabase start
```

Esto inicia Supabase localmente con Docker (PostgreSQL, Auth, Storage, Realtime).

### Enlace con proyecto remoto

```bash
supabase link --project-ref <project-id>
```

### Aplicar migraciones

```bash
supabase db push
```

---

## 7. Entornos

| Entorno    | Supabase                        | Vercel            | Variables de entorno          |
| ---------- | ------------------------------- | ----------------- | ----------------------------- |
| Local      | `supabase start` (Docker)       | `npm run dev`     | `.env.local`                  |
| Preview    | Proyecto Supabase de desarrollo | Preview deploy    | Variables en Vercel Dashboard |
| Producción | Proyecto Supabase de producción | Producción deploy | Variables en Vercel Dashboard |

### Variables de entorno por entorno

**Local (`.env.local`):**

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key local)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service role key local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Producción (Vercel):**

```
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key producción)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service role key producción)
NEXT_PUBLIC_APP_URL=https://gymcircle.vercel.app
```

---

## 8. Secrets

| Secreto                         | ¿Dónde se usa?        | ¿Expuesto al cliente? |
| ------------------------------- | --------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Cliente y servidor    | Sí (pública)          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor    | Sí (pública)          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Solo servidor (admin) | No                    |

**Regla:** `SUPABASE_SERVICE_ROLE_KEY` nunca debe estar en el bundle del cliente. Solo se usa en `lib/supabase/admin.ts` y en operaciones que requieren saltarse RLS.

---

## Decisiones tomadas

1. **Auth con Supabase.** Email + OAuth (Google, GitHub).
2. **Storage con 2 buckets.** avatars (público) y evidence (privado).
3. **Realtime solo para presencia.** No para notificaciones en MVP.
4. **Edge Functions no en MVP.** Evaluar para v2.
5. **CLI de Supabase para desarrollo local.** `supabase start` para PostgreSQL local.
6. **Migraciones manuales con script.** Control total sobre el orden.

## Alternativas descartadas

- **Auth0 en lugar de Supabase Auth.** Descartado porque Supabase Auth está integrado con la base de datos y RLS.
- **Realtime para todas las tablas.** Descartado porque solo necesitamos presencia. Realtime en todas las tablas sería costoso.
- **Edge Functions para procesamiento de imágenes en MVP.** Descartado porque el procesamiento en cliente es suficiente.

## Riesgos

- El plan gratuito de Supabase tiene límites (2GB de base de datos, 2GB de ancho de banda, 50,000 usuarios). Monitorear uso.
- Realtime tiene límite de conexiones simultáneas en el plan gratuito. Evaluar upgrade si es necesario.
- La URL de conexión directa a PostgreSQL en producción expone la base de datos a internet. Usar SSL y restringir IPs.

## Preguntas abiertas

- ¿Debemos usar Supabase CLI para migraciones en CI/CD? Decisión: evaluar después del MVP.
- ¿Necesitamos un proyecto de Supabase separado para desarrollo y producción? Decisión: sí, para no mezclar datos.

## Próximo documento

`docs/database/10-query-strategy.md` — Estrategia de consultas: cómo accederemos a los datos desde la aplicación.
