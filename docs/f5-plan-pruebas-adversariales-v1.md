# F5 — Plan de pruebas adversariales V1

**Fecha:** 2026-08-18  
**Estado:** Parte genérica cerrada; casos PT/contingencia exacta pendientes F4C  
**Autoridad:** ADR-004, ADR-007, ADR-009

## 1. Filosofía

No buscamos demostrar que el happy path funciona. Buscamos demostrar que los fallos no crean:

1. duplicados fiscales;
2. pérdida silenciosa de operaciones;
3. cruces de tenant;
4. estados falsamente definitivos;
5. reemisión por fallos de artefactos;
6. recuperación insegura después de un desastre.

## 2. Pirámide de pruebas

### Nivel A — unitarias puras

- canonicalización;
- semantic hash;
- aritmética decimal;
- validación de DTO;
- mapping de estados/errores;
- transiciones permitidas;
- clasificación de fallos `PROVEN_NOT_SENT` vs `AMBIGUOUS`.

### Nivel B — PostgreSQL real

No mocks para invariantes que dependen de DB:

- unique tenant + idempotency key;
- conflicto hash;
- FK tenant-safe;
- RLS;
- state_version;
- un attempt mutante activo;
- work claim concurrente;
- append-only evidence/audit;
- roles api/worker/migrator.

### Nivel C — API e2e

- auth;
- tenant resolution;
- POST persistido;
- replay;
- 409 por key/hash;
- GET estado;
- artifact authorization;
- errores sanitizados.

### Nivel D — worker + FakeFiscalProvider

Fault injection exhaustivo y determinista.

### Nivel E — adapter contract sandbox

Mismo suite contra PT real una vez F4C habilite credenciales.

### Nivel F — operación/DR

- deploy/rollback;
- kill switch;
- alertas;
- runbooks;
- backup restore;
- reconciliación post-restore.

## 3. Idempotencia/canonicalización

| Caso | Resultado esperado |
|---|---|
| misma key + mismo JSON | misma operation_id |
| misma key + orden distinto de object keys | misma operation_id/hash |
| `12500.0` vs `12500.00` | mismo hash si semánticamente equivalente |
| cambio solo correlation id | mismo hash |
| cambio solo trace metadata no fiscal | mismo hash |
| cambio importe/cantidad/impuesto | 409 |
| cambio related_operation_id | 409 |
| requests concurrentes misma key | una sola operación |
| misma key tenant A/B | independientes |

## 4. Frontera API/DB

### A1 — crash antes de commit

No debe existir operación parcial ni side effect.

### A2 — commit exitoso, cliente pierde respuesta

Retry del POS con misma key recupera la misma operación.

### A3 — DB caída antes de persistir

API devuelve indisponibilidad; no se invoca PT.

## 5. Worker

### W1 — crash antes de claim

Trabajo queda recuperable.

### W2 — crash después de claim y antes de provider_attempt

Lease expira; otro worker recupera sin asumir side effect.

### W3 — crash después de provider_attempt y antes de HTTP

Al recuperar, clasificar conservadoramente según evidencia disponible; por defecto flujo de inspección/reconciliación, nunca borrar intento.

### W4 — crash después de enviar al PT y antes de persistir resultado

Debe terminar en UNKNOWN y reconciliar.

### W5 — dos workers

Nunca dos submits activos de la misma operación.

## 6. FakeFiscalProvider

El fake mantiene su propio ledger transaccional separado de la DB de aplicación para reproducir la frontera distribuida.

Escenarios:

### F1 ACCEPT

submit crea documento remoto simulado y devuelve aceptación.

### F2 REJECT

no crea documento aceptado y devuelve rechazo concluyente.

### F3 PROVEN_NOT_SENT

simula fallo demostrado antes de recibir request; dominio puede reprogramar según política sin crear UNKNOWN innecesario.

### F4 AMBIGUOUS_CREATED

fake crea documento en ledger pero lanza timeout.

Esperado:

```text
SUBMITTING → UNKNOWN → RECONCILING → ACCEPTED
```

sin segundo submit.

### F5 AMBIGUOUS_NOT_CREATED

fake no crea documento y lanza timeout; primeras consultas pueden ser INDETERMINATE y después NOT_FOUND_CONCLUSIVE.

Solo entonces puede volver a READY si política lo permite.

### F6 DELAYED_VISIBILITY

