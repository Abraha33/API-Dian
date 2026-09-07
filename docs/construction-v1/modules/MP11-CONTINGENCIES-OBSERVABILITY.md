# MP11 — Contingencias y observabilidad

## Pregunta
¿Cómo sabemos qué está fallando, cómo reaccionamos y cómo recuperamos el sistema sin improvisar?

## Fase 1 — Conceptualización
Definir:
- catálogo de fallos: DIAN/PT/API/worker/DB/storage/webhook/certificado/numeración;
- logs estructurados sin secretos;
- métricas;
- trazas/correlation IDs;
- alertas accionables;
- runbooks;
- circuit breakers/backpressure/kill switches;
- workflows de contingencia fiscal aplicables;
- evidencia preservada para investigación.

Invariantes:
- ningún fallo ambiguo se resuelve inventando resultado;
- alertas deben ayudar a una sola persona, no crear ruido constante;
- logs nunca exponen secretos o payloads sensibles innecesarios;
- cada incidente conocido importante debe poder convertirse en prueba de regresión.

Dependencias simulables: PT/DIAN/DB/webhook falsos y fault injection local.

## Fase 2 — Testeo aislado
Simular:
- PT 429/5xx/timeout;
- timeout después de posible envío;
- worker crash;
- DB temporalmente no disponible;
- cola/backlog;
- webhook caído;
- certificado/numeración inválidos;
- alertas disparadas y recuperadas;
- runbook ejecutable.

**Gate:** fallos críticos son detectables, explicables y tienen una ruta segura de recuperación.

## Integración posterior
Cruza MP06/MP07/MP08/MP09 y alimenta hardening, piloto y operación one-person.
