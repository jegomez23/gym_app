# 00 — Project Architecture

> **Propósito de este documento:** Definir la arquitectura general del proyecto Gym Circle, justificar cada decisión tecnológica desde la filosofía del producto, y establecer las responsabilidades de cada capa del sistema. Este documento debe responder cualquier pregunta sobre por qué usamos lo que usamos y cómo encaja todo.

---

## Arquitectura general

Gym Circle utiliza una **arquitectura híbrida cliente-servidor** con Next.js App Router como el orquestador principal.

El principio rector es: **todo lo que pueda hacerse en servidor debe hacerse en servidor**. El cliente solo debe manejar lo que requiere interactividad en tiempo real.

```
                    ┌──────────────────────────────────┐
                    │         VERCEL (Hosting)          │
                    │  Next.js App Router (RSC + SSR)   │
                    └──────────────────────────────────┘
                                │
              ┌─────────────────┼────────────────────┐
              ▼                 ▼                    ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
     │ Server       │  │ Server       │  │ Supabase         │
     │ Components   │  │ Actions      │  │ (PostgreSQL +    │
     │ (RSC)        │  │ (Mutations)  │  │  Auth + Realtime │
     │ Lectura de   │  │ Escritura    │  │  + Storage)      │
     │ datos        │  │ de datos     │  └──────────────────┘
     └──────────────┘  └──────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          ┌──────────────────┐  ┌──────────────────────┐
          │ TanStack Query   │  │ Zustand (mínimo)     │
          │ Cache + Sincro   │  │ Estado UI efímero    │
          └──────────────────┘  └──────────────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
                    ┌──────────────────────┐
                    │   Client Components  │
                    │   (Interactividad)   │
                    └──────────────────────┘
```

---

## ¿Por qué Next.js App Router?

**Decisión:** Next.js App Router con React Server Components.

**Por qué:**

1. **Server Components nos permiten mover lógica al servidor.** Esto es crucial para la filosofía del producto: la aplicación debe ser rápida, eficiente y no dependiente del cliente. El servidor es quien tiene los datos, no el navegador.
2. **Server Actions simplifican las mutaciones.** No necesitamos API Routes para la mayoría de operaciones. Un Server Action es una función que se ejecuta en el servidor y puede ser llamada desde el cliente. Esto reduce la complejidad de la arquitectura.
3. **Streaming y Suspense permiten cargas progresivas.** El Journey, los Commits, el Dashboard del Circle pueden cargarse en partes, mejorando la percepción de velocidad sin sacrificar datos.
4. **Layouts anidados y route groups** permiten estructurar la navegación de forma que refleje la arquitectura del dominio.

**Qué problema evita:** Evita tener que mantener un backend separado (Express, NestJS, etc.) para funcionalidades que pueden manejarse con Server Components y Server Actions. Reduce la superficie de mantenimiento.

**Alternativas descartadas:**

- **SPA tradicional (Vite + React Router + API separada).** Descartado porque requeriría mantener un backend adicional, aumentando la complejidad operativa y separando lógica que debería estar unida.
- **Remix.** Descartado porque Next.js tiene mejor integración con Vercel y Supabase, además de un ecosistema más maduro para Server Components.
- **Pages Router (Next.js legacy).** Descartado porque App Router es el futuro de Next.js y ofrece Server Components nativos.

---

## ¿Por qué Supabase?

**Decisión:** Supabase como backend-as-a-service (PostgreSQL, Auth, Realtime, Storage).

**Por qué:**

1. **PostgreSQL es la base de datos más madura y flexible.** Las relaciones complejas del dominio (Commits → Circle → Presence → Reflections) requieren una base de datos relacional. PostgreSQL con RLS nos da seguridad a nivel de fila sin necesidad de un backend de API tradicional.
2. **RLS (Row Level Security) es la capa de autorización.** En lugar de escribir middleware de autorización en el backend, definimos políticas directamente en la base de datos. Esto hace que la seguridad sea inherente a los datos, no una capa adicional.
3. **Realtime permite Presence sin polling.** La presencia del Circle puede actualizarse en tiempo real sin necesidad de websockets custom. Esto es crucial para que el Circle se sienta "vivo."
4. **Auth está integrado.** No necesitamos Okta, Auth0 ni ningún proveedor externo. Supabase Auth maneja sesiones, magic links, OAuth (Google, GitHub) y recuperación de contraseñas.
5. **Storage para evidencia.** Las fotos, capturas y cualquier evidencia visual se almacenan en Supabase Storage con políticas RLS.