fake crea documento pero `reconcile()` responde temporalmente INDETERMINATE/not visible. Verifica que el sistema no traduzca ausencia temporal en safe-to-resend.

### F7 MALFORMED_RESPONSE

side effect puede existir pero response no se puede interpretar → UNKNOWN.

### F8 RATE_LIMIT

Lecturas pueden reintentarse con backoff. Mutación no usa retry HTTP transparente.

### F9 ARTIFACT_FAILURE

Documento aceptado, fetch XML/PDF falla. Estado fiscal permanece ACCEPTED.

## 7. Respuesta tardía

Si una respuesta llega cuando la operación ya está UNKNOWN/RECONCILING:

- no aplicar transición inválida ciegamente;
- correlacionar attempt;
- conservar evidencia;
- resolver mediante máquina de estados/locking;
- no duplicar ni retroceder un estado definitivo.

## 8. Seguridad multi-tenant

- credential A + operation UUID B → no acceso;
- artifact B → no acceso;
- related_operation_id B en nota A → rechazo;
- query sin tenant context DB → fail closed;
- intento de setear tenant_id en body → campo rechazado/no existe;
- worker procesa tenant explícito y no contamina conexión pool;
- RLS test con SQL directo por rol runtime.

## 9. Secretos/logging

Tests automáticos o inspección CI deben verificar que no aparezcan:

- Authorization;
- PT token/password;
- DB password;
- payload fiscal completo en logs normales;
- XML/PDF completo;
- secretos de object storage.

## 10. Kill switch

### K1 pause provider mutations

- READY puede acumularse;
- no se crean nuevos provider_attempt mutantes después del punto de control;
- GET/reconcile siguen funcionando.

### K2 pause acceptance

POST nuevo es rechazado de forma estable; consultas continúan.

### K3 activation con calls en vuelo

Attempts ya en vuelo se identifican y los no resueltos terminan UNKNOWN/reconcile.

### K4 restart con switch activo

No debe resetearse a enabled por default inseguro.

### K5 audit

Cada cambio registra actor técnico, timestamp, old/new value y correlation.

## 11. PT outage

Con fake y luego sandbox:

- backlog visible;
- no busy-loop;
- exponential backoff con jitter para lecturas/consultas según política;
- no retry mutante transparente;
- alerta por edad/cantidad;
- recuperación gradual sin stampede.

## 12. Backup/restore

Prueba obligatoria:

1. crear operaciones/attempts/evidence;
2. backup/PITR;
3. generar más operaciones y side effects simulados;
4. restaurar a punto anterior;
5. confirmar que DB restaurada desconoce parte del ledger fake/PT;
6. mantener provider mutations pausadas;
7. reconciliar ventana divergente;
8. reconstruir estado/evidencia permitida sin inventar hechos;
9. habilitar solo tras criterio explícito.

## 13. Observabilidad

Generar artificialmente:

- UNKNOWN spike;
- reconciliación envejecida;
- PT error rate alto;
- queue backlog;
- artifact failures;
- auth failures;
- idempotency conflicts.

Cada alerta debe tener:

- umbral/condición;
- severidad;
- runbook;
- owner (inicialmente operador único);
- criterio de recuperación.

Eliminar alertas que no conduzcan a una acción.

## 14. Contingencias fiscales — pendiente específico

Fuentes oficiales DIAN actuales consultadas:

- https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/inconvenientes-tecnologicos/
- https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/normatividad/
- https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0165_2023.htm

La DIAN distingue contingencias según causa; la página de inconvenientes tecnológicos diferencia fallas del facturador/PT de fallas atribuibles a DIAN.

No se congelan aquí plazos/códigos como constantes de software hasta construir en F5 la matriz jurídica con la norma vigente consolidada y el flujo real del PT seleccionado.

Especialmente: FEV y DEE POS no deben asumirse idénticos por analogía.

## 15. Definition of Done F5 genérico

Antes de adapter real:

- suite canonicalización completa;
- DB invariants testeados con PostgreSQL real;
- fake provider con escenarios F1–F9;
- ADR-004 escenarios cubiertos;
- kill switch probado;
- RLS adversarial probado;
- logs/secrets verificados;
- backup restore ensayable;
- métricas/alertas definidas.

La parte provider/regulatoria de F5 permanece bloqueada hasta F4C.
