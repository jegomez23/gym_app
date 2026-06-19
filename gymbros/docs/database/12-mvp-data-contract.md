# 12 - MVP Data Contract

> Proposito de este documento: fijar el contrato definitivo entre el dominio de
> Gym Circle y PostgreSQL/Supabase para el MVP. Este documento reemplaza las
> decisiones contradictorias previas de `docs/database/*` cuando hablen del
> modelo conceptual del MVP.

Estado: Canonico para MVP.

Alcance: diseno de modelo. No contiene SQL, migraciones, RLS ni indices.

---

## 1. Filosofia del modelo

El modelo representa a Gym Circle como un sistema de evidencia personal y
presencia compartida, no como una red social ni como una app fitness
tradicional. La base de datos persiste solo aquello que existe como hecho del
dominio: personas, acciones registradas, reflexiones asociadas a acciones,
relaciones Circle y apoyos.

La raiz del sistema es Commit. Un Commit es la evidencia atomica de que una
accion ocurrio. Todo lo demas se deriva de esa evidencia o la acompana:
Progress se calcula desde Commits; Journey se reconstruye desde la linea
temporal; Presence se infiere de actividad reciente compartible; Identity se
narra desde patrones; Knowledge queda fuera del MVP.

El modelo evita persistir interpretaciones prematuras. La base de datos no
guarda "progreso", "identidad" ni "viaje" como tablas porque esos conceptos son
lecturas del historial, no hechos primarios. Esto mantiene el dominio pequeno,
auditable y resistente a cambios de producto.

Circle se modela como relacion mutua, no como seguimiento. La reciprocidad no
depende de la aplicacion: la base de datos debe impedir estados unilaterales.
Esto protege el principio central de que las personas no se siguen, caminan
juntas.

Reflection queda estrictamente subordinada a Commit. No hay reflexiones sueltas
en el MVP. Una Reflection existe porque una accion registrada genero o merece un
insight.

El modelo favorece inmutabilidad. Un Commit no se reescribe como si fuera una
nota editable: se registra como hecho. Solo cambian campos operativos como
visibilidad y soft delete. Esto permite que las metricas, la historia y la
presencia se apoyen en una fuente estable.

---

## 2. Entidades

### auth.users

Proposito: representar la identidad autenticada gestionada por Supabase Auth.

Responsabilidades:

- Guardar credenciales, proveedores OAuth y estado de autenticacion.
- Ser la fuente de verdad para la existencia tecnica de una cuenta.
- Emitir el identificador que usaran las tablas del dominio.

Ciclo de vida:

- Se crea mediante Supabase Auth.
- Puede eliminarse mediante procesos de cuenta.
- Su eliminacion fisica implica eliminacion fisica en cascada de datos propios
  cuando PostgreSQL ejecute FKs fisicas.

Propietario: Supabase Auth.

Dependencias: ninguna tabla de dominio depende de otra cosa antes de
`auth.users`.

### profiles

Proposito: representar a la persona dentro de Gym Circle.

Responsabilidades:

- Guardar datos publicables minimos de perfil.
- Conectar la identidad autenticada con el dominio.
- Definir preferencias operativas de visibilidad.
- Servir como nodo para Commits, Circle y Supports.

Ciclo de vida:

- Se crea automaticamente al crearse un usuario autenticado.
- Puede actualizarse por su propietario.
- Puede soft-deleted para desactivar la presencia de la persona sin borrar
  inmediatamente la historia.
- Puede eliminarse fisicamente si se elimina `auth.users`.

Propietario: el usuario autenticado correspondiente.

Dependencias:

- Depende de `auth.users`.
- Es dependencia de `commits`, `reflections`, `circle_memberships` y `supports`.

### commits

Proposito: registrar una accion disciplinada ocurrida.

Responsabilidades:

- Ser la unidad atomica y fuente de verdad del progreso.
- Guardar el momento de ocurrencia de la accion.
- Guardar profundidad opcional sin imponer friccion.
- Definir visibilidad del hecho.
- Alimentar Progress, Journey, Presence, Reflections y Circle.

Ciclo de vida:

