# ROADMAP COMPLETO - 50+ TICKETS

**Cadena B2B objetivo:** ERP del cliente → **nuestra API** (middleware SaaS multi-tenant) → **integrador API / canal de salida** hacia la DIAN (operado mediante proveedores y esquemas válidos en Colombia) → respuesta de la red fiscal → persistencia y **notificación o consulta** hacia el ERP.

**Segmento:** prioridad **PYME**, luego mediana empresa, luego grande (requisitos de volumen, SLA y compliance se endurecen por fases).

**Primer desafío (antes de implementar):** el ticket **T0.0.1** fija el **tech stack** en [ADR-001](./ADR/ADR-001-stack-tecnologico.md). Hasta su aprobación, las columnas *Tech* de los tickets posteriores son **hipótesis orientativas** o **“según ADR-001”**; no son compromisos de implementación.

**Lenguaje fiscal:** **Factus** (y cualquier otro nombre comercial) se trata como **integrador API** o **canal de salida** hacia la DIAN, salvo documentación legal/contrato que acredite otra condición (por ejemplo proveedor tecnológico autorizado). No asumir en este roadmap que un integrador concreto es “proveedor tecnológico DIAN” sin evidencia explícita.

---

## FASE 0: FUNDACION (Semana 1-2)

### 0.0 — Stack (primer ticket)

| Ticket | Tarea | Tech / notas | Horas | Prioridad |
|--------|-------|----------------|-------|-----------|
| **T0.0.1** | **Definición tech stack (riesgos, alternativas y ADR-001 aprobado)** | Doc / revisión; incluye criterios para elegir **integrador(es) API** de referencia y almacenamiento de artefactos fiscales | 4-8h | **Alta** |

**Alcance T0.0.1:** completar [ADR/ADR-001-stack-tecnologico.md](./ADR/ADR-001-stack-tecnologico.md): runtime, base de datos, hosting, cola/procesamiento asíncrono, CI, **patrón de integración con canal de salida DIAN (integrador API)**, almacenamiento de XML/PDF/metadata, observabilidad mínima; al menos una alternativa descartada por eje crítico; actualizar README §10 alineado al ADR.

### 0.1 — Repo y base (tras T0.0.1)

| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T0.1.1 | GitHub repo setup | Según ADR-001 (CI básico) | 1h | Alta |
| T0.1.2 | Aplicación base (App Router u opción ADR) | Stack ADR-001 | 2h | Alta |
| T0.1.3 | Proveedor DB + hosting API (config proyecto) | Según ADR-001 | 2h | Alta |
| T0.1.4 | Dependencias core validación y HTTP cliente | Según ADR-001 | 1h | Alta |
| T0.1.5 | Health check / ping operativo | Según ADR-001 | 1h | Alta |
| T0.2.1 | Esquemas validación API entrada/salida | Según ADR-001 | 3h | Alta |
| T0.2.2 | Modelo datos inicial + políticas aislamiento tenant | Según ADR-001 | 4h | Alta |
| T0.2.3 | Cola asíncrona MVP (o equivalente aprobado en ADR) | Según ADR-001 | 2h | Alta |
| T0.2.4 | Arquitectura de carpetas y límites módulo único | TypeScript / convención repo | 1h | Alta |
| T0.2.5 | CI pipeline (lint/test placeholder → real) | Según ADR-001 | 2h | Media |

---

## FASE 1: MVP FUNCIONAL (Mes 1-3)

**Objetivo MVP:** un flujo **factura electrónica de venta** (o documento equivalente acordado) de punta a punta: creación en API, envío al **integrador de referencia**, recepción de resultado, **persistencia** de identificadores y artefactos acordados, y **visibilidad** para el ERP vía API y/o **callback saliente**.

| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T1.1.1 | Autenticación y sesión tenant (staff) | Según ADR-001 | 3h | Alta |
| T1.1.2 | Middleware resolución tenant (cabecera/subdominio/API key temprana según ADR) | Según ADR-001 | 3h | Alta |
| T1.1.3 | CRUD empresas (tenant raíz) | Según ADR-001 | 4h | Alta |
| T1.1.4 | CRUD terceros / clientes mínimo para facturación | Según ADR-001 | 3h | Alta |
| T1.1.5 | Pruebas aislamiento tenant (automáticas) | Según ADR-001 | 2h | Alta |
| T1.2.1 | Modelo documento fiscal venta + RLS | Según ADR-001 | 3h | Alta |
| T1.2.2 | POST documento borrador / envío inicial | Según ADR-001 | 4h | Alta |
| T1.2.3 | GET listado documentos por tenant | Según ADR-001 | 3h | Alta |
| T1.2.4 | GET detalle documento por id | Según ADR-001 | 2h | Alta |
| T1.2.5 | Idempotencia creación (clave idempotency) | Según ADR-001 | 2h | Alta |
| T1.2.6 | **Persistencia resultados canal:** CUFE/CUDE u homólogos, XML y PDF (si el integrador los entrega), respuestas DIAN/integrador en almacén aprobado en ADR | Según ADR-001 | 5h | Alta |
| T1.3.1 | Encolado envío a integrador (desacople API ↔ worker) | Según ADR-001 | 4h | Alta |
| T1.3.2 | Worker procesamiento cola → llamada integrador API | Según ADR-001 | 5h | Alta |
| T1.3.3 | Máquina de estados documento (borrador, enviado, aceptado, rechazado, error) | Según ADR-001 | 2h | Alta |
| T1.3.4 | Ajuste manual estado / reintento simple operador (endpoint interno mínimo) | Según ADR-001 | 2h | Media |
| T1.3.5 | Visibilidad básica métricas cola (dashboard proveedor o endpoint interno) | Según ADR-001 | 2h | Baja |
| T1.4.1 | **Contrato adaptador** integrador API (interfaz neutra canal salida DIAN) | TypeScript / diseño | 2h | Alta |
| T1.4.2 | **Implementación sandbox** primer integrador de referencia (p. ej. API Factus u otro elegido en ADR); mapeo payload sin confundir rol comercial con condición DIAN | Según ADR-001 | 6h | Alta |
| T1.4.3 | Orquestación cola → adaptador (errores y persistencia intento) | Según ADR-001 | 4h | Alta |
| T1.4.4 | **Webhook/callback entrante** desde integrador (validación firma/HMAC según documentación integrador) | Según ADR-001 | 4h | Alta |
| T1.4.5 | **Callback/Webhook saliente hacia ERP cliente:** registro URL por tenant, firma o secreto compartido, reintentos y registro de entregas | Según ADR-001 | 5h | Alta |
| T1.4.6 | E2E mínimo: N documentos feliz + 1 rechazo (herramienta según ADR-001) | Según ADR-001 | 3h | Alta |
| T1.5.1 | **Nota crédito electrónica v1** (referencia a factura, mismo pipeline integrador) | Según ADR-001 | 5h | Media |
| T1.5.2 | **Nota débito electrónica v1** (alcance PYME) | Según ADR-001 | 4h | Media |

---

## FASE 2: ESTABILIDAD (Mes 4-5)

| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T2.1.1 | Historial / logs de eventos por documento (JSON estructurado) | Según ADR-001 | 3h | Alta |
| T2.1.2 | Logging estructurado API (correlación request) | Según ADR-001 | 3h | Alta |
| T2.1.3 | Logging llamadas adaptador (sin datos sensibles innecesarios) | Según ADR-001 | 2h | Alta |
| T2.1.4 | GET auditoría / logs documento (paginación) | Según ADR-001 | 2h | Alta |
| T2.1.5 | Reintentos automáticos con backoff (errores transitorios) | Según ADR-001 | 3h | Alta |
| T2.1.6 | **Cola de fallidos (DLQ) + reinyección / replay manual** desde herramienta operador | Según ADR-001 | 5h | Alta |
| T2.2.1 | Tabla API keys por tenant / aplicación cliente | Según ADR-001 | 2h | Alta |
| T2.2.2 | CRUD API keys + rotación y auditoría | Según ADR-001 | 3h | Alta |
| T2.2.3 | Doble modo auth: usuario staff + API key (middleware unificado) | Según ADR-001 | 4h | Alta |
| T2.2.4 | Rate limiting por tenant/clave | Según ADR-001 (p. ej. Redis/edge limiter) | 2h | Alta |
| T2.2.5 | Endpoints terceros/clientes completos validación y RLS | Según ADR-001 | 4h | Alta |
| T2.3.1 | **Panel interno operaciones mínimo:** búsqueda documento, estado cola, reintento, DLQ, tenants (acceso restringido) | Según ADR-001 | 6h | Alta |
| T2.3.2 | **Documento soporte en adquisiciones v1** (alcance PYME; mismo patrón integrador) | Según ADR-001 | 6h | Media |

---

## FASE 3: DIFERENCIACION (Mes 6-8)

| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T3.0.1 | **Documento estrategia segundo integrador / segundo canal de emisión** (criterios de elección, conmutación, costo, riesgo, compliance) | Markdown / ADR corto | 3h | Media |
| T3.1.1 | Factoría de adaptadores y registro por tenant o configuración global | Según ADR-001 | 4h | Media |
| T3.1.2 | **Segundo integrador API** (implementación; integrador concreto según ADR-001, no fijado en roadmap) | Según ADR-001 | 6h | Media |
| T3.1.3 | Conmutación / circuit breaker entre integradores (failover controlado) | Según ADR-001 | 3h | Media |

---

## FASE 4: SAAS MONETIZABLE (Mes 9-12)

| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T4.1.1 | Modelo datos facturación uso (planes, contadores) | Según ADR-001 | 4h | Media |
| T4.1.2 | Integración pasarela cobro (p. ej. Stripe) y webhooks | Según ADR-001 | 6h | Media |
| T4.1.3 | Cuotas de uso y límites por plan | Según ADR-001 | 4h | Media |
| T4.1.4 | Notificaciones email operativas (límites, fallos críticos) | Según ADR-001 | 4h | Media |
| T4.1.5 | Documentación API consumible (OpenAPI + UI si aplica) | Según ADR-001 | 3h | Media |

---

## FASE 5: HIPERESCALAMIENTO OPCIONAL (Mes 13-15)

### 5.1 Colas y persistencia externa

| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T5.1.1 | Redis u almacén externo para colas/ratelimit (si ADR lo incorpora) | Según ADR-001 | 2h | Baja |
| T5.1.2 | Cola empresarial (p. ej. BullMQ) evaluación y PoC | Según ADR-001 | 6h | Baja |
| T5.1.3 | Migración dual-write o feature flags cola | Según ADR-001 | 6h | Baja |
| T5.1.4 | Producción cola alternativa (flag ADAPTER_QUEUE) | Según ADR-001 | 2h | Baja |
| T5.1.5 | UI inspección cola (p. ej. Bull Board) si aplica | Según ADR-001 | 3h | Baja |

### 5.2 Observabilidad enterprise

| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T5.2.1 | APM/ errores centralizados (tier pago si aplica) | Según ADR-001 | 3h | Baja |
| T5.2.2 | RUM / trazas distribuidas | Según ADR-001 | 4h | Baja |
| T5.2.3 | Drenaje logs a almacén analítico (p. ej. OLAP) | Según ADR-001 | 3h | Baja |

---

*Fin del roadmap. Los identificadores de ticket son estables salvo renumeración acordada en el tablero; las estimaciones son orientativas para 1 desarrollador con apoyo de IA.*
