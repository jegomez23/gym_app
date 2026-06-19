# 13 - Data Infrastructure Plan

> Proposito de este documento: transformar el contrato canonico
> `docs/database/12-mvp-data-contract.md` en una arquitectura Supabase lista
> para implementar, sin escribir todavia migraciones, SQL ni codigo de
> aplicacion.

Estado: Pendiente de aprobacion antes de implementar migraciones.

Fuente de verdad conceptual: `docs/database/12-mvp-data-contract.md`.

---

## 1. Auditoria

### Que existe

- Aplicacion Next.js `16.2.7` con App Router.
- React `19.2.4`, TypeScript `6.0.3`, Tailwind CSS `4`.
- SDK instalado: `@supabase/supabase-js` `^2.106.2`.
- Cliente browser minimo en `lib/supabase/client.ts`.
- Rutas actuales: `/`, `/commit`, `/circle`, `/archive`, `/profile`.
- Estado de producto basado en mock data y Zustand.
- Tipos manuales actuales en `types/commit.ts` y `types/circle.ts`.
- Documentacion amplia en `docs/database/`.
- Contrato canonico aprobado en `docs/database/12-mvp-data-contract.md`.
- `knowledge/DATABASE.md` ya apunta al contrato canonico.

### Que falta

- Directorio `supabase/`.
- `supabase/config.toml`.
- Migraciones versionadas.
- `supabase/seed.sql`.
- Estrategia formal de datos demo/dev.
- Politicas RLS implementadas.
- Triggers implementados.
- Funciones SQL/RPC implementadas.
- Vistas implementadas.
- Tipos generados por Supabase.
- Cliente Supabase server-side para App Router.
- Helpers SSR/cookies para Auth.
- Proxy de Next.js para refresh de sesion si se adopta Supabase SSR.
- Test runner para pruebas de base de datos.
- Variables de entorno documentadas para Supabase local/remoto.
- CI que ejecute migraciones y validaciones.

### Contradicciones que siguen abiertas

- Drizzle ORM aparece como plan en documentos, pero no esta instalado y el
  contrato actual no lo necesita. Esto no bloquea la base de datos; queda como
  decision de arquitectura de aplicacion.
- Documentos historicos anteriores a `12-mvp-data-contract.md` todavia contienen
  decisiones antiguas. No bloquean si se mantiene la jerarquia: prevalece el
  contrato canonico.
- `knowledge/CURRENT_STATE.md` aun lista algunas contradicciones de base de
  datos que ya fueron cerradas por el contrato. Debe actualizarse cuando esta
  fase quede aprobada.
- Next.js se ejecuta en version 16.2.7. Los documentos locales indican que
  "Middleware" ahora se llama `proxy.ts`; cualquier plan que diga middleware
  debe traducirse a Proxy.

### Que bloquea la implementacion

No hay bloqueo conceptual de dominio. El modelo esta congelado.

Bloqueos operativos antes de escribir migraciones:

- Confirmar que se usara Supabase CLI como herramienta local y de CI.
- Crear estructura `supabase/`.
- Definir orden exacto de migraciones.
- Definir estrategia RLS antes de crear politicas.
- Definir estrategia de testing antes de tocar produccion.
- Decidir si se instala `@supabase/ssr` para App Router y Auth con cookies.

---

## 2. Arquitectura Supabase

Supabase sera propietario de:

- PostgreSQL.
- Auth.
- RLS.
- Migrations.
- Seed local/dev.
- Tipos generados.
- Edge Functions futuras.

Next.js sera consumidor de:

- Cliente server-side autenticado por cookies.
- Cliente browser con anon key.
- Server Actions para mutaciones.
- Server Components para lecturas iniciales.
- Route Handlers solo para integraciones HTTP externas o callbacks.
- Proxy de Next.js para checks ligeros de sesion/redireccion, no para
  autorizacion profunda.

La estructura Supabase sera local al repo y versionada. El dashboard de Supabase
no debe ser fuente manual de esquema.

### Estructura de carpetas propuesta

