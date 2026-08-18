# Contexto de sesión — API-DIAN

Usar este archivo para reanudar trabajo sin reconstruir decisiones cerradas.

## Fuentes maestras actuales

1. `docs/f0-producto-v1-validado-2026-08-18.md` — autoridad de producto.
2. `docs/v1-requisitos.md` — requisitos e invariantes V1.
3. `docs/f0-reconciliacion-roadmap-adr-2026-08-18.md` — resolución de contradicciones históricas.
4. `ROADMAP.md` — secuencia vigente.

No reabrir definición del producto salvo evidencia nueva fuerte.

## Estado

- **Rama:** `dev`.
- **F0 baseline/producto:** cerrado.
- **F1 requisitos V1:** cerrado para arquitectura.
- **Siguiente fase:** F2 — arquitectura formal y ADR.
- **Operación inicial:** una sola persona.

## Producto V1

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

La API es infraestructura estratégica del POS, no un producto API público en V1.

## Alcance fiscal congelado

- FEV.
- Nota Crédito.
- Nota Débito.
- DEE POS.
- Nota de ajuste DEE POS.
- contingencias necesarias FEV/DEE POS.
- estado/seguimiento.
- XML validado.
- PDF/representación entregada por el PT.

## Invariantes que gobiernan arquitectura

- `DESCONOCIDO != REEMITIR`.
- persistir intent/idempotencia antes del side effect remoto;
- misma idempotency key no puede crear duplicado lógico;
- aislamiento multiempresa con defensa en profundidad;
- conservar evidencia/respuestas crudas PT;
- reconciliación automática básica;
- una sola fuente transaccional interna;
- observabilidad y recuperación desde el inicio;
- un solo `FiscalProvider` / un solo PT;
- sin custodia propia de certificados en V1 si puede delegarse de forma segura.

## Fuera de V1

- API/SDK/webhooks públicos;
- Documento Soporte;
- recepción/eventos;
- nómina/RADIAN/RIPS/RNDC;
- segundo PT/failover;
- DIAN directa;
- PDF propio;
- ERP/contabilidad/CRM;
- forks por cliente.

## Estado de ADR históricos

- `ADR-001-stack-tecnologico.md`: **requiere revalidación**.
- `ADR-002-estructura-modulos.md`: **requiere revalidación**.

No eliminar código por reflejo. En F2, cada pieza existente se conserva o retira por coste total, riesgo y requisito satisfecho.

## Próximo trabajo — F2

1. derivar arquitectura mínima desde `docs/v1-requisitos.md`;
2. definir módulos/límites del monolito modular;
3. fijar estrategia transaccional de idempotencia + side effects;
4. decidir async mínimo y si Redis/BullMQ sigue justificándose;
5. decidir persistencia/storage/observabilidad;
6. producir ADR nuevos o reemplazos explícitos;
7. mantener PT detrás de `FiscalProvider` sin diseñar multi-PT.

Después: modelo de datos + threat model, contratos internos, selección del PT, pruebas/contingencia e implementación incremental.