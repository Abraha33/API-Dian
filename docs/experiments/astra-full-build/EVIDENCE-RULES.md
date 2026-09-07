# Reglas de evidencia — Astra Full Build

## Principio

El experimento se gobierna por evidencia, no por confianza en el agente.

`PASS = afirmación + prueba reproducible + resultado verificable`

## Evidencia mínima aceptable

Cada gate debe incluir, cuando aplique:

- commit exacto;
- archivos modificados;
- comando ejecutado;
- versión/herramienta;
- salida resumida;
- tests ejecutados;
- número de tests PASS/FAIL/SKIP;
- logs relevantes;
- artefactos generados;
- métricas;
- condiciones del entorno;
- limitaciones conocidas.

## Qué NO cuenta como evidencia suficiente

- “el código parece correcto”;
- “Astra revisó el archivo”;
- “compila” cuando el gate exige integración;
- screenshots sin comando/configuración;
- benchmark sin especificar máquina/configuración;
- test manual no reproducible como única evidencia;
- mocks cuando el gate exige PT/DIAN real;
- test real cuando no puede demostrarse qué versión de código se ejecutó.

## Gates por fase

### Fase 0

Debe demostrar aislamiento, autoridad documental, reglas del agente y mecanismo de seguimiento.

### Fase 1

Debe existir una matriz que conecte:

`requisito → especificación → módulo → test esperado`

Sin requisitos críticos huérfanos.

### Fase 2

Cada invariante crítico debe tener al menos un test o procedimiento de prueba definido.

Críticos:

- idempotencia;
- aislamiento tenant/org/environment;
- `UNKNOWN != REEMITIR`;
- side effects remotos fuera de transacciones SQL;
- credenciales y scopes;
- state machine válida;
- no pérdida silenciosa de trabajo durable.

### Fase 3

Build local reproducible + funcionalidades V1 implementadas.

### Fase 4

E2E local completo con FakeFiscalProvider y webhook receiver local.

### Fase 5

Checkout limpio debe poder reproducir instalación, DB, migraciones, build y tests mediante runner/CI documentado.

### Fase 6

Debe contener evidencia adversarial y de capacidad.

Mínimos:

- duplicados = 0 bajo concurrencia objetivo;
- cross-tenant = 0;
- timeout after possible send → UNKNOWN/reconcile, nunca retry ciego;
- worker crash recovery;
- DB temporary outage recovery;
- webhook failure/retry;
- restore ejecutado;
- benchmark con configuración exacta;
- primera degradación/saturación registrada;
- objetivo 3 M docs/mes y ~50 docs/s tratado como hipótesis hasta PASS.

### Fase 7 — READY FOR PT INTEGRATION

Solo puede pasar si Fases 0–6 están PASS.

Debe producir un paquete de handoff para el owner:

- provider port definitivo;
- campos/configuración requeridos;
- secretos requeridos;
- sandbox requirements;
- contract questions;
- rate-limit questions;
- reconciliation capabilities necesarias;
- checklist de contingencias PT;
- tests que correrán contra el PT real.

### Fases 8–10

Exigen evidencia externa real. Mocks no permiten cerrar estos gates.

## Regla de regresión

Un gate previamente PASS puede volver a `IN PROGRESS` si una modificación posterior rompe la evidencia que lo sustentaba.

El agente debe volver a ejecutar las pruebas afectadas antes de conservar el PASS.
