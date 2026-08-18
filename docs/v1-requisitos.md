# Requisitos V1 — API-DIAN

**Fecha de corte:** 2026-08-18  
**Estado:** Cerrado para arquitectura  
**Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

> “Cerrado para arquitectura” significa que el alcance funcional y los invariantes de V1 están suficientemente definidos para diseñar la arquitectura. No autoriza producción: existen gates regulatorios, contractuales, de seguridad y recuperación que deben cerrarse antes del piloto.

## 1. Propósito y frontera

V1 es una API fiscal interna para comercio colombiano cuyo primer consumidor es el POS propio.

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

La API propia controla el contrato interno, autenticación, tenant, validación previa, idempotencia, estado, evidencia, reconciliación y observabilidad. El PT ejecuta las funciones fiscales reguladas contratadas.

V1 no intenta reemplazar al PT ni convertirse en un proxy ciego.

## 2. Actores V1

- **POS propio:** consumidor técnico primario.
- **Empresa/tenant:** sujeto lógico que origina y consulta operaciones fiscales.
- **API fiscal propia:** autoridad del estado interno y evidencia de integración.
- **Proveedor Tecnológico:** único proveedor fiscal externo de V1.
- **Operador:** inicialmente una sola persona; por ello el sistema debe minimizar intervención manual y ambigüedad operativa.

No existe “integrador público externo” como actor V1.

## 3. Alcance fiscal V1

La API debe soportar únicamente:

1. Factura Electrónica de Venta (FEV).
2. Nota Crédito.
3. Nota Débito.
4. Documento Equivalente Electrónico POS.
5. Nota de ajuste del DEE POS.
6. contingencias necesarias de FEV;
7. contingencias necesarias de DEE POS;
8. consulta/seguimiento de estado;
9. recuperación del XML validado;
10. recuperación de la representación gráfica/PDF entregada por el PT.

## 4. Invariantes de seguridad fiscal

Estas reglas tienen prioridad sobre conveniencia de implementación:

### INV-001 — No reemisión ciega

```text
DESCONOCIDO != REEMITIR
```

Si el resultado remoto es ambiguo, el sistema debe reconciliar antes de intentar cualquier acción que pueda crear un segundo documento fiscal.

### INV-002 — Idempotencia lógica

La API debe impedir que reintentos del POS creen múltiples operaciones fiscales lógicas para el mismo comando.

No se afirmará “exactly once” distribuido. La garantía V1 será idempotencia persistida + reconciliación.

### INV-003 — Persistir antes del side effect

El sistema debe persistir de forma durable el comando fiscal, su tenant, su clave de idempotencia y la intención de procesamiento **antes** de realizar el side effect remoto que pueda causar emisión en el PT.

### INV-004 — Aislamiento por empresa

Ninguna consulta, mutación, artefacto, log útil para soporte o evidencia puede cruzar tenants por error. La arquitectura debe aplicar defensa en profundidad, no depender solo de filtros voluntarios en código.

### INV-005 — Evidencia antes que interpretación

Las respuestas crudas relevantes del PT y sus identificadores/correlaciones deben conservarse de forma que una interpretación posterior no destruya la evidencia original.

### INV-006 — Un solo PT, sin falsa generalidad

`FiscalProvider` debe contener solo las operaciones que V1 realmente necesita. No se construye motor multi-PT, failover ni abstracción universal.

### INV-007 — Sin custodia propia de certificado en V1

Mientras el modelo contractual del PT lo permita de forma segura, la API no almacenará claves privadas/certificados de clientes para firma fiscal.

## 5. Requisitos funcionales

### RF-001 — Contexto de comando

Toda operación fiscal debe incluir o resolver de forma inequívoca:

- tenant/empresa;
- identidad autenticada del consumidor;
- identificador de solicitud/correlación;
- clave de idempotencia para mutaciones;
- tipo de documento/operación;
- versión del contrato de entrada.

### RF-002 — Autenticación y autorización

El POS debe autenticarse ante la API. La autorización debe limitar operaciones al tenant permitido. El mecanismo concreto se decide en arquitectura/seguridad; el requisito es la propiedad, no API Keys públicas.

### RF-003 — Contrato fiscal interno uniforme

