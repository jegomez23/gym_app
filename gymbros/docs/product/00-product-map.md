# 00 — Product Map

> **Propósito de este documento:** Definir el mapa conceptual y estructural de Gym Circle antes de pensar en pantallas, flujos o interfaz. Este documento responde qué sistemas existen, cómo se relacionan, cuál es el núcleo y qué es extensión. Es la fuente de verdad para todas las decisiones de arquitectura futuras.

---

## ¿Qué es Gym Circle?

Gym Circle es un sistema diseñado para que el progreso personal no se viva en soledad.

No es una aplicación fitness. No es una red social. No es un diario. Es un sistema con cuatro dominios fundamentales que interactúan para hacer visible el progreso, fortalecer la identidad y conectar a las personas que recorren caminos similares.

Este mapa describe esos dominios y sus relaciones desde la perspectiva del dominio, no desde la interfaz de usuario. La navegación, las pantallas y los flujos serán decisiones posteriores que deben respetar esta estructura.

---

## Mapa del dominio

```
                        ┌─────────────────────────────┐
                        │         IDENTITY            │
                        │  Quién me estoy convirtiendo │
                        └─────────────────────────────┘
                                      │
                                      │ refuerza
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PROGRESS                                │
│         La evidencia acumulada de mi transformación              │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ COMMITS  │  │   PRs    │  │ JOURNEY  │  │ REFLECTIONS    │   │
│  │ Acciones │  │ Logros   │  │ Narrativa│  │ Insight personal│   │
│  │ diarias  │  │ clave    │  │ temporal │  │ y emocional    │   │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
               │                            │
               │ visible para               │ alimenta
               ▼                            ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│         CIRCLE              │  │          MIND               │
│  Quién camina conmigo       │  │  Cómo me siento en el       │
│                             │  │  proceso                    │
│  ┌────────────────────┐     │  │                             │
│  │ Relationships      │     │  │  ┌────────────────────┐     │
│  │ Vínculos           │     │  │  │ Mood               │     │
│  │ significativos     │     │  │  │ Estado emocional   │     │
│  ├────────────────────┤     │  │  ├────────────────────┤     │
│  │ Shared History     │     │  │  │ Reflections        │     │
│  │ Memoria colectiva  │     │  │  │ Insight del proceso│     │
│  ├────────────────────┤     │  │  ├────────────────────┤     │
│  │ Presence           │     │  │  │ Gratitude / Pride  │     │
│  │ Saber que están    │     │  │  │ Reconocimiento     │     │
│  │ ahí                │     │  │  └────────────────────┘     │
│  └────────────────────┘     │  └─────────────────────────────┘
└─────────────────────────────┘
               │
               │ intercambio
               ▼
┌─────────────────────────────┐
│        KNOWLEDGE            │
│  Lo que aprendo y comparto  │
│                             │
│  ┌────────────────────┐     │
│  │ Saved Content      │     │
│  │ Guardado personal  │     │
│  ├────────────────────┤     │
│  │ Shared Learning    │     │
│  │ Descubrimientos    │     │
│  │ compartidos        │     │
│  ├────────────────────┤     │
│  │ Tips & Techniques  │     │
│  │ Consejos del Circle│     │
│  └────────────────────┘     │
└─────────────────────────────┘
```

---

## Los dominios

### Identity (Núcleo)

**¿Qué representa?**
Quién me estoy convirtiendo a través de este proceso. No es un dominio con entidades propias, sino una capa transversal que todos los demás dominios refuerzan.

**¿Por qué existe?**
La identidad es la palanca más poderosa para mantener la continuidad (Observación 3). Gym Circle existe para que la persona pase de "intento ser constante" a "soy alguien constante". Todos los sistemas deben contribuir a esa transformación.

**¿Qué lo compone?**

- No tiene entidades propias. Identity es el resultado de la acumulación de Commits, la visibilidad del Progreso, la compañía del Circle, la profundidad del Mind y el aprendizaje del Knowledge.
- El lenguaje del sistema (UX Writing, feedback, notificaciones) es la principal herramienta para reforzar identidad.

### Progress (Core)

**¿Qué representa?**
La evidencia acumulada de mi transformación. Todo lo que he hecho, logrado y aprendido durante mi proceso.

**¿Por qué existe?**
El progreso importante es invisible mientras ocurre (Observación 2). Las personas no saben medir su propio progreso (Observación 12). Progress existe para hacer visible lo invisible.

**Subsistemas:**

- **Commits:** La unidad atómica del sistema. Cada acción disciplinada que una persona registra. Es la materia prima de todo lo demás.
- **PRs (Personal Records):** Logros clave que marcan un antes y un después. No solo físicos: pueden ser intelectuales, emocionales o de hábitos.
- **Journey:** La narrativa temporal del proceso. No es una lista de commits, sino una historia que muestra evolución, pausas y regresos.
- **Reflections:** Insights personales que la persona captura después de un Commit o en momentos clave. Conectan la acción con el aprendizaje.

