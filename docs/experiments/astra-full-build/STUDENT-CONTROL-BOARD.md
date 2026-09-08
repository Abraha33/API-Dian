# Tablero de control — API-DIAN Astra Full Build

Este es el artefacto principal para supervisar el experimento en lenguaje sencillo.

## Cómo leerlo

Cada fase responde tres preguntas:

1. **¿Qué estamos intentando lograr?**
2. **¿Cómo sé que sí se hizo?**
3. **¿Dónde está la evidencia?**

Una fase solo puede estar en `PASS` si tiene evidencia reproducible enlazada.

---

| Fase | En palabras simples | Qué tiene que quedar demostrado | Estado | Evidencia |
|---|---|---|---|---|
| 0. Aislamiento + harness | Crear el “laboratorio” donde Astra puede trabajar sin tocar lo estable | branch aislada, reglas, límites, plan de loops, evidencia y seguimiento | PASS | `README.md`, `EVIDENCE-RULES.md`, `EXPERIMENT-GOAL.md`, `status.json`, branch experimental |
| 1. Conceptualización ejecutable | Convertir arquitectura en contratos trazables | matriz requisito → implementación → prueba | PASS | `PHASE-1-TRACEABILITY.md` |
| 2. Testeo/aceptación | Demostrar comportamientos e invariantes | suites unitarias, provider, E2E y concurrencia | PASS | `PHASE-2-ACCEPTANCE-PLAN.md`, `LOCAL-EVIDENCE-2026-09-07.md` |
| 3. Construcción local | Construir la API V1 local | API, DB, worker y FakeFiscalProvider ejecutados | PASS | `LOCAL-EVIDENCE-2026-09-07.md`, `test/app.e2e-spec.ts` |
| 4. Integración E2E local | Conectar el flujo completo sin PT real | 11 pruebas E2E PASS con FakeFiscalProvider | PASS | `LOCAL-EVIDENCE-2026-09-07.md` |
| 5. Runner + containers + CI | Reproducir checkout, DB, migraciones y tests | Docker, migraciones, checkout limpio, build y suites, ahora también en un runner real de GitHub Actions (hospedado `ubuntu-latest`, no self-hosted) | PASS | `PHASE-5-CI-RUN-2026-09-07.md`, `evidence-run-34176075661.log`, run https://github.com/Abraha33/API-Dian/actions/runs/34176075661, `LOCAL-EVIDENCE-2026-09-07.md`, `PHASE-5-6-FAULT-CAPACITY-2026-09-07.md`, `PHASE-5-6-SESSION-2026-09-07B.md`, `.github/workflows/ci.yml` |
| 6. Fallos + seguridad + capacidad | Atacar, recuperar y medir el sistema | webhooks implementados con invariante duro y 11/11 fault injection, lease expiry por worker distinto, backlog drain sin pérdida/duplicación, Idempotency-Key concurrente, UUID ajeno, secretos en logs, benchmark con métricas reales de sistema y punto de saturación real encontrado — todo con corrida completa PASS en runner hospedado de GitHub Actions | PASS | `PHASE-6-WEBHOOKS.md`, `evidence-run-34186377539.log`, run https://github.com/Abraha33/API-Dian/actions/runs/34186377539, `apps/api/test/webhooks.e2e-spec.ts`, `apps/api/test/fault-injection.e2e-spec.ts`, `apps/api/src/common/logger/secrets-redaction.spec.ts`, `supabase/migrations/20260907010000_create_webhooks_schema.sql`, `evidence/bench-2026-09-07-extended.json` |
| 7. Ready for PT Integration | Cerrar solo con Fases 0–6 PASS | Fases 0–6 en PASS con evidencia reproducible | PASS | `PHASE-6-WEBHOOKS.md`, `HKA-INTEGRATION-REQUEST.md` |
| 8. Integración PT real | Reemplazar el PT falso por el proveedor real sin cambiar la API pública | adapter real, sandbox, errores reales, reconciliación y contingencias PT | BLOCKED | requiere owner/PT — ver `HKA-INTEGRATION-REQUEST.md` |
| 9. Validación externa | Demostrar comportamiento con sistemas y condiciones reales | pruebas aplicables PT/DIAN, habilitación, piloto controlado | BLOCKED | requiere mundo externo |
| 10. Production readiness | Decidir responsablemente si se puede usar con documentos reales de clientes | todos los gates finales PASS + autorización del owner | BLOCKED | requiere fases previas |

---

## Semáforo del estudiante

### Verde — PASS

Significa:

> “No solo existe. Lo ejecutamos, intentamos romperlo y tenemos evidencia de que cumple lo que pedimos.”

### Amarillo — IN PROGRESS

Significa:

> “Hay trabajo real hecho, pero todavía falta alguna prueba o evidencia.”

### Rojo — BLOCKED

Significa:

> “No podemos continuar sin algo externo o sin cerrar una fase anterior.”

### Gris — NOT STARTED

Significa:

> “Todavía no se ha trabajado formalmente esa fase.”

---

# Reglas que el agente NO puede saltarse

1. No marcar `PASS` basándose en una explicación textual.
2. No marcar `PASS` porque compile solamente.
3. No marcar `PASS` porque los tests unitarios pasen si el gate exige E2E/fallos/carga.
4. Todo `PASS` debe citar commit, comando y resultado o artefacto equivalente.
5. Si una prueba falla, el tablero vuelve a `IN PROGRESS` o `BLOCKED`.
6. No ocultar tests fallidos.
7. No modificar `dev`.
8. No mezclar cambios del experimento con ramas canónicas.
9. No conectar PT real hasta `READY FOR PT INTEGRATION: PASS` y autorización del owner.
10. No declarar `PRODUCTION READY` sin evidencia externa, seguridad, restore, capacidad y piloto.

---

# Qué quiero ver yo como estudiante al cerrar cada fase

Cada cierre debe terminar con un resumen máximo de una pantalla:

```text
FASE: 3 — Construcción local
ESTADO: PASS

¿Qué significa?
La API completa ya puede levantarse localmente.

¿Qué probamos?
- API arranca
- DB migra
- worker procesa
- documento cambia de estado
- webhook fake recibe resultado

¿Qué salió mal y se corrigió?
- ...

Evidencia:
- commit: ...
- comando: ...
- tests: ...
- reporte: ...

Siguiente fase:
4 — Integración E2E local
```

Este formato es obligatorio para los cierres de fase.

---

## Cierre de Fase 5 (2026-09-07)

```text
FASE: 5 — Runner + containers + CI
ESTADO: PASS

¿Qué significa?
El pipeline completo (checkout, dependencias, base de datos, migraciones,
lint, build, pruebas unitarias, de contrato, E2E y de concurrencia) ya
corrió de punta a punta en un runner real de GitHub Actions, no solo en
la máquina local.

¿Qué probamos?
- Workflow disparado en un runner hospedado (ubuntu-latest; no hay
  self-hosted runner disponible para este experimento, se documenta así)
- Checkout limpio del branch experimental
- PostgreSQL 15 real como contenedor de servicio del runner
- npm ci reproducible
- npm audit (gate de severidad alta)
- build, lint
- unit tests 10/10, provider-contract 6/6
- migraciones desde cero + verificaciones SQL
- E2E 12/12 (incluye la invariante obligatoria UNKNOWN != REEMITIR)
- concurrencia 4/4

¿Qué salió mal y se corrigió?
- El primer run real (34175894436) falló en el audit de dependencias de
  producción: vulnerabilidad alta real en `fast-uri` (transitiva vía
  fastify/ajv). Se corrigió con `npm audit fix` (sin --force, sin romper
  nada) en el commit 2ec1e71. El segundo run (34176075661) fue PASS
  completo. Quedan 2 vulnerabilidades moderadas de fastify que requieren
  una migración mayor (--force) y se dejan para el owner, no bloquean
  el gate de severidad alta.

Evidencia:
- commits: be98754 (test invariante), df7acce (workflow scoping), 2ec1e71 (fix audit)
- comando: gh workflow run "CI Pipeline" --ref experiment/astra-full-api-dian-v1
- runs: https://github.com/Abraha33/API-Dian/actions/runs/34175894436 (failure, real)
         https://github.com/Abraha33/API-Dian/actions/runs/34176075661 (success, real)
- reporte: docs/experiments/astra-full-build/PHASE-5-CI-RUN-2026-09-07.md
           docs/experiments/astra-full-build/evidence-run-34176075661.log

Siguiente fase:
6 — Fallos + seguridad + capacidad (sigue IN PROGRESS; ver bloqueadores en status.json)
```

---

## Cierre de Fase 6 (2026-09-08)

```text
FASE: 6 — Fallos + seguridad + capacidad
ESTADO: PASS

¿Qué significa?
El sistema ahora tiene webhooks reales (no solo fiscal), con entrega
durable, firma, reintentos con backoff acotado y dead-letter, worker
separado que garantiza que un webhook caído nunca toca el resultado
fiscal — y esto está probado con fault injection real, no solo descrito.
Además se revalidaron con evidencia fresca los invariantes de seguridad
y se extendió el benchmark hasta encontrar el punto real de saturación.

¿Qué probamos?
- Invariante duro: endpoint de webhook permanentemente caído no afecta
  el resultado fiscal (antes y después de un intento real fallido)
- 11/11 escenarios de fault injection de webhooks (200/400/500/timeout/
  connection-refused/retries/backoff/dead-letter/dos-endpoints/
  recuperación/aislamiento-multitenant)
- Lease expiry recuperado por un worker distinto (no el mismo)
- Backlog drain sin pérdida ni duplicación (40 en test, 917 en benchmark)
- Idempotency-Key concurrente (15-way) sin doble procesamiento
- UUID ajeno rechazado sin fuga de información de otro tenant
- Secretos no expuestos en logs (prueba real contra pino, no mock)
- Benchmark extendido con métricas reales de sistema (RSS, conexiones
  PostgreSQL, locks, profundidad de cola) y punto de saturación real
  encontrado (concurrencia ≈75, agotamiento del pool de conexiones,
  cola creciendo sin límite de 78 a 1048 según sube la concurrencia)
- Corrida completa PASS en runner hospedado real de GitHub Actions:
  48/48 tests (11 unit + 6 provider-contract + 27 e2e + 4 concurrencia)

¿Qué salió mal y se corrigió?
- NestFactory silenciaba errores fatales de arranque sin
  `abortOnError: false` (encontrado depurando el worker de benchmark)
- `fiscal-throughput-bench.mjs` no podía leer métricas de Postgres en
  Windows (comando `docker exec` roto por diferencias de escapado de
  shell) — corregido usando `execFileSync` con argv
- `verify-f6-behavior.sql` dejaba 2 work items `CLAIMED` con lease de
  solo 30s, que expiraba antes de terminar el pipeline extendido y
  contaminaba el gate de concurrencia — lease subido a 3600s
- Un test nuevo (Idempotency-Key concurrente) no drenaba su propio work
  item, contaminando el gate de concurrencia en el mismo job de CI —
  corregido drenándolo explícitamente
- Ambos últimos bugs se manifestaron SOLO en el runner hospedado real de
  GitHub Actions, no en corridas locales — exactamente la clase de
  evidencia que este proyecto exige antes de declarar PASS

Excepciones honestas (no ocultas):
- No se ejecutó un kill -9 literal de los procesos API/worker; se probó
  el mecanismo de recuperación (lease expiry por otro worker) que un
  reinicio real dispararía, y los 3 procesos reales corrieron sin
  caerse durante varios minutos de benchmark
- Rollback de deployment: no hay infraestructura de despliegue real que
  revertir; se documenta `git revert` + redeploy como mecanismo interino

Evidencia:
- commits: 5db23e1, d224fe9, 8cd6120, f26bf0a, 6afe011, 3332882
- comando: gh workflow run "CI Pipeline" --ref experiment/astra-full-api-dian-v1
- run: https://github.com/Abraha33/API-Dian/actions/runs/34186377539 (PASS)
- reporte: docs/experiments/astra-full-build/PHASE-6-WEBHOOKS.md
           docs/experiments/astra-full-build/evidence-run-34186377539.log
           docs/experiments/astra-full-build/evidence/bench-2026-09-07-extended.json

Siguiente fase:
7 — Ready for PT Integration
```

---

## Cierre de Fase 7 (2026-09-08)

```text
FASE: 7 — Ready for PT Integration
ESTADO: PASS

¿Qué significa?
Todas las fases 0–6 tienen evidencia reproducible en PASS. El sistema
está listo, en su alcance local/experimental, para que el owner decida
conectar un PT real — eso requiere su autorización explícita y no ocurre
en este experimento (regla no negociable del proyecto).

¿Qué probamos?
Fases 0 a 6 en PASS con evidencia citada arriba en este mismo tablero.

¿Qué salió mal y se corrigió?
Ver cierres de fase individuales arriba.

Evidencia:
- Este tablero (`STUDENT-CONTROL-BOARD.md`) y `status.json`
- `docs/experiments/astra-full-build/HKA-INTEGRATION-REQUEST.md` —
  lista concreta de lo que se necesita del owner/HKA antes de tocar
  código de integración PT real

Siguiente fase:
8 — Integración PT real (BLOCKED — requiere autorización explícita del
owner y credenciales/sandbox real de HKA; no se avanza sin eso)
```

**LISTO PARA INTEGRAR PT** (Fase 7: PASS). Ver
`docs/experiments/astra-full-build/HKA-INTEGRATION-REQUEST.md` para la
lista exacta de lo que se necesita antes de iniciar Fase 8.
