# API-DIAN — Backlog maestro V1

**Estado:** FROZEN / baseline de backlog  
**Fecha:** 2026-08-19  
**Autoridad de producto:** `docs/PRODUCT-DEFINITION-V1-FINAL.md`  
**Autoridad de arquitectura:** `docs/SYSTEM-ARCHITECTURE-V1.md`  
**Orden de construcción:** `docs/BUILD-PLAN-V1.md`

> Este backlog descompone el Build Plan en unidades concretas de trabajo. No declara terminado el código existente. Más adelante cada ítem se auditará contra el repositorio y se marcará `CONSERVAR`, `ADAPTAR`, `REHACER` o `ELIMINAR` antes de volver a implementar.

---

## 1. Convención

Identificador:

```text
B<fase>-E<épica>-T<tarea>
```

Ejemplo:

```text
B4-E2-T03
```

Cada tarea debe poder cerrarse con evidencia verificable. Una tarea no se considera terminada solo porque exista código; debe cumplir su Definition of Done cuando esta se congele.

Prioridad general:

```text
P0 = seguridad/integridad/gate bloqueante
P1 = necesaria para V1
P2 = soporte/operación necesaria antes del piloto
```

---

# B0 — Producto, arquitectura y planificación

## B0-E1 — Baselines

- `B0-E1-T01` [P0] Congelar definición definitiva de producto V1. **CERRADO**
- `B0-E1-T02` [P0] Congelar arquitectura definitiva V1. **CERRADO**
- `B0-E1-T03` [P0] Congelar Build Plan V1. **CERRADO**
- `B0-E1-T04` [P0] Congelar backlog V1. **ESTE DOCUMENTO**
- `B0-E1-T05` [P0] Crear mapa explícito de dependencias.
- `B0-E1-T06` [P0] Congelar Definition of Done por tipo de tarea/fase.
- `B0-E1-T07` [P1] Crear plan diario de construcción.
- `B0-E1-T08` [P0] Auditar código existente contra backlog antes de reanudar implementación.

---

# B1 — Baseline ejecutable y gates

## B1-E1 — Runtime y estructura

- `B1-E1-T01` [P0] Fijar versión reproducible de Node.js 24 para desarrollo/CI.
- `B1-E1-T02` [P0] Confirmar TypeScript strict y configuración compartida.
- `B1-E1-T03` [P1] Confirmar estructura del monolito modular NestJS/Fastify.
- `B1-E1-T04` [P1] Separar claramente roles de arranque `api` y `worker` sin crear microservicios.

## B1-E2 — Entorno local

- `B1-E2-T01` [P0] Levantar PostgreSQL local reproducible.
- `B1-E2-T02` [P0] Versionar migraciones y comando único para aplicarlas.
- `B1-E2-T03` [P0] Crear bootstrap local sin usar superusuario como runtime.
- `B1-E2-T04` [P0] Asegurar que secretos locales no entren a Git.
- `B1-E2-T05` [P1] Documentar arranque local API/worker/DB.

## B1-E3 — Gates automáticos

- `B1-E3-T01` [P0] Gate `npm ci` reproducible.
- `B1-E3-T02` [P0] Gate build.
- `B1-E3-T03` [P0] Gate lint.
- `B1-E3-T04` [P0] Gate unit tests.
- `B1-E3-T05` [P1] Health endpoint mínimo.
- `B1-E3-T06` [P1] Readiness endpoint mínimo.
- `B1-E3-T07` [P0] CI que ejecute los gates anteriores en cada cambio relevante.

---

# B2 — Multiempresa, autenticación y perfil fiscal versionado

## B2-E1 — Tenant y aislamiento

- `B2-E1-T01` [P0] Crear entidad/tabla `tenants`.
- `B2-E1-T02` [P0] Exigir `tenant_id NOT NULL` en entidades tenant-owned.
- `B2-E1-T03` [P0] Implementar foreign keys tenant-safe.
- `B2-E1-T04` [P0] Habilitar RLS/FORCE RLS donde corresponda.
- `B2-E1-T05` [P0] Implementar tenant context transaccional seguro para conexiones pooled.
- `B2-E1-T06` [P0] Prueba adversarial tenant A → tenant B por IDs conocidos.

