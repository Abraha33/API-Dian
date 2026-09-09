# Solicitud de integración PT real — DATAICO S.A.S.

**Decisión del owner:** usar DATAICO como PT objetivo para la Fase 8.

**Estado del gate:** Fase 7 (Ready for PT Integration) = **PASS**.

Este documento reemplaza a `HKA-INTEGRATION-REQUEST.md` como handoff activo para la Fase 8. El documento de HKA se conserva solo como histórico del experimento.

No se deben copiar ni versionar secretos reales en GitHub, logs, prompts o archivos del repositorio.

---

## 1. Evidencia pública verificada de DATAICO

La documentación pública de DATAICO confirma:

- API de integración para Factura Electrónica, Nota Crédito, Nota Débito, POS electrónico, Documento Soporte, Nómina y Eventos de Recepción.
- Para Factura Electrónica, la autenticación usa `Dataico_account_id` y `Auth-token`.
- Endpoint público documentado para crear factura: `POST https://api.dataico.com/direct/dataico_api/v2/invoices`.
- La documentación también publica consulta de factura, reenvío, notas crédito/débito y recursos Swagger.
- DATAICO presenta su API como REST/JSON para integración con ERP/software de terceros.

Fuentes públicas verificadas el 2026-09-08:

- https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico-factura-electr%C3%B3nica
- https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico
- https://portaldelcliente.dataico.com/es/knowledge/integraci%C3%B3n-api-dataico-s-a-s
- https://facturaelectronica.dataico.com/api

---

## 2. Lo que el owner debe obtener desde su cuenta DATAICO

Sin compartir secretos en el chat ni en GitHub, confirmar localmente:

- [ ] `Dataico_account_id`.
- [ ] `Auth-token`.
- [ ] cuenta/empresa que se utilizará para pruebas.
- [ ] numeración/configuración disponible para el ambiente de prueba o habilitación.
- [ ] si existe sandbox aislado para integradores o si las pruebas se ejecutan sobre ambiente DIAN de habilitación.
- [ ] si la cuenta actual permite uso de API o requiere activación comercial adicional.

Los valores reales de `Auth-token`, tokens DIAN, certificados y demás secretos deben permanecer exclusivamente en un secret store o `.env` local no versionado.

---

## 3. Preguntas que todavía deben confirmarse con DATAICO antes de mutaciones reales

- [ ] ¿Existe sandbox/DEMO separado de producción para integradores?
- [ ] ¿El sandbox conecta a DIAN habilitación o a simulador propio?
- [ ] Rate limit real de sandbox.
- [ ] Rate limit real de producción.
- [ ] Si el rate limit es por cuenta, empresa/contribuyente o credencial.
- [ ] Comportamiento exacto ante rate limit (`429`, headers y retry-after si aplica).
- [ ] SLA de disponibilidad y latencia.
- [ ] Política de mantenimiento.
- [ ] Soporte/escalamiento técnico.
- [ ] Modelo integrador/multiempresa: una cuenta integrador con N empresas o contrato/credencial por empresa.
- [ ] Modelo comercial/precio para API y volumen.
- [ ] Proceso de salida/migración a otro PT.

---

## 4. Pregunta crítica: ambigüedad y reconciliación

Antes de permitir reintentos mutantes contra DATAICO se debe comprobar cómo clasificar estos escenarios:

1. timeout antes de que DATAICO reciba el request;
2. DATAICO recibió el request pero todavía no lo envió a DIAN;
3. DATAICO lo envió a DIAN pero no existe respuesta concluyente;
4. respuesta de DATAICO perdida después de que el documento pudo ser aceptado;
5. mecanismo de consulta por UUID/CUFE/identificador estable para reconciliar.

Regla no negociable de API-DIAN:

`UNKNOWN != REEMITIR`

La existencia pública de una operación de "reenviar factura" en DATAICO no autoriza a API-DIAN a usarla automáticamente. Solo puede utilizarse cuando el estado previo demuestre que el documento no fue enviado o cuando la semántica de DATAICO esté verificada.

---

## 5. Primer contrato conocido para el adapter

### Crear factura electrónica

- Método: `POST`.
- Endpoint público documentado: `https://api.dataico.com/direct/dataico_api/v2/invoices`.
- Transporte: HTTPS + JSON.
- Autenticación documentada: `Dataico_account_id` + `Auth-token`.

El adapter `DataicoFiscalProvider` deberá traducir nuestro contrato fiscal canónico a DATAICO sin filtrar nombres/campos propios de DATAICO hacia la API pública.

No implementar campos por inferencia. Obtener el schema/Swagger vigente y mapear explícitamente cada campo.

---

## 6. Alcance inicial de Fase 8

Primero integrar únicamente el alcance comercial V1 ya congelado:

1. FEV.
2. Nota Crédito.
3. Nota Débito.
4. consulta/estado.
5. recuperación de evidencia/identificadores disponibles.
6. reconciliación.
7. contingencia mínima aplicable según capacidades verificadas del PT.

POS, documento soporte, nómina, eventos de recepción y salud pueden estar disponibles en DATAICO, pero no deben ampliar automáticamente el alcance de V1.

---

## 7. Batería de pruebas de Fase 8

Repetir contra DATAICO real/sandbox todo invariante relevante ya demostrado con `FakeFiscalProvider`:

1. submit exitoso → estado final normalizado + evidencia.
2. rechazo determinista → no retry ciego.
3. validación local vs validación remota correctamente diferenciada.
4. timeout antes de envío, si DATAICO permite demostrarlo.
5. timeout/ambigüedad después de posible envío → `UNKNOWN`.
6. reconciliación desde `UNKNOWN` sin segundo submit.
7. agotamiento de reconciliación → `NEEDS_ATTENTION`/equivalente.
8. rate limit real → backoff sin pérdida/duplicación.
9. caída/5xx del PT → cola durable y recuperación.
10. `Idempotency-Key` concurrente → una sola operación fiscal lógica.
11. aislamiento tenant/organization/application.
12. ninguna credencial DATAICO aparece en logs.
13. repetir benchmark respetando el rate limit real de DATAICO.

---

## 8. Gate de inicio

Fase 8 puede comenzar únicamente cuando:

- [x] Fases 0–7 están PASS.
- [x] Owner seleccionó DATAICO como PT objetivo.
- [ ] credenciales/API de prueba disponibles localmente.
- [ ] ambiente de prueba/sandbox confirmado.
- [ ] schema/Swagger vigente recuperado.
- [ ] respuesta suficiente sobre ambigüedad/reconciliación.

Estado actual:

`PHASE 8: BLOCKED — falta acceso técnico de prueba/credenciales y confirmar semántica remota de DATAICO.`
