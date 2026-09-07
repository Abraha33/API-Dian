# GOAL — API-DIAN V1 — Construcción local modular y validable

## MISIÓN

Continuar y construir de forma autónoma API-DIAN V1 a partir del producto y arquitectura canónicos ya aprobados, utilizando el plan oficial de construcción modular y priorizando ejecución local reproducible, pruebas verificables y operabilidad por una sola persona.

No reabrir decisiones de producto o arquitectura ya cerradas salvo contradicción técnica/regulatoria demostrable.

No detener el trabajo para pedir aprobaciones intermedias por decisiones locales, reversibles y dentro del alcance. Solo detenerse ante un bloqueo externo real o una acción que requiera autorización explícita del owner.

---

## REPOSITORIO Y RAMAS

Repositorio:
`Abraha33/API-Dian`

Base arquitectónica protegida de trabajo conceptual:
`draft/architecture-product-v1`

Plan oficial de construcción:
`draft/official-construction-plan-v1`

No modificar `dev` directamente.

Antes de implementar:
1. verificar estado del repositorio;
2. leer la documentación canónica indicada abajo;
3. confirmar que se parte del plan oficial vigente;
4. crear/usar una branch de implementación local derivada de `draft/official-construction-plan-v1`, preferiblemente `build/v1-local`, sin reescribir historia ni modificar ramas protegidas.

---

## LEER PRIMERO — ORDEN DE AUTORIDAD

1. `GOAL.md`
2. `docs/construction-v1/README.md`
3. `docs/construction-v1/OFFICIAL-CONSTRUCTION-PLAN.md`
4. `docs/construction-v1/MINI-PROJECTS.md`
5. `docs/construction-v1/STAGES-AND-GATES.md`
6. `docs/construction-v1/LOCAL-RUNNER-AND-CI.md`
7. `docs/PROJECT-CONSOLIDATED-PLAN.md`
8. `docs/architecture/final/`
9. `docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md`
10. `docs/service-catalog/RELEASE-ROADMAP.md`
11. `docs/checkpoints/2026-09-07-DAWN-CHECKPOINT.md`
12. ADR canónicos vigentes.

Documentos antiguos que contradigan la API pública multitenant o mantengan enfoque POS-first/interno están supersedidos.

---

## PRODUCTO CANÓNICO

API-DIAN V1 es una API fiscal pública multitenant para software de terceros en Colombia.

Clientes posibles desde V1:
- POS;
- ERP;
- software administrativo/contable;
- SaaS;
- integradores;
- plataformas verticales;
- nuestro propio POS como un cliente más.

Contrato público:
- HTTP REST/resource-oriented;
- JSON;
- OpenAPI 3.1;
- procesamiento fiscal asíncrono;
- `202 Accepted` tras aceptación local durable cuando corresponda.

No exponer SOAP ni contratos propietarios de PT. Si un PT necesita SOAP/XML, eso vive detrás del adapter.

---

## RESTRICCIONES NO NEGOCIABLES

- PostgreSQL es autoridad.
- `UNKNOWN != REEMITIR`.
- ninguna incertidumbre después de posible envío autoriza retry ciego.
- multitenancy: tenant + organization + application + environment.
- aislamiento cross-tenant debe ser deny-by-default.
- API secret se muestra una vez y se almacena de forma segura como hash/pepper según diseño.
- sandbox y producción no comparten DB, bucket, llaves ni credenciales.
- provider-neutral desde el núcleo.
- un PT inicial eventualmente, pero selección PT sigue `DEFERRED BY OWNER`.
- Factus es benchmark de cobertura, no dependencia ni PT.
- primera etapa comercial debe ser operable por una sola persona.
- objetivo de capacidad inicial: ~3 M docs/mes y ~50 docs/s burst comercial; NO declarar capacidad hasta benchmark reproducible.
- 30 M/300 M son escenarios futuros de evolución, no promesa one-person.

---

## MODELO DE CONSTRUCCIÓN

El orden de aprendizaje NO es el mismo que el orden de integración.

