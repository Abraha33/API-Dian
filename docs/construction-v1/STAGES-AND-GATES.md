# API-DIAN V1 — Etapas y gates oficiales

## Gate 1 — CONCEPT READY
Un mini-proyecto pasa conceptualización cuando:
- problema y responsabilidad están claros;
- entradas/salidas están definidas;
- contratos con otros módulos están definidos;
- invariantes y estados están identificados;
- errores/fallos principales están enumerados;
- dependencias simulables están identificadas;
- no quedan contradicciones con arquitectura canónica.

## Gate 2 — ISOLATED TEST READY
Pasa laboratorio cuando:
- existe test plan;
- casos normales PASS;
- casos negativos PASS;
- fallos críticos simulados PASS;
- comportamiento es determinista donde debe serlo;
- evidencia puede reproducirse localmente;
- faltas de otros módulos están cubiertas por mocks/fakes explícitos.

## Gate 3 — LOCAL INTEGRATION READY
Pasa integración cuando:
- contratos reales entre módulos coinciden;
- flujo E2E local funciona;
- no existen atajos que violen aislamiento, idempotencia o autoridad PostgreSQL;
- reinicios de API/worker no pierden estado durable;
- fake PT sigue siendo reemplazable por adapter real.

## Gate 4 — LOCAL PLATFORM READY
Pasa plataforma local cuando un checkout limpio puede:
- preparar dependencias;
- levantar contenedores/servicios locales;
- migrar DB;
- compilar;
- ejecutar lint/unit/integration;
- ejecutar pruebas seleccionadas en self-hosted runner;
- guardar evidencia de ejecución;
- apagarse y volver a levantarse reproduciblemente.

## Gate 5 — EXTERNAL INTEGRATION READY
Pasa cuando las integraciones externas autorizadas han sido verificadas con evidencia real:
- contrato/capacidad PT confirmados;
- sandbox PT operativo;
- credenciales almacenadas de forma segura;
- errores, límites y reconciliación probados;
- ningún comportamiento se inventa.

## Gate 6 — HARDENING READY
Debe demostrar:
- aislamiento multitenant;
- cero duplicados en pruebas de idempotencia/concurrencia;
- `UNKNOWN` no provoca reenvío ciego;
- seguridad/pentest aplicable;
- backup y restore ejecutados;
- observabilidad y alertas;
- fallos de API/worker/DB/PT simulados;
- rollback probado.

## Gate 7 — CAPACITY READY
No se obtiene por estimación. Requiere benchmark reproducible con configuración exacta.

Objetivo inicial del producto:
- hasta ~3 M docs/mes como envelope comercial propuesto;
- ~50 docs/s burst comercial propuesto;
- prueba por encima del límite vendido;
- API local acceptance p95 objetivo <500 ms;
- error de plataforma <0,1%;
- duplicados = 0;
- cross-tenant = 0;
- DB sostenida objetivo <70%;
- backlog recuperable según criterio documentado;
- costo por 1.000 docs medido.

Hasta ejecutar el benchmark, el estado es `CAPACITY READY: BLOCKED`.

## Gate 8 — ONE-PERSON OPERATIONS READY
Debe demostrarse que una sola persona puede operar la primera etapa sin trabajo manual cotidiano excesivo.

Medir al menos:
- incidentes/mes;
- intervenciones manuales;
- tickets/cliente;
- tiempo de mantenimiento regulatorio;
- escalaciones PT;
- expiraciones/configuración fiscal;
- tiempo de deploy/rollback;
- tiempo de restore;
- alertas accionables vs ruido.

El límite real del producto es el menor entre capacidad técnica, capacidad PT/DIAN y capacidad operativa humana.

## Gate 9 — PILOT READY
- gates anteriores PASS;
- PT/DIAN aplicables PASS;
- soporte/runbooks preparados;
- costos conocidos;
- owner autoriza clientes reales.

## Gate 10 — PRODUCTION READY
Solo PASS cuando:
- piloto controlado exitoso;
- regulatory diff actualizado;
- seguridad/capacidad/restore PASS;
- operación por una sola persona validada dentro del envelope inicial;
- owner autoriza explícitamente producción.