- Lo crea su propietario.
- Su contenido principal no se modifica en el MVP.
- Puede cambiar `visibility`.
- Puede soft-deleted mediante `deleted_at`.
- Puede eliminarse fisicamente solo como consecuencia de eliminacion fisica del
  perfil propietario.

Propietario: el perfil que lo crea.

Dependencias:

- Depende de `profiles`.
- Es dependencia obligatoria de `reflections`.

### reflections

Proposito: guardar un insight breve asociado a un Commit concreto.

Responsabilidades:

- Capturar aprendizaje, lectura personal o significado posterior a una accion.
- Profundizar un Commit sin convertir el Commit en texto largo.
- Mantener visibilidad propia dentro del marco permitido.

Ciclo de vida:

- Se crea siempre para un Commit existente.
- Puede editarse por su propietario.
- Puede soft-deleted.
- Si el Commit desaparece fisicamente, la Reflection desaparece fisicamente con
  el, porque no existe Reflection independiente en el MVP.

Propietario: el propietario del Commit asociado.

Dependencias:

- Depende de `profiles`.
- Depende obligatoriamente de `commits`.

### circle_memberships

Proposito: representar una relacion Circle entre dos perfiles.

Responsabilidades:

- Persistir que dos personas caminan juntas en el producto.
- Mantener estado de la relacion.
- Servir como base para visibilidad Circle, Presence compartida e historia
  compartida.
- Garantizar reciprocidad.

Ciclo de vida:

- Se crea como relacion bidireccional garantizada por base de datos.
- Puede pasar por estados operativos como activa, pausada o finalizada.
- Puede soft-deleted o finalizarse semanticamente mediante estado/fecha.
- Puede eliminarse fisicamente si se elimina fisicamente uno de los perfiles.

Propietario: ambos perfiles involucrados.

Dependencias:

- Depende dos veces de `profiles`: persona local y persona Circle.
- Es usada para validar lecturas compartidas, Presence y permiso de Supports.

### supports

Proposito: guardar una expresion verbal de apoyo entre dos miembros de Circle.

Responsabilidades:

- Registrar apoyo significativo, no reacciones genericas.
- Preservar historia de acompanamiento.
- Alimentar historia compartida y senales sociales ligeras.

Ciclo de vida:

- Lo crea un perfil hacia otro perfil.
- Es inmutable en contenido.
- Puede soft-deleted.
- Puede sobrevivir semanticamente aunque la relacion Circle cambie de estado,
  pero su creacion exige una relacion Circle valida en ese momento.

Propietario: quien lo envia; el destinatario participa como receptor.

Dependencias:

- Depende de `profiles` como emisor.
- Depende de `profiles` como receptor.
- Depende logicamente de una relacion Circle activa al momento de creacion.

---

## 3. Relaciones

### auth.users -> profiles

Cardinalidad: uno a uno.

Obligatoriedad: todo `profile` debe tener un `auth.users` correspondiente. Un
usuario autenticado debe tener un profile para usar el producto.

Comportamiento al eliminar: la eliminacion fisica del usuario autenticado
elimina fisicamente el profile. La desactivacion normal del producto debe usar
soft delete sobre `profiles`.

Comportamiento al actualizar: el identificador no cambia. Los cambios de email,
proveedor o credenciales pertenecen a Supabase Auth y no alteran el modelo de
dominio.

Por que: separa autenticacion tecnica de persona de producto, sin duplicar
identidad.

### profiles -> commits

Cardinalidad: uno a muchos.

Obligatoriedad: todo Commit pertenece a exactamente un profile. Un profile puede
no tener Commits.

Comportamiento al eliminar: soft delete del profile oculta o desactiva sus
Commits por reglas de consulta/RLS. Eliminacion fisica del profile elimina
fisicamente sus Commits.

Comportamiento al actualizar: el propietario del Commit no cambia. El contenido
principal del Commit no se actualiza; solo campos operativos.

Por que: el Commit es evidencia personal, no transferible.

### commits -> reflections

Cardinalidad: uno a muchos.

Obligatoriedad: toda Reflection debe pertenecer a un Commit. Un Commit puede
tener cero o muchas Reflections.

Comportamiento al eliminar: soft delete del Commit debe excluir sus Reflections
de superficies activas. Eliminacion fisica del Commit elimina fisicamente sus
Reflections.

