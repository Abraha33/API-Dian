# F4C — Evidencia pública oficial actualizada

**Corte:** 2026-08-19  
**Estado:** pre-F4C; no reemplaza sandbox/contrato/prueba controlada  
**Objetivo:** reducir incertidumbre antes de solicitar accesos privados y decidir el orden de prueba de PT.

## Conclusión ejecutiva

Orden recomendado para ejecutar F4C:

1. **The Factory HKA Colombia** — candidato prioritario de prueba;
2. **DATAICO** — segundo candidato / alternativa inmediata;
3. **Facture / ESTELA** — reserva hasta obtener evidencia técnica privada suficiente.

Este orden es **provisional**. No selecciona PT definitivo y no autoriza F6C.

La razón principal no es marca ni precio: es qué tan verificable resulta públicamente el protocolo de ambigüedad, reconstrucción y reconciliación que protege contra duplicidad fiscal.

## 1. Habilitación DIAN vigente

La página oficial de Proveedores Tecnológicos de la DIAN consultada el 2026-08-19 incluye:

- DATAICO S.A.S — NIT 901223648;
- FACTURE S.A.S — NIT 900399741;
- THE FACTORY HKA COLOMBIA SAS — NIT 900390126.

Fuente oficial:

- https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/proveedores-tecnologicos/

Esto confirma presencia actual en el listado público, pero **no** demuestra por sí solo calidad de API, sandbox, SLA ni tratamiento de ambigüedad.

---

## 2. The Factory HKA Colombia

### Evidencia pública favorable

The Factory HKA publica una guía específica de intermitencia/timeouts DIAN que distingue varios puntos de falla entre ERP, TFHKA y DIAN.

La guía documenta, entre otros comportamientos:

- transacciones que pueden quedar en estado intermedio mientras se busca un estado definitivo;
- consultas posteriores para reconstruir/actualizar una transacción cuyo resultado síncrono no fue concluyente;
- diferenciación entre validación definitiva, espera y eventual inexistencia;
- recomendación explícita de consultar de nuevo cuando todavía no existe `ApplicationResponse` concluyente;
- advertencia de que un CUFE/código de respuesta aislado no equivale necesariamente a validación DIAN concluyente;
- tratamiento de intentos posteriores y reconstrucción para evitar perder el documento originalmente validado;
- recomendación de preservar el mismo contenido fiscal en reintentos y no reutilizar consecutivos de forma apresurada.

Fuente:

- https://felcowiki.thefactoryhka.com.co/index.php/Recomendaciones_para_integraciones_ante_escenarios_de_intermitencia_o_Timeouts_DIAN

### Acceso de prueba documentado

HKA también publica el flujo de implementación de una integración. Describe:

1. acuerdo comercial con la casa de software/integrador;
2. registro/configuración en ambiente de pruebas;
3. generación de credenciales de prueba;
4. generación de folios para pruebas;
5. entrega de demos y documentación;
6. asignación de especialista de integración;
7. pruebas contra ambiente DEMO;
8. desarrollo de captación de estados asíncronos;
9. posterior configuración de producción.

Fuente:

- https://felcowiki.thefactoryhka.com.co/index.php/Etapas_para_la_implementaci%C3%B3n_de_la_integraci%C3%B3n

### Lectura para nuestro diseño

La documentación pública de HKA **encaja conceptualmente** con nuestro protocolo interno:

```text
resultado no concluyente
→ estado intermedio/UNKNOWN
→ consulta/reconstrucción
→ resultado concluyente
→ solo entonces decidir nuevo submit
```

Esto no significa que podamos mapear todavía sus códigos a nuestro dominio. El mapping real debe salir del sandbox y del contrato.

### Pendientes obligatorios HKA

F4C debe confirmar en sandbox:

- método exacto de envío para FEV y POS electrónico;
- identificador/correlación disponible antes y después del submit;
- consulta exacta por consecutivo/UUID/CUFE/otra referencia;
- semántica de todos los códigos que pueden acompañar timeout/intermitencia;
- cuándo la plataforma considera una transacción inexistente de forma realmente concluyente;
- tiempo mínimo/máximo de propagación antes de esa conclusión;
- XML/PDF y referencias descargables;
- límites, SLA, soporte y procedimiento de escalamiento;
- responsabilidades sobre certificado/firma;
- precios y mínimos contractuales reales.

**Decisión provisional:** ejecutar la prueba de ambigüedad con HKA primero.

---

## 3. DATAICO

### Evidencia pública favorable

DATAICO mantiene documentación técnica pública de su API y publica explícitamente un caso en el que:

- DIAN ya muestra la factura aceptada;
- DATAICO todavía puede mostrar `Sin enviar` o `Esperando respuesta`;
- la plataforma realiza verificaciones automáticas posteriores contra DIAN;
- el desfase suele resolverse en segundo plano;
- si persiste, soporte puede forzar una sincronización manual;
- se puede verificar el CUFE directamente contra DIAN mientras se resuelve.

Fuente:

- https://portaldelcliente.dataico.com/es/knowledge/factura-aparece-aceptada-dian-pero-no-actualiza-dataico

Esto confirma que DATAICO reconoce públicamente la diferencia entre resultado síncrono y estado fiscal definitivo.

### API de reenvío/estado

DATAICO también documenta un `PUT` para reenviar a DIAN una factura existente cuando está en estado `DIAN_NO_ENVIADO`, y su respuesta de API expone datos como `dian_status`, CUFE y UUID del documento.

Fuente:

- https://portaldelcliente.dataico.com/es/knowledge/reenviar-a-la-dian-una-factura-existente-de-la-cuenta-dataico-con-el-estado-dian_no_enviado

### Riesgo todavía abierto

La documentación pública revisada **no prueba todavía** que un determinado `GET`, 404, ausencia por UUID o estado local pueda clasificarse como nuestro `NOT_FOUND_CONCLUSIVE`.

Tampoco prueba que `DIAN_NO_ENVIADO` equivalga siempre a nuestro `TRANSPORT_PROVEN_NOT_SENT` para todos los puntos de falla posibles.

Por lo tanto:

```text
DIAN_NO_ENVIADO != PROVEN_NOT_SENT
```

hasta que el sandbox/soporte/contrato demuestren la equivalencia exacta bajo las condiciones relevantes.

### Pendientes obligatorios DATAICO

- proceso actual para obtener cuenta/API de sandbox o ambiente aislado;
- comportamiento ante timeout antes de recibir UUID;
- comportamiento ante timeout después de recibir UUID pero antes de respuesta DIAN;
- consulta/reconciliación por UUID/CUFE/consecutivo;
- ventana de sincronización y semántica de estados;
- prueba negativa de duplicidad deliberada;
- criterio contractual para reenvío seguro;
- soporte/escalamiento;
- cobertura real de POS electrónico y notas de ajuste vía API;
- precios/mínimos;
- custodia de certificado/firma.

**Decisión provisional:** mantener como segundo candidato y ejecutar F4C inmediatamente si HKA no entrega acceso/documentación suficiente o falla gate crítico.

---

## 4. Facture / ESTELA

### Habilitación y continuidad de marca

FACTURE S.A.S continúa apareciendo en la lista pública vigente de PT de la DIAN.

El sitio actual de ESTELA indica que Facture se integró a la familia ESTELA y mantiene acceso para clientes.

Fuentes:

- https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/proveedores-tecnologicos/
- https://www.estela.com/es-co/facture

### Oferta pública relevante

ESTELA publica oferta de emisión de factura/documentos electrónicos para Colombia, integración con sistemas empresariales, trazabilidad y soporte de documento equivalente electrónico.

Fuentes:

- https://www.estela.com/es-co/e-dt-emision-factura-electronica
- https://www.estela.com/documento-equivalente

### Déficit para F4C

En la investigación pública actual no se encontró documentación técnica equivalente a HKA/DATAICO que permita verificar:

- API de emisión;
- auth;
- sandbox;
- consulta por correlación;
- protocolo de timeout/ambigüedad;
- criterio `NOT_FOUND_CONCLUSIVE`;
- criterio `PROVEN_NOT_SENT`;
- XML/PDF por API;
- códigos normalizables.

Eso no demuestra que no exista: puede ser documentación privada para clientes/integradores. Pero **mientras no se entregue**, no podemos puntuar esos criterios como cumplidos.

**Decisión provisional:** reserva #3; solicitar paquete técnico y sandbox, pero no invertir primero el esfuerzo de integración.

---

## 5. Matriz pública provisional — sin sustituir F4C

Escala:

- `PÚBLICO FUERTE`: existe evidencia oficial directamente útil para el gate;
- `PÚBLICO PARCIAL`: existe señal oficial, pero falta equivalencia contractual/técnica;
- `NO VERIFICADO`: no encontrado públicamente en este corte.

| Criterio | HKA | DATAICO | Facture/ESTELA |
|---|---|---|---|
| aparece en listado DIAN actual | PÚBLICO FUERTE | PÚBLICO FUERTE | PÚBLICO FUERTE |
| documentación técnica pública | PÚBLICO FUERTE | PÚBLICO FUERTE | NO VERIFICADO |
| proceso público de ambiente de pruebas | PÚBLICO FUERTE | PÚBLICO PARCIAL | NO VERIFICADO |
| reconoce resultado asíncrono/pendiente | PÚBLICO FUERTE | PÚBLICO FUERTE | PÚBLICO PARCIAL |
| consulta/reconciliación documentada | PÚBLICO FUERTE | PÚBLICO PARCIAL | NO VERIFICADO |
| criterio público seguro de inexistencia/reenvío | PÚBLICO PARCIAL | NO VERIFICADO | NO VERIFICADO |
| POS/documento equivalente visible públicamente | PÚBLICO FUERTE | PÚBLICO FUERTE | PÚBLICO FUERTE |
| XML/PDF integrable documentado públicamente | PÚBLICO PARCIAL | PÚBLICO PARCIAL | PÚBLICO PARCIAL |

No convertir esta tabla en puntaje contractual. La matriz oficial `docs/f4-matriz-seleccion-pt-v1.md` solo se llena con evidencia suficiente del gate.

---

## 6. Orden operativo de F4C

### Paso 1 — HKA

Solicitar/confirmar:

- propuesta para casa de software/integrador;
- ambiente DEMO;
- credenciales;
- documentación actual de FEV + POS electrónico;
- contacto técnico;
- contrato/SLA;
- pricing;
- confirmación escrita del protocolo de ambigüedad/reconciliación.

Luego ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` y llenar fixtures del harness.

### Paso 2 — DATAICO en paralelo administrativo

Mientras se prueba HKA, solicitar acceso/API comercial y respuestas escritas a las mismas preguntas. No invertir todavía en adapter real.

### Paso 3 — Facture/ESTELA

Solicitar paquete técnico completo. Si no hay acceso verificable a sandbox/contrato/API, mantener como reserva sin gastar tiempo de implementación.

---

## 7. Criterio de salida de F4C

F4C no se cierra porque un proveedor “tenga API”. Se cierra cuando un candidato pasa los gates críticos y podemos completar fixtures reales del harness sin afirmaciones especulativas.

Mínimo:

```text
sandbox real
+ credenciales
+ FEV
+ POS electrónico
+ auth
+ correlación
+ timeout controlado
+ reconcile
+ prueba duplicado
+ XML/PDF
+ SLA/soporte
+ contrato/precio
+ responsabilidad certificado
```

Si no podemos demostrar cuándo **no** es seguro reemitir, el proveedor no pasa F4C aunque el happy path sea fácil.
