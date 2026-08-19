# F6 Checkpoint 02 — Fake vertical slice cerrado

**Corte:** 2026-08-19  
**Fase:** F6B  
**Estado:** ✅ Cerrado  
**Adapter PT real:** no implementado

## Objetivo demostrado

Probar de extremo a extremo, sin depender de ningún Proveedor Tecnológico real, que la arquitectura puede recibir una operación fiscal, identificar el tenant, persistirla de forma idempotente, entregarla a un worker aislado, registrar el intento remoto antes del side effect y resolver resultados concluyentes o ambiguos sin reemisión ciega.

```text
credential POS
→ API login app_api
→ tenant + RLS
→ POST /v1/fiscal-operations
→ operation + audit + work (misma tx)
→ worker login app_worker
→ durable claim/lease
→ provider_attempt persistido
→ FakeFiscalProvider
→ ACCEPT / REJECT / PROVEN_NOT_SENT / AMBIGUOUS
→ UNKNOWN
→ RECONCILING
→ resultado concluyente o NEEDS_ATTENTION
```

## Implementación cerrada

### API / acceso a datos

- `pg` (`node-postgres`) como cliente PostgreSQL explícito.
- Prisma eliminado del camino fiscal y del scaffold activo.
- queries parametrizadas;
- transacciones explícitas;
- contexto tenant local por transacción;
- PostgreSQL/RLS sigue siendo la autoridad de aislamiento.

### Autenticación

- credencial opaca con identificador + secreto aleatorio;
- digest HMAC-SHA256 con pepper fuera de DB;
- comparación constant-time;
- tenant derivado de la credencial, nunca de un header confiado del cliente;
- lookup de credencial expuesto mediante función DB limitada, no mediante SELECT abierto de la tabla de credenciales.

### Intake idempotente

`POST /v1/fiscal-operations`:

- valida contrato interno;
- canonicaliza el comando;
- calcula hash semántico versionado;
- usa `Idempotency-Key` persistida;
- mismo key + mismo significado → replay de la operación existente;
- mismo key + significado diferente → `409 IDEMPOTENCY_CONFLICT`;
- persiste operación, audit event y work item dentro de la misma transacción;
- respeta `accept_new_operations`.

### Worker aislado

Existe un composition root de worker distinto al proceso HTTP.

- DB login worker separado del login API;
- claim durable con lease;
- `provider_attempt` se crea antes de invocar `submit`;
- correlation key persistida;
- el proceso API no recibe permisos de worker;
- el fake worker está explícitamente prohibido en `NODE_ENV=production`.

### Ambigüedad y reconciliación

La regla crítica quedó ejecutable, no solo documentada:

```text
DESCONOCIDO != REEMITIR
```

Casos implementados:

- respuesta aceptada concluyente → `ACCEPTED`;
- rechazo concluyente → `REJECTED_REMOTE`;
- transporte probado como no enviado → `READY` + nuevo trabajo SUBMIT;
- transporte ambiguo → `UNKNOWN` + trabajo RECONCILE;
- `UNKNOWN → RECONCILING` antes de consultar;
- reconcile encontrado aceptado/rechazado → terminal correspondiente;
- reconcile concluyente no encontrado → `READY` y solo entonces puede volver a submit;
- reconcile indeterminado → retry del trabajo, no nuevo submit;
- agotamiento de reconciliación → `NEEDS_ATTENTION`.

La transición `SUBMITTING → READY` está protegida por trigger y solo se permite si el último `provider_attempt` tiene evidencia persistida `PROVEN_NOT_SENT`.

### Crash recovery

Si un worker cae después de dejar la operación en `SUBMITTING`, el siguiente claim no vuelve a llamar a `submit`.

Hace:

```text
SUBMITTING
→ UNKNOWN
→ RECONCILE
```

Esto cubre el escenario más peligroso: side effect remoto posiblemente ejecutado pero respuesta local perdida.

### Kill switches

- `accept_new_operations=false` detiene intake nuevo;
- `provider_mutations_enabled=false` evita nuevos submits;
- reconciliación/read no se apaga con el kill switch de mutaciones;
- una recuperación de `SUBMITTING` puede seguir pasando a `UNKNOWN` aun con mutaciones apagadas, porque eso reduce riesgo y no crea un side effect remoto nuevo.

## Evidencia de pruebas

### F6B1 — intake/auth/RLS

PR efímero #55, cerrado sin merge.

Snapshot validado:

- Node 24;
- `npm audit --omit=dev --audit-level=high` PASS;
- build PASS;
- lint PASS;
- unit PASS;
- migraciones/RLS PASS;
- e2e con login DB `ci_api` no privilegiado PASS.

Promovido limpio a `dev` como:

```text
a2b5b2ede98024968372e5a3df97353b5bbc5117
```

### F6B2 — worker/reconcile/fault injection

PR efímero #56, cerrado sin merge.

CI final, run #54:

- install PASS;
- production dependency audit PASS;
- build PASS;
- lint PASS;
- unit PASS;
- migraciones + provisión de roles PASS;
- e2e con logins separados `ci_api` y `ci_worker` PASS.

Los e2e cubrieron:

- operación aceptada;
- timeout ambiguo;
- visibilidad tardía;
- `PROVEN_NOT_SENT`;
- kill switch;
- crash después de posible aceptación remota sin segundo submit.

Promovido limpio a `dev` como:

```text
7a940ac46e8f977bf33374fb5d1c75ad56d192c1
```

## Lo que F6B no demuestra

F6B **no** prueba comportamiento real de DIAN ni de un PT.

No demuestra todavía:

- endpoints reales;
- auth real del PT;
- semántica de timeout/404/409/5xx de un proveedor específico;
- búsqueda/reconciliación real;
- XML/PDF reales;
- rate limits reales;
- códigos de rechazo reales;
- idempotencia ofrecida por el PT;
- SLA/ventanas de mantenimiento;
- contingencia contractual.

Inventar cualquiera de esos detalles ahora degradaría la seguridad del producto.

## Gate siguiente

F6C sigue bloqueada por F4C.

Antes de un adapter real se requiere:

1. sandbox funcional;
2. contrato/API docs actuales;
3. ejecutar la prueba de ambigüedad de `docs/f4-prueba-ambiguedad-pt-v1.md`;
4. confirmar cómo se consulta por referencia/correlación;
5. clasificar de forma verificable cuándo un resultado permite retry y cuándo exige reconcile.

Hasta entonces se puede avanzar observabilidad, runbooks, carga interna y limpieza técnica, pero no codificar comportamiento ficticio de PT.