Comportamiento al actualizar: el Commit asociado no cambia. La Reflection puede
editar su contenido; el Commit no se reescribe.

Por que: Reflection no existe en abstracto durante el MVP; siempre interpreta o
profundiza una accion registrada.

### profiles -> reflections

Cardinalidad: uno a muchos.

Obligatoriedad: toda Reflection pertenece a un profile. El profile debe ser el
mismo propietario del Commit asociado.

Comportamiento al eliminar: soft delete del profile oculta sus Reflections.
Eliminacion fisica del profile elimina fisicamente sus Reflections.

Comportamiento al actualizar: el propietario de la Reflection no cambia.

Por que: aunque Reflection depende de Commit, guardar propietario directo
simplifica RLS, consultas y auditoria.

### profiles -> circle_memberships

Cardinalidad: muchos a muchos autorreferencial, representada como pares
bidireccionales entre profiles.

Obligatoriedad: toda fila debe tener dos profiles distintos. Un profile puede no
tener Circle.

Comportamiento al eliminar: soft delete de un profile debe impedir que aparezca
como miembro activo. Eliminacion fisica de un profile elimina fisicamente sus
membresias.

Comportamiento al actualizar: los participantes de una membresia no cambian. Lo
que cambia es estado operativo, como `status` o `ended_at`.

Por que: Circle no es una entidad grupal en MVP; es el conjunto de relaciones
mutuas significativas.

### circle_memberships reciprocas

Cardinalidad: por cada relacion A -> B debe existir su contraparte B -> A.

Obligatoriedad: obligatoria para toda relacion Circle activa, pausada o
finalizada que siga existiendo como relacion.

Comportamiento al eliminar: terminar, pausar o soft-delete una direccion debe
mantener consistencia con la direccion reciproca segun las reglas de trigger.

Comportamiento al actualizar: cambios de estado relevantes deben sincronizarse
con la contraparte.

Por que: la reciprocidad es regla del dominio, no conveniencia de UI.

### profiles -> supports

Cardinalidad: uno a muchos como emisor y uno a muchos como receptor.

Obligatoriedad: todo Support tiene exactamente un emisor y un receptor, siempre
distintos.

Comportamiento al eliminar: soft delete de un profile oculta supports activos en
superficies normales. Eliminacion fisica de un profile elimina fisicamente sus
supports relacionados.

Comportamiento al actualizar: emisor, receptor, mensaje y momento no cambian.
Solo campos operativos como `deleted_at`.

Por que: el Support es un hecho historico de acompanamiento.

### circle_memberships -> supports

Cardinalidad: relacion logica, no dependencia fisica directa.

Obligatoriedad: para crear un Support debe existir una relacion Circle activa
entre emisor y receptor. Una vez creado, el Support no depende fisicamente de la
membresia.

Comportamiento al eliminar: finalizar o eliminar logicamente la relacion Circle
no borra Supports historicos.

Comportamiento al actualizar: cambios posteriores de estado Circle no reescriben
supports ya creados.

Por que: el apoyo forma parte de la historia compartida y no debe perderse por
cambios futuros en la relacion.

---

## 4. Campos

### auth.users

Tabla gestionada por Supabase Auth. El contrato de Gym Circle solo depende del
identificador estable del usuario autenticado.

| Campo | Tipo conceptual      | Obligatorio | Justificacion                          |
| ----- | -------------------- | ----------- | -------------------------------------- |
| id    | identificador global | si          | Clave que conecta Auth con `profiles`. |

### profiles

| Campo                 | Tipo conceptual          | Obligatorio | Justificacion                                                 |
| --------------------- | ------------------------ | ----------- | ------------------------------------------------------------- |
| id                    | identificador de usuario | si          | Mismo valor que `auth.users.id`; evita duplicar identidad.    |
| name                  | texto corto              | si          | Nombre visible minimo para que Circle tenga personas, no ids. |
| avatar_url            | URL                      | no          | Imagen opcional para reconocimiento humano.                   |
| bio                   | texto breve              | no          | Contexto personal ligero, no necesario para usar el producto. |
| visibility_preference | opcion cerrada           | si          | Preferencia inicial para nuevos Commits.                      |
| onboarding_completed  | booleano                 | si          | Permite distinguir cuenta creada de cuenta preparada.         |
| created_at            | fecha-hora               | si          | Auditoria de alta en dominio.                                 |
| updated_at            | fecha-hora               | si          | Perfil es editable, por tanto necesita trazabilidad.          |
| deleted_at            | fecha-hora               | no          | Soft delete/desactivacion sin borrar historia inmediatamente. |