Cada mini-proyecto debe poder conceptualizarse y probarse de forma aislada mediante mocks/fakes. No bloquear un módulo porque otro todavía no exista.

Mini-proyectos oficiales:

- MP01 — Contrato API pública
- MP02 — Modelo de datos PostgreSQL
- MP03 — Multitenancy e identidad organizacional
- MP04 — Seguridad y credenciales
- MP05 — Núcleo fiscal
- MP06 — Idempotencia, estados y reconciliación
- MP07 — Outbox, cola y workers
- MP08 — Puerto/adaptador PT
- MP09 — Webhooks, artefactos y auditoría
- MP10 — Metering, cuotas y primitivas comerciales
- MP11 — Contingencias y observabilidad
- MP12 — Capacidad y performance

---

## FASE 1 — CONCEPTUALIZACIÓN MODULAR

Antes de construir comportamiento significativo de cada módulo, dejar explícito y consistente:
- problema/responsabilidad;
- entradas/salidas;
- estados;
- entidades/datos;
- contratos;
- invariantes;
- errores/fallos;
- mocks/fakes necesarios;
- criterios PASS.

No introducir infraestructura, Actions o integraciones externas solo porque puedan ser útiles más adelante.

Gate requerido por módulo:
`CONCEPT READY: PASS`.

---

## FASE 2 — TESTEO AISLADO

Para cada módulo conceptualizado, crear evidencia ejecutable aislada usando lo mínimo necesario:
- fixtures y datos sintéticos;
- mocks/fakes;
- PostgreSQL local si el módulo lo necesita;
- unit tests;
- integration/component tests locales;
- concurrency tests cuando aplique;
- fault injection cuando aplique.

Cada módulo debe probar:
- happy path;
- datos inválidos;
- permisos/aislamiento cuando corresponda;
- concurrencia cuando corresponda;
- reinicio/fallo cuando corresponda;
- invariantes críticos.

Gate requerido:
`ISOLATED TEST READY: PASS`.

---

## FASE 3 — IMPLEMENTACIÓN E INTEGRACIÓN LOCAL

Integrar únicamente módulos que hayan pasado sus gates aislados, construyendo el flujo:

```text
cliente local
  → API
  → validación/reglas/idempotencia
  → PostgreSQL + outbox
  → worker
  → FakeFiscalProvider
  → estado/evidencia
  → webhook local
```

No hacer llamadas remotas dentro de transacciones SQL.
No introducir retry transparente de mutaciones remotas.
Workers deben usar patrón durable/lease definido por arquitectura.

Gate:
`LOCAL INTEGRATION READY: PASS`.

---

## FASE 4 — PLATAFORMA LOCAL REPRODUCIBLE

El owner dispone de self-hosted runner local. Utilizarlo cuando esta fase sea alcanzada.

Consolidar:
- Docker/containers necesarios;
- Docker Compose/local orchestration;
- PostgreSQL local reproducible;
- API y worker separados;
- FakeFiscalProvider;
- fake webhook receiver si aporta valor;
- migraciones;
- lint/typecheck/build;
- unit/integration/contract tests;
- GitHub Actions ejecutadas en self-hosted runner según estrategia canónica;
- reportes/artefactos de evidencia.

Workflows previstos cuando sean justificados:
- `ci.yml`;
- `integration.yml`;
- `failure-tests.yml`;
- `capacity-local.yml` manual/dedicado;
- `security.yml`.

No convertir cada benchmark pesado en un workflow por commit.

Gate:
`LOCAL PLATFORM READY: PASS`.

---

## FASE 5 — INTEGRACIONES EXTERNAS

NO ejecutar automáticamente acciones externas que requieran decisión/credenciales/gasto.

PT real:
- sigue deferred;
- mantener `FakeFiscalProvider` y adapter neutral;
- no inventar contrato PT;
- cuando el owner seleccione PT, crear adapter basado en evidencia contractual/sandbox real.

Cloud real:
- Google Cloud es referencia arquitectónica;
- Terraform será IaC;
- no provisionar recursos con costo sin autorización explícita.

