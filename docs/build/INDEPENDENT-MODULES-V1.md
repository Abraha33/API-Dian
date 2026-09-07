# API-DIAN — Módulos independientes V1

> Objetivo: permitir estudiar, construir y probar cada aspecto importante sin exigir que todo el producto esté terminado.

Cada módulo tiene un contrato claro y puede usar mocks/fakes para reemplazar dependencias todavía no construidas.

## M01 — Contrato de API pública

Explora:
- HTTP/REST;
- JSON;
- OpenAPI 3.1;
- endpoints;
- errores;
- versionado.

Puede probarse con un core fiscal falso.

PASS: un cliente de prueba puede crear/consultar un recurso usando únicamente el contrato publicado.

## M02 — PostgreSQL y modelo de datos

Explora:
- schemas;
- migraciones;
- constraints;
- índices;
- transacciones;
- locking;
- concurrencia;
- persistencia.

Puede probarse sin DIAN ni PT.

PASS: constraints e invariantes sobreviven concurrencia y reinicios definidos.

## M03 — Multitenancy

Explora:
- tenant;
- organization;
- environment;
- RLS;
- foreign keys compuestas;
- aislamiento.

Puede usar endpoints y documentos ficticios.

PASS: tenant A nunca puede leer/escribir datos de tenant B en los casos de prueba.

## M04 — Seguridad y API credentials

Explora:
- autenticación;
- API keys;
- hash + pepper;
- scopes/grants;
- rotación;
- revocación;
- rate limiting conceptual.

Puede usar un endpoint `/test` sin lógica fiscal.

PASS: credenciales inválidas/revocadas no operan; permisos mínimos se respetan.

## M05 — Núcleo fiscal

Explora:
- FEV;
- nota crédito;
- nota débito;
- reglas;
- aritmética exacta;
- relaciones;
- canonicalización;
- estados.

Puede usar organización y `FakeFiscalProvider` sintéticos.

PASS: fixtures fiscales válidos/incorrectos producen resultados deterministas.

## M06 — Idempotencia, estado y reconciliación

Explora:
- `Idempotency-Key`;
- semantic hash;
- máquina de estados;
- concurrencia;
- `UNKNOWN`;
- reconciliación.

Puede trabajar sin PT real.

PASS: no existen duplicados ante requests concurrentes/repetidos y `UNKNOWN` nunca provoca retry ciego.

## M07 — Worker, outbox y cola durable

Explora:
- API vs worker;
- outbox;
- work queue;
- leases;
- `FOR UPDATE SKIP LOCKED`;
- crash recovery;
- backpressure.

Puede procesar trabajos ficticios.

PASS: matar un worker no pierde el trabajo ni crea doble side effect.

## M08 — Provider Adapter

Explora:
- ports/adapters;
- mapeo de contratos;
- timeouts;
- errores remotos;
- capability map.

Primero: `FakeFiscalProvider`.
Después: PT real cuando se autorice.

PASS local: el core no depende del formato de un proveedor concreto.

## M09 — Webhooks

Explora:
- entrega asíncrona;
- firma/autenticidad;
- retries;
- DLQ/estado de entrega;
- endpoints lentos/caídos.

Puede usar eventos ficticios.

PASS: fallo del webhook nunca cambia incorrectamente el estado fiscal y la entrega puede reintentarse de forma segura.

## M10 — Quotas, usage y modelo comercial técnico

Explora:
- contador de documentos;
- cuotas;
- planes;
- consumo por tenant/organization/app;
- idempotencia de metering;
- reportes de uso.

No requiere cobro real.

PASS: la misma operación fiscal no se cobra dos veces y el uso puede auditarse.

## M11 — Contingencias y fault injection

Explora:
- PT caído;
- DIAN caído;
- 429;
- 5xx;
- timeout ambiguo;
- DB temporalmente caída;
- storage caído;
- certificado/numeración inválida;
- bad deploy conceptual.

PASS: cada fallo conocido tiene estado seguro, evidencia y acción definida.

## M12 — Observabilidad, capacidad y operación

Explora:
- logs;
- métricas;
- trazas;
- alertas;
- load testing;
- soak testing;
- restore;
- costos;
- runbooks;
- operación por una persona.

Puede comenzar con una API ficticia antes de integrar el producto completo.

PASS final: la configuración exacta demuestra sus límites con métricas reproducibles.

---

# Regla para mini-proyectos

Cada módulo puede convertirse en un mini-proyecto educativo con esta plantilla:

1. **Qué vas a aprender**.
2. **Modelo mental sencillo**.
3. **Conceptualización**.
4. **Contrato mínimo**.
5. **Implementación aislada**.
6. **Tests normales**.
7. **Tests de fallo**.
8. **Mediciones**.
9. **Criterio PASS**.
10. **Qué parte se reutiliza en API-DIAN real**.

El mini-proyecto educativo no sustituye al módulo de producción: enseña y produce evidencia reutilizable cuando sea apropiado.