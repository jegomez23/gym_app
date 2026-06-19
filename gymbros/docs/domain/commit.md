# Domain — Commit

> **Propósito de este documento:** Definir profundamente la entidad Commit, la raíz del sistema Gym Circle. Este documento describe qué es un Commit, por qué existe, qué responsabilidades tiene, qué nunca debería hacer, y cómo se relaciona con el resto del sistema.

---

## ¿Qué representa?

Un Commit representa **una acción disciplinada que una persona decide registrar como evidencia de su proceso**.

No es un entrenamiento. No es una tarea. Es un compromiso cumplido con uno mismo. Puede ser cualquier acción que la persona considere parte de su proceso de mejora: entrenar, dormir 8 horas, leer 20 páginas, preparar comida, meditar, hacer movilidad, recuperarse activamente.

Cada Commit es un voto por la persona que alguien está intentando ser.

---

## ¿Por qué existe?

El Commit es la unidad atómica del sistema porque:

1. **El progreso necesita hacerse visible** (Observación 2). El Commit es el mecanismo para capturar esa visibilidad en el momento en que ocurre.
2. **Las pequeñas omisiones se acumulan** (Observación 5). El Commit actúa como un cortafuegos contra la desviación gradual: registrar la acción la hace consciente y evita que se naturalice la omisión.
3. **Cada acción refuerza identidad** (Observación 3). Cada Commit registrado no es un dato: es una declaración de "esta es la persona que estoy siendo."
4. **El compromiso visible es más resistente** (Observación 11). Al registrar un Commit, la persona lo hace visible (al menos para sí misma), activando el principio de coherencia.

Sin Commits, no hay materia prima para ningún otro dominio. No hay Progress que mostrar, no hay Journey que narrar, no hay Presence que compartir, no hay Reflections que capturar.

---

## Responsabilidades

### 1. Capturar la acción en el momento

El Commit debe poder registrarse en segundos. La fricción debe ser mínima porque se registrará en momentos donde la persona puede estar cansada, con poco tiempo o poca motivación (precisamente cuando más necesita registrar).

### 2. Ser la fuente de verdad del progreso

Todas las métricas de progreso, continuidad y evolución se derivan de los Commits. No debe haber otra fuente de datos sobre la actividad de la persona.

### 3. Permitir diferentes tipos de acción

El Commit no puede limitarse a "entrenamientos". Debe ser lo suficientemente flexible para capturar cualquier acción disciplinada que la persona decida incluir en su proceso.

### 4. Conectar con el estado emocional

Cada Commit puede (pero no debe obligatoriamente) incluir un estado emocional. Esto permite ver patrones entre la acción y el estado de ánimo a lo largo del tiempo.

### 5. Alimentar todos los demás dominios

El Commit es la raíz. Debe proporcionar los datos necesarios para que Progress, Circle, Presence, Journey y Reflections puedan existir.

---

## ¿Qué nunca debería hacer un Commit?

- **Nunca debería medir calidad de la acción.** Un Commit no evalúa si la acción fue "buena" o "mala". Solo registra que ocurrió. La evaluación es responsabilidad de otros dominios (Reflections, Mood).
- **Nunca debería requerir datos innecesarios.** Pedir duración, intensidad o tipo de acción debe ser opcional. El mínimo es: "ocurrió." Lo demás es profundidad opcional.
- **Nunca debería comparar Commits entre personas.** El Commit de una persona no es comparable con el de otra. Cada quien define qué acciones son relevantes para su proceso.
- **Nunca debería convertirse en una obligación estresante.** Si la persona siente que "debe" registrar o que omitir un registro es un fracaso, el sistema está fallando. El Commit es una herramienta, no una carga.
- **Nunca debería ser público sin consentimiento explícito.** Cada Commit tiene un nivel de visibilidad. Por defecto, puede ser privado. La persona elige qué compartir y con quién.

---

## Atributos fundamentales

| Atributo           | Tipo              | Obligatorio | Propósito                                               |
| ------------------ | ----------------- | ----------- | ------------------------------------------------------- |
| `id`               | UUID              | Sí          | Identificador único                                     |
| `user_id`          | UUID (FK)         | Sí          | Propietario del Commit                                  |
| `title`            | string            | No          | Nombre o etiqueta del Commit                            |
| `type`             | enum              | No          | Categoría: training, nutrition, rest, mind,读书, custom |
| `recorded_at`      | timestamp         | Sí          | Cuándo ocurrió la acción                                |
| `duration_minutes` | number            | No          | Duración (si aplica)                                    |
| `intensity`        | enum              | No          | Light / Steady / Deep (percepción subjetiva)            |
| `mood`             | enum (FK a moods) | No          | Estado emocional asociado                               |
| `note`             | text              | No          | Reflexión breve o nota                                  |
| `visibility`       | enum              | Sí          | private / circle / public                               |
| `evidence`         | string[]          | No          | Pequeñas pruebas palpables: series, páginas, minutos    |

**Nota:** La mayoría de atributos son opcionales porque el Commit debe poder registrarse en segundos. Cuantos más datos se pidan, mayor fricción. La regla es: el mínimo es una línea de tiempo (`recorded_at`). Todo lo demás es opcional.

---

## Tipos de Commit

Los tipos de Commit deben ser definidos por el usuario, no impuestos por el sistema. Sin embargo, el sistema puede sugerir categorías comunes basadas en cómo otras personas las usan.

**Categorías sugeridas (no limitantes):**

- `training` — Entrenamiento físico
- `nutrition` — Alimentación consciente
- `rest` — Descanso, recuperación, sueño
- `mind` — Meditación, lectura, escritura
- `mobility` — Movilidad, estiramiento
- `cardio` — Cardiovascular
- `sport` — Deporte específico
- `custom` — Definido por el usuario

La persona puede crear sus propios tipos. El sistema no debe limitar.

---

## Relaciones con otras entidades

| Entidad    | Tipo de relación | Descripción                                                      |
| ---------- | ---------------- | ---------------------------------------------------------------- |
| User       | Pertenece a      | Cada Commit pertenece a un único usuario                         |
| Mood       | Puede tener      | Un Commit puede tener un Mood asociado (opcional)                |
| Reflection | Puede tener      | Un Commit puede generar una Reflection (opcional, posterior)     |
| Circle     | Visible para     | Un Commit puede ser visible para el Circle según su `visibility` |
| Progress   | Alimenta         | Los Commits son la materia prima del Progress                    |
| Journey    | Compone          | Los Commits son los puntos en la línea del Journey               |
| Presence   | Alimenta         | Los Commits recientes alimentan la Presence del usuario          |

---

## Estados del Commit

- **Draft:** La persona empezó a registrar pero no completó. (¿Debería existir? Probablemente no. Mejor no guardar hasta completar.)
- **Completed:** El Commit está registrado y completo.
- **Shared:** El Commit fue completado y es visible para el Circle (si aplica).
- **Archived:** El Commit existe pero no contribuye a métricas activas. (Útil si alguien quiere registrar algo del pasado.)

**Decisión:** Solo `Completed` existe en MVP. `Archived` puede ser útil después. `Draft` añade complejidad innecesaria.

---

## Decisiones tomadas

1. **El Commit no evalúa calidad.** Solo registra existencia. La evaluación es responsabilidad de Mood y Reflections.
2. **El mínimo es `recorded_at`.** Un Commit puede ser tan simple como "hoy, a las 18:30, ocurrió algo." Todo lo demás es opcional.
3. **Los tipos de Commit son definibles por el usuario.** El sistema sugiere pero no impone.
4. **La visibilidad es determinada por commit, no global.** Una persona puede tener Commits privados y compartidos en el mismo día.

## Alternativas descartadas

- **Hacer obligatorio el tipo de Commit.** Descartado porque añade fricción innecesaria. La persona que entrena sabe que entrenó; no necesita categorizarlo para que el sistema funcione.
- **Incluir metadatos de ejercicio (series, repes, peso).** Descartado porque eso es propio de aplicaciones fitness tradicionales. Gym Circle no compite con Hevy o Strong. Si la persona quiere registrar eso, puede ponerlo en `note` o `evidence`.
- **Validar que el Commit sea "real" (geolocalización, fotos, etc.).** Descartado porque el sistema se basa en la confianza y la coherencia interna de la persona consigo misma, no en la verificación externa.

## Riesgos

- Que la simplicidad del Commit haga que la persona no lo tome en serio. "Es solo apretar un botón." La solución es que el lenguaje del sistema refuerce constantemente el significado del Commit.
- Que la flexibilidad de tipos haga que los datos sean difíciles de agregar. La solución es no necesitar agregación por tipo: el sistema mide continuidad, no categorías.
- Que la opcionalidad lleve a que nadie registre nada más allá del mínimo. La solución es diseñar la experiencia para que añadir profundidad sea natural y satisfactorio, no obligatorio.

## Preguntas abiertas

- ¿Debería haber un límite de Commits por día? ¿Tiene sentido registrar 10 micro-acciones?
- ¿El Commit debería poder editarse después de creado, o una vez registrado es inmutable?
- ¿Debería haber un concepto de "Commit streak" además de la métrica de continuidad general?

## Impacto en la arquitectura

**Tabla futura:**

```sql
commits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT,
  type TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  intensity TEXT CHECK (intensity IN ('light', 'steady', 'deep')),
  mood_id UUID REFERENCES moods(id),
  note TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'circle', 'public')),
  evidence JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Índices necesarios:**

- `(user_id, recorded_at DESC)` — Consulta principal de timeline
- `(user_id, created_at DESC)` — Consulta de commits recientes
- `(user_id, visibility)` — Para filtrar lo que se comparte

**Políticas RLS:**

- El usuario puede ver sus propios Commits siempre
- El usuario puede ver Commits de miembros de su Circle si `visibility = 'circle'`
- El usuario puede ver Commits públicos si `visibility = 'public'`
- Solo el propietario puede crear/editar/eliminar

**Componentes futuros:**

- `CommitForm` — Formulario rápido de registro (MVP)
- `CommitCard` — Visualización de un Commit individual
- `CommitTimeline` — Lista temporal de Commits
- `CommitButton` — Botón de acción rápida (registrar desde cualquier lugar)

**APIs futuras:**

- `POST /commits` — Crear Commit
- `GET /commits?userId=X&limit=20` — Timeline de Commits
- `GET /commits/:id` — Commit individual
- `DELETE /commits/:id` — Eliminar Commit (con límite de tiempo)

---

## Próximo documento

`docs/domain/progress.md` — Cómo los Commits se transforman en evidencia visible del avance.