## B2-E2 — Credenciales POS

- `B2-E2-T01` [P0] Definir credencial por instalación POS y tenant único.
- `B2-E2-T02` [P0] Generar secret de alta entropía y almacenar solo verifier/digest.
- `B2-E2-T03` [P0] Resolver `credential → tenant` sin tenant seleccionable en body/query.
- `B2-E2-T04` [P1] Implementar revocación.
- `B2-E2-T05` [P1] Implementar rotación sin alterar histórico fiscal.
- `B2-E2-T06` [P0] Redactar `Authorization` y secretos de logs.

## B2-E3 — Roles DB

- `B2-E3-T01` [P0] Crear/validar rol `app_api` con mínimo privilegio.
- `B2-E3-T02` [P0] Crear/validar rol `app_worker` con mínimo privilegio.
- `B2-E3-T03` [P0] Crear/validar rol `app_migrator` solo para migraciones.
- `B2-E3-T04` [P0] Probar que runtime no tiene `BYPASSRLS`, ownership ni DDL indebido.

## B2-E4 — Perfil fiscal versionado

- `B2-E4-T01` [P0] Diseñar entidad/versiones de perfil fiscal por tenant.
- `B2-E4-T02` [P0] Permitir exactamente una configuración activa según política definida.
- `B2-E4-T03` [P0] Conservar referencia/snapshot de perfil usado por cada operación.
- `B2-E4-T04` [P0] Probar que cambiar configuración futura no reinterpreta histórico.
- `B2-E4-T05` [P1] Preparar provider binding versionado sin fijar aún PT real.

---

# B3 — Contrato fiscal interno y validación

## B3-E1 — Envelope y versionado

- `B3-E1-T01` [P0] Congelar `schema_version = 1.0` del contrato interno.
- `B3-E1-T02` [P0] Definir envelope común de operación fiscal.
- `B3-E1-T03` [P0] Limitar `document_kind` a FEV, CREDIT_NOTE, DEBIT_NOTE, ELECTRONIC_POS y POS_ADJUSTMENT.
- `B3-E1-T04` [P1] Definir errores estables hacia el POS.

## B3-E2 — Modelos documentales

- `B3-E2-T01` [P0] Modelo interno FEV.
- `B3-E2-T02` [P0] Modelo interno Nota Crédito.
- `B3-E2-T03` [P0] Modelo interno Nota Débito.
- `B3-E2-T04` [P0] Modelo interno DEE POS.
- `B3-E2-T05` [P0] Modelo interno Nota de ajuste DEE POS.
- `B3-E2-T06` [P0] Relaciones seguras con documento original.

## B3-E3 — Validación y aritmética

- `B3-E3-T01` [P0] Validación estructural y límites de payload.
- `B3-E3-T02` [P0] Validación de campos obligatorios conocidos.
- `B3-E3-T03` [P0] Validación básica de consistencia de líneas/totales/impuestos.
- `B3-E3-T04` [P0] Parser decimal exacto; prohibir float como autoridad fiscal.
- `B3-E3-T05` [P0] Validar fecha/hora con offset explícito.
- `B3-E3-T06` [P1] Rechazar mass assignment de campos internos.

## B3-E4 — Canonicalización

- `B3-E4-T01` [P0] Definir semantic projection.
- `B3-E4-T02` [P0] Implementar normalización Unicode/enums/decimales.
- `B3-E4-T03` [P0] Serialización determinista de objetos/arrays.
- `B3-E4-T04` [P0] Versionar `fiscal-command-c14n/1`.
- `B3-E4-T05` [P0] Probar equivalencia semántica y diferencias fiscales reales.

---

# B4 — Idempotencia, persistencia y máquina de estados

## B4-E1 — Operación fiscal durable

- `B4-E1-T01` [P0] Crear `fiscal_operations`.
- `B4-E1-T02` [P0] Guardar snapshot inmutable del comando aceptado.
- `B4-E1-T03` [P0] Guardar semantic hash + versión de contrato/canonicalización.
- `B4-E1-T04` [P0] Constraint único `(tenant_id, idempotency_key)`.
- `B4-E1-T05` [P0] Asociar versión/snapshot del perfil fiscal utilizado.

## B4-E2 — Ingreso atómico