**Qué problema evita:** Evita tener que configurar y mantener PostgreSQL, gestión de sesiones, websockets y almacenamiento de archivos por separado. Todo está integrado.

**Alternativas descartadas:**

- **Firebase.** Descartado porque Firestore es NoSQL y las relaciones del dominio Gym Circle son inherentemente relacionales. Además, Firebase tiene vendor lock-in más fuerte que Supabase.
- **Backend propio (Node + Express + PostgreSQL local).** Descartado porque añade carga operativa (deploy, monitoreo, backups) sin beneficio real para un equipo pequeño.
- **AWS Amplify.** Descartado por complejidad operativa excesiva para el tamaño del proyecto.

---

## ¿Por qué TailwindCSS + shadcn/ui?

**Decisión:** TailwindCSS v4 + shadcn/ui.

**Por qué:**

1. **TailwindCSS permite un diseño consistente sin escribir CSS personalizado.** Los tokens de diseño (colores, espaciados, tipografía) se definen en `tailwind.config` y se usan consistentemente en toda la aplicación.
2. **shadcn/ui no es una librería de componentes.** Es una colección de componentes copiables y personalizables. Esto significa que tenemos control total sobre cada componente, pero no partimos de cero.
3. **El diseño de Gym Circle debe ser minimalista y consistente.** TailwindCSS + shadcn/ui nos permite lograr eso sin el overhead de una librería de componentes completa (como Material UI o Chakra).

**Alternativas descartadas:**

- **Material UI.** Descartado porque impone una estética que no se alinea con la identidad de Gym Circle (minimalista, calmada, elegante).
- **CSS Modules + CSS vanilla.** Descartado porque TailwindCSS reduce significativamente el tiempo de desarrollo y mantiene consistencia.
- **Styled Components.** Descartado porque Emotion/styled-components añade runtime overhead y no se beneficia de las utilidades de TailwindCSS.

---

## ¿Por qué TanStack Query?

**Decisión:** TanStack Query (React Query) para gestión de estado servidor.

**Por qué:**

1. **Separa estado del servidor (TanStack Query) de estado del cliente (Zustand).** Esta distinción es crucial: los Commits, Progress, Circle Data son estado del servidor. El estado de UI (modales abiertos, formularios en edición) es estado del cliente. TanStack Query maneja la sincronización, el caching y la revalidación del estado del servidor.
2. **Cache optimista para mejor UX.** Cuando una persona registra un Commit, podemos mostrar el resultado inmediatamente en la UI mientras la mutación se completa en el servidor.
3. **Revalidación automática cuando los datos cambian.** No necesitamos lógica manual para refrescar datos después de mutaciones.

**Alternativas descartadas:**

- **Solo Zustand para todo.** Descartado porque Zustand no maneja caching, revalidación ni sincronización con el servidor de forma nativa.
- **SWR.** Descartado porque TanStack Query tiene mejor soporte para mutaciones, cache optimista y devtools.
- **Redux Toolkit Query.** Descartado porque es excesivo para el tamaño del proyecto y añade boilerplate innecesario.

---

## ¿Por qué Zustand (mínimo)?

**Decisión:** Zustand para estado UI efímero y compartido entre componentes no relacionados.

**Por qué:**

1. **No todo estado debe ir al servidor.** El estado del formulario de Commit (campos rellenados pero no enviados), el modal activo, el filtro seleccionado — esto es estado local o compartido que no necesita persistencia.
2. **Zustand es mínimo.** No requiere providers, reducers ni actions. Es un hook con estado. Perfecto para lo que necesitamos (pequeño estado global de UI).

**Qué NO debe estar en Zustand:**

- Datos de usuario (deben venir de Supabase Auth + TanStack Query)
- Commits (deben venir de TanStack Query)
- Circle data (debe venir de TanStack Query)
- Cualquier cosa que persista en la base de datos

**Alternativas descartadas:**

- **Context API para todo.** Descartado porque Context provoca re-renders innecesarios cuando el estado cambia.
- **Jotai / Recoil.** Descartado porque añaden complejidad innecesaria para el alcance del estado UI que necesitamos.

---

## Capas del sistema

| Capa                | Tecnología                                  | Responsabilidad                                  |
| ------------------- | ------------------------------------------- | ------------------------------------------------ |
| **Base de datos**   | Supabase (PostgreSQL)                       | Almacenamiento, RLS, Realtime, Auth              |
| **Repositorio**     | Server Actions + Supabase Client (server)   | Lógica de acceso a datos, validación en servidor |
| **Estado servidor** | TanStack Query                              | Cache, sincronización, revalidación              |
| **Estado cliente**  | Zustand                                     | Estado UI efímero                                |
| **UI**              | React Server Components + Client Components | Renderizado e interactividad                     |
| **Estilos**         | TailwindCSS + shadcn/ui                     | Diseño consistente                               |
| **Validación**      | Zod + React Hook Form                       | Validación de formularios y datos                |

