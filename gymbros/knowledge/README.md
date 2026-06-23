# Knowledge Kernel

This directory is the operating layer for Gym Circle. It exists so future AI
agents and humans can understand the project without reading every long-form
document or relying on previous conversations.

## Boot

Start with `CLAUDE.md` at the project root. Then read `CURRENT_STATE.md`, then
route via `MAP.md`. Do not read this directory sequentially — use the decision
tree in CLAUDE.md to load only what the task needs.

## Rule

Each canonical file answers one important question:

| File               | Question                                    |
| ------------------ | ------------------------------------------- |
| `CURRENT_STATE.md` | What is true today?                         |
| `PRINCIPLES.md`    | What must not be violated?                  |
| `DOMAIN.md`        | What does the product language mean?        |
| `ARCHITECTURE.md`  | How is the software organized?              |
| `DATABASE.md`      | How is data modeled and protected?          |
| `MAP.md`           | What context should I load for a task?      |
| `PLAYBOOKS.md`     | How should common work be performed?        |
| `MEMORY.md`        | What durable lessons must not be forgotten? |
| `decisions/`       | Why were major choices made?                |

## Authority

`knowledge/` owns canonical summaries. `docs/` preserves long-form reasoning and
reference material. When they disagree, record the contradiction in
`CURRENT_STATE.md` and resolve it through an implementation change, a canonical
update, or an ADR.

## Maintenance

Update this kernel only when it reduces future reasoning cost. Do not add files
for appearance. Prefer one clear owner over repeated explanations.
