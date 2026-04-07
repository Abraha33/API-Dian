# Roadmap API-DIAN

Fases de construcción del proyecto API-DIAN.
Objetivo final: plataforma multi-tenant que cubra todos los servicios
fiscales DIAN (factura electrónica, notas crédito/débito, documento
soporte, nómina, etc.) sobre una arquitectura modular y escalable.

---

## F0 — Workflow, foundations y método de trabajo
**Estado: 🚧 En progreso**

Fase previa a cualquier construcción funcional.
Define cómo se trabaja, no el dominio fiscal.

Entregables:
- `docs/workflow.md` — flujo de trabajo en 8 pasos.
- `docs/estimation-and-definition-of-done.md` — tallas, DoD y calibración.
- `docs/templates/` — plantillas de sesión, módulo y checklist.
- `docs/context-policy.md` — política de contexto mínimo para IA.
- `docs/supabase-workflow.md` — flujo de validación con Supabase CLI.

Paquetes de trabajo (issues):

| Código | Título | Talla | Estado |
|--------|--------|-------|--------|
| F0-WKF-01 | Definir workflow y herramientas IA | S | ⏳ Pendiente |
| F0-WKF-02 | Crear plantillas sesión/módulo/checklist | S | ⏳ Pendiente |
| F0-WKF-03 | Política de contexto mínimo y docs persistentes | S | ⏳ Pendiente |
| F0-WKF-04 | Flujo de validación CLI + Supabase | M | ⏳ Pendiente |
| F0-WKF-05 | Criterios de cierre por módulo | S | ⏳ Pendiente |

---

## F1 — Arquitectura y decisiones iniciales
**Estado: ⏸ No iniciado**

Define la arquitectura base de la plataforma que soportará
todos los servicios fiscales DIAN.

Temas principales:
- Estructura de capas y módulos del sistema.
- Decisiones de stack tecnológico (ADRs).
- Organización de servicios internos.
- Primeros endpoints de salud y verificación.
- Modelo conceptual de documentos fiscales y flujos.

---

## F2 — Núcleo de plataforma (app base, colas, health)
**Estado: ⏸ No iniciado**

Temas principales:
- App base ejecutándose con estructura de módulos definida.
- Health checks para integradores y monitoreo interno.
- Infraestructura de colas para procesamiento de documentos.
- Logging básico y trazabilidad inicial.
- Estándares de configuración por entorno (dev, staging, prod).

---

## F3 — Tenant, identidad y maestros
**Estado: ⏸ No iniciado**

Temas principales:
- Modelo de tenant/empresa (multi-tenant desde el día 1).
- Usuarios, roles y permisos asociados al tenant.
- RLS (Row Level Security) por tenant en Supabase.
- Maestros de configuración fiscal:
  resoluciones, numeraciones, datos del emisor.

---

## F4 — Documento fiscal, emisión DIAN y primer canal
**Estado: ⏸ No iniciado**

Temas principales:
- Modelo de documentos fiscales y estados internos:
  recibido → encolado → enviado → aceptado/rechazado → notificado.
- Motor de generación XML/UBL.
- Adaptador para primer canal DIAN (sandbox).
- Manejo de respuesta DIAN y persistencia de estados.
- Primer flujo completo: integrador → DIAN → adquiriente.

---

## F5 — Retorno al ERP (consultas y webhooks)
**Estado: ⏸ No iniciado**

Temas principales:
- Endpoints de consulta de documentos para integradores/ERPs.
- Webhooks de salida con estados relevantes.
- Reintentos y manejo de fallos de notificación.
- Sincronización de estados entre API-DIAN y ERP.

---

## F5.5 — Integraciones comerciales y e-commerce
**Estado: ⏸ No iniciado**

Fase puente entre F5 y F6: define cómo el producto encaja en los flujos donde viven pedidos y ventas (e-commerce, marketplaces, ERPs/POS) en Colombia.

Temas principales:
- Priorización de canales conectables (Shopify, Mercado Libre, WooCommerce, Odoo/ERP, etc.).
- Definición del modelo de adaptadores (nativo vs partners vs capa genérica).
- Contrato interno `commerce-order -> fiscal-document`.
- Normalización de eventos (entrada/salida) y webhooks.
- Criterios de prioridad comercial por canal (scoring) y backlog inicial.

Milestone GitHub: **F5.5 — Integraciones comerciales y e-commerce**.

---

## F6 — Operación, confiabilidad y gobierno DIAN
**Estado: ⏸ No iniciado**

Temas principales:
- Observabilidad: logs estructurados, métricas, dashboards básicos.
- Auditoría y trazabilidad de operaciones fiscales.
- Panel mínimo de soporte interno.
- DLQ (Dead Letter Queue), replay manual de documentos fallidos.
- Gestión de cambios normativos DIAN (versionado de esquemas).

---

## F7 — Cobertura fiscal ampliada y multi-canal
**Estado: ⏸ No iniciado**

Temas principales:
- Notas crédito y débito electrónicas.
- Documento soporte de adquisiciones.
- Nómina electrónica.
- Soporte para múltiples canales de emisión DIAN.
- Compatibilidad con cambios normativos.

---

## F8 — SaaS comercial y escala
**Estado: ⏸ No iniciado**

Temas principales:
- Planes y límites por tenant.
- Contadores de uso y métricas de negocio.
- Hardening de seguridad para producción.
- Performance y escalabilidad horizontal.
- Documentación pública para integradores.

---

## Módulos del dominio

| Módulo | Descripción | Fases principales |
|--------|-------------|-------------------|
| plataforma-tenants | Multi-tenant, usuarios, permisos | F1–F3 |
| integrador-api | Contrato JSON de entrada, autenticación | F1–F2 |
| documentos-fiscales | Modelo y ciclo de documentos | F4 |
| emision-dian | Generación XML/UBL, envío, respuesta | F4 |
| procesamiento-interno | Colas, workers, DLQ, replay | F2, F6 |
| notificacion-adquiriente | Email con XML/PDF | F4 |
| observabilidad-gobierno | Logs, métricas, auditoría | F6 |
| cumplimiento-dian | Normativa, versiones, pruebas | F4–F7 |

---

## Convenciones

- Cada issue se asocia a un milestone F0–F8.
- Títulos de issue: `[F<n>-<CÓDIGO>] Descripción`
- Labels: `role-*`, `type-*`, `size-*`, `priority-*`, `module-*`
- Ramas: `feature/<rol>/<issue-n>-slug` desde `dev`
- Detalle de workflow en `docs/workflow.md`
- Detalle de estimación y DoD en `docs/estimation-and-definition-of-done.md`