---

## Qué lógica vive en cada capa

### Server Components

- Lectura de datos iniciales (Dashboard, Profile, Circle)
- Renderizado de páginas completas
- Layouts y metadata
- SEO

### Server Actions

- Creación de Commits
- Actualización de perfil
- Gestión de Circle (invitar, aceptar, remover)
- Cualquier mutación de datos

### Client Components

- Formularios interactivos (Commit, Reflection)
- Animaciones (Framer Motion)
- Estado de UI (modales, tabs, filtros)
- Componentes que usan hooks del navegador

### TanStack Query (hooks)

- Consultas a datos del servidor con cache
- Mutaciones con cache optimista
- Revalidación automática

### Zustand (stores)

- Estado de UI compartido (modal activo, onboarding state)
- Preferencias temporales (filtros, orden)

---

## Qué nunca debería hacerse desde el cliente

1. **Validación de seguridad.** Nunca confiar en validación del cliente para decisiones de seguridad. La validación de RLS en PostgreSQL es la única fuente de verdad.
2. **Acceso directo a la base de datos.** Nunca exponer el cliente de Supabase directamente al navegador con permisos de escritura sin RLS. Las mutaciones deben pasar por Server Actions.
3. **Lógica de negocio sensible.** Reglas de cálculo de Progress, continuidad, acceso a datos del Circle — todo debe validarse en el servidor.
4. **Secretos o claves API.** Nunca incluir claves de servicio en el cliente.
5. **Estado persistente que requiere consistencia.** Si dos usuarios necesitan ver los mismos datos consistentes, esos datos deben venir del servidor a través de TanStack Query, no de Zustand.

---

## Escalabilidad a largo plazo

**Para los próximos años:**

1. **Server Actions pueden migrarse a API Routes si es necesario.** La lógica de negocio está encapsulada en funciones server, por lo que migrar de Server Actions a API Routes es cuestión de envolver la misma función en un handler HTTP.
2. **PostgreSQL escala verticalmente bien.** Para el volumen esperado de Gym Circle (miles de usuarios, millones de Commits), PostgreSQL con índices bien diseñados y RLS es más que suficiente.
3. **Supabase Realtime puede escalar con el plan adecuado.** Si Presence se vuelve crítico, Supabase maneja canales de Realtime con conexiones persistentes.
4. **Vercel Edge Functions pueden complementar Server Actions** para tareas que requieran baja latencia global (notificaciones, procesamiento de imágenes).

---

## Decisiones tomadas

1. Next.js App Router como framework principal.
2. Supabase como backend (PostgreSQL, Auth, Realtime, Storage).
3. TanStack Query para estado del servidor.
4. Zustand para estado UI efímero (mínimo).
5. TailwindCSS v4 + shadcn/ui para diseño.
6. Zod + React Hook Form para validación.
7. Server Components para lectura de datos.
8. Server Actions para mutaciones.
9. RLS como capa de autorización.
10. Vercel como plataforma de hosting.

## Alternativas descartadas

- Backend propio (Node + Express) — descartado por carga operativa innecesaria.
- Firebase — descartado por modelo de datos NoSQL inadecuado.
- Material UI — descartado por estética no alineada con la marca.
- Redux — descartado por excesivo para el alcance.
- Pages Router — descartado por ser tecnología legacy.

## Riesgos

- Dependencia de Vercel para hosting. Si los costos escalan o hay limitaciones, migrar podría ser complejo.
- Dependencia de Supabase. Aunque es open source y auto-hosteable, migrar a una instancia propia requiere trabajo operativo.
- Server Actions son relativamente nuevos. Pueden tener limitaciones en escenarios complejos.
- RLS mal diseñado puede convertirse en un cuello de botella de rendimiento.

## Preguntas abiertas

- ¿Necesitaremos Edge Functions para procesamiento pesado (generación de Journey, análisis de patrones)?
- ¿El almacenamiento de evidencia (fotos) requiere optimización de imágenes en servidor?
- ¿Necesitaremos un sistema de colas para notificaciones asíncronas?

## Próximo documento

`docs/architecture/01-folder-structure.md` — La estructura completa del repositorio con propósito y reglas para cada carpeta.