```text
supabase/
  config.toml
  README.md
  seed.sql
  migrations/
    20260619_0001_extensions.sql
    20260619_0002_profiles.sql
    20260619_0003_commits.sql
    20260619_0004_reflections.sql
    20260619_0005_circle_memberships.sql
    20260619_0006_supports.sql
    20260619_0007_indexes.sql
    20260619_0008_triggers.sql
    20260619_0009_rls.sql
    20260619_0010_views.sql
    20260619_0011_functions.sql
    20260619_0012_seed_contract.sql
  functions/
    README.md
  types/
    database.generated.ts
    README.md
```

Notas:

- `migrations/` contiene solo cambios de esquema o datos controlados.
- `seed.sql` contiene datos locales repetibles.
- `functions/` queda preparado para Edge Functions futuras, sin funciones MVP
  obligatorias.
- `types/database.generated.ts` es generado, no editado manualmente.
- No se crean migraciones fuera de `supabase/migrations/`.

---

## 3. Estrategia de migraciones

### Naming convention

Formato:

```text
YYYYMMDD_NNNN_short_description.sql
```

Reglas:

- Fecha UTC o fecha de trabajo del proyecto.
- `NNNN` incremental dentro de la fecha.
- Nombre corto, en ingles, snake_case.
- Una responsabilidad por archivo.
- No editar migraciones ya aplicadas; crear una nueva.

### Orden

1. Extensiones y utilidades base.
2. Tablas core en orden de dependencia.
3. Restricciones de dominio que no dependan de tablas futuras.
4. Indices.
5. Triggers.
6. RLS.
7. Vistas.
8. Funciones/RPC.
9. Seeds contractuales/dev.

### Rollback strategy

- En desarrollo local: `supabase db reset` sera el camino normal.
- En preview: recrear base desde migraciones cuando sea posible.
- En produccion: no se asume rollback destructivo automatico.
- Toda migracion riesgosa requiere:
  - backup previo,
  - migracion forward de correccion,
  - plan de datos,
  - verificacion post-deploy.
- Cambios destructivos futuros se hacen en fases: add, backfill, switch, remove.

### Branching

- Cada PR que toque esquema incluye sus migraciones.
- No se mezclan migraciones conceptualmente independientes.
- Si dos ramas crean migraciones con mismo numero, se renumera antes de merge.
- La rama principal siempre debe poder aplicar todas las migraciones desde cero.

### Versionado

- El repositorio versiona migraciones, config y seed.
- El esquema real se deriva del historial de migraciones.
- Los tipos generados se actualizan cuando cambie el esquema.

### Seeds, demo y desarrollo

- `seed.sql` es para desarrollo local.
- Datos demo deben representar usuarios y situaciones reales.
- No se usan datos aleatorios sin significado.
- Seeds no deben requerir service secrets en cliente.
- Seeds no representan datos de produccion.

---

## 4. Plan de implementacion por migraciones

### 0001 - Extensions

Responsabilidad: habilitar extensiones y funciones utilitarias base necesarias
por el esquema.

Incluye:

- UUID generation si aplica.
- Helpers genericos de timestamps.

No incluye:

- Tablas.
- Politicas RLS.
- Datos demo.

### 0002 - Profiles

Responsabilidad: crear `profiles` y su relacion uno a uno con `auth.users`.

Incluye:

- Tabla `profiles`.
- Restricciones de campos.
- FK a Auth.
- Trigger/contrato de creacion automatica de profile si se decide ubicarlo aqui
  o en migracion de triggers.

No incluye:

- Commits.
- Circle.

### 0003 - Commits

Responsabilidad: crear la fuente atomica de evidencia.

Incluye:

- Tabla `commits`.
- FK a `profiles`.
- Checks de visibilidad, intensidad, duracion y limites.
- Inmutabilidad preparada para enforcement posterior.

No incluye:

- Reflections.
- Indices optimizados.
- RLS.

### 0004 - Reflections

Responsabilidad: crear insights estrictamente asociados a Commits.

Incluye:

- Tabla `reflections`.
- `commit_id` obligatorio.
- FK a `commits`.
- FK a `profiles`.
- Checks de visibilidad, tipo y contenido.

No incluye:

- Reflections independientes.

### 0005 - Circle Memberships

Responsabilidad: crear relaciones Circle direccionales y preparadas para
reciprocidad.

Incluye:

- Tabla `circle_memberships`.
- FKs a `profiles`.
- Unicidad por par direccional.
- No auto-relacion.
- Checks de estado y fechas.

