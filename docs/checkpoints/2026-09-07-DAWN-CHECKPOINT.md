# API-DIAN — Dawn checkpoint — 2026-09-07

> **Branch canónica:** `draft/architecture-product-v1`
> **Estado:** PAUSA / HANDOFF READY
> **Arquitectura:** `ARCHITECTURE FINAL: PASS`
> **Producción:** `PRODUCTION READY: BLOCKED`
> **Checkpoint previo:** `docs/checkpoints/2026-09-07-PRE-IMPLEMENTATION-CHECKPOINT.md`

## 1. Regla de capacidad: no confundir diseño con capacidad demostrada

La arquitectura está **diseñada** para intentar alcanzar una primera envolvente operativa de hasta ~3 M documentos/mes y bursts comerciales de ~50 documentos/s, con hasta ~100 clientes directos y ~250–500 organizaciones fiscales, manteniendo la restricción de operación por una sola persona.

Esto **NO es una capacidad certificada todavía**.

Regla canónica nueva:

> `CAPACITY READY: PASS` solo existe cuando una configuración concreta de aplicación + infraestructura + base de datos + workers + cola + adaptador ha superado benchmarks reproducibles con margen.

No vender capacidad basándose únicamente en estimaciones arquitectónicas.

## 2. Cómo se demostrará la capacidad

La prueba debe ser experimental, igual que medir throughput en cualquier otro software.

Secuencia recomendada:

1. construir V1;
2. generar carga sintética con clientes POS/ERP simulados;
3. probar escalones de carga, por ejemplo 10/s → 25/s → 50/s → 75/s → 100/s y continuar hasta encontrar degradación;
4. cargar millones de documentos sintéticos en PostgreSQL para medir consultas, índices, paginación, almacenamiento, backup y restore;
5. ejecutar bursts de 1, 5 y 15 minutos;
6. ejecutar pruebas largas/endurance;
7. simular un tenant caliente con una fracción grande del tráfico;
8. medir API, DB, workers, cola, object storage y costos;
9. usar PT/DIAN fake para simular latencia, 429, 5xx, timeouts después de posible aceptación y respuestas inconsistentes;
10. matar deliberadamente workers y reiniciar dependencias para comprobar recuperación;
11. probar backlog y tiempo de recuperación;
12. repetir el benchmark cuando cambie significativamente la arquitectura o configuración.

Criterios orientativos ya definidos en arquitectura para la primera etapa:

- cero duplicados fiscales;
- cero cross-tenant;
- error atribuible a plataforma <0,1% en escenario objetivo;
- API p95 <500 ms para aceptación local;
- DB <70% sostenido en la configuración certificada;
- backlog recuperable dentro del objetivo definido;
- ningún `UNKNOWN` reenviado a ciegas.

Principio de margen:

> Para vender ~50 docs/s, se debe intentar demostrar capacidad estable significativamente superior (por ejemplo ~100 docs/s), siempre que PT/DIAN y la configuración real lo permitan.

El límite comercial final se fija **por debajo** del punto de degradación medido.

## 3. Los cinco cuellos de botella a medir por separado

1. API / Cloud Run: requests/s, CPU, memoria, concurrencia, instancias y latencia.
2. PostgreSQL: conexiones, CPU, IOPS, locks, queries, TPS, tamaño e índices.
3. Workers / cola: docs/s procesados, profundidad, oldest age, leases, retries y recuperación.
4. PT: rate limits, latencia, disponibilidad y cuota contratada.
5. DIAN: disponibilidad y comportamiento externo que no controlamos; se absorbe con cola, backoff, contingencia y reconciliación.

La capacidad total real es aproximadamente la del **cuello de botella más restrictivo**, no la suma de capacidades de componentes.

## 4. Qué significa "completamente listo"

No existe una única prueba. El producto solo puede pasar a producción cuando estén en PASS los gates aplicables:

- PRODUCT DEFINED;
- REGULATORY READY;
- PUBLIC API CONTRACT READY;
- FUNCTIONAL FISCAL READY;
- MULTITENANT ISOLATION READY;
- IDEMPOTENCY READY;
- UNKNOWN/RECONCILIATION READY;
- CONTINGENCY/FAILURE READY;
- INTERNAL INFRA FAILURE READY;
- CAPACITY READY;
- LARGE-DATASET READY;
- SECURITY READY;
- BACKUP/RESTORE READY;
- OBSERVABILITY READY;
- ALERTING READY;
- ROLLBACK READY;
- PT SANDBOX READY;
- DIAN CONFORMITY/HABILITATION READY según aplique;
- CONTROLLED PILOT READY;
- ONE-PERSON OPERATIONS READY;
- COST READY;
- FINAL REGULATORY DIFF READY.

Solo después:

> `PRODUCTION READY: PASS`

La meta no es garantizar que nunca aparecerá un error nuevo, sino demostrar que las funciones conocidas, fallos previsibles, recuperación, capacidad y manejo seguro de casos desconocidos están bajo control.

