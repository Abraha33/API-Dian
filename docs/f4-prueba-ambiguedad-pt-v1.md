# F4 — Protocolo de prueba de ambigüedad del PT

**Estado:** Gate obligatorio de selección  
**Aplicar a:** candidato A y, si falla/no conviene, candidato B.

## Objetivo

Demostrar experimentalmente que después de un resultado de mutación ambiguo podemos responder:

```text
¿el documento existe y cuál fue su resultado?
```

sin reemitir a ciegas.

## Prerrequisitos

- sandbox oficial del PT;
- credenciales propias de prueba;
- un tenant/NIT de prueba autorizado;
- numeración/rangos configurados;
- documentación técnica vigente;
- capacidad de inspeccionar request/response y timestamps;
- permiso del PT para pruebas de fault injection razonables.

## Matriz por tipo documental

Repetir al menos para:

- FEV;
- Nota Crédito;
- Nota Débito;
- DEE POS;
- Nota de ajuste DEE POS.

No asumir que la semántica de FE aplica automáticamente a POS.

## Caso A — Happy path y claves

1. generar documento único;
2. registrar todos los identificadores conocidos **antes** del POST;
3. emitir;
4. registrar response completa;
5. consultar estado mediante API independiente;
6. recuperar XML y PDF;
7. identificar CUFE/CUDE/track/provider ID;
8. verificar qué claves permiten encontrarlo después.

PASS si la consulta independiente recupera inequívocamente el mismo documento.

## Caso B — Timeout del cliente después del envío

Objetivo: simular que nuestro worker no recibe la respuesta aunque el PT pueda haber procesado.

Métodos aceptables según sandbox/infra:

- cortar la lectura/respuesta después de enviar body;
- proxy de fault injection;
- timeout cliente extremadamente corto acordado;
- endpoint/mecanismo de sandbox del proveedor si existe.

No hacer ataques ni degradación contra producción.

Después del timeout:

1. marcar localmente `UNKNOWN`;
2. **no reenviar**;
3. consultar con identificadores previamente registrados;
4. aplicar backoff según comportamiento documentado;
5. observar cuánto tarda en aparecer un resultado;
6. recuperar evidencia cuando aparezca.

PASS fuerte:

- documento se encuentra inequívocamente;
- resultado coincide;
- consulta no produce side effect;
- latencia de convergencia puede acotarse operativamente.

## Caso C — “No encontrado”

Generar una referencia/número que nunca se haya enviado y consultar.

Documentar:

- HTTP status;
- código de negocio;
- body;
- latencia;
- si distingue “no existe” de “todavía procesando”;
- qué garantía contractual tiene.

**No declarar `NOT_FOUND_CONCLUSIVE` solo porque devuelva 404.**

Necesitamos saber si existe una ventana de propagación durante la cual un documento real también puede responder no encontrado.

## Caso D — Duplicado deliberado controlado

Solo en sandbox y con autorización.

1. emitir documento válido;
2. esperar resultado definitivo;
3. enviar exactamente el mismo identificador/documento otra vez;
4. observar respuesta;
5. consultar el original.

PASS deseable:

- PT rechaza/deduplica de forma determinista;
- no crea una segunda identidad fiscal.

El resultado no sustituye nuestra idempotencia local, pero cuantifica defensa adicional.

## Caso E — Respuesta tardía

Provocar timeout local y permitir que la respuesta original llegue tarde/sea descartada.

La reconciliación posterior debe producir el mismo estado final que el happy path.

## Caso F — Artefactos desacoplados

Tras aceptación:

1. forzar/recrear fallo temporal al descargar XML/PDF;
2. reintentar solo artefacto;
3. confirmar que no hay reemisión.

## Caso G — Multiempresa

Con dos cuentas/NIT de sandbox:

- credenciales/referencias de A no deben consultar documentos de B;
- mismo número/prefijo en A y B no debe causar colisión de consulta;
- identificar exactamente qué fields hacen única la consulta.

## Evidencia a guardar

Por caso:

- proveedor/version API;
- ambiente;
- fecha UTC;
- request sanitizado;
- response cruda sanitizada;
- IDs previos al POST;
- IDs posteriores;
- timeline en milisegundos;
- consultas ejecutadas;
- resultado observado;
- documentación/confirmación del proveedor;
- conclusión `PASS / FAIL / INCONCLUSIVE`.

No guardar secretos en el repositorio.

## Gate final de ambigüedad

### PASS

Se puede recuperar estado por una consulta no mutante después de perder la respuesta del POST, y existe una regla defendible para distinguir:

```text
existe/procesado
vs
no existe y es seguro evaluar retry
vs
no se sabe todavía
```

### FAIL

- exige reenviar para descubrir qué ocurrió;
- no hay búsqueda suficientemente determinista;
- “not found” es ambiguo sin ventana/garantía utilizable;
- el soporte no puede explicar el comportamiento;
- POS/notas carecen de capacidades de consulta necesarias aunque FE sí las tenga.

### INCONCLUSIVE

La documentación o sandbox no permite demostrarlo. Para nuestro riesgo, `INCONCLUSIVE` bloquea selección igual que FAIL hasta obtener evidencia mejor.

## Regla operativa

La prueba debe automatizarse luego como contract/integration test reproducible. No depender de memoria de una sesión manual.
