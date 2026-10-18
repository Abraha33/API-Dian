# Contexto de sesión — API-DIAN

**Estado:** `ACTIVE` — contexto de continuidad vigente
**Corte:** 2026-10-18
**Rama de trabajo:** `chore/agent-governance-2026-10-18`
**No verificado en este corte:** código, builds, CI remoto, proveedor y readiness; esta actualización es documental.

## 1. Autoridades vigentes

```text
AGENTS.md                                           ACTIVE   cómo puede trabajar un agente
docs/PRODUCT-DEFINITION-V1-FINAL.md              FROZEN   qué se construye
README.md                                         ACTIVE   entrada operativa
ROADMAP.md                                        ACTIVE   orden y gates
docs/CONTEXT-AUDIT-2026-10-18.md                 HISTORICAL auditoría de corte
docs/ENVIRONMENT-VERSION-AUDIT.md                 HISTORICAL auditoría de corte
docs/DOCKER-PRODUCTION.md                         CURRENT   packaging y límites Docker
docs/SYSTEM-ARCHITECTURE-V1.md                   ✅ cómo se construye
docs/v1-requisitos.md                             FROZEN   requisitos del MVP
docs/BUILD-PLAN-V1.md                            ✅ orden de construcción
docs/BACKLOG-V1.md                               ✅ obligaciones/tareas
docs/DEPENDENCY-MAP-V1.md                        ✅ dependencias/gates
docs/DEFINITION-OF-DONE-V1.md                    ✅ qué significa DONE
docs/DAILY-BUILD-PLAN-V1.md                      ✅ jornadas de referencia
docs/AUDIT-EXISTING-CODE-V1.md                   ✅ qué código existente se conserva/adapta/falta
docs/PROCESS-VALIDATION-EXTERNAL-2026-08-19.md    ✅ validación externa del método
docs/PROCESS-GATES-EXTERNAL-VALIDATION-V1.md      ✅ addendum obligatorio de ejecución
```

`docs/f0-producto-v1-validado-2026-08-18.md` queda conservado como
`HISTORICAL`/`SUPERSEDED` respecto de la autoridad de producto: describía un
alcance exclusivamente interno para el POS. No se borra ni se reescribe.

Jerarquía ante conflicto:

```text
solicitud explícita del usuario
→ AGENTS.md / reglas de seguridad del entorno
→ producto > arquitectura > build plan
→ backlog/dependencias/DoD + gates externos
→ plan diario > implementación existente
```

## 2. Estado actual

La definición de producto está aprobada y congelada como **API fiscal comercial
multitenant para ERP, POS, SaaS e integradores**, con el POS propio como primer
cliente. El MVP incluye FEV, NC, ND, DEE POS y ajustes, más estado, webhooks
autorizados, contingencias, idempotencia, auditoría, recuperación/reconciliación,
soportes y aislamiento multiempresa.

La planificación previa a implementación queda como contexto de ejecución y el
proceso de desarrollo conserva su estado **APROBADO CON AJUSTES**; no implica
que el runtime, CI remoto o la integración con un PT estén verificados en este
corte.

Auditoría del código existente sobre 59 jornadas técnicas:

```text
DONE_EXISTING      23
ADAPT              18
NEW                11
BLOCKED_EXTERNAL    7
REBUILD             0
```

Conclusión: **no reiniciar ni reescribir el núcleo**. Conservar lo que ya pasa el diseño y completar únicamente huecos demostrables.

## 3. Proceso meta validado

```text
producto congelado
→ arquitectura + threat model base
→ build plan
→ backlog + dependencias + DoD
→ plan diario
→ auditoría código existente
→ baseline verde
→ cambio pequeño
→ happy path + fallo relevante
→ revisión de diff
→ segunda revisión si frontera crítica
→ tests focales/integración/CI
→ cierre con evidencia
→ repetir
→ gate PT + frescura regulatoria
→ adapter real
→ release/restore/rollback
→ POS + adversarial E2E
→ revisión pre-piloto
→ piloto
→ gate regulatorio/readiness final
→ V1
→ respuesta a vulnerabilidades/mejora continua
```

Los gates adicionales obligatorios son:

- revisión independiente proporcional al riesgo en fronteras críticas;
- seguridad de cadena de suministro proporcional a V1;
- comprobación de frescura regulatoria antes de adapter, piloto y cierre;
- runbook de respuesta a vulnerabilidades antes de producción;
- release engineering desde temprano;
- tests por capas, no suites costosas indiscriminadas.

No se añaden por moda Kubernetes, microservicios, multi-PT ni SLSA L3.

## 4. Producto/arquitectura resumidos

```text
POS propio
   ↓
API runtime
   ↓
PostgreSQL administrado  ← autoridad
   ↑
Worker runtime ───────────▶ 1 PT habilitado ─▶ DIAN
   │
   └──────────────────────▶ Object storage privado
```

Invariante superior:

```text
DESCONOCIDO != REEMITIR
```

