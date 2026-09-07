# API-DIAN V1 — Plan oficial de construcción

> **Estado:** CANÓNICO / APROBADO POR OWNER
> **Fecha:** 2026-09-07

## Objetivo

Construir API-DIAN V1 de forma progresiva, verificable y operable por una sola persona, permitiendo estudiar y probar cada área de forma independiente antes de integrarla.

## Fases oficiales

### Fase 0 — Producto y arquitectura
**Estado:** PASS.

Ya define producto, alcance V1, multitenancy, seguridad, procesamiento, provider-neutral, infraestructura y roadmap.

### Fase 1 — Conceptualización modular
**Objetivo:** entender y cerrar cada mini-proyecto individualmente sin exigir que los demás estén construidos.

Para cada módulo se deben definir:
- problema que resuelve;
- responsabilidades;
- entradas/salidas;
- entidades y estados;
- contratos con otros módulos;
- invariantes;
- errores y fallos;
- qué se simula con mocks/fakes;
- criterios PASS.

**No requiere:** PT real, cloud real, credenciales reales, GitHub Actions productivos ni integración completa.

### Fase 2 — Testeo aislado / laboratorio
**Objetivo:** convertir cada conceptualización en evidencia ejecutable independiente.

Se permiten:
- fixtures;
- datos sintéticos;
- fake provider;
- fake tenant/auth;
- fake webhooks;
- PostgreSQL local;
- test harnesses;
- simulación de fallos.

Cada mini-proyecto debe poder obtener PASS sin que toda la API exista.

### Fase 3 — Implementación e integración local
**Objetivo:** conectar los módulos que ya pasaron laboratorio.

Se construye el flujo local real:
`cliente local → API → PostgreSQL/outbox → worker → fake PT → estados/artefactos/webhook`.

Aquí empiezan a aplicarse las dependencias reales entre módulos.

### Fase 4 — Plataforma local reproducible
**Objetivo:** que el proyecto completo pueda levantarse, probarse y verificarse en el runner local del owner.

Incluye, en una etapa separada:
- contenedores;
- Docker Compose/local equivalents;
- self-hosted runner;
- CI;
- GitHub Actions que usen el runner local cuando aplique;
- lint/build/tests/migrations;
- test matrices;
- artefactos de pruebas;
- scripts reproducibles.

La infraestructura local no debe contaminar la lógica de dominio.

### Fase 5 — Integraciones externas controladas
**Objetivo:** sustituir fakes por servicios externos únicamente cuando corresponda.

Incluye:
- PT sandbox cuando el owner reactive y seleccione PT;
- DIAN/habilitación aplicable;
- cloud sandbox cuando exista autorización de gasto/credenciales;
- webhooks externos controlados.

No se salta directamente a producción.

### Fase 6 — Hardening, seguridad, recuperación y capacidad
**Objetivo:** demostrar que V1 no solo funciona sino que resiste fallos y carga.

Gates principales:
- seguridad y aislamiento;
- idempotencia/concurrencia;
- `UNKNOWN != REEMITIR`;
- fallos PT/DIAN;
- worker/DB/storage failure;
- backup + restore probado;
- observabilidad y alertas;
- benchmark de capacidad;
- costo medido.

Objetivo de capacidad inicial a demostrar: hasta ~3 M documentos/mes y ~50 docs/s de burst comercial, probando por encima antes de vender ese límite.

### Fase 7 — Piloto controlado
**Objetivo:** validar comportamiento real con pocos clientes.

Secuencia sugerida: 1 → 3 → 5 → 10 clientes antes de crecer de forma relevante.

Se miden soporte, intervenciones manuales, errores, costo, PT, DIAN y carga operativa de una sola persona.

### Fase 8 — Producción comercial V1
Solo se abre cuando todos los gates anteriores estén PASS y el owner autorice `GO TO PRODUCTION`.

## Principio de independencia

Durante Fases 1 y 2 ningún módulo debe bloquear el estudio de otro. Las dependencias faltantes se reemplazan por contratos/fakes.

Ejemplos:
- núcleo fiscal puede usar `FakeIdentity` y `FakeFiscalProvider`;
- seguridad puede proteger un endpoint ficticio;
- workers pueden procesar `FakeWorkItem`;
- webhooks pueden usar un receptor local falso;
- metering puede consumir eventos sintéticos.

## Principio de integración

Independencia de aprendizaje no significa independencia en producción. En Fase 3+ se conectan módulos respetando el diseño canónico.

## Regla de avance

```text
CONCEPT READY
  ↓
ISOLATED TEST READY
  ↓
LOCAL INTEGRATION READY
  ↓
LOCAL PLATFORM READY
  ↓
EXTERNAL INTEGRATION READY
  ↓
HARDENING/CAPACITY READY
  ↓
PILOT READY
  ↓
PRODUCTION READY
```

No se declara una fase PASS por documentación solamente cuando la fase exige evidencia ejecutable.
