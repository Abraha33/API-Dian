# Contexto de sesión — API-DIAN

**Corte:** 2026-08-19  
**Rama consolidada:** `dev`

## 1. Autoridades vigentes

### Producto — FROZEN

- `docs/PRODUCT-DEFINITION-V1-FINAL.md`

Define **qué** se construye.

### Arquitectura — FROZEN

- `docs/SYSTEM-ARCHITECTURE-V1.md`

Define **cómo** se construye V1.

Si una implementación existente contradice estos documentos, la implementación se revisa. Si arquitectura y producto chocan, prevalece el producto.

## 2. Estado de planificación

```text
PRODUCT-DEFINITION-V1-FINAL.md   ✅ FROZEN
SYSTEM-ARCHITECTURE-V1.md        ✅ FROZEN
BUILD-PLAN-V1.md                 ▶ SIGUIENTE
Backlog detallado                ⏸
Mapa de dependencias             ⏸
Definition of Done               ⏸
Plan diario                      ⏸
Nueva implementación             ⏸
```

Regla vigente:

```text
producto
→ arquitectura
→ build plan
→ backlog + dependencias + DoD
→ plan diario
→ auditoría del código existente
→ implementación controlada
```

No continuar agregando runtime por inercia antes de completar esta secuencia.

## 3. Producto V1

```text
POS propio
→ API-DIAN
→ 1 Proveedor Tecnológico habilitado
→ DIAN
```

- mercado inicial: comercios colombianos;
- consumidor técnico inicial: POS propio;
- no API pública V1;
- multiempresa;
- un solo PT;
- no DIAN directa;
- no ser PT inicialmente;
- no forks por cliente.

Alcance fiscal:

- FEV;
- Nota Crédito;
- Nota Débito;
- DEE POS;
- Nota de ajuste DEE POS;
- contingencias indispensables;
- estado;
- XML;
- PDF/representación del PT;
- trazabilidad y protección contra duplicados.

Invariante superior:

```text
DESCONOCIDO != REEMITIR
```

## 4. Arquitectura V1 congelada

```text
POS
 ↓
API runtime
 ↓
PostgreSQL administrado  ← autoridad transaccional
 ↑
Worker runtime ─────────────▶ 1 PT
 │
 └──────────────────────────▶ Object storage privado
```

Decisiones:

- monolito modular;
- mismo artefacto con roles `api` y `worker`;
- Node.js 24 LTS + TypeScript estricto + NestJS/Fastify;
- PostgreSQL como única autoridad interna;
- `pg`/SQL parametrizado explícito en camino fiscal crítico;
- trabajo durable PostgreSQL; sin Redis/BullMQ productivo;
- solo worker inicia mutaciones PT;
- `provider_attempt` persistido antes del side effect;
- `UNKNOWN → reconcile`; no retry ciego;
- tenant derivado de credential + tenant-safe FK + RLS;
- roles DB separados y least privilege;
- API sin secreto PT;
- evidencia/auditoría append-only;
- object storage privado solo para artefactos/evidencia grande;
- kill switches persistidos/auditables;
- observabilidad administrada y pocas alertas accionables;
- no microservicios/Kubernetes/brokers/multi-región/multi-PT V1.

Aclaración nueva de arquitectura:

**perfil/configuración fiscal versionada por tenant**. Cada operación debe poder reconstruir qué configuración fiscal/emisor/provider binding utilizó históricamente; cambiar configuración futura no reinterpreta operaciones anteriores.

Proveedor cloud productivo exacto **no está congelado**. Se escogerá por seguridad, restore, coste y operación.

## 5. Contrato interno V1

Superficie mínima:

```text
POST /v1/fiscal-operations
GET  /v1/fiscal-operations/{operation_id}
GET  /v1/fiscal-operations/{operation_id}/artifacts/xml
GET  /v1/fiscal-operations/{operation_id}/artifacts/pdf
```

Mutaciones requieren `Idempotency-Key`.

Tipos:

```text
FEV
CREDIT_NOTE
DEBIT_NOTE
ELECTRONIC_POS
POS_ADJUSTMENT
```

`FiscalProvider` mínimo:

```text
submit()
reconcile()
getStatus()
fetchXml()
fetchPdf()
```

No existe `resend()`.

## 6. Protocolo fiscal crítico

```text
persist intent
→ durable work
→ prepare provider_attempt
→ COMMIT
→ remote side effect
→ definitive? persist result
→ ambiguous? UNKNOWN
→ reconcile
```

No existe transición automática:

```text
UNKNOWN → SUBMITTING
```

Solo evidencia concluyente de que no ocurrió side effect puede permitir evaluar otro intento.

## 7. Código existente

Existe implementación adelantada con:

- core SQL;
- auth/tenancy/RLS;
- idempotencia;
- worker/leases;
- FakeFiscalProvider;
- UNKNOWN/reconcile;
- kill switches;
- observabilidad;
- concurrencia;
- contract-test harness PT.

**No es autoridad.** En la fase de build plan/auditoría cada pieza se clasificará:

```text
CONSERVAR
ADAPTAR
REHACER
ELIMINAR
```

La arquitectura ya anticipa que buena parte del núcleo probablemente se conservará, pero no se declara “terminado” hasta mapearlo contra el plan de construcción definitivo.

## 8. Gate PT posterior

Orden de prueba actualmente documentado:

```text
1. HKA
2. DATAICO
3. Facture / ESTELA
```

No es selección final.

El adapter real exige sandbox/contrato y evidencia de:

- FEV + POS + notas/ajuste;
- auth/correlación;
- timeout ambiguo;
- reconcile;
- duplicados;
- criterio seguro de inexistencia;
- XML/PDF;
- firma/certificado;
- seguridad/datos;
- SLA/soporte/rate limits;
- coste/modelo multiempresa.

Un 404 o un estado llamado “no enviado” no equivale por sí mismo a prueba segura para reemitir.

## 9. Fuentes técnicas de detalle

Consultar solo cuando la tarea lo requiera:

- `docs/v1-requisitos.md`;
- `ADR/ADR-003-arquitectura-v1-monolito-postgres.md`;
- `ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md`;
- `ADR/ADR-005-modelo-datos-tenancy-v1.md`;
- `ADR/ADR-006-seguridad-auth-threat-model-v1.md`;
- `ADR/ADR-007-contratos-internos-idempotencia-v1.md`;
- `ADR/ADR-008-seleccion-pt-gates-v1.md`;
- `ADR/ADR-009-pruebas-fault-injection-kill-switch-v1.md`;
- `docs/f3-modelo-datos-v1.md`;
- `docs/f3-threat-model-v1.md`;
- `docs/f4-contrato-pos-api-v1.md`;
- `docs/f4-prueba-ambiguedad-pt-v1.md`;
- `docs/f6-provider-contract-harness.md`.

No cargar todos estos documentos automáticamente: `session-context.md` + el entregable de la fase actual deben ser suficientes para empezar, y se profundiza solo bajo necesidad. Esto reduce contexto y coste de agentes.

## 10. Siguiente avance oficial

Crear:

```text
docs/BUILD-PLAN-V1.md
```

Debe convertir producto + arquitectura en fases de construcción ordenadas por dependencias, sin programar todavía.

Después se generarán backlog, dependencias, DoD y plan diario antes de reanudar código.
