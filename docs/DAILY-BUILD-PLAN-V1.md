# API-DIAN — Secuencia diaria de construcción V1

**Estado:** FROZEN / secuencia de referencia  
**Fecha:** 2026-08-19  
**Fuentes:** `BUILD-PLAN-V1.md`, `BACKLOG-V1.md`, `DEPENDENCY-MAP-V1.md`, `DEFINITION-OF-DONE-V1.md`

> Estas son **jornadas de trabajo**, no promesas de duración de calendario. Una jornada representa una unidad pequeña que debe cerrarse con evidencia. Si una unidad resulta demasiado grande, se divide antes de implementarla. Después de auditar el código existente, muchas jornadas podrán marcarse `CONSERVAR`, `ADAPTAR`, `REHACER` o `PENDIENTE`.

---

## Regla de cada jornada

```text
leer solo contexto necesario
→ trabajar uno o pocos IDs relacionados
→ happy path
→ fallo relevante
→ gates
→ revisar diff
→ registrar resultado
→ cerrar o bloquear
```

Una jornada termina con `DONE`, `BLOCKED` o `INCONCLUSIVE`; nunca con “casi listo” sin registro.

---

# Tramo 1 — Baseline ejecutable

### Jornada 01 — Runtime reproducible
Backlog: `B1-E1-T01..T04`

- Node 24 reproducible;
- TypeScript strict;
- NestJS/Fastify;
- roles de arranque api/worker claros.

Salida: build mínimo reproducible.

### Jornada 02 — PostgreSQL y migraciones locales
Backlog: `B1-E2-T01..T03`

Salida: checkout limpio puede levantar DB y aplicar migraciones sin runtime superuser.

### Jornada 03 — CI y gates mínimos
Backlog: `B1-E2-T04..T05`, `B1-E3-T01..T07`

Salida: install/build/lint/unit/health/readiness ejecutables y CI básica verde.

---

# Tramo 2 — Multiempresa y seguridad de identidad

### Jornada 04 — Tenant base
Backlog: `B2-E1-T01..T03`

Salida: modelo tenant + ownership + FK tenant-safe inicial.

### Jornada 05 — RLS y tenant context
Backlog: `B2-E1-T04..T05`

Salida: aislamiento DB aplicado correctamente con pool.

### Jornada 06 — Prueba adversarial tenant A → B
Backlog: `B2-E1-T06`

Salida: lectura/relación cruzada falla reproduciblemente.

### Jornada 07 — Credencial POS
Backlog: `B2-E2-T01..T03`

Salida: credential de alta entropía resuelve exactamente un tenant.

### Jornada 08 — Revocación, rotación y redacción
Backlog: `B2-E2-T04..T06`

Salida: credenciales rotables/revocables y logs seguros.

### Jornada 09 — Roles DB least privilege
Backlog: `B2-E3-T01..T04`

Salida: api/worker/migrator separados y runtime sin BYPASSRLS/DDL indebido.

### Jornada 10 — Perfil fiscal versionado
Backlog: `B2-E4-T01..T05`

Salida: configuración histórica reconstruible y provider binding preparado sin PT real.

---

# Tramo 3 — Contrato fiscal interno

### Jornada 11 — Envelope y versión 1.0
Backlog: `B3-E1-T01..T04`

Salida: contrato base y errores estables.

### Jornada 12 — FEV + DEE POS
Backlog: `B3-E2-T01`, `B3-E2-T04`

Salida: modelos internos de venta sin campos propietarios PT.

### Jornada 13 — NC + ND + ajuste POS
Backlog: `B3-E2-T02..T03`, `B3-E2-T05..T06`

Salida: documentos relacionados tenant-safe.

### Jornada 14 — Validación estructural
Backlog: `B3-E3-T01..T03`, `B3-E3-T06`

Salida: payloads inválidos/mass assignment rechazados.

### Jornada 15 — Decimales y tiempo
Backlog: `B3-E3-T04..T05`

Salida: aritmética fiscal exacta y timestamps con offset.

### Jornada 16 — Canonicalización semántica
Backlog: `B3-E4-T01..T05`

Salida: equivalentes → mismo canonical; diferencias fiscales → distintos.

---

# Tramo 4 — Idempotencia y estado

### Jornada 17 — Operación fiscal durable
Backlog: `B4-E1-T01..T05`

Salida: fiscal operation inmutable y perfil histórico asociado.

### Jornada 18 — Ingreso atómico
Backlog: `B4-E2-T01..T03`

Salida: operación + work + audit aceptados coherentemente en una transacción lógica.

### Jornada 19 — Replay y conflicto
Backlog: `B4-E2-T04..T05`

Salida: misma intención reutiliza operación; intención distinta da conflicto.

### Jornada 20 — Carrera de idempotencia
Backlog: `B4-E2-T06`

Salida: concurrencia no crea dos operaciones lógicas.

### Jornada 21 — Máquina de estados
Backlog: `B4-E3-T01..T05`

Salida: transiciones centrales, versionadas y tenant-safe.

---

# Tramo 5 — Worker y frontera de side effect

### Jornada 22 — Work items durables
Backlog: `B5-E1-T01..T04`

Salida: scheduler durable separado del hecho fiscal.

### Jornada 23 — Claim concurrente
Backlog: `B5-E1-T05`

Salida: múltiples workers no reclaman peligrosamente el mismo trabajo.

### Jornada 24 — Runtime worker least privilege
Backlog: `B5-E2-T01..T04`

Salida: worker separado, API sin secreto PT, worker sin DDL.

### Jornada 25 — Provider attempt pre-send
Backlog: `B5-E3-T01..T03`

Salida: attempt/correlation durable antes de cualquier side effect.

### Jornada 26 — Reglas de red y crash
Backlog: `B5-E3-T04..T06`

Salida: sin SQL tx durante HTTP, sin retry mutante transparente, stale attempt seguro.

### Jornada 27 — Kill switch de mutaciones
Backlog: `B5-E4-T01..T03`

Salida: control fail-closed y comportamiento en vuelo probado.

---

# Tramo 6 — Incertidumbre y reconciliación

### Jornada 28 — FiscalProvider mínimo
Backlog: `B6-E1-T01..T03`

Salida: puerto mínimo sin `resend()` ni semántica PT en dominio.

### Jornada 29 — Fake: resultados concluyentes
Backlog: `B6-E2-T01..T03`

Salida: accept/reject/proven-not-sent deterministas.

### Jornada 30 — Fake: ambigüedad y fallos
Backlog: `B6-E2-T04..T07`

Salida: timeout/respuesta tardía/malformada/rate limit reproducibles.

### Jornada 31 — Fake ledger y reconcile
Backlog: `B6-E2-T08`, `B6-E3-T01..T04`

Salida: side effect simulado puede existir aunque submit no haya respondido.

### Jornada 32 — NOT_FOUND/INDETERMINATE
Backlog: `B6-E3-T05..T08`

Salida: solo evidencia concluyente permite volver a evaluar submit; indeterminado permanece seguro.

### Jornada 33 — Contract harness
Backlog: `B6-E4-T01..T04`

Salida: timeout → UNKNOWN → reconcile → nunca blind retry probado de extremo a extremo con fake.

---

# Tramo 7 — Evidencia, artefactos y operación

### Jornada 34 — Evidence + audit append-only
Backlog: `B7-E1-T01..T05`

Salida: historial relevante reconstruible y no editable ordinariamente.

### Jornada 35 — Modelo de artefactos
Backlog: `B7-E2-T01`, `B7-E2-T04..T05`

Salida: metadata/checksum/storage privado abstracto; fallo no reabre emisión.

### Jornada 36 — XML/PDF independientes
Backlog: `B7-E2-T02..T03`

Salida: recuperación de soportes desacoplada del side effect fiscal.

### Jornada 37 — Observabilidad fiscal
Backlog: `B7-E3-T01..T06`

Salida: logs/métricas/UNKNOWN/backlog/errores PT accionables.

### Jornada 38 — Control operativo y runbooks
Backlog: `B7-E4-T01..T06`

Salida: accept_new_operations + operator path + runbooks iniciales.

---

# Pista externa — ejecutar en paralelo desde temprano

Estas no son jornadas secuenciales obligatorias; deben iniciarse con anticipación para evitar que B8 bloquee el proyecto.

### EXT-01 — HKA
Backlog: `B8-E1-T01`, `B8-E1-T04..T06`

Solicitar sandbox/DEMO, documentación, modelo integrador y certificado.

### EXT-02 — DATAICO
Backlog: `B8-E1-T02`, `B8-E1-T04..T06`

Abrir en paralelo administrativo.

### EXT-03 — Reserva Facture/ESTELA
Backlog: `B8-E1-T03`

Mantener canal de reserva sin invertir integración todavía.

### EXT-04 — Alcance documental
Backlog: `B8-E2-T01..T05`

Ejecutar cuando existan credenciales reales.

### EXT-05 — Ambigüedad
Backlog: `B8-E3-T01..T07`

Gate crítico: timeout + correlate + reconcile + duplicate + significado de no encontrado.

### EXT-06 — Operación/comercial
Backlog: `B8-E4-T01..T06`

XML/PDF, rate limits, soporte, datos, coste y selección final de exactamente un PT.

**Bloqueo:** no iniciar Tramo 8 hasta que EXT-05/06 den un PT PASS.

---

# Tramo 8 — Adapter PT real

### Jornada 39 — Skeleton adapter real basado en evidencia
Backlog: `B9-E1-T01..T02`

Salida: un único adapter y auth PT solo worker.

### Jornada 40 — Mapping submit
Backlog: `B9-E1-T03..T06`

Salida: command → PT → normalizado con raw evidence preservada.

### Jornada 41 — Reconcile real
Backlog: `B9-E2-T01..T05`

Salida: reconciliación según evidencia real, sin mappings intuitivos.

### Jornada 42 — XML/PDF + provider binding
Backlog: `B9-E3-T01..T04`

Salida: artefactos reales y perfil/config PT histórico.

### Jornada 43 — Contingencias V1
Backlog: `B9-E4-T01..T04`

Salida: flujo de contingencias basado en regulación vigente/PT real.

### Jornada 44 — Contract suite real
Backlog: `B9-E5-T01..T03`

Salida: harness común verde con fixtures/evidencia sanitizados.

---

# Tramo 9 — Plataforma productiva

### Jornada 45 — Selección cloud
Backlog: `B10-E1-T01..T05`

Salida: decisión explícita por seguridad/restore/coste/operación.

### Jornada 46 — Deploy API/worker
Backlog: `B10-E2-T01..T04`

Salida: runtimes productivos reproducibles con secretos separados y TLS.

### Jornada 47 — CI/CD y rollback
Backlog: `B10-E2-T05..T06`

Salida: despliegue controlado y rollback practicable.

### Jornada 48 — Backup/PITR + restore real
Backlog: `B10-E3-T01..T02`, `B10-E3-T06`

Salida: recuperación ejecutada, no solo configurada.

### Jornada 49 — Divergencia post-restore
Backlog: `B10-E3-T03..T05`

Salida: restaurar DB antigua no provoca reemisión ciega frente al PT.

---

# Tramo 10 — POS real

### Jornada 50 — Cliente API en POS
Backlog: `B11-E1-T01..T05`

Salida: credencial, idempotency key, request y consulta de estado.

### Jornada 51 — UX de estados normales
Backlog: `B11-E2-T01..T02`, `B11-E2-T06`

Salida: accepted/rejected/artifacts manejados correctamente.

### Jornada 52 — UX de incertidumbre
Backlog: `B11-E2-T03..T05`

Salida: UNKNOWN/RECONCILING/NEEDS_ATTENTION no generan nueva emisión.

### Jornada 53 — Offline/reconnect
Backlog: `B11-E3-T01..T03`

Salida: pérdida/reconexión de red no duplica intención fiscal.

---

# Tramo 11 — Intentar romper el sistema

### Jornada 54 — Concurrencia adversarial
Backlog: `B12-E1-T01..T04`

Salida: carreras no rompen idempotencia ni claim.

### Jornada 55 — Crash boundaries
Backlog: `B12-E1-T05..T07`

Salida: crash antes/durante/después del side effect mantiene seguridad.

### Jornada 56 — Fallos PT/storage
Backlog: `B12-E2-T01..T05`

Salida: degradación externa no produce duplicados ni falso éxito.

### Jornada 57 — Seguridad tenant/input/logs
Backlog: `B12-E3-T01..T07`

Salida: aislamiento, injection/mass assignment y secretos verificados.

### Jornada 58 — DR/kill switches/reinicio
Backlog: `B12-E4-T01..T03`

Salida: recuperación integral segura.

### Jornada 59 — Carga realista + cierre adversarial
Backlog: `B12-E4-T04..T05`

Salida: volumen esperado soportado y todos los invariantes con prueba reproducible.

---

# Tramo 12 — Piloto

El piloto depende del calendario y operación real; estas son jornadas/ciclos de control, no estimaciones de días calendario.

### Piloto P1 — Preparación
Backlog: `B13-E1-T01..T04`

### Piloto P2 — Primera operación real controlada
Validar trazabilidad completa de extremo a extremo antes de ampliar volumen.

### Piloto P3 — Observación operativa
Backlog: `B13-E2-T01..T05`

Repetir durante la ventana piloto; no ampliar alcance por conveniencia.

### Piloto P4 — Gate de salida
Backlog: `B13-E3-T01..T03`

Solo pasar si estabilidad, recuperación y carga unipersonal son aceptables.

---

# Tramo 13 — Cierre V1

### Jornada final F1 — Readiness técnico/producto
Backlog: `B14-E1-T01..T10`

Salida: checklist completo del baseline de producto.

### Jornada final F2 — Documentación y riesgos aceptados
Backlog: `B14-E2-T01..T02`

### Jornada final F3 — Declaración V1
Backlog: `B14-E2-T03`

V1 solo se declara lista por evidencia del producto completo.

---

## Cómo usar este plan después de auditar el código actual

Cada jornada recibirá uno de estos estados:

```text
DONE_EXISTING     código actual ya cumple DoD y gate
ADAPT             existe pero necesita corrección
REBUILD           existe pero contradice baseline
NEW               no existe
BLOCKED_EXTERNAL  depende de PT/contrato/evidencia
```

No se volverá a ejecutar una jornada `DONE_EXISTING` solo para producir actividad. Se conservará su evidencia y se avanzará.

---

## Uso de Codex y coste de modelos

Para cada jornada, el agente debe empezar con **contexto mínimo**:

```text
docs/session-context.md
+ esta jornada
+ archivo técnico específico solo si hace falta
```

No cargar todo el repositorio ni todos los ADR por defecto.

Usar el modelo de menor coste que pueda resolver correctamente la tarea; escalar solo cuando exista una decisión difícil de arquitectura, seguridad o semántica fiscal. Las tareas mecánicas de inspección, edición y tests no justifican por sí mismas un modelo premium.

---

## Regla final

**La meta no es cumplir un número de jornadas. La meta es cerrar capacidades demostradas una por una, manteniendo el repositorio siempre en un estado entendible, comprobable y recuperable.**
