# Preguntas abiertas e hipótesis

Lista viva de **lo que aún no está cerrado**. No sustituye a los ADR: cuando una pregunta se cierre con decisión duradera, mover el resultado al ADR correspondiente y tachar o eliminar la entrada aquí.

---

## Stack y plataforma (hasta ADR-001)

- **D-001 — Cierre del stack:** runtime, hosting, mecanismo de cola/async y observabilidad mínima **permanecen abiertos** hasta completar y aprobar [ADR-001](../ADR/ADR-001-stack-tecnologico.md) (issue de tablero habitual **T0.0.1** o equivalente). No sustituir este ADR por decisiones solo en chat.
- CI en `dev` además de `main`: **hipótesis / evolución** según necesidad.

---

## Canal de salida DIAN

- **Primer** integrador API o **motor de emisión** concreto para sandbox y producción: **elección operativa** tras ADR-001 y diligencia comercial/legal.
- Qué artefactos devuelve el canal (XML, PDF, eventos) y qué **debemos persistir** nosotros: **parcialmente** en ADR-001; detalle por implementación.

### D-002 — Segundo canal / estrategia de emisión

- **Qué decidir:** si y cuándo soportar un **segundo canal de salida DIAN** (o **estrategia de emisión** alternativa), criterios de conmutación, convivencia entre tenants y coste/riesgo.
- **Cuándo:** típicamente **F7** del [ROADMAP](../ROADMAP.md), **después** de un primer canal estable en sandbox/producción y de operación mínima (F4–F6).
- **Sin cerrar aquí:** ningún nombre de proveedor concreto; la elección sigue siendo **hipótesis** hasta análisis y **ADR o notas de producto** cuando corresponda.

---

## Producto y contrato ERP

- Prioridad exacta entre **API keys para ERP** y **solo consola** en el primer hito vendible: **decisión de producto** (ver F5 en ROADMAP).
- Formato de firma del **webhook saliente** hacia el ERP (esquema concreto): **pendiente** al diseñar F5.

---

## Cumplimiento y DIAN

- Profundidad inicial de **parametrización regulatoria** y **suite de regresión normativa**: se incrementa en F6 según dolor real.
- Fuentes de monitoreo normativo (quién vigila qué): **proceso** por definir.

---

## Riesgos estructurales (recordatorio)

Estos temas no son “preguntas puntuales” sino **presiones permanentes** del producto:

- Cambios normativos y operativos de la **DIAN** y del ecosistema fiscal.
- Dependencia de un **canal de salida** externo (disponibilidad, precio, cambios de API).
- **Sobrediseño** temprano frente a un solo mantenedor.
- **Deuda operativa** si se pospone panel, DLQ y observabilidad.
- **Documentación desactualizada** si no se actualiza el repo al cerrar módulos.

Ver también el README (sección de riesgos) y el ROADMAP (módulo transversal de cumplimiento DIAN).
