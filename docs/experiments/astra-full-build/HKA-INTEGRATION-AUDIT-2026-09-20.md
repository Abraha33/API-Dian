# Auditoría HKA — estado real, corrección técnica y Gate de integración

**Fecha:** 2026-09-20  
**Branch auditada:** `experiment/astra-full-api-dian-v1`  
**Objetivo:** corregir supuestos del handoff y definir qué falta realmente antes de integrar The Factory HKA en DEMO.

## 1. Hallazgo principal

En la branch auditada **no existe todavía un adapter HKA real**.

El módulo `apps/api/src/modules/provider/` contiene:
- `fiscal-provider.ts`: puerto neutral.
- `fake-fiscal-provider.ts`: fake configurable.
- tests del fake/provider contract.

No se encontró:
- `HkaFiscalProvider`;
- cliente SOAP;
- cliente REST HKA;
- `HKA_BASE_URL`;
- tokens HKA en `.env.example`;
- implementación real de `EstadoDocumento`;
- integración autenticada con DEMO.

Por tanto, cualquier handoff que declare "adapter HKA offline PASS" debe tratarse como **no verificado por el código de esta branch** hasta localizar una branch/commit distinto que contenga esa implementación.

## 2. Corrección sobre canonicalización

`apps/api/src/common/fiscal/canonicalization.ts` NO implementa canonicalización XML, UBL ni XAdES.

Su función actual es:
1. normalizar un comando fiscal JSON;
2. ordenar claves;
3. normalizar ciertos decimales;
4. generar un SHA-256 semántico interno.

El hash se etiqueta como:

`sha256:fiscal-command-c14n/1`

Esto sirve para identidad/idempotencia semántica interna. **No es la firma electrónica DIAN del XML.**

## 3. Corrección sobre HKA: REST vs SOAP

Documentación oficial HKA vigente consultada el 2026-09-20:

- REST DEMO:  
  https://demoemision21-api.thefactoryhka.com.co
- REST Producción:  
  https://emision21-api.thefactoryhka.com.co
- SOAP V4 DEMO:  
  https://demoemision21v4.thefactoryhka.com.co/ws/v1.0/Service.svc?wsdl
- SOAP V4 Producción:  
  https://emision21v4.thefactoryhka.com.co/ws/v1.0/Service.svc?wsdl

Fuente oficial:
https://felcowiki.thefactoryhka.com.co/index.php/Tips_Urls_de_Emisi%C3%B3n

Conclusión: obtener 404 al pedir un WSDL al host `demoemision21-api` no demuestra una inconsistencia de HKA. Ese host corresponde al servicio REST; el WSDL pertenece al servicio SOAP.

HKA mantiene ambos esquemas de integración:
https://felcowiki.thefactoryhka.com.co/index.php/Generalidades_-_Indice_Manual_Integraci%C3%B3n_Directa

## 4. Corrección sobre XML, CUFE y firma

La documentación de HKA indica que el integrador envía el objeto de factura y la plataforma HKA realiza funciones que incluyen generación/construcción del XML y representación gráfica según configuración. La documentación funcional de HKA también describe que su plataforma calcula/asigna CUFE, construye UBL/XML, firma con el certificado del contribuyente y transmite a DIAN.

Fuentes oficiales:
- https://felcowiki.thefactoryhka.com.co/index.php/M%C3%A9todos_Servicio_Emisi%C3%B3n_Web_TFHKA_-_Indice_Manual_Integraci%C3%B3n_Directa
- https://felcowiki.thefactoryhka.com.co/index.php/Manual_de_usuario_LAYOUT_ARCHIVO_PLANO
- https://felcowiki.thefactoryhka.com.co/index.php/Generalidades_-_Indice_Manual_Integraci%C3%B3n_Directa

Por tanto, **no planificar por defecto** una implementación propia de UBL 2.1 + canonicalización XML + XAdES + firma .p12 dentro de API-DIAN cuando se use HKA como PT, salvo que el contrato específico de integración demuestre que una operación concreta sí lo requiere.

## 5. Qué sí es el cuello de botella real

El cuello de botella de Fase 8 es:

```text
modelo fiscal neutral API-DIAN
        ↓
mapping HKA
        ↓
autenticación DEMO
        ↓
submit
        ↓
normalización de respuesta
        ↓
EstadoDocumento
        ↓
reconciliación
        ↓
XML/PDF/evidencias
```

El riesgo central sigue siendo el invariante:

`UNKNOWN != REEMITIR`

HKA documenta operaciones de emisión, consulta de estado y recuperación de artefactos tanto en sus manuales SOAP como en la oferta REST.

Referencia:
https://felcowiki.thefactoryhka.com.co/index.php/Secci%C3%B3n_para_clientes_de_Integraci%C3%B3n

## 6. Decisión pendiente: REST o SOAP

No elegir protocolo por intuición.

Antes de implementar el adapter:
1. comparar cobertura funcional REST vs SOAP V4 para FEV, NC y ND;
2. confirmar con las credenciales DEMO contratadas qué interfaz está habilitada;
3. comprobar `Enviar`, `EstadoDocumento`, `DescargaXML` y `DescargaPDF`;
4. preferir REST si tiene paridad suficiente y contrato vigente, porque reduce complejidad de transporte;
5. usar SOAP V4 si alguna capacidad necesaria solo existe o está soportada contractualmente allí.

El dominio público de API-DIAN permanece REST/JSON independientemente del transporte del PT.

## 7. PERT corregido — integración HKA FEV segura en DEMO

Alcance de esta estimación:
- desde el estado real de esta branch (sin adapter HKA);
- hasta FEV autenticada en DEMO;
- submit + status/reconciliation + XML/PDF;
- errores y timeouts básicos;
- evidencia reproducible;
- NO incluye todavía NC/ND completas, piloto ni producción.

| Actividad | O (sem) | M (sem) | P (sem) | PERT E |
|---|---:|---:|---:|---:|
| Confirmar protocolo, credenciales y contrato | 0.25 | 0.50 | 1.50 | 0.63 |
| Config/client HKA + fail-closed | 0.25 | 0.50 | 1.00 | 0.54 |
| Mapping FEV neutral → HKA | 0.50 | 1.00 | 2.00 | 1.08 |
| Submit + normalización de respuesta | 0.25 | 0.50 | 1.00 | 0.54 |
| EstadoDocumento + reconciliación | 0.50 | 1.00 | 2.00 | 1.08 |
| Descarga XML/PDF + evidencia | 0.25 | 0.50 | 1.00 | 0.54 |
| Sandbox real + fallos + regresión | 0.50 | 1.00 | 2.50 | 1.17 |
| **TOTAL** | **2.50** | **5.00** | **11.00** | **5.58 semanas** |

Fórmula PERT:
`E = (O + 4M + P) / 6`

Agregado:
`E = (2.5 + 4×5 + 11) / 6 = 5.58 semanas`

### Interpretación

El valor esperado revisado es **~5.6 semanas de esfuerzo secuencial equivalente** para cerrar únicamente la integración FEV segura en DEMO.

No significa una promesa de calendario. Dos personas pueden paralelizar parte del trabajo, pero aprendizaje, soporte HKA, credenciales y debugging pueden volver a serializar tareas.

La estimación anterior de 4.33 semanas no se adopta como canónica porque:
- suponía trabajo criptográfico/XML que HKA probablemente absorbe;
- asumía que ya existía un adapter HKA offline, lo cual no está presente en esta branch;
- trataba el 404 del host REST al pedir WSDL como discrepancia del proveedor.

Eliminar complejidad criptográfica reduce riesgo, pero descubrir que el adapter real aún no existe **aumenta** el trabajo restante. El resultado neto no es necesariamente menor.

## 8. Gate exacto: HKA DEMO SAFE INTEGRATION

No declarar PASS hasta tener evidencia reproducible de todos estos puntos.

### G8.1 Contrato
- [ ] protocolo elegido y documentado: REST o SOAP V4;
- [ ] URLs DEMO verificadas;
- [ ] versión contractual fijada;
- [ ] FEV, NC y ND capability map documentado;
- [ ] códigos de error relevantes normalizados.

### G8.2 Seguridad/configuración
- [ ] credenciales DEMO fuera del repositorio;
- [ ] DEMO y producción separados;
- [ ] allowlist fail-closed;
- [ ] proceso se niega a iniciar/mutar con configuración ambigua;
- [ ] secretos redactados de logs;
- [ ] ninguna credencial productiva usada durante el gate.

### G8.3 FEV happy path
- [ ] comando neutral mapeado a HKA;
- [ ] submit DEMO autenticado;
- [ ] respuesta persistida;
- [ ] referencia/CUFE capturada cuando aplique;
- [ ] EstadoDocumento consultable;
- [ ] XML recuperable;
- [ ] PDF recuperable;
- [ ] evidencia vinculada a la operación interna.

### G8.4 Rechazo determinista
- [ ] provocar documento inválido controlado;
- [ ] HKA/DIAN devuelve rechazo;
- [ ] API-DIAN lo normaliza como rechazo concluyente;
- [ ] no se reintenta automáticamente un rechazo determinista.

### G8.5 UNKNOWN != REEMITIR
- [ ] provocar timeout/ambigüedad después de posible recepción;
- [ ] resultado interno = UNKNOWN/TRANSPORT_AMBIGUOUS;
- [ ] número de submits no aumenta por retry automático;
- [ ] solo se ejecuta reconciliación;
- [ ] EstadoDocumento resuelve cuando exista evidencia;
- [ ] si no resuelve, escala a NEEDS_ATTENTION, nunca a reemisión ciega.

### G8.6 Idempotencia
- [ ] dos requests concurrentes con misma Idempotency-Key;
- [ ] exactamente una operación fiscal interna;
- [ ] no más de un submit externo cuando corresponde;
- [ ] payload incompatible con la misma key es rechazado.

### G8.7 Resiliencia
- [ ] 429/rate limit normalizado;
- [ ] 5xx normalizado;
- [ ] connection refused;
- [ ] timeout;
- [ ] caída/reinicio del worker;
- [ ] backlog se drena sin duplicación;
- [ ] operación ambigua sobrevive reinicio.

### G8.8 Aislamiento
- [ ] tenant A no consulta artefactos/estado de tenant B;
- [ ] provider references no permiten bypass del tenant boundary;
- [ ] logs no filtran payload/secretos entre tenants.

### G8.9 Evidencia del gate
- [ ] tests automatizados;
- [ ] logs redactados;
- [ ] request/response sanitizados de DEMO;
- [ ] fecha, versión del contrato y endpoint registrados;
- [ ] commit SHA;
- [ ] CI verde;
- [ ] reporte final `HKA DEMO SAFE INTEGRATION: PASS`.

## 9. Siguiente paso de implementación

No implementar firma XML propia.

Primero:
1. obtener/confirmar credenciales HKA DEMO;
2. comparar REST vs SOAP V4 con el capability map;
3. seleccionar el transporte;
4. crear `HkaFiscalProvider` detrás del puerto existente;
5. implementar FEV happy path;
6. implementar `EstadoDocumento` como base de reconciliación;
7. implementar XML/PDF;
8. ejecutar escenarios de ambigüedad;
9. cerrar el Gate.

## 10. Regla canónica de esta auditoría

Hasta que aparezca evidencia de otra branch/commit:

> **Core provider-neutral: implementado. FakeFiscalProvider: implementado. HKA real: NO implementado todavía en `experiment/astra-full-api-dian-v1`.**

No volver a afirmar "adapter HKA offline PASS" basándose solo en handoffs previos.