No incluye:

- Logica de reciprocidad si se concentra en triggers.

### 0006 - Supports

Responsabilidad: crear apoyos verbales entre miembros.

Incluye:

- Tabla `supports`.
- FKs a emisor y receptor.
- No auto-support.
- Limites de mensaje.

No incluye:

- Validacion de Circle activa si se concentra en triggers.

### 0007 - Indexes

Responsabilidad: acelerar consultas reales del producto.

Incluye:

- Indices por propietario y tiempo.
- Indices para relaciones Circle.
- Indices para supports por receptor/emisor.
- Indices parciales para `deleted_at IS NULL` cuando aporten valor.

No incluye:

- Indices especulativos.

### 0008 - Triggers

Responsabilidad: garantizar invariantes que la aplicacion no debe poder romper.

Incluye:

- `updated_at` para tablas editables.
- Creacion automatica de profile desde Auth.
- Reciprocidad Circle.
- Inmutabilidad de Commit.
- Validacion de ownership Reflection/Commit.
- Validacion de Support entre Circle activo.

No incluye:

- Politicas RLS.

### 0009 - RLS

Responsabilidad: activar y definir autorizacion final por tabla.

Incluye:

- Enable RLS.
- Politicas SELECT/INSERT/UPDATE/DELETE por tabla.
- Reglas de visibility.
- Reglas Circle.

No incluye:

- Cambios de estructura.

### 0010 - Views

Responsabilidad: simplificar lecturas seguras y derivadas.

Incluye:

- Vistas no materializadas para proyecciones comunes si aportan claridad.

No incluye:

- Datos persistidos derivados.

### 0011 - Functions

Responsabilidad: exponer calculos derivados o validaciones complejas como RPC.

Incluye:

- Contratos para Presence, Journey, Shared History y Progress.

No incluye:

- Materializaciones de metricas.

### 0012 - Seed Contract

Responsabilidad: datos de desarrollo alineados con el dominio.

Incluye:

- Usuarios demo.
- Profiles.
- Commits.
- Reflections asociadas.
- Circle reciproco.
- Supports.

No incluye:

- Datos de produccion.

---

## 5. Estrategia de tipos

### Tipos generados por Supabase

Viven en:

```text
supabase/types/database.generated.ts
```

Reglas:

- Nunca editar manualmente.
- Regenerar despues de cualquier migracion aplicada.
- Usar como fuente para tipos de tablas, inserts, updates y RPC.
- Deben entrar en revision de PR junto con la migracion que los cambia.

### Tipos manuales

Viven en:

```text
types/
features/*/types.ts
```

Responsabilidad:

- DTOs de UI.
- View models.
- Tipos de formularios.
- Estados de pantalla.

Reglas:

- No duplicar literalmente tipos de tabla si pueden derivarse.
- No incluir columnas privadas que la UI no necesite.
- Adaptar nombres de DB snake_case a nombres de UI solo en la capa DTO.

### Tipos que nunca se modifican a mano

- `Database`.
- `Tables`.
- `TablesInsert`.
- `TablesUpdate`.
- Tipos de RPC generados.

### Tipos actuales a migrar

- `CommitFeeling` debe desaparecer del modelo persistente porque Mood no existe.
- `TrainingFocus` puede mapearse a `commits.type` como texto libre/sugerido.
- `CommitIntensity` debe alinearse con `light | steady | deep` en persistencia,
  aunque la UI pueda mostrar etiquetas capitalizadas.
- `CircleActivity` debe convertirse en DTO derivado de Commits, Profiles y
  Supports.

---

## 6. Estrategia RLS

### Autenticacion

- Toda operacion de dominio requiere usuario autenticado.
- `auth.uid()` es la identidad tecnica.
- `profiles.id` coincide con `auth.uid()`.
- El cliente browser usa anon key y queda protegido por RLS.
- Server Actions usan cliente server-side con cookies de usuario, no service role.
- Service role queda reservado para tareas administrativas fuera del cliente.

### Ownership

- Una fila propia es aquella cuyo propietario directo coincide con `auth.uid()`.
- En `commits`, propietario es `user_id`.
- En `reflections`, propietario es `user_id` y debe coincidir con el propietario
  del Commit.
