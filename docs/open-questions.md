# Preguntas abiertas e hipótesis

Lista viva de **lo que aún no está cerrado**. No sustituye a los ADR: cuando una pregunta se cierre con decisión duradera, mover el resultado al ADR correspondiente y tachar o eliminar la entrada aquí.

---

## Stack y plataforma (hasta ADR-001)

- Runtime exacto, hosting, mecanismo de cola/async y observabilidad mínima: **pendiente de [ADR-001](../ADR/ADR-001-stack-tecnologico.md)**.
- CI en `dev` además de `main`: **hipótesis / evolución** según necesidad.

---

## Canal de salida DIAN

- **Primer** integrador API o **motor de emisión** concreto para sandbox y producción: **elección operativa** tras ADR-001 y diligencia comercial/legal.
- Qué artefactos devuelve el canal (XML, PDF, eventos) y qué **debemos persistir** nosotros: **parcialmente** en ADR-001; detalle por implementación.

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
