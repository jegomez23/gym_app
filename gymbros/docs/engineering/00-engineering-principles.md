# 00 — Engineering Principles

> **Propósito de este documento:** Definir los principios que regirán todo el desarrollo de Gym Circle. Cada principio está justificado desde la filosofía del producto y la arquitectura ya definida. Ninguna decisión técnica debe contradecir estos principios.

---

## 1. Claridad antes que cleverness

El código se escribe para ser leído por humanos, no para demostrar inteligencia técnica.

**Reglas:**

- Preferir código explícito sobre código elegante pero críptico.
- Una función debe poder entenderse sin leer todo el archivo.
- Si una solución es ingeniosa pero difícil de leer, no es una buena solución.
- Los comentarios explican el "por qué", no el "qué" (el código debe explicar el "qué").

**Ejemplo:**

```tsx
// ✅ Bien: claro y explícito
const commitsToday = commits.filter((commit) => {
  return isSameDay(commit.recordedAt, new Date());
});

// ❌ Mal: clever pero ilegible
const commitsToday = commits.filter((c) => isSameDay(c.recordedAt, D()));
```

---

## 2. Composición antes que herencia

Usar composición de componentes y funciones pequeñas antes que jerarquías complejas.

**Reglas:**

- Preferir componentes pequeños que se combinan sobre componentes grandes que heredan.
- Una función debe hacer una sola cosa y hacerla bien.
- Si un componente supera las 200 líneas, dividirlo.
- Extraer lógica repetida a hooks o utilidades, no a superclases.

---

## 3. Simplicidad antes que abstracción

No abstraer antes de tiempo. La abstracción debe resolver un problema real, no anticipar uno imaginario.

**Reglas:**

- No crear interfaces, tipos genéricos o abstracciones "por si acaso" se necesitan después.
- Cuando aparezca el tercer caso de uso repetido, entonces abstraer.
- Una abstracción incorrecta es peor que el código duplicado.
- Preferir Server Actions simples sobre patrones complejos de repositorio.

---

## 4. Feature-first

El código se organiza primero por feature del dominio, luego por tipo técnico.

**Reglas:**

- Todo el código de una feature vive en su propia carpeta dentro de `features/`.
- Una feature no importa directamente de otra feature.
- Si dos features comparten lógica, se extrae a `lib/`.

---

## 5. Type-safe by default

TypeScript no es opcional. Todo el código debe ser type-safe. `any` está prohibido.

**Reglas:**

- Usar `interface` para objetos del dominio, `type` para uniones y utilidades.
- Tipos explícitos en funciones públicas; tipos inferidos en funciones internas simples.
- Zod para todas las validaciones en el borde (Server Actions, formularios).
- Tipos generados de Supabase para la base de datos (`supabase gen types`).
- `any` está prohibido. Usar `unknown` si el tipo es desconocido y validar con Zod.

---

## 6. Server-first

Por defecto, todo es Server Component. La lógica debe ejecutarse en el servidor siempre que sea posible.

**Reglas:**

- Server Components para leer datos y renderizar HTML.
- Server Actions para mutar datos.
- Client Components solo cuando se necesita interactividad del navegador.
- Si un componente puede ser Server Component, debe serlo.
- La validación de seguridad nunca ocurre en el cliente.

---

## 7. Accessibility-first

La accesibilidad no es una capa que se añade después. Es parte del diseño desde el primer componente.

**Reglas:**

- Todo componente interactivo debe tener roles ARIA adecuados.
- Navegación por teclado debe funcionar en toda la aplicación.
- El contraste de colores debe cumplir WCAG AA como mínimo.
- Los formularios deben tener etiquetas accesibles.
- Las imágenes deben tener texto alternativo.

---

## 8. Mobile-first

Toda decisión de diseño y código asume primero la pantalla más pequeña.

**Reglas:**

- Diseñar primero para móvil, luego expandir para tablet y desktop.
- TailwindCSS usa clases `sm:`, `md:`, `lg:` para adaptar, no al revés.
- El bottom navigation es mobile-first; en desktop puede ser sidebar.
- Los touch targets deben tener al menos 44x44px.

---

## 9. Error visibility

Los errores no deben ocultarse. Deben ser visibles, rastreables y recuperables.

**Reglas:**

- Toda Server Action devuelve `{ data, error }`.
- Los errores de TanStack Query se muestran en la UI.
- Los errores de formulario (Zod) se muestran por campo.
- Los errores globales tienen su propio `error.tsx`.
- No hay `try/catch` silenciosos.

---

## 10. Progressive disclosure

La interfaz muestra lo mínimo necesario para la acción actual. La complejidad se revela progresivamente.

**Reglas:**

- El Commit form mínimo es: un botón. La profundidad (tipo, intensidad, nota) se despliega si se necesita.
- No mostrar opciones avanzadas en la primera interacción.
- Los formularios comienzan simples y permiten expandirse.
- Esto aplica también al código: modules simples con opciones de configuración.

---

## Resumen

| #   | Principio                         | Esencia                               |
| --- | --------------------------------- | ------------------------------------- |
| 1   | Claridad antes que cleverness     | Código legible sobre código ingenioso |
| 2   | Composición antes que herencia    | Componentes pequeños combinables      |
| 3   | Simplicidad antes que abstracción | No abstraer antes de tiempo           |
| 4   | Feature-first                     | Organizar por dominio, no por tipo    |
| 5   | Type-safe by default              | TypeScript estricto, sin `any`        |
| 6   | Server-first                      | Server Components por defecto         |
| 7   | Accessibility-first               | Accesibilidad desde el inicio         |
| 8   | Mobile-first                      | Primero pantallas pequeñas            |
| 9   | Error visibility                  | Errores visibles y rastreables        |
| 10  | Progressive disclosure            | Revelar complejidad gradualmente      |

## Próximo documento

`docs/engineering/01-code-style.md` — Estilo de código completo: nombres, carpetas, componentes, imports, exports.
