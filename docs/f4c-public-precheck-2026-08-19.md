# F4C — Precheck público de candidatos PT

**Corte:** 2026-08-19  
**Estado:** PRECHECK solamente — **no satisface F4C**  
**Gate oficial:** `docs/f4-prueba-ambiguedad-pt-v1.md`

## Propósito

Reducir trabajo de sandbox usando únicamente evidencia pública actual para responder:

1. qué capacidades parecen existir públicamente;
2. qué candidatos justifican pedir sandbox/credenciales primero;
3. qué hechos críticos siguen sin demostrarse;
4. qué preguntas/evidencia deben obtenerse antes de permitir F5B/F6C.

Este documento **no** convierte documentación pública en evidencia de comportamiento runtime. Ningún candidato obtiene PASS sin ejecutar el protocolo F4C con credenciales/sandbox propios.

---

## Resumen ejecutivo

### The Factory HKA

**Señal pública favorable:** fuerte.

La documentación pública muestra:

- ambiente DEMO explícito para integración;
- servicio REST de emisión;
- API `ConsultarDocumento` separada de emisión y disponible en demo/producción;
- documentación de descarga XML/PDF para documentos previamente emitidos;
- cobertura pública de Factura Electrónica, Documentos Equivalentes y otros documentos electrónicos en su sección de integración.

**Lo que NO está demostrado públicamente:**

- semántica exacta después de perder la respuesta de una emisión;
- ventana de propagación antes de que `ConsultarDocumento` encuentre el documento;
- cuándo un “no encontrado” es concluyente y autoriza evaluar retry;
- comportamiento equivalente para cada tipo V1, especialmente DEE POS y nota de ajuste;
- defensa ante duplicado controlado;
- límites/backoff contractuales utilizables.

**Clasificación F4C actual:** `INCONCLUSIVE` hasta sandbox.

### DATAICO

**Señal pública favorable:** moderada/fuerte para integración general; todavía insuficiente para ambigüedad.

La documentación pública muestra:

- API REST para Factura Electrónica;
- creación de FE, NC y ND;
- endpoint GET de consulta de factura por consecutivo;
- soporte público de POS electrónico y nota de ajuste POS;
- operación explícita de reenvío de una factura existente por UUID cuando está en un estado no enviado;
- workspace oficial reciente de Postman para integración/pruebas.

**Lo que NO está demostrado públicamente:**

- que el GET de factura permita recuperar de forma segura una mutación cuyo response se perdió;
- ventana de propagación y semántica de “no encontrado”;
- consulta API equivalente publicada para POS/nota de ajuste con las claves que necesitamos;
- cómo distinguir “todavía procesando” de “nunca enviado”;
- garantías para duplicado deliberado;
- semántica contractual de timeout/5xx;
- si el estado usado por el endpoint de reenvío puede determinarse con seguridad tras un timeout ambiguo.

**Clasificación F4C actual:** `INCONCLUSIVE` hasta sandbox.

---

## Orden recomendado de ejecución

### 1. The Factory HKA primero

Motivo: la documentación pública expone de forma más directa una operación específica de consulta de documento separada de emisión y un ambiente DEMO claramente descrito. Eso reduce incertidumbre inicial para el caso central de F4C.

Esto **no significa selección final**.

### 2. DATAICO inmediatamente después si HKA falla o queda inconcluso

DATAICO mantiene APIs públicas activas, consulta de factura por GET y cobertura amplia de documentos; merece ejecutar el mismo protocolo completo antes de descartar o seleccionar.

### 3. Facture permanece como reserva

No avanzar a su adapter mientras alguno de los dos candidatos prioritarios no haya sido probado con el protocolo obligatorio.

---

## Evidencia pública localizada — The Factory HKA

### Integración / demo

Fuente pública:

- `https://felcowiki.thefactoryhka.com.co/index.php/Generalidades_-_Indice_Manual_Integraci%C3%B3n_Directa`

Observado:

- esquema REST para Factura Electrónica;
- URL de ambiente DEMO separada de producción;
- el ambiente demo no transmite las emisiones a DIAN.

### Consulta independiente

Fuente pública:

- `https://felcowiki.thefactoryhka.com.co/index.php/API_ConsultarDocumento`

Observado:

- existe API `ConsultarDocumento`;
- objetivo declarado: consultar estado/contenido de una transacción específica;
- disponible en DEMO y producción;
- es una operación distinta del método de emisión.

### Cobertura de integración

Fuente pública:

- `https://felcowiki.thefactoryhka.com.co/index.php/Secci%C3%B3n_para_clientes_de_Integraci%C3%B3n`

Observado:

- sección actual de integración incluye Factura Electrónica y Documentos Equivalentes, entre otros.

### Artefactos

Fuente pública:

- `https://felcowiki.thefactoryhka.com.co/index.php/Manual_DLL_hkafact21_-_Emisi%C3%B3n_V4`

Observado:

- métodos documentados de descarga XML y PDF para documentos previamente emitidos.

### Preguntas obligatorias para sandbox HKA

