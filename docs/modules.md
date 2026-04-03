# Mapa de módulos: decisión de producto ↔ fases del ROADMAP

Este archivo alinea el **orden lógico de construcción** acordado para el producto con las **fases F1–F8** del [ROADMAP.md](../ROADMAP.md). Las columnas **Talla estimada (agregada)** y **Prueba de cierre (resumen)** son orientativas por **bloque de negocio**; la tabla canónica por **fase** sigue en el ROADMAP ([Resumen por fase](../ROADMAP.md#resumen-por-fase)).

| # | Bloque de producto (orden de dependencias) | Fases ROADMAP | Talla estimada (agregada) | Prueba de cierre (resumen) | Notas |
|---|---------------------------------------------|---------------|---------------------------|-----------------------------|--------|
| 1 | Decisiones y arquitectura (ADR-001, ADR-002) | **F1** | S–M | ADR-001 cumple sus criterios internos; README no presenta stack cerrado hasta entonces; [ADR-002](../ADR/ADR-002-workflow-construccion.md) enlazado desde README; plantilla de impacto DIAN en repo. | ADR-001 = stack (cerrar con issue p. ej. T0.0.1); ADR-002 = workflow. |
| 2 | Cumplimiento y adaptación DIAN | **Transversal** | S (por hito) | Política de versionado y plantilla de análisis de impacto accesibles en repo; checklist mínimo ejecutable al cerrar el hito (F1/F4/F6/F7 según ROADMAP). | Arranque F1; refuerzo F4; endurecimiento F6; expansión F7. |
| 3 | Núcleo de plataforma (ejecutable, DB, async mínimo, CI) | **F2** | M | App ejecutable; DB conectada; health OK; un job asíncrono demostrado; CI verde con jobs acordados. | “Plataforma de ejecución” en ROADMAP. |
| 4 | Multi-tenant, auth, empresas, terceros | **F3** | M | Tenant resuelto en request; consola operativa; CRUD empresa y tercero; **prueba de no cruces** entre tenants documentada. | Multi-tenancy + maestros. |
| 5 | Modelo documental (documentos, estados, idempotencia) | **F4** (núcleo) | M | Crear/listar/detalle documento; idempotencia verificada (test o script); máquina de estados coherente en un caso feliz interno. | Antes del motor/canal en profundidad. |
| 6 | Motor de emisión (cola, worker, adaptador, primer canal) | **F4** (emisión) | L | E2E sandbox: aceptación + rechazo; artefactos/IDs persistidos según ADR; callback entrante del canal si aplica. | Secretos del canal + adaptador. |
| 7 | Retorno al ERP (webhook saliente, reintentos, log) | **F5** | M | GET estado estable; webhook saliente hacia URL de prueba con registro de entregas y reintento; o cliente de prueba documentado. | API keys según prioridad de producto. |
| 8 | Operación y confiabilidad (logs, DLQ, replay, panel) | **F6** | L | DLQ + replay manual; panel o endpoints internos localizan documento y cola; correlación en logs; al menos un caso de regresión normativa ejecutado. | Rate limits incluidos en el bloque. |
| 9 | Cobertura fiscal ampliada y multi-canal | **F7** | L–XL | Nuevo tipo **o** segundo canal: trazabilidad de intentos/canal; regresión F4 (feliz+rechazo) + caso del nuevo alcance. | Nómina y notas según ROADMAP. |
| 10 | SaaS comercial (billing, cuotas, OpenAPI) | **F8** | M | Planes y contadores coherentes; pasarela en staging **o** documento explícito de posposición; OpenAPI publicado y verificado. | Depende de F6 para límites/métricas. |
| 11 | Escala y resiliencia (Redis/BullMQ, observabilidad avanzada) | **F8** (opcional) | L | PoC o migración documentada con feature flag; criterio de éxito acordado en issue (no antes de evidencia de carga o dolor). | Solo si ADR y necesidad lo justifican. |

**Lectura rápida:** los números **1–11** de la primera columna son la **secuencia de dependencias de negocio**; el roadmap **F1–F8** agrupa entregables para un solo mantenedor. Cuando un issue no encaje, actualizar este cuadro o el ROADMAP, no ambos en conflicto.