### commits

| Campo            | Tipo conceptual             | Obligatorio | Justificacion                                                   |
| ---------------- | --------------------------- | ----------- | --------------------------------------------------------------- |
| id               | identificador global        | si          | Identifica el hecho atomico.                                    |
| user_id          | referencia a profile        | si          | Todo Commit pertenece a una persona.                            |
| title            | texto corto                 | no          | Permite nombrar la accion sin imponer categoria.                |
| type             | texto corto                 | no          | Categoria libre/sugerida sin tabla de tipos en MVP.             |
| recorded_at      | fecha-hora                  | si          | Momento en que ocurrio la accion; base de timeline y metricas.  |
| duration_minutes | numero positivo             | no          | Profundidad opcional cuando la accion tiene duracion.           |
| intensity        | opcion cerrada              | no          | Senal subjetiva ligera; sustituye cualquier Mood en MVP.        |
| note             | texto breve                 | no          | Detalle opcional sin convertir Commit en Reflection.            |
| visibility       | opcion cerrada              | si          | Controla si el Commit es privado, Circle o publico.             |
| evidence         | lista estructurada flexible | no          | Evidencia ligera opcional como repeticiones, minutos o paginas. |
| created_at       | fecha-hora                  | si          | Momento en que se registro el dato.                             |
| deleted_at       | fecha-hora                  | no          | Soft delete operativo.                                          |

### reflections

| Campo      | Tipo conceptual      | Obligatorio | Justificacion                                                |
| ---------- | -------------------- | ----------- | ------------------------------------------------------------ |
| id         | identificador global | si          | Identifica el insight.                                       |
| user_id    | referencia a profile | si          | Facilita propiedad, RLS y consultas.                         |
| commit_id  | referencia a commit  | si          | Reflection solo existe asociada a un Commit.                 |
| content    | texto breve/medio    | si          | Cuerpo del insight.                                          |
| type       | opcion cerrada       | no          | Clasifica el insight sin crear entidad nueva.                |
| visibility | opcion cerrada       | si          | Controla si la Reflection queda privada o visible al Circle. |
| created_at | fecha-hora           | si          | Momento de creacion del insight.                             |
| updated_at | fecha-hora           | si          | Reflection es editable.                                      |
| deleted_at | fecha-hora           | no          | Soft delete operativo.                                       |

### circle_memberships

| Campo          | Tipo conceptual      | Obligatorio | Justificacion                                             |
| -------------- | -------------------- | ----------- | --------------------------------------------------------- |
| id             | identificador global | si          | Identifica la fila direccional.                           |
| user_id        | referencia a profile | si          | Perspectiva local de la relacion.                         |
| circle_user_id | referencia a profile | si          | Persona que pertenece al Circle del usuario.              |
| status         | opcion cerrada       | si          | Expresa si la relacion esta activa, pausada o finalizada. |
| joined_at      | fecha-hora           | si          | Inicio de la historia compartida.                         |
| ended_at       | fecha-hora           | no          | Fin semantico cuando la relacion termina.                 |
| created_at     | fecha-hora           | si          | Auditoria de creacion de la fila.                         |
| deleted_at     | fecha-hora           | no          | Soft delete operativo si se necesita ocultar la relacion. |

### supports

| Campo        | Tipo conceptual      | Obligatorio | Justificacion                                                 |
| ------------ | -------------------- | ----------- | ------------------------------------------------------------- |
| id           | identificador global | si          | Identifica el apoyo.                                          |
| from_user_id | referencia a profile | si          | Persona que envia el apoyo.                                   |
| to_user_id   | referencia a profile | si          | Persona que recibe el apoyo.                                  |
| message      | texto breve          | si          | El apoyo en Gym Circle son palabras, no reacciones genericas. |
| created_at   | fecha-hora           | si          | Momento historico del apoyo.                                  |
| deleted_at   | fecha-hora           | no          | Soft delete operativo.                                        |

---

## 5. Restricciones

### Restricciones globales

- Toda tabla propia del MVP usa identificadores estables.
- Toda fila de dominio con propietario debe referenciar un `profile` existente.
- Toda tabla de dominio debe soportar soft delete mediante `deleted_at`, salvo
  tablas gestionadas por Supabase.
- Los timestamps conceptuales se interpretan como fechas-hora con zona.
- Ninguna tabla MVP representa Progress, Journey, Identity, Knowledge, Mood ni
  Presence persistida.

### profiles

- `id` debe existir en `auth.users`.
- Debe existir como maximo un profile por usuario autenticado.
- `name` no puede estar vacio.
- `name` debe tener longitud razonable para UI.
- `avatar_url`, si existe, debe ser una URL/texto con longitud razonable.
- `bio`, si existe, debe ser breve.
- `visibility_preference` solo puede ser `private`, `circle` o `public`.
- `onboarding_completed` siempre tiene valor booleano.

### commits

- `user_id` debe referenciar un profile existente.
- `recorded_at` es obligatorio.
- `duration_minutes`, si existe, debe ser mayor que cero.
- `intensity`, si existe, solo puede ser `light`, `steady` o `deep`.
- No existe `mood`.
- No existe referencia a tabla Mood.
- `visibility` solo puede ser `private`, `circle` o `public`.
- `title`, `type`, `note` y `evidence` deben tener limites para evitar abuso y
  mantener velocidad de lectura.
- El contenido principal no se actualiza despues de crear el Commit.
- Solo `visibility` y `deleted_at` son mutables en el MVP.

### reflections

- `user_id` debe referenciar un profile existente.
- `commit_id` es obligatorio.
- `commit_id` debe referenciar un Commit existente.
- El propietario de la Reflection debe ser el mismo propietario del Commit.
- `content` no puede estar vacio.
- `content` debe tener longitud acotada.
- `type`, si existe, solo puede usar categorias cerradas de insight.
- `visibility` solo puede ser `private` o `circle`.
- No puede existir Reflection independiente.
- No puede existir Reflection temporal sin Commit.

### circle_memberships

- `user_id` y `circle_user_id` deben referenciar profiles existentes.
- `user_id` y `circle_user_id` no pueden ser iguales.
- No puede haber duplicados para el mismo par direccional.
- Toda relacion debe tener contraparte reciproca.
- La base de datos debe crear, sincronizar o rechazar operaciones que rompan la
  reciprocidad.
- `status` solo puede ser `active`, `paused` o `ended`.
- Si `status` es `ended`, `ended_at` debe existir.
- Si `status` no es `ended`, `ended_at` debe ser nulo o tratado como invalido
  por las reglas de dominio.

### supports

- `from_user_id` y `to_user_id` deben referenciar profiles existentes.
- `from_user_id` y `to_user_id` no pueden ser iguales.
- `message` no puede estar vacio.
- `message` debe tener longitud acotada.
- Para crear un Support debe existir relacion Circle activa entre emisor y
  receptor.
- El contenido de un Support es inmutable despues de crearse.

---

## 6. Datos derivados

### Progress

No se persiste. Se obtiene agregando Commits del usuario por fechas, frecuencia,
continuidad, regresos y volumen de actividad. Si el calculo se vuelve costoso,
podra cachearse en una fase posterior, pero no como tabla MVP.

### Journey

No se persiste. Se reconstruye ordenando Commits y Reflections por tiempo. Es
una lectura narrativa del historial, no una entidad independiente.

### Identity

No se persiste. Se interpreta desde patrones de Commits, continuidad, lenguaje
de Reflections y recurrencia de acciones. No hay tabla `identities`.

### Presence calculada

No se persiste. Se calcula desde Commits recientes visibles para Circle,
relaciones Circle activas y supports recientes cuando la pantalla lo necesite.

### Metricas

No se persisten en MVP. Totales, streaks, frecuencia semanal, dias activos,
regresos, actividad del Circle e historia compartida se calculan desde Commits,
Circle y Supports.

### Shared History

No se persiste como tabla. Se obtiene combinando `circle_memberships.joined_at`,
Commits compartibles de ambas personas y Supports historicos entre ellas.

### Knowledge

