# API-DIAN

API fiscal interna para comercio colombiano.

## Estado del proyecto

**Fecha de corte:** 2026-08-18

- Baseline de producto: **cerrado**.
- Requisitos V1: **cerrados para arquitectura**.
- Arquitectura F2: **cerrada para F3**.
- Siguiente fase: **F3 — modelo de datos + seguridad/amenazas**.
- Rama: `dev`.

Fuentes maestras:

- [`docs/f0-producto-v1-validado-2026-08-18.md`](./docs/f0-producto-v1-validado-2026-08-18.md)
- [`docs/v1-requisitos.md`](./docs/v1-requisitos.md)
- [`ADR/ADR-003-arquitectura-v1-monolito-postgres.md`](./ADR/ADR-003-arquitectura-v1-monolito-postgres.md)
- [`ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md`](./ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md)
- [`ROADMAP.md`](./ROADMAP.md)

Los documentos anteriores sobre “modelo experimental” y “fogueo de mercado” son evidencia histórica; no gobiernan V1.

## Producto V1

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

La API es reutilizable e independiente del POS, pero no es una API pública comercial en V1.

Regla crítica:

```text
DESCONOCIDO != REEMITIR
```

## Arquitectura V1

```text
POS
 ↓
API — rol HTTP del monolito
 ↓
PostgreSQL administrado — autoridad transaccional
 ↑
Worker — mismo código/artefacto
 ↓
FiscalProvider → 1 PT habilitado

Object storage → XML/PDF/evidencia binaria; nunca estado de workflow
```

Decisiones F2:

- monolito modular;
- TypeScript/NestJS/Fastify;
- Node.js 24 LTS como runtime al implementar;
- PostgreSQL como única autoridad de estado;
- trabajo async durable en PostgreSQL;
- sin Redis/BullMQ productivo en V1;
- sin microservicios/Kubernetes/broker;
- solo el worker puede ejecutar mutaciones del PT;
- API HTTP persiste y devuelve identidad/estado de operación;
- timeout ambiguo → `UNKNOWN` → reconciliación;
- object storage y observabilidad administrados/minimalistas.

Detalles: ADR-003 y ADR-004.

## Alcance fiscal V1

- Factura Electrónica de Venta;
- Nota Crédito;
- Nota Débito;
- Documento Equivalente Electrónico POS;
- nota de ajuste DEE POS;
- contingencias necesarias FEV/DEE POS;
- estado/seguimiento;
- XML validado;
- PDF/representación del PT.

Fuera: API/SDK/webhooks públicos, Documento Soporte, recepción/eventos, nómina, RADIAN, RIPS, RNDC, multi-PT, DIAN directa, PDF propio, ERP/CRM/contabilidad y forks.

## Roadmap

| Fase | Estado | Objetivo |
|---|---|---|
| F0 | ✅ | Producto/validación |
| F1 | ✅ | Requisitos V1 |
| F2 | ✅ | Arquitectura formal/ADR |
| F3 | ▶ | Datos + seguridad/threat model |
| F4 | ⏸ | Contratos + selección PT |
| F5 | ⏸ | Pruebas/contingencia/operación |
| F6 | ⏸ | Implementación incremental |
| F7 | ⏸ | Readiness/piloto POS |
| F8 | ⏸ | Estabilización/V1.1 |

Detalle: [`ROADMAP.md`](./ROADMAP.md).

## ADR

- ADR-001 y ADR-002: históricos/supersedidos para V1.
- ADR-003: arquitectura/topología autoritativa.
- ADR-004: idempotencia, side effect y reconciliación autoritativos.

## Setup local existente

La base actual vive en `apps/api/`. La infraestructura histórica del compose puede contener Redis/MinIO; su existencia no significa que formen parte de producción V1.

```bash
git clone https://github.com/Abraha33/API-Dian.git
cd API-Dian
git checkout dev
cd apps/api
cp .env.example .env
npm ci
npm run build
npm run start:dev
```

Health:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

Pruebas:

```bash
npm run test:e2e
```

## Criterio de construcción

Toda pieza de infraestructura debe trazarse a `docs/v1-requisitos.md` y a un ADR vigente.

No construir lógica fiscal real contra un PT antes de cerrar F3 y F4. En un sistema fiscal operado por una sola persona, menos componentes y estados explícitos valen más que flexibilidad futura especulativa.
