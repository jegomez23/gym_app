# Domain — Journey

> **Propósito de este documento:** Definir el concepto de Journey, la narrativa temporal del proceso de una persona. Journey no es un timeline de Commits. Es la historia de evolución que los Commits cuentan cuando se ven en conjunto.

---

## ¿Qué representa?

Journey representa **la narrativa temporal de la transformación de una persona**.

No es una lista. No es un gráfico. Es una historia visual que muestra:

- Dónde empezó la persona
- Cómo ha sido su camino (con pausas, regresos, momentos de alta actividad)
- Dónde está ahora
- La dirección en la que se mueve

Journey es la respuesta a la pregunta "¿cómo he llegado hasta aquí?" y "¿hacia dónde voy?"

---

## ¿Por qué existe?

1. **El progreso importante es invisible mientras ocurre** (Observación 2). Journey hace visible el camino completo, no solo el día de hoy.
2. **Las personas subestiman el poder de volver** (Observación 7). Journey muestra que las pausas son parte del proceso y que los regresos son victorias, no fracasos.
3. **La identidad necesita una narrativa** (Observación 10). Journey proporciona la historia que la persona necesita para integrar su transformación.
4. **La continuidad se construye en dirección, no en intensidad** (Observación 8). Journey muestra la dirección, no los picos de intensidad.

---

## ¿Qué NO es Journey?

- **No es un timeline.** Un timeline muestra eventos en orden cronológico. Journey muestra el significado de esos eventos.
- **No es un gráfico de rendimiento.** No muestra peso, repeticiones, velocidad. Muestra continuidad.
- **No es una lista de logros.** Los logros son puntos. Journey es la línea que los conecta.
- **No es una función de "racha."** Journey no penaliza los días sin actividad. Los incluye como parte natural del proceso.

---

## Cómo se visualiza Journey

Journey debe visualizarse como **una línea orgánica que fluye a lo largo del tiempo**.

**Elementos visuales:**

- **La línea base:** El tiempo transcurrido desde el primer Commit. No se rompe cuando hay pausas.
- **Los puntos activos:** Cada Commit es un punto en la línea. Más densidad = más actividad.
- **Las pausas:** Espacios en la línea donde no hubo actividad. No se marcan como negativos.
- **Los regresos:** Puntos después de una pausa. Se destacan con un tratamiento visual especial (celebran la vuelta).
- **Los hitos:** PRs, momentos clave, reflexiones importantes. Se marcan en la línea.

**Lo que NO debe tener:**

- Colores rojos o negativos
- Indicadores de "falta" o "debería"
- Comparaciones con periodos anteriores
- Predicciones o proyecciones

---

## La narrativa

Más allá de la visualización, Journey debe poder expresarse en lenguaje.

- "Empezaste hace 8 meses."
- "Has tenido 3 pausas. Has vuelto 3 veces."
- "Tu momento más constante fue en marzo."
- "Estás en tu proceso más largo hasta ahora."

Esta narrativa es la que la persona puede compartir con su Circle o guardar para sí misma.

---

## Relaciones con otras entidades

| Entidad  | Tipo de relación   | Descripción                                                 |
| -------- | ------------------ | ----------------------------------------------------------- |
| Commits  | Compuesto por      | Journey está formado por la secuencia de Commits            |
| Progress | Es la narrativa de | Journey es la historia que Progress cuenta                  |
| Identity | Construye          | Journey proporciona la narrativa para la identidad          |
| Circle   | Puede compartirse  | El Journey puede compartirse con el Circle (vista agregada) |

---

## Decisiones tomadas

1. **Journey no es una tabla.** Es una visualización calculada a partir de Commits.
2. **Journey no se rompe.** La línea del tiempo es continua desde el primer Commit. Las pausas no crean "rajas separadas."
3. **Los regresos se celebran visualmente.** Un regreso después de 3+ días recibe un tratamiento especial.
4. **No hay "rachas" en Journey.** No mostramos "días consecutivos." Mostramos "días desde el inicio" y "frecuencia."

## Alternativas descartadas

- **Journey como lista de Commits.** Descartado porque sería un timeline, no una narrativa.
- **Journey con indicadores de "rachas."** Descartado porque las rachas penalizan el regreso.
- **Journey con colores negativos para pausas.** Descartado porque las pausas son parte del proceso.

## Riesgos

- Que Journey se sienta vacío para personas nuevas (primeras semanas).
- Que la visualización orgánica sea difícil de implementar técnicamente.
- Que la ausencia de métricas de "rendimiento" haga que Journey se sienta impreciso.

## Preguntas abiertas

- ¿Journey debe incluir solo Commits o también otros eventos (reflexiones, apoyo recibido, hitos)?
- ¿La escala de tiempo debe ser configurable (1 semana, 1 mes, 3 meses, 1 año)?
- ¿Debe haber una vista de Journey compartida con el Circle?

## Impacto en la arquitectura

**No se necesita tabla propia.** Journey se calcula a partir de Commits.

**Funciones necesarias:**

- `get_journey_data(user_id, range)` — Devuelve los puntos para la visualización
- `get_journey_narrative(user_id)` — Genera la narrativa en lenguaje natural

**Componentes futuros:**

- `JourneyTimeline` — Visualización orgánica
- `JourneyNarrative` — Texto narrativo del proceso
- `JourneyMilestone` — Punto destacado en la línea

---

## Próximo documento

`docs/domain/reflection.md` — El insight personal que emerge del proceso.
