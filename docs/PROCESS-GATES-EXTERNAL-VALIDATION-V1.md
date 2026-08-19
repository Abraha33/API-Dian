# API-DIAN — Gates de ejecución derivados de validación externa V1

**Fecha:** 2026-08-19  
**Estado:** BINDING ADDENDUM  
**Fuente:** `PROCESS-VALIDATION-EXTERNAL-2026-08-19.md`

Este documento complementa `DEFINITION-OF-DONE-V1.md`. No cambia producto ni arquitectura.

## G1 — Revisión independiente proporcional al riesgo

Toda jornada mantiene revisión de diff + tests + CI.

Además, si toca cualquiera de estas fronteras, requiere segunda revisión independiente antes de cerrar el gate de fase:

- tenant/RLS;
- auth/secretos;
- idempotencia;
- máquina de estados;
- side effects/worker;
- UNKNOWN/reconcile;
- adapter PT;
- restore/divergencia;
- cambios regulatorios.

Un segundo modelo puede servir como revisor adversarial inicial, pero no convierte por sí solo una frontera crítica en “auditada externamente”. Antes del piloto se debe evaluar revisión humana especializada de los puntos de mayor impacto fiscal/seguridad cuando sea razonablemente accesible.

## G2 — Cadena de suministro

Desde ahora:

- lockfile obligatorio;
- dependency audit en CI;
- ningún secreto en repo/fixtures/logs.

Antes de producción:

- secret scanning automatizado;
- SBOM/inventario de dependencias de producción;
- trazabilidad commit → build → release;
- provenance de build si el CI lo ofrece con coste/operación razonables;
- procedimiento de actualización/remediación de dependencias vulnerables.

SLSA L3 no es requisito V1.

## G3 — Frescura regulatoria

Revalidar fuentes DIAN vigentes como gate obligatorio:

1. antes de B9 (adapter real);
2. antes de B13 (piloto);
3. antes de B14 (cierre V1).

Como mínimo comprobar normatividad, anexos técnicos, alcance FEV/NC/ND, DEE POS/notas de ajuste, contingencias y estado vigente del PT elegido.

Una interpretación regulatoria vieja no se considera autoridad por estar ya documentada en el repo.

## G4 — Vulnerability response

Antes de producción debe existir un runbook mínimo para:

```text
detectar → clasificar → contener → corregir → probar → desplegar → aprender
```

Debe cubrir al menos:

- dependencia vulnerable;
- secreto comprometido;
- fallo auth/tenant isolation;
- vulnerabilidad propia;
- incidente que pueda afectar integridad fiscal.

## G5 — Release engineering continuo

No esperar a B10 para aplicar disciplina de release.

Desde B1:

- build reproducible;
- CI obligatoria;
- cambios pequeños/reversibles;
- configuración no secreta versionada;
- identificación de commit de origen.

En B10 antes de producción:

- deployment reproducible;
- smoke test;
- rollback practicable;
- commit/build/release trazables.

## G6 — Pirámide práctica de pruebas

Por jornada usar el mínimo conjunto que demuestre el cambio con rapidez:

```text
test focal
→ módulo
→ integración relevante
→ E2E/adversarial si aplica
→ suite completa solo en gates de fase/release
```

No ejecutar suites costosas por rutina si no agregan evidencia al cambio; tampoco omitir una prueba de fallo crítica por ahorrar tiempo.

## Regla de precedencia

En lo referente al proceso de ejecución:

```text
DEFINITION-OF-DONE-V1.md
+ PROCESS-GATES-EXTERNAL-VALIDATION-V1.md
```

se leen juntos.

Si hay conflicto, gana el criterio que reduzca riesgo sin contradecir producto/arquitectura y sin introducir complejidad desproporcionada.
