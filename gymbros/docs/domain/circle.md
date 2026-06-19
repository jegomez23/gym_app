# Domain — Circle

> **Propósito de este documento:** Definir el concepto de Circle, la entidad que representa a las personas que forman parte del proceso de crecimiento de un usuario. Circle no son amigos, no son seguidores, no son contactos. Son compañeros de camino con historia compartida.

---

## ¿Qué representa?

Circle representa **las personas que forman parte de tu proceso de crecimiento**.

No importa si entrenan contigo todos los días. No importa si entrenan solos. No importa si solo hablan algunas veces. Lo importante es que forman parte de tu evolución. Circle es el conjunto de personas cuya presencia — incluso silenciosa — hace que tu progreso no se viva en soledad.

Circle no es una lista de contactos. Circle tiene memoria, tiene historia compartida, tiene presencia.

---

## ¿Por qué existe?

1. **El esfuerzo solitario tiene menos probabilidades de persistir** (Observación 4). Circle existe para que la persona sepa que no está sola en su proceso.
2. **Las personas necesitan testigos de su transformación** (Observación 9). Circle existe para que haya personas que vean el progreso aunque la persona no pueda verlo.
3. **La pertenencia reduce el esfuerzo necesario** (Observación 14). Circle existe para que la continuidad sea la norma del grupo, no un esfuerzo individual.
4. **El compromiso visible es más resistente** (Observación 11). Circle existe para que los compromisos tengan testigos significativos.

---

## ¿Qué NO es Circle?

- **No es una red social.** No hay feed, no hay scroll infinito, no hay contenido viral, no hay algoritmos.
- **No es una lista de amigos.** Circle no se construye añadiendo contactos. Se construye compartiendo un proceso.
- **No es una lista de seguidores.** No hay asimetría. Si A está en el Circle de B, B está en el Circle de A. La relación es bidireccional.
- **No es un chat.** La comunicación dentro de Circle no es mensajería instantánea. Es presencia, apoyo y reconocimiento.

---

## Características fundamentales de Circle

### 1. Es bidireccional

La relación Circle siempre es mutua. No puedes agregar a alguien a tu Circle sin que esa persona te agregue al suyo. No hay "seguir." Hay "caminar juntos."

### 2. Tiene memoria

Circle no es una instantánea del presente. Acumula historia compartida:

- Cuánto tiempo llevan en el proceso juntos
- Cuántos Commits ha compartido cada uno
- Cuántos regresos han presenciado
- Cuántas veces se han apoyado mutuamente

Esta memoria es lo que diferencia a Circle de una lista de amigos.

### 3. No requiere interacción constante

Una persona puede estar en tu Circle sin que interactúen durante semanas. La presencia silenciosa sigue siendo presencia. El sistema debe reflejar que el otro "está ahí" aunque no haya actividad reciente.

### 4. Tiene un tamaño limitado (por diseño)

Un Circle no debería tener más de 10-15 personas. No porque técnicamente no pueda, sino porque la presencia significativa se diluye cuando hay demasiadas personas. El tamaño del Circle debe estar diseñado para que cada persona sea significativa.

---

## Atributos fundamentales

### Circle (la relación entre dos personas)

| Atributo         | Tipo      | Obligatorio | Propósito                   |
| ---------------- | --------- | ----------- | --------------------------- |
| `id`             | UUID      | Sí          | Identificador único         |
| `user_id`        | UUID (FK) | Sí          | Persona A                   |
| `circle_user_id` | UUID (FK) | Sí          | Persona B                   |
| `joined_at`      | timestamp | Sí          | Desde cuándo caminan juntos |
| `status`         | enum      | Sí          | active / paused / ended     |

### Circle Shared History (memoria colectiva, calculada)

No se almacena como tabla separada. Se calcula a partir de:

- Commits compartidos por ambas personas
- Tiempo transcurrido desde `joined_at`
- Interacciones de apoyo registradas
- Regresos mutuos

---

## Relaciones con otras entidades

| Entidad        | Tipo de relación | Descripción                                                       |
| -------------- | ---------------- | ----------------------------------------------------------------- |
| User           | Compuesta por    | Circle está formado por relaciones entre usuarios                 |
| Commits        | Visible para     | Los Commits pueden ser visibles para el Circle                    |
| Presence       | Alimenta         | Circle necesita Presence para sentirse vivo                       |
| Shared History | Emerge de        | La historia compartida emerge de Commits + tiempo + interacciones |

---

## Presence: el latido del Circle

Presence es un subdominio crítico de Circle. Representa **saber que los otros están ahí**, incluso sin interacción directa.

**¿Cómo se manifiesta?**

- "Camilo completó un Commit hoy" (no "Camilo publicó algo")
- "Andrés volvió después de 8 días" (no "Andrés tiene una nueva publicación")
- "3 personas de tu Circle han entrenado hoy" (no "3 nuevas publicaciones")
- "Laura lleva 15 días seguidos" (no "Laura compartió un logro")

Presence no es actividad. Es existencia. No muestra lo que la persona hizo, muestra que la persona está.

---

## Apoyo dentro del Circle

El apoyo dentro del Circle debe ser verbal y significativo, no transaccional.

**Formas de apoyo:**

- Mensajes predefinidos de acompañamiento: "Estoy contigo", "Buen trabajo", "Sigue", "Orgulloso de ti", "Qué constancia", "Qué progreso", "Vamos"
- Mensajes personalizados (texto libre, pero sin presión de "tener que" escribir)
- Sin emojis como mecanismo principal. Las palabras importan más que los iconos.

**Lo que NO debe haber:**

- Likes
- Corazones
- Reacciones genéricas
- Rankings de apoyo

---

## Decisiones tomadas

1. **Circle es bidireccional.** No hay seguidores. Hay compañeros de proceso.
2. **Circle tiene límite de tamaño.** 10-15 personas máximo. La calidad de la presencia es más importante que la cantidad.
3. **La historia compartida es calculada, no almacenada.** Se deriva de Commits, tiempo e interacciones.
4. **El apoyo es verbal.** Palabras, no iconos. Mensajes predefinidos + personalizados.

## Alternativas descartadas

- **Circle unidireccional (seguir).** Descartado porque crea asimetría y acerca el producto a una red social.
- **Circle sin límite de tamaño.** Descartado porque la presencia significativa se diluye.
- **Circle como chat grupal.** Descartado porque convertiría el producto en una aplicación de mensajería.
- **Reacciones con emojis.** Descartado porque las palabras tienen más significado.

## Riesgos

- Que las personas intenten usar Circle como una red social tradicional y se sientan limitadas.
- Que la bidireccionalidad dificulte la adopción inicial (necesitas que alguien te agregue para tener un Circle).
- Que la falta de interacción constante haga que el Circle se sienta "vacío" o "muerto."

## Preguntas abiertas

- ¿Cómo se maneja la invitación a Circle? ¿Necesitas conocer a la persona fuera del sistema?
- ¿Qué ocurre si alguien quiere "pausar" su relación en Circle sin eliminarla?
- ¿El Circle debe tener un nombre colectivo o solo es la suma de relaciones individuales?

## Impacto en la arquitectura

**Tablas futuras:**

```sql
circle_memberships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  circle_user_id UUID REFERENCES users(id) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  UNIQUE(user_id, circle_user_id)
);
```

**Nota:** Para mantener la bidireccionalidad, cuando se crea una relación, se insertan dos filas (A→B y B→A). Esto simplifica las consultas: cada persona ve su Circle como "personas con las que tengo una relación activa."

**Funciones de base de datos necesarias:**

- `get_circle_presence(user_id)` — Personas activas hoy
- `get_circle_shared_history(user_id, circle_user_id)` — Historia compartida entre dos personas

**Políticas RLS:**

- Un usuario solo puede ver miembros de su Circle activo
- Un usuario solo puede ver Commits de miembros del Circle si esos Commits tienen `visibility = 'circle'`

**Componentes futuros:**

- `CircleDashboard` — Vista principal del Circle (presencia, historia compartida)
- `CircleMemberCard` — Representación de una persona en el Circle
- `CircleSupportForm` — Enviar apoyo a un miembro
- `CirclePresenceIndicator` — Indicador de actividad silenciosa

**APIs futuras:**

- `POST /circle/invite` — Invitar a alguien al Circle
- `GET /circle/presence` — Presence del Circle
- `GET /circle/shared-history/:userId` — Historia compartida con una persona
- `POST /circle/support` — Enviar apoyo

---

## Próximo documento

`docs/domain/identity.md` — La capa transversal que todos los dominios refuerzan.
