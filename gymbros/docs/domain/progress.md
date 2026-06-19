# Domain — Progress

> **Propósito de este documento:** Definir cómo los Commits se transforman en evidencia visible del avance. Progress no es una entidad independiente, sino una capa de visualización y métrica que emerge de los Commits.

---

## ¿Qué representa?

Progress representa **la evidencia acumulada de la transformación de una persona a lo largo del tiempo**.

No es una métrica en tiempo real. No es un número que sube y baja. Es una narrativa visual que muestra:

- Cuánto tiempo lleva una persona en su proceso
- Con qué frecuencia actúa
- Cómo ha evolucionado su consistencia a lo largo de semanas, meses y años
- Qué patrones emergen (momentos de alta actividad, pausas, regresos)

Progress es el antídoto contra la invisibilidad del progreso lento (Observación 2) y la incapacidad humana de medir el propio avance (Observación 12).

---

## ¿Por qué existe?

1. **El progreso importante es invisible mientras ocurre** (Observación 2). Sin Progress, la persona no sabe si está avanzando y abandona procesos que objetivamente están funcionando.
2. **Las personas no saben medir su propio progreso** (Observación 12). Progress proporciona una medición objetiva que compensa la percepción subjetiva poco fiable.
3. **La identidad necesita evidencia** (Observación 3). Para que una persona pase de "intento ser constante" a "soy constante", necesita ver pruebas acumuladas de su constancia.

---

## ¿Qué NO es Progress?

- **No es una lista de Commits.** Eso es un timeline. Progress es una vista sintética que extrae significado de los Commits.
- **No es una competición.** No hay rankings, no hay comparación con otros, no hay percentiles.
- **No es una nota.** No evalúa si el proceso es "bueno" o "malo". Simplemente muestra lo que ha ocurrido.
- **No es presión.** Progress no debería hacer sentir a la persona que "debería" tener más. Muestra lo que hay, sin juicio.

---

## Métricas que Progress debe mostrar

### Core (siempre visibles)

1. **Continuidad actual:** ¿Cuánto tiempo lleva la persona activa en su proceso? (No es un streak ininterrumpido, es una medición de regularidad.)
2. **Frecuencia semanal:** ¿Cuántos Commits registra por semana en promedio? (Ventana móvil de 4 semanas.)
3. **Total de Commits:** El número total de acciones registradas desde que empezó.
4. **Tiempo en el proceso:** Días, semanas o meses desde el primer Commit.

### Supporting (visibles pero no prioritarias)

5. **Regresos:** Cuántas veces ha vuelto después de una pausa de 3+ días. (Esto debería celebrarse más que la racha perfecta.)
6. **Tipos de Commit:** Distribución de los tipos de acción que realiza.
7. **Patrón semanal:** ¿Qué días de la semana tiende a actuar más? ¿Cuáles menos?

### Future (pueden esperar)

8. **PRs:** Logros clave registrados.
9. **Evolución de intensidad:** ¿La intensidad percibida ha cambiado con el tiempo?
10. **Correlación emocional:** ¿Cómo se relaciona el estado de ánimo con la frecuencia de acción?

---

## Visualización del progreso

Progress no debe mostrarse como una lista. Debe mostrarse como:

1. **Una línea de tiempo visual (Journey).** No un gráfico de barras. Una línea orgánica que muestra la actividad a lo largo del tiempo, con espacio para pausas y regresos.
2. **Una métrica principal.** Una cifra simple que la persona pueda recordar y compartir: "Llevo 47 días en esto."
3. **Un pulso semanal.** No "esta semana hiciste 4 de 5 días", sino "tu ritmo esta semana fue consistente con tu promedio."

La visualización debe transmitir calma y progreso, no urgencia ni déficit.

---

## Relaciones con otras entidades

| Entidad  | Tipo de relación   | Descripción                                                         |
| -------- | ------------------ | ------------------------------------------------------------------- |
| Commits  | Se deriva de       | Progress no existe sin Commits                                      |
| Journey  | Es la narrativa de | El Journey muestra Progress en contexto temporal                    |
| Identity | Refuerza           | Ver el Progress refuerza la identidad de "persona constante"        |
| Circle   | Puede compartirse  | El Progress puede ser visible para el Circle (agregado, no detalle) |

---

## Decisiones tomadas

1. **Progress no es una tabla.** No almacenamos "progreso" como datos. Lo calculamos a partir de Commits en tiempo de consulta. Esto evita inconsistencias y permite recalcular si cambian las métricas.
2. **Las métricas de Progress son siempre relativas a la propia persona.** Nunca hay comparación con promedios del Circle o de la plataforma.
3. **La pausa no se penaliza.** Las métricas de Progress no muestran "rachas perdidas" sino "tiempo total en el proceso". Una persona que lleva 200 días pero tuvo dos pausas de 5 días no ve "días perdidos", ve "200 días desde que empecé."

## Alternativas descartadas

- **Mostrar Progress como un score.** Descartado porque un número compuesto es difícil de interpretar y puede generar ansiedad. Preferimos métricas claras y separadas.
- **Incluir gráficos de tendencia complejos.** Descartado porque la mayoría de personas no interpreta gráficos correctamente y pueden generar interpretaciones erróneas.
- **Comparar el progreso de la persona con el de su Circle.** Descartado porque viola la Tensión 1 (Comunidad sin comparación).

## Riesgos

- Que las métricas de Progress generen obsesión por los números en lugar de enfoque en el proceso.
- Que una persona con baja frecuencia (pero alta consistencia a largo plazo) se sienta "insuficiente" al ver sus métricas.
- Que la ausencia de comparación haga que algunas personas sientan que no tienen referencia para saber si "lo están haciendo bien."

## Preguntas abiertas

- ¿El Progress debe tener objetivos definidos por el usuario, o debe ser puramente retrospectivo?
- ¿Debe el sistema sugerir ajustes si detecta patrones de abandono inminente?
- ¿La línea temporal (Journey) debe ser automática o configurable por el usuario?

## Impacto en la arquitectura

**No se necesita una tabla `progress`.** Progress se calcula en tiempo de consulta a partir de la tabla `commits`.

**Funciones de base de datos necesarias:**

- `get_continuity(user_id)` — Calcula tiempo en el proceso, frecuencia semanal, total de Commits
- `get_journey_timeline(user_id, range)` — Devuelve puntos para la visualización temporal
- `get_patterns(user_id)` — Identifica patrones semanales, regresos, pausas

**Vistas materializadas potenciales:**

- `user_weekly_stats` — Agregación semanal para consultas rápidas (se actualiza con cada Commit o diariamente)

**Componentes futuros:**

- `ProgressHeader` — Métrica principal y tiempo en el proceso
- `JourneyTimeline` — Visualización orgánica de la línea de tiempo
- `WeeklyPulse` — Indicador de ritmo semanal
- `PatternCard` — Patrones detectados (días fuertes, momentos de pausa)

**APIs futuras:**

- `GET /progress/:userId/summary` — Métricas principales
- `GET /progress/:userId/journey?range=3m` — Datos para la línea de tiempo
- `GET /progress/:userId/patterns` — Patrones detectados

---

## Próximo documento

`docs/domain/circle.md` — Los compañeros de proceso.