- `B4-E2-T01` [P0] Crear transacción única para auth/tenant + validación + idempotencia + operación.
- `B4-E2-T02` [P0] Crear trabajo durable en la misma aceptación lógica cuando sea nueva.
- `B4-E2-T03` [P0] Crear auditoría mínima en el ingreso.
- `B4-E2-T04` [P0] Replay misma key/hash devuelve misma operación.
- `B4-E2-T05` [P0] Misma key/hash distinto devuelve conflicto sin side effect.
- `B4-E2-T06` [P0] Prueba de carrera concurrente sobre misma key.

## B4-E3 — Máquina de estados

- `B4-E3-T01` [P0] Implementar estados fiscales internos permitidos.
- `B4-E3-T02` [P0] Centralizar transiciones válidas.
- `B4-E3-T03` [P0] Implementar `state_version`/expected state.
- `B4-E3-T04` [P0] Guard DB/application contra transiciones imposibles.
- `B4-E3-T05` [P1] Implementar consulta tenant-safe de operación.

---

# B5 — Trabajo durable, worker y frontera de side effect

## B5-E1 — Scheduler durable

- `B5-E1-T01` [P0] Crear `work_items` separado del estado fiscal.
- `B5-E1-T02` [P0] Implementar claim con locking/lease.
- `B5-E1-T03` [P0] Recuperar leases expirados sin asumir operación no enviada.
- `B5-E1-T04` [P0] Evitar trabajos activos equivalentes peligrosos.
- `B5-E1-T05` [P0] Prueba de múltiples workers reclamando en paralelo.

## B5-E2 — Worker

- `B5-E2-T01` [P0] Proceso/rol `worker` separado del HTTP runtime.
- `B5-E2-T02` [P0] Worker procesa una operación bajo tenant explícito.
- `B5-E2-T03` [P0] Worker no puede ejecutar DDL.
- `B5-E2-T04` [P0] API runtime no posee secreto del PT.

## B5-E3 — Provider attempt y side effect boundary

- `B5-E3-T01` [P0] Crear `provider_attempts`.
- `B5-E3-T02` [P0] Persistir attempt/correlación antes de llamada remota.
- `B5-E3-T03` [P0] Garantizar un solo intento mutante activo por operación.
- `B5-E3-T04` [P0] No mantener transacción SQL abierta durante HTTP PT.
- `B5-E3-T05` [P0] Deshabilitar retry HTTP transparente de mutaciones.
- `B5-E3-T06` [P0] Crash de attempt stale → camino de incertidumbre, no submit automático.

## B5-E4 — Control de daño

- `B5-E4-T01` [P0] Implementar `provider_mutations_enabled` fail-closed.
- `B5-E4-T02` [P1] Auditar cambios del kill switch.
- `B5-E4-T03` [P0] Probar comportamiento con llamada ya en vuelo.

---

# B6 — Reconciliación, FakeFiscalProvider y fault injection

## B6-E1 — Puerto FiscalProvider

- `B6-E1-T01` [P0] Definir puerto mínimo `submit/reconcile/getStatus/fetchXml/fetchPdf`.
- `B6-E1-T02` [P0] Asegurar que no existe `resend()`.
- `B6-E1-T03` [P0] Aislar toda semántica propietaria futura dentro de provider adapter.

## B6-E2 — FakeFiscalProvider

- `B6-E2-T01` [P0] Simular aceptación concluyente.
- `B6-E2-T02` [P0] Simular rechazo concluyente.
- `B6-E2-T03` [P0] Simular `PROVEN_NOT_SENT`.
- `B6-E2-T04` [P0] Simular timeout ambiguo con posible side effect.
- `B6-E2-T05` [P1] Simular respuesta tardía.
- `B6-E2-T06` [P1] Simular respuesta malformada.
- `B6-E2-T07` [P1] Simular rate limit/indisponibilidad.
- `B6-E2-T08` [P0] Ledger fake independiente de la respuesta inmediata para reconciliación.

## B6-E3 — UNKNOWN y reconciliación

