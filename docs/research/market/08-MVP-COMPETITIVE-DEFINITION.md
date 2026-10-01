# Definición competitiva del producto

**Fecha de corte:** 2026-10-01  
**Producto objetivo:** plataforma fiscal B2B2B modular para software colombiano.

## Decisión de alcance

El portafolio objetivo cubre todos los servicios investigados. El MVP comercial no. La investigación muestra competidores amplios y baratos; intentar igualar todo antes de vender aumentaría riesgo y no crea diferenciación.

## MUST HAVE — release 1

1. FEV, NC, ND y DEE POS con nota de ajuste.
2. Un PT/adapter productivo y fake provider completo.
3. Organizaciones, empresas/NIT, entornos y aislamiento probado.
4. Alta, certificado/firma, software y rangos según reparto contractual.
5. API JSON versionada, API keys/OAuth, rate limit e idempotencia.
6. Validación previa y errores accionables.
7. Cola/worker, estados internos/fiscales separados y consulta.
8. Reconciliación de `UNKNOWN`; nunca reemitir a ciegas.
9. XML, PDF, ApplicationResponse y artefactos descargables.
10. Webhooks firmados con retry, historial y replay.
11. Sandbox determinista, OpenAPI/Postman y quickstarts.
12. Auditoría, métricas, alertas, backup/restore y runbooks.
13. Consumo por NIT/tipo y límites cobrables.
14. Contrato, privacidad, soporte y procedimiento de producción.

## SHOULD HAVE inmediatamente después

- sucursales y múltiples prefijos;
- panel operativo mínimo;
- alertas de rango, certificado y consumo;
- exportación e historial;
- ejemplos JavaScript/C# según pilotos;
- herramientas internas de alta y conciliación;
- documento soporte/ajuste si el mismo cliente ERP lo exige.

## Expansiones condicionadas

| Módulo | Gate comercial | Gate técnico/regulatorio |
|---|---|---|
| Documento soporte | 2 clientes ERP/AP | rango, CUDS, ajuste y sandbox |
| Nómina fiscal | software que ya liquida | batch, CUNE, nota y ciclo mensual |
| Recepción 030–034 | volumen AP real | secuencia, firma, carga/consulta |
| RADIAN avanzado | cliente factoring/tesorería | actores/eventos/anexo completo |
| Otros DEE | cliente ancla por tipo | esquema y ajuste específico |
| Salud/RIPS | IPS/software salud | experto, MUV y norma vigente |
| Transporte/RNDC | TMS/transportador | ambientes DIAN/RNDC separados |

## LATER / fuera del núcleo

Segundo PT, failover automático, SDK para múltiples lenguajes, white-label visual avanzado, BI, POS propio, ERP, contabilidad, liquidación laboral/PILA, factoring financiero, historia clínica y TMS.

## Criterio de salida por módulo

- norma/anexo y contrato del proveedor vigentes;
- precio y unidad de consumo conocidos;
- aceptado, rechazado, duplicado y timeout probados;
- consulta/conciliación y artefactos demostrados;
- documentación externa reproducible;
- al menos un design partner y margen positivo;
- runbook y soporte medidos.

## Gates que pueden detener el proyecto

- el contrato impide intermediación o multiempresa;
- no existe consulta concluyente tras perder la respuesta;
- alta/certificado/soporte por NIT elimina margen;
- integradores prefieren contratar directo y no pagan por la capa;
- el primer piloto requiere que nosotros desarrollemos su integración;
- cambios regulatorios hacen inviable mantener varios módulos con una persona.

## Posicionamiento recomendado

No competir por ser “el más completo” ni “el más barato”. Competir por reducir trabajo del integrador: API coherente, trazabilidad, errores útiles, onboarding multiempresa y recuperación ante fallas.

## Próxima decisión

Antes de implementar los cuatro documentos productivos: dos cotizaciones contractuales, cinco entrevistas profundas, tres candidatos a piloto y una prueba técnica de reconciliación. Si no aparece disposición de pago, detener o cambiar de segmento.

