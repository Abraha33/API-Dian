# ADR-004: Protocolo de side effect fiscal, idempotencia y reconciliación

- **Estado:** Aprobado
- **Fecha:** 2026-08-18
- **Depende de:** ADR-003
- **Requisitos principales:** INV-001..005, RF-005..011, RF-017..020, RC-001..006

## Contexto

La base de datos local y el PT no comparten una transacción distribuida. Por tanto, es imposible garantizar atomicidad entre:

1. persistir el estado local; y
2. ejecutar una mutación remota que puede crear un documento fiscal.

El diseño debe asumir crashes, timeouts, resets de conexión y respuestas tardías exactamente en esa frontera.

La propiedad buscada no es “exactly once” distribuido. Es:

```text
idempotencia lógica persistida
+ un solo camino de mutación
+ evidencia por intento
+ resultado ambiguo explícito
+ reconciliación antes de repetir
```

## Entidades conceptuales

### Operación fiscal lógica

Representa la intención del POS: emitir/ajustar un documento V1. Tiene identidad estable durante todos los retries y reconciliaciones.

### Intento de proveedor

Representa una única tentativa controlada de ejecutar una mutación contra el PT. Una operación lógica puede tener más de un intento solo cuando un intento anterior fue resuelto de forma concluyente como seguro para repetir.

### Trabajo durable

Representa procesamiento pendiente/reprogramado. Su estado operativo no sustituye el estado fiscal de la operación.

## Regla 1 — Ingreso atómico local

Ante un comando mutante del POS, una única transacción local debe:

1. resolver y validar tenant/actor;
2. validar estructura suficiente para aceptar el comando;
3. canonicalizar el payload semántico;
4. calcular un fingerprint/hash semántico;
5. resolver la clave de idempotencia;
6. crear o recuperar la operación fiscal lógica;
7. insertar el trabajo durable si la operación es nueva;
8. registrar la evidencia/auditoría mínima;
9. commit.

No existe llamada mutante al PT antes de este commit.

Semántica obligatoria:

```text
mismo tenant + operación + key + mismo fingerprint
→ misma operación lógica

mismo tenant + operación + key + fingerprint distinto
→ conflicto; no mutación remota
```

## Regla 2 — El worker es el único emisor

Solo el rol `worker` puede invocar métodos mutantes de `FiscalProvider`.

Controllers, endpoints de retry, health checks, tareas manuales o procesos de recuperación **no** pueden llamar al método de emisión por rutas alternativas.

Una acción humana de “reprocesar” solo puede crear trabajo durable sujeto a las mismas reglas; nunca invoca directamente el PT.

## Regla 3 — Claim de trabajo ≠ permiso infinito

El worker reclama trabajo mediante lock/lease persistido.

Debe existir como máximo un intento mutante activo por operación lógica.

Si un worker muere, el lease puede expirar; esto autoriza a otro worker a **inspeccionar/recuperar** la operación, no a asumir que la mutación anterior no ocurrió.

## Regla 4 — Persistir el intento antes de enviar

Antes de poner en riesgo un side effect remoto, el worker ejecuta una transacción corta que:

1. crea `provider_attempt` con ID interno único;
2. genera/conserva correlation/idempotency/provider reference que pueda conocerse antes de la llamada;
3. registra versión del adapter/mapping;
4. marca la operación semánticamente como `SUBMITTING` o equivalente;
5. registra timestamp de inicio;
6. commit.

Solo después se realiza la llamada mutante.

No se mantiene una transacción SQL abierta durante la llamada HTTP al PT.

## Regla 5 — Sin retry HTTP genérico para mutaciones

El cliente HTTP/adaptador no puede aplicar retries automáticos transparentes a endpoints mutantes del PT.

Los retries de lectura/consulta pueden usar una política técnica normal.

Toda repetición de una mutación fiscal debe ser una decisión del dominio basada en estado persistido y semántica demostrada del PT.

## Regla 6 — Resultado definitivo

Si el PT devuelve una respuesta cuyo significado es concluyente según su contrato:

1. conservar primero la evidencia/respuesta cruda relevante;
2. asociar IDs remotos y correlaciones;
3. normalizar a estado interno;
4. realizar la transición permitida;
5. cerrar el intento;
6. registrar auditoría;
7. crear trabajos independientes para XML/PDF si aplica.

Un fallo posterior recuperando XML/PDF no cambia el hecho fiscal ni habilita una nueva emisión.

## Regla 7 — Resultado ambiguo por defecto conservador

Cualquier caso donde no pueda demostrarse si el PT recibió/materializó la mutación se clasifica `UNKNOWN`.

Ejemplos típicos:

- timeout después de enviar la solicitud;
- connection reset en una fase no demostrablemente previa al envío;
- crash del worker después de iniciar la llamada y antes de persistir el resultado;
- respuesta ilegible/incompleta sin semántica concluyente;
- respuesta tardía cuando el estado local ya no puede afirmar el resultado.

No todo error técnico es `UNKNOWN`. Un fallo puede reintentarse directamente solo si el adapter puede demostrar, con semántica del transporte/PT, que el side effect **no pudo ocurrir**. Ante duda, `UNKNOWN`.