No se persiste en MVP. Cualquier sistema de conocimiento, memoria semantica,
embeddings o aprendizaje global queda fuera del contrato de base de datos MVP.

### Mood

No se persiste. No existe entidad, tabla ni columna Mood. La dimension
emocional se expresa mediante `intensity` y mediante Reflections.

---

## 7. Consultas principales

### Home / Today

Lecturas:

- Profile propio.
- Commits propios recientes.
- Resumen calculado de actividad de hoy.
- Presence calculada del Circle.

Escrituras:

- Crear Commit.
- Cambiar visibilidad de Commit.
- Soft delete de Commit.

Frecuencia: muy alta; primera pantalla y uso diario.

Volumen esperado: pocos registros por carga inicial; historial paginado cuando
se profundiza.

### Crear Commit

Lecturas:

- Profile propio para defaults como `visibility_preference`.

Escrituras:

- Insertar un Commit.

Frecuencia: alta; accion principal del producto.

Volumen esperado: de cero a varios Commits por usuario por dia.

### Timeline / Journey

Lecturas:

- Commits propios paginados por `recorded_at`.
- Reflections asociadas a esos Commits.
- Datos derivados de continuidad y regreso.

Escrituras:

- Ninguna primaria desde la lectura.
- Puede abrir acciones para Reflection o soft delete.

Frecuencia: media-alta.

Volumen esperado: crece linealmente con la vida del usuario; requiere paginacion
desde el inicio.

### Detalle de Commit

Lecturas:

- Commit concreto.
- Reflections asociadas.
- Supports o senales sociales relacionadas si el Commit fue visible al Circle.

Escrituras:

- Crear Reflection asociada.
- Editar Reflection propia.
- Cambiar visibilidad del Commit.
- Soft delete del Commit o Reflection.

Frecuencia: media.

Volumen esperado: bajo por pantalla; una accion y sus insights.

### Reflection

Lecturas:

- Commit asociado.
- Reflections existentes del Commit.

Escrituras:

- Crear Reflection.
- Editar Reflection.
- Soft delete de Reflection.

Frecuencia: media-baja al inicio; puede crecer con usuarios mas reflexivos.

Volumen esperado: varias Reflections por Commit como maximo, no flujo masivo.

### Circle

Lecturas:

- Membresias Circle activas/pausadas/finalizadas segun vista.
- Profiles de miembros.
- Presence calculada desde Commits visibles.
- Historia compartida derivada.

Escrituras:

- Crear relacion Circle.
- Pausar/finalizar relacion.
- Soft delete operativo de relacion si aplica.

Frecuencia: alta para lectura, baja para escritura.

Volumen esperado: Circle pequeno por diseno; normalmente 10-15 personas por
usuario.

### Enviar Support

Lecturas:

- Validacion de relacion Circle activa.
- Profile receptor.

Escrituras:

- Insertar Support.

Frecuencia: media.

Volumen esperado: multiples apoyos por usuario por semana, no alto volumen por
relacion individual.

### Perfil propio

Lecturas:

- Profile propio.
- Preferencias operativas.

Escrituras:

- Actualizar nombre, avatar, bio, visibilidad preferida u onboarding.

Frecuencia: baja.

Volumen esperado: una fila por usuario.

### Perfil de miembro Circle

Lecturas:

- Profile del miembro.
- Commits visibles para Circle.
- Presence calculada.
- Historia compartida derivada.

Escrituras:

- Enviar Support.
- Cambiar estado de relacion Circle.

Frecuencia: media.

Volumen esperado: bajo por carga; historial paginado.

### Admin interno / mantenimiento inicial

Lecturas:

- Estado basico de perfiles, volumen de Commits y errores de integridad.

Escrituras:

- Ninguna desde producto cliente.

Frecuencia: baja.

Volumen esperado: agregado, no camino critico del usuario.

---

## 8. Escalabilidad

### Millones de usuarios

Escala naturalmente:

- `profiles` tiene una fila por usuario.
- La separacion entre `auth.users` y `profiles` evita mezclar credenciales con
  datos de dominio.
- La propiedad directa por `user_id` facilita particionar mental y
  tecnicamente las consultas por usuario.

Requerira cambios:

