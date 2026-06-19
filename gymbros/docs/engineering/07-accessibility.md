# 07 — Accessibility

> **Propósito de este documento:** Definir la accesibilidad como parte del diseño desde el inicio. No se añade después. Cada componente debe cumplir estos estándares antes de ser considerado completo.

---

## Estándar

Cumplir **WCAG 2.2 AA** como mínimo. Aspirar a AAA donde sea posible sin degradar la experiencia.

---

## Reglas generales

### Navegación por teclado

- Toda funcionalidad debe ser accesible por teclado.
- `Tab` debe seguir un orden lógico (no saltar elementos).
- `Enter`/`Space` activan botones y enlaces.
- `Escape` cierra modales, menús y diálogos.
- Focus visible en todos los elementos interactivos (no usar `outline: none` sin alternativa).

```css
/* ✅ Bien: focus visible personalizado */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### Roles ARIA

| Elemento          | Rol ARIA                                          | Atributos                                         |
| ----------------- | ------------------------------------------------- | ------------------------------------------------- |
| Bottom Navigation | `role="navigation"`                               | `aria-label="Navegación principal"`               |
| Modal             | `role="dialog"`                                   | `aria-modal="true"`, `aria-labelledby`            |
| Alert             | `role="alert"`                                    | -                                                 |
| Progress bar      | `role="progressbar"`                              | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Tabs              | `role="tablist"`, `role="tab"`, `role="tabpanel"` | `aria-selected`, `aria-controls`                  |
| Form error        | `role="alert"` o `aria-describedby`               | -                                                 |

### Contraste de color

| Elemento                                  | Ratio mínimo          |
| ----------------------------------------- | --------------------- |
| Texto normal                              | 4.5:1                 |
| Texto grande (>18px bold o >24px regular) | 3:1                   |
| Componentes UI (bordes, iconos)           | 3:1                   |
| Estados hover/focus                       | 3:1 vs color de fondo |

### Texto

- **Redimensionable.** Todo el texto debe poder aumentar al 200% sin perder contenido.
- **Idioma.** `html lang="es"` en el layout raíz.
- **Etiquetas.** Todo campo de formulario debe tener un `<label>` asociado.

```tsx
// ✅ Bien: label asociado
<label htmlFor="commit-title">Título del Commit</label>
<Input id="commit-title" {...form.register("title")} />
```

### Imágenes

- **Texto alternativo obligatorio.** `<Image alt="Descripción de la imagen" />`.
- **Imágenes decorativas.** `<Image alt="" role="presentation" />`.
- **Avatares.** `<Image alt={`Avatar de ${name}`} />`.

### Formularios

- Errores asociados al campo con `aria-describedby`.
- Mensajes de éxito/error con `role="alert"`.
- Placeholder no debe ser la única etiqueta visible.

### Modales y diálogos

- Enfoque atrapado dentro del modal (focus trap).
- Al abrir, el foco va al primer elemento interactivo.
- Al cerrar, el foco vuelve al elemento que abrió el modal.
- `Escape` cierra el modal.

---

## Componentes específicos

### BottomNavigation

```tsx
<nav role="navigation" aria-label="Navegación principal">
  {items.map((item) => (
    <a
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? "page" : undefined}
      aria-label={item.label}
    >
      {item.icon}
      <span className="sr-only">{item.label}</span>
    </a>
  ))}
</nav>
```

### CommitForm

- Label visible para cada campo.
- `aria-describedby` para errores.
- Botón de submit con texto descriptivo.
- Confirmación de éxito con `role="status"`.

### CirclePresencePulse

- `aria-live="polite"` para actualizaciones de presencia.
- No usar animaciones que parpadeen más de 3 veces por segundo.

---

## Testing de accesibilidad

### Automatizado

- `@axe-core/react` en desarrollo.
- `jest-axe` en tests unitarios de componentes.
- Lighthouse accessibility audit en CI.

### Manual

- Navegación completa con solo teclado (`Tab`, `Enter`, `Escape`, flechas).
- Prueba con lectores de pantalla (VoiceOver en macOS, NVDA en Windows).
- Zoom al 200% sin pérdida de contenido.

### Checklist pre-merge

- [ ] Navegación por teclado funciona
- [ ] Focus visible en todos los elementos
- [ ] Roles ARIA correctos
- [ ] Contraste de color >= 4.5:1
- [ ] Labels asociados a todos los campos
- [ ] Texto alternativo en imágenes
- [ ] Lighthouse accessibility score >= 95

---

## Próximo documento

`docs/engineering/08-definition-of-done.md` — ¿Qué significa terminar una tarea?
