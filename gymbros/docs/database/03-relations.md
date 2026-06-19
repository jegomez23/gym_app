# 03 — Relations

> **Propósito de este documento:** Documentar todas las relaciones entre entidades del MVP de Gym Circle, incluyendo cardinalidad, estrategias ON DELETE y justificación de cada decisión.

---

## Principios de relaciones

1. **CASCADE solo cuando el hijo no tiene sentido sin el padre.** Un Commit no tiene sentido sin un usuario. Un Support no tiene sentido sin el remitente.
2. **SET NULL cuando la relación es opcional y el hijo debe sobrevivir.** Una Reflection puede existir sin un Commit asociado.
3. **RESTRICT cuando la eliminación no debería permitirse.** No aplica en MVP porque usamos soft delete.
4. **La bidireccionalidad de Circle se maneja en la capa de aplicación.** La base de datos almacena relaciones unidireccionales; la aplicación crea dos filas.

---

## Mapa de relaciones

```
auth.users
    │ 1:1
    ▼
profiles ──────┐
    │ 1:N       │ 1:N
    ▼           ▼
commits    circle_memberships
    │ 1:N       │ (user_id → profiles, circle_user_id → profiles)
    ▼           │
reflections     │ 1:N
                ▼
            supports
            (from_user_id → profiles, to_user_id → profiles)
```

---

## Relación: auth.users → profiles (1:1)

| Tipo        | 1:1                                           |
| ----------- | --------------------------------------------- |
| Tabla padre | `auth.users` (gestionada por Supabase)        |
| Tabla hija  | `profiles`                                    |
| FK          | `profiles.id` → `auth.users.id`               |
| ON DELETE   | `CASCADE`                                     |
| ¿Opcional?  | No. Todo usuario autenticado tiene un perfil. |

**Justificación:** Cada usuario de Supabase Auth tiene exactamente un perfil en Gym Circle. La relación es 1:1 porque `profiles.id` es la misma UUID que `auth.users.id`. No puede haber un perfil sin un usuario auth, ni un usuario auth sin perfil (el trigger lo crea automáticamente).

**ON DELETE CASCADE:** Si el usuario se elimina de Supabase Auth (raro, pero posible), su perfil se elimina automáticamente. No tiene sentido mantener un perfil huérfano.

---

## Relación: profiles → commits (1:N)

| Tipo        | 1:N                                          |
| ----------- | -------------------------------------------- |
| Tabla padre | `profiles`                                   |
| Tabla hija  | `commits`                                    |
| FK          | `commits.user_id` → `profiles.id`            |
| ON DELETE   | `CASCADE`                                    |
| ¿Opcional?  | No. Un Commit siempre pertenece a un perfil. |

**Justificación:** Un usuario puede tener muchos Commits. Un Commit pertenece a exactamente un usuario. Es la relación más importante del sistema.

**ON DELETE CASCADE:** Si un perfil se elimina (soft delete), sus Commits se eliminan. No tiene sentido mantener Commits de un usuario que ya no existe.

**Cardinalidad:** 1 profile → N commits. N commits → 1 profile.

---

## Relación: profiles → reflections (1:N)

| Tipo        | 1:N                                               |
| ----------- | ------------------------------------------------- |
| Tabla padre | `profiles`                                        |
| Tabla hija  | `reflections`                                     |
| FK          | `reflections.user_id` → `profiles.id`             |
| ON DELETE   | `CASCADE`                                         |
| ¿Opcional?  | No. Una Reflection siempre pertenece a un perfil. |

**Justificación:** Un usuario puede tener muchas Reflections. Una Reflection pertenece a exactamente un usuario.

**ON DELETE CASCADE:** Si un perfil se elimina, sus Reflections se eliminan.

**Cardinalidad:** 1 profile → N reflections. N reflections → 1 profile.

---

## Relación: commits → reflections (1:N, opcional)

| Tipo        | 1:N (opcional)                                           |
| ----------- | -------------------------------------------------------- |
| Tabla padre | `commits`                                                |
| Tabla hija  | `reflections`                                            |
| FK          | `reflections.commit_id` → `commits.id`                   |
| ON DELETE   | `SET NULL`                                               |
| ¿Opcional?  | Sí. Una Reflection puede existir sin un Commit asociado. |

**Justificación:** Una Reflection puede estar asociada a un Commit específico (ej: "Hoy aprendí que..."), pero también puede ser independiente (ej: reflexión semanal). La relación es opcional.

**ON DELETE SET NULL:** Si un Commit se elimina (soft delete), la Reflection asociada no debe perderse. Solo pierde la referencia al Commit. Esto es importante porque la Reflection tiene valor por sí misma.

**Cardinalidad:** 1 commit → 0..N reflections. 1 reflection → 0..1 commit.

---

## Relación: profiles → circle_memberships (1:N, bidireccional)

