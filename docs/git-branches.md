# Git branches (roles / areas)

## Layout

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready / default |
| `dev` | Integration branch for ongoing development |
| `area/backend` | Backend work merges into `dev` |
| `area/frontend` | Frontend |
| `area/database` | Database |
| `area/qa` | QA automation / tooling in repo (if any) |
| `area/design` | Design assets / specs in repo (if any) |
| `area/devops` | Pipelines, infra-as-code |
| `area/product` | Product docs / PM artifacts in repo (if any) |
| `area/platform` | Cross-cutting or full-stack work |

## Why `area/*` and not `dev/*`?

Git stores branch names under `refs/heads/`. A branch named `dev` cannot coexist with branches named `dev/backend`, `dev/frontend`, etc. So the integration branch is **`dev`**, and role lines use the **`area/<role>`** prefix.

## Typical flow

1. `git checkout area/backend` (example)
2. Commit, push, open PR **into `dev`**
3. When `dev` is stable, PR **`dev` → `main`**

Adjust names if your team uses `develop` instead of `dev`.
