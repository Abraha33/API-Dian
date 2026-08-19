# F4 — Matriz de selección del PT V1

**Corte de evidencia pública:** 2026-08-19  
**Estado:** Shortlist cerrada; selección final pendiente sandbox + contrato  
**Regla:** gates críticos no se compensan con precio.

> **Actualización F4C 2026-08-19:** `docs/f4c-evidencia-publica-2026-08-19.md` amplía la evidencia oficial y define el orden operativo provisional HKA → DATAICO → Facture/ESTELA. Ese orden sirve para decidir **a quién probar primero**; no convierte evidencia pública en PASS contractual ni reemplaza esta matriz. Los scores/gates finales solo cambian con sandbox, contrato y evidencia reproducible.

## 1. Fuente de habilitación

Fuente oficial DIAN consultada:

- https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/proveedores-tecnologicos/

La página consultada incluye entre los proveedores tecnológicos autorizados:

- DATAICO S.A.S — NIT 901223648.
- THE FACTORY HKA COLOMBIA SAS — NIT 900390126.
- FACTURE S.A.S — NIT 900399741.

La habilitación debe volver a verificarse inmediatamente antes de contratación/producción.

## 2. Criterios

Leyenda:

- `PASS-public`: evidencia pública suficiente para mantener candidato.
- `PARTIAL`: evidencia positiva pero falta una propiedad crítica.
- `UNKNOWN`: no demostrada públicamente.
- `FAIL`: incompatible.

| Gate | The Factory HKA | DATAICO | FACTURE |
|---|---|---|---|
| DIAN habilitado | PASS-public | PASS-public | PASS-public |
| API integración | PASS-public | PASS-public | PARTIAL |
| Ambiente demo/sandbox | PASS-public | PASS-public | UNKNOWN |
| FEV | PASS-public | PASS-public | PARTIAL |
| NC/ND | PASS-public | PASS-public | UNKNOWN |
| DEE POS | PASS-public | PASS-public | UNKNOWN |
| Nota ajuste DEE POS | PASS-public/validar flujo exacto | PASS-public | UNKNOWN |
| Estado/consulta | PASS-public | PASS-public para factura; validar POS/notas | UNKNOWN |
| XML/PDF por integración | PASS-public | PARTIAL-public; confirmar endpoint API para todos V1 | PARTIAL-public viewer |
| Gestión certificado por PT | PASS-public | PASS-public claim | UNKNOWN |
| Modelo casa de software/multiempresa | PARTIAL-public | PASS-public claim | UNKNOWN |
| Reconciliar timeout ambiguo | PARTIAL | PARTIAL | UNKNOWN |
| “not found” concluyente y safe-to-resend | UNKNOWN | UNKNOWN | UNKNOWN |
| Idempotency key PT | UNKNOWN | UNKNOWN | UNKNOWN |
| Rate limits/timeouts documentados | UNKNOWN | UNKNOWN | UNKNOWN |
| Contingencias exactas V1 | PARTIAL | PARTIAL | UNKNOWN |
| SLA contractual API | UNKNOWN | UNKNOWN (marketing publica uptime, no usar como contrato) | UNKNOWN |
| Precio API real | UNKNOWN | UNKNOWN; página aclara que planes publicados no son API | UNKNOWN |

## 3. The Factory HKA — evidencia

Fuentes públicas relevantes:

- Hub API: https://developers.thefactoryhka.com.co/
- Wiki integración: https://felcowiki.thefactoryhka.com.co/index.php/Secci%C3%B3n_para_clientes_de_Integraci%C3%B3n
- Documento equivalente/generalidades: https://felcowiki.thefactoryhka.com.co/index.php/Generalidades_-_Indice_del_Manual_Integraci%C3%B3n_Directa_HKA_Documentos_Equivalentes_Electr%C3%B3nicos
- URLs demo/producción DEE: https://felcowiki.thefactoryhka.com.co/index.php/Tips_Urls_de_documento_equivalente_Integraci%C3%B3n
- Gestión certificado: https://felcowiki.thefactoryhka.com.co/index.php/Configuraci%C3%B3n_-_Portal_DFactura_Validaci%C3%B3n_Previa
- Intermitencia/timeouts: ver `docs/f4c-evidencia-publica-2026-08-19.md`.

Puntos fuertes observados:

- documentación de integración pública extensa;
- método explícito `EstadoDocumento`;
- descarga XML/PDF documentada;
- DEE tiene demo y producción;
- certificado cargado/gestionado por HKA según portal;
- canales de soporte para integración publicados;
- documentación pública específica sobre estados no concluyentes, reconstrucción y reconsulta ante intermitencia.

Riesgo no resuelto:

La evidencia pública mejora mucho la confianza en reconciliación, pero **todavía no establece un criterio contractual/experimental suficiente para mapear un resultado “no encontrado” a `NOT_FOUND_CONCLUSIVE`**. Debe probarse en sandbox y obtenerse por escrito.

## 4. DATAICO — evidencia

Fuentes:

- modelo API: https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico
- FE API: https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico-factura-electr%C3%B3nica
- consulta factura: https://portaldelcliente.dataico.com/es/knowledge/documentaci%25C3%25B3n-t%25C3%25A9cnica-de-la-api-de-dataico-factura-electr%25C3%25B3nica-1
- nota ajuste POS API: https://portaldelcliente.dataico.com/es/knowledge/anulacio
- landing API/casa software: https://facturaelectronica.dataico.com/api
- evidencia de estados pendientes/sincronización y reenvío: ver `docs/f4c-evidencia-publica-2026-08-19.md`.

Puntos fuertes:

- API explícitamente orientada a ERP/POS/software propio;
- FEV, NC, ND y POS documentados;
- consulta de factura por API;
- nota de ajuste POS por API documentada;
- landing pública afirma sandbox ilimitado;
- landing pública afirma certificado digital incluido y devuelve PDF/XML;
- modelo comercial publicado habla de gestionar documentos de clientes de un software;
- documentación pública reconoce que el estado local puede quedar pendiente aun cuando DIAN ya haya aceptado, y describe resincronización posterior.

Riesgos:

- la portada de documentación listada para POS no muestra públicamente una consulta equivalente tan clara como FE; revisar Swagger/credenciales;
- no está demostrada semántica de “no encontrado” tras timeout;
- un estado denominado `DIAN_NO_ENVIADO` no se mapeará por nombre a `TRANSPORT_PROVEN_NOT_SENT`;
- claims de uptime/latencia son marketing, no SLA contractual;
- la propia página de precios indica que precios visibles no corresponden a conexión API.

## 5. FACTURE / ESTELA — evidencia

Fuente DIAN confirma habilitación vigente de FACTURE S.A.S. ESTELA publica que Facture se integró a su familia y muestra oferta de FEV/documento equivalente, pero la investigación pública del 2026-08-19 no encontró documentación técnica equivalente a HKA/DATAICO para validar responsablemente auth, sandbox, correlación y protocolo de ambigüedad.

Decisión: reserva; solicitar paquete técnico privado y sandbox antes de invertir tiempo de integración.

## 6. Orden de prueba

### Candidato A — The Factory HKA

Primero porque la evidencia pública actual es más fuerte exactamente en nuestro riesgo crítico: estados intermedios, reconstrucción/reconsulta, consulta de estado y proceso documentado de ambiente DEMO/integración.

No significa que sea más barato ni que vaya a ganar.

### Candidato B — DATAICO

Segundo y posiblemente preferible si el sandbox demuestra reconciliación robusta, por simplicidad/API-first, soporte explícito para software/POS y delegación de certificado publicada.

### Reserva — Facture / ESTELA

Tercero hasta recibir API docs, sandbox y respuestas verificables sobre ambigüedad.

## 7. Preguntas contractuales obligatorias

Usar el cuestionario normalizado `docs/f4c-cuestionario-solicitud-sandbox-pt.md` para que los tres candidatos respondan la misma base.

Gates especialmente críticos:

1. ¿Puede una casa de software operar múltiples NIT/clientes mediante API bajo un acuerdo único? ¿Cómo se separan cuentas/credenciales?
2. ¿Quién adquiere/custodia/carga/renueva el certificado? ¿Nuestra infraestructura necesita alguna vez la clave privada?
3. Para cada FEV/NC/ND/POS/nota POS: ¿qué identificador conocemos **antes** del POST para consultar después?
4. Si el POST hace timeout: ¿qué endpoint consultamos y con qué campos?
5. ¿La consulta es read-after-write? Si no, ¿cuál es la ventana máxima documentada?
6. ¿Qué significa exactamente `not found`? ¿Cuándo autoriza reenvío seguro?
7. ¿Cómo responde el PT al mismo número/documento enviado dos veces?
8. ¿Existe idempotency key/client reference soportada por servidor?
9. ¿Hay retries automáticos internos del PT que debamos conocer?
10. Timeouts recomendados, rate limits, 429/Retry-After y ventanas de mantenimiento.
11. Cómo obtener XML firmado, ApplicationResponse/validación y PDF vía API para todos los documentos V1.
12. Contingencias FEV y DEE POS soportadas y procedimiento exacto.
13. Sandbox: límites, datos de prueba, simulación de errores/timeouts.
14. SLA productivo, severidades, horario y canal de escalamiento.
15. RPO/retención/disponibilidad de documentos en el PT.
16. Tratamiento de datos, subencargados, ubicación/custodia, borrado/retención contractual.
17. Precio API: onboarding por NIT, documento, mínimo, certificado, soporte, sandbox, sobreconsumo.
18. Versionado API: deprecación, aviso previo y compatibilidad.

## 8. Regla de selección

Un candidato gana solo si:

```text
all critical gates PASS
AND ambiguity test PASS
AND contract acceptable
AND cost/support operationally sustainable
```

No se calcula un promedio que permita que un FAIL crítico desaparezca dentro de un score total.
