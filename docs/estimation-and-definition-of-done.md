# Estimación y Definition of Done (v0.1)

## Introducción

**Para qué sirve este documento:** Unificar cómo **estimamos** el esfuerzo (tallas XS–XL y riesgo) y cuándo consideramos un issue **terminado** (Definition of Done), con una plantilla de prueba de cierre y una tabla para **calibrar** estimaciones con el tiempo real.

**Relación con el workflow de 8 pasos** ([`docs/workflow.md`](./workflow.md)):

- **Paso 2 · Estimación:** aquí están la tabla de tallas y los criterios de riesgo que debes reflejar en el issue antes de la rama.
- **Paso 8 · Cierre:** aquí están el DoD general, el DoD por tipo de módulo (cuando aplique) y la **tabla de calibración** donde registrar horas reales al cerrar.

---

## Tallas (T-Shirt sizing)

| Talla | Tiempo orientativo | Alcance típico | Ejemplo en API-DIAN |
|-------|-------------------|----------------|---------------------|
| **XS** | ≤ 30 min | Un archivo o cambio mínimo, sin dependencias, riesgo muy bajo | Typo en doc, `.gitkeep`, enlace roto |
| **S** | 1–2 h | Una zona del repo, cambios acotados | Migración pequeña, README, un doc nuevo |
| **M** | ~0.5 día | Dos áreas coordinadas (p. ej. doc + SQL) | Endpoint sencillo + tabla de apoyo |
| **L** | ~1 día | Varios archivos / componentes | Flujo API sin cubrir todos los edge cases |
| **XL** | > 1 día | Demasiado grande para un solo PR cómodo | Épicas; **trocear** en issues S o M antes de arrancar |

**Reglas:**

- La talla es **relativa al proyecto**, no un contrato de horas exactas.
- Si dudas entre dos tallas, elige la **mayor**.
- Si parece **XL**, abrir varios issues más pequeños **antes** de implementar (ver Paso 2 del workflow).
- Al cerrar cada issue, registrar **tiempo real** en la tabla de calibración (final del doc).

---

## Criterios de riesgo

| Nivel | Cuándo aplica |
|-------|----------------|
| **Bajo** | Solo local, estructuras nuevas sin consumidores, cambios de documentación |
| **Medio** | Toca tablas o endpoints ya usados, pero hay **rollback** o mitigación clara |
| **Alto** | Facturación, emisión DIAN, notificación al adquiriente, o **sin** rollback claro |

El riesgo debe estar **visible en el body del issue** y alineado con la nota de impacto en PR si el cambio es sensible (workflow, Paso 7).

---

## Definition of Done (general)

Un issue está **Done** solo si se cumple **todo** lo siguiente:

- [ ] Código y/o SQL en rama `feature/...` sin errores de lint / CI acordados.
- [ ] **Prueba de cierre** del issue ejecutada con **resultado real** documentado (qué hiciste y qué obtuviste, no solo “debería funcionar”).
- [ ] Documentación tocada actualizada: `README`, `docs/`, `ADR/` según corresponda.
- [ ] PR **mergeado a `dev`**.
- [ ] Issue **cerrado** en GitHub.
- [ ] **Horas reales** anotadas en la tabla de calibración de este documento.

---

## DoD por tipo de módulo

Usar como **refuerzo** al DoD general cuando el issue encaje en uno de estos perfiles.

### docs

- [ ] Texto legible: títulos, listas o tablas coherentes.
- [ ] Enlazado desde `docs/workflow.md`, `README.md` o un ADR cuando proceda.
- [ ] Sin typos graves ni secciones vacías sin motivo.

### database

- [ ] Migración versionada: `supabase/migrations/<timestamp>_nombre.sql`.
- [ ] Aplicada en local con `supabase db push` sin error.
- [ ] `scripts/introspection/current-public-schema.sql` actualizado si el equipo lo pide en el issue.
- [ ] Evidencia en el issue (SQL o salida relevante).

### backend

- [ ] Comportamiento probado (manual o test mínimo).
- [ ] Logging básico (entrada/salida/errores donde aplique).
- [ ] Contrato descrito: ruta, método, body, respuestas esperadas.

### devops

- [ ] CI verde en el PR.
- [ ] Sin secretos en código ni en logs compartidos.
- [ ] Cambio de infra documentado en ADR si introduce decisión nueva.

### qa

- [ ] Prueba de cierre recorrida paso a paso.
- [ ] Resultado de cada paso reflejado en el issue.
- [ ] Al menos errores básicos considerados y anotados.

---

## Plantilla de prueba de cierre

Copiar y pegar al **final del body** del issue y adaptar los pasos:

```markdown
### Prueba de cierre
- [ ] Paso 1: [acción concreta] → resultado esperado: [X]
- [ ] Paso 2: [acción concreta] → resultado esperado: [X]
- [ ] Paso 3: evidencia (comando + salida, snippet SQL o descripción breve)
```

- Cada paso debe poder **verificarse** solo.
- El resultado esperado debe ser **concreto** (no “todo bien”).
- Al cerrar: indicar en comentario o en el PR el **resultado real** de cada paso.

---

## Tabla de calibración

Objetivo: comparar **talla/horas estimadas** con **horas reales** y afinar la tabla de tallas y los ejemplos.

| Issue | Título corto | Talla est. | Horas est. | Horas reales | Diferencia | Nota |
|-------|--------------|------------|------------|--------------|------------|------|
| #1 | F0-WKF-01 workflow | S | 1.5 h | — | — | Primer issue de prueba |
| #2 | F0-WKF-02 plantillas | S | 1.5 h | — | — | — |
| #3 | F0-WKF-03 contexto | S | 1.5 h | — | — | — |
| #4 | F0-WKF-04 Supabase CLI | M | 4 h | — | — | Incluye ejecución real |
| #5 | F0-WKF-05 criterios cierre | S | 1.5 h | — | — | — |

**Instrucciones:**

1. Al **cerrar** el issue, rellenar **Horas reales** (y una nota si la talla fue mala elección).
2. **Diferencia:** valor orientativo (p. ej. `+100%` si tardaste el doble de lo estimado).
3. Si la desviación es **> 50%** respecto a la estimación, revisar si la **talla** o los **ejemplos** de la tabla de tallas deben actualizarse en una iteración posterior de este doc.

*(Los números de issue #1–#5 son referencia al paquete F0; usa el número real del repo en GitHub al actualizar la fila.)*
