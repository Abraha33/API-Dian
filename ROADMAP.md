# Roadmap API-DIAN

Este roadmap describe las fases principales del proyecto API-DIAN. El objetivo final es ofrecer una API que cubra los servicios fiscales DIAN (factura electrónica, notas crédito/débito, documento soporte, nómina, etc.) sobre una plataforma multi-tenant.

## F0 — Workflow, foundations y método de trabajo

Fase previa a la construcción funcional. Se centra en cómo se trabaja, no en el dominio fiscal.

Objetivo:
- Definir el workflow de construcción.
- Alinear el uso de herramientas IA (Perplexity, Cursor).
- Establecer políticas de contexto y documentación persistente.
- Definir criterios de cierre y calidad por módulo.

Paquetes dentro de F0:

- **F0-WKF-01 — Workflow de construcción y herramientas IA**
  - Definir el flujo idea → issue → estimación → diseño (IA) → implementación → migración → evidencia → cierre.
  - Documentar el flujo en `docs/workflow.md`.

- **F0-WKF-02 — Plantillas de sesión, módulo y checklist**
  - Plantillas de issues (body, prueba de cierre).
  - Plantillas de sesiones con Perplexity/Cursor.
  - Checklists reutilizables por tipo de tarea.

- **F0-WKF-03 — Política de contexto mínimo y docs persistentes**
  - Definir qué contexto se debe aportar mínimo a cada sesión con IA.
  - Documentar qué vive en `docs/`, qué vive en ADR y qué va en comentarios de issues.

- **F0-WKF-04 — Flujo de validación con CLI + Supabase**
  - Estándar para crear/aplicar migraciones con Supabase CLI.
  - Script(s) de introspección y verificación de esquema.

- **F0-WKF-05 — Criterios de cierre por módulo**
  - Definition of Done por tipo de módulo (API, DB, docs, etc.).
  - Integrado en `docs/estimation-and-definition-of-done.md`.

## F1 — Arquitectura y decisiones iniciales

Fase donde se define la arquitectura base de la plataforma que soportará todos los servicios fiscales DIAN.

Objetivo:
- Estructura de carpetas, capas y módulos.
- Primeros ADR de arquitectura (stack tecnológico, patrones clave).
- Decisiones sobre cómo se representarán tenants, documentos y flujos internos a alto nivel.

Ejemplos de temas:
- Estructura base de la API y servicios internos.
- Organización de módulos (Plataforma/Tenants, Integrador/API, Documentos fiscales, Emisión DIAN, etc.).
- Primeros endpoints de salud y verificación.

## F2 — Núcleo de plataforma (app base, colas, health)

Objetivo:
- Tener una app base ejecutándose con:
  - Health checks.
  - Logging básico.
  - Colas iniciales para procesamiento interno.

Ejemplos de temas:
- Infraestructura de colas (simple) para procesar documentos.
- Health endpoints para integradores y para monitoreo interno.
- Estándares de logging y trazabilidad inicial.

## F3 — Tenant, identidad y maestros

Objetivo:
- Soportar multi-empresa (tenants).
- Identidad básica (usuarios, roles, permisos).
- Maestros de configuración necesarios para emitir documentos.

Ejemplos de temas:
- Modelo de tenant/empresa.
- Usuarios y roles asociados al tenant.
- Maestros relevantes (resoluciones, numeraciones, etc. a nivel base).

## F4 — Documento fiscal, emisión DIAN y primer canal

Objetivo:
- Modelar documentos fiscales (factura, notas, etc.).
- Implementar el motor de emisión.
- Integrar con el primer canal DIAN en sandbox.

Ejemplos de temas:
- Tabla de documentos fiscales y estados internos (recibido, encolado, enviado, aceptado, rechazado, notificado).
- Motor de emisión que toma documentos y los pasa a XML/UBL.
- Adaptador para el primer canal DIAN sandbox (envío + manejo de respuesta).

## F5 — Retorno al ERP (consultas y webhooks)

Objetivo:
- Permitir que los ERPs/integradores consulten estados.
- Notificar de cambios vía webhooks.

Ejemplos de temas:
- Endpoints de consulta de documentos para integradores.
- Webhooks de salida hacia el ERP con los estados relevantes.
- Manejo de reintentos y fallos de notificación.

## F6 — Operación, confiabilidad y gobierno DIAN

Objetivo:
- Hacer operable la plataforma en día a día.

Ejemplos de temas:
- Observabilidad: logs, métricas, dashboards básicos.
- Auditoría y trazabilidad de operaciones.
- Soporte interno: panel mínimo de operación.

## F7 — Cobertura fiscal ampliada y multi‑canal

Objetivo:
- Extender la API para cubrir más tipos de documento y canales.

Ejemplos de temas:
- Soporte para notas crédito/débito, documento soporte, nómina, etc.
- Integraciones adicionales con otros canales DIAN o partners.
- Manejo de compatibilidad y cambios normativos.

## F8 — SaaS comercial y escala

Objetivo:
- Convertir la plataforma en un SaaS comercializable.

Ejemplos de temas:
- Planes, límites, multi-tenant a escala.
- Métricas de negocio, uso y facturación.
- Endurecer seguridad y performance para producción.

***

## Convenciones de uso con issues

- Cada issue se asocia a **un milestone** F0–F8.
- Dentro del título y/o labels:
  - Se puede usar un prefijo tipo `[F0-WKF-01]` para referirse a paquetes de F0.
  - Se usan labels `module-*` para indicar el módulo principal (plataforma, integrador, emisión DIAN, etc.).
- El detalle de estimación y Definition of Done se encuentra en `docs/estimation-and-definition-of-done.md`.
