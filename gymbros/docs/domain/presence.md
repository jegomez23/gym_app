# Domain — Presence

> **Propósito de este documento:** Definir el concepto de Presence, el subdominio de Circle que representa saber que los otros están ahí. Presence no es actividad ni publicación. Es existencia compartida.

---

## ¿Qué representa?

Presence representa **saber que las personas de tu Circle están ahí, incluso sin interacción directa**.

No es "quién publicó algo." No es "quién está en línea ahora." Es saber que las personas que forman parte de tu proceso siguen en él. Una persona puede estar presente sin haber hecho nada hoy. Puede estar presente aunque no hayan interactuado en semanas.

Presence es el latido del Circle.

---

## ¿Por qué existe?

1. **La pertenencia reduce el esfuerzo necesario** (Observación 14). Saber que otros están en el mismo proceso hace que la continuidad sea la norma.
2. **Las personas necesitan testigos** (Observación 9). Presence asegura que haya testigos, aunque no estén mirando activamente.
3. **La compañía no requiere interacción constante.** El diseño del producto debe reflejar que la presencia silenciosa sigue siendo presencia.

---

## ¿Qué NO es Presence?

- **No es "online."** No importa si la persona tiene la aplicación abierta. Presence no es conectividad.
- **No es actividad.** No importa si la persona publicó o registró algo. Presence no es "lo último que hizo."
- **No es notificaciones.** Presence no debería generar alertas. Es información que la persona consulta cuando quiere sentir compañía.

---

## Cómo se manifiesta Presence

Presence se muestra a través de:

1. **El pulso del Circle.** Un indicador general: "Hoy, 4 personas de tu Circle han completado Commits." No dice quiénes (eso sería actividad), dice cuántos (eso es presencia).

2. **La huella del proceso.** "Camilo lleva 47 días en su proceso." No dice qué hizo hoy. Dice que sigue aquí.

3. **El regreso.** "Andrés volvió después de 8 días." Esto es presencia: alguien que estaba ausente ha regresado. El sistema debe reflejarlo.

4. **La consistencia.** "Laura ha completado Commits 15 días seguidos." No es un logro. Es una señal de que Laura está.

---

## Cuándo se muestra Presence

- **En el Dashboard del Circle.** Como información contextual, no como feed.
- **En la tarjeta de cada persona.** Como un indicador suave de su estado en el proceso.
- **En momentos de baja propia.** Si la persona no ha registrado un Commit hoy, ver que otros sí lo han hecho puede ser un recordatorio silencioso de que el proceso continúa (sin presión).

---

## Relaciones con otras entidades

| Entidad  | Tipo de relación | Descripción                                                |
| -------- | ---------------- | ---------------------------------------------------------- |
| Circle   | Pertenece a      | Presence es una propiedad del Circle                       |
| Commits  | Se deriva de     | Presence se calcula a partir de Commits recientes          |
| Progress | Contextualiza    | Presence pone el progreso individual en contexto colectivo |

---

## Decisiones tomadas

1. **Presence es calculada, no almacenada.** Se deriva de Commits recientes de los miembros del Circle. No hay una tabla de "presencia."
2. **Presence es agregada.** Muestra el estado del Circle, no el detalle de cada persona (a menos que se consulte individualmente).
3. **Presence no genera notificaciones.** Se consulta, no se recibe. La persona va a ver Presence cuando necesita sentir compañía, no al revés.

## Alternativas descartadas

- **Presence como indicador de "en línea."** Descartado porque no importa si la persona está usando la app ahora.
- **Presence como feed de actividad.** Descartado porque sería un feed social, exactamente lo que rechazamos.
- **Presence como notificaciones.** Descartado porque viola la Tensión 3 (tecnología sin adicción).

## Riesgos

- Que Presence se sienta vacía si el Circle tiene poca actividad.
- Que la ausencia de Presence se interprete como "mi Circle está muerto" en lugar de "mi Circle está en silencio."
- Que Presence genere comparación si no se diseña cuidadosamente.

## Preguntas abiertas

- ¿Presence debe mostrar "hace cuánto" (hace 2 días, hace 1 semana) o solo "está activo / inactivo"?
- ¿Cuánta ausencia es necesaria para que una persona deje de aparecer como presente? ¿3 días? ¿7 días?
- ¿Presence debe ser consultable individualmente o solo como agregado del Circle?

## Impacto en la arquitectura

**No se necesita tabla propia.** Presence se calcula en tiempo de consulta.

**Funciones necesarias:**

- `get_circle_presence(user_id)` — Devuelve el estado de presencia de todo el Circle
- `get_member_presence(circle_user_id)` — Devuelve el estado de presencia de una persona

**Componentes futuros:**

- `CirclePresencePulse` — Indicador general del pulso del Circle
- `MemberPresenceIndicator` — Indicador individual de presencia

---

## Próximo documento

`docs/domain/journey.md` — La narrativa temporal del proceso.
