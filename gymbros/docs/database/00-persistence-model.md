# 00 — Persistence Model

> **Propósito de este documento:** Analizar qué información del dominio de Gym Circle debe persistir, por qué, durante cuánto tiempo, y bajo qué reglas de modificación y visibilidad. La pregunta fundamental no es "¿qué tablas necesitamos?" sino "¿qué información debe sobrevivir aunque cambiemos completamente la interfaz?"

---

## Principios de persistencia

1. **Persistir solo lo que el dominio necesita.** Si una información no es necesaria para la misión del producto (reducir el abandono del proceso de mejora personal), no debe persistir.
2. **La interfaz puede cambiar, los datos no.** El modelo de datos debe ser independiente de la UI. Si mañana cambiamos de mobile a voz, los datos deben seguir siendo válidos.
3. **Los datos agregados se calculan, no se almacenan.** Salvo que su cálculo sea prohibitivamente costoso. Progress, Shared History, Presence — se calculan de Commits.
4. **Los datos de identidad son sagrados.** No se eliminan. No se alteran sin registro de auditoría.

---

## Análisis de persistencia por entidad del dominio

### Identity

**¿Debe persistirse?** Indirectamente. Identity no es una tabla, es una capa transversal. Pero los datos que la construyen (Commits, Reflections, Progress) sí persisten.

**¿Qué persiste?** El lenguaje de identidad (UX Writing) no persiste en base de datos. Persiste en archivos de configuración del frontend. Las interacciones que refuerzan identidad (mensajes de apoyo, progreso visible) persisten en sus respectivas tablas.

**Conclusión:** No hay tabla `identities`. Identity emerge de los demás datos.

---

### Users / Profiles

**¿Debe persistirse?** Sí. Es la entidad raíz del sistema.

**¿Por qué?** Sin usuarios, no hay Commits, Circle, ni progreso. El usuario es el sujeto de toda la experiencia.

**¿Durante cuánto tiempo?** Indefinido. Los usuarios no se eliminan (soft delete). Un usuario puede estar inactivo años y volver.

**¿Quién puede modificarla?** Solo el propio usuario. Nadie más puede editar su perfil.

**¿Quién puede verla?** El propio usuario siempre. El Circle puede ver nombre y foto. El público no ve nada sin consentimiento.

**¿Qué ocurre si desaparece?** El sistema colapsa. Sin usuarios, no hay Commits, Circle ni progreso.

**Conclusión:** Persistir. Tabla `profiles` vinculada a `auth.users` de Supabase. Soft delete.

---

### Commits

**¿Debe persistirse?** Sí. Es la unidad atómica del sistema.

**¿Por qué?** Los Commits son la materia prima de Progress, Journey, Presence y Shared History. Sin Commits, no hay nada que medir.

**¿Durante cuánto tiempo?** Indefinido. Los Commits de hace 3 años siguen siendo valiosos para mostrar el Journey completo.

**¿Quién puede modificarla?** Solo el propietario. Un Commit no se edita después de creado (es evidencia). Solo se elimina (soft delete) si el usuario decide.

**¿Quién puede verla?** Según `visibility` del Commit: privado (solo propietario), circle (propietario + Circle), público (todos).

**¿Qué ocurre si desaparece?** Progress, Journey y Presence pierden su fuente de datos. Sin Commits, el producto pierde su razón de ser.

**Conclusión:** Persistir. Tabla `commits`. Soft delete. Inmutable después de creado (sin UPDATE de contenido, solo visibility y soft delete).

---

### Reflections

**¿Debe persistirse?** Sí.

**¿Por qué?** Las Reflections son la conexión entre la acción y la identidad. Son valiosas para la persona a largo plazo. Ver Reflections de meses atrás muestra la evolución del pensamiento.

**¿Durante cuánto tiempo?** Indefinido. Las Reflections personales no pierden valor con el tiempo.

**¿Quién puede modificarla?** Solo el propietario. Editable (a diferencia de Commits) porque una Reflection puede refinarse.

**¿Quién puede verla?** Según `visibility`: privado o circle.

**¿Qué ocurre si desaparece?** Se pierde la dimensión de profundidad personal, pero el producto sigue funcionando. Reflections es supporting, no core.

**Conclusión:** Persistir. Tabla `reflections`. Editable por el propietario.

---

### Circle / Circle Memberships

**¿Debe persistirse?** Sí.

**¿Por qué?** Circle es core del producto. Las relaciones entre personas deben persistir para que exista historia compartida y presencia.

**¿Durante cuánto tiempo?** Indefinido. Una relación en Circle puede durar años. Incluso si se "pausa", la historia compartida no debe perderse.

**¿Quién puede modificarla?** Cualquiera de las dos personas puede eliminar o pausar la relación. Ambas deben aceptar para crearla (bidireccional).

**¿Quién puede verla?** Solo las dos personas involucradas ven su relación. No hay lista pública de miembros del Circle.

**¿Qué ocurre si desaparece?** Circle deja de existir. El producto pierde su dimensión de compañía. Se vuelve una app individual de Commits.

**Conclusión:** Persistir. Tabla `circle_memberships`. Bidireccional (dos filas por relación). Soft delete (pausar no elimina historia).

---

### Shared History

**¿Debe persistirse?** No como tabla. Se calcula.

**¿Por qué?** La historia compartida entre dos personas se calcula a partir de Commits compartidos, tiempo desde `joined_at` y número de interacciones de apoyo. No necesita tabla propia.

**¿Qué ocurre si desaparece?** No aplica. No persiste como entidad separada.

**Conclusión:** No persistir. Calcular en tiempo de consulta.

---

### Presence

**¿Debe persistirse?** No como tabla. Se calcula.

**¿Por qué?** Presence es el estado actual de actividad del Circle. Se deriva de Commits recientes. No necesita persistencia.

**¿Qué ocurre si desaparece?** No aplica. No persiste como entidad separada.

**Conclusión:** No persistir. Calcular en tiempo real. Cachear brevemente (segundos) para rendimiento.

---

### Journey

**¿Debe persistirse?** No como tabla. Se calcula.

**¿Por qué?** Journey es una visualización de Commits a lo largo del tiempo. No hay datos adicionales que almacenar.

**Conclusión:** No persistir. Renderizar desde Commits.

---

### Progress

**¿Debe persistirse?** Solo métricas agregadas si el cálculo es costoso.

**¿Por qué?** El cálculo de continuidad, frecuencia semanal y patrones puede hacerse desde Commits. Para un usuario con miles de Commits, puede ser lento. Una tabla `progress_snapshots` con métricas precalculadas (actualizadas diariamente o después de cada Commit) puede ser necesaria para rendimiento.

**Conclusión:** No persistir en MVP. Evaluar `progress_snapshots` si el rendimiento lo requiere.

---

### Support Interactions

**¿Debe persistirse?** Sí.

**¿Por qué?** Las interacciones de apoyo entre miembros del Circle son parte de la historia compartida. Ver "Mara te ha enviado 12 apoyos" es valioso.

**¿Durante cuánto tiempo?** Indefinido. Son parte de la memoria del Circle.

**¿Quién puede modificarla?** Solo el remitente puede eliminar su apoyo. El destinatario no puede modificarlo.

**¿Quién puede verla?** Las dos personas involucradas.

**Conclusión:** Persistir. Tabla `supports`. Inmutable después de creado.

---

### Notifications

**¿Debe persistirse?** Sí, pero no en MVP.

**¿Por qué?** Las notificaciones requieren persistencia para saber cuáles se han leído y cuáles no. Pero no son core para el MVP.

**Conclusión:** No persistir en MVP. Evaluar para v2.

---

### Achievements / PRs

**¿Debe persistirse?** Sí, pero no en MVP.

**¿Por qué?** Los PRs (Personal Records) son logros que la persona quiere recordar. Requieren persistencia. Pero no son core para el MVP.

**Conclusión:** No persistir en MVP. Evaluar para v2.

---

### Knowledge / Saved Content

**¿Debe persistirse?** Sí, pero no en MVP.

**¿Por qué?** El contenido guardado y los aprendizajes compartidos requieren persistencia. Pero Knowledge es supporting/future.

**Conclusión:** No persistir en MVP. Evaluar para v3.

---

## Mapa de persistencia

| Entidad              | ¿Persiste? | ¿En MVP? | Tabla                   | Notas                           |
| -------------------- | ---------- | -------- | ----------------------- | ------------------------------- |
| Users (Auth)         | Sí         | Sí       | `auth.users` (Supabase) | Gestionado por Supabase Auth    |
| Profiles             | Sí         | Sí       | `profiles`              | Vinculado a auth.users          |
| Commits              | Sí         | Sí       | `commits`               | Inmutable después de crear      |
| Reflections          | Sí         | Sí       | `reflections`           | Editable por propietario        |
| Circle Memberships   | Sí         | Sí       | `circle_memberships`    | Bidireccional                   |
| Support Interactions | Sí         | Sí       | `supports`              | Inmutable                       |
| Shared History       | No         | -        | -                       | Se calcula                      |
| Presence             | No         | -        | -                       | Se calcula en tiempo real       |
| Journey              | No         | -        | -                       | Se renderiza desde Commits      |
| Progress Snapshots   | Tal vez    | No       | `progress_snapshots`    | Solo si rendimiento lo requiere |
| Notifications        | Sí         | No       | `notifications`         | Para v2                         |
| Achievements / PRs   | Sí         | No       | `prs`                   | Para v2                         |
| Saved Content        | Sí         | No       | `saved_content`         | Para v3                         |
| Shared Learning      | Sí         | No       | `shared_learning`       | Para v3                         |

---

## Decisiones tomadas

1. **Identity, Shared History, Presence, Journey y Progress no tienen tabla propia.** Se calculan desde otras tablas.
2. **Commits y Supports son inmutables.** Una vez creados, no se modifican. Solo soft delete.
3. **Reflections es editable.** El insight personal puede refinarse.
4. **Circle Memberships es bidireccional.** Dos filas por relación (A→B y B→A) para simplificar consultas.
5. **6 tablas en MVP:** profiles, commits, reflections, circle_memberships, supports, y potencialmente progress_snapshots.
6. **Las notificaciones, PRs y Knowledge no entran en MVP.**

## Alternativas descartadas

- **Persistir Shared History como tabla.** Descartado porque añade complejidad y riesgo de inconsistencia. Es más seguro calcularla.
- **Persistir Presence como tabla.** Descartado porque Presence cambia constantemente; no tiene sentido almacenarla.
- **Hacer Commits editables.** Descartado porque un Commit es evidencia. Editarlo rompe la integridad del Journey.
- **Tabla de Identity.** Descartado porque Identity no es datos, es una interpretación de los datos.

## Riesgos

- Progress calculado puede ser lento con muchos Commits. Monitorear y añadir `progress_snapshots` si es necesario.
- Circle Memberships bidireccional requiere lógica para mantener consistencia (ambas filas deben reflejar el mismo estado).
- La inmutabilidad de Commits puede frustrar a usuarios que quieran corregir errores. Solución: permitir editar `title` y `note` pero no `recorded_at` ni `type`.

## Preguntas abiertas

- ¿Debe permitirse editar el `title` de un Commit después de creado? Decisión inicial: sí, pero no `recorded_at` ni `type`.
- ¿Los supports deben tener un límite por día para evitar spam? Decisión inicial: no en MVP.
- ¿Progress snapshots deben actualizarse después de cada Commit o diariamente? Decisión inicial: después de cada Commit si es rápido, diariamente si es costoso.

## Impacto en la arquitectura

**MVP tendrá 6 tablas persistentes:**

- `profiles` (vinculada a auth.users)
- `commits` (raíz del sistema)
- `reflections` (insight personal)
- `circle_memberships` (relaciones bidireccionales)
- `supports` (interacciones de apoyo)

**Tablas futuras:**

- `progress_snapshots` (si rendimiento lo requiere)
- `notifications` (v2)
- `prs` (v2)
- `saved_content` (v3)
- `shared_learning` (v3)

## Próximo documento

`docs/database/01-entity-relationship.md` — Diagrama ER completo con entidades, atributos, relaciones y cardinalidad.
