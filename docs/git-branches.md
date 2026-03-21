# Ramas Git en este repo

Solo hay **dos ramas permanentes** en el remoto: **`main`** y **`dev`**. El resto son ramas de trabajo **tuyas**, creadas cuando las necesites (ver README §3).

| Rama | Quien la usa | Proposito |
|------|----------------|-----------|
| `main` | Release | Codigo estable (produccion o demo seria). Entra con merge desde `dev`, salvo hotfix excepcional. |
| `dev` | Dia a dia | Integracion: aqui apuntan los PR del sprint. Base para abrir una rama nueva por ticket. Debe pasar CI razonablemente. |

## Ramas de trabajo (tu eleccion)

No hay ramas fijas por rol. Desde `dev`:

- Nombres recomendados: `feature/<rol>-<tema>` o `feature/issue-NNN-desc`  
  Ejemplos: `feature/database-issue-202-rls`, `feature/frontend-factura-form`
- Vida corta: un PR → `dev`; luego borrar la rama en local y remoto.

## Flujo resumido

`feature/...` → PR → **`dev`** → (al cerrar hito) PR **`dev`** → **`main`**.

## Nota sobre `develop`

En otros equipos la rama de integracion se llama `develop`. En este repo esa funcion la cumple **`dev`**.