## 5. Estimación temporal conservadora

Estimación de planificación, no promesa contractual:

- V1 funcional en sandbox: ~3–5 meses si la ejecución es sostenida;
- V1 comercial seria con integración, hardening, carga, seguridad y piloto: alrededor de 9–15 meses para un estudiante/desarrollador principal;
- objetivo de planificación recomendado: ~12 meses para intentar llegar a producción V1;
- producto mucho más completo, comparable en amplitud de familias fiscales a referentes del mercado: ~18–36+ meses para una sola persona, sujeto a aprendizaje, cambios regulatorios y verticales.

Estas cifras deben actualizarse con velocidad real de implementación.

## 6. Modelo financiero exploratorio por cliente

**NO es pricing aprobado.** Es un escenario conservador para entender el negocio y debe recalcularse cuando exista cotización real del PT, costos cloud medidos y validación contable/tributaria.

Supuestos del ejercicio:

- 1 cliente directo = POS/ERP/SaaS/integrador;
- cada cliente directo inicia con mínimo 2 organizaciones finales;
- 1.500 documentos/mes promedio por organización;
- 3.000 documentos/mes promedio por cliente directo;
- precio ilustrativo: 300.000 COP/mes por cliente directo;
- costo PT supuesto: 45 COP/documento;
- otros costos variables ilustrativos: ~15.000 COP/cliente;
- infraestructura/herramientas iniciales: ~1,2–2 M COP/mes según crecimiento.

Crecimiento conservador ilustrativo del año 1:

| Mes | Clientes directos | Organizaciones mín. | Docs/mes | Ingreso ilustrativo |
|---:|---:|---:|---:|---:|
| 1 | 2 | 4 | 6.000 | 0,6 M COP |
| 2 | 3 | 6 | 9.000 | 0,9 M |
| 3 | 5 | 10 | 15.000 | 1,5 M |
| 4 | 7 | 14 | 21.000 | 2,1 M |
| 5 | 10 | 20 | 30.000 | 3,0 M |
| 6 | 13 | 26 | 39.000 | 3,9 M |
| 7 | 16 | 32 | 48.000 | 4,8 M |
| 8 | 20 | 40 | 60.000 | 6,0 M |
| 9 | 25 | 50 | 75.000 | 7,5 M |
| 10 | 30 | 60 | 90.000 | 9,0 M |
| 11 | 36 | 72 | 108.000 | 10,8 M |
| 12 | 42 | 84 | 126.000 | 12,6 M |

Totales ilustrativos del año:

- 42 clientes directos al cierre;
- 84 organizaciones finales mínimas;
- ~627.000 documentos procesados durante el año;
- ~62,7 M COP de facturación bruta bajo este supuesto de precio;
- utilidad operativa ilustrativa acumulada del ejercicio anterior: ~13,65 M COP antes de impuesto, altamente sensible a PT/cloud/soporte.

No usar esa utilidad como forecast oficial. La variable financiera crítica sigue siendo la cotización real del PT. Cada diferencia de 10 COP/documento equivale a 30 M COP/mes cuando se procesan 3 M documentos mensuales.

## 7. Restricción operativa no negociable

La primera etapa debe ser mantenible por **una sola persona**.

Por lo tanto, el límite no depende solo de docs/s. También se mide:

- cantidad de clientes directos;
- cantidad de organizaciones;
- excepciones manuales;
- incidentes por semana;
- tickets/soporte;
- certificados/numeración;
- despliegues;
- regulación;
- restauraciones;
- monitoreo;
- tiempo humano requerido.

Si la infraestructura aguanta pero la operación requiere un equipo, entonces el requisito de primera etapa ha fallado.

## 8. Pendientes manuales del owner

Más adelante requieren autorización/decisión del owner:

- selección y contratación PT;
- pricing/planes comerciales definitivos;
- gastos reales cloud/servicios;
- credenciales reales;
- alcance final de salud/transporte/otros verticales;
- piloto con clientes reales;
- GO TO PRODUCTION;
- merges finales a ramas protegidas.

## 9. Punto de continuación

En el próximo chat:

1. leer este checkpoint primero;
2. leer `docs/checkpoints/2026-09-07-PRE-IMPLEMENTATION-CHECKPOINT.md` para contexto completo;
3. leer `docs/HANDOFF-NEXT-CHAT.md`;
4. no reabrir arquitectura ya aprobada salvo evidencia contradictoria;
5. conservar PT y verticales sectoriales como pendientes;
6. continuar hacia implementación V1 comercial;
7. tratar 3 M docs/mes y ~50 docs/s como **objetivo a demostrar**, no promesa;
8. no declarar `CAPACITY READY` ni `PRODUCTION READY` hasta que los benchmarks y gates correspondientes sean PASS;
9. mantener el requisito de operación por una sola persona como restricción de producto y arquitectura.
