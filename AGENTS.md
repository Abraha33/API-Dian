# API-Dian — reglas de trabajo para agentes

## Propósito y límites

API-Dian es un producto comercial SaaS multitenant para facturación electrónica en Colombia. La API media entre sistemas ERP, el dominio propio y los canales o integradores autorizados. Este archivo gobierna el trabajo técnico: no define por sí solo contratos legales, tributarios, comerciales ni de proveedores.

## Autoridad

En caso de conflicto, aplicar en este orden: (1) solicitud y alcance explícitos del usuario, (2) este `AGENTS.md`, (3) reglas específicas de `.cursor/rules/`, (4) ADRs y documentación vigente del repositorio, (5) código y pruebas existentes. Una fuente inferior no puede inventar ni contradecir una superior; si hay ambigüedad, detenerse y preguntar.

## Rutina previa obligatoria

1. Confirmar rama, estado del árbol y alcance antes de editar; preservar cambios ajenos, historial y migraciones.
2. Identificar la fuente de verdad aplicable y leer solo lo necesario para la tarea.
3. Enumerar el write-set. No tocar archivos fuera de él.
4. Separar cada afirmación y resultado como **VERIFICADO**, **INFERIDO** o **NO VERIFICADO**.
5. Elegir la prueba mínima que pueda demostrar el cambio; no reemplazar evidencia por suposiciones.

## Permisos

- **PERMITIDO:** cambios pequeños dentro del write-set; pruebas focalizadas autorizadas; documentación de decisiones y límites; refactors solo si son necesarios para el alcance.
- **REQUIERE AUTORIZACIÓN:** ampliar write-set; cambiar contratos, esquema, migraciones, dependencias, CI, despliegue, configuración productiva o integraciones externas; leer o usar secretos; ejecutar acciones remotas, destructivas o costosas.
- **PROHIBIDO:** inventar comportamiento de DIAN, HKA o cualquier proveedor; borrar o reescribir historial, migraciones o trabajo ajeno; exponer secretos; afirmar que algo está listo sin evidencia; hacer commit, push, merge o deploy sin autorización explícita.

## Gobernanza Git, ramas y worktrees

- `dev` es la rama autoritaria de integración diaria y la base de los PR de trabajo.
- `main` es la rama de release; no se usa para desarrollo diario.
- No crear ramas permanentes por ambiente (`dev`, `staging`, `prod`) ni por versión. Los ambientes se configuran por despliegue y las versiones se marcan con tags `vMAJOR.MINOR.PATCH`.
- Las ramas auxiliares deben ser de vida corta y seguir `feature/`, `fix/`, `chore/`, `docs/`, `maintenance/`, `research/` o `dependabot/`; cada una debe tener un objetivo y PR identificables.
- No hacer push directo a `dev` o `main`; respetar el ruleset remoto, los checks obligatorios y la revisión requerida.
- Antes de usar un worktree, ejecutar `git worktree list`; no crear worktrees duplicados para la misma rama y no eliminar worktrees con trabajo sin respaldo y autorización.
- Al cerrar un PR, clasificar la rama como activa, respaldo o obsoleta; solo eliminar una rama obsoleta después de comprobar que su contenido está preservado.

## Evidencia y dominio fiscal

- No inventar endpoints, códigos, estados, certificados, reglas de validación, respuestas ni requisitos de DIAN/HKA. Si falta una fuente oficial o contrato aprobado, marcar **NO VERIFICADO** y detener la integración.
- Mantener, cuando existan en el modelo, aislamiento por tenant, trazabilidad/auditoría, idempotencia, integridad de emisor y receptor, numeración/sequence, fechas, totales, impuestos, estados y documentos originales. No cambiar una invariante fiscal por conveniencia técnica.
- Distinguir el hecho observado del razonamiento: **VERIFICADO** = evidencia reproducible; **INFERIDO** = conclusión explícita; **NO VERIFICADO** = pendiente de fuente, prueba o entorno.

## Secretos y pruebas

- Nunca escribir, copiar, imprimir ni guardar tokens, contraseñas, certificados, claves privadas, valores sensibles de `.env` o credenciales en código, memoria, logs, commits o reportes.
- Ejecutar únicamente pruebas permitidas por el alcance. Reportar comando, resultado y cobertura real. No confundir tests unitarios, mocks o laboratorio con validación de DIAN, HKA, producción, seguridad perimetral o capacidad.
- No ejecutar builds después de cambios sin autorización explícita; si se autorizan, registrar comando, alcance y resultado sin usar credenciales productivas.

## Definition of Done

- El cambio queda limitado al write-set, es pequeño, legible y compatible con estas reglas.
- Se revisa el diff y no quedan secretos, cambios accidentales ni archivos ajenos.
- Se informa qué quedó **VERIFICADO**, **INFERIDO** y **NO VERIFICADO**, junto con pruebas omitidas y motivo.
- No se declara completitud productiva o fiscal sin evidencia del entorno correspondiente.

## Entrega y bloqueos

Entregar archivos modificados, resumen breve, evidencia, limitaciones y próximos pasos. Si aparece un bloqueo externo, una contradicción de autoridad, falta de contrato o riesgo fiscal/seguridad: no improvisar, no ampliar el alcance y detenerse indicando exactamente qué decisión o evidencia falta.
