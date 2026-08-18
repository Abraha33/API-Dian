# API-DIAN

API fiscal interna para comercio colombiano.

## Estado del proyecto

**Fecha de corte:** 2026-08-18

- Baseline de producto: **cerrado**.
- Requisitos V1: **cerrados para arquitectura**.
- Siguiente fase: **F2 — arquitectura formal y ADR**.
- Rama de trabajo: `dev`.

Fuentes maestras:

- [`docs/f0-producto-v1-validado-2026-08-18.md`](./docs/f0-producto-v1-validado-2026-08-18.md)
- [`docs/v1-requisitos.md`](./docs/v1-requisitos.md)
- [`docs/f0-reconciliacion-roadmap-adr-2026-08-18.md`](./docs/f0-reconciliacion-roadmap-adr-2026-08-18.md)
- [`ROADMAP.md`](./ROADMAP.md)

Los documentos anteriores sobre “modelo experimental” y “fogueo de mercado” se conservan como evidencia histórica; no gobiernan ya el alcance V1.

## Producto V1

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

La API debe ser reutilizable e independiente del POS, pero **no será una API pública comercial en V1**.

Principios:

- una sola persona desarrolla, mantiene y opera inicialmente;
- un solo PT habilitado;
- sin integración directa con DIAN;
- sin segundo PT/failover;
- sin custodia propia de certificados si el PT permite delegarla contractual y seguramente;
- idempotencia, evidencia, reconciliación, aislamiento y observabilidad son núcleo, no extras;
- no personalizaciones/forks por cliente.

Regla crítica:

```text
DESCONOCIDO != REEMITIR
```

## Alcance fiscal V1

- Factura Electrónica de Venta.
- Nota Crédito.
- Nota Débito.
- Documento Equivalente Electrónico POS.
- Nota de ajuste DEE POS.
- contingencias necesarias de FEV y DEE POS.
- consulta/seguimiento de estado.
- recuperación de XML validado.
- recuperación de PDF/representación gráfica entregada por el PT.

Fuera de V1: API/SDK/webhooks públicos, Documento Soporte, recepción/eventos, nómina, RADIAN, RIPS, RNDC, otros DEE sectoriales, multi-PT, DIAN directa, PDF propio, ERP, contabilidad, CRM y forks.

## Roadmap vigente

| Fase | Estado | Objetivo |
|---|---|---|
| F0 | ✅ | Baseline de producto y validación |
| F1 | ✅ | Requisitos V1 |
| F2 | ▶ | Arquitectura formal y ADR |
| F3 | ⏸ | Modelo de datos + seguridad/amenazas |
| F4 | ⏸ | Contratos internos + selección PT |
| F5 | ⏸ | Pruebas, contingencia y operación |
| F6 | ⏸ | Implementación incremental |
| F7 | ⏸ | Readiness + piloto controlado con POS |
| F8 | ⏸ | Estabilización + decisión V1.1 |

Detalle: [`ROADMAP.md`](./ROADMAP.md).

## ADR existentes

Los ADR de abril se mantienen como registro histórico y candidatos técnicos, pero deben revalidarse contra los requisitos V1 antes de expandir la implementación:

- [`ADR/ADR-001-stack-tecnologico.md`](./ADR/ADR-001-stack-tecnologico.md)
- [`ADR/ADR-002-estructura-modulos.md`](./ADR/ADR-002-estructura-modulos.md)

En particular, Redis/BullMQ, auth para integradores, panel y la estructura histórica de `emission/webhooks` **no quedan aprobados por inercia**.

## Setup local existente

La aplicación base vive en `apps/api/` y usa actualmente NestJS/Fastify. La existencia de una dependencia en el repositorio no significa que haya sido ratificada para la arquitectura V1 final.

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

Health/readiness esperados en desarrollo:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

Pruebas e2e:

```bash
npm run test:e2e
```

Infra local histórica:

```bash
docker compose -f docker-compose.dev.yml up -d
```

No usar el compose actual como evidencia de la topología productiva final; esa decisión corresponde a F2.

## Flujo de trabajo

El flujo general permanece en [`docs/workflow.md`](./docs/workflow.md): issue trazable, rama de trabajo cuando corresponda, cambio acotado, pruebas/evidencia, PR y merge a `dev`.

## Criterio de arquitectura

Toda pieza de infraestructura debe trazarse a un requisito de [`docs/v1-requisitos.md`](./docs/v1-requisitos.md).

Para V1 se favorece una arquitectura austera y administrada, con una fuente transaccional clara y mínima carga operativa. Microservicios, brokers complejos, multi-PT y capas públicas no se introducen como preparación especulativa para un futuro que todavía no existe.