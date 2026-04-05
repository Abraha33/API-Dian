# Prompt base — pruebas (cuando exista código)

Para diseñar o revisar estrategia de tests alineada al repo. Hasta que ADR-001 cierre herramientas (runner, E2E), las elecciones concretas pueden quedar **pendientes**.

---

Proyecto **API-Dian**: API middleware multi-tenant; aislamiento por tenant (RLS en Supabase cuando aplique). Documentación: `README.md`, `ROADMAP.md`, `ADR/ADR-001-stack-tecnologico.md`.

**Estado del repo:** (ej. solo docs / API Next.js / worker — lo que sea cierto hoy)

**Objetivo del test:** (ej. regresión endpoint X, contrato integrador, RLS)

**Pregunta:**

1. Qué capas testear primero (unit, integración, contrato, E2E) y por qué.
2. Datos mínimos y fixtures (sin PII real).
3. Qué dejar como **pendiente** hasta cerrar stack en ADR-001.

Responde conciso; si falta información, lista exactamente qué necesitas del usuario.