| Tipo        | 1:N (x2, bidireccional)                             |
| ----------- | --------------------------------------------------- |
| Tabla padre | `profiles` (ambos lados)                            |
| Tabla hija  | `circle_memberships`                                |
| FK 1        | `circle_memberships.user_id` → `profiles.id`        |
| FK 2        | `circle_memberships.circle_user_id` → `profiles.id` |
| ON DELETE   | `CASCADE` (ambas FKs)                               |
| ¿Opcional?  | Sí. Un usuario puede no tener Circle.               |

**Justificación:** Un usuario puede tener muchas membresías (como `user_id` y como `circle_user_id`). Cada membresía involucra a dos perfiles. La bidireccionalidad se implementa creando dos filas por relación (A→B y B→A), lo que simplifica las consultas: cada usuario ve su Circle como "filas donde `user_id = yo`".

**ON DELETE CASCADE:** Si un perfil se elimina, todas sus membresías (como user_id y como circle_user_id) se eliminan.

**Cardinalidad:** 1 profile → N memberships (como user_id). 1 profile → N memberships (como circle_user_id). 1 membership → 1 profile (user_id) + 1 profile (circle_user_id).

**Regla de negocio:** `user_id != circle_user_id`. No auto-relación.

---

## Relación: profiles → supports (1:N, x2)

| Tipo        | 1:N (x2)                                            |
| ----------- | --------------------------------------------------- |
| Tabla padre | `profiles` (remitente y destinatario)               |
| Tabla hija  | `supports`                                          |
| FK 1        | `supports.from_user_id` → `profiles.id`             |
| FK 2        | `supports.to_user_id` → `profiles.id`               |
| ON DELETE   | `CASCADE` (ambas FKs)                               |
| ¿Opcional?  | Sí. Un usuario puede no enviar ni recibir supports. |

**Justificación:** Un usuario puede enviar muchos supports (como `from_user_id`) y recibir muchos supports (como `to_user_id`). Cada support involucra a dos perfiles.

**ON DELETE CASCADE:** Si un perfil se elimina, los supports que envió y recibió se eliminan.

**Cardinalidad:** 1 profile → N supports (enviados). 1 profile → N supports (recibidos). 1 support → 1 profile (from) + 1 profile (to).

**Regla de negocio:** `from_user_id != to_user_id`. No auto-apoyo.

**Nota importante:** No hay FK a `circle_memberships`. El apoyo debe sobrevivir aunque la membresía del Circle cambie de estado (active → paused → ended). La historia compartida incluye supports pasados aunque la relación actual esté pausada.

---

## Resumen de estrategias ON DELETE

| FK                                                  | Estrategia | Justificación                      |
| --------------------------------------------------- | ---------- | ---------------------------------- |
| `profiles.id` → `auth.users.id`                     | CASCADE    | Perfil no existe sin usuario auth  |
| `commits.user_id` → `profiles.id`                   | CASCADE    | Commit no existe sin perfil        |
| `reflections.user_id` → `profiles.id`               | CASCADE    | Reflection no existe sin perfil    |
| `reflections.commit_id` → `commits.id`              | SET NULL   | Reflection sobrevive sin Commit    |
| `circle_memberships.user_id` → `profiles.id`        | CASCADE    | Membresía no existe sin perfil     |
| `circle_memberships.circle_user_id` → `profiles.id` | CASCADE    | Membresía no existe sin perfil     |
| `supports.from_user_id` → `profiles.id`             | CASCADE    | Support no existe sin remitente    |
| `supports.to_user_id` → `profiles.id`               | CASCADE    | Support no existe sin destinatario |

---

## Decisiones tomadas

1. **CASCADE en 7 de 8 FKs.** Solo SET NULL en `reflections.commit_id`.
2. **Sin RESTRICT.** Usamos soft delete, no eliminación física. RESTRICT no es necesario.
3. **Circle memberships sin FK a supports.** El apoyo sobrevive a cambios de membresía.
4. **Bidireccionalidad en capa de aplicación.** La BD almacena relaciones unidireccionales.

## Alternativas descartadas

- **SET NULL en todas las FKs.** Descartado porque un Commit sin `user_id` no tiene sentido.
- **RESTRICT en FKs críticas.** Descartado porque usamos soft delete; la eliminación física no ocurre en producción.
- **Tabla pivote para circle_memberships con una sola fila.** Descartado porque complica las consultas.

## Riesgos

- La bidireccionalidad requiere que la aplicación siempre cree/actualice dos filas. Si solo se crea una, la relación queda inconsistente.
- SET NULL en `reflections.commit_id` puede dejar Reflections huérfanas (sin Commit asociado). Esto es aceptable porque la Reflection tiene valor propio.

## Preguntas abiertas

- ¿Debería haber un trigger que verifique la bidireccionalidad de circle_memberships? Decisión: no en MVP. La aplicación se encarga.
- ¿Supports debería tener un límite de frecuencia? Decisión: no en MVP.

## Próximo documento

`docs/database/04-indexing.md` — Diseño completo de índices con justificación de cada uno.
