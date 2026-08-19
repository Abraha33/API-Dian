# API-DIAN — Auditoría del código existente contra el plan V1

**Fecha:** 2026-08-19  
**Estado:** FROZEN / baseline de auditoría pre-implementación  
**Autoridades:** `PRODUCT-DEFINITION-V1-FINAL.md` → `SYSTEM-ARCHITECTURE-V1.md` → `BUILD-PLAN-V1.md` → `BACKLOG-V1.md` → `DEFINITION-OF-DONE-V1.md` → `DAILY-BUILD-PLAN-V1.md`

## 1. Propósito

Determinar qué trabajo adelantado del repositorio puede conservarse antes de reanudar implementación.

Esta auditoría **no declara terminado algo por existir un archivo**. Se basa en código, migraciones, tests, scripts de verificación, runbooks y evidencia de CI ya registrada en el repositorio.

Clasificación:

```text
DONE_EXISTING     existe y satisface sustancialmente el gate de la jornada
ADAPT             existe una base útil, pero faltan requisitos del baseline/DoD congelado
REBUILD           existe, pero el enfoque contradice producto/arquitectura y debe rehacerse
NEW               la capacidad no existe de forma ejecutable suficiente
BLOCKED_EXTERNAL  depende de evidencia/servicio externo todavía no disponible
```

Antes de modificar runtime nuevamente se deben volver a ejecutar los gates actuales sobre `dev`; la evidencia histórica verde se conserva, pero esta auditoría es principalmente estática/de trazabilidad.

---

## 2. Resultado ejecutivo

De las 59 jornadas técnicas previas al piloto:

| Estado | Jornadas | Lectura |
|---|---:|---|
| `DONE_EXISTING` | 23 | trabajo sustancialmente reutilizable |
| `ADAPT` | 18 | base válida con huecos concretos |
| `NEW` | 11 | capacidad todavía no construida |
| `BLOCKED_EXTERNAL` | 7 | requiere PT real u otra dependencia externa |
| `REBUILD` | 0 | no se encontró una pieza que obligue a tirar el núcleo y empezar de cero |

Conclusión:

**El código adelantado no debe eliminarse. La estrategia correcta es conservar el núcleo probado, completar los huecos y volver a cerrar cada jornada bajo el DoD definitivo.**

---

# 3. Auditoría jornada por jornada

## Tramo 1 — Baseline ejecutable

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 01 Runtime reproducible | `DONE_EXISTING` | Node 24 en CI; TypeScript `strict`; NestJS/Fastify; entrypoints separados `main.ts`/`worker.ts`. |
| 02 PostgreSQL y migraciones locales | `DONE_EXISTING` | `docker-compose.dev.yml`, migraciones versionadas, `bootstrap-local.ps1`, provisioning de logins no privilegiados. |
| 03 CI y gates mínimos | `DONE_EXISTING` | CI ejecuta install, audit, build, lint, unit, migraciones/verificaciones SQL, e2e, concurrencia y harness PT; `/health` y `/ready` existen. |

**Disposición B1:** conservar.

---

## Tramo 2 — Multiempresa y seguridad de identidad

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 04 Tenant base | `DONE_EXISTING` | `app.tenants`, `tenant_id NOT NULL`, FKs compuestas tenant-safe en entidades críticas. |
| 05 RLS y tenant context | `DONE_EXISTING` | RLS/FORCE RLS; `set_config('app.tenant_id', ..., true)` dentro de transacción del pool. |
| 06 Adversarial tenant A→B | `DONE_EXISTING` | e2e no revela operación de tenant B; verificación SQL comprueba RLS y que worker no cruce tenant. |
| 07 Credencial POS | `DONE_EXISTING` | token opaco, secreto 32 bytes, HMAC-SHA256 + pepper, timing-safe compare, credential→tenant. |
| 08 Revocación, rotación y redacción | `ADAPT` | revocación/expiración son respetadas y Pino redacta secretos; falta cerrar flujo/tooling reproducible de rotación y pruebas completas de rotación/revocación según DoD definitivo. |
| 09 Roles DB least privilege | `DONE_EXISTING` | `app_api`, `app_worker`, `app_migrator`, ops separados; CI verifica no superuser/BYPASSRLS/DDL indebido en runtimes. |
| 10 Perfil fiscal versionado | `NEW` | el baseline definitivo exige perfil/configuración fiscal versionado por tenant; el esquema actual no contiene esta entidad y el worker usa bindings fake/hardcodeados. |

