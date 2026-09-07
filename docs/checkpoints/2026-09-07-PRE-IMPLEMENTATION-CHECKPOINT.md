# API-DIAN — Checkpoint pre-implementación — 2026-09-07

> **Branch canónica:** `draft/architecture-product-v1`
> **Estado:** PAUSA / HANDOFF READY
> **Arquitectura:** `ARCHITECTURE FINAL: PASS`
> **Producción:** `PRODUCTION READY: BLOCKED`

## 1. Producto definido

El producto es una **API fiscal pública multitenant para Colombia**, consumible por software de terceros desde V1: POS, ERP, SaaS, software administrativo/contable, integradores y nuestro POS futuro.

Desde programación, el producto público es una **API HTTP REST-style/resource-oriented con JSON**, contrato OpenAPI 3.1 y procesamiento asíncrono para el ciclo fiscal. No es una API SOAP. SOAP/XML puede existir únicamente detrás del adaptador si el PT elegido lo requiere.

## 2. Cobertura funcional

### Núcleo comercial definido

- FEV;
- nota crédito;
- nota débito;
- contingencia mínima aplicable;
- estado, XML, PDF y evidencias;
- idempotencia y prevención de duplicados;
- `UNKNOWN != REEMITIR`;
- reconciliación;
- aplicaciones, credenciales, scopes y grants;
- sandbox;
- webhooks;
- cuotas, medición y auditoría;
- emisión/envío hacia ciclo DIAN;
- recepción y eventos del adquirente en V1.2;
- DEE POS, soporte y demás expansiones según roadmap.

### Benchmark comercial

Factus se usa **solo como referencia de cobertura funcional de mercado**. No se usará Factus como dependencia, PT ni infraestructura. El producto propio debe poder llegar a cubrir como mínimo las familias/capacidades fiscales públicas observadas allí, además de nuestras capacidades propias.

Referencia: `docs/product/FACTUS-COVERAGE-BASELINE.md`.

## 3. Sectores no comerciales

Salud, transporte y otros sectores regulados siguen dentro de la visión futura, pero **sus necesidades fiscales concretas NO están cerradas**.

Estado: `PENDING SECTOR RESEARCH`.

Antes de cerrar cada vertical hay que investigar con fuentes oficiales vigentes:

- actores y clientes;
- documentos y eventos;
- autoridades/sistemas externos;
- datos y reglas de validación;
- flujos operativos;
- evidencia/retención;
- dependencias PT;
- seguridad;
- demanda comercial;
- release propuesto.

Referencia: `docs/product/SECTOR-FISCAL-REQUIREMENTS-PENDING.md`.

## 4. PT

La selección del Proveedor Tecnológico está **pospuesta por decisión del owner**.

No reabrir arquitectura por este punto.

Candidatos preliminares estudiados: The Factory HKA, DATAICO y Alegra Proveedor Electrónico. Falta comparar propuestas comerciales reales: precio por volumen, costo por empresa, onboarding, certificados, mínimos, SLA, rate limits, soporte, modelo multiempresa/integrador y condiciones de salida.

Referencia: `docs/provider-selection/PT-SELECTION-DEFERRED.md`.

## 5. Arquitectura canónica

- monolito modular NestJS/Fastify;
- TypeScript / Node.js;
- PostgreSQL como autoridad;
- API y worker separados;
- outbox + cola durable;
- object storage para XML/PDF/evidencias;
- PT detrás de adaptador neutral;
- OpenAPI 3.1;
- seguridad multitenant con tenant + organization + application + environment;
- Google Cloud como infraestructura de referencia;
- Terraform para describir/provisionar esa infraestructura;
- observabilidad con logs, métricas y trazas;
- infraestructura administrada y automatizada para minimizar carga operativa.

Aclaración pedagógica: **Google Cloud es dónde vive el sistema; Terraform/HashiCorp es la herramienta para crear/configurar esa infraestructura como código.**

## 6. Flujo fiscal simplificado

```text
POS / ERP / SaaS
       ↓
Public REST/JSON API
       ↓
validación + reglas + idempotencia
       ↓
PostgreSQL + outbox
       ↓
Worker
       ↓
PT Adapter
       ↓
PT
       ↓
DIAN
       ↓
estado / XML / PDF / evidencia / webhook
```

La API responde normalmente `202 Accepted`; el cliente consulta estado o recibe webhook. Un timeout después de posible envío pasa a `unknown` y reconciliación; nunca implica retry ciego.

## 7. Contingencias principales que la implementación debe cubrir

- DIAN no disponible;
- PT no disponible;
- timeout después de posible envío;
- respuesta incompleta/desconocida de PT/DIAN;
- sistema/Internet del cliente caído;
- solicitud duplicada;
- datos fiscales inválidos;
- API caída;
- worker caído a mitad del proceso;
- PostgreSQL temporalmente no disponible;
- cola atrasada/atascada;
- object storage temporalmente no disponible;
- despliegue defectuoso;
- certificado vencido/próximo a vencer;
- numeración agotada/vencida/mal configurada;
- cambio normativo/anexo DIAN;
- rechazo DIAN;
- contingencia oficial atribuible al facturador;
- contingencia oficial atribuible a DIAN.

## 8. Tráfico y límite operativo para UNA SOLA PERSONA

La arquitectura tiene escenarios técnicos mayores, pero la condición de producto es que la primera etapa sea **operable por una sola persona**.

Envolvente operativa inicial propuesta:

| Etapa | Clientes directos | Organizaciones fiscales aprox. | Documentos/mes | Interpretación |
|---|---:|---:|---:|---|
| Piloto | 1–5 | 5–20 | hasta 60.000 | cómodo |
| Inicial comercial | 5–20 | 20–100 | hasta 500.000 | cómodo |
| Crecimiento | 20–50 | 100–250 | hasta 1,5 M | manejable |
| Límite objetivo inicial | hasta 100 | ~250–500 | hasta 3 M | límite serio para 1 operador |
| Stretch | 100+ | 500+ | 3–5 M | benchmark, no promesa |

Objetivo de prueba alrededor del límite inicial: **~50 documentos/s de burst**.

Regla: 30 M y 300 M docs/mes permanecen como escenarios técnicos/futuros, **no como promesa de operación por una sola persona**. El cuello de botella puede ser operativo, PT/DIAN o infraestructura.

Antes de vender capacidad se requiere evidencia mediante benchmark con configuración exacta, latencia, costo, cero duplicados y recuperación de backlog.

## 9. Qué ya está cerrado

- producto público multitenant: PASS;
- núcleo comercial: PASS;
- catálogo fiscal general: PASS;
- roadmap: PASS;
- arquitectura final: PASS;
- estrategia provider-neutral: PASS;
- diseño de seguridad/multitenancy: PASS;
- diseño de procesamiento/idempotencia/reconciliación: PASS;
- estrategia de infraestructura: PASS.

## 10. Qué sigue pendiente

### No requiere autorización inmediata del owner

- convertir arquitectura a implementación;
- completar OpenAPI 3.1 ejecutable;
- migraciones de datos/multitenancy;
- adaptar core/worker/fake provider;
- IaC de sandbox;
- CI/CD;
- tests unitarios, integración, concurrencia, fallos y carga;
- hardening de dependencias;
- observabilidad y runbooks.

### Requiere decisión/autorización manual del owner más adelante

- escoger y contratar PT;
- aprobar precios/planes comerciales;
- autorizar gastos reales de nube/servicios;
- proporcionar/autorizar credenciales reales;
- aprobar alcance final de salud;
- aprobar alcance final de transporte;
- aprobar otros verticales;
- aprobar piloto con clientes reales;
- aprobar paso a producción;
- aprobar merge final a ramas protegidas.

## 11. Punto exacto para continuar en otro chat

No reabrir arquitectura ni volver a discutir si el producto es público, multitenant o provider-neutral.

El próximo trabajo recomendado es:

1. revisar este checkpoint;
2. leer `docs/HANDOFF-NEXT-CHAT.md`;
3. mantener PT y verticales sectoriales como pendientes;
4. iniciar planificación/ejecución de implementación V1 comercial;
5. conservar como restricción explícita que la primera etapa debe ser operable por **una sola persona**;
6. certificar capacidad mediante benchmarks, no mediante estimaciones.
