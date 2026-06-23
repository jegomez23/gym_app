> ⚠️ **STALE**: This document describes the implementation plan for the initial commit, which has already been completed. See `knowledge/CURRENT_STATE.md` for current status.

# 09 — First Commit Plan

> **Propósito de este documento:** Definir exactamente qué archivos se crean, en qué orden, qué dependencias se instalan, qué configuraciones se aplican y cuál será el contenido del primer commit del proyecto. No improvisación. Solo ejecución.

---

## Objetivo del primer commit

El primer commit debe dejar el proyecto en un estado donde:

1. `npm run dev` funciona
2. Supabase está conectado
3. Los componentes base de shadcn/ui renderizan
4. Los providers globales están configurados
5. La estructura de carpetas está creada
6. ESLint y Prettier están configurados
7. TypeScript strict mode está habilitado
8. El layout raíz renderiza con los providers

**Nombre del commit:** `chore: initial project setup`

---

## Orden de ejecución

### Paso 1: Inicializar Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

**Respuestas:**

- TypeScript: Yes
- ESLint: Yes
- TailwindCSS: Yes
- App Router: Yes
- Import alias: `@/*`

### Paso 2: Instalar dependencias

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query
npm install zustand
npm install zod @hookform/resolvers react-hook-form
npm install framer-motion
npm install clsx tailwind-merge
npm install lucide-react

# shadcn/ui (componentes base)
npx shadcn@latest init
npx shadcn@latest add button card input dialog avatar badge skeleton alert

# Desarrollo
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D @next/bundle-analyzer
npm install -D @axe-core/react
npm install -D eslint-config-prettier eslint-plugin-prettier
npm install -D prettier
```

### Paso 3: Configurar shadcn/ui

```bash
npx shadcn@latest init
```

**Respuestas:**

- Style: Default
- Base color: Slate
- CSS variables: Yes
- `@/` alias: Yes

### Paso 4: Crear estructura de carpetas

```bash
mkdir -p features/auth features/commit features/circle features/progress features/profile features/reflection
mkdir -p components/ui components/shared components/layout
mkdir -p lib/supabase lib/utils lib/validators lib/constants
mkdir -p hooks
mkdir -p providers
mkdir -p stores
mkdir -p types
mkdir -p config
mkdir -p supabase/migrations supabase/policies supabase/functions
mkdir -p tests/unit tests/integration tests/e2e
mkdir -p public/images public/fonts public/icons
mkdir -p styles
```

### Paso 5: Crear archivos de configuración

#### `tsconfig.json` — Añadir strict mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### `.env.example`

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Paso 6: Crear archivos de Supabase

#### `lib/supabase/client.ts`

```tsx
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### `lib/supabase/server.ts`

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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name, options);
        },
      },
    }
  );
}
```

### Paso 7: Crear providers globales

#### `providers/query-provider.tsx`

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

#### `lib/utils/cn.ts`

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Paso 8: Configurar layout raíz

#### `app/globals.css` — Variables CSS de la marca

```css
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --accent: #a3e635;
  --accent-glow: rgba(163, 230, 53, 0.15);
  --secondary-text: #a3a3a3;
  --border: rgba(255, 255, 255, 0.08);
  --card-bg: rgba(255, 255, 255, 0.035);
}
```

#### `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Circle",
  description: "El progreso personal no debería vivirse en soledad.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased bg-background text-foreground">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

### Paso 9: Verificar

- [ ] `npm run dev` funciona sin errores
- [ ] `npm run lint` pasa
- [ ] `npm run build` compila
- [ ] La página raíz renderiza en http://localhost:3000

### Paso 10: Primer commit

```bash
git init
git add .
git commit -m "chore: initial project setup"
```

---

## Archivos que se crearán en el primer commit

```
.next-env.d.ts
.env.example
.gitignore
.prettierrc
app/
  globals.css
  layout.tsx
  page.tsx
components/
  ui/              (shadcn components)
config/
  site.ts
  features.ts
hooks/             (empty, ready for generic hooks)
lib/
  supabase/
    client.ts
    server.ts
  utils/
    cn.ts
providers/
  query-provider.tsx
stores/            (empty, ready for Zustand stores)
types/             (empty, ready for global types)
next.config.mjs
package.json
postcss.config.mjs
tailwind.config.ts
tsconfig.json
vitest.config.ts
playwright.config.ts
```

---

## Archivos que NO se crean en el primer commit

- Server Actions (se crean en Sprint 2)
- Componentes de feature (se crean en Sprint 2+)
- Hooks de TanStack Query (se crean en Sprint 2+)
- Supabase RLS policies (se crean al crear las tablas)
- Migraciones de base de datos (se crean al diseñar las tablas)
- Tests específicos de features (se crean con la feature)

---

## Estado después del primer commit

```
npm run dev  → ✅ Funciona
npm run lint → ✅ Pasa
npm run build → ✅ Compila
Supabase     → ✅ Conectado (cliente)
shadcn/ui    → ✅ Componentes base instalados
TailwindCSS  → ✅ Funcional con variables de marca
TypeScript   → ✅ Strict mode
ESLint       → ✅ Configurado
Prettier     → ✅ Configurado
Vitest       → ✅ Configurado
Playwright   → ✅ Configurado
Framer Motion → ✅ Instalado
TanStack Query → ✅ Provider configurado
Estructura   → ✅ Carpetas creadas
```

---

## Riesgos

- `shadcn init` puede preguntar cosas no previstas. Respuesta por defecto: aceptar defaults.
- TailwindCSS v4 puede tener cambios en la configuración. Adaptar según lo que genere `create-next-app`.
- `npm install` puede fallar si hay conflictos de versiones. Resolver con `--legacy-peer-deps` si es necesario.

## Siguiente paso

Después del primer commit, continuar con **Sprint 1** según `docs/architecture/08-coding-roadmap.md`:

```
Sprint 1 → Auth + Layout + Landing (3 días)
  Día 1: Auth (Server Actions + RLS + Tabla profiles)
  Día 2: Auth UI + Middleware
  Día 3: Layout principal + Bottom Navigation
```

Este documento es la culminación de la fase ENGINEERING. Cuando el fundador lo apruebe, ejecutaremos este plan sin desviaciones.