**Disposición B2:** conservar aislamiento/auth; implementar perfil fiscal versionado y terminar lifecycle de credenciales.

---

## Tramo 3 — Contrato fiscal interno

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 11 Envelope y versión 1.0 | `ADAPT` | existe DTO versionado y algunos códigos estables; falta unificar/terminar el modelo de errores y contrato completo según baseline. |
| 12 FEV + DEE POS | `NEW` | los tipos existen como enum, pero `document` sigue siendo `Record<string, unknown>`; no hay modelo fiscal tipado/validado por documento. |
| 13 NC + ND + ajuste POS | `NEW` | tipos declarados y columna `related_operation_id` existen, pero intake no modela/valida relaciones ni payload específico. |
| 14 Validación estructural | `ADAPT` | ValidationPipe/whitelist valida envelope; el contenido fiscal interno es todavía objeto opaco y faltan validaciones nested/mass-assignment específicas. |
| 15 Decimales y tiempo | `ADAPT` | timestamp ISO y canonicalizador de strings decimales existen; falta validación por campo, aritmética/consistencia y reglas de precisión del contrato tipado. |
| 16 Canonicalización semántica | `ADAPT` | motor determinista + tests existen y normalizan NFC/decimales/orden; debe ajustarse/revalidarse contra los schemas tipados definitivos, evitando depender solo de nombres heurísticos de campos. |

**Disposición B3:** este es uno de los mayores huecos actuales. No rehacer el motor de canonicalización sin necesidad; primero modelar el contrato y luego adaptarlo.

---

## Tramo 4 — Idempotencia y estado

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 17 Operación fiscal durable | `ADAPT` | operación, snapshot, hash e inmutabilidad existen; falta asociar versión/snapshot de perfil fiscal histórico. |
| 18 Ingreso atómico | `DONE_EXISTING` | repository crea operación + work item + audit dentro de una misma transacción tenant-scoped. |
| 19 Replay y conflicto | `DONE_EXISTING` | misma key/hash reutiliza operación; misma key/semántica distinta produce conflicto. |
| 20 Carrera de idempotencia | `DONE_EXISTING` | test de 32 requests iguales y carrera con payload distinto; DB garantiza una operación/work/audit. |
| 21 Máquina de estados | `DONE_EXISTING` | estados y transiciones protegidos por DB trigger + `state_version`; transiciones inválidas probadas. |

**Disposición B4:** conservar; adaptar operación para incorporar referencia histórica de perfil fiscal.

---

## Tramo 5 — Worker y frontera de side effect

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 22 Work items durables | `DONE_EXISTING` | tabla durable, leases, retry, dead, índice de claim y unicidad de trabajo activo. |
| 23 Claim concurrente | `DONE_EXISTING` | `FOR UPDATE SKIP LOCKED` + test concurrente de 42 claims sin duplicación. |
| 24 Runtime worker least privilege | `DONE_EXISTING` | composition root separado, DB login worker separado; API no recibe secreto PT; roles verificados. |
| 25 Provider attempt pre-send | `DONE_EXISTING` | attempt/correlation se persiste y operación pasa a `SUBMITTING` antes de `provider.submit()`. |
| 26 Reglas de red y crash | `DONE_EXISTING` | llamada PT ocurre fuera de tx SQL; no hay retry HTTP mutante transparente; stale `SUBMITTING` recupera a `UNKNOWN`. |
| 27 Kill switch de mutaciones | `ADAPT` | switch existe, fail-closed y probado antes de preparar submit. Falta cerrar la ventana de carrera con una segunda verificación en el último punto seguro inmediatamente previo al side effect, además de probar ese caso. |

**Disposición B5:** conservar protocolo; hardening puntual del kill switch.

---

