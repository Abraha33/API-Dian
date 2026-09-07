# Validación técnica adversarial

> Método: revisión independiente por ocho perspectivas; se intentó refutar el diseño. Resultado tras correcciones: **PASS WITH IMPLEMENTATION GATES, sin blocker arquitectónico crítico**.

## Hallazgos y correcciones

| Revisor | Intento de refutación | Resultado/corrección |
|---|---|---|
| Principal Architect | La Fase 6 era POS-first y mezclaba dominios | Se reemplazó frontera, componentes y autoridad documental; POS queda consumidor |
| SaaS Architect | “Tenant” no soportaba integrador multiempresa | Se separaron tenant, organization, application y grants |
| API Architect | Endpoints y errores filtraban lifecycle interno/PT | Recurso unificado, OpenAPI, 202, idempotencia, versionado y error estable |
| Security Engineer | API key sola y `tenant_id` de payload permitían BOLA | principal autenticado, scopes+grants, RLS, FK compuestas, hash/rotación, WAF y tests |
| SRE | DB queue, DIAN timeout y webhook podían duplicar/bloquear | outbox, persist-before-send, lease, `unknown`, DLQ, circuit breaker y SLOs |
| Especialista DIAN | Catálogo incompleto; sector confundido con DIAN | catálogo oficial, 12 DEE, nómina, soporte, RADIAN; salud/RNDC separados; revalidación por release |
| Backend senior | Microservicios y OAuth propio excederían a una persona | monolito modular, un PT, API/worker misma imagen, IdP administrado posterior |
| FinOps | costo PT omitido y 10k clientes era falsa precisión | rangos, supuestos, precio/1.000, PT excluido explícito y benchmark obligatorio |

## Checks de consistencia

- [x] Producto público desde V1 y terceros first-class.
- [x] Catálogo y roadmap coinciden con módulos/contrato.
- [x] V1 no depende de POS, inventario, caja ni offline.
- [x] Aislamiento cubre API, DB, worker, objetos, webhooks, logs y soporte.
- [x] Estado canónico no depende de cola, cache, PT ni PDF.
- [x] Retry ambiguo no puede reenviar.
- [x] Costes describen la infraestructura elegida y separan PT.
- [x] Diagramas coinciden con texto.
- [x] Operación inicial requiere dos procesos y servicios administrados, no una flota de microservicios.

## Riesgos no bloqueantes

| Riesgo | Severidad | Propietario/gate |
|---|---|---|
| Contrato/capabilities/precio PT no cerrado | Alto | selección PT antes de implementación del adapter/producción |
| Cambios normativos/anexos después del corte | Alto | regulatory diff en cada release |
| Custodia de certificado depende del PT | Alto | capability map; si propia, nueva revisión de amenaza |
| Capacidad no medida | Medio | benchmark antes de piloto/SLA |
| Restore no ejecutado en cloud final | Alto | restore drill antes de producción |
| Pentest no ejecutado | Alto | pentest antes de API pública producción |
| RPO/RTO y soporte 24/7 limitados por una persona | Medio | SLA conservador, managed services y escalamiento humano según ventas |

Estos riesgos bloquean producción cuando su gate aplica, pero no dejan indefinida la arquitectura.

## Criterio final

No hay SPOF lógico sin recuperación definida, acceso cross-tenant aceptado, side effect ambiguo sin protocolo, dominio crítico sin dueño ni componente injustificado para lanzamiento. Por ello la definición arquitectónica puede pasar; los gates de implementación siguen visibles.