DIAN/habilitación:
- ejecutar solo cuando existan prerrequisitos y autorización aplicable.

Si esta fase queda bloqueada externamente, documentar el blocker y continuar cualquier trabajo local independiente que siga siendo válido.

---

## FASE 6 — HARDENING, RECUPERACIÓN Y CAPACIDAD

Construir y ejecutar pruebas de:
- idempotencia bajo concurrencia;
- aislamiento tenant/org/environment;
- timeout tras posible envío;
- PT 429/5xx/caído;
- respuestas inconsistentes;
- API restart;
- worker crash;
- lease recovery;
- DB temporalmente no disponible;
- backlog/queue recovery;
- object storage failure cuando exista;
- webhook failures;
- backup + restore;
- rollback;
- seguridad;
- observabilidad/alertas;
- costo.

### CAPACITY READY

No afirmar capacidad por arquitectura.

Crear benchmark reproducible con configuración exacta y registrar:
- commit;
- CPU/RAM;
- DB/configuración;
- workers;
- conexiones/pools;
- dataset;
- requests/s;
- docs/s;
- p50/p95/p99;
- error rate;
- DB utilization;
- queue age/backlog;
- costo/1.000 docs;
- primer punto de saturación.

Objetivo comercial inicial a demostrar:
- hasta ~3 M docs/mes;
- ~50 docs/s burst.

Para vender 50 docs/s, probar de forma segura significativamente por encima y fijar margen conservador.

Criterios iniciales de referencia:
- local acceptance API p95 <500 ms;
- platform error <0,1%;
- duplicados = 0;
- cross-tenant = 0;
- DB sostenida objetivo <70%;
- backlog recuperable dentro del criterio documentado.

Hasta ejecutar las pruebas:
`CAPACITY READY: BLOCKED`.

---

## FASE 7 — PILOTO

No iniciar sin autorización explícita del owner.

Secuencia conservadora:
1 → 3 → 5 → 10 clientes.

Medir además de tráfico:
- tickets;
- incidentes;
- intervenciones manuales;
- escalaciones PT;
- mantenimiento regulatorio;
- tiempo operativo;
- costos reales.

Objetivo:
`ONE-PERSON OPERATIONS READY: PASS` antes de crecimiento relevante.

---

## FASE 8 — PRODUCCIÓN

No ejecutar producción automáticamente.

Requiere:
- todos los gates aplicables PASS;
- PT/DIAN aplicable listo;
- pentest;
- restore probado;
- capacity PASS;
- regulatory diff reciente;
- piloto exitoso;
- owner autoriza explícitamente `GO TO PRODUCTION`.

---

## REGLAS DE EJECUCIÓN PARA CODEX

1. Trabajar de forma autónoma dentro del alcance local/reversible.
2. No pedir aprobación para cada archivo, test o refactor seguro.
3. Antes de modificar, leer autoridad relevante.
4. Hacer cambios pequeños y verificables.
5. Ejecutar pruebas tras cambios.
6. No declarar PASS sin evidencia.
7. No ocultar fallos ni convertirlos en supuestos.
8. Si aparece contradicción, preservar invariantes fiscales y documentarla.
9. No usar secretos reales ni escribirlos en repo/logs.
10. No hacer gasto cloud, contratar PT, usar credenciales reales, pilotar ni desplegar prod sin autorización.
11. Mantener documentación y estado actualizados al cerrar cada módulo/fase.
12. Guardar evidencia suficiente para que otro agente/chat continúe sin depender del contexto conversacional.

---

## RESULTADO ESPERADO

Dejar API-DIAN V1 en el máximo estado alcanzable localmente, con:
- módulos conceptualizados;
- pruebas aisladas reproducibles;
- integración local segura;
- runner/CI/containers reproducibles;
- FakeFiscalProvider completo para escenarios conocidos/desconocidos;
- documentación y gates actualizados;
- evidencia de capacidad cuando sea técnicamente ejecutable;
- lista explícita de únicos bloqueos externos restantes.

No considerar el proyecto `PRODUCTION READY` hasta completar las fases externas, hardening, piloto y autorización del owner.