## Tramo 6 — Incertidumbre y reconciliación

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 28 FiscalProvider mínimo | `DONE_EXISTING` | `submit/reconcile/getStatus/fetchXml/fetchPdf`; no existe `resend()`. |
| 29 Fake resultados concluyentes | `DONE_EXISTING` | ACCEPT, REJECT y PROVEN_NOT_SENT deterministas. |
| 30 Fake ambigüedad y fallos | `ADAPT` | timeout ambiguo, visibilidad tardía, malformed, rate limit y unavailable existen; falta escenario de respuesta realmente tardía/delayed response y cerrar pruebas más fieles de frontera temporal. |
| 31 Fake ledger y reconcile | `DONE_EXISTING` | fake guarda ledger independiente; reconciliación puede encontrar side effect aunque submit haya sido ambiguo. |
| 32 NOT_FOUND / INDETERMINATE | `DONE_EXISTING` | resultados separados; indeterminado reintenta solo lectura y termina en NEEDS_ATTENTION; guard DB exige prueba para retry mutante. |
| 33 Contract harness | `DONE_EXISTING` | harness común exige evidencia sanitizada; pruebas específicas para `PROVEN_NOT_SENT`/`NOT_FOUND_CONCLUSIVE`; e2e demuestra timeout→UNKNOWN→reconcile sin segundo submit. |

**Disposición B6:** conservar; ampliar fake/fault injection, no rediseñar el protocolo.

---

## Tramo 7 — Evidencia, artefactos y operación

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 34 Evidence + audit append-only | `ADAPT` | tablas/auditoría existen y controles operativos tienen historial append-only; el worker hoy persiste principalmente resultado normalizado/attempt y **no conserva todavía la respuesta/evidencia cruda relevante del provider en `evidence_records`**. |
| 35 Modelo de artefactos | `ADAPT` | tabla `artifacts`, checksum/tamaño/content-type y work kinds existen; módulo de storage está vacío y falta adapter de object storage privado. |
| 36 XML/PDF independientes | `ADAPT` | puerto provider contiene `fetchXml/fetchPdf`, pero worker no procesa aún `FETCH_XML/FETCH_PDF` y API no expone endpoints de artefactos. |
| 37 Observabilidad fiscal | `ADAPT` | Pino estructurado, worker events y reporte SQL operacional existen; faltan métricas/alertas administradas y gates completos de backlog/UNKNOWN para producción. |
| 38 Control operativo y runbooks | `DONE_EXISTING` | ambos kill switches, roles ops limitados, historial auditado, reporte y runbook seguro están documentados/implementados. |

**Disposición B7:** completar evidencia real, artefactos y observabilidad; conservar controles/runbooks.

---

## Pista externa / Tramo 8 — PT real

| Jornada | Estado | Motivo |
|---|---|---|
| 39 Skeleton adapter real | `BLOCKED_EXTERNAL` | requiere PT seleccionado y evidencia sandbox/contractual. |
| 40 Mapping submit | `BLOCKED_EXTERNAL` | no se inventan payloads/endpoints/códigos PT. |
| 41 Reconcile real | `BLOCKED_EXTERNAL` | requiere semántica probada de correlación/no-encontrado/duplicado. |
| 42 XML/PDF + provider binding real | `BLOCKED_EXTERNAL` | requiere APIs/credenciales reales. |
| 43 Contingencias V1 | `BLOCKED_EXTERNAL` | requiere regulación vigente + comportamiento/contrato del PT elegido. |
| 44 Contract suite real | `BLOCKED_EXTERNAL` | requiere fixtures sanitizados provenientes de sandbox/evidencia real. |

Actividades EXT-01..EXT-06 siguen `PENDING_EXTERNAL` hasta contacto/sandbox/resultado real. Evidencia pública ordena candidatos, pero no cierra el gate.

---

## Tramo 9 — Plataforma productiva

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 45 Selección cloud | `NEW` | arquitectura define capacidades, no proveedor productivo final. |
| 46 Deploy API/worker | `NEW` | no existe packaging/deploy productivo definitivo; solo entorno dev/fake. |
| 47 CI/CD y rollback | `ADAPT` | CI es sólida; falta CD productivo y procedimiento de rollback probado. |
| 48 Backup/PITR + restore real | `NEW` | requisito diseñado, pero no hay restore productivo ejecutado. |
| 49 Divergencia post-restore | `NEW` | protocolo está documentado, pero necesita implementación/prueba frente al PT real. |

---

## Tramo 10 — POS real

| Jornada | Estado | Motivo |
|---|---|---|
| 50 Cliente API en POS | `NEW` | no se demuestra en este repositorio integración del POS real con el contrato congelado. |
| 51 UX estados normales | `NEW` | pendiente integración POS. |
| 52 UX incertidumbre | `NEW` | pendiente integración POS. |
| 53 Offline/reconnect | `NEW` | pendiente prueba del POS real con reutilización correcta de idempotency key. |

