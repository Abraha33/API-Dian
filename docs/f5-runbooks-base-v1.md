# F5 — Runbooks base V1

**Estado:** Base aprobada; completar comandos/URLs al implementar infraestructura.

Regla general:

```text
preservar evidencia > recuperar rápido a ciegas
```

Nunca recomendar `UPDATE fiscal_operations SET status=...` manual como procedimiento normal.

## RB-01 — Spike de UNKNOWN

### Señal

Cantidad/edad de UNKNOWN supera umbral operativo.

### Acción

1. activar `provider_mutations_enabled=false` si el spike sugiere riesgo sistémico;
2. no detener reconcile read-only;
3. identificar inicio temporal, tenant, adapter version y código técnico común;
4. revisar salud/PT sin usar submit de prueba en producción;
5. clasificar attempts en vuelo;
6. reconciliar backlog;
7. escalar a PT si consulta no converge;
8. reanudar gradualmente solo cuando causa esté entendida.

### Prohibido

- reenviar UNKNOWN masivamente;
- cambiar UNKNOWN a READY por SQL;
- borrar attempts para “limpiar cola”.

## RB-02 — PT caído/intermitente

1. verificar si es mutación, lectura o ambos;
2. pausar nuevos provider submits si error rate/ambigüedad lo amerita;
3. mantener API read y estado local;
4. acumular trabajo durable sin busy loop;
5. determinar si aplica flujo de contingencia fiscal real antes de comunicar una solución al POS;
6. vigilar backlog/edad;
7. reanudar con rate limitado.

## RB-03 — Credencial PT comprometida

1. `provider_mutations_enabled=false`;
2. revocar/rotar credencial en PT;
3. no modificar evidencia histórica;
4. identificar calls ejecutadas desde última certeza;
5. reconciliar ventana;
6. actualizar secret manager;
7. reiniciar/recargar worker de forma controlada;
8. reanudar y auditar.

API runtime no debe tener el secreto PT.

## RB-04 — Credencial POS comprometida

1. revocar credential_id afectada;
2. no borrar tenant/operaciones;
3. revisar operaciones creadas por esa credential desde ventana sospechosa;
4. pausar tenant/globalmente si existe riesgo de emisión fraudulenta;
5. generar credencial nueva;
6. actualizar POS de forma segura;
7. reconciliar operaciones ambiguas antes de corregir negocio mediante notas/flujo permitido.

No “deshacer” una factura aceptada editando DB.

## RB-05 — Sospecha de cruce de tenant

Severidad máxima.

1. `accept_new_operations=false` y `provider_mutations_enabled=false` si existe posibilidad de side effect cruzado;
2. preservar logs/evidence;
3. identificar ruta: auth, repository, RLS, storage;
4. probar alcance;
5. revocar credenciales necesarias;
6. corregir y ejecutar suite BOLA/RLS completa;
7. evaluar obligaciones legales de incidente de datos;
8. solo reanudar con causa raíz y evidencia de aislamiento.

## RB-06 — Deploy defectuoso del adapter

1. pausar provider mutations;
2. identificar mapping version afectada;
3. no reescribir provider_attempt histórico;
4. reconciliar calls en vuelo;
5. rollback del artefacto/config;
6. ejecutar contract tests;
7. reanudar progresivamente.

Cada attempt conserva mapping version precisamente para este diagnóstico.

## RB-07 — Restore/PITR

1. provider mutations OFF antes de conectar worker a DB restaurada;
2. fijar `restore_point` y último punto de certeza previo al incidente;
3. identificar ventana que puede existir en PT pero no en DB restaurada;
4. consultar/reconciliar PT usando referencias externas disponibles;
5. reconstruir solo mediante procedimientos auditados; no inventar resultados;
6. confirmar constraints/RLS/secrets;
7. ejecutar smoke tests de lectura;
8. habilitar mutaciones solo después de cerrar la ventana de ambigüedad.

## RB-08 — Object storage caído

Si el hecho fiscal ya está ACCEPTED:

- no reemitir;
- reintentar fetch/store de XML/PDF de forma independiente;
- mantener artifact status pendiente/error;
- alertar por antigüedad;
- recuperar desde PT cuando vuelva.

## RB-09 — DIAN/PT evento regulatorio o cambio de anexo

1. no aplicar cambios fiscales por hotfix no revisado salvo emergencia documentada;
2. confirmar fuente oficial vigente;
3. separar obligación legal de recomendación del PT;
4. versionar mapping/schema si cambia semántica;
5. ejecutar sandbox/contract tests;
6. definir fecha efectiva;
7. desplegar con kill switch disponible;
8. conservar interpretación histórica por versión.

## RB-10 — Reanudación después de pausa

1. causa raíz conocida o riesgo aceptado explícitamente;
2. attempts en vuelo clasificados;
3. UNKNOWN bajo control;
4. contract/smoke tests verdes;
5. credenciales válidas;
6. habilitar `provider_mutations_enabled`;
7. procesar backlog con concurrencia/rate conservadores;
8. observar métricas antes de volver a régimen normal.
