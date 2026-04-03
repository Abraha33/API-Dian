# Mapa de módulos: decisión de producto ↔ fases del ROADMAP

Este archivo alinea el **orden lógico de construcción** acordado para el producto con las **fases F1–F8** del [ROADMAP.md](../ROADMAP.md). Sirve para evitar ambigüedad entre “núcleo de plataforma” en sentido de negocio y las secciones nombradas en el roadmap.

| # | Bloque de producto (orden de dependencias) | Fases ROADMAP principales | Notas |
|---|---------------------------------------------|---------------------------|--------|
| 1 | Decisiones y arquitectura (ADR-001, ADR-002) | **F1** | ADR-001 = stack; ADR-002 = workflow de construcción. |
| 2 | Cumplimiento y adaptación DIAN | **Transversal** (arranque F1, refuerzo F4, endurecimiento F6, expansión F7) | No es una fase única; cruza el ciclo de vida. |
| 3 | Núcleo de plataforma (ejecutable, DB, async mínimo, CI) | **F2** | Incluye lo que en el roadmap se llama “Plataforma de ejecución”. |
| 4 | Multi-tenant, auth, empresas, terceros | **F3** | En el roadmap: “Multi-tenancy e identidad” + “Empresas y maestro de terceros”. |
| 5 | Modelo documental (documentos fiscales, estados, idempotencia) | **F4** (núcleo) | Primera parte de F4 antes del motor/canal. |
| 6 | Motor de emisión (cola, worker, adaptador, primer canal) | **F4** (emisión) | Incluye secretos del canal, motor y adaptadores. |
| 7 | Retorno al ERP (webhook saliente firmado, reintentos, log de entrega) | **F5** | Incluye refuerzo de API keys según prioridad. |
| 8 | Operación y confiabilidad (logs, DLQ, replay, panel, alertas) | **F6** | Incluye rate limits y gobierno DIAN operativo. |
| 9 | Cobertura fiscal ampliada (notas crédito/débito, documento soporte; nómina en roadmap) | **F7** | El ROADMAP incluye también **nómina electrónica** y **multi-canal**. |
| 10 | SaaS comercial (billing, cuotas, Stripe, notificaciones, OpenAPI) | **F8** (parte monetización) | Depende de límites y métricas claras (F6). |
| 11 | Escala y resiliencia (Redis/BullMQ, observabilidad avanzada) | **F8** (opcional) | Solo tras evidencia de carga o límites del MVP. |

**Lectura rápida:** los números **1–10** de la primera columna son la **secuencia de dependencias de negocio**; el roadmap **F1–F8** agrupa entregables para un solo mantenedor. Cuando un issue no encaje, actualizar este cuadro o el ROADMAP, no ambos en conflicto.