- `B6-E3-T01` [P0] `SUBMITTING → UNKNOWN` ante resultado ambiguo.
- `B6-E3-T02` [P0] `UNKNOWN → RECONCILING`.
- `B6-E3-T03` [P0] Resolver `FOUND_ACCEPTED`.
- `B6-E3-T04` [P0] Resolver `FOUND_REJECTED`.
- `B6-E3-T05` [P0] Modelar `NOT_FOUND_CONCLUSIVE` con barra de evidencia alta.
- `B6-E3-T06` [P0] Modelar `INDETERMINATE`.
- `B6-E3-T07` [P0] Prohibir `UNKNOWN → SUBMITTING` automático.
- `B6-E3-T08` [P1] Backoff acotado y escalamiento a `NEEDS_ATTENTION`.

## B6-E4 — Contract harness

- `B6-E4-T01` [P0] Suite común de contrato para cualquier adapter real.
- `B6-E4-T02` [P0] Fixture `PROVEN_NOT_SENT` exige prueba referenciada.
- `B6-E4-T03` [P0] Fixture `NOT_FOUND_CONCLUSIVE` exige prueba referenciada.
- `B6-E4-T04` [P0] Prueba completa timeout → UNKNOWN → reconcile → no blind retry.

---

# B7 — Evidencia, artefactos y operación segura

## B7-E1 — Evidencia y auditoría

- `B7-E1-T01` [P0] Crear/confirmar `evidence_records` append-only.
- `B7-E1-T02` [P0] Crear/confirmar `audit_events` append-only.
- `B7-E1-T03` [P0] Conservar respuesta/error PT relevante antes de interpretación destructiva.
- `B7-E1-T04` [P0] Registrar actor técnico, tenant, correlación y transición.
- `B7-E1-T05` [P0] Probar que roles runtime no pueden borrar/editar evidencia ordinariamente.

## B7-E2 — XML/PDF

- `B7-E2-T01` [P0] Modelo `artifacts` con checksum/tamaño/content-type.
- `B7-E2-T02` [P1] Recuperación XML independiente del side effect fiscal.
- `B7-E2-T03` [P1] Recuperación PDF independiente del side effect fiscal.
- `B7-E2-T04` [P0] Fallo de artefacto nunca reabre emisión.
- `B7-E2-T05` [P1] Abstracción de object storage privado sin congelar proveedor cloud.

## B7-E3 — Observabilidad

- `B7-E3-T01` [P1] Logs estructurados minimizados.
- `B7-E3-T02` [P1] Métricas de operaciones por estado.
- `B7-E3-T03` [P0] Métrica/cantidad/edad de `UNKNOWN`.
- `B7-E3-T04` [P1] Métrica backlog/reconciliaciones/intentos.
- `B7-E3-T05` [P1] Separar errores propios de errores PT.
- `B7-E3-T06` [P1] Pocas alertas accionables.

## B7-E4 — Operación

- `B7-E4-T01` [P0] Implementar `accept_new_operations` fail-closed.
- `B7-E4-T02` [P1] Operator path mínimo y auditable.
- `B7-E4-T03` [P1] Runbook PT caído.
- `B7-E4-T04` [P1] Runbook crecimiento de UNKNOWN.
- `B7-E4-T05` [P1] Runbook credencial comprometida.
- `B7-E4-T06` [P1] Runbook deploy fallido/rollback.

---

# B8 — Gate externo: selección del PT

## B8-E1 — Acceso y documentación

- `B8-E1-T01` [P0] Solicitar sandbox/DEMO HKA.
- `B8-E1-T02` [P0] Abrir solicitud administrativa DATAICO en paralelo.
- `B8-E1-T03` [P1] Mantener Facture/ESTELA como reserva.
- `B8-E1-T04` [P0] Obtener documentación técnica vigente del candidato.
- `B8-E1-T05` [P0] Obtener modelo contractual multiempresa/casa de software.
- `B8-E1-T06` [P0] Confirmar responsabilidad de firma/certificado.

## B8-E2 — Alcance documental

- `B8-E2-T01` [P0] Probar FEV.
- `B8-E2-T02` [P0] Probar Nota Crédito.
- `B8-E2-T03` [P0] Probar Nota Débito.
- `B8-E2-T04` [P0] Probar DEE POS.
- `B8-E2-T05` [P0] Probar nota de ajuste DEE POS.

## B8-E3 — Seguridad de ambigüedad

