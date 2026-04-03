# ADR-002: Workflow de construcción con IA

- **Estado:** Aceptado (documentación de proceso; no sustituye ADR-001).
- **Fecha:** —
- **Contexto:** API-Dian se construye con **un desarrollador** y uso intensivo de **IA** y herramientas externas. Hace falta una **fuente de verdad** sobre cómo se prioriza, valida y documenta el trabajo para no depender solo del historial de chats.

## Alcance de este ADR

Este ADR registra **decisiones de proceso** (qué reglas gobiernan cómo se trabaja). El **procedimiento detallado** (pasos, tablas de herramientas, integración con el tablero) vive en **[docs/workflow.md](../docs/workflow.md)**. Aquí no se duplica el paso a paso: se **aprueba** que ese documento es el procedimiento operativo oficial.

## División de responsabilidades

| Artefacto | Contiene |
|-----------|----------|
| **ADR-002 (este archivo)** | Decisiones: memoria en repo, herramientas aprobadas, gating por prueba de cierre, alineación con F1–F8, enlace al tablero. |
| **[docs/workflow.md](../docs/workflow.md)** | Cómo ejecutar el flujo día a día: tabla Perplexity / Cursor / CLI / Supabase / docs, **ocho pasos** por módulo, GitHub Projects, revisiones de arquitectura. |
| **[docs/estimation-and-definition-of-done.md](../docs/estimation-and-definition-of-done.md)** | Tallas, riesgo, DoD, tabla F1–F8 y ejemplos de prueba de cierre. |

## Decisión

1. **Memoria estable:** las decisiones que deben perdurar viven en el repositorio (README, ROADMAP, `docs/*`, ADRs). Los chats son **efímeros**.
2. **Pipeline de herramientas:** Perplexity (definición, arquitectura, investigación); Cursor (implementación en el repo); CLI (validación, tests, migraciones, logs); Supabase u **equivalente del ADR-001** para validación operativa del backend cuando aplique; documentación del repo como registro duradero.
3. **Gating por prueba de cierre:** ningún ticket pasa a **Ready** en el sprint sin **prueba de cierre ejecutable** acordada en el cuerpo del issue (o campo equivalente en el Project). Sin prueba de cierre **no** se considera listo para implementar.
4. **Cierre de trabajo:** al pasar a **Done**, el issue debe incluir enlace al PR (cuando exista) y **evidencia mínima reproducible** de la prueba de cierre (log, captura o pasos concretos).
5. **Estimación:** tallas **XS–XL**, tiempo en **rangos**, riesgo **Bajo/Medio/Alto**; módulos **L/XL** se parten en subtareas antes de codificar.
6. **Alineación con fases:** el orden de construcción sigue [ROADMAP.md](../ROADMAP.md) F1–F8 y el mapa [docs/modules.md](../docs/modules.md).
7. **WIP:** en la práctica **una** tarjeta en **In progress** a la vez (ver [docs/GITHUB_PROJECTS.md](../docs/GITHUB_PROJECTS.md)).

## Tablero de trabajo

El seguimiento operativo del repo **[Abraha33/API-Dian](https://github.com/Abraha33/API-Dian)** se hace en GitHub Projects; tablero de referencia: **[API-Dian — Project 5](https://github.com/users/Abraha33/projects/5)**. **Verificar** que el ID del proyecto sigue siendo el correcto en tu cuenta.

## Consecuencias

- **Positivas:** menos retrabajo; issues más claros; onboarding futuro más simple.
- **Negativas / coste:** mantener `open-questions.md` y docs actualizados exige disciplina explícita.

## Notas

- **ADR-001** sigue siendo la única fuente de verdad del **stack técnico** cuando esté cerrado (trabajo del desarrollador, p. ej. issue **T0.0.1**). Este ADR **no** elige tecnologías.
- Los nombres concretos de campos en GitHub Projects pueden variar; la **intención** (fase, talla, riesgo, prueba de cierre) es la que importa.