### Circle (Core)

**¿Qué representa?**
Las personas que forman parte de mi proceso de crecimiento. No son amigos en el sentido tradicional. Son compañeros de camino.

**¿Por qué existe?**
El esfuerzo solitario tiene menos probabilidades de persistir (Observación 4). Las personas necesitan testigos de su transformación (Observación 9). Circle existe para que el progreso no se viva en soledad.

**Subsistemas:**

- **Relationships:** Los vínculos entre personas dentro del sistema. No son "amistades" genéricas, sino conexiones con contexto: cómo se conocieron, qué comparten, qué historia tienen.
- **Shared History:** La memoria colectiva del Circle. Estadísticas, eventos compartidos, tiempo juntos en el proceso. Esto diferencia a Circle de una lista de amigos: tiene memoria.
- **Presence:** Saber que los otros están ahí, incluso sin interacción directa. No es actividad ("publicó algo"), es existencia ("sé que está en esto conmigo").

### Mind (Core)

**¿Qué representa?**
Cómo me siento en el proceso. El estado emocional, las reflexiones profundas y el reconocimiento del propio esfuerzo.

**¿Por qué existe?**
El lenguaje que usamos sobre nosotros mismos determina lo que hacemos (Observación 10). Mind existe para que la persona procese su experiencia emocional y refuerce su identidad desde dentro.

**Subsistemas:**

- **Mood:** Estado emocional registrado durante o después de la acción. No es un diario abierto, es un registro estructurado que permite ver patrones emocionales a lo largo del tiempo.
- **Reflections:** Insights personales profundos. Lo que la persona aprendió sobre sí misma durante el proceso.
- **Gratitude / Pride:** Reconocimiento consciente del propio esfuerzo. Contrapeso necesario a la tendencia humana de enfocarse solo en lo que falta.

### Knowledge (Supporting)

**¿Qué representa?**
Lo que aprendo y comparto durante el proceso. Contenido útil que emerge de la práctica.

**¿Por qué existe?**
El conocimiento sin acción no produce cambio (Observación 13). Pero el conocimiento que nace de la acción — y se comparte con compañeros de proceso — sí tiene valor. Knowledge existe para capturar y compartir ese aprendizaje orgánico.

**Subsistemas:**

- **Saved Content:** Guardado personal de contenido útil (rutinas, citas, técnicas).
- **Shared Learning:** Descubrimientos compartidos dentro del Circle. No es un feed público, es intercambio entre personas que se conocen.
- **Tips & Techniques:** Consejos prácticos que fluyen naturalmente entre miembros del Circle.

### Notifications (Cross-cutting)

**¿Qué representa?**
El sistema que mantiene al usuario conectado con su proceso y su Circle sin generar dependencia ni ansiedad.

**¿Por qué existe?**
Las notificaciones son necesarias para reducir la fricción del entorno (Observación 15), pero mal diseñadas generan adicción. Este sistema debe diseñarse bajo el principio de "tecnología sin adicción" (Tensión 3).

**Responsabilidades:**

- Recordar sin presionar
- Celebrar sin inflar
- Conectar sin interrumpir
- Desaparecer cuando no se necesita

---

## Relaciones entre dominios

| Dominio A     | Se relaciona con Dominio B | ¿Cómo?                                                                   |
| ------------- | -------------------------- | ------------------------------------------------------------------------ |
| Commits       | Progress                   | Los Commits son la materia prima del Progreso                            |
| Commits       | Circle                     | Los Commits pueden ser visibles para el Circle                           |
| Commits       | Mind                       | Cada Commit puede incluir un estado emocional                            |
| Commits       | Identity                   | Cada Commit refuerza la identidad de "alguien que actúa"                 |
| Progress      | Identity                   | El Progreso visible demuestra a la persona quién se está convirtiendo    |
| Circle        | Presence                   | El Circle necesita Presence para sentirse vivo sin interacción constante |
| Circle        | Shared History             | La Shared History es lo que diferencia a Circle de "amigos"              |
| Mind          | Reflections                | Las Reflections alimentan el Mind y viceversa                            |
| Knowledge     | Circle                     | El Knowledge se intercambia dentro del Circle                            |
| Journey       | Progress                   | El Journey es la narrativa del Progress a lo largo del tiempo            |
| Notifications | Todos                      | Notifications atraviesa todos los dominios                               |

---

## Dependencias entre dominios

```
Identity (depende de todos)
  │
  ├── Progress (depende de Commits)
  │     ├── Commits (no depende de nadie - es la raíz)
  │     ├── PRs (depende de Commits)
  │     ├── Journey (depende de Commits + Reflections)
  │     └── Reflections (depende de Commits)
  │
  ├── Circle (depende de tener al menos 2 personas)
  │     ├── Relationships (depende de Circle)
  │     ├── Shared History (depende de Circle + Commits)
  │     └── Presence (depende de Circle + Commits)
  │
  ├── Mind (depende de Commits)
  │     ├── Mood (depende de Commits)
  │     └── Reflections (depende de Commits)
  │
  ├── Knowledge (no depende de nadie)
  │     ├── Saved Content (no depende)
  │     └── Shared Learning (depende de Circle)
  │
  └── Notifications (atraviesa todos)
```

