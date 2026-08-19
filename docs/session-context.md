# Contexto de sesión — API-DIAN

**Corte:** 2026-08-19  
**Rama consolidada:** `dev`

## 1. Autoridades congeladas

```text
docs/PRODUCT-DEFINITION-V1-FINAL.md   ✅ qué se construye
docs/SYSTEM-ARCHITECTURE-V1.md        ✅ cómo se construye
docs/BUILD-PLAN-V1.md                 ✅ orden de construcción
docs/BACKLOG-V1.md                    ✅ obligaciones/tareas verificables
docs/DEPENDENCY-MAP-V1.md             ✅ dependencias y gates
docs/DEFINITION-OF-DONE-V1.md         ✅ qué significa DONE
docs/DAILY-BUILD-PLAN-V1.md           ✅ secuencia de jornadas
```

Jerarquía si existe conflicto:

```text
producto > arquitectura > build plan > backlog/dependencias/DoD > plan diario > implementación existente
```

## 2. Estado actual

```text
Producto                         ✅ FROZEN
Arquitectura                     ✅ FROZEN
Build Plan                       ✅ FROZEN
Backlog                          ✅ FROZEN
Mapa de dependencias             ✅ FROZEN
Definition of Done               ✅ FROZEN
Plan diario                      ✅ FROZEN
Auditoría del código existente   ▶ SIGUIENTE
Nueva implementación             ⏸
```

No reanudar implementación hasta auditar el código adelantado contra estos baselines.

## 3. Producto y arquitectura en una vista

```text
POS propio
   ↓
API runtime
   ↓
PostgreSQL administrado  ← autoridad transaccional
   ↑
Worker runtime ───────────▶ 1 PT habilitado ─▶ DIAN
   │
   └──────────────────────▶ Object storage privado
```

V1:

- comercios colombianos;
- consumidor técnico inicial: POS propio;
- no API pública;
- multiempresa;
- exactamente un PT;
- no DIAN directa;
- FEV, NC, ND, DEE POS, ajuste POS, contingencias indispensables, estado, XML/PDF y trazabilidad;
- monolito modular Node 24 + TypeScript + NestJS/Fastify;
- PostgreSQL autoridad y trabajo durable;
- `pg`/SQL explícito en camino fiscal crítico;
- tenant credential + tenant-safe FK + RLS;
- perfil fiscal versionado por tenant;
- roles `api`/`worker` y DB separados;
- `provider_attempt` antes del side effect;
- API no muta PT; solo worker;
- evidencia/auditoría append-only;
- kill switches;
- proveedor cloud exacto aún no congelado.

Invariante superior:

```text
DESCONOCIDO != REEMITIR
```

## 4. Secuencia de construcción

```text
B1  baseline ejecutable
B2  multiempresa/auth/perfil fiscal
B3  contrato fiscal/validación
B4  idempotencia/persistencia/estados
B5  worker/trabajo durable/side-effect boundary
B6  UNKNOWN/reconcile/fake/fault injection
B7  evidencia/artefactos/operación
B8  gate PT real
B9  adapter PT real/contingencias
B10 plataforma productiva/restore
B11 integración POS
B12 adversarial E2E
B13 piloto
B14 cierre V1
```

B8 administrativo puede adelantarse en paralelo, pero B9 requiere evidencia real del PT.

## 5. Regla de ejecución diaria

Cada jornada futura:

```text
contexto mínimo
→ uno o pocos backlog IDs relacionados
→ happy path
→ fallo relevante
→ gates
→ revisar diff
→ registrar evidencia
→ DONE / BLOCKED / INCONCLUSIVE
```

DoD significa demostrado, no simplemente implementado.

## 6. Código adelantado existente

El repo ya contiene trabajo relevante, incluyendo:

- PostgreSQL/migraciones y SQL core;
- auth/tenant/RLS;
- idempotencia/canonicalización;
- operaciones/estados;
- worker/leases/provider attempts;
- FakeFiscalProvider;
- UNKNOWN/reconcile;
- kill switches;
- observabilidad;
- concurrencia;
- contract-test harness PT.

No se borra ni se considera terminado automáticamente.

La auditoría siguiente debe mapear cada bloque/jornada a:

```text
DONE_EXISTING  = ya cumple DoD/gate con evidencia
ADAPT          = existe y sirve, pero requiere corrección
REBUILD        = contradice baseline o no es confiable
NEW            = no existe
BLOCKED_EXTERNAL = requiere PT/contrato/evidencia externa
```

Resultado esperado de la auditoría:

```text
docs/AUDIT-EXISTING-CODE-V1.md
```

Después de esa auditoría se genera el plan diario **real restante**, eliminando trabajo ya válido en vez de reconstruirlo por inercia.

## 7. Gate PT

Orden actual de prueba:

```text
1. HKA
2. DATAICO
3. Facture / ESTELA
```

No es selección final.

Nunca mapear por intuición un 404 o texto “no enviado” a permiso seguro de reemisión. `PROVEN_NOT_SENT` y `NOT_FOUND_CONCLUSIVE` requieren evidencia explícita.

## 8. Uso eficiente de agentes/Codex

Empezar normalmente solo con:

```text
docs/session-context.md
+ documento de fase/jornada actual
```

Abrir ADR/requisitos/código adicional solo bajo necesidad. No cargar todo el repo por defecto.

Usar el modelo de menor coste que pueda resolver correctamente la tarea y escalar únicamente para decisiones difíciles de arquitectura, seguridad o semántica fiscal.

## 9. Siguiente avance oficial

Auditar el repositorio existente contra el backlog y la Definition of Done, sin modificar runtime todavía.

Crear:

```text
docs/AUDIT-EXISTING-CODE-V1.md
```

Luego convertir `DAILY-BUILD-PLAN-V1.md` en el plan real restante, marcando qué jornadas ya están cumplidas por código válido y cuáles faltan.