## Regla 8 — Recuperación tras crash

Al arrancar o periódicamente, el worker busca intentos `SUBMITTING` cuyo lease/ventana haya expirado.

No los reemite.

Los mueve a flujo de resultado ambiguo y crea trabajo de reconciliación.

Así un crash en el peor momento cambia el problema de “¿reemitimos?” a “¿qué ocurrió?”, que es la única pregunta segura.

## Regla 9 — Reconciliación es de solo lectura respecto al hecho fiscal

La reconciliación consulta al PT mediante operaciones no mutantes y usa, en orden de preferencia, identificadores deterministas/correlaciones disponibles:

- ID del intento/correlation key enviado al PT;
- identificador remoto ya conocido;
- identificadores fiscales/documentales que el PT permita consultar de forma inequívoca;
- otros criterios contractualmente seguros.

Resultados posibles:

### A. Existe y es aceptado/rechazado

Persistir evidencia y resolver al estado definitivo correspondiente.

### B. El PT demuestra de forma concluyente que la mutación no creó documento

Solo entonces puede evaluarse un nuevo intento mutante, y únicamente si la semántica/contrato del PT lo permite. Se crea **otro `provider_attempt`**, nunca se borra ni recicla el anterior.

### C. Sigue sin poder determinarse

Mantener `UNKNOWN`/`RECONCILING`, aplicar backoff acotado y finalmente escalar a `NEEDS_ATTENTION` o equivalente. No reemitir para “salir de la duda”.

## Regla 10 — El PT debe hacer posible reconciliar

La selección del PT queda bloqueada si su API/contrato no permite correlacionar y consultar suficientemente una mutación cuyo resultado inmediato fue ambiguo.

“Volver a enviar y ver qué pasa” no es una estrategia aceptable para V1.

Si el PT ofrece una idempotency key propia robusta, se aprovechará como defensa adicional, pero no sustituye la idempotencia local ni se asume antes de seleccionarlo.

## Estados semánticos mínimos

F3 puede ajustar nombres físicos, pero no colapsar estas situaciones:

```text
PERSISTED
READY
SUBMITTING
ACCEPTED
REJECTED_LOCAL
REJECTED_REMOTE
UNKNOWN
RECONCILING
NEEDS_ATTENTION
```

Los estados del scheduler/worker (`PENDING`, `CLAIMED`, `RETRY_AT`, etc.) son otra dimensión y no deben mezclarse con la semántica fiscal.

## Transiciones críticas permitidas

```text
PERSISTED → REJECTED_LOCAL
PERSISTED → READY
READY → SUBMITTING
SUBMITTING → ACCEPTED
SUBMITTING → REJECTED_REMOTE
SUBMITTING → UNKNOWN
UNKNOWN → RECONCILING
RECONCILING → ACCEPTED
RECONCILING → REJECTED_REMOTE
RECONCILING → READY          # solo prueba concluyente de no side effect
RECONCILING → NEEDS_ATTENTION
```

No existe transición automática:

```text
UNKNOWN → SUBMITTING
```

## Concurrencia

F3 debe imponer mediante constraints/transacciones, no solo `if` en TypeScript:

- unicidad de idempotencia por tenant/operación;
- como máximo un intento mutante activo por operación;
- transición de estado con control de concurrencia;
- claim durable de trabajo;
- tenant no nulo en toda entidad fiscal.

## Artefactos y consultas

Recuperar estado, XML o PDF son operaciones separadas de la mutación fiscal principal.

Pueden reintentarse sin convertir un problema de entrega de artefactos en una segunda emisión.

## Observabilidad obligatoria del protocolo

Métricas mínimas:

- operaciones por estado;
- edad máxima y cantidad de `UNKNOWN`;
- intentos de proveedor por operación;
- reconciliaciones por causa;
- tiempo hasta resolución de `UNKNOWN`;
- jobs expirados/reclamados;
- conflictos de idempotencia.

Alertar por condiciones que requieren acción, especialmente crecimiento o envejecimiento del backlog ambiguo.

## Escenarios de prueba obligatorios

Antes del piloto deben probarse al menos:

1. retry concurrente del mismo comando;
2. misma key con payload distinto;
3. crash después de persistir operación y antes de claim;
4. crash después de crear intento y antes de llamada;
5. timeout después de posible recepción por PT;
6. crash después de que el PT procese pero antes de persistir respuesta;
7. respuesta tardía;
8. reconciliación que encuentra documento aceptado;
9. reconciliación que encuentra rechazo;
10. reconciliación concluyente de no existencia seguida de retry controlado;
11. reconciliación inconclusa que termina en atención manual;
12. dos workers compitiendo por la misma operación;
13. fallo de XML/PDF sin cambio de estado fiscal;
14. reinicio completo de API/worker con backlog pendiente.

## Consecuencia principal

La arquitectura acepta que puede existir temporalmente incertidumbre. Lo que **no** acepta es convertir esa incertidumbre en un duplicado fiscal.

```text
UNKNOWN es un estado operativo costoso pero seguro.
Una reemisión ciega puede ser irreversible.
```