---

## Tramo 11 — Intentar romper el sistema

| Jornada | Estado | Evidencia / acción |
|---|---|---|
| 54 Concurrencia adversarial | `ADAPT` | ya existen pruebas fuertes de idempotencia/claims; ampliar a todos los invariantes definitivos y adapter real. |
| 55 Crash boundaries | `ADAPT` | existe prueba de crash después de posible aceptación; faltan todos los puntos de frontera definidos en B12. |
| 56 Fallos PT/storage | `BLOCKED_EXTERNAL` | fake cubre parte, pero validación final necesita PT real y storage productivo. |
| 57 Seguridad tenant/input/logs | `ADAPT` | aislamiento y redacción existen; faltan batería final de oversized payload, mass assignment fiscal tipado, injection, URLs/storage y demás casos B12. |
| 58 DR/kill switches/reinicio | `ADAPT` | kill switches/recovery de worker existen; restore y divergencia real siguen pendientes. |
| 59 Carga realista + cierre adversarial | `ADAPT` | tests concurrentes actuales prueban corrección, no capacidad productiva basada en volumen real medido. |

---

## Piloto y cierre

```text
P1..P4 piloto          BLOCKED_EXTERNAL / FUTURE
F1 cierre V1           FUTURE
```

No se pueden declarar hasta integrar PT real, plataforma productiva y POS.

---

# 4. Huecos prioritarios reales antes del PT

En orden de dependencia, el trabajo interno pendiente más importante es:

1. **J08** — cerrar rotación/revocación de credenciales y tests;
2. **J10** — implementar perfil/configuración fiscal versionado por tenant;
3. **J11–J16** — completar contrato fiscal interno tipado, validaciones, aritmética exacta y adaptar canonicalización;
4. **J17** — enlazar cada operación con el perfil fiscal histórico;
5. **J27** — endurecer kill switch en el último punto seguro antes de submit;
6. **J30** — completar fault injection temporal del fake;
7. **J34** — persistir evidencia relevante cruda/sanitizada del provider;
8. **J35–J36** — implementar storage/artefactos XML/PDF y endpoints;
9. **J37** — cerrar métricas/alertas mínimas.

Después de eso, el siguiente gran gate técnico es B8/B9: **PT real**.

---

# 5. Qué NO hacer

- no borrar el core existente;
- no reescribir idempotencia/worker/RLS solo por reorganización estética;
- no construir adapter HKA/DATAICO sin sandbox/evidencia;
- no iniciar cloud productivo antes de cerrar capacidades internas y PT;
- no considerar los tipos de documento “implementados” porque aparecen en un enum;
- no considerar evidencia cruda implementada porque exista una tabla vacía;
- no considerar XML/PDF implementados porque el puerto tenga métodos;
- no empezar por jornadas 01–07 nuevamente: primero verificar gates, luego conservarlas.

---

# 6. Estrategia de reanudación

La reanudación de código será incremental:

```text
1. sincronizar dev local
2. ejecutar baseline gates actuales
3. si verde: congelar evidencia de baseline
4. empezar por primera jornada no cerrada: J08
5. cerrar J08 bajo DoD
6. J10
7. J11... en orden de dependencias
```

No se reejecutan jornadas `DONE_EXISTING` como proyectos nuevos; solo se vuelven a correr sus gates cuando una adaptación posterior pueda afectarlas.

---

# 7. Uso de agentes/modelos

Para controlar coste:

- Luna: inspección, git, cambios mecánicos, docs, ejecutar tests, pequeñas correcciones;
- Terra: implementación normal de las jornadas `ADAPT/NEW` y tests multiarchivo acotados;
- Sol: solo para fallos de alto riesgo o razonamiento difícil de concurrencia, seguridad fiscal, DB o semántica PT que Terra no resuelva con confianza.

Cada prompt de Codex debe indicar la jornada/IDs concretos y archivos relevantes; no cargar todo el repositorio.

---

## Regla final

**El proyecto no necesita reiniciarse. Necesita continuar desde una base ya avanzada, pero ahora sometida a un plan y DoD definitivos. La prioridad es completar huecos demostrables, no producir más código por volumen.**