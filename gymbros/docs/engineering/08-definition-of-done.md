# 08 — Definition of Done

> **Propósito de este documento:** Definir qué significa que una tarea, feature o sprint esté completa en Gym Circle. Sin ambigüedad. Una tarea no está terminada hasta que cumple todos los criterios.

---

## Definition of Done para una tarea individual

Una tarea está completa cuando:

- [ ] El código compila sin errores
- [ ] `npm run lint` pasa sin errores ni warnings
- [ ] Los tests unitarios nuevos pasan
- [ ] Los tests existentes no se han roto
- [ ] La funcionalidad funciona en desarrollo local
- [ ] Server Actions nuevas devuelven `{ data, error }`
- [ ] Server Actions nuevas verifican autenticación
- [ ] Zod schemas validan todos los campos de entrada
- [ ] RLS cubre la nueva tabla (si aplica)
- [ ] No hay `console.log` ni código comentado
- [ ] Los imports siguen el orden definido en `01-code-style.md`
- [ ] Los nombres siguen la convención definida
- [ ] La tarea tiene un commit con Conventional Commit
- [ ] El componente es accesible por teclado
- [ ] El componente tiene roles ARIA si aplica
- [ ] Las imágenes tienen `alt` text
- [ ] Los formularios tienen labels asociados
- [ ] Lighthouse accessibility score no ha disminuido

---

## Definition of Done para una feature completa

Una feature está completa cuando:

- [ ] Todas las tareas de la feature están completas (checklist anterior)
- [ ] La feature funciona en su totalidad (no solo partes)
- [ ] Estados vacíos, loading y error están implementados
- [ ] La feature es responsive (móvil + tablet + desktop)
- [ ] Los tests de integración de la feature pasan
- [ ] El flujo E2E existe o se ha añadido al existente
- [ ] El microcopy está escrito con lenguaje de identidad
- [ ] La documentación de la feature está actualizada (si aplica)
- [ ] La feature ha sido probada en un entorno de preview
- [ ] No hay regresiones en features existentes

---

## Definition of Done para un sprint

Un sprint está completo cuando:

- [ ] Todas las features del sprint están completas (checklist anterior)
- [ ] El sprint produce una versión desplegable
- [ ] `npm run test` pasa al 100%
- [ ] `npm run lint` pasa sin errores
- [ ] `npm audit` no tiene vulnerabilidades críticas
- [ ] Las migraciones de base de datos están versionadas
- [ ] Las nuevas variables de entorno están documentadas
- [ ] El sprint ha sido desplegado en preview
- [ ] No hay deuda técnica intencional sin documentar
- [ ] El fundador ha aprobado el sprint

---

## Definition of Done para el MVP

El MVP está completo cuando:

- [ ] Sprint 0 a Sprint 8 completos y aprobados
- [ ] Usuario puede registrarse e iniciar sesión
- [ ] Usuario puede crear Commits y verlos en timeline
- [ ] Usuario puede invitar personas a su Circle
- [ ] Usuario puede ver presencia del Circle en tiempo real
- [ ] Usuario puede ver su progreso y Journey
- [ ] Usuario puede ver y editar su perfil
- [ ] Usuario puede crear Reflections
- [ ] La aplicación habla con lenguaje de identidad
- [ ] Tests E2E críticos pasan
- [ ] Lighthouse score > 90
- [ ] Aplicación desplegada en producción
- [ ] Security checklist completado

---

## Lo que NO es necesario para considerar algo "done"

- Cobertura de test al 100% (solo en schemas)
- Documentación de usuario final (manual de usuario)
- Traducciones
- Modo oscuro
- Animaciones complejas
- Perfecto pixel-perfect en todos los navegadores

---

## Próximo documento

`docs/engineering/09-first-commit-plan.md` — El plan exacto para el primer commit del proyecto.
