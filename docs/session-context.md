# Contexto de sesión (Cursor)

Copia o resume esto al **inicio** de una sesión si el chat está largo o cambias de máquina. Mantenlo corto; el análisis profundo va a investigación separada.

## Fuente maestra actual

- `docs/f0-producto-v1-validado-2026-08-18.md` — baseline de producto validado y handoff principal.

No reconstruir la definición del producto desde cero ni reabrir decisiones cerradas salvo evidencia nueva fuerte.

## Estado actual

- **Rama base:** `dev`
- **Fase:** definición y validación de producto cerradas; pendiente reconciliar roadmap y cerrar requisitos V1.
- **Producto:** API fiscal interna para comercio colombiano.
- **Primer consumidor:** POS propio de venta rápida.
- **Flujo:** `POS → API propia → 1 PT habilitado → DIAN`.
- **Operación:** una sola persona inicialmente.
- **API pública externa:** fuera de V1; solo evaluar después de evidencia de demanda pagada.

## V1 fiscal congelada

- FEV.
- Nota Crédito.
- Nota Débito.
- DEE POS.
- Nota de ajuste DEE POS.
- Contingencias necesarias de FEV/DEE POS.
- Estados.
- XML validado.
- PDF/representación gráfica entregada por el PT.

El núcleo incluye idempotencia, auditoría, trazabilidad, reconciliación básica, multiempresa, observabilidad y una interfaz interna mínima `FiscalProvider` con un solo PT.

## Fuera de V1

- Documento Soporte.
- recepción/eventos.
- nómina.
- RADIAN.
- salud/RIPS.
- transporte/RNDC.
- API/SDK/webhooks públicos.
- segundo PT/failover.
- DIAN directa.
- custodia propia de certificados.
- PDF propio.
- ERP/contabilidad/CRM.
- forks/personalizaciones por cliente.

## Próximo proceso

```text
1. Reconciliar ROADMAP.md y ADR existentes con el baseline validado
2. Cerrar requisitos V1
3. Arquitectura formal / ADR
4. Modelo de datos
5. Seguridad / amenazas
6. Contratos internos/API
7. Selección del PT inicial
8. Plan de pruebas y contingencia
9. Implementación incremental
```

## Documentos de verdad

- `docs/f0-producto-v1-validado-2026-08-18.md` — autoridad de producto actual.
- `README.md` — flujo Git y reglas generales.
- `ROADMAP.md` — roadmap previo; debe reconciliarse con el nuevo baseline antes de seguir construcción.
- `ADR/` — decisiones arquitectónicas vigentes/borradores; revisar contradicciones antes de modificar.

## Última decisión relevante

- **2026-08-18** — cerrada la definición del Producto V1 después de cinco rondas de validación independientes: producto/mercado, adversarial, jurídica, comercial y técnica/operativa. La API nace como infraestructura interna del POS y no como producto API externo abierto.
