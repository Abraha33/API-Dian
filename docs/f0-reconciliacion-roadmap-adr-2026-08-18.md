# F0 — Reconciliación ROADMAP y ADR con baseline validado

**Fecha:** 2026-08-18  
**Estado:** Cerrado  
**Baseline:** `docs/f0-producto-v1-validado-2026-08-18.md`

## Objetivo

Eliminar contradicciones entre documentación histórica y la definición de producto validada antes de continuar arquitectura o implementación.

## Conflictos detectados y resolución

| Fuente previa | Conflicto | Resolución |
|---|---|---|
| `ROADMAP.md` | Trataba como pregunta abierta si una persona podía vender/operar una API externa y exigía fogueo de mercado antes del MVP. | Se reemplazó por un roadmap donde V1 es infraestructura interna del POS y el fogueo comercial queda como herramienta futura si se evalúa externalización. |
| `README.md` | Presentaba el proyecto como “modelo experimental” y el flujo largo como integración directa API→DIAN. | Se actualizó el estado y el flujo autoritativo a POS→API propia→1 PT→DIAN. |
| ADR-001 | Contexto de API SaaS para integradores; Redis/BullMQ y auth de integradores aparecían aprobados sin relación con el nuevo alcance. | ADR pasa a “requiere revalidación”; las piezas útiles quedan como candidatos y la complejidad no demostrada pierde autoridad. |
| ADR-001 | Integración fiscal agnóstica podía interpretarse como DIAN directa/multi-proveedor. | Se fija para V1 un puerto mínimo `FiscalProvider` con un solo adaptador a un PT habilitado. |
| ADR-002 | `emission` asumía XML UBL + envío DIAN directo. | Se reencuadra como orquestación fiscal delegada al PT. |
| ADR-002 | `webhooks` para ERP/integradores dentro de fases tempranas. | Fuera de V1. |
| ADR-002 | Observabilidad aparecía tarde. | Pasa a capacidad obligatoria de la espina dorsal. |
| ADR-002 | `users` se asumía obligatorio. | Queda condicionado a que exista actor humano/panel en V1. |

## Orden de autoridad documental desde este corte

Cuando dos documentos se contradigan, usar este orden:

1. `docs/f0-producto-v1-validado-2026-08-18.md` — alcance y decisiones de producto.
2. `docs/v1-requisitos.md` — requisitos V1 e invariantes.
3. ADR aprobados **después** de esta reconciliación — decisiones de arquitectura.
4. `ROADMAP.md` — secuencia de ejecución.
5. ADR-001/ADR-002 históricos — candidatos y contexto, sujetos a revalidación.
6. documentos de modelo experimental/fogueo previos — evidencia histórica.

## Qué no se hizo

- No se borró código existente.
- No se eligió un PT.
- No se cambió el stack de producción.
- No se diseñó todavía el modelo de datos.
- No se creó arquitectura multi-PT.
- No se reabrió la definición del producto.

## Criterio conservador aplicado

La reconciliación elimina decisiones que aumentaban la superficie operativa sin demostrar valor V1. También evita el extremo opuesto: una reescritura preventiva del código solo porque el contexto cambió.

Principio para la siguiente fase:

```text
Una pieza de infraestructura no se conserva por tradición ni se elimina por estética.
Se conserva si reduce riesgo/coste total frente al requisito que satisface.
```

## Resultado

El repositorio queda habilitado para cerrar requisitos V1 y pasar después a arquitectura formal sin que ROADMAP/ADR históricos autoricen accidentalmente:

- API pública;
- DIAN directa;
- multi-PT;
- webhooks públicos;
- infraestructura distribuida innecesaria;
- observabilidad tardía.