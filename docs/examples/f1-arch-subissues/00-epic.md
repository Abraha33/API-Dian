## Contexto

Fase F1: arquitectura base y decisiones iniciales antes de construir el núcleo de plataforma (F2).

## Objetivo

Orquestar el trabajo de F1 mediante sub-issues: ADRs, bootstrap del proyecto backend, health, configuración, logging y entorno local Docker.

## Alcance (epic)

- Coordinar cierre de **ADR-001** (stack) y documentación de módulos (**ADR-002** o ampliación).
- Inicializar aplicación NestJS según decisiones aprobadas en ADR.
- Health, config, logging y compose local según issues hijos.

## Fuera de alcance

- Dominio fiscal completo (F4+).
- Conectores comerciales (F5.5).

## Sub-issues

Ver hijos enlazados en GitHub (ARCH-01 … ARCH-07).

## Prueba de cierre

| Qué verificar | Resultado esperado | Tiempo |
|---------------|-------------------|--------|
| Los 7 sub-issues cerrados y resumen en este epic | F1 desbloquea F2 con decisiones escritas | M (< 15 min) |

## Rama sugerida

`feature/platform/<n>-f1-arch-epic` (sustituir `<n>` por el número de **este** issue).
