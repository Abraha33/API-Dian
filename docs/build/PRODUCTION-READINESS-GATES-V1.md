# API-DIAN — Production Readiness Gates V1

> Regla: el producto no se declara listo por percepción. Se declara listo cuando existe evidencia suficiente y todos los gates aplicables están en `PASS`.

## Gates

### G01 — PRODUCT DEFINED

PASS cuando V1, usuarios, límites, roadmap y fuera de alcance están definidos.

Estado actual: **PASS**.

### G02 — ARCHITECTURE FINAL

PASS cuando arquitectura, datos, multitenancy, procesamiento, seguridad, infraestructura y contrato público están definidos y reconciliados.

Estado actual: **PASS**.

### G03 — REGULATORY READY

PASS cuando las reglas V1 implementadas se contrastan contra fuentes DIAN vigentes, anexos aplicables y pruebas/habilitación requeridas.

Estado actual: **BLOCKED / implementación y verificación de release pendientes**.

### G04 — FUNCTIONAL READY

PASS cuando FEV, NC, ND, estados, artifacts/evidence y contingencia mínima aplicable funcionan end-to-end.

### G05 — MULTITENANT READY

PASS con pruebas negativas y concurrentes que demuestren cero acceso cross-tenant/cross-organization.

### G06 — AUTH/SECURITY READY

PASS cuando API credentials, scopes, grants, rotación/revocación, secretos, hardening y pentest requerido están verdes.

### G07 — IDEMPOTENCY READY

PASS cuando requests repetidos/concurrentes no producen documentos lógicos duplicados y los conflictos semánticos se rechazan correctamente.

### G08 — UNKNOWN/RECONCILIATION READY

PASS cuando timeouts ambiguos, desconexiones e incertidumbre remota terminan en estado seguro y nunca en retry ciego.

Regla inmutable:

```text
UNKNOWN != REEMITIR
```

### G09 — FAILURE READY

PASS después de fault injection: PT caído, DIAN caído, 429, 5xx, worker crash, DB temporal, storage, webhook caído y demás fallos V1 definidos.

### G10 — API CONTRACT READY

PASS cuando OpenAPI 3.1, endpoints, errores, versionado, ejemplos y contract tests están completos.

### G11 — WEBHOOK READY

PASS cuando entrega, firma/autenticidad, retry y fallos del consumidor están probados sin alterar incorrectamente el estado fiscal.

### G12 — USAGE/QUOTA READY

PASS cuando consumo/cuotas son auditables y una misma operación no produce cobro/medición duplicada.

### G13 — PT READY

PASS solo después de seleccionar PT con aprobación del owner y validar contrato, sandbox, límites, reconciliación, errores, SLA/capacidades y adapter real.

Estado actual: **DEFERRED BY OWNER**.

### G14 — CAPACITY READY

PASS solo con benchmark reproducible de la configuración exacta.

Objetivo inicial a demostrar:

- ~3 M docs/mes;
- ~50 docs/s burst comercial;
- cero duplicados;
- cero cross-tenant;
- API local acceptance p95 objetivo según arquitectura;
- error de plataforma dentro del umbral acordado;
- DB/conexiones/cola dentro de límites medidos;
- backlog recuperable;
- costo por volumen registrado.

Hasta ejecutar esas pruebas:

```text
CAPACITY READY: BLOCKED
```

### G15 — RESTORE READY

PASS solo después de restaurar realmente datos y artifacts en un entorno controlado y verificar integridad.

### G16 — OBSERVABILITY READY

PASS cuando un único operador puede detectar desde dashboards/alertas: errores, cola, latencia, UNKNOWN, PT/DIAN, DB, certificados/numeración y costos relevantes.

### G17 — ROLLBACK READY

PASS cuando una versión defectuosa puede revertirse sin corromper datos ni perder evidencia fiscal.

### G18 — ONE-PERSON OPERATIONS READY

PASS cuando una sola persona puede operar el volumen comercial declarado usando automatización, alertas y runbooks sin intervención manual rutinaria excesiva.

Debe medirse también carga humana: incidentes, intervenciones manuales, escalaciones PT, certificados/numeración, soporte y mantenimiento regulatorio.

### G19 — COST READY

PASS cuando conocemos, para el volumen objetivo, costos de infraestructura, PT, storage, egress, herramientas y costo aproximado por 1.000 documentos/cliente.

### G20 — PILOT READY

PASS después de pruebas internas, externas y de operación necesarias para exponer un piloto controlado.

### G21 — PILOT VALIDATED

PASS después de operar con clientes reales de forma gradual y cerrar fallos críticos encontrados.

### G22 — FINAL REGULATORY DIFF

PASS después de revisar nuevamente fuentes oficiales DIAN inmediatamente antes del release productivo.

### G23 — OWNER GO-LIVE APPROVAL

PASS únicamente por decisión explícita del owner.

---

# Gate final

```text
PRODUCT DEFINED            PASS
ARCHITECTURE FINAL         PASS
REGULATORY READY           PASS
FUNCTIONAL READY           PASS
MULTITENANT READY          PASS
SECURITY READY             PASS
IDEMPOTENCY READY          PASS
UNKNOWN/RECONCILIATION     PASS
FAILURE READY              PASS
API CONTRACT READY         PASS
PT READY                   PASS
CAPACITY READY             PASS
RESTORE READY              PASS
OBSERVABILITY READY        PASS
ROLLBACK READY             PASS
ONE-PERSON OPERATIONS      PASS
COST READY                 PASS
PILOT VALIDATED            PASS
FINAL REGULATORY DIFF      PASS
OWNER GO-LIVE APPROVAL     PASS
──────────────────────────────
PRODUCTION READY           PASS
```

Hasta entonces el estado canónico es `PRODUCTION READY: BLOCKED`.