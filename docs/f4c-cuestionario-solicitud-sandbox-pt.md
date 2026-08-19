# F4C — Cuestionario para solicitar sandbox y evidencia al PT

**Corte:** 2026-08-19  
**Uso:** enviar el mismo núcleo de preguntas a HKA, DATAICO y Facture/ESTELA para comparar evidencia equivalente.

## Regla

No pedir únicamente “documentación de API”. La solicitud debe obtener información suficiente para decidir si un resultado ambiguo puede reconciliarse sin riesgo de doble emisión.

## 1. Identificación del caso de uso

Indicar al proveedor:

```text
Somos una casa de software/integrador en Colombia.
Estamos construyendo un POS propio para comercios y una capa fiscal interna.
V1 utilizará un solo Proveedor Tecnológico habilitado.
Necesitamos Factura Electrónica de Venta y Documento Equivalente Electrónico POS, con sus notas/ajustes aplicables.
La prioridad es evitar duplicidad fiscal ante timeouts, respuestas perdidas o estados no concluyentes.
```

No presentar el producto como API pública multi-PT ni como proveedor tecnológico propio.

## 2. Acceso de prueba

Solicitar:

1. ¿Existe sandbox/DEMO aislado para integración de casas de software?
2. ¿Cómo se crean las credenciales?
3. ¿Las credenciales de prueba pertenecen al integrador, al contribuyente o a ambos?
4. ¿Se puede probar FEV?
5. ¿Se puede probar Documento Equivalente Electrónico POS?
6. ¿Se pueden probar notas crédito/débito y notas de ajuste POS?
7. ¿El sandbox se conecta a un ambiente DIAN de habilitación o a un simulador del PT?
8. ¿Qué limitaciones tiene frente a producción?
9. ¿Entregan datos/folios/numeración de prueba?
10. ¿Asignan contacto técnico durante integración?

## 3. Correlación e idempotencia

Preguntar por escrito:

1. ¿Qué identificador podemos generar nosotros **antes** del submit y recuperar posteriormente?
2. ¿Existe idempotency key nativa?
3. ¿Existe identificador único de request/transacción del PT?
4. ¿Existe UUID interno del documento?
5. ¿Podemos consultar por:
   - prefijo + consecutivo;
   - UUID;
   - CUFE/CUDE;
   - referencia externa del ERP/POS;
   - id transaccional del PT?
6. ¿Qué campos permanecen estables entre submit, consulta, XML y PDF?
7. ¿Qué ocurre si enviamos exactamente el mismo contenido dos veces?
8. ¿Qué ocurre si reutilizamos el mismo consecutivo con contenido diferente?

## 4. Prueba crítica de timeout/ambigüedad

Solicitar respuesta concreta para cada punto:

### A. Timeout antes de que el PT reciba el request

- ¿Cómo se identifica?
- ¿Qué consulta lo demuestra?
- ¿Existe prueba técnica de que no ocurrió side effect remoto?
- ¿Cuándo es seguro reintentar?

### B. PT recibió el request pero no lo envió a DIAN

- ¿Qué estado queda persistido?
- ¿Puede consultarse por una referencia conocida por nosotros?
- ¿Cuándo puede clasificarse de forma concluyente como “no enviado”?

### C. PT envió a DIAN pero no obtuvo respuesta concluyente

- ¿Qué estado retorna?
- ¿Cómo reconcilia el PT posteriormente?
- ¿Cuál es la ventana típica/máxima de propagación?
- ¿Debemos evitar reenviar durante esa ventana?

### D. DIAN aceptó pero la respuesta al PT/ERP se perdió

- ¿Cómo recuperamos la aceptación original?
- ¿Cómo obtenemos CUFE/CUDE, ApplicationResponse, XML y PDF del documento correcto?
- ¿Qué evita que un segundo submit cree una inconsistencia?

## 5. “No encontrado”

Esta sección es bloqueante.

Preguntar:

1. Si una consulta devuelve 404/no encontrado/inexistente, ¿eso significa que el documento **nunca** llegó a DIAN?
2. ¿Puede existir una ventana donde la consulta diga no encontrado y luego aparezca aceptado?
3. ¿Cuánto dura esa ventana?
4. ¿Hay otro endpoint/consulta que deba ejecutarse antes de concluir inexistencia?
5. ¿Qué evidencia concreta permite afirmar que un nuevo submit no duplicará una emisión previa?
6. ¿El proveedor puede confirmar por escrito el criterio de “inexistencia concluyente”?

No mapear un 404 a `NOT_FOUND_CONCLUSIVE` sin una respuesta verificable a estas preguntas.

## 6. Estado “no enviado”

Si el PT expone un estado equivalente a `NO_ENVIADO`, `DIAN_NO_ENVIADO`, `PENDING`, etc.:

1. ¿significa que el request no salió nunca del PT hacia DIAN?
2. ¿o también puede representar una transacción cuyo resultado remoto todavía no se conoce?
3. ¿puede cambiar posteriormente sin un nuevo submit?
4. ¿qué evento/evidencia autoriza un reenvío?

No mapearlo a `TRANSPORT_PROVEN_NOT_SENT` por nombre solamente.

## 7. XML, PDF y evidencia

Solicitar:

- XML fiscal original;
- AttachedDocument si aplica;
- ApplicationResponse;
- PDF/representación gráfica;
- consulta de estado;
- timestamps relevantes;
- identificadores PT/DIAN;
- política de retención;
- posibilidad de descargar/reconstruir artefactos después de una respuesta perdida.

