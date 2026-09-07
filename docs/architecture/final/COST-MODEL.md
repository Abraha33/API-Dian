# Modelo técnico-financiero de infraestructura

> Moneda: USD/mes, lista pública consultada 2026-09-07, sin IVA, soporte premium, descuentos, PT ni personal. Son rangos de planeación; antes de contratar se recalcula en la calculadora del proveedor con región y carga medidas.

## Fuentes y base

- [Cloud Run pricing](https://cloud.google.com/run/pricing): compute/request; el ejemplo oficial de 10 M requests, 1 vCPU/512 MiB, concurrencia 20 y 400 ms estima USD 13,69 en una región económica.
- [Cloud SQL pricing](https://cloud.google.com/sql/pricing): compute, memoria, storage, red y HA varían por región.
- [Pub/Sub pricing](https://cloud.google.com/pubsub/pricing): primeros 10 GiB/mes y luego USD 40/TiB para throughput básico al corte.
- [Cloud Storage pricing](https://cloud.google.com/storage/pricing): storage, operaciones, recuperación y transferencia por ubicación/clase.
- [Secret Manager pricing](https://cloud.google.com/secret-manager/pricing), [Cloud Build pricing](https://cloud.google.com/build/pricing).

## Fórmula

`costo total = fijo de plataforma + compute por uso + DB + cola + objetos + operaciones/egress + observabilidad + backups + servicios externos`.

`costo/1.000 docs = (coste variable atribuible + parte fija asignada) / docs × 1.000`.

## Escenarios

| Escenario | Docs/mes | Compute | DB+backup | Storage/egress | Observabilidad/edge/secrets/CI | Total infra estimado | USD/1.000 docs |
|---|---:|---:|---:|---:|---:|---:|---:|
| Dev/sandbox | ≤10k | 0–15 | 10–35 | 1–5 | 0–20 | **11–75** | no comercial |
| Piloto | 60k | 15–40 | 35–90 zonal | 3–15 | 20–60 | **73–205** | **1,22–3,42** |
| 10 clientes | 300k | 20–70 | 70–180 | 8–35 | 30–90 | **128–375** | **0,43–1,25** |
| 100 clientes | 3 M | 60–250 | 180–500 HA | 40–180 | 80–250 | **360–1.180** | **0,12–0,39** |
| 1.000 clientes | 30 M | 400–1.800 | 700–2.500 | 250–1.200 | 250–1.000 | **1.600–6.500** | **0,05–0,22** |
| 10.000 clientes | 300 M | 4k–15k | 4k–15k/shards | 2k–10k | 1k–6k | **11k–46k** | **0,04–0,15** |

Los rangos superiores incluyen margen para región sudamericana, HA, logs y bursts. El escenario 10.000 requiere rediseño medido; no es presupuesto comprometido.

## Costes separados

| Categoría | Fijo | Variable principal |
|---|---:|---|
| Compute API/worker | mínimo de instancias comerciales | vCPU, memoria, tiempo y requests |
| PostgreSQL | instancia/HA | tamaño, IOPS, backup, replicas |
| Cola | cero extra con DB en V1 | DB; Pub/Sub por bytes al evolucionar |
| Objetos | casi cero | GB-mes, operaciones, retrieval, egress |
| Observabilidad | alertas/base | ingestión y retención de logs/traces |
| Email | dominio/configuración | mensajes; opcional, no camino fiscal |
| Backups/DR | retención mínima | GB, región secundaria y pruebas |
| Secretos/KMS | versiones/llaves | accesos y operaciones criptográficas |
| CI/CD | normalmente bajo | minutos, storage de imágenes |
| Dominio/TLS | dominio anual | TLS administrado usualmente sin cargo directo |
| PT | contrato/plan | **precio por documento, paquete, certificado y soporte; excluido arriba** |

## Riesgo económico principal

El PT puede dominar el costo por documento. Antes de fijar precios comerciales se exige cotización contractual con: mínimos, excedentes, ambientes, firma/certificado, XML/PDF, soporte, retries/consultas, retención y salida de datos. Margen se calcula con costo PT medido, no con el rango cloud solamente.

## Controles FinOps

- budgets 50/75/90/100%, anomaly alerts y tags por ambiente;
- métrica mensual `cost_per_1000_accepted_documents` y coste por tenant;
- sampling de traces y exclusión de payloads para controlar logs;
- lifecycle de artefactos y límites de exports/egress;
- revisar tamaño/HA por SLO, no por calendario;
- precio comercial debe cubrir p95 de coste, soporte, impuestos y reserva de incidentes.