**Conclusión:** Commits es la raíz del sistema. Sin Commits, no hay Progress, no hay Journey, no hay Reflections significativas, no hay Presence. Circle puede existir sin Commits (tener un Circle vacío), pero no tendría sentido. Knowledge puede existir independientemente pero es marginal sin los otros dominios.

---

## Core vs Supporting vs Future

### Core (el producto no existe sin esto)

- Commits (raíz del sistema)
- Progress (visibilidad del avance)
- Circle (compañía en el proceso)
- Identity (capa transversal que todos refuerzan)
- Journey (narrativa temporal)
- Presence (saber que los otros están ahí)

### Supporting (mejora la experiencia pero no es crítica para el MVP)

- Reflections (profundidad del proceso)
- Mood (conexión emocional)
- Shared History (memoria colectiva)
- Mind (procesamiento emocional)
- Notifications (sistema de conexión)

### Future (puede esperar a versiones posteriores)

- PRs (logros clave)
- Knowledge (aprendizaje compartido)
- Tips & Techniques (intercambio de conocimiento)
- Gratitude / Pride (reconocimiento consciente)

---

## Decisiones tomadas

1. **Commits es la raíz del sistema.** Todo el producto gira alrededor de esta acción fundamental. Sin Commits, no hay datos, no hay progreso, no hay presencia, no hay historia compartida.
2. **Identity no es un módulo, es una capa transversal.** No tendrá su propia sección en la interfaz. Se expresará a través del lenguaje del sistema en cada interacción.
3. **Circle no son amigos.** Circle tiene memoria compartida (Shared History) y presencia (Presence). Esto lo diferencia fundamentalmente de cualquier lista de contactos.
4. **Mind y Reflections están cerca pero no son lo mismo.** Mind es el estado emocional estructurado; Reflections es la narrativa personal profunda. Pueden fusionarse en la interfaz pero son conceptualmente distintos.
5. **Knowledge es supporting, no core.** Puede esperar. El producto cumple su misión sin Knowledge.

## Alternativas descartadas

- **Hacer de Identity un módulo independiente con su propia pantalla.** Descartado porque Identity no es una feature, es el resultado de todo lo demás. Tener una pantalla de "Identidad" sería forzado y contradiría la filosofía.
- **Fusionar Mind y Reflections en una sola entidad.** Descartado porque cumplen funciones distintas: Mind captura estado, Reflections captura narrativa.
- **Hacer de Knowledge un dominio core.** Descartado porque la misión del producto es continuidad, no aprendizaje. Knowledge es valioso pero no crítico.
- **Incluir PRs en el core.** Descartado porque los PRs son un subproducto de los Commits, no una necesidad fundamental. Pueden añadirse después.

## Riesgos

- Que Commits se convierta en el único foco y los demás dominios queden infradesarrollados.
- Que Circle se diseñe como una red social tradicional en lugar de como un espacio de presencia compartida.
- Que la capa de Identity se descuide por ser "transversal" y nadie la implemente explícitamente.
- Que Knowledge, al ser supporting, nunca se implemente y el producto pierda una dimensión valiosa.

## Preguntas abiertas

- ¿Journey debe ser una visualización automática de los Commits o una construcción activa por parte del usuario?
- ¿Presence necesita interacción para mantenerse viva, o la mera existencia del otro es suficiente?
- ¿Las Reflections deben ser privadas por defecto, o compartidas con el Circle?
- ¿Debe existir un límite en el tamaño del Circle? ¿Cuántas personas puede abarcar significativamente una persona?

## Impacto en la arquitectura

**Entidades futuras:**

- `commits` (tabla raíz)
- `profiles` (identidad del usuario)
- `circle_memberships` (relaciones entre personas)
- `circle_activity` (presencia y actividad compartida)
- `moods` (estados emocionales)
- `reflections` (narrativas personales)
- `prs` (logros clave)
- `saved_content` / `shared_learning` (knowledge)

**Relaciones clave:**

- Un usuario tiene muchos Commits
- Un usuario tiene muchas Circle Memberships (un Circle es bidireccional)
- Un Commit puede tener un Mood asociado
- Un Commit puede tener una Reflection asociada
- Circle Activity se deriva de Commits de los miembros

**Componentes futuros:**

- Commit Creator (acción principal)
- Progress Timeline (visualización del Journey)
- Circle Dashboard (presencia y shared history)
- Reflection Prompt (captura de insight)

**APIs futuras:**

- CRUD de Commits (raíz)
- Consulta de Progress agregado
- Consulta de Circle Presence en tiempo real
- Consulta de Shared History

---

## Próximo documento

`docs/domain/commit.md` — Definición profunda de la entidad Commit, la raíz del sistema.