- En `supports`, emisor y receptor tienen permisos distintos.
- En `circle_memberships`, ambos perfiles involucrados pueden ver la relacion.

### Lectura

`profiles`:

- Usuario lee su propio profile.
- Usuario lee profiles de miembros Circle activos.
- Lectura publica futura solo si se decide producto; no necesaria para MVP.

`commits`:

- Propietario lee sus Commits no eliminados.
- Circle activo lee Commits con `visibility = 'circle'`.
- Cualquier autenticado puede leer Commits con `visibility = 'public'`, si el
  producto expone vistas publicas.
- Commits soft-deleted no aparecen en lecturas normales.

`reflections`:

- Propietario lee sus Reflections.
- Circle activo lee Reflections con `visibility = 'circle'` cuando el Commit
  asociado tambien sea visible para Circle y no este eliminado.
- No hay lectura publica de Reflections en MVP.

`circle_memberships`:

- Cada usuario lee relaciones donde participa.

`supports`:

- Emisor y receptor leen el Support.
- Puede leerse en historia compartida por ambos miembros de esa relacion.

### Escritura

`profiles`:

- El usuario inserta/recibe su profile por trigger de Auth.
- El usuario actualiza solo su propio profile.

`commits`:

- El usuario crea solo Commits propios.
- El usuario no puede crear Commits para otro profile.

`reflections`:

- El usuario crea solo Reflections propias.
- El Commit asociado debe existir, no estar soft-deleted y pertenecer al mismo
  usuario.

`circle_memberships`:

- La creacion debe pasar por funcion/Server Action controlada.
- La DB garantiza reciprocidad.
- El usuario solo puede iniciar relaciones donde participa.

`supports`:

- El usuario crea Support como `from_user_id = auth.uid()`.
- Debe existir Circle activo entre emisor y receptor.

### Actualizacion

`profiles`:

- Propietario actualiza campos editables.

`commits`:

- Propietario solo actualiza `visibility` y `deleted_at`.
- No se actualizan `title`, `type`, `recorded_at`, `duration_minutes`,
  `intensity`, `note` ni `evidence`.

`reflections`:

- Propietario puede actualizar `content`, `type`, `visibility`, `deleted_at`.
- No puede cambiar `commit_id` ni `user_id`.

`circle_memberships`:

- Participantes pueden pausar/finalizar segun flujo de producto.
- Cambios deben sincronizar contraparte.
- No se cambian participantes.

`supports`:

- No se actualiza contenido.
- Solo soft delete operativo si se habilita.

### Borrado logico

- El DELETE fisico desde cliente debe estar prohibido para tablas de dominio.
- Borrado de usuario/cuenta se trata como proceso administrativo con cuidado
  adicional.
- Soft delete usa `deleted_at`.

---

## 7. Estrategia de indices

### Indices necesarios

`profiles`:

- PK por `id` basta para MVP.

`commits`:

- Por `user_id` + `recorded_at DESC`: timeline propio y Journey.
- Por `user_id` + `created_at DESC`: actividad reciente.
- Por `visibility` + `recorded_at DESC`: lecturas publicas o Circle filtradas.
- Parcial para `deleted_at IS NULL` si las consultas activas lo justifican.

`reflections`:

- Por `commit_id`: detalle de Commit.
- Por `user_id` + `created_at DESC`: lista propia de Reflections.

`circle_memberships`:

- Unico por `user_id`, `circle_user_id`.
- Por `user_id`, `status`: listar Circle activo.
- Por `circle_user_id`, `status`: validar reciprocidad y permisos inversos.

`supports`:

- Por `to_user_id` + `created_at DESC`: inbox/presencia de apoyo.
- Por `from_user_id` + `created_at DESC`: apoyos enviados.
- Por par emisor/receptor + `created_at DESC`: historia compartida.

### Consultas que aceleran

- Home/Today.
- Timeline/Journey.
- Presence del Circle.
- Detalle de Commit con Reflections.
- Validaciones RLS de Circle.
- Shared History.
- Supports recientes.

### Indices innecesarios en MVP

- Indice por Mood: no existe Mood.
- Indice por Progress: no existe tabla Progress.
- Indice por Journey: no existe tabla Journey.
- Full-text search en Reflections: fuera del MVP.
- Indices para `progress_snapshots`: tabla fuera del MVP.
- Indices amplios sobre JSON evidence salvo que una consulta real lo exija.