Debe existir un contrato interno versionado que permita al POS expresar los documentos V1 sin exponer directamente el contrato propietario del PT.

### RF-004 — Validación previa

Antes de invocar al PT, la API debe validar:

- estructura;
- tipos y formatos;
- campos obligatorios conocidos;
- consistencia aritmética básica;
- referencias requeridas entre documentos cuando aplique;
- reglas V1 que puedan validarse localmente con evidencia confiable.

La API no debe duplicar innecesariamente validaciones que solo el PT/DIAN puede determinar.

### RF-005 — Idempotencia persistida

La semántica mínima debe ser:

- misma empresa + misma operación + misma clave + mismo payload semántico → misma operación lógica/resultado conocido;
- misma clave reutilizada con payload semánticamente distinto → conflicto rechazado y auditado;
- la clave no puede depender de memoria local del proceso.

### RF-006 — Ciclo de vida explícito

La máquina de estados debe distinguir semánticamente, como mínimo:

- recibido/persistido;
- validación local rechazada;
- pendiente de interacción con PT;
- resultado aceptado por PT/DIAN según el contrato del PT;
- resultado rechazado;
- resultado remoto desconocido/ambiguo;
- reconciliación en curso;
- fallo técnico recuperable/no recuperable cuando sea útil para operación.

Los nombres exactos se definen en arquitectura/modelo de datos.

### RF-007 — Puerto `FiscalProvider`

La lógica de dominio debe consumir un puerto interno mínimo para el PT. Debe existir un único adaptador concreto en V1.

### RF-008 — Correlación con el PT

Cada intento remoto debe conservar los identificadores necesarios para consultar/reconciliar después sin depender exclusivamente de la respuesta inmediata.

### RF-009 — Manejo de timeout ambiguo

Si una llamada al PT termina sin certeza de recepción/procesamiento, el documento debe pasar a estado de resultado desconocido y programarse para reconciliación. No se permite convertir el timeout automáticamente en “no emitido”.

### RF-010 — Reconciliación automática básica

La API debe poder consultar al PT y resolver estados ambiguos con política acotada de reintentos/backoff. Si no puede resolverlos, debe producir una alerta accionable y conservar el caso para intervención.

### RF-011 — Reintentos seguros

Solo se reintentan automáticamente operaciones que sean seguras según la semántica del PT y el estado persistido. Recuperar estado/artefactos puede reintentarse independientemente de reemitir un documento.

### RF-012 — Consulta de estado

El POS debe poder consultar el estado interno estable de una operación sin interpretar directamente estados propietarios del PT.

### RF-013 — Recuperación de XML

Para documentos V1 completados cuando el PT lo suministre, la API debe poder recuperar/entregar el XML validado y conservar metadatos suficientes para verificar su procedencia/integridad.

### RF-014 — Recuperación de PDF/representación gráfica

La API debe recuperar/entregar la representación gráfica suministrada por el PT. V1 no genera PDF propio.

### RF-015 — Notas y documentos relacionados

Nota Crédito, Nota Débito y nota de ajuste DEE POS deben conservar referencia inequívoca al documento que ajustan y validar la relación mínima antes del envío.

### RF-016 — Contingencias diferenciadas

La API debe modelar las contingencias V1 por su causa y flujo real. “PT caído”, “DIAN no disponible”, “conectividad local” u otros casos no pueden colapsarse en un único booleano si sus consecuencias fiscales son distintas.

### RF-017 — Respuesta cruda del PT

Debe conservarse la respuesta cruda relevante del PT, incluyendo errores y metadatos de correlación, separada del modelo normalizado que consume el POS.

### RF-018 — Auditoría

Las mutaciones y transiciones fiscales relevantes deben producir evidencia auditable con actor técnico, tenant, fecha/hora, operación, correlación y cambio de estado. Los registros que funcionen como evidencia no deben ser editables de forma ordinaria.

### RF-019 — Errores estables hacia el POS

El contrato interno debe exponer categorías de error estables, al menos para:

- autenticación/autorización;
- validación;
- conflicto de idempotencia;
- rechazo fiscal/proveedor;
- indisponibilidad temporal;
- resultado desconocido;
- error interno.

No debe obligar al POS a parsear textos del PT.

