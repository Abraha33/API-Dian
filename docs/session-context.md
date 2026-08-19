# Contexto de sesión — API-DIAN

**Corte:** 2026-08-19  
**Rama consolidada:** `dev`

## 1. Autoridades congeladas

```text
docs/PRODUCT-DEFINITION-V1-FINAL.md   ✅ qué se construye
docs/SYSTEM-ARCHITECTURE-V1.md        ✅ cómo se construye
docs/BUILD-PLAN-V1.md                 ✅ orden de construcción
docs/BACKLOG-V1.md                    ✅ obligaciones/tareas
docs/DEPENDENCY-MAP-V1.md             ✅ dependencias/gates
docs/DEFINITION-OF-DONE-V1.md         ✅ qué significa DONE
docs/DAILY-BUILD-PLAN-V1.md           ✅ jornadas de referencia
docs/AUDIT-EXISTING-CODE-V1.md        ✅ qué código existente se conserva/adapta/falta
```

Jerarquía ante conflicto:

```text
producto > arquitectura > build plan > backlog/dependencias/DoD > plan diario > implementación existente
```

## 2. Estado actual

La planificación previa a implementación está cerrada.

Auditoría del código existente sobre 59 jornadas técnicas:

```text
DONE_EXISTING      23
ADAPT              18
NEW                11
BLOCKED_EXTERNAL    7
REBUILD             0
```

Conclusión: **no reiniciar ni reescribir el núcleo**. Conservar lo que ya pasa el diseño y completar únicamente huecos demostrables.

## 3. Producto/arquitectura resumidos

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

V1: FEV, NC, ND, DEE POS, ajuste POS, contingencias indispensables, estado, XML/PDF, trazabilidad y multiempresa. No API pública, no segundo PT, no DIAN directa, no forks por cliente.

Arquitectura: monolito modular Node 24 + TypeScript + NestJS/Fastify; PostgreSQL autoridad/trabajo durable; `pg` y SQL explícito crítico; tenant credential + RLS + FK tenant-safe; roles API/worker separados; `provider_attempt` antes del side effect; UNKNOWN→reconcile; evidencia append-only; kill switches; API sin secreto PT.

## 4. Código existente que se conserva

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

## 5. Huecos internos prioritarios

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

## 6. Gate PT

Orden racional de prueba actualmente documentado:

```text
1. HKA
2. DATAICO
3. Facture / ESTELA
```

No es selección final. `PROVEN_NOT_SENT` y `NOT_FOUND_CONCLUSIVE` requieren evidencia real; 404 o texto “no enviado” no autorizan reemisión por nombre.

## 7. Próxima acción inmediata

**No empezar J08 hasta verificar que el baseline actual sigue verde localmente.**

Secuencia:

```text
sin modificar código
→ sincronizar dev
→ ejecutar gates actuales reproducibles
→ registrar PASS/FAIL
→ si verde, iniciar J08
```

La verificación baseline debe incluir como mínimo build, lint, unit, migraciones/roles, e2e, concurrencia y provider-contract harness, reutilizando los comandos/documentación ya existentes.

## 8. Uso eficiente de Codex/modelos

Para la verificación baseline usar modelo barato: **Luna**. Solo inspeccionar, ejecutar gates y resumir; no modificar archivos.

Para implementación normal de jornadas `ADAPT/NEW`, usar **Terra** por defecto. Escalar a **Sol** únicamente si aparece un problema difícil de seguridad fiscal, concurrencia, DB o semántica PT que Terra no pueda resolver con confianza.

Contexto de agente por defecto:

```text
docs/session-context.md
+ documento/jornada actual
+ solo los archivos estrictamente necesarios
```

No cargar todo el repositorio.

## 9. Próximo hito

1. baseline local verde;
2. J08 cerrado bajo `DEFINITION-OF-DONE-V1.md`;
3. continuar por los huecos prioritarios en orden de dependencias.

**DONE significa demostrado, no declarado.**