### Coste esperado

- Mas indices aceleran lectura pero encarecen inserts de Commits y Supports.
- Como Commit es accion principal, los indices iniciales deben ser pocos y
  atados a pantallas reales.
- Indices parciales pueden reducir coste si casi todas las consultas excluyen
  soft-deleted.

---

## 8. Estrategia de triggers

### update_updated_at

Existe para mantener trazabilidad en tablas editables.

Garantiza:

- `profiles.updated_at` cambia cuando se edita el perfil.
- `reflections.updated_at` cambia cuando se edita una Reflection.

Sin el:

- La app podria olvidar actualizar timestamps.

### handle_new_user

Existe para crear `profiles` automaticamente desde `auth.users`.

Garantiza:

- Todo usuario autenticado tiene profile.
- La app no depende de una segunda escritura fragil despues del signup.

Sin el:

- Habra usuarios autenticados sin entidad de dominio.

### ensure_circle_reciprocity

Existe para hacer Circle bidireccional en la base de datos.

Garantiza:

- A -> B no existe sin B -> A.
- Cambios de estado relevantes se reflejan en ambas direcciones.

Sin el:

- La app podria dejar relaciones unilaterales y romper el dominio.

### enforce_commit_immutability

Existe para impedir ediciones de contenido principal.

Garantiza:

- Solo `visibility` y `deleted_at` cambian tras crear.

Sin el:

- Server Actions o clientes futuros podrian reescribir historia.

### validate_reflection_commit_owner

Existe para asegurar que Reflection pertenece al mismo usuario que su Commit.

Garantiza:

- Nadie crea una Reflection propia sobre un Commit ajeno.
- `commit_id` no apunta a datos inconsistentes.

Sin el:

- RLS podria volverse compleja y fragil ante datos mal formados.

### validate_support_circle_active

Existe para asegurar que Support solo se crea entre miembros Circle activos.

Garantiza:

- Supports obedecen la regla de relacion significativa.

Sin el:

- La app podria crear apoyos entre personas sin Circle activo.

---

## 9. Estrategia de funciones SQL

Las funciones SQL son contratos de lectura derivada. No persisten Progress,
Journey, Presence ni Shared History.

### get_circle_presence

Entrada:

- Usuario actual implicito o `profile_id` validado.
- Ventana temporal opcional.

Salida:

- Miembros Circle activos.
- Ultimo Commit visible.
- Senal de actividad reciente.
- Conteo ligero de actividad del dia.

Responsabilidad:

- Calcular presencia desde Commits visibles y Circle activo.

Dependencias:

- `circle_memberships`.
- `profiles`.
- `commits`.

### get_journey_timeline

Entrada:

- Usuario objetivo permitido.
- Cursor/paginacion.
- Rango temporal opcional.

Salida:

- Items ordenados por tiempo con Commits y Reflections asociadas.

Responsabilidad:

- Reconstruir Journey sin tabla `journeys`.

Dependencias:

- `commits`.
- `reflections`.
- RLS de visibilidad.

### get_shared_history

Entrada:

- `other_profile_id`.
- Usuario actual implicito.

Salida:

- Fecha de inicio Circle.
- Commits compartibles desde `joined_at`.
- Supports entre ambos.
- Resumen derivado.

Responsabilidad:

- Mostrar memoria compartida sin persistir tabla de historia.

Dependencias:

- `circle_memberships`.
- `commits`.
- `supports`.

### get_progress_summary

Entrada:

- Usuario objetivo permitido.
- Rango temporal.

Salida:

- Total Commits.
- Dias activos.
- Frecuencia.
- Streak actual si se define operacionalmente.
- Ultimo regreso si aplica.

Responsabilidad:

- Calcular Progress desde Commits.

Dependencias:

- `commits`.

### get_commit_detail

Entrada:

- `commit_id`.

Salida:

- Commit permitido.
- Reflections asociadas permitidas.
- Datos minimos de profile.

Responsabilidad:

- Centralizar lectura de detalle segura.

Dependencias:

- `commits`.
- `reflections`.
- `profiles`.

---

## 10. Estrategia de vistas

### Vistas utiles

`active_circle_memberships`:

- Simplifica filtros de Circle activo y no eliminado.
- Ayuda a RLS y consultas de Presence.

