# 03 — Testing Strategy

> **Propósito de este documento:** Definir la estrategia completa de testing para Gym Circle. Qué se testea, qué no, con qué herramientas, y qué cobertura se espera. Los tests no son opcionales: son parte del Definition of Done.

---

## Filosofía de testing

1. **Los tests no son opcionales.** Una feature no está completa hasta que tiene tests.
2. **Tests en el nivel adecuado.** No todo necesita un test E2E. No todo necesita un test unitario.
3. **Cobertura significativa, no numérica.** Preferir tests que cubran casos de uso reales sobre tests que solo aumentan el porcentaje de cobertura.
4. **Tests que fallan informan.** Un test que falla debe indicar exactamente qué salió mal y dónde.

---

## Pirámide de testing

```
        ╱╲
       ╱  ╲
      ╱ E2E╲
     ╱──────╲
    ╱Integration╲
   ╱──────────────╲
  ╱   Unit Tests   ╲
 ╱────────────────────╲
╱    Static Analysis   ╲
──────────────────────────
```

| Capa            | Herramienta         | Objetivo                              | Cantidad   |
| --------------- | ------------------- | ------------------------------------- | ---------- |
| Static Analysis | TypeScript + ESLint | Errores de tipo y estilo              | Automático |
| Unit            | Vitest              | Funciones puras, utilidades, cálculos | Muchas     |
| Integration     | Vitest + Supabase   | Server Actions, flujos de datos       | Algunas    |
| E2E             | Playwright          | Flujos críticos completos             | Pocas      |

---

## 1. Static Analysis (automático, siempre)

TypeScript strict mode y ESLint detectan errores antes de que lleguen a tests.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Reglas:**

- `npm run lint` debe pasar antes de cualquier commit.
- TypeScript strict mode obligatorio.
- ESLint con reglas de @typescript-eslint.

---

## 2. Unit Tests (Vitest)

### ¿Qué testear?

| Categoría         | Ejemplos                                        | Prioridad |
| ----------------- | ----------------------------------------------- | --------- |
| Utilidades puras  | `cn()`, `formatDate()`, `calculateContinuity()` | Alta      |
| Validaciones      | Zod schemas                                     | Alta      |
| Lógica de negocio | Cálculo de momentum, frecuencia semanal         | Alta      |
| Constantes        | Valores correctos en arrays de constantes       | Media     |
| Transformaciones  | Formateo de datos para UI                       | Media     |

### ¿Qué NO testear?

- Componentes React simples (solo renderizado). Los cubren los tests de integración/E2E.
- Tipos TypeScript (el compilador los verifica).
- Configuración de TailwindCSS.
- Librerías externas (React, Supabase, TanStack Query).

### Ejemplo

```tsx
// tests/unit/lib/utils/continuity.test.ts
import { describe, it, expect } from "vitest";
import { calculateContinuity } from "@/lib/utils/continuity";
import type { Commit } from "@/types/commit";

describe("calculateContinuity", () => {
  it("returns zero metrics for empty commits", () => {
    const result = calculateContinuity([]);
    expect(result.totalDays).toBe(0);
    expect(result.frequency).toBe(0);
  });

  it("calculates correct frequency for weekly commits", () => {
    const commits = mockCommits({ count: 12, days: 21 }); // 12 commits en 21 días
    const result = calculateContinuity(commits);
    expect(result.frequency).toBeCloseTo(4, 0); // ~4 por semana
  });
});
```

**Cobertura esperada:**

- `lib/utils/`: 80%+
- `features/*/utils/`: 70%+
- `features/*/schemas/`: 90%+

---

## 3. Integration Tests (Vitest + Supabase local)

### ¿Qué testear?

| Categoría       | Ejemplos                                       | Prioridad |
| --------------- | ---------------------------------------------- | --------- |
| Server Actions  | `createCommit()`, `inviteToCircle()`           | Alta      |
| Flujos de datos | Commit → Progress actualizado                  | Alta      |
| RLS             | Usuario no autorizado no accede a datos ajenos | Alta      |
| Autenticación   | Login, registro, logout                        | Alta      |

### ¿Qué NO testear?

- Conexión a Supabase (asumimos que funciona).
- La base de datos en sí (asumimos que PostgreSQL funciona).

### Estructura

```tsx
// tests/integration/features/commit/createCommit.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { createServerClient } from "@/lib/supabase/server";

describe("createCommit", () => {
  it("creates a commit for authenticated user", async () => {
    // Setup: autenticar usuario de prueba
    const supabase = createServerClient();
    await supabase.auth.signInWithPassword({
      email: "test@test.com",
      password: "test123",
    });

    // Ejecutar Server Action
    const result = await createCommit({
      title: "Test commit",
      type: "training",
    });

    // Verificar
    expect(result.data).toBeDefined();
    expect(result.data.title).toBe("Test commit");
  });

  it("rejects unauthenticated users", async () => {
    const result = await createCommit({
      title: "Test commit",
      type: "training",
    });
    expect(result.error).toBeDefined();
  });
});
```

**Cobertura esperada:**

- `features/*/actions/`: 70%+
- Flujos críticos: 100% (create, read, update, delete principales)

---

## 4. E2E Tests (Playwright)

### ¿Qué testear?

Solo los flujos críticos del producto:

| Flujo                                  | Prioridad |
| -------------------------------------- | --------- |
| Registro → Login → Dashboard           | Crítica   |
| Crear Commit → Ver en timeline         | Crítica   |
| Invitar al Circle → Ver presencia      | Alta      |
| Ver progreso → Journey visualiza datos | Alta      |
| Crear Reflection → Ver en timeline     | Media     |

### Ejemplo

```tsx
// tests/e2e/commit.spec.ts
import { test, expect } from "@playwright/test";

test("user can create a commit and see it in timeline", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill("[name=email]", "test@test.com");
  await page.fill("[name=password]", "test123");
  await page.click("button[type=submit]");

  // Esperar dashboard
  await expect(page.locator("[data-testid=dashboard]")).toBeVisible();

  // Crear Commit
  await page.click("[data-testid=commit-button]");
  await page.fill("[name=title]", "Entrenamiento de espalda");
  await page.click("[data-testid=submit-commit]");

  // Ver Commit en timeline
  await expect(page.locator("text=Entrenamiento de espalda")).toBeVisible();
});
```

**Cobertura esperada:**

- Flujos críticos: 100% (3-4 flujos)
- Flujos secundarios: según prioridad

---

## Coverage goals

| Capa                        | Mínimo | Objetivo |
| --------------------------- | ------ | -------- |
| `lib/utils/`                | 80%    | 90%      |
| `features/*/utils/`         | 70%    | 80%      |
| `features/*/actions/`       | 70%    | 80%      |
| `features/*/schemas/`       | 90%    | 100%     |
| E2E flujos críticos         | 100%   | 100%     |
| Líneas totales del proyecto | 60%    | 75%      |

---

## Definition of Done para testing

Una feature está completa cuando:

- [ ] Tests unitarios para utilidades nuevas (si aplica)
- [ ] Tests de integración para Server Actions nuevas
- [ ] El flujo E2E existe o se ha añadido al existente
- [ ] `npm run test` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] Cobertura no ha disminuido respecto a la rama base

---

## Próximo documento

`docs/engineering/04-error-handling.md` — Gestión de errores en frontend, backend, Server Actions, Supabase y validaciones.
