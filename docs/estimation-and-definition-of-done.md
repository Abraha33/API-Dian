# Estimación y Definition of Done (v0.1)

Referencia para estimar issues y definir cuándo un trabajo está terminado.

---

## Tallas (T-Shirt sizing)

| Talla | Tiempo estimado | Alcance típico | Ejemplo en este proyecto |
|-------|-----------------|----------------|--------------------------|
| XS | ≤ 30 min | 1 archivo, sin dependencias, riesgo nulo | Corregir typo en doc, añadir .gitkeep |
| S | 1–2 h | 1 área, cambios acotados | Migración simple, actualizar README |
| M | ~0.5 día | 1–2 áreas coordinadas | Endpoint + tabla de soporte |
| L | ~1 día | Varios componentes | Flujo API completo sin edge cases |
| XL | > 1 día | Debe trocearse en issues menores | Epics o cambios grandes |

Reglas:
- La talla es relativa al proyecto, no un compromiso de horas exactas.
- Si dudas entre dos tallas, elige la mayor.
- Si parece XL, trocear en issues S o M antes de empezar.
- Registrar tiempo real al cerrar cada issue para calibrar (tabla abajo).

---

## Criterios de riesgo

| Nivel | Cuándo aplica |
|-------|---------------|
| Bajo | Solo entorno local, estructuras nuevas sin consumidores, cambios en docs |
| Medio | Afecta tablas o endpoints en uso, pero con rollback claro |
| Alto | Afecta flujo de facturación, emisión DIAN o notificación al adquiriente, o sin rollback evidente |

---

## Definition of Done (general)

Un issue está **Done** cuando cumple TODO lo siguiente:

- [ ] Código y/o SQL en rama `feature/...` sin errores de lint/CI.
- [ ] Prueba de cierre del issue completada con resultado real
      (no "debería funcionar", sino "lo ejecuté y el resultado fue X").
- [ ] Documentación relevante actualizada:
      README, docs/, ADR/ según corresponda.
- [ ] PR mergeado a `dev`.
- [ ] Issue cerrado en GitHub.
- [ ] Tiempo real registrado en la tabla de calibración de este doc.

---

## DoD por tipo de módulo

Criterios mínimos cuando el issue encaja en uno de estos perfiles (además del DoD general).

### docs

- [ ] El doc es legible, con títulos, listas o tablas donde aplique.
- [ ] Está enlazado desde `README.md`, `docs/workflow.md` o el doc padre correspondiente.
- [ ] No tiene secciones "TODO" ni typos graves.

### database

- [ ] Migración versionada en `supabase/migrations/<timestamp>_nombre.sql`.
- [ ] `supabase db push` ejecutado sin errores en local (evidencia en el issue).
- [ ] `scripts/introspection/current-public-schema.sql` actualizado.
- [ ] Tabla o cambios visibles en Supabase Studio / introspección.

### backend

- [ ] Endpoint (o lógica) probada al menos manualmente con ejemplo real.
- [ ] Logging básico en puntos clave (entrada, salida, error).
- [ ] Contrato documentado (ruta, método, body, respuesta) en doc o comentario del issue.

### devops

- [ ] CI verde en el PR.
- [ ] No hay secrets en código, config ni logs.
- [ ] Si cambia infraestructura, hay ADR o nota en el doc adecuado.

### qa

- [ ] Prueba de cierre ejecutada siguiendo el bloque del issue.
- [ ] Resultado real anotado (OK / fallo y cómo se resolvió).
- [ ] Casos básicos de error cubiertos y documentados.

---

## Plantilla de prueba de cierre

Añadir este bloque al final del body de cada issue:

```markdown
### Prueba de cierre
- [ ] Paso 1: [acción concreta] → resultado esperado: [X]
- [ ] Paso 2: [acción concreta] → resultado esperado: [X]
- [ ] Paso 3: evidencia adjunta (comando + output, snippet SQL o descripción)
```

Reglas:
- Cada paso debe ser verificable de forma independiente.
- El resultado esperado debe ser específico, no vago.
- Al cerrar el issue, marcar cada paso con el resultado real obtenido.

---

## Tabla de calibración

Se llena con cada issue cerrado para ajustar tallas y estimaciones futuras.

| Issue | Título corto | Talla est. | Horas est. | Horas reales | Diferencia | Nota |
|-------|-------------|------------|------------|--------------|------------|------|
| #1 | F0-WKF-01 workflow | S | 1.5 h | — | — | Primer issue de prueba |
| #2 | F0-WKF-02 plantillas | S | 1.5 h | — | — | — |
| #3 | F0-WKF-03 contexto | S | 1.5 h | — | — | — |
| #4 | F0-WKF-04 Supabase CLI | M | 4 h | — | — | Incluye ejecución real |
| #5 | F0-WKF-05 criterios cierre | S | 1.5 h | — | — | — |

Instrucciones:
- Rellenar "Horas reales" al cerrar cada issue.
- Si la diferencia es > 50%, revisar si la talla estaba mal definida
  y actualizar los ejemplos de la tabla de tallas.
