# API-DIAN — Definition of Done V1

**Estado:** FROZEN / baseline de terminado  
**Fecha:** 2026-08-19  
**Aplica a:** `docs/BACKLOG-V1.md`

## 1. Regla principal

Una tarea no está terminada porque:

- “el código compila”;
- “funciona en mi equipo”;
- existe el archivo;
- Codex dijo que terminó;
- el happy path respondió correctamente una vez.

Una tarea está `DONE` cuando existe **evidencia reproducible** de que cumple su objetivo y no rompe los invariantes relevantes.

---

## 2. DoD universal para cambios de código

Salvo que la tarea sea puramente documental/externa, debe cumplir:

1. alcance del cambio pequeño y coherente con uno o pocos IDs de backlog;
2. no amplía el producto ni contradice arquitectura;
3. build verde;
4. lint verde;
5. tests relevantes verdes;
6. happy path probado;
7. fallo/riesgo relevante probado cuando aplique;
8. no introduce secretos ni datos sensibles en Git/logs/fixtures;
9. no debilita tenant isolation, idempotencia, estados ni evidencia;
10. migraciones versionadas si cambia persistencia;
11. sin cambios manuales de producción como requisito normal;
12. documentación mínima actualizada si cambia operación/contrato;
13. working tree/diff revisado para evitar cambios ajenos;
14. CI verde antes de integrar/promover.

---

## 3. DoD para persistencia/base de datos

Además del DoD universal:

- constraints expresan invariantes cuando sea razonable;
- SQL parametrizado;
- tenant ownership explícito;
- foreign keys tenant-safe donde aplique;
- RLS/roles verificados cuando aplique;
- migration forward-only/reproducible;
- prueba negativa de acceso o estado inválido cuando el riesgo lo justifique;
- ningún runtime normal necesita superuser/BYPASSRLS/DDL;
- no se reescribe evidencia histórica para “hacer pasar” la prueba.

---

## 4. DoD para seguridad/autenticación

- secreto no se almacena en plano cuando no sea necesario;
- logs no muestran secreto/Authorization;
- credencial resuelve un tenant inequívoco;
- fail closed si auth/tenant no puede resolverse;
- prueba tenant A → B negativa;
- revocación/rotación probadas cuando correspondan;
- least privilege demostrado, no solo documentado.

---

## 5. DoD para contrato fiscal

- contrato no contiene semántica propietaria del PT;
- tipos/campos validados;
- decimales exactos;
- canonicalización determinista;
- ejemplos válidos e inválidos probados;
- errores hacia POS estables;
- campos internos no son seleccionables por mass assignment;
- cambios incompatibles requieren versión nueva, no reinterpretación histórica.

---

## 6. DoD para idempotencia/estado

- misma key + misma intención → misma operación;
- misma key + intención distinta → conflicto;
- escenario concurrente probado;
- transición solo desde estado esperado;
- estado fiscal separado del scheduler;
- no aparece un nuevo camino de side effect;
- evidencia/auditoría suficiente de transición.

---

## 7. DoD para worker/side effect

- `provider_attempt` persistido antes del request remoto;
- un solo intento mutante activo por operación;
- ninguna transacción SQL permanece abierta durante red PT;
- no retry HTTP transparente de mutación;
- crash/lease expirado no autoriza submit ciego;
- kill switch respetado de forma fail-closed;
- dos workers compitiendo no duplican side effect lógico.

---

## 8. DoD para UNKNOWN/reconciliación

- timeout ambiguo se convierte en UNKNOWN;
- UNKNOWN nunca entra automáticamente a SUBMITTING;
- reconcile es read-only respecto al hecho fiscal;
- `PROVEN_NOT_SENT` exige evidencia explícita;
- `NOT_FOUND_CONCLUSIVE` exige evidencia explícita;
- caso indeterminado puede permanecer seguro/NEEDS_ATTENTION;
- backoff no genera reemisión por agotamiento;
- pruebas reproducibles con fake o evidencia real PT.

---

## 9. DoD para adapter PT real

No puede marcarse DONE sin B8 PASS.

Debe incluir:

