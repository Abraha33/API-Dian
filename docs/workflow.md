# Flujo de trabajo de construcción (1 dev + IA)

Este documento describe **cómo** se construye API-Dian: herramientas, orden de trabajo por módulo y dónde queda la **memoria estable** del proyecto.

**Relacionado:** [ADR-002 — Workflow de construcción](../ADR/ADR-002-workflow-construccion.md), [estimation-and-definition-of-done.md](./estimation-and-definition-of-done.md), [ROADMAP.md](../ROADMAP.md).

---

## Herramientas y rol

| Herramienta | Rol |
|-------------|-----|
| **Perplexity** | Definición, análisis, arquitectura, investigación, revisión de decisiones (fuentes externas, normativa, comparativas). |
| **Cursor** | Implementación sobre archivos reales del repositorio (código, tests, configuración). |
| **CLI** | Ejecución local, validación, tests, migraciones, inspección de logs (según stack definido en ADR-001). |
| **Supabase** | Backend operativo cuando forme parte del stack: base de datos, auth, RLS, storage, validación en entorno real. |
| **Documentación del repo** | Memoria estable: README, ROADMAP, ADRs, `docs/*`. Lo que no está escrito aquí tiende a perderse entre chats. |

> Hasta cerrar **ADR-001**, los nombres concretos de runtime o proveedores son **hipótesis**; el flujo de trabajo es independiente del stack.

---

## Flujo estándar por módulo (o por epic acotado)

Antes de pasar a **implementar**, el trabajo debe estar **definido y comprobable**.

1. **Definir el módulo** (Perplexity + notas): alcance, qué queda fuera, dependencias con otras fases del [ROADMAP](../ROADMAP.md).
2. **Aclarar dependencias:** qué debe existir ya (ADR, tablas, auth, etc.).
3. **Documentar decisiones:** si es transversal o duradera, valorar un **ADR** o una sección en `docs/open-questions.md` / cierre de pregunta.
4. **Estimar esfuerzo** con [estimation-and-definition-of-done.md](./estimation-and-definition-of-done.md): talla, rango de tiempo, riesgo.
5. **Definir prueba de cierre:** criterio ejecutable (comando, checklist, escenario E2E). Sin esto **no** se marca Ready en el tablero.
6. **Implementar** (Cursor + CLI): ramas desde `dev`, PRs pequeños (ver [git-branches.md](./git-branches.md)).
7. **Validar** con CLI + entorno Supabase (o equivalente del ADR): no cerrar sin ejecutar la prueba de cierre.
8. **Documentar cambios:** actualizar README/ROADMAP solo si cambia comportamiento acordado para humanos; actualizar `open-questions.md` si quedan deudas explícitas.

---

## Integración con GitHub Projects

- Cada issue debería indicar en el cuerpo: **fase ROADMAP (Fx)**, **prueba de cierre**, **talla** (opcionalmente reflejados también en campos del Project — ver [GITHUB_PROJECTS.md](./GITHUB_PROJECTS.md)).
- **WIP = 1** en progreso; al terminar, enlace al PR y evidencia mínima de la prueba de cierre (log, captura, o descripción reproducible).

---

## Revisiones de arquitectura

- Cambios que afecten **límites de módulos**, **contrato con el canal de salida** o **modelo multi-tenant**: revisar contra [modules.md](./modules.md) y el ROADMAP antes de merge.
- **Cumplimiento y adaptación DIAN:** ante cambios normativos o del integrador, seguir la línea transversal descrita en el ROADMAP (impacto, regresión, versionado).
