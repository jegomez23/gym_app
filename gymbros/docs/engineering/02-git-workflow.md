# 02 — Git Workflow

> **Propósito de este documento:** Definir el flujo de trabajo con Git para Gym Circle. Conventional Commits desde el primer día, ramas estructuradas, PRs con revisión y versionado semántico.

---

## Conventional Commits

Toda descripción de commit debe seguir el formato:

```
<tipo>(<alcance opcional>): <descripción>

<cuerpo opcional>

<footer opcional>
```

### Tipos permitidos

| Tipo       | Cuándo usarlo                                              |
| ---------- | ---------------------------------------------------------- |
| `feat`     | Nueva funcionalidad                                        |
| `fix`      | Corrección de bug                                          |
| `chore`    | Configuración, dependencias, tooling                       |
| `docs`     | Documentación                                              |
| `refactor` | Cambio de código sin añadir funcionalidad ni corregir bugs |
| `style`    | Cambios de formato, no de lógica                           |
| `test`     | Añadir o modificar tests                                   |
| `perf`     | Mejora de rendimiento                                      |
| `db`       | Migraciones o cambios en base de datos                     |

### Ejemplos

```
feat(commit): crear formulario rápido de Commit
fix(circle): corregir error al aceptar invitación duplicada
chore: configurar ESLint y Prettier
docs(architecture): añadir documento de flujo de datos
refactor(progress): simplificar cálculo de continuidad
db: crear tabla de reflections
test(commit): añadir tests para createCommit Server Action
```

---

## Ramas

| Rama      | Propósito     | Base      | Fusiona a |
| --------- | ------------- | --------- | --------- |
| `main`    | Producción    | -         | -         |
| `develop` | Integración   | `main`    | `main`    |
| `feat/*`  | Features      | `develop` | `develop` |
| `fix/*`   | Bugs          | `develop` | `develop` |
| `chore/*` | Configuración | `develop` | `develop` |
| `docs/*`  | Documentación | `develop` | `develop` |

### Nombres de rama

```
feat/create-commit
feat/circle-invite
fix/duplicate-invite
chore/eslint-setup
docs/data-flow
```

---

## Flujo de trabajo

### 1. Crear rama desde `develop`

```bash
git checkout develop
git pull origin develop
git checkout -b feat/commit-form
```

### 2. Desarrollar con commits atómicos

Cada commit debe ser una unidad lógica completa. No commits de "WIP" o "avances."

```bash
git add .
git commit -m "feat(commit): crear formulario rápido con React Hook Form"
```

### 3. Pull Request a `develop`

Título del PR debe seguir el mismo formato que commits:

```
feat(commit): crear formulario rápido de Commit
```

### 4. Code review

Mínimo un approval antes de mergear. El revisor verifica:

- Estilo de código (según `01-code-style.md`)
- Funcionamiento correcto
- Tests pasan
- Sin regresiones

### 5. Merge a `develop`

Usar squash merge para mantener historial limpio:

```bash
git checkout develop
git merge --squash feat/commit-form
git commit -m "feat(commit): crear formulario rápido de Commit"
```

### 6. Release a `main`

Cuando `develop` está estable y listo para producción:

```bash
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

---

## Commits atómicos

Cada commit debe:

1. **Hacer una sola cosa.** No mezclar cambios no relacionados.
2. **Compilar y pasar tests.** No se permite commitear código que no compile.
3. **Tener una descripción clara.** "fix(circle): corregir error al duplicar invitación" en lugar de "fix".

```bash
# ✅ Bien: commit atómico
git commit -m "feat(commit): crear formulario rápido con validación Zod"

# ❌ Mal: commit con múltiples cambios no relacionados
git commit -m "varios cambios"
```

---

## Releases

### Versionado semántico

```
vMAJOR.MINOR.PATCH
```

- **MAJOR:** Cambios incompatibles con versiones anteriores.
- **MINOR:** Nuevas funcionalidades compatibles.
- **PATCH:** Correcciones de bugs compatibles.

### Ejemplos

```
v0.1.0  → MVP inicial
v0.2.0  → Añadir Reflections
v0.3.0  → Añadir Knowledge
v1.0.0  → Primer release estable
v1.1.0  → Nuevas funcionalidades
v1.1.1  → Bug fix
```

### Tags

```bash
git tag -a v0.1.0 -m "MVP: Auth, Commits, Circle, Progress"
git push origin v0.1.0
```

---

## Reglas

1. **Nunca commitear directamente a `main`.** Siempre a través de PR.
2. **Nunca commitear directamente a `develop`.** Siempre a través de rama feature/fix/chore.
3. **Commits atómicos.** Un commit = una unidad lógica.
4. **Conventional Commits obligatorios.** `git commit -m "fix: ..."` no es suficiente.
5. **No WIP commits.** Si necesitas guardar progreso, usa `git stash`.
6. **PRs pequeños.** Máximo 200 líneas de cambio. Si es más grande, dividir en múltiples PRs.
7. **Squash merge a develop.** Historial limpio.

---

## Prohibido

- `git commit -m "fix"` (sin Conventional Commit)
- `git commit -m "WIP"` (commits de trabajo en progreso)
- Mergear PRs sin revisión
- Commitear código que no compila
- Commitear con tests fallando
- Forzar push a `main` o `develop`

---

## Próximo documento

`docs/engineering/03-testing-strategy.md` — Estrategia completa de testing: qué testear, qué no, unit, integration, e2e, cobertura.
