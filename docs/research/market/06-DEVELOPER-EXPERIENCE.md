# Experiencia del desarrollador

**Fecha de corte:** 2026-10-01

## Evidencia concreta

| Competidor | Evidencia pública | Evaluación basada en hechos |
|---|---|---|
| Factus | docs v2; OAuth; sandbox/producción; FEV/NC/ND, soporte, nómina y RADIAN; listar/ver/PDF/XML | referencia más completa por endpoint y ciclo CRUD |
| Matias | quickstart; sandbox; errores forzables; múltiples familias; webhooks y dashboard | referencia de amplitud y pruebas deterministas |
| HKA | wiki, demo, guías de timeout, DEE, soporte, nómina y API RIPS | fuerte en operación y módulos; onboarding asistido |
| Aliaddo | API key, sandbox/onboarding publicado, webhooks por plan, rate limits | oferta clara; docs detalladas requieren navegación/cuenta |
| Bilidox | REST, JSON, JWT y ambiente gratuito publicados | contrato técnico se entrega por solicitud |
| Alanube | sandbox solicitado, documentación por comprobante y webhooks | developer-oriented, pero no autoservicio completo confirmado |
| Dataico | REST JSON, Postman y páginas de soporte | API requiere conversación comercial |
| Saphety | integración con expertos, operador virtual; objetivo publicado <40 días | experiencia asistida, no quickstart público comparable |
| ESTELA/EDICOM | integración ERP y mecanismos tecnológicos | no evaluable como self-service público |

## Patrones técnicos confirmados

- JSON/REST domina en ofertas developer-first.
- Bearer/OAuth, API key o JWT son comunes.
- Sandbox separado de producción es estándar.
- `reference_code` de Factus y referencias propias observadas respaldan deduplicación, pero no todos publican semántica de idempotencia.
- PDF, XML y AttachedDocument aparecen repetidamente.
- Dashboard acompaña incluso APIs puras porque resuelve soporte y auditoría.
- Webhooks todavía se reservan a planes superiores o no se documentan públicamente.

## DX mínima propia

Un desarrollador debe poder:

1. crear cuenta y obtener credenciales de prueba;
2. usar una empresa ficticia preconfigurada;
3. emitir y consultar cada documento del módulo contratado;
4. forzar aceptado, rechazo, timeout antes/después de recepción y duplicado;
5. descargar XML, PDF y respuesta original;
6. recibir, validar y reintentar webhook;
7. entender un error sin leer el anexo DIAN completo;
8. completar checklist de producción y alta de NIT.

## Diseño por módulos

- Inicio común para autenticación, empresas, rangos, archivos y webhooks.
- Quickstart independiente para ventas, DEE, soporte, nómina, recepción, RADIAN, salud y transporte.
- OpenAPI y colección Postman recortables por módulo.
- Estados externos separados: PT, DIAN, MUV y RNDC.
- Permisos por organización, NIT, entorno y servicio.
- Changelog normativo y fecha de vigencia por esquema.

## Errores y conciliación

Respuesta mínima: código propio estable, categoría, HTTP, mensaje accionable, campos, `retryable`, ID de correlación y mensaje PT/DIAN sin sobrescribir. Un timeout deja estado `UNKNOWN/RECONCILING`; un worker consulta antes de decidir cualquier reenvío.

## Webhooks

HMAC, timestamp, ID de evento, versión de esquema, número de intento, backoff, tolerancia a duplicados, historial, replay manual, rotación de secreto y endpoint de prueba.

## Rúbrica de selección PT (0–2)

| Criterio | 0 | 1 | 2 |
|---|---|---|---|
| Acceso | sin docs | docs públicas | sandbox autoservicio |
| Cobertura | claim comercial | endpoints | casos completos por módulo |
| Errores | mensaje opaco | códigos | remediación + simulación |
| Reconciliación | ausente | consulta | guía de timeout concluyente |
| Multiempresa | no claro | comercial | aislamiento/API probado |
| Webhook | ausente | payload | firma/retry/replay |
| Producción | contacto | checklist | SLA/runbook/escalamiento |
| Precio | oculto | paquete | contrato con todos los costos |

## Prueba de integración

No afirmar “integra en minutos”. Medir con tres integradores: tiempo a credencial, primer FEV, cuatro documentos core, alta de segundo NIT, manejo de rechazo y recuperación de timeout. Repetir por cada módulo nuevo.

