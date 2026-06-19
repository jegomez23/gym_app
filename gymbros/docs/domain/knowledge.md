# Domain — Knowledge

> **Propósito de este documento:** Definir el dominio Knowledge, el aprendizaje compartido que emerge del proceso. Knowledge es supporting, no core. El producto cumple su misión sin él, pero añade profundidad cuando existe.

---

## ¿Qué representa?

Knowledge representa **lo que aprendo y comparto durante mi proceso**.

No es una biblioteca. No es un curso. No es contenido generado por la plataforma. Es el conocimiento orgánico que emerge de la práctica: una rutina que funcionó, un consejo que alguien compartió, un libro que ayudó, una cita que resonó.

Knowledge es el subproducto natural de un proceso compartido: cuando las personas hacen y reflexionan, generan conocimiento que puede servir a otros.

---

## ¿Por qué existe?

1. **El conocimiento sin acción no produce cambio** (Observación 13). Pero el conocimiento que nace de la acción — y se comparte con compañeros de proceso — sí tiene valor porque está contextualizado.
2. **El aprendizaje es una dimensión del crecimiento** (Manifiesto). No basta con hacer. También hay que entender lo que se hace.
3. **Compartir conocimiento refuerza el Circle.** Cuando alguien comparte algo útil, no solo ayuda a otros: refuerza su propia identidad como alguien que contribuye al proceso colectivo.

---

## ¿Qué NO es Knowledge?

- **No es una biblioteca de contenido.** La plataforma no genera contenido. El contenido lo generan las personas.
- **No es un curso.** No hay lecciones, módulos, ni progresión de aprendizaje.
- **No es un feed de artículos.** No hay algoritmo que recomiende contenido.
- **No es un foro.** No hay discusiones públicas, hilos, ni respuestas.

---

## Componentes de Knowledge

### Saved Content (Supporting)

Contenido que una persona guarda para sí misma.

- Rutinas que alguien compartió
- Citas o frases que resonaron
- Enlaces a recursos útiles
- Técnicas o tips

**Visibilidad:** Privado. Cada persona guarda lo que le sirve.

### Shared Learning (Future)

Aprendizajes que una persona comparte con su Circle.

- "Descubrí que hacer press militar con mancuernas me funciona mejor que con barra"
- "Llevo una semana aplicando esto y he notado diferencia"
- "Este libro cambió mi forma de ver el entrenamiento"

**Visibilidad:** Circle. No es público.

### Tips & Techniques (Future)

Consejos prácticos que fluyen naturalmente entre miembros del Circle.

- No es una función separada. Es un tipo de Shared Learning.
- Se diferencia del Shared Learning general porque es procedural: "cómo hacer algo."

---

## Relaciones con otras entidades

| Entidad     | Tipo de relación  | Descripción                                                 |
| ----------- | ----------------- | ----------------------------------------------------------- |
| Circle      | Compartido en     | El conocimiento se comparte dentro del Circle               |
| Commits     | Puede referenciar | Un conocimiento puede hacer referencia a Commits            |
| Reflections | Puede originarse  | Una Reflection puede convertirse en conocimiento compartido |

---

## Decisiones tomadas

1. **Knowledge es supporting.** No entra en el MVP. Puede esperar a v2 o v3.
2. **El contenido es generado por las personas, no por la plataforma.** Gym Circle no produce contenido.
3. **El conocimiento se comparte dentro del Circle, no globalmente.** No hay un "marketplace" de conocimiento.
4. **Saved Content es privado.** Shared Learning es para el Circle.

## Alternativas descartadas

- **Knowledge como sección principal del producto.** Descartado porque la misión es continuidad, no aprendizaje. Knowledge es valioso pero no crítico.
- **Knowledge como feed público.** Descartado porque sería contenido generado por usuarios sin contexto, acercándose a una red social.
- **Recomendaciones algorítmicas de contenido.** Descartado porque viola la filosofía de no tener algoritmos.

## Riesgos

- Que Knowledge nunca se implemente por ser supporting y se pierda una dimensión valiosa del producto.
- Que Shared Learning se confunda con un feed social.
- Que las personas no generen suficiente conocimiento para que el dominio tenga sentido.

## Preguntas abiertas

- ¿Saved Content debe permitir guardar contenido de fuera de la plataforma (enlaces externos)?
- ¿Shared Learning debe tener reacciones o comentarios del Circle?
- ¿Debe haber un límite de contenido guardado?

## Impacto en la arquitectura

**Tablas futuras:**

```sql
saved_content (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  content TEXT,
  type TEXT CHECK (type IN ('routine', 'quote', 'technique', 'book', 'podcast', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

shared_learning (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  circle_user_id UUID REFERENCES circle_memberships(id),
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('insight', 'tip', 'recommendation', 'reflection')),
  visibility TEXT NOT NULL DEFAULT 'circle' CHECK (visibility IN ('circle')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Componentes futuros:**

- `SavedContentList` — Lista de contenido guardado
- `SharedLearningCard` — Aprendizaje compartido en el Circle
- `ShareLearningForm` — Formulario para compartir un aprendizaje

---

## Próximo documento

Con todos los dominios definidos, el siguiente paso es volver a `docs/product/` para el siguiente documento: `01-user-flows.md`.