### RF-020 — Versionado de contrato y mapeos

Los contratos internos y el mapeo hacia el PT deben poder versionarse sin reescribir registros históricos ni cambiar retrospectivamente la interpretación de evidencia ya almacenada.

## 6. Requisitos de datos e integridad

### RD-001

Todo registro fiscal transaccional debe estar asociado a un tenant no nulo.

### RD-002

Importes, impuestos, cantidades y redondeos no usarán `float` binario para valores fiscales. El tipo exacto se define en el modelo de datos.

### RD-003

Se debe conservar la fecha/hora legal/original recibida o generada para el documento y una representación temporal normalizada suficiente para auditoría.

### RD-004

Los artefactos fiscales almacenados deben poder asociarse inequívocamente al documento/operación y disponer de metadatos de integridad (por ejemplo checksum) si se almacenan fuera de la base transaccional.

### RD-005

La retención exacta de documentos/evidencia debe fijarse antes de producción con base en obligación legal vigente, contrato del PT y política de datos. No se inventa una duración en arquitectura sin esa verificación.

### RD-006

Las migraciones que afecten evidencia fiscal deben ser compatibles con recuperación y no depender de editar manualmente datos productivos para “arreglar” estados.

## 7. Seguridad

### RS-001 — Secretos

Credenciales del PT, secretos de autenticación y claves operativas no deben almacenarse en el repositorio ni aparecer en logs.

### RS-002 — Cifrado

Tráfico externo y acceso a servicios administrados deben usar cifrado en tránsito. Datos/artefactos persistidos deben aprovechar cifrado administrado en reposo cuando el proveedor lo ofrezca.

### RS-003 — Mínimo privilegio

Credenciales de app, CI, storage y PT deben tener el menor privilegio práctico y rotación documentada.

### RS-004 — Defensa multi-tenant

El aislamiento debe existir en más de una capa cuando sea razonable: contexto autenticado, política de acceso/repositorio y controles de base de datos o equivalente.

### RS-005 — Logs seguros

Logs y alertas deben minimizar PII y no registrar secretos, certificados, payloads fiscales completos por defecto ni credenciales del PT.

### RS-006 — Custodia de certificados

La aparición de un requisito que obligue a custodiar claves privadas de clientes reabre explícitamente la evaluación de riesgo y no puede entrar como “detalle de implementación”.

## 8. Confiabilidad y operación

### RC-001 — Fuente transaccional única

Debe existir una única fuente autoritativa para el estado interno de cada operación fiscal. Redis, colas o caches no pueden convertirse en la única fuente de verdad.

### RC-002 — Recuperación tras reinicio

Un reinicio del proceso/worker no debe perder operaciones ya persistidas ni provocar reemisión ciega.

### RC-003 — Backups y PITR

La base de datos productiva debe usar backup administrado y/o PITR apropiado. Antes del piloto debe ejecutarse una restauración real y documentar el resultado.

### RC-004 — Fallo del PT

Una caída prolongada del PT debe degradar el sistema de forma explícita, conservar intents/estados y permitir reconciliación posterior. No se oculta como éxito ni se transforma automáticamente en duplicados.

### RC-005 — Observabilidad

Como mínimo deben existir:

- logs estructurados;
- correlation/request id;
- métricas de volumen, éxito/rechazo, error técnico y estados desconocidos;
- métrica/alerta de backlog de reconciliación;
- health/readiness;
- pocas alertas accionables.

### RC-006 — Operación unipersonal

La operación normal no debe requerir intervención humana cotidiana para reintentos, conciliación rutinaria, limpieza de colas o recuperación de estados.

### RC-007 — Sin SLA público V1

V1 no publicará un SLA comercial externo. Antes del piloto se definirán SLO internos medidos a partir del sandbox/PT elegido, separando latencia propia de latencia del PT.

### RC-008 — Runbooks mínimos

Antes de producción deben existir runbooks breves para:

- PT caído;
- aumento de `UNKNOWN`/reconciliaciones;
- credencial comprometida;
- restauración de datos;
- despliegue fallido;
- incidente de aislamiento entre tenants.

## 9. Escenarios de aceptación críticos

La implementación V1 no se considera lista si no demuestra, al menos:

1. mismo comando repetido con la misma idempotency key y mismo payload no crea una segunda operación;
2. misma key con payload diferente es rechazada y auditada;
3. timeout después de posible recepción del PT entra a `UNKNOWN` y reconcilia sin reemisión automática;
4. reinicio entre persistencia y procesamiento remoto recupera el trabajo sin duplicarlo;
5. respuesta duplicada/tardía del PT no corrompe el estado;
6. consulta de un tenant hacia documento de otro tenant es bloqueada;
7. Nota Crédito/Débito sin referencia válida es rechazada antes del PT cuando corresponda;
8. fallo al recuperar PDF/XML no provoca reemisión fiscal;
9. caída prolongada del PT produce degradación visible y backlog reconciliable;
10. restauración desde backup/PITR recupera un conjunto de operaciones y evidencia verificable;
11. rotación/revocación de una credencial no exige editar registros fiscales históricos;
12. logs de error no exponen secretos ni payload fiscal completo por defecto.

## 10. Fuera de V1

Quedan explícitamente fuera:

- API pública para terceros;
- SDK público;
- webhooks públicos;
- Documento Soporte;
- recepción/eventos;
- nómina electrónica;
- RADIAN completo;
- salud/RIPS;
- transporte/RNDC;
- otros DEE sectoriales;
- segundo PT;
- failover multi-PT;
- integración directa con DIAN;
- custodia propia de certificados;
- generación propia de PDF;
- ERP;
- contabilidad;
- CRM;
- personalizaciones/forks por cliente.

## 11. Decisiones deliberadamente diferidas a arquitectura/selección de PT

No son huecos de producto; son decisiones que sería irresponsable congelar antes de su fase:

- proveedor tecnológico concreto;
- mecanismo exacto de auth POS→API;
- nombres/columnas exactos de la máquina de estados;
- ORM y detalle de RLS;
- necesidad real de Redis/BullMQ frente a async transaccional más simple;
- storage concreto de XML/PDF;
- topología de despliegue;
- SLO internos numéricos;
- duración exacta de retención;
- política exacta de reintento según semántica del PT;
- formato final del contrato `FiscalProvider`.

## 12. Gates obligatorios antes de producción

### G-PROD-01 — PT

Debe existir PT seleccionado y evidencia de:

- habilitación vigente;
- sandbox/API suficiente;
- modalidad contractual compatible;
- soporte multiempresa/NIT cuando aplique;
- firma/certificados compatibles con la decisión V1;
- consulta/reconciliación de estados;
- contingencias necesarias;
- SLA/soporte/límites/rate limits;
- precio y escalamiento;
- tratamiento/custodia de datos.

### G-PROD-02 — Regulación

Debe existir matriz de requisitos fiscales V1 contrastada contra fuentes oficiales vigentes y documentación contractual/técnica del PT. Recomendaciones de ingeniería deben estar separadas de obligaciones regulatorias.

### G-PROD-03 — Seguridad

Threat model cerrado, secretos fuera del código, privilegios mínimos, aislamiento tenant probado y procedimiento de rotación/revocación documentado.

### G-PROD-04 — Recuperación

Backup/PITR configurado y restauración real probada.

### G-PROD-05 — Ambigüedad y contingencia

Pruebas de timeout ambiguo, reconciliación y contingencias V1 pasan en sandbox/entorno de prueba.

### G-PROD-06 — Observabilidad

Alertas de alto valor configuradas y runbooks ejecutables por una sola persona.

### G-PROD-07 — Piloto controlado

La primera activación productiva debe limitar empresas/volumen y permitir detener nuevas emisiones desde el POS/API sin destruir evidencia ya persistida.

## 13. Definition of Ready para F2

F1 se considera cerrada porque:

- alcance fiscal V1 está explícito;
- out-of-scope está explícito;
- actor principal y frontera con PT están definidos;
- invariantes contra duplicación/ambigüedad están definidos;
- requisitos de tenant, idempotencia, evidencia, reconciliación, observabilidad y recuperación están definidos;
- decisiones tecnológicas prematuras están separadas de requisitos;
- gates regulatorios/productivos están identificados.

**Siguiente paso:** F2 — arquitectura formal y ADR trazados requisito por requisito.