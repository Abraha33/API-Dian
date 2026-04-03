# Taxonomía de tickets: roles, tipos y tableros

Cada **rol** corresponde a un **tablero** (una vista de GitHub Project, o proyecto dedicado). El **rol dueño** es un único label `role-*` por issue. Los labels `type-*` clasifican el tipo de trabajo dentro de ese tablero. Para trabajo multi-rol, enlazar issues o usar sub-issues; no duplicar la misma tarjeta sin enlace a un padre.

**Campos extra (fase, talla, riesgo, prueba de cierre):** ver [GITHUB_PROJECTS.md](./GITHUB_PROJECTS.md) y [estimation-and-definition-of-done.md](./estimation-and-definition-of-done.md).

---

## Roles y tableros

| Tablero (vista) | Label | Responsabilidad típica |
|-----------------|-------|-------------------------|
| Backend | `role-backend` | APIs, lógica de servidor, colas, **adaptadores de canal de salida** hacia la DIAN. |
| Frontend | `role-frontend` | UI (p. ej. Next.js si el ADR lo confirma), dashboard, accesibilidad. |
| Base de datos | `role-database` | Esquema, migraciones, rendimiento de consultas, integridad, RLS. |
| QA | `role-qa` | Diseño de pruebas, ejecución, cierre según prueba de cierre. |
| Diseño | `role-design` | UX/UI, investigación, entregables visuales. |
| DevOps | `role-devops` | CI/CD, infraestructura, secretos, observabilidad, releases. |
| Producto | `role-product` | Discovery, priorización, especificaciones. |
| Plataforma | `role-platform` | Cambios transversales o full-stack con un solo responsable. |

**Regla:** un solo `role-*` principal por issue (el tablero donde “vive” la tarjeta).

---

## Tipo de trabajo (común a todos los tableros)

| Label | Uso |
|-------|-----|
| `type-bug` | Defecto |
| `type-feature` | Nueva capacidad |
| `type-spike` | Investigación acotada en el tiempo |
| `type-tech-debt` | Refactor o limpieza |
| `type-chore` | Mantenimiento, herramientas, tareas operativas |

---

## GitHub Projects (vistas por rol)

1. Crear labels: `python scripts/ensure_role_labels.py` o `scripts/create-labels.ps1` (requiere [GitHub CLI](https://cli.github.com/) autenticado).
2. Guía solo dev: [GITHUB_PROJECTS.md](./GITHUB_PROJECTS.md) (columnas, workflows, campos ROADMAP).
3. En **Projects**, crear un proyecto (o un proyecto con varias vistas).
4. Por cada rol, añadir una **vista** con filtro: `label:role-backend`, `label:role-frontend`, etc.
5. Columnas tipo Kanban: **Icebox → Backlog → Ready → In progress → In review → Done** (ajustable).

---

## Plantillas de issue

Ubicación: `.github/ISSUE_TEMPLATE/`. Elegir la plantilla del **rol dueño**; añadir `type-*` tras crear si hace falta. En el cuerpo conviene incluir **Fase (Fx)**, **prueba de cierre** y **talla** aunque también existan como campos del Project.

---

## English reference (labels)

Los nombres de labels (`role-backend`, `type-feature`, …) se mantienen en **inglés** para coincidir con scripts y plantillas existentes. Las descripciones operativas están en español en este archivo.
