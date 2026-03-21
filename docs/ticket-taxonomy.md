# Tickets by role: boards and labels

Each **role** maps to **one board** (one GitHub Project view, or equivalent). The **owning role** is the single label `role-*` on the issue. Use **type-*** labels for bugs vs features inside that board. Link cross-role work with **parent epic/story** (issue number in the body or GitHub sub-issues).

## Roles and boards

| Board        | Label           | Owns |
|-------------|-----------------|------|
| Backend     | `role-backend`  | APIs, services, server logic |
| Frontend    | `role-frontend` | UI, web client, a11y |
| Database    | `role-database` | Schema, migrations, query perf, integrity |
| QA          | `role-qa`       | Test design, execution, sign-off |
| Design      | `role-design`   | UX, UI, research, handoff |
| DevOps      | `role-devops`   | CI/CD, infra, observability, releases |
| Product     | `role-product`  | Discovery, prioritization, specs |
| Platform    | `role-platform` | End-to-end or cross-cutting when one owner |

**Rule:** one primary `role-*` per issue (the board it lives on). If work spans roles, split into linked issues or use sub-issues—do not duplicate the same card on multiple boards without a link to a parent.

## Work type (same on every board)

| Label            | Use |
|------------------|-----|
| `type-bug`       | Defect |
| `type-feature`   | New capability |
| `type-spike`     | Time-boxed research |
| `type-tech-debt` | Refactor / cleanup |
| `type-chore`     | Maintenance, tooling |

## GitHub Projects (per-role views)

1. Create labels: `python scripts/ensure_role_labels.py` or `scripts/create-labels.ps1` (requires [GitHub CLI](https://cli.github.com/)).
2. Project views: [GITHUB_PROJECTS.md](./GITHUB_PROJECTS.md).
3. In **Projects**, create a project (or use one project with multiple views).
4. For each role, add a **view** (or separate project) with filter: `label:role-backend`, `label:role-frontend`, etc.
5. Columns example: **Backlog → Ready → In progress → In review → Done** (adjust to your process).

## Issue templates

Templates live in `.github/ISSUE_TEMPLATE/`. Pick the template that matches the **owning role**; then add the appropriate `type-*` label after creation if needed.
