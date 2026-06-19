# Domain — Identity

> **Propósito de este documento:** Definir cómo Gym Circle refuerza la identidad de la persona como alguien constante. Identity no es un módulo ni una pantalla. Es una capa transversal que todos los dominios deben reforzar a través del lenguaje, las métricas y el feedback.

---

## ¿Qué representa?

Identity representa **quién me estoy convirtiendo a través de este proceso**.

No es un perfil. No es una biografía. No es una lista de logros. Es la respuesta interna a la pregunta "¿quién soy yo en relación con este proceso?" Identity es el resultado de la acumulación de Commits, la visibilidad del Progreso, la compañía del Circle y la profundidad de las Reflections.

---

## ¿Por qué existe?

1. **La identidad es más fuerte que la fuerza de voluntad** (Observación 3). Una persona que actúa desde la identidad ("soy alguien constante") no necesita fuerza de voluntad para mantener el proceso.
2. **El lenguaje que usamos sobre nosotros mismos determina lo que hacemos** (Observación 10). Cambiar el lenguaje interno de la persona es la intervención más poderosa que puede hacer el sistema.
3. **Las personas abandonan identidades, no rutinas** (Observación 3). Si el sistema no refuerza la identidad, la persona abandonará cuando la rutina se vuelva difícil.

---

## ¿Qué NO es Identity?

- **No es un perfil público.** No hay foto, biografía, métricas visibles para cualquiera.
- **No es un módulo independiente.** No hay una pantalla llamada "Identidad." Identity se expresa en cada interacción.
- **No es una métrica.** No se puntúa ni se mide directamente. Es un estado interno que el sistema influye a través del lenguaje.
- **No es validación externa.** Identity no se construye porque otros te digan que eres constante. Se construye porque el sistema te muestra evidencia de tu constancia.

---

## Cómo se refuerza Identity

### 1. A través del lenguaje del sistema

Cada mensaje que el sistema muestra a la persona debe reforzar identidad, no solo registrar acciones.

**En lugar de:**

- "Has completado 42 entrenamientos"
- "Llevas 15 días de racha"
- "Buen trabajo hoy"

**Decir:**

- "42 veces has actuado como la persona constante que eres"
- "15 días siendo fiel a quien decidiste ser"
- "Hoy apareciste. Eso es lo que hace alguien constante."

### 2. A través del progreso visible

Ver la evidencia acumulada refuerza la identidad porque la persona no puede negar lo que ve. "Llevo 200 días en esto" es una declaración de identidad más poderosa que cualquier afirmación motivacional.

### 3. A través del reconocimiento del Circle

Cuando el Circle envía apoyo ("Estoy contigo", "Qué constancia"), la persona recibe un reflejo externo de su identidad. Ese reflejo ayuda a integrar la identidad (Observación 9).

### 4. A través del lenguaje interno

El sistema debe influir en cómo la persona se habla a sí misma. Esto se logra:

- Reflejando el progreso en términos de identidad ("te estás convirtiendo en alguien que...")
- Normalizando las pausas como parte del proceso ("volviste. Eso no es un fracaso, es evidencia de tu compromiso")
- Eliminando el lenguaje de déficit ("te falta") y reemplazándolo por lenguaje de continuidad ("llevas")

---

## Relaciones con otras entidades

| Entidad  | Tipo de relación | Descripción                                             |
| -------- | ---------------- | ------------------------------------------------------- |
| Commits  | Refuerza         | Cada Commit es un voto por la identidad                 |
| Progress | Evidencia        | El Progress muestra pruebas de la identidad             |
| Circle   | Refleja          | El Circle refleja externamente la identidad             |
| Mind     | Procesa          | Mind procesa cómo la persona integra su identidad       |
| Journey  | Narra            | Journey narra la evolución de la identidad en el tiempo |

---

## Decisiones tomadas

1. **Identity no tiene tabla propia.** No almacenamos "identidad." La influenciamos a través del lenguaje en cada punto de contacto.
2. **Cada mensaje del sistema debe pasar un filtro de identidad.** Antes de mostrar cualquier texto, preguntar: "¿Este mensaje refuerza identidad o solo registra datos?"
3. **El lenguaje de déficit está prohibido.** El sistema nunca dice "te falta" o "deberías." Solo muestra lo que hay y lo que se ha construido.

## Alternativas descartadas

- **Perfil de identidad con métricas.** Descartado porque convertiría la identidad en un número, vaciándola de significado.
- **Afirmaciones diarias automáticas.** Descartado porque son percibidas como falsas o motivacionales baratas.
- **Badges o logros de identidad.** Descartado porque externalizan la identidad en lugar de integrarla.

## Riesgos

- Que el lenguaje del sistema suene artificial o forzado si no se diseña cuidadosamente.
- Que la ausencia de una sección de "Identidad" haga que el equipo se olvide de reforzarla.
- Que el lenguaje de identidad se perciba como manipulador si no es auténtico.

## Preguntas abiertas

- ¿Cómo se mide si el lenguaje del sistema está realmente influyendo en la identidad de la persona?
- ¿Cuándo el refuerzo de identidad se convierte en presión ("ya que soy constante, no puedo fallar")?
- ¿Debe el sistema adaptar su lenguaje según la etapa del proceso (inicio vs. consolidación)?

## Impacto en la arquitectura

**No se necesita una tabla para Identity.**

**Lo que se necesita:**

- Un archivo de configuración de UX Writing centralizado con todas las frases del sistema, clasificadas por tipo de refuerzo de identidad
- Un sistema de plantillas que permita personalizar los mensajes según el contexto y el tiempo en el proceso
- Un filtro de revisión: ningún texto debe desplegarse sin pasar por el filtro de identidad

**Componentes futuros:**

- `IdentityLanguageProvider` — Provee el lenguaje de refuerzo de identidad contextual
- `MilestoneCelebration` — Celebra hitos con lenguaje de identidad

---

## Próximo documento

`docs/domain/presence.md` — Saber que los otros están ahí.