- `B8-E3-T01` [P0] Ejecutar timeout controlado después de posible recepción.
- `B8-E3-T02` [P0] Identificar correlación disponible pre/post submit.
- `B8-E3-T03` [P0] Probar reconcile/read-only después de timeout.
- `B8-E3-T04` [P0] Probar comportamiento ante duplicado/reenvío.
- `B8-E3-T05` [P0] Determinar significado contractual de “no encontrado”.
- `B8-E3-T06` [P0] Determinar si existe criterio seguro real para `PROVEN_NOT_SENT`.
- `B8-E3-T07` [P0] Clasificar cada caso PASS/FAIL/INCONCLUSIVE con evidencia sanitizada.

## B8-E4 — Operación/comercial

- `B8-E4-T01` [P1] Probar recuperación XML/PDF.
- `B8-E4-T02` [P1] Registrar rate limits/timeouts reales.
- `B8-E4-T03` [P1] Evaluar soporte/escalamiento/SLA.
- `B8-E4-T04` [P0] Revisar tratamiento/custodia de datos.
- `B8-E4-T05` [P1] Obtener precio API/costes reales.
- `B8-E4-T06` [P0] Seleccionar exactamente un PT que pase gates.

---

# B9 — Adapter real y dominio fiscal final

## B9-E1 — Integración PT

- `B9-E1-T01` [P0] Crear exactamente un adapter real.
- `B9-E1-T02` [P0] Configurar autenticación/secret PT solo en worker.
- `B9-E1-T03` [P0] Mapear comando interno → payload PT.
- `B9-E1-T04` [P0] Mapear respuesta PT → resultado normalizado.
- `B9-E1-T05` [P0] Conservar raw response/evidence antes del mapping final.
- `B9-E1-T06` [P0] Implementar correlación real según evidencia B8.

## B9-E2 — Reconciliación real

- `B9-E2-T01` [P0] Implementar reconcile real.
- `B9-E2-T02` [P0] Mapear aceptación/rechazo encontrados.
- `B9-E2-T03` [P0] Implementar `NOT_FOUND_CONCLUSIVE` solo si B8 lo demuestra.
- `B9-E2-T04` [P0] Implementar `PROVEN_NOT_SENT` solo si B8 lo demuestra.
- `B9-E2-T05` [P0] Nunca mapear un 404/texto por nombre a seguridad de retry.

## B9-E3 — Artefactos y configuración PT

- `B9-E3-T01` [P1] Recuperación XML real.
- `B9-E3-T02` [P1] Recuperación PDF real.
- `B9-E3-T03` [P0] Provider binding versionado por tenant.
- `B9-E3-T04` [P0] Completar campos de perfil fiscal exigidos por PT/regulación.

## B9-E4 — Contingencias

- `B9-E4-T01` [P0] Verificar regulación vigente aplicable a contingencias V1.
- `B9-E4-T02` [P0] Mapear hechos operativos internos a flujos fiscales permitidos.
- `B9-E4-T03` [P0] Evitar que el POS seleccione códigos DIAN/PT arbitrariamente.
- `B9-E4-T04` [P0] Pruebas de contingencia contra sandbox/PT.

## B9-E5 — Contract tests reales

- `B9-E5-T01` [P0] Convertir evidencia PASS B8 en fixtures sanitizados.
- `B9-E5-T02` [P0] Ejecutar suite común completa contra adapter real.
- `B9-E5-T03` [P0] Bloquear promoción si un gate crítico queda FAIL/INCONCLUSIVE.

---

# B10 — Plataforma productiva y recuperación

## B10-E1 — Selección cloud

- `B10-E1-T01` [P0] Comparar proveedores por seguridad, restore, coste y carga operativa.
- `B10-E1-T02` [P0] Elegir PostgreSQL administrado.
- `B10-E1-T03` [P1] Elegir object storage privado.
- `B10-E1-T04` [P0] Elegir secret manager/configuración secreta.
- `B10-E1-T05` [P1] Elegir observabilidad administrada.

## B10-E2 — Despliegue

- `B10-E2-T01` [P0] Empaquetado productivo reproducible API.
- `B10-E2-T02` [P0] Empaquetado productivo reproducible worker.
- `B10-E2-T03` [P0] Inyección separada de secretos por runtime.
- `B10-E2-T04` [P0] TLS y networking mínimos.
- `B10-E2-T05` [P1] Deployment automatizado/controlado.
- `B10-E2-T06` [P1] Rollback de aplicación documentado/probado.

