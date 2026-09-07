# API-DIAN V1 — Estrategia de ejecución local, contenedores, CI y Actions

> **Decisión del owner:** la construcción y validación inicial se ejecutará localmente. Existe un self-hosted runner local disponible.

## Principio

No mezclar infraestructura/automatización con conceptualización prematura.

- Fase 1: conceptualización — sin obligación de CI/containers.
- Fase 2: testeo aislado — pruebas locales simples, PostgreSQL local/fakes cuando sean necesarios.
- Fase 3: integración local — conectar módulos.
- Fase 4: recién aquí consolidar Docker/containers, self-hosted runner, CI y GitHub Actions.

## Objetivo de Fase 4

Un checkout limpio debe poder reproducir el sistema y su evidencia en la máquina/runner local del owner.

## Runner local

Usar self-hosted runner para tareas que requieran:
- build real del repo;
- tests unit/integration;
- PostgreSQL de prueba;
- Docker/Compose;
- migraciones;
- contract tests;
- fault tests locales;
- k6/performance cuando el hardware/entorno sean adecuados;
- creación de reportes/artefactos de evidencia.

## GitHub Actions

Actions se incorpora como orquestador de tareas reproducibles, no como sustituto del diseño.

Workflows previstos, cuando llegue Fase 4:
1. `ci.yml` — lint, typecheck, unit, build.
2. `integration.yml` — PostgreSQL + migraciones + integration/contract tests.
3. `failure-tests.yml` — escenarios controlados de fallos.
4. `capacity-local.yml` — benchmark manual/dispatch en runner dedicado; nunca en cada commit.
5. `security.yml` — dependency/SAST/SBOM según herramientas elegidas.

No crear workflows que ejecuten gastos, despliegues cloud o acciones externas irreversibles sin autorización explícita.

## Contenedores

Objetivo:
- API;
- worker;
- PostgreSQL local;
- fake provider;
- receptores webhook falsos/servicios de prueba cuando sea útil.

Los contenedores son una forma reproducible de ejecutar componentes; no deben definir reglas de dominio.

## Separación de ambientes

Local:
- datos sintéticos;
- secretos ficticios;
- fake provider;
- ningún dato fiscal real requerido.

Sandbox externo:
- solo Fase 5;
- credenciales sandbox reales autorizadas;
- PT/servicios externos controlados.

Producción:
- fuera del runner local;
- requiere gates y autorización del owner.

## Regla de seguridad

Nunca poner en el runner/repo:
- credenciales prod en texto plano;
- certificados reales sin manejo seguro;
- API keys reales hardcodeadas;
- secretos en logs/artefactos.

## Evidencia

Cada workflow de validación debe producir resultados legibles:
- versión/commit probado;
- configuración relevante;
- tests PASS/FAIL;
- métricas cuando aplique;
- artefactos/reportes;
- fecha de ejecución.

El objetivo no es “tener CI”, sino poder demostrar qué versión pasó qué prueba y bajo qué configuración.
