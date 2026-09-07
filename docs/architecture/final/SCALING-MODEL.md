# Modelo de escalabilidad

## Supuestos explícitos

Unidad = documento fiscal procesado. Perfil base: 1 KiB request, 25 KiB de metadata/evidencia DB acumulada y 75 KiB de artefactos (XML, respuesta y PDF/cache promedio). Tráfico real de cada integrador puede variar órdenes de magnitud; los límites comerciales se fijan con medición.

| Escenario | Clientes | Docs/día | Promedio docs/s | Burst objetivo | Docs/mes | Artefactos nuevos/mes |
|---|---:|---:|---:|---:|---:|---:|
| Piloto | 1–5 | 2.000 | 0,02 | 5/s | 60.000 | 4,5 GB |
| 10 clientes | 10 | 10.000 | 0,12 | 10/s | 300.000 | 22,5 GB |
| 100 clientes | 100 | 100.000 | 1,16 | 50/s | 3 M | 225 GB |
| 1.000 clientes | 1.000 | 1 M | 11,6 | 300/s | 30 M | 2,25 TB |
| 10.000 clientes | 10.000 | 10 M | 115,7 | 3.000/s | 300 M | 22,5 TB |

No son promesas de capacidad. Son cargas para pruebas y presupuesto. El límite real puede ser el PT/DIAN antes que la aplicación.

## Escalamiento por componente

| Componente | Escala automática | Límite/control |
|---|---|---|
| Borde/Cloud Run API | sí, hasta `max_instances` | concurrencia, cold starts y protección de DB |
| Worker Cloud Run | horizontal controlado | leases, capacidad PT y rate limits |
| PostgreSQL | vertical; replicas/partición planificadas | conexiones, locks, IOPS, índices, tamaño |
| Cola PostgreSQL | no infinita | oldest age/claim latency; migrar transporte a Pub/Sub |
| Object storage | sí | coste, egress y lifecycle |
| PT/DIAN | no controlado | contrato, throttling, ventanas y disponibilidad |
| Webhooks cliente | destinos independientes | timeouts, retry y DLQ por endpoint |

`max_instances × pool_per_instance` nunca puede superar el presupuesto de conexiones DB. Se usa connector/pooling, concurrencia limitada y backpressure. Escalar API sin este límite tumbaría PostgreSQL.

## Umbrales de evolución

1. **Hasta 100 clientes / ~50 burst:** monolito, DB queue, una DB HA dimensionada.
2. **Hasta 1.000 / ~300 burst:** partición mensual/hash donde mida, read replica, worker pools por tipo, Pub/Sub si claim p95 >250 ms o cola >60 s bajo capacidad disponible.
3. **10.000 / 3.000 burst:** no se autoriza solo con estimación. Requiere benchmark, límites PT por escrito, partición/sharding por tenant, control plane separado, almacén analítico y plan multi-región/DR.

## Prueba de carga

- mix 70% create, 25% status, 5% artifacts; payloads mínimo/p95/máximo;
- bursts 1, 5 y 15 minutos; hot tenant representa 40% del tráfico;
- PT fake con latencia, 429, 5xx, timeout después de aceptar y respuestas inconsistentes;
- criterios V1 piloto: API p95 <500 ms para aceptación local, error plataforma <0,1%, cero duplicados/cross-tenant, cola recupera backlog en <30 min, DB <70% sostenido;
- registrar primera saturación, coste por 1.000 y configuración exacta; no extrapolar sin curva.

## Almacenamiento y retención

DB se particiona/archiva por fecha sin perder búsqueda por tenant/documento. PDF puede generarse bajo demanda y cachearse; XML validado y evidencia requerida no se regeneran. Lifecycle mueve objetos fríos a clases económicas solo si el tiempo de recuperación contractual lo permite.

