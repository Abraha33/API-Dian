# Ramas Git en este repo

Solo hay **dos ramas permanentes** en el remoto: **`main`** y **`dev`**. El resto son ramas de trabajo **tuyas**, creadas cuando las necesites (contexto breve en [README.md](../README.md)).

## Autoridad y protección

- **`dev` es la rama autoritaria de integración diaria.** Todo trabajo nuevo parte de `dev` y vuelve mediante Pull Request.
- **`main` es la rama autoritaria de release.** Solo recibe cambios revisados desde `dev` o un hotfix excepcional documentado.
- GitHub mantiene un ruleset activo sobre `dev` y `main` que exige Pull Request, revisión, CI y CodeQL, y bloquea borrado y force-push.
- Ninguna rama auxiliar puede convertirse en fuente de verdad por conveniencia o por contener una versión más nueva: primero debe integrarse mediante PR.

| Rama | Quien la usa | Proposito |
|------|----------------|-----------|
| `main` | Release | Codigo estable (produccion o demo seria). Entra con merge desde `dev`, salvo hotfix excepcional. |
| `dev` | Dia a dia | Integracion: aqui apuntan los PR del sprint. Base para abrir una rama nueva por ticket. Debe pasar CI razonablemente. |

## Ramas de trabajo (tu eleccion)

No hay ramas fijas por rol. Desde `dev`:

- Nombres recomendados: `feature/<rol>-<tema>` o `feature/issue-NNN-desc`  
  Ejemplos: `feature/database-issue-202-rls`, `feature/frontend-factura-form`
- Vida corta: un PR → `dev`; luego borrar la rama en local y remoto.

## Versiones, ambientes y worktrees

- Las versiones se representan con tags inmutables `vMAJOR.MINOR.PATCH`, no con ramas `version/*`.
- Los ambientes (`local`, `ci`, `staging`, `production`) se diferencian por configuración, secretos administrados y despliegue; no por ramas permanentes.
- Un worktree es solo un checkout auxiliar temporal. Antes de crearlo o reutilizarlo, comprobar `git worktree list` y conservar una única ubicación activa por rama.
- Al terminar un trabajo, primero conservar el commit/PR o crear respaldo; luego archivar el worktree y eliminar la rama solo si quedó clasificada como obsoleta.

## Flujo resumido

`feature/...` → PR → **`dev`** → (al cerrar hito) PR **`dev`** → **`main`**.

## Nota sobre `develop`

En otros equipos la rama de integracion se llama `develop`. En este repo esa funcion la cumple **`dev`**.
