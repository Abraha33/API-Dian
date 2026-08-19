# Contexto de sesión — API-DIAN

**Corte:** 2026-08-19  
**Rama consolidada:** `dev`

## 1. Autoridades vigentes

```text
docs/PRODUCT-DEFINITION-V1-FINAL.md   ✅ FROZEN — qué se construye
docs/SYSTEM-ARCHITECTURE-V1.md        ✅ FROZEN — cómo se construye
docs/BUILD-PLAN-V1.md                 ✅ FROZEN — en qué orden se construye
```

Si existe conflicto: producto > arquitectura > build plan > implementación existente.

## 2. Estado de planificación

```text
Producto                         ✅
Arquitectura                     ✅
Build Plan                       ✅
Backlog detallado                ▶ SIGUIENTE
Mapa de dependencias             ⏸
Definition of Done               ⏸
Plan diario                      ⏸
Auditoría del código existente   ⏸
Nueva implementación             ⏸
```

Orden oficial:

```text
producto
→ arquitectura
→ build plan
→ backlog
→ dependencias + DoD
→ plan diario
→ auditoría del código existente
→ implementación controlada
```

No agregar runtime por inercia antes de completar esta secuencia.

## 3. Producto V1

```text
POS propio → API-DIAN → 1 PT habilitado → DIAN
```

- mercado inicial: comercios colombianos;
- V1 no es API pública;
- multiempresa;
- un solo PT;
- no DIAN directa;
- no ser PT inicialmente;
- FEV, NC, ND, DEE POS, ajuste POS, contingencias indispensables, estado, XML/PDF, trazabilidad.

Invariante superior:

```text
DESCONOCIDO != REEMITIR
```

## 4. Arquitectura V1

```text
POS
 ↓
API runtime
 ↓
PostgreSQL administrado  ← autoridad
 ↑
Worker runtime ───────────▶ 1 PT
 │
 └────────────────────────▶ Object storage privado
```

Decisiones principales:

- monolito modular;
- mismo artefacto con roles `api` y `worker`;
- Node 24 + TypeScript + NestJS/Fastify;
- PostgreSQL autoridad y trabajo durable;
- `pg`/SQL explícito en camino crítico;
- sin Redis/BullMQ productivo;
- tenant credential + tenant-safe FK + RLS;
- perfil fiscal versionado por tenant;
- `provider_attempt` antes del side effect;
- solo worker muta PT;
- `UNKNOWN → reconcile`;
- evidencia/auditoría append-only;
- API sin secreto PT;
- kill switches;
- observabilidad administrada;
- proveedor cloud exacto todavía no congelado.

## 5. Build Plan V1

Secuencia congelada:

```text
B1  baseline ejecutable + gates
B2  multiempresa + auth + perfil fiscal versionado
B3  contrato fiscal + validación + decimales exactos
B4  idempotencia + persistencia + máquina de estados
B5  trabajo durable + worker + side-effect protocol
B6  reconcile + FakeFiscalProvider + fault injection
B7  evidencia + auditoría + XML/PDF + operación segura
B8  gate externo: seleccionar/probar 1 PT real
B9  adapter PT real + mapeos + contingencias
B10 plataforma productiva + backup/restore + observabilidad
B11 integración POS → API-DIAN
B12 pruebas adversariales E2E
B13 piloto controlado
B14 cierre V1
```

Mientras avanzan B1–B7 puede adelantarse administrativamente B8 (sandbox, documentación, contrato y precio), pero **B9 no se construye con comportamiento inventado del PT**.

## 6. Regla de ejecución

Cada unidad futura seguirá:

```text
capacidad pequeña
→ prueba normal
→ prueba de fallo
→ integración
→ gates verdes
→ cerrar
```

No se pedirá a Codex “construir toda la API”. Se trabajará por piezas pequeñas, verificables y con contexto mínimo para controlar calidad y coste de tokens.

## 7. Código existente

Existe trabajo adelantado relevante: SQL core, auth/RLS, idempotencia, worker/leases, FakeFiscalProvider, UNKNOWN/reconcile, kill switches, observabilidad, concurrencia y contract-test harness.

No se elimina automáticamente y tampoco se considera terminado por existir.

Después del plan diario, cada pieza se clasificará:

```text
CONSERVAR
ADAPTAR
REHACER
ELIMINAR
```

Una pieza solo cuenta como avance cuando pasa el gate de la fase correspondiente del Build Plan.

## 8. Gate PT

Orden de prueba documentado actualmente:

```text
1. HKA
2. DATAICO
3. Facture / ESTELA
```

No es selección final.

El PT debe demostrar sandbox real, alcance documental V1, correlación, timeout ambiguo, reconciliación, duplicados, criterio seguro de inexistencia, XML/PDF, firma/certificado, seguridad/datos, SLA/soporte/rate limits y modelo/coste multiempresa.

Un 404 o un texto “no enviado” no autorizan por sí mismos una reemisión.

## 9. Fuentes de detalle bajo demanda

Consultar solo si la tarea lo necesita:

- `docs/v1-requisitos.md`;
- ADR-003..009;
- `docs/f3-modelo-datos-v1.md`;
- `docs/f3-threat-model-v1.md`;
- `docs/f4-contrato-pos-api-v1.md`;
- `docs/f4-prueba-ambiguedad-pt-v1.md`;
- `docs/f6-provider-contract-harness.md`.

Para agentes/Codex, empezar normalmente con `docs/session-context.md` + el documento de la fase actual. No cargar todo el repositorio sin necesidad.

## 10. Siguiente avance oficial

Crear el backlog completo derivado de `BUILD-PLAN-V1.md`:

```text
fase
→ épica
→ historia/capacidad
→ tarea pequeña verificable
```

Después: mapa de dependencias, Definition of Done y plan diario.