- Observabilidad de RLS y tiempos de consulta.
- Estrategias de archivado o retencion para usuarios eliminados.
- Procesos internos para exportacion/eliminacion de datos.

### Millones de Commits

Escala naturalmente:

- Commits son append-first y casi inmutables.
- Las pantallas principales leen ventanas recientes o paginas, no todo el
  historial.
- Progress, Journey y Presence se calculan desde la fuente unica sin duplicar
  tablas en MVP.

Requerira cambios:

- Indices especificos cuando se traduzca este contrato a PostgreSQL.
- Posibles caches/materializaciones post-MVP para metricas caras.
- Posible particionamiento temporal si el volumen global lo exige.
- Jobs de mantenimiento para datos soft-deleted antiguos si la politica de
  producto lo permite.

### Millones de relaciones Circle

Escala naturalmente:

- Circle tiene limite de tamano por diseno de producto.
- Las consultas por usuario leen pocas relaciones activas.
- La bidireccionalidad hace que la lectura local del Circle sea simple.

Requerira cambios:

- Cuidado especial con triggers de reciprocidad para evitar recursion, bloqueos
  o escrituras duplicadas.
- Pruebas de concurrencia en invitaciones/altas simultaneas.
- Monitoreo de relaciones pausadas/finalizadas si se conservan historicamente.

### Millones de Supports

Escala naturalmente:

- Support es append-first e inmutable.
- Las lecturas normales se acotan por receptor, emisor o relacion.

Requerira cambios:

- Paginacion estricta.
- Posibles limites anti-spam.
- Moderacion o reporting si aparecen abusos.

### Reflections a gran escala

Escala naturalmente:

- Toda Reflection esta anclada a Commit.
- Las lecturas suelen ir por Commit o por usuario.

Requerira cambios:

- Busqueda textual o semantica queda fuera del MVP.
- Si las Reflections se vuelven largas o numerosas, puede requerirse estrategia
  de busqueda dedicada.

---

## 9. Riesgos

- Los documentos historicos del repo contienen decisiones anteriores que ya no
  son canonicas. Este contrato debe prevalecer para implementacion.
- La bidireccionalidad por trigger puede introducir complejidad de concurrencia
  si no se implementa con cuidado.
- La inmutabilidad de Commit puede frustrar correcciones de errores del usuario.
- Soft delete acumulado puede crecer mucho si no se define politica de retencion
  post-MVP.
- Calcular Progress y Journey en tiempo real puede volverse costoso para
  usuarios con historiales muy largos.
- Presence calculada puede ser sensible a consultas frecuentes si se refresca en
  demasiadas superficies.
- Supports requieren validacion de Circle activa al crear; si la validacion no
  esta en la base de datos, podria romperse el dominio.
- La ausencia de Mood evita complejidad, pero limita analisis emocional
  estructurado en el MVP.
- RLS debera reflejar exactamente este contrato; un error de politica podria
  exponer Commits o Reflections con visibilidad incorrecta.
- Las migraciones Supabase CLI se vuelven la unica fuente oficial; cualquier
  cambio manual fuera de migraciones crearia deriva de esquema.

---

## 10. Preparacion para implementacion

Cuando este documento sea aprobado, el siguiente paso sera traducir exactamente
este contrato a PostgreSQL mediante migraciones versionadas de Supabase CLI.

La implementacion debera producir, en este orden conceptual:

1. Tipos conceptuales traducidos a columnas PostgreSQL.
2. Tablas MVP: `profiles`, `commits`, `reflections`,
   `circle_memberships`, `supports`.
3. Foreign keys y reglas de eliminacion fisica compatibles con soft delete.
4. Restricciones de unicidad, obligatoriedad, limites y checks.
5. Triggers necesarios para `updated_at`, creacion de profile y reciprocidad de
   Circle.
6. Politicas RLS alineadas con propiedad, visibilidad y Circle.
7. Funciones/RPC solo para datos derivados que no deben persistirse.
8. Tipos TypeScript generados desde Supabase, no escritos a mano como fuente de
   verdad.

No debe haber mas rediseno conceptual durante la implementacion. Si una
migracion, politica RLS, funcion, Server Action o modelo TypeScript contradice
este contrato, el codigo esta equivocado y debe corregirse para obedecerlo.