V1: FEV, NC, ND, DEE POS, ajuste POS, contingencias indispensables, estado,
webhooks de resultado para consumidores autorizados, XML/PDF, idempotencia,
auditoría, recuperación/reconciliación y multiempresa. API comercial de acceso
controlado; no self-service público, SDK público, segundo PT ni DIAN directa. El
POS propio es el primer cliente, no el único mercado.

Arquitectura: monolito modular Node 24 + TypeScript + NestJS/Fastify; PostgreSQL autoridad/trabajo durable; `pg` y SQL explícito crítico; tenant credential + RLS + FK tenant-safe; roles API/worker separados; `provider_attempt` antes del side effect; UNKNOWN→reconcile; evidencia append-only; kill switches; API sin secreto PT.

## 5. Código existente que se conserva

Existe evidencia ejecutable para gran parte del núcleo:

- baseline Node/Nest/PostgreSQL/CI;
- tenant + RLS + aislamiento;
- autenticación POS;
- roles DB least privilege;
- idempotencia persistida y concurrencia;
- máquina de estados;
- work queue durable + leases;
- worker separado;
- provider attempt pre-send;
- crash recovery a UNKNOWN;
- FakeFiscalProvider;
- reconciliación y NEEDS_ATTENTION;
- contract-test harness PT;
- kill switches y tooling/runbook de operaciones.

No rehacer estas piezas por estética. Volver a probarlas después de cambios que puedan afectarlas.

### Hardening Docker reciente

El árbol local contiene packaging productivo en `Dockerfile.production`,
`docker-compose.production.yml` e `infra/postgres/Dockerfile`, además de un
workflow Trivy para escanear las imágenes API y PostgreSQL. La API productiva
queda modelada como no-root y el Compose exige imágenes inmutables, red privada
para PostgreSQL, healthchecks, capacidades reducidas y secretos por archivo.
Esto está **VERIFICADO por inspección del repositorio** y no por ejecución de
imágenes: se validó el build de la aplicación Node, pero no se hicieron builds
ni escaneos Docker, despliegues o pruebas de backup/restore; la imagen derivada
PostgreSQL y la readiness productiva siguen `UNVERIFIED`.

## 6. Huecos internos prioritarios

Orden de reanudación recomendado:

```text
J08  completar lifecycle/rotación/revocación de credenciales
J10  perfil/configuración fiscal versionado por tenant
J11–J16 contrato fiscal tipado + validación + exactitud + canonicalización
J17  asociar operación con perfil fiscal histórico
J27  segunda verificación kill switch en último punto seguro antes de submit
J30  fault injection temporal/delayed response
J34  evidencia relevante del provider en evidence_records
J35–J36 storage privado + XML/PDF + endpoints/worker
J37  métricas/alertas mínimas
```

Jornadas 39–44 y 56 dependen de PT real/evidencia externa.

## 7. Gate PT/regulatorio

Orden racional de prueba actualmente documentado:

```text
1. HKA — candidato inicial, no validado
2. DATAICO
3. Facture / ESTELA
```

No es selección final. `PROVEN_NOT_SENT` y `NOT_FOUND_CONCLUSIVE` requieren evidencia real; 404 o texto “no enviado” no autorizan reemisión por nombre.

Además, antes de B9, B13 y B14 se debe revalidar normatividad/anexos DIAN
vigentes y condición actual del PT elegido. HKA, sus credenciales, sandbox,
contrato y semántica de reconciliación permanecen `UNVERIFIED`.

## 8. Próxima acción inmediata

**No declarar readiness ni empezar una frontera externa hasta verificar el
baseline correspondiente.** El build, TypeScript, lint sin correcciones, unit,
provider-contract y governance pasaron localmente; E2E y concurrencia quedaron
bloqueados por PostgreSQL local no disponible.

Secuencia:

```text
sin modificar código
→ sincronizar dev
→ ejecutar gates actuales reproducibles
→ registrar PASS/FAIL
→ si verde, iniciar J08 bajo DoD + gates externos
```

La verificación baseline debe incluir como mínimo build, lint, unit, migraciones/roles, e2e, concurrencia y provider-contract harness, reutilizando los comandos/documentación ya existentes. Estos comandos son gates de una fase autorizada; `AGENTS.md` exige autorización explícita antes de ejecutarlos después de cambios y prohíbe usar credenciales productivas.

## 9. Uso eficiente de Codex/modelos

Para la verificación baseline usar modelo barato: **Luna**. Solo inspeccionar, ejecutar gates y resumir; no modificar archivos.

Para implementación normal de jornadas `ADAPT/NEW`, usar **Terra** por defecto. Escalar a **Sol** únicamente si aparece un problema difícil de seguridad fiscal, concurrencia, DB o semántica PT que Terra no pueda resolver con confianza.

Contexto de agente por defecto:

```text
docs/session-context.md
+ documento/jornada actual
+ solo los archivos estrictamente necesarios
```

No cargar todo el repositorio.

## 10. Próximo hito

1. verificar el baseline local y remoto con evidencia fechada;
2. cerrar la validación del PT candidato bajo los gates externos;
3. continuar por los huecos prioritarios en orden de dependencias.

**DONE significa demostrado, no declarado.**
