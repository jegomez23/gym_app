# Domain — Reflection

> **Propósito de este documento:** Definir el concepto de Reflection, el insight personal que emerge del proceso. Reflection no es un diario. Es una captura estructurada de aprendizaje que conecta la acción con la identidad.

---

## ¿Qué representa?

Reflection representa **el insight personal que una persona captura sobre su proceso**.

No es un diario abierto. No es una nota al azar. Es un momento de conciencia donde la persona conecta lo que hizo con lo que aprendió sobre sí misma. Una Reflection puede ser:

- "Hoy entendí que estaba haciendo mal el press militar"
- "Me di cuenta de que entreno mejor por la mañana"
- "Volver después de 5 días fue más fácil de lo que pensaba"
- "Esta semana aprendí que la constancia importa más que la intensidad"

---

## ¿Por qué existe?

1. **El lenguaje que usamos sobre nosotros mismos determina lo que hacemos** (Observación 10). Las Reflections son una oportunidad para que la persona se hable a sí misma en términos de identidad y aprendizaje.
2. **El conocimiento sin acción no produce cambio** (Observación 13). Pero la reflexión sobre la acción sí produce cambio. Reflection cierra el círculo entre hacer y aprender.
3. **La identidad necesita narrativa** (Observación 3). Las Reflections proporcionan la materia prima para que la persona construya su historia de transformación.

---

## ¿Qué NO es Reflection?

- **No es un diario personal.** No está diseñado para escritura libre y extensa. Es una captura breve y significativa.
- **No es obligatorio.** La persona puede tener cientos de Commits sin ninguna Reflection. El sistema no debe presionar para que reflexione.
- **No es público por defecto.** Las Reflections son personales. La persona decide si compartirlas con su Circle.
- **No es un logro.** No se celebra tener Reflections. Se valora que existan, pero no se gamifica.

---

## Cómo se captura una Reflection

La Reflection debe capturarse en el momento adecuado, no forzarse.

**Momentos naturales para reflexionar:**

- Después de completar un Commit (especialmente si fue significativo)
- Después de un regreso (¿cómo se sintió volver?)
- Al final de la semana (¿qué aprendí esta semana?)
- Al alcanzar un hito (¿cómo he cambiado desde que empecé?)

**Formato:**

- Una pregunta abierta, no un campo vacío. "¿Qué aprendiste hoy?" en lugar de "Escribe tu reflexión."
- Límite de extensión. 200-300 caracteres máximo. La brevedad fuerza la claridad.
- Opcional: etiquetar el tipo de insight (técnico, emocional, identidad, proceso).

---

## Relaciones con otras entidades

| Entidad  | Tipo de relación  | Descripción                                                  |
| -------- | ----------------- | ------------------------------------------------------------ |
| Commits  | Asociada a        | Una Reflection puede estar asociada a un Commit específico   |
| Mind     | Alimenta          | Las Reflections alimentan el dominio Mind                    |
| Identity | Construye         | Las Reflections ayudan a construir la narrativa de identidad |
| Journey  | Enriquece         | Las Reflections pueden aparecer como hitos en el Journey     |
| Circle   | Puede compartirse | Una Reflection puede compartirse con el Circle               |

---

## Decisiones tomadas

1. **Las Reflections son breves por diseño.** Máximo 300 caracteres. La brevedad fuerza el insight genuino.
2. **Las Reflections no son obligatorias.** El sistema sugiere pero no exige.
3. **Las Reflections son privadas por defecto.** La persona elige compartirlas.
4. **Las Reflections se asocian a Commits o a momentos temporales** (semana, hito), no existen en el vacío.

## Alternativas descartadas

- **Reflection como diario abierto.** Descartado porque un diario abierto es demasiado amplio y la mayoría de personas no lo mantiene.
- **Reflection gamificada (rachas de reflexión).** Descartado porque gamificar la reflexión la vacía de significado.
- **Reflection obligatoria después de cada Commit.** Descartado porque añade fricción y puede hacer que la persona evite registrar Commits.

## Riesgos

- Que las Reflections se sientan como una tarea escolar.
- Que la persona escriba Reflections superficiales solo porque el sistema se lo pide.
- Que las Reflections compartidas con el Circle generen presión por "tener que" compartir algo profundo.

## Preguntas abiertas

- ¿Debe el sistema sugerir temas de reflexión basados en patrones detectados?
- ¿Las Reflections deben ser editables después de creadas?
- ¿Debe haber un "muro" de Reflections personales que la persona pueda revisar?

## Impacto en la arquitectura

**Tabla futura:**

```sql
reflections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  commit_id UUID REFERENCES commits(id),
  content TEXT NOT NULL CHECK (length(content) <= 300),
  type TEXT CHECK (type IN ('technical', 'emotional', 'identity', 'process')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'circle')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Índices necesarios:**

- `(user_id, created_at DESC)` — Consulta de reflections recientes
- `(user_id, commit_id)` — Asociación con Commit específico

**Políticas RLS:**

- El usuario puede ver sus propias Reflections siempre
- El Circle puede ver Reflections compartidas con `visibility = 'circle'`

**Componentes futuros:**

- `ReflectionPrompt` — Pregunta que invita a reflexionar
- `ReflectionCard` — Visualización de una Reflection
- `ReflectionTimeline` — Lista temporal de Reflections

---

## Próximo documento

`docs/domain/knowledge.md` — El aprendizaje compartido dentro del Circle.
