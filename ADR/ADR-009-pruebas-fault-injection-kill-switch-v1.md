# ADR-009: Estrategia de pruebas adversariales, fault injection y kill switch V1

- **Estado:** Aprobado para F5 genérico
- **Fecha:** 2026-08-18
- **Depende de:** ADR-003..008
- **Detalle:** `docs/f5-plan-pruebas-adversariales-v1.md`

## Contexto

En API-DIAN el mayor riesgo no es que una petición falle visiblemente; es que falle en un punto donde el sistema no sepa si el PT produjo un side effect fiscal.

La operación inicial será unipersonal, por lo que la seguridad debe demostrarse con pruebas reproducibles y mecanismos simples de contención. No es aceptable depender de que el operador recuerde qué hacer bajo presión.

## Decisión

### 1. Fault injection es requisito, no mejora opcional

Antes del piloto deben probarse fallos en cada frontera crítica:

```text
POS ↔ API
API ↔ PostgreSQL
worker ↔ PostgreSQL
worker ↔ PT
worker ↔ object storage
runtime ↔ secret/config
```

Especialmente:

- crash antes/después de commits locales;
- timeout después de enviar request al PT;
- reset de conexión;
- respuesta tardía;
- respuesta corrupta/incompleta;
- reinicio con backlog;
- lease expirado;
- dos workers compitiendo;
- storage indisponible después de aceptación fiscal;
- credencial PT revocada;
- aislamiento tenant adversarial.

### 2. Proveedor fake obligatorio antes del adapter real

F6 implementará primero un `FakeFiscalProvider` determinista capaz de simular:

```text
ACCEPT
REJECT
PROVEN_NOT_SENT
AMBIGUOUS_TIMEOUT
DELAYED_RESPONSE
MALFORMED_RESPONSE
RATE_LIMIT
UNAVAILABLE
ARTIFACT_FAILURE
```

El fake debe poder conservar un ledger interno de documentos simulados para que `reconcile()` pueda encontrar o no encontrar un side effect independientemente de la respuesta de `submit()`.

Eso permite demostrar ADR-004 sin depender de disponibilidad del sandbox real.

### 3. Contract tests comunes

Todo adapter PT debe ejecutar el mismo suite de contrato para:

- submit concluyente;
- rechazo concluyente;
- timeout ambiguo;
- reconciliación encontrado aceptado;
- encontrado rechazado;
- not-found concluyente cuando el PT lo soporte;
- indeterminado;
- XML/PDF;
- aislamiento entre cuentas/NIT;
- mapping de códigos/errores.

No se crean tests especiales que rebajen garantías para un proveedor particular.

### 4. Kill switch en dos niveles

V1 necesita dos controles separados:

```text
accept_new_operations
provider_mutations_enabled
```

#### `accept_new_operations = false`

La API deja de aceptar nuevas mutaciones fiscales del POS. Consultas/artefactos siguen disponibles si el resto del sistema está sano.

Uso: sospecha de corrupción de contrato, incidente de aislamiento, ataque/abuso o necesidad de detener completamente el ingreso fiscal.

#### `provider_mutations_enabled = false`

La API puede continuar persistiendo intents idempotentes según política operativa, pero el worker no inicia nuevos `submit()` al PT.

Reconciliación y consultas read-only siguen funcionando.

Uso: PT inestable, deploy dudoso del adapter, credencial comprometida en rotación, incremento anómalo de `UNKNOWN`, incidente DIAN/PT que requiere análisis.

### 5. Kill switch no borra trabajo

Pausar mutaciones:

- no cambia operaciones a rechazadas;
- no elimina work_items;
- no borra provider_attempts;
- no reescribe evidencia;
- no convierte `UNKNOWN` en `READY`;
- no cancela mágicamente side effects ya enviados.

Al reanudar, cada operación vuelve por su máquina de estados normal.

### 6. Llamadas ya en vuelo

No existe garantía de detener una mutación que ya cruzó la frontera HTTP hacia el PT.

Cuando se activa el kill switch:

1. dejar de iniciar nuevos submits;
2. identificar attempts `SUBMITTING`/en vuelo;
3. esperar respuesta solo si llega normalmente;
4. clasificar los no resueltos como `UNKNOWN`;
5. reconciliar antes de reanudar.

El runbook nunca asume que “apagamos a tiempo, entonces no ocurrió”.

### 7. Fuente del control

Los controles deben ser autoritativos, auditables y modificables sin redeploy completo. Referencia V1: configuración operativa persistida en PostgreSQL con tooling autenticado.

El worker debe comprobar `provider_mutations_enabled` inmediatamente antes de crear/iniciar un nuevo attempt y nuevamente en el último punto seguro antes del request remoto cuando sea práctico.

No se promete atomicidad entre cambiar el flag y una llamada remota ya en progreso.

### 8. Fail-safe

Si el worker no puede determinar de forma confiable si las mutaciones están habilitadas, **no inicia un nuevo side effect**.

No aplica fallback permisivo por error de configuración.

### 9. Observabilidad vinculada al kill switch

Métricas/alertas mínimas:

- estado de controles;
- número de operaciones READY acumuladas;
- attempts en SUBMITTING;
- UNKNOWN por edad;
- reconciliaciones pendientes;
- último submit exitoso/rechazado;
- error rate PT;
- activación/desactivación auditada del control.

### 10. Pruebas de recuperación

Backups/PITR no se consideran probados por existir en un panel.

Debe ejecutarse restauración real y luego simular la ventana divergente:

```text
DB restaurada a T0
PT puede contener documentos T0..T1
```

Antes de habilitar mutaciones relacionadas, esa ventana debe reconciliarse según política documentada.

### 11. Contingencias fiscales separadas del kill switch

Kill switch es control operativo interno; no es una “contingencia DIAN”.

F5 no convertirá automáticamente:

```text
provider_mutations_enabled = false
```

en un código fiscal de contingencia.

La clasificación de contingencias se cerrará contra regulación vigente y PT seleccionado.

## Consecuencia

La capacidad de detener daño y demostrar recuperación pasa a ser parte del producto V1.

No se requiere un panel administrativo complejo: tooling pequeño, autenticado y auditable es suficiente para una sola persona.