## 8. POS electrónico

Confirmar vía API:

- creación del Documento Equivalente Electrónico POS;
- CUDE;
- numeración;
- envío/validación DIAN;
- consulta posterior;
- XML/PDF;
- nota de ajuste/anulación;
- comportamiento de ambigüedad equivalente al de FEV.

Un PT no pasa F4C si solo resuelve bien FEV y deja POS fuera del flujo integrable requerido por V1.

## 9. Seguridad y certificado

Preguntar:

1. ¿Quién custodia el certificado digital?
2. ¿El POS/API propia necesita recibirlo o manejar su clave privada?
3. ¿Cómo se rota/revoca?
4. ¿Qué secretos debemos almacenar nosotros?
5. ¿Cómo se autentica API→PT?
6. ¿Existe allowlist de IP, mTLS u otros controles?
7. ¿Cómo se gestionan credenciales de sandbox vs producción?

Preferencia V1: minimizar custodia propia de certificado/clave privada.

## 10. Operación/SLA

Solicitar:

- disponibilidad/SLA contractual;
- ventanas de mantenimiento;
- timeout recomendado del cliente;
- límites de requests/rate limits;
- política de reintentos;
- backoff recomendado;
- canales de soporte;
- tiempos de respuesta para incidente crítico;
- escalamiento cuando un documento queda no concluyente;
- página de estado o mecanismo equivalente;
- retención de logs/evidencia para soporte.

## 11. Comercial

Solicitar números comparables:

- setup/onboarding;
- mensualidad mínima;
- costo por documento o paquetes;
- FEV;
- POS electrónico;
- notas/ajustes;
- XML/PDF;
- ambientes de prueba;
- soporte;
- mínimos de consumo;
- permanencia;
- costo de certificado si aplica;
- costo de excedentes;
- impuestos.

No puntuar “precio” hasta tener una unidad comparable COP/documento para nuestro volumen objetivo.

## 12. Permiso para fault injection / duplicate test

Preguntar explícitamente si el sandbox permite:

- cortar conexión del cliente después de enviar request;
- provocar timeout del lado cliente;
- consultar posteriormente el mismo documento;
- repetir exactamente el mismo payload/consecutivo;
- realizar un segundo intento deliberado para verificar protección de duplicidad;
- conservar respuestas/logs sanitizados como evidencia de evaluación.

Si una prueba destructiva no está permitida, pedir al proveedor un mecanismo seguro equivalente o evidencia contractual/técnica.

## 13. Evidencia a conservar por caso

Para cada prueba F4C:

```text
case_id
PT
ambiente
fecha/hora UTC
tipo documento
request sanitizado
referencia cliente
referencia PT
HTTP status si aplica
response sanitizado
estado normalizado
consultas posteriores
tiempo hasta estado concluyente
XML/PDF hash si aplica
captura/log sanitizado
fuente documental/contractual
conclusión PASS / FAIL / INCONCLUSIVE
```

La evidencia cruda con secretos no entra a Git.

## 14. Mensaje corto inicial — HKA

```text
Asunto: Integración casa de software — sandbox FEV + POS electrónico

Estamos construyendo un POS propio y una capa fiscal interna para comercios en Colombia. Buscamos integrar un único Proveedor Tecnológico en V1 y queremos evaluar The Factory HKA como primera opción.

Necesitamos acceso al ambiente DEMO, credenciales y documentación actual para FEV y Documento Equivalente Electrónico POS, incluyendo consultas de estado posteriores al submit. Nuestro gate principal es validar el comportamiento ante timeouts o respuestas perdidas y cómo se reconcilia un documento antes de cualquier reenvío.

¿Nos pueden indicar el proceso comercial/técnico para obtener el sandbox y un contacto de integración? Podemos enviar de inmediato nuestro cuestionario técnico de evaluación.
```

## 15. Mensaje corto inicial — DATAICO

```text
Asunto: Integración API — sandbox/pruebas FEV + POS electrónico

Estamos construyendo un POS propio y una capa fiscal interna para comercios en Colombia. Estamos evaluando un único Proveedor Tecnológico para V1 y DATAICO está en nuestra shortlist.

Ya revisamos la documentación pública de API y necesitamos confirmar el ambiente de prueba para FEV y POS electrónico, además del protocolo para reconciliar timeouts/estados pendientes antes de reenviar un documento.

¿Nos pueden indicar cómo obtener credenciales de prueba y contacto técnico para una evaluación de integración?
```

## 16. Mensaje corto inicial — Facture/ESTELA

```text
Asunto: Evaluación de integración técnica — Facture/ESTELA Colombia

Estamos construyendo un POS propio y una capa fiscal interna para comercios en Colombia y evaluamos a Facture/ESTELA como Proveedor Tecnológico para V1.

Necesitamos paquete técnico/API, sandbox, credenciales y documentación para FEV y Documento Equivalente Electrónico POS, en especial consulta/reconciliación de documentos cuyo resultado inicial sea ambiguo.

¿Nos pueden indicar el proceso para acceder al ambiente técnico y al equipo de integración?
```

## 17. Resultado esperado

El proveedor que pase no será el que tenga el happy path más corto, sino el que permita demostrar:

```text
side effect identificable
+ correlación durable
+ UNKNOWN explícito o representable
+ reconcile verificable
+ criterio de inexistencia seguro
+ FEV + POS
+ soporte operacional
+ contrato/costo sostenible
```
