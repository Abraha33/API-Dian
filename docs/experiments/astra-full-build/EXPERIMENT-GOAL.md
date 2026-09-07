# GOAL — Experimento Astra Full API-DIAN V1

## Misión

Llevar API-DIAN V1 al máximo estado local demostrable de forma autónoma usando un agente avanzado y un proceso spec-driven, evidence-driven y loop-driven, sin afectar ramas canónicas ni ejecutar integraciones externas sin autorización.

## Branch obligatoria

Trabajar exclusivamente sobre:

`experiment/astra-full-api-dian-v1`

No modificar ni mover:

- `dev`;
- `draft/architecture-product-v1`;
- `draft/official-construction-plan-v1`.

No hacer force-push sobre ramas canónicas.

## Autoridad

Leer primero:

1. `docs/experiments/astra-full-build/README.md`
2. `docs/experiments/astra-full-build/STUDENT-CONTROL-BOARD.md`
3. `docs/experiments/astra-full-build/EVIDENCE-RULES.md`
4. `docs/experiments/astra-full-build/status.json`
5. `GOAL.md`
6. `docs/construction-v1/`
7. `docs/architecture/final/`
8. `docs/service-catalog/`
9. checkpoints canónicos vigentes.

Las decisiones canónicas no se reabren salvo contradicción demostrable.

## Forma de trabajo

Usar este loop:

```text
leer spec
→ identificar requisito/gate
→ implementar cambio mínimo
→ ejecutar verificadores
→ revisar evidencia
→ si falla: diagnosticar/corregir/repetir
→ si pasa: registrar evidencia
→ actualizar tablero/status
→ siguiente requisito
```

No avanzar una fase completa basándose únicamente en que “el código está escrito”.

## Supervisión del owner

El owner es estudiante. Toda actualización de fase debe tener dos capas:

### Capa 1 — lenguaje sencillo

- qué intentábamos hacer;
- qué ya funciona;
- qué falló;
- qué falta;
- si es seguro avanzar.

### Capa 2 — evidencia técnica

- commit;
- comando;
- tests;
- métricas;
- logs/artefactos;
- limitaciones.

Actualizar siempre:

- `STUDENT-CONTROL-BOARD.md`;
- `status.json`;
- evidencia de la fase.

## Fases

### 0 — Aislamiento + harness

Cerrar el laboratorio experimental, reglas, loops, verificadores y tracking.

### 1 — Conceptualización ejecutable

Convertir arquitectura/producto en especificaciones ejecutables y trazables.

Debe existir trazabilidad:

`requisito → spec → implementación objetivo → prueba`.

### 2 — Testeo y aceptación

Definir/implementar tests que demuestran invariantes y comportamientos antes de declarar componentes cerrados.

### 3 — Construcción local V1

Construir la API pública multitenant completa localmente según V1.

### 4 — Integración E2E local

Conectar todo el flujo con `FakeFiscalProvider` y dependencias locales controladas.

### 5 — Runner + containers + CI

Hacer reproducible checkout → install → DB → migrate → build → test usando runner local y Actions apropiadas.

### 6 — Fallos + seguridad + recuperación + capacidad

Atacar el sistema, ejecutar restore y encontrar capacidad/saturación mediante benchmark reproducible.

### 7 — READY FOR PT INTEGRATION

Solo cerrar cuando 0–6 estén PASS.

Al cerrar esta fase, detener integración externa automática y entregar al owner un mensaje claro:

`LISTO PARA INTEGRAR PT`.

Ese mensaje debe incluir exactamente:

- qué acceso se necesita;
- qué documentación del PT se necesita;
- qué credenciales/sandbox se necesitan;
- qué preguntas contractuales/técnicas siguen abiertas;
- qué tests se ejecutarán al conectar el PT.

### 8 — PT real

No empezar sin autorización del owner.

Supuesto provisional: el owner se refiere a **The Factory HKA Colombia S.A.S.**.

No confundir este supuesto con una contratación definitiva.

### 9 — DIAN/PT real + piloto

No ejecutar automáticamente.

### 10 — Production readiness

No declarar PASS sin todos los gates, evidencia externa y autorización del owner.

## Invariantes críticos

- API pública REST/JSON/OpenAPI 3.1.
- PostgreSQL es autoridad.
- API y worker separados.
- trabajo durable/outbox.
- provider-neutral.
- tenant + organization + application + environment.
- cross-tenant = 0.
- duplicados = 0 bajo los escenarios de prueba definidos.
- `UNKNOWN != REEMITIR`.
- no retry ciego tras posible envío.
- no llamada remota dentro de transacción SQL.
- secretos no se exponen ni versionan.
- capacidad se mide; no se inventa.

## Condición de éxito local

El experimento local alcanza su primer gran éxito cuando:

`READY FOR PT INTEGRATION: PASS`

Eso significa que todo lo demostrable sin proveedor real fue construido y probado con evidencia.

No significa todavía `PRODUCTION READY`.
