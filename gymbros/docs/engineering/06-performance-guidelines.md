# 06 — Performance Guidelines

> **Propósito de este documento:** Definir las reglas de rendimiento para Gym Circle. El rendimiento no es una ocurrencia tardía; se diseña desde el inicio. Cada regla está justificada desde la arquitectura y la filosofía del producto.

---

## Principios

1. **La velocidad es una feature de producto.** Una aplicación lenta hace que el usuario abandone. Gym Circle existe para reducir el abandono, así que la velocidad es parte de la misión.
2. **Server-first.** Mover la máxima lógica al servidor reduce el JavaScript que debe descargar el cliente.
3. **Medir antes de optimizar.** No optimizar prematuramente. Pero sí diseñar para ser optimizable.

---

## Lazy Loading

- **Componentes fuera de la vista inicial** deben cargarse con `next/dynamic`.
- **Imágenes** deben usar el componente `Image` de Next.js con `loading="lazy"`.
- **Páginas** se cargan con Server Components, no hay lazy loading de rutas (Next.js lo maneja).

```tsx
// ✅ Bien: dynamic import para componentes pesados
const CommitForm = dynamic(
  () => import("@/features/commit/components/CommitForm"),
  {
    loading: () => <Skeleton className="h-24 w-full" />,
  }
);
```

---

## Streaming y Suspense

- **Cada segmento de página debe tener `loading.tsx`.** Mientras el servidor prepara los datos, el cliente ve un skeleton.
- **Usar `<Suspense>` para cargas independientes.** El dashboard puede mostrar el CommitForm mientras carga el CirclePresence.

```tsx
// ✅ Bien: Suspense para cargas independientes
function Dashboard() {
  return (
    <div>
      <TodayCommits />
      <Suspense fallback={<Skeleton className="h-32" />}>
        <CirclePresence />
      </Suspense>
    </div>
  );
}
```

---

## Imágenes

- **Todas las imágenes usan `next/image`.** Optimización automática.
- **Avatares:** 48x48px en listas, 96x96px en perfil. Usar `sizes` attribute.
- **Fotos de evidencia:** `sizes="(max-width: 768px) 100vw, 50vw"`.
- **Eager loading solo para imágenes above the fold.** El resto lazy.

```tsx
<Image
  src={avatarUrl}
  alt={`Avatar de ${name}`}
  width={48}
  height={48}
  className="rounded-full"
  loading="lazy"
/>
```

---

## Caché y Revalidación

### TanStack Query

| Dato                 | staleTime | cacheTime | Revalidación             |
| -------------------- | --------- | --------- | ------------------------ |
| Commits (lista)      | 30s       | 5min      | Al crear/eliminar Commit |
| Commits (individual) | 1min      | 5min      | Al editar                |
| Circle members       | 1min      | 10min     | Al invitar/aceptar       |
| Circle presence      | 10s       | 1min      | Realtime                 |
| Progress             | 1min      | 5min      | Al crear Commit          |
| Profile              | 5min      | 30min     | Al editar perfil         |
| Reflections          | 1min      | 5min      | Al crear                 |

### Server Components

```tsx
// ✅ Bien: revalidación después de mutación
revalidatePath("/"); // Revalida el dashboard
revalidatePath("/commit"); // Revalida la lista de commits
```

---

## Bundle Size

- **Minimizar Client Components.** Cada `"use client"` aumenta el bundle del cliente.
- **No importar librerías grandes en Client Components.** Ejemplo: no importar `date-fns` entera, solo la función que necesitas.
- **Analizar bundle periódicamente.** `npm run analyze` (configurar con `@next/bundle-analyzer`).
- **Iconos:** usar iconos SVG inline o lucide-react (tree-shakeable).

---

## Consultas a Supabase

- **Siempre seleccionar solo los campos necesarios.** `select("id, title, recorded_at")`, no `select("*")`.
- **Usar `.limit()` y `.range()` para paginación.** No traer todos los registros.
- **Índices en columnas de filtro.** `user_id`, `recorded_at`, `visibility`.
- **Evitar N+1 queries.** Usar `.select("*, profile:profiles(*)")` para joins cuando sea necesario.

```tsx
// ✅ Bien: solo campos necesarios + paginación
const { data } = await supabase
  .from("commits")
  .select("id, title, recorded_at, type, visibility")
  .eq("user_id", user.id)
  .order("recorded_at", { ascending: false })
  .range(0, 19); // Página 1, 20 items
```

---

## Memoización

- **`React.memo` solo cuando hay rerenders innecesarios medibles.** No aplicar por defecto.
- **`useMemo` y `useCallback` solo para valores costosos.** No para valores simples.
- **Los Server Components no se rerenderizan.** Por eso son preferibles.

---

## Core Web Vitals

| Métrica                        | Objetivo |
| ------------------------------ | -------- |
| LCP (Largest Contentful Paint) | < 2.5s   |
| FID (First Input Delay)        | < 100ms  |
| CLS (Cumulative Layout Shift)  | < 0.1    |
| TTI (Time to Interactive)      | < 3.5s   |

---

## Checklist pre-deploy

- [ ] Lighthouse score > 90 en móvil y desktop
- [ ] Sin imágenes sin optimizar
- [ ] `loading="lazy"` en imágenes below the fold
- [ ] `loading.tsx` en todos los segmentos
- [ ] TanStack Query `staleTime` configurado por feature
- [ ] Bundle analyzer no muestra dependencias duplicadas
- [ ] Consultas Supabase tienen `.limit()` y campos específicos

## Próximo documento

`docs/engineering/07-accessibility.md` — Accesibilidad desde el inicio.
