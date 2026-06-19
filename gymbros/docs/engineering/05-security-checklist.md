# 05 — Security Checklist

> **Propósito de este documento:** Checklist completa de seguridad para Gym Circle. Todo item debe verificarse antes del primer commit a producción. Esta lista es parte del Definition of Done de cada sprint.

---

## Autenticación

- [ ] Supabase Auth configurado con email + contraseña
- [ ] OAuth configurado (Google, GitHub) con client IDs correctos
- [ ] Middleware de Next.js protege rutas autenticadas
- [ ] AuthGuard en componente protege rutas en cliente
- [ ] Sesión expira después de inactividad (configurable en Supabase)
- [ ] Rate limiting en login/register (Supabase Auth lo maneja por defecto)
- [ ] No hay credenciales hardcodeadas en el código

## Row Level Security (RLS)

- [ ] RLS habilitado en TODAS las tablas públicas
- [ ] `profiles` — solo propio usuario y Circle pueden leer
- [ ] `commits` — propietario puede todo; Circle solo lectura si visibility = 'circle'
- [ ] `circle_memberships` — solo usuarios involucrados pueden leer
- [ ] `reflections` — propietario puede todo; Circle solo si visibility = 'circle'
- [ ] Políticas RLS probadas con usuarios no autenticados (deben fallar)
- [ ] Políticas RLS probadas con usuarios ajenos (deben fallar)
- [ ] No hay políticas `FOR ALL` (usar `FOR SELECT`, `FOR INSERT`, etc.)

## Validaciones

- [ ] Zod schemas en todas las Server Actions
- [ ] Validación del lado servidor nunca depende del cliente
- [ ] `user_id` se fuerza desde el servidor, nunca se acepta del cliente
- [ ] límites de longitud en todos los campos de texto
- [ ] Sanitización de HTML en campos que se muestran a otros usuarios
- [ ] Validación de tipos de archivo en uploads (solo imágenes, formatos permitidos)

## Variables de entorno

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — pública (no es secreta)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — pública (diseñada para estar en el cliente)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — NUNCA en el cliente, solo en Server Actions admin
- [ ] `.env.example` sin valores reales
- [ ] `.env.local` en `.gitignore`
- [ ] Variables de entorno documentadas en `docs/development/environment.md`

## Secretos

- [ ] Ninguna API key hardcodeada en el código
- [ ] service_role key nunca se usa en Server Actions normales (solo en operaciones admin)
- [ ] Tokens de OAuth almacenados en variables de entorno de Vercel
- [ ] No hay secretos en el bundle del cliente

## Supabase Storage

- [ ] Buckets tienen RLS habilitado
- [ ] Bucket de avatares: solo el propietario puede subir/eliminar
- [ ] Bucket de evidencia (fotos de Commits): solo el propietario y Circle pueden leer
- [ ] Límite de tamaño de archivo en uploads (5MB para avatares, 20MB para evidencia)
- [ ] Tipos MIME permitidos (images: jpg, png, webp)

## API y Server Actions

- [ ] Server Actions verifican autenticación antes de ejecutar
- [ ] Server Actions verifican autorización (el usuario puede modificar este recurso)
- [ ] No hay Server Actions que expongan datos de otros usuarios
- [ ] Rate limiting en Server Actions sensibles (login, register, createCommit)
- [ ] No hay SQL injection (Supabase cliente lo maneja)

## Dependencias

- [ ] `npm audit` pasa sin vulnerabilidades críticas
- [ ] Dependencias actualizadas a versiones estables
- [ ] No hay dependencias innecesarias

## Checklist pre-deploy

Cada sprint debe verificar:

- [ ] RLS probado en todas las tablas nuevas
- [ ] Server Actions nuevas verifican autenticación
- [ ] No hay secretos expuestos
- [ ] Zod schemas cubren todos los campos
- [ ] `npm audit` pasa

## Próximo documento

`docs/engineering/06-performance-guidelines.md` — Reglas de rendimiento para el desarrollo.
