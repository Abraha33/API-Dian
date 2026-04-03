# ADR-002: Workflow de construcción con IA

- **Estado:** Aceptado (documentación de proceso; no sustituye ADR-001).
- **Fecha:** —
- **Contexto:** API-Dian se construye con **un desarrollador** y uso intensivo de **IA** y herramientas externas. Hace falta una **fuente de verdad** sobre cómo se prioriza, valida y documenta el trabajo para no depender solo del historial de chats.

## Decisión

1. **Memoria estable:** las decisiones que deben perdurar viven en el repositorio (README, ROADMAP, `docs/*`, ADRs). Los chats son **efímeros**.
2. **Pipeline de herramientas:** se usa el reparto descrito en [docs/workflow.md](../docs/workflow.md) (Perplexity para definición/investigación; Cursor para implementación; CLI y Supabase —si aplican al stack— para validación operativa).
3. **Gating por prueba de cierre:** ningún trabajo entra a implementación sprint sin **prueba de cierre ejecutable** acordada (ver [docs/estimation-and-definition-of-done.md](../docs/estimation-and-definition-of-done.md)).
4. **Estimación:** tallas **XS–XL**, tiempo en **rangos**, riesgo **Bajo/Medio/Alto**; módulos **L/XL** se parten antes de codificar.
5. **Alineación con fases:** el orden de construcción sigue [ROADMAP.md](../ROADMAP.md) F1–F8 y el mapa [docs/modules.md](../docs/modules.md).

## Consecuencias

- **Positivas:** menos retrabajo; issues más claros; onboarding futuro más simple.
- **Negativas / coste:** mantener `open-questions.md` y docs actualizados exige disciplina explícita.

## Notas

- **ADR-001** sigue siendo la única fuente de verdad del **stack técnico** cuando esté cerrado. Este ADR no elige tecnologías.
- Los campos concretos en GitHub Projects (nombres de columnas personalizadas) pueden variar; la **intención** (fase, talla, riesgo, prueba de cierre) es la que importa.