## B10-E3 — Backup/restore

- `B10-E3-T01` [P0] Configurar backup/PITR acorde al riesgo.
- `B10-E3-T02` [P0] Ejecutar restore real de PostgreSQL.
- `B10-E3-T03` [P0] Probar divergencia DB restaurada vs PT externo.
- `B10-E3-T04` [P0] Pausar mutaciones peligrosas durante reconciliación post-restore.
- `B10-E3-T05` [P0] Reanudar solo después de reconciliar ventana relevante.
- `B10-E3-T06` [P1] Validar estrategia de recuperación/versionado de object storage.

---

# B11 — Integración POS → API-DIAN

## B11-E1 — Cliente fiscal POS

- `B11-E1-T01` [P0] Almacenar credencial POS de forma segura según plataforma del POS.
- `B11-E1-T02` [P0] Generar idempotency key por intención fiscal.
- `B11-E1-T03` [P0] Reutilizar la misma key ante retry de la misma intención.
- `B11-E1-T04` [P0] Construir request conforme contrato V1.
- `B11-E1-T05` [P1] Consultar estado por `operation_id`.

## B11-E2 — UX de estados

- `B11-E2-T01` [P0] Mostrar/gestionar ACCEPTED.
- `B11-E2-T02` [P0] Mostrar/gestionar rechazo accionable.
- `B11-E2-T03` [P0] Tratar UNKNOWN como espera/reconciliación, no reemisión.
- `B11-E2-T04` [P0] Tratar RECONCILING sin crear otra intención.
- `B11-E2-T05` [P1] Manejar NEEDS_ATTENTION de forma operativa.
- `B11-E2-T06` [P1] Recuperar XML/PDF cuando estén disponibles.

## B11-E3 — Conectividad POS

- `B11-E3-T01` [P0] Reintentos de transporte compatibles con idempotencia.
- `B11-E3-T02` [P0] Comportamiento offline compatible con el flujo fiscal definido.
- `B11-E3-T03` [P0] Probar reconexión sin generar operaciones duplicadas.

---

# B12 — Validación adversarial integral

## B12-E1 — Concurrencia y crashes

- `B12-E1-T01` [P0] Carrera misma idempotency key.
- `B12-E1-T02` [P0] Carrera misma key con payload distinto.
- `B12-E1-T03` [P0] Muchos comandos distintos en paralelo.
- `B12-E1-T04` [P0] Dos/múltiples workers compitiendo.
- `B12-E1-T05` [P0] Crash antes de claim.
- `B12-E1-T06` [P0] Crash después de provider_attempt/pre-call.
- `B12-E1-T07` [P0] Crash después de side effect PT antes de persistir resultado.

## B12-E2 — Fallos externos

- `B12-E2-T01` [P0] Timeout ambiguo real/controlado.
- `B12-E2-T02` [P0] Respuesta tardía.
- `B12-E2-T03` [P0] PT prolongadamente indisponible.
- `B12-E2-T04` [P1] Object storage indisponible.
- `B12-E2-T05` [P0] Credencial PT inválida/revocada.

## B12-E3 — Seguridad

- `B12-E3-T01` [P0] BOLA tenant A → B lectura.
- `B12-E3-T02` [P0] BOLA tenant A → B mutación/relación.
- `B12-E3-T03` [P0] Credential revocada.
- `B12-E3-T04` [P0] Payload oversized/mass assignment.
- `B12-E3-T05` [P0] SQL injection sobre campos libres/queries parametrizadas.
- `B12-E3-T06` [P0] Logs sin Authorization/secrets/payload completo.
- `B12-E3-T07` [P0] Object storage privado/autorizado.

## B12-E4 — Operación/DR

- `B12-E4-T01` [P0] Kill switches con operaciones en vuelo.
- `B12-E4-T02` [P0] Reinicio con backlog pendiente.
- `B12-E4-T03` [P0] Restore + divergencia frente al PT.
- `B12-E4-T04` [P1] Carga basada en volumen esperado del piloto.
- `B12-E4-T05` [P0] Todos los invariantes tienen prueba reproducible.

---

# B13 — Piloto controlado

## B13-E1 — Preparación

- `B13-E1-T01` [P0] Seleccionar muy pocos tenants piloto.
- `B13-E1-T02` [P0] Definir límites iniciales de volumen/riesgo.
- `B13-E1-T03` [P1] Definir canal operativo de soporte/escalamiento.
- `B13-E1-T04` [P0] Confirmar runbooks/kill switches/restore antes de primer documento real.

## B13-E2 — Operación piloto

- `B13-E2-T01` [P0] Monitorear UNKNOWN y reconciliaciones diariamente.
- `B13-E2-T02` [P1] Medir latencia propia vs PT.
- `B13-E2-T03` [P1] Medir carga real del operador.
- `B13-E2-T04` [P1] Registrar incidentes y causas.
- `B13-E2-T05` [P1] Corregir defectos sin ampliar alcance por conveniencia.

## B13-E3 — Gate de salida

- `B13-E3-T01` [P0] Demostrar operación estable con comercios reales.
- `B13-E3-T02` [P0] Demostrar recuperación practicable.
- `B13-E3-T03` [P0] Demostrar carga operativa sostenible para una persona.

---

# B14 — Cierre V1

## B14-E1 — Readiness final

- `B14-E1-T01` [P0] Confirmar todos los documentos V1 desde POS real.
- `B14-E1-T02` [P0] Confirmar un único PT real integrado y contractualizado.
- `B14-E1-T03` [P0] Confirmar UNKNOWN/reconcile sin reemisión ciega.
- `B14-E1-T04` [P0] Confirmar aislamiento multiempresa.
- `B14-E1-T05` [P0] Confirmar trazabilidad/evidencia recuperable.
- `B14-E1-T06` [P0] Confirmar XML/PDF.
- `B14-E1-T07` [P0] Confirmar contingencias V1 necesarias.
- `B14-E1-T08` [P0] Confirmar restore probado.
- `B14-E1-T09` [P0] Confirmar seguridad/secretos/roles.
- `B14-E1-T10` [P0] Confirmar que no quedan fallos críticos abiertos.

## B14-E2 — Congelación de lanzamiento

- `B14-E2-T01` [P1] Actualizar documentación operativa final.
- `B14-E2-T02` [P1] Registrar límites/riesgos aceptados de V1.
- `B14-E2-T03` [P0] Declarar V1 lista solo si cumple baseline de producto, no por cantidad de código.

---

## 2. Reglas para convertir este backlog en trabajo diario

Una tarea diaria futura debe:

1. tener uno o pocos IDs de backlog claramente relacionados;
2. poder completarse y probarse en una sesión razonable;
3. no mezclar cambios de producto, arquitectura y código en la misma unidad;
4. incluir happy path y fallo relevante cuando corresponda;
5. terminar con gates verdes;
6. producir evidencia concreta: tests, migración, documento, resultado sandbox o runbook probado;
7. no declarar `DONE` una tarea externa `INCONCLUSIVE`;
8. no forzar una tarea PT si faltan credenciales/documentación reales.

Si una tarea resulta demasiado grande durante el plan diario, se divide antes de implementarla.

---

## 3. Trabajo paralelo permitido

Mientras se construyen B1–B7 se puede adelantar B8 administrativamente:

```text
solicitar sandbox
obtener documentación
negociar contrato/precio
programar pruebas con PT
```

Pero queda prohibido:

```text
inventar endpoints PT
inventar códigos/estados
construir adapter productivo sin evidencia
mapear 404/no-enviado a seguridad de retry por intuición
```

B9 depende del gate real de B8.

---

## 4. Próximos entregables de planificación

A partir de este backlog:

```text
BACKLOG-V1.md
  ↓
DEPENDENCY-MAP-V1.md
  ↓
DEFINITION-OF-DONE-V1.md
  ↓
DAILY-BUILD-PLAN-V1.md
  ↓
AUDIT-EXISTING-CODE-V1.md
  ↓
reanudar implementación
```

---

## Regla final

**El backlog es una lista de obligaciones verificables, no una lista de archivos por crear. Cada ítem existe para demostrar una capacidad del producto o reducir un riesgo real.**
