# MP12 — Capacidad y performance

## Pregunta
¿Cómo demostramos cuánto soporta realmente una configuración concreta antes de vender esa capacidad?

## Fase 1 — Conceptualización
Definir:
- workload representativo;
- mezcla create/status/artifacts;
- tamaño de payloads;
- hot tenant;
- bursts;
- soak/endurance;
- datasets de 1 M / 3 M / 5 M+ documentos;
- métricas API/DB/workers/queue;
- primer punto de saturación;
- margen comercial por debajo de capacidad medida;
- costo por 1.000 documentos;
- diferencia entre capacidad técnica, PT/DIAN y capacidad operativa de una persona.

Objetivo inicial NO certificado:
- ~3 M docs/mes;
- ~50 docs/s burst comercial.

## Fase 2 — Testeo aislado
Con tráfico sintético/fake PT:
- 10/s → 25/s → 50/s → continuar hasta degradación controlada;
- bursts 1/5/15 min;
- soak test;
- provider latency/429/5xx/timeouts;
- backlog y drain;
- DB connections/CPU/IOPS/locks;
- API p50/p95/p99;
- duplicados/cross-tenant;
- costo y configuración exacta.

Criterios iniciales de referencia:
- local acceptance p95 <500 ms;
- platform errors <0,1%;
- duplicados = 0;
- cross-tenant = 0;
- DB sostenida objetivo <70%;
- backlog recuperable dentro del criterio documentado.

**Gate:** `CAPACITY READY` solo después de benchmark reproducible. Arquitectura o estimaciones no cuentan como evidencia.

## Integración posterior
Repetir benchmark del sistema integrado y, después, con límites reales de PT/sandbox autorizados. El límite comercial será conservador respecto al menor cuello de botella medido.
