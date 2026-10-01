# Roadmap de suite fiscal completa

**Fecha de corte:** 2026-10-01  
**Principio:** portafolio completo, lanzamientos pequenos.

| Fase | Producto | Razon | Gate |
|---|---|---|---|
| 0 | Plataforma/fake provider | Base comun | Idempotencia, estados, archivos, webhooks |
| 1 | FEV + NC + ND | Mayor base de mercado | PT, reconciliacion, piloto |
| 2 | DEE POS + ajustes | POS/retail | Volumen y contingencia |
| 3 | Documento soporte + ajuste | ERP/compras | CUDS y numeracion |
| 4 | Nomina electronica | SaaS/ERP laboral | Bulk, CUNE, periodos |
| 5 | Recepcion + eventos 030-034 | Cuentas por pagar | Importacion y firma |
| 6 | RADIAN avanzado | Financiero | Eventos titulo valor |
| 7 | Catalogo DEE extendido | Sectores concretos | Cliente ancla por tipo |
| 8 | Salud/RIPS | Vertical regulado | Especialista y MUV productivo |
| 9 | Transporte/RNDC | Vertical regulado | Cliente TMS y ambiente RNDC |

## Por que no lanzar todo junto

- Normativas y entidades distintas.
- Compradores y unidades de precio diferentes.
- Soporte especializado.
- Pruebas y contingencias independientes.
- Una persona no puede estabilizar salud, nomina, RADIAN y POS simultaneamente con calidad.

## Arquitectura de producto

```text
Cuenta / empresa / seguridad
        ↓
Motor de operaciones fiscales
        ↓
Ventas | DEE | soporte | nomina | recepcion | RADIAN
        ↓
PT | DIAN cuando corresponda | MUV | RNDC
```

Compartir autenticacion, auditoria, webhooks, archivos y consumo. No compartir a la fuerza modelos regulatorios.

## Gates por modulo

1. Norma y anexo vigentes.
2. Oferta PT y precio.
3. Contrato multiempresa/reventa.
4. Sandbox reproducible.
5. Clave conocida para reconciliar.
6. Pruebas de duplicado/timeout.
7. Documentacion y plan comercial.
8. Design partner.
9. Margen positivo.
10. Runbook y soporte.

## Capacidad

Con una persona, mantener como maximo dos familias nuevas en estabilizacion. Un nuevo vertical comienza cuando el anterior alcanza soporte bajo, reconciliacion automatica y dos ciclos operativos sin incidente grave.

## Decision

Vender modulos, no una promesa monolitica. “Suite completa” describe el portafolio acumulado, no el contenido de cada plan.