1. Después de un timeout del cliente ocurrido tras enviar el body, ¿con qué identificador preexistente se consulta el documento sin reemitir?
2. ¿`ConsultarDocumento` puede buscar por una clave conocida **antes** del POST o solo por IDs retornados después del POST?
3. ¿Cuál es la ventana máxima de propagación hasta que un documento procesado aparece en consulta?
4. ¿Qué response significa “nunca existió” y qué garantía contractual acompaña esa clasificación?
5. ¿Puede existir durante propagación el mismo response de “no encontrado” que para un documento inexistente?
6. Repetir respuesta para FEV, NC, ND, DEE POS y nota de ajuste DEE POS.
7. ¿Qué ocurre al reenviar exactamente el mismo documento/identificador después de una aceptación previa?
8. ¿Cómo se recuperan XML/PDF sin side effect de emisión?

---

## Evidencia pública localizada — DATAICO

### Modelo de integración

Fuente pública:

- `https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico`

Observado:

- documentación de FE, NC, ND y POS electrónico;
- referencias a Swagger/documentación técnica por producto.

### Crear FE

Fuente pública:

- `https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico-factura-electr%C3%B3nica`

Observado:

- creación de FE mediante POST;
- autenticación por cuenta/token.

### Consultar FE

Fuente pública:

- `https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico-factura-electr%C3%B3nica-1`

Observado:

- consulta mediante GET;
- búsqueda por consecutivo (`number`).

### Reenvío controlado de una factura existente

Fuente pública:

- `https://portaldelcliente.dataico.com/es/knowledge/reenviar-a-la-dian-una-factura-existente-de-la-cuenta-dataico-con-el-estado-dian_no_enviado`

Observado:

- existe acción PUT sobre una factura existente identificada por UUID;
- la documentación describe reenvío cuando la factura está en estado no enviado.

Esto **no prueba** que podamos clasificar de forma segura ese estado después de una respuesta ambigua.

### POS / nota de ajuste

Fuente pública:

- `https://portaldelcliente.dataico.com/es/knowledge/anulacio`

Observado:

- soporte de Documento Equivalente Electrónico POS;
- nota de ajuste de anulación vinculada al CUDE del POS original.

### Colección oficial reciente

Fuente pública:

- `https://www.postman.com/dataico-api/documentacion-api-dataico/overview`

Observado:

- colección oficial reciente para integrar/probar documentos electrónicos.

### Preguntas obligatorias para sandbox DATAICO

1. Tras timeout posterior al envío del body, ¿el GET por `number` devuelve la operación si DATAICO la creó pero nuestra respuesta se perdió?
2. ¿Existe ventana en la que un documento real responda “no encontrado” antes de hacerse visible?
3. ¿Qué response exacto distingue “nunca enviado” de “todavía procesando”?
4. ¿La identificación por consecutivo es suficiente dentro de una cuenta o requiere prefijo/UUID/otro campo para evitar colisiones?
5. ¿Cómo se consulta NC, ND, POS y nota de ajuste POS por API después de perder el response de creación?
6. ¿El UUID puede conocerse antes del POST? Si no, ¿qué clave preexistente permite reconciliar un response perdido?
7. ¿Cómo se determina con evidencia que una factura está realmente en estado apto para el PUT de reenvío después de un fallo ambiguo?
8. ¿Qué ocurre ante duplicado deliberado del mismo número/documento?
9. ¿Cómo se descargan XML/PDF sin activar reenvío ni mutación fiscal?

---

## Matriz de precheck

| Capacidad | HKA público | DATAICO público | F4C requerido |
|---|---|---|---|
| Sandbox/demo documentado | Sí | Evidencia pública de integración/pruebas, confirmar cuenta sandbox | Sí, credenciales propias |
| Emisión FE | Sí | Sí | Ejecutar |
| Consulta FE separada | Sí (`ConsultarDocumento`) | Sí (GET por número) | Probar después de timeout |
| NC/ND | Sí | Sí | Ejecutar casos |
| POS electrónico | Cobertura pública de documentos equivalentes | Sí | Ejecutar caso separado |
| Nota ajuste POS | Confirmar detalle de API | Sí, pública | Ejecutar caso separado |
| XML/PDF sin reemitir | Documentado para documentos emitidos | Confirmar API/flujo exacto | Probar |
| `NOT_FOUND_CONCLUSIVE` | No demostrado | No demostrado | **Bloqueante** |
| Ventana propagación | No demostrada | No demostrada | **Bloqueante** |
| Timeout ambiguo recuperable | No demostrado | No demostrado | **Bloqueante** |
| Duplicado determinista | No demostrado | No demostrado | Probar |
| Multiempresa aislamiento | No demostrado públicamente para nuestro caso | No demostrado públicamente para nuestro caso | Probar |

---

## Criterio de decisión

No seleccionar candidato por marketing, cantidad de endpoints o facilidad del happy path.

El criterio principal continúa siendo:

```text
Después de perder la respuesta de una mutación,
¿podemos determinar sin reemitir si el documento existe,
cuál fue su resultado y cuándo es seguro considerar retry?
```

Hasta responder experimentalmente esa pregunta para los tipos V1, ambos candidatos permanecen `INCONCLUSIVE`.

## Próxima acción humana necesaria

Solicitar a HKA y DATAICO:

- sandbox oficial;
- credenciales de prueba;
- NIT/tenant demo;
- numeraciones de prueba para FEV/NC/ND/POS/nota de ajuste;
- versión actual de API/docs;
- confirmación de endpoints de consulta/reconciliación por tipo;
- autorización para fault injection razonable en sandbox;
- respuesta escrita sobre semántica y ventana de “no encontrado”.

Al recibirlo, ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` y guardar evidencia sanitizada para alimentar `docs/f6-provider-contract-harness.md`.