`visible_commits`:

- Proyeccion de Commits no eliminados con datos minimos de profile.
- Debe respetar RLS; no reemplaza politicas.

`commit_reflection_counts`:

- Conteo derivado por Commit para UI si hace falta.

`support_history`:

- Proyeccion de supports no eliminados con emisor/receptor basico.

### Consultas que simplifican

- Circle overview.
- Presence.
- Perfil de miembro Circle.
- Detalle de Commit.
- Shared History.

### Que NO debe ser una vista

- Progress persistido.
- Journey persistido.
- Identity.
- Knowledge.
- Mood.
- Cualquier vista que intente saltarse RLS.
- Vistas materializadas en MVP, salvo prueba de rendimiento posterior.

---

## 11. Estrategia de seeds

### Usuarios demo

Los usuarios demo deben representar situaciones reales:

- Mara: consistente, varios Commits recientes.
- Noah: vuelve despues de una pausa.
- Leo: miembro silencioso con poca actividad reciente.
- Dia: usuario principal de prueba con Circle activo.

### Commits demo

Casos:

- Commit simple con solo titulo/fecha.
- Commit con duracion e intensidad.
- Commit privado.
- Commit visible para Circle.
- Commit publico si la UI lo necesita.
- Commit soft-deleted para probar exclusion.

### Circle demo

Casos:

- Relacion activa reciproca.
- Relacion pausada.
- Relacion finalizada.
- Intento invalido documentado en tests, no necesariamente en seed final.

### Supports demo

Casos:

- Support reciente entre miembros activos.
- Support historico que permanece tras relacion pausada/finalizada.
- Mensajes verbales reales, no placeholders genericos.

### Reflections demo

Casos:

- Reflection tecnica asociada a Commit.
- Reflection emocional asociada a Commit.
- Reflection privada.
- Reflection visible para Circle cuando el Commit lo permite.

Regla principal:

- Ninguna Reflection sin Commit.

---

## 12. Estrategia de testing

### Migraciones

- Aplicar desde base limpia.
- Reaplicar via reset local.
- Validar orden y dependencias.
- Verificar que tipos generados cambian cuando cambia esquema.

### Rollback

- En local: reset completo.
- En produccion: pruebas de migraciones forward de correccion.
- Ensayar restauracion desde backup antes de operaciones destructivas futuras.

### RLS

Probar como:

- Usuario anonimo.
- Usuario propietario.
- Usuario Circle activo.
- Usuario sin relacion.
- Usuario receptor de Support.
- Usuario emisor de Support.

Casos:

- Lectura propia permitida.
- Lectura Circle permitida solo por visibilidad.
- Escritura ajena rechazada.
- Update de contenido Commit rechazado.
- Soft delete propio permitido.
- DELETE fisico cliente rechazado.

### Funciones

- Entradas validas.
- Entradas de usuario sin permisos.
- Paginacion.
- Rangos temporales.
- Salidas vacias.
- Respeto de RLS.

### Triggers

- Profile automatico en signup.
- Reciprocidad Circle.
- Sin recursion infinita.
- Sin auto-relacion.
- Inmutabilidad Commit.
- Reflection owner igual al Commit owner.
- Support exige Circle activo.

### Integridad

- FKs.
- Unicidad.
- Checks.
- Soft delete.
- `ended_at` coherente con `status`.

### Rendimiento

- EXPLAIN en consultas principales.
- Volumen simulado para Commits.
- Volumen simulado para Circle.
- Costo de triggers en inserts masivos.
- Tiempo de Presence y Journey bajo carga razonable.

---

## 13. Integracion con Next.js

Segun los docs locales de Next.js 16:

- Pages y layouts son Server Components por defecto.
- Client Components se usan para estado, eventos y APIs del navegador.
- Server Actions son Server Functions invocables por POST y deben verificar
  auth/autorizacion internamente.
- Route Handlers viven en `app/**/route.ts` y no reemplazan Server Actions para
  mutaciones de UI.
- Middleware ahora se llama Proxy y vive en `proxy.ts`.
- Proxy no debe usarse para data fetching lento ni autorizacion profunda.

### Server Components

Uso:

- Lecturas iniciales de Home, Timeline, Circle, Profile.
- Llamar a DAL server-only.
- Pasar DTOs minimos y serializables a Client Components.

No usar para:

- Mutaciones como efecto de render.
- Pasar registros completos de DB al cliente.

### Server Actions

Uso:

- Crear Commit.
- Cambiar visibility.
- Soft delete Commit.
- Crear/editar Reflection.
- Crear Circle membership mediante flujo controlado.
- Cambiar estado Circle.
- Enviar Support.
- Editar Profile.

Reglas:

- Cada action re-verifica auth.
- Cada action delega en DAL server-only.
- Cada action valida input.
- Cada action devuelve DTO minimo o estado de exito.
- Cada action invalida ruta/tag correspondiente.

### Route Handlers

Uso:

- Webhooks futuros.
- Callbacks OAuth si Supabase lo requiere.
- Integraciones externas o Edge Functions proxy si se aprueba.

No usar para:

- Mutaciones normales de formularios internos si Server Actions bastan.

### Proxy

Uso:

- Redirect optimista de usuarios no autenticados.
- Refresh/propagacion ligera de sesion si Supabase SSR lo requiere.

No usar para:

- Consultas de dominio.
- Autorizacion final.
- Reglas de Circle.

### Client Components

Uso:

- Formularios interactivos.
- Estados pending con `useActionState`.
- Optimistic UI si se adopta.
- Realtime subscriptions futuras.

No usar para:

- Acceso directo a datos privados con service role.
- Saltarse Server Actions en escrituras.

### Supabase SSR

Plan:

- Instalar/adoptar helper SSR oficial compatible con Next App Router.
- Crear cliente server en `lib/supabase/server.ts`.
- Crear cliente browser en `lib/supabase/client.ts`.
- Mantener service role fuera del bundle cliente.
- Usar cookies para sesion.
- RLS sigue siendo el limite final.

### Data Access Layer

Ubicacion propuesta:

```text
data/
  auth.ts
  profiles.ts
  commits.ts
  reflections.ts
  circle.ts
  supports.ts
```

Reglas:

- Cada archivo importa `server-only`.
- Devuelve DTOs, no registros crudos.
- Centraliza auth y autorizacion de aplicacion.
- No reemplaza RLS.

---

## 14. Checklist de produccion

### Seguridad

- RLS habilitado en todas las tablas de dominio.
- No hay policies permisivas temporales.
- Service role nunca expuesto al cliente.
- Server Actions verifican auth y autorizacion.
- Inputs validados.
- Return values minimizados.
- Secrets solo en entorno server.
- Proxy no decide permisos finales.

### Rendimiento

- Indices aplicados para consultas principales.
- EXPLAIN revisado para Home, Timeline, Circle, Presence y Shared History.
- Paginacion obligatoria en historiales.
- Sin queries N+1 en Server Components.
- Triggers medidos en inserts frecuentes.

### Integridad

- Reflection siempre tiene Commit.
- Circle siempre reciproco.
- Support exige Circle activo al crear.
- Commit content immutable.
- Soft delete consistente.
- Checks de longitud y enums conceptuales.

### Backups

- Backup automatico configurado en Supabase.
- Restauracion probada antes de produccion real.
- Plan de exportacion de datos de usuario.
- Plan para cambios destructivos futuros.

### Observabilidad

- Logs de errores de Server Actions.
- Logs de errores Supabase.
- Alertas de fallos de migracion.
- Alertas de latencia en funciones RPC criticas.

### Monitorizacion

- Uso de CPU/IO de DB.
- Tiempos de queries principales.
- Crecimiento de tablas.
- Crecimiento de soft-deleted rows.
- Fallos RLS inesperados.

### Auditoria

- Migraciones revisadas en PR.
- Tipos generados revisados.
- Cambios de RLS revisados con matriz de usuarios.
- Ningun cambio manual de dashboard sin migracion equivalente.

### Escalabilidad

- Commits paginados desde MVP.
- Circle limitado por producto.
- No materializar metricas hasta que haya necesidad medida.
- Preparar particionamiento/caches solo post-MVP con datos reales.

---

## Aprobacion requerida

Con este documento aprobado, el siguiente paso sera crear la estructura
`supabase/` y empezar la implementacion incremental de migraciones en el orden
definido, validando cada migracion antes de continuar.