- documentación/sandbox/contrato real referenciado;
- auth real probada sin secreto en repo;
- mappings documentados y versionados;
- submit/reconcile/status/artifacts probados;
- timeout ambiguo probado;
- duplicado probado;
- evidencia sanitizada conservada;
- contract harness común verde;
- ningún 404/texto de proveedor convertido por intuición en seguridad de retry;
- ningún código fuera del adapter interpreta semántica propietaria PT.

---

## 10. DoD para artefactos/evidencia

- objeto asociado inequívocamente a tenant/operación;
- checksum/tamaño/content-type registrados;
- storage privado;
- acceso tenant-safe;
- fallo de XML/PDF no cambia estado fiscal a reemitible;
- evidencia append-only donde corresponda;
- no se loguea contenido completo sensible por defecto.

---

## 11. DoD para infraestructura productiva

- configuración reproducible/versionada cuando corresponda;
- secretos fuera del repo/imagen;
- API y worker con identidades separadas;
- health/readiness disponibles;
- observabilidad mínima activa;
- backup/PITR configurado;
- **restore real ejecutado**;
- divergencia post-restore frente al PT probada/reconciliada;
- rollback de aplicación practicable;
- no se declara producción lista por existir un dashboard verde.

---

## 12. DoD para integración POS

- misma intención reutiliza la misma idempotency key en retry;
- POS no selecciona tenant/emisor autoritativo;
- UNKNOWN/RECONCILING no crean nueva operación de la misma venta;
- errores estables manejados;
- reconnect/offline probado;
- estado/artifacts recuperables;
- POS no conoce ni depende de códigos/endpoints PT.

---

## 13. DoD para tareas documentales

Una tarea documental está DONE cuando:

- tiene fuente/autoridad clara;
- no contradice baselines superiores;
- distingue decisión de hipótesis;
- distingue PASS/FAIL/INCONCLUSIVE cuando corresponda;
- no contiene secretos;
- queda versionada en el repositorio;
- actualiza `session-context.md` solo si cambia el siguiente paso o autoridad vigente.

---

## 14. DoD para tareas externas/PT

Una solicitud enviada no equivale a resultado.

Estados válidos:

```text
PENDING_EXTERNAL
PASS
FAIL
INCONCLUSIVE
```

`PASS` requiere evidencia suficiente para el gate concreto. Silencio, marketing, captura de pantalla incompleta o nombre de un estado no equivalen a prueba técnica.

---

## 15. DoD de una fase Bx

Una fase completa solo puede marcarse DONE cuando:

1. todas sus tareas P0 necesarias están PASS/DONE;
2. tareas P1 obligatorias para su gate están DONE;
3. gate de salida del Build Plan está demostrado;
4. no hay defecto crítico abierto que invalide el gate;
5. CI/tests/evidencias correspondientes están verdes/registrados;
6. documentación de operación relevante está actualizada;
7. las dependencias siguientes pueden comenzar sin asumir comportamiento inexistente.

---

## 16. Causas para NO cerrar una tarea

No cerrar si:

- test crítico está deshabilitado/skipped sin justificación;
- se necesitó modificar datos manualmente para que pasara;
- depende de un secreto o credencial no documentada de forma segura;
- solo funciona con superusuario;
- contradice producto/arquitectura;
- el fallo relevante no fue probado;
- evidencia PT es ambigua;
- CI está roja;
- hay diff ajeno mezclado;
- la solución añade infraestructura sin gate/justificación.

---

## 17. Evidencia mínima al cerrar una tarea diaria

El registro diario debe indicar, de forma breve:

```text
backlog IDs
archivos/cambios
comandos/gates ejecutados
resultado tests
riesgo/fallo probado
estado DONE/BLOCKED/INCONCLUSIVE
bloqueo siguiente
```

No necesitamos reportes extensos; necesitamos trazabilidad suficiente para retomar el proyecto sin reconstruir contexto.

---

## Regla final

**DONE significa demostrado, no declarado. En un sistema fiscal, una tarea que “parece funcionar” pero no demuestra su comportamiento ante el fallo relevante sigue incompleta.**
