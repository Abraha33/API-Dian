# GitHub Projects — API-Dian (modo solo dev)

Alinea este tablero con el mismo *mindset* que ERP Satelite: pocas columnas claras, WIP bajo, vistas guardadas por rol.

**Enlace del tablero:** usa el Project donde sigues Factura SaaS / API-Dian. En el repo ERP se referencia [Project 5 · Factura SaaS](https://github.com/users/Abraha33/projects/5) como paridad visual; **comprueba el ID** en [tus projects](https://github.com/Abraha33/projects) y sustituye enlaces en el README si cambia.

**Workflow y definición de done:** [workflow.md](./workflow.md), [estimation-and-definition-of-done.md](./estimation-and-definition-of-done.md), [ADR-002](../ADR/ADR-002-workflow-construccion.md).

---

## Asignaciones

En la practica todo puede ir con **Assignees = [@Abraha33](https://github.com/Abraha33)**. Una vista *Mis items* con filtro `assignee:@me` muestra solo tu cola.

## Status update (campo de texto)

Si el Project lo permite, activa un campo **Status update** por tarjeta (bloqueo, avance). En tablas tipo *Equipo* / *Mis items*: **View** → campos visibles.

---

## Workflows del Project (recomendado)

No hay API para activarlos; se configuran en **Project → Workflows**. Plantilla util (igual que en ERP Satelite):

| # | Workflow | Configuracion sugerida |
|---|----------|-------------------------|
| 1 | Item added to project | Status → **Backlog** |
| 2 | Issue/PR closed | Status → **Done** |
| 3 | Pull request merged | Status → **Done** |
| 4 | Issue reopened | Status → **Backlog** |
| 5 | Auto-close issue | Opcional: al pasar a Done cerrar issue |
| 6 | Auto-add to project | Repo `Abraha33/API-Dian`, filtro `is:issue` |
| 7 | Auto-archive | Conservador u OFF |

---

## Columnas del Kanban (Status)

Orden sugerido: **Icebox** → **Backlog** → **Ready** → **In progress** → **In review** → **Done**.

| Columna | Significado |
|---------|-------------|
| **Icebox** | Ideas fuera del plan activo. |
| **Backlog** | En roadmap; aun no sprint. |
| **Ready** | Cola del sprint (~2 semanas). Maximo 5-7 tickets. |
| **In progress** | **Solo 1 tarea** a la vez en la practica. |
| **In review** | Self-QA, pruebas manuales, revision rapida. |
| **Done** | Completado. |

---

## Vistas sugeridas

| Vista | Tipo | Uso |
|-------|------|-----|
| **Priority board** | Board | Columnas = **Status**; filas o grupo = **Priority** (P0-P3) si usas campo Priority. |
| **Equipo / inventario** | Tabla | Group by **Status**; columnas: Title, Status, Labels, Linked PRs. |
| **Mis items** | Tabla | Filtro `assignee:@me`. |
| **Foco semana** | Board | Solo **Ready + In progress + In review**. |
| **Roadmap** | Roadmap | Si usas fechas de inicio/fin en el Project. |

### Filtros por rol (vistas por rol)

Crea una vista guardada por cada label principal:

- `label:role-backend`
- `label:role-frontend`
- `label:role-database`
- (etc.; lista completa en [ticket-taxonomy.md](./ticket-taxonomy.md))

---

## Prioridad

Si usas campo **Priority** en el Project: P0 urgente, P1 sprint, P2 media, P3 baja. Puedes combinar con labels `type-*` en issues ([ticket-taxonomy.md](./ticket-taxonomy.md)).

---

## Campos personalizados (alineados al ROADMAP)

Opcionales pero recomendados para ligar cada tarjeta a [ROADMAP.md](../ROADMAP.md) y a [estimation-and-definition-of-done.md](./estimation-and-definition-of-done.md). Los **nombres** pueden adaptarse a tu Project; la intención es la que importa.

| Campo (ejemplo) | Tipo | Uso |
|-----------------|------|-----|
| **Fase** | Single select | `F1` … `F8` según la fase global del roadmap. |
| **Talla** | Single select | `XS`, `S`, `M`, `L`, `XL`. |
| **Riesgo** | Single select | `Bajo`, `Medio`, `Alto`. |
| **Prueba de cierre** | Texto | Una frase o checklist ejecutable; obligatorio antes de poner el ticket en **Ready**. |
| **Size** (numérico) | Number | Opcional; puntos o horas si prefieres además de la talla. |

Alternativa con labels de GitHub: crear etiquetas `phase-f1` … `phase-f8` si no quieres duplicar campo **Fase** (mantener **un** criterio principal para filtrar).

---

## Paleta (referencia rapida)

Alinea colores de **Status** y **Priority** con los de tu otro tablero (Factura SaaS) para reconocer estados de un vistazo. GitHub Projects permite editar colores por opcion de campo.

---

## Etiquetas en issues (chips en vista tabla)

Este repo usa labels con **guion** (`role-backend`, `type-feature`). Son el equivalente practico de `role/frontend` o `tipo/feature` en otros repos; manten **un** `role-*` principal por issue.
