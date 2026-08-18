# Roadmap API-DIAN

**Corte:** 2026-08-18  
**Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

Modelo V1:

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

Restricciones: una sola persona opera inicialmente; un PT; sin DIAN directa; sin API pública; sin multi-PT; sin custodia propia de certificados si puede delegarse de forma segura; integridad fiscal por encima de velocidad.

## Estado actual

```text
F0  Baseline de producto y validación        ✅ Cerrado
F1  Requisitos V1                            ✅ Cerrado para arquitectura
F2  Arquitectura formal y ADR                ✅ Cerrado para F3
F3  Modelo de datos + seguridad/amenazas     ▶ Siguiente
F4  Contratos internos + selección del PT    ⏸ Pendiente
F5  Pruebas, contingencia y operación        ⏸ Pendiente
F6  Implementación incremental               ⏸ Pendiente
F7  Readiness + piloto controlado con POS     ⏸ Pendiente
F8  Estabilización + decisión V1.1            ⏸ Pendiente
```

## F0 — Baseline de producto y validación

**Estado: ✅ Cerrado**

Salida: `docs/f0-producto-v1-validado-2026-08-18.md`.

Los documentos anteriores de “modelo experimental” y “fogueo de mercado” son evidencia histórica, no autoridad V1.

## F1 — Requisitos V1

**Estado: ✅ Cerrado para arquitectura**

Salida: `docs/v1-requisitos.md`.

Alcance, invariantes, out-of-scope y gates productivos quedaron fijados sin confundir requisitos con tecnologías.

## F2 — Arquitectura formal y ADR

**Estado: ✅ Cerrado para F3**

Salidas autoritativas:

- `ADR/ADR-003-arquitectura-v1-monolito-postgres.md`;
- `ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md`.

Decisiones cerradas:

- monolito modular;
- TypeScript/NestJS/Fastify conservados;
- Node.js 24 LTS como línea de runtime al implementar;
- un PostgreSQL administrado como autoridad transaccional;
- trabajo async durable en PostgreSQL;
- Redis/BullMQ fuera de arquitectura productiva V1;
- roles `api` y `worker` desde el mismo código/artefacto;
- solo `worker` puede ejecutar mutaciones fiscales del PT;
- object storage solo para artefactos, nunca como autoridad de workflow;
- servicios administrados y sin Kubernetes/microservicios;
- `UNKNOWN` obliga reconciliación antes de repetir una mutación.

ADR-001 y ADR-002 quedan supersedidos para V1, aunque se preservan como registro histórico.

Las elecciones físicas que dependen del modelo de datos/threat model —RLS exacto, auth, constraints, leases SQL, backup/restore, secretos— se cierran en F3. El proveedor PT y su semántica concreta siguen siendo F4.

## F3 — Modelo de datos + seguridad y amenazas

**Estado: ▶ Siguiente**

Objetivo:

- esquema transaccional de operación fiscal, intentos y trabajo durable;
- idempotencia + fingerprint semántico;
- máquina de estados y transiciones válidas;
- constraints de concurrencia que hagan cumplir ADR-004;
- aislamiento multiempresa y estrategia RLS;
- auditoría/evidencia append-only donde corresponda;
- referencias/checksums de respuestas crudas y XML/PDF;
- threat model;
- auth POS→API;
- secretos/credenciales del PT y mínimo privilegio;
- backup/PITR y restauración real;
- estrategia de migraciones para evidencia fiscal.

Regla F3:

```text
Los invariantes críticos deben hacerse cumplir en la capa más baja razonable.
No depender de que todos los futuros programadores recuerden poner un WHERE tenant_id o un if de estado.
```

## F4 — Contratos internos + evaluación y selección del PT

**Estado: ⏸ Pendiente**

Objetivo:

- contrato interno POS→API;
- interfaz mínima `FiscalProvider`;
- estados/errores normalizados;
- recuperación XML/PDF;
- matriz y selección del PT;
- validar sandbox, multiempresa/NIT, firma/certificados, reconciliación, contingencias, SLA, rate limits, precio, soporte y tratamiento de datos.

Un PT que no permita resolver suficientemente un resultado ambiguo es incompatible con ADR-004.

## F5 — Pruebas, contingencia y operación

**Estado: ⏸ Pendiente**

Objetivo:

- pruebas funcionales/adversariales;
- timeouts ambiguos, duplicación, crashes y respuestas tardías;
- contingencias FEV/DEE POS por causa;
- reconciliación;
- runbooks;
- restauración real;
- alertas accionables.

## F6 — Implementación incremental

**Estado: ⏸ Pendiente**

Orden:

1. tenant/auth + modelo de operación/idempotencia;
2. trabajo durable y worker;
3. `FiscalProvider` fake + fault injection;
4. vertical FEV sandbox;
5. notas;
6. DEE POS/ajuste;
7. estado/XML/PDF;
8. contingencias/reconciliación;
9. hardening.

No activar familias fiscales en paralelo si una sola persona no puede diagnosticar la anterior.

## F7 — Readiness + piloto controlado

**Estado: ⏸ Pendiente**

Ejecutar los gates de `docs/v1-requisitos.md`, limitar empresas/volumen y demostrar que la operación cotidiana no requiere intervención manual permanente.

## F8 — Estabilización y decisión V1.1

**Estado: ⏸ Pendiente**

Solo después de estabilidad real se decide expansión: observabilidad/panel, onboarding, Documento Soporte, recepción/eventos, SDK, e-commerce, apertura a terceros o segundo PT según evidencia.

## Regla de control de alcance

Una tarea entra en V1 solo si:

1. es necesaria para un documento fiscal V1;
2. evita pérdida, duplicación o ambigüedad fiscal;
3. es necesaria para aislamiento, seguridad, auditoría, recuperación u operación unipersonal; o
4. es requisito contractual/técnico indispensable del PT.

Si no cumple una, se difiere.
