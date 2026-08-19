# API-DIAN — Validación externa del proceso de desarrollo V1

**Fecha:** 2026-08-19  
**Estado:** APROBADO CON AJUSTES  
**Objeto evaluado:** proceso de construcción, no definición de producto ni selección final de PT.

## 1. Pregunta de control

¿Es razonable y defendible construir API-DIAN siguiendo esta secuencia?

```text
producto
→ arquitectura
→ build plan
→ backlog/dependencias/Definition of Done
→ plan diario
→ auditoría del código existente
→ baseline verde
→ construcción incremental
→ gate PT real
→ adapter real
→ plataforma productiva
→ integración POS
→ pruebas adversariales
→ piloto
→ cierre V1
```

## 2. Fuentes externas contrastadas

Se contrastó el proceso con fuentes primarias/autoridades técnicas vigentes o actuales a 2026:

- NIST Secure Software Development Framework (SSDF) 1.1 final y SSDF 1.2 initial public draft.
- CISA Secure by Design / Product Security guidance.
- OWASP Software Assurance Maturity Model (SAMM).
- DORA: continuous integration, continuous delivery, trunk-based development y small batches.
- Google Engineering Practices: cambios pequeños y revisión de código.
- Google SRE: release engineering, testing for reliability, monitoring, runbooks y lanzamiento seguro.
- SLSA 1.2: seguridad de la cadena de suministro y provenance de builds.
- DIAN: normatividad y documentación técnica vigente del Sistema de Facturación Electrónica, Documento Equivalente Electrónico y Proveedores Tecnológicos.

## 3. Veredicto

El proceso base es correcto y no requiere cambio de metodología.

Las decisiones de mayor valor que quedan confirmadas son:

1. definir y congelar producto antes de construir;
2. definir arquitectura y límites antes de repartir tareas;
3. construir en unidades pequeñas verificables;
4. mantener CI y pruebas automatizadas desde temprano;
5. exigir evidencia reproducible para declarar DONE;
6. separar happy path de pruebas de fallo;
7. mantener cambios pequeños y reversibles;
8. no inventar semántica de un PT antes de sandbox/documentación/contrato;
9. realizar pruebas adversariales antes del piloto;
10. probar restore/rollback/runbooks antes de declarar producción lista.

No se encontró evidencia que justifique sustituir esta ruta por un desarrollo big-bang, microservicios prematuros, una API completa generada de una sola vez o una integración PT basada en supuestos.

## 4. Ajustes obligatorios antes de considerar el proceso definitivo

### A1 — Revisión independiente proporcional al riesgo

Los cambios pequeños ordinarios pueden seguir revisión de diff + tests + CI.

Los cambios en fronteras críticas requieren además una segunda revisión independiente:

- aislamiento tenant/RLS;
- autenticación/secretos;
- idempotencia;
- máquina de estados;
- worker/side effects;
- UNKNOWN/reconcile;
- adapter PT;
- restore/divergencia;
- cambios regulatorios.

Para un desarrollador único, la segunda revisión puede comenzar con un motor/modelo distinto y un checklist adversarial, pero antes de piloto/producción los puntos de seguridad/fiscalidad de mayor impacto deben ser candidatos a revisión humana especializada cuando sea razonablemente accesible. IA no se considera sustituto automático de una auditoría independiente.

### A2 — Seguridad de cadena de suministro

Mantener el audit de dependencias ya existente y agregar, antes de producción:

- lockfiles reproducibles;
- secret scanning;
- inventario/SBOM de dependencias de producción;
- registro del commit/build que produjo cada release;
- provenance de build cuando el proveedor CI lo permita con bajo coste;
- política de actualización/remediación de dependencias vulnerables.

No se exige SLSA L3 para V1. La meta es obtener controles de alto valor sin crear una plataforma de seguridad desproporcionada para un desarrollador único.

### A3 — Gate regulatorio de frescura

La regulación y anexos DIAN son dependencias versionadas del producto.

Debe existir una comprobación explícita de vigencia:

```text
antes de implementar adapter PT
antes del piloto
antes del cierre V1
```

Verificar al menos:

- normatividad DIAN vigente;
- anexos técnicos vigentes;
- cambios en FEV/NC/ND;
- Documento Equivalente Electrónico POS y notas de ajuste;
- contingencias aplicables;
- condición vigente del PT seleccionado.

No congelar para siempre una interpretación regulatoria tomada meses antes.

### A4 — Respuesta a vulnerabilidades

Antes de producción debe existir un flujo mínimo:

```text
detectar
→ clasificar impacto
→ contener si aplica
→ corregir
→ probar
→ desplegar
→ documentar causa raíz
```

Debe incluir dependencias vulnerables, secreto comprometido, fallo de autorización/tenant isolation y vulnerabilidad propia.

### A5 — Release engineering explícito

La release no empieza el día del despliegue.

Conservar desde temprano:

- build reproducible;
- CI obligatoria;
- cambios pequeños;
- configuración versionada cuando no sea secreta;
- identificación commit → release;
- rollback practicable;
- smoke test después de despliegue.

B10 continúa siendo el bloque de plataforma productiva, pero los principios de release engineering aplican desde B1.

### A6 — Estrategia de pruebas por capas

Cada jornada no debe ejecutar todo indiscriminadamente.

Orden recomendado:

```text
test focal
→ tests del módulo
→ integración relevante
→ E2E/adversarial cuando corresponda
→ suite completa en gate de fase/release
```

Esto conserva feedback rápido y controla coste/tiempo sin reducir seguridad.

## 5. Lo que NO se recomienda agregar ahora

La validación externa no justifica añadir a V1 por sí mismo:

- Kubernetes;
- microservicios;
- service mesh;
- múltiples brokers;
- múltiples PT;
- SLSA L3 como requisito de lanzamiento;
- pentest continuo para cada commit;
- procesos corporativos pesados incompatibles con un desarrollador único;
- documentación ceremonial sin función operativa.

La aplicación debe seguir siendo proporcional al riesgo, coste, factibilidad y capacidad operativa.

## 6. Proceso meta validado

Con los ajustes, la ruta recomendada queda:

```text
1  producto congelado
2  arquitectura congelada + threat model base
3  build plan
4  backlog + dependencias + DoD
5  plan diario
6  auditoría de código existente
7  baseline verde
8  pieza pequeña
9  happy path + fallo relevante
10 revisión de diff + revisión independiente si es frontera crítica
11 tests focales → integración → CI
12 cerrar con evidencia
13 repetir
14 gate PT con evidencia real + frescura regulatoria
15 adapter real
16 release engineering / plataforma / restore
17 POS + adversarial E2E
18 revisión de seguridad/fiscalidad pre-piloto
19 piloto controlado
20 gate regulatorio final + readiness
21 V1
22 respuesta a vulnerabilidades y mejora continua
```

## 7. Conclusión

**APROBADO CON AJUSTES.**

La metodología actual es compatible con prácticas modernas de desarrollo seguro, entrega incremental y operación confiable. Los ajustes A1–A6 deben incorporarse al DoD y a los gates correspondientes antes de reanudar implementación como proceso definitivo.

La prioridad sigue siendo simplicidad operativa y evidencia. Ningún marco externo se adopta como checklist completo si su coste supera el riesgo que reduce.
