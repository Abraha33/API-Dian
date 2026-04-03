# Estimación, riesgo y definición de terminado

Orientado a **un desarrollador** con uso intensivo de IA. Las cifras son **tentativas** y se refinan al cerrar el análisis del módulo.

**Relacionado:** [workflow.md](./workflow.md), [ROADMAP.md](../ROADMAP.md).

---

## Talla (esfuerzo relativo)

| Talla | Indicativo (1 dev + IA) | Regla |
|-------|-------------------------|--------|
| **XS** | Menos de medio día | Tarea clara, sin diseño nuevo. |
| **S** | Medio día – 2 días | Pocos archivos, dependencias conocidas. |
| **M** | 2–5 días | Varios componentes; puede requerir spike corto. |
| **L** | 1–2 semanas | Nuevo flujo o integración; varias pruebas. |
| **XL** | Más de 2 semanas | **Partir** en subtareas antes de implementar (issues enlazados). |

---

## Tiempo estimado

- Expresar como **rango** (p. ej. «2–4 días», «1–2 semanas»), no como compromiso único.
- Si la talla es **L** o **XL**, el rango debe desglosarse en entregables con sus propias pruebas de cierre.

---

## Riesgo

| Nivel | Cuándo usar |
|-------|-------------|
| **Bajo** | Cambio local, patrones ya usados en el repo, sin dependencia externa crítica. |
| **Medio** | Integración nueva, concurrencia/async, o dependencia de documentación externa variable. |
| **Alto** | DIAN / **canal de salida**, RLS multi-tenant, seguridad de secretos, facturación real o datos sensibles. |

---

## Prueba de cierre (obligatoria)

- Debe ser **ejecutable**: un comando, un script, una secuencia en Postman, un escenario E2E, o checklist verificable en Supabase/dashboard.
- **Sin prueba de cierre acordada, el trabajo no está listo para construir** (no entra a Ready en el sprint).
- La prueba se copia o resume en el **cuerpo del issue** y se valida antes de mover la tarjeta a **Done**.

Ejemplos de formulación:

- «Crear tenant A y B; verificar que B no lee documentos de A (query + resultado esperado).»
- «Emitir documento en sandbox; estado final aceptado o rechazado persistido con XML/respuesta según ADR.»
- «Webhook saliente: endpoint de prueba recibe payload firmado; log de entrega en base con estado OK.»

---

## Definición de done (DoD)

Para cerrar un issue de implementación, debe cumplirse:

1. La **prueba de cierre** pasó en el entorno acordado (local o staging).
2. **CI** del repo en verde para el PR (cuando exista pipeline real).
3. **Sin secretos** en el diff; variables documentadas como placeholders si aplica.
4. **Documentación** actualizada si cambia comportamiento para operadores o integradores (README, ROADMAP, o `docs/`).
5. Preguntas abiertas nuevas registradas en [open-questions.md](./open-questions.md) si no se resolvieron en el PR.

---

## Relación con el ROADMAP

El [ROADMAP.md](../ROADMAP.md) incluye por fase **F1–F8** una fila agregada: talla, tiempo tentativo, riesgo y **prueba de cierre** a nivel fase. Los issues concretos deben acotar pruebas más pequeñas que sumen esa capacidad.
