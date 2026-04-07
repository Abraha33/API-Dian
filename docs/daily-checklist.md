# Checklist diario (API-DIAN)

Marca en el Project o en el issue lo que aplique. Para el flujo completo, ver [`docs/workflow.md`](./workflow.md).

### Checklist F1 (dev solo)

#### 1. Antes de empezar

- [ ] Issue con título correcto y body completo (Contexto, Objetivo, Alcance, Fuera de alcance).
- [ ] Labels: `role-*`, `type-*`, `size-*`, `priority-*`, `module-*` (si aplica).
- [ ] Talla y riesgo definidos usando [`docs/estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md).
- [ ] Issue en el Project board (Backlog).

#### 2. Preparar trabajo

- [ ] `git checkout dev` + `git pull`.
- [ ] Rama creada: `feature/<rol>/<issue-n>-slug`.
- [ ] Tarjeta movida a **In Progress**.

#### 3. Diseño rápido con IA (Perplexity)

- [ ] Session-template rellenado (en corto) para esta sesión.
- [ ] En Perplexity: issue + contexto mínimo pegado, objetivo claro.
- [ ] Decisiones importantes anotadas (issue o ADR si son de arquitectura).

#### 4. Implementación (Cursor)

- [ ] Archivos relevantes abiertos en Cursor.
- [ ] Chat de Cursor con: enlace al issue + resumen de decisiones.
- [ ] Cambios limitados al alcance del issue.
- [ ] Commits pequeños y descriptivos.

#### 5. BD (solo si toca database)

- [ ] Migración creada en `supabase/migrations/`.
- [ ] SQL editado y probado según [`docs/supabase-workflow.md`](./supabase-workflow.md).
- [ ] `supabase db push` sin errores, evidencia guardada en el issue.
- [ ] Introspección actualizada (`scripts/introspection/...`).

#### 6. Evidencia

- [ ] Comentario en el issue con comandos, outputs y pruebas realizadas.
- [ ] Checklist de prueba de cierre del issue marcada con resultado real.
- [ ] Criterios de DoD del módulo cumplidos ([`docs/estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md), sección DoD por módulo).

#### 7. PR y cierre

- [ ] PR a `dev` desde la rama del issue con `Closes #N`.
- [ ] CI verde.
- [ ] PR aprobado y mergeado.
- [ ] Tarjeta movida a **Done** y issue cerrado.
- [ ] Horas reales registradas en la tabla de calibración.
