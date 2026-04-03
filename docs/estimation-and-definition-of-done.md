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

## Fuente canónica y sincronización

La **fuente canónica** de la tabla agregada por fase es el ROADMAP, sección [«Resumen por fase»](../ROADMAP.md#resumen-por-fase) (ancla `resumen-por-fase`). Las dos tablas siguientes reproducen ese contenido **alineado** y añaden **ejemplos ejecutables** por fase; si hubiera divergencia, prevalece el ROADMAP hasta que se sincronicen ambos.

---

## Pruebas de cierre por fase (F1–F8), sincronizado con ROADMAP

| Fase | Talla | Tiempo tentativo | Riesgo | Prueba de cierre (resumen, igual que ROADMAP) |
|------|-------|------------------|--------|-----------------------------------------------|
| **F1** | S | 2–5 días | Medio | [ADR-001](../ADR/ADR-001-stack-tecnologico.md) completo según sus criterios internos; README sin presentar stack como cerrado hasta entonces; plantilla de impacto DIAN lista. |
| **F2** | M | 1–2 semanas | Medio | Aplicación ejecutable según ADR; DB conectada; health check OK; un flujo asíncrono mínimo demostrado; CI verde con lint/tests acordados. |
| **F3** | M | 1–2 semanas | Alto | Tenant resuelto en requests; usuario consola operativo; CRUD empresa y tercero; **evidencia de aislamiento** entre tenants. |
| **F4** | L | 3–6 semanas | Alto | E2E en **sandbox** del primer **canal de salida**: camino feliz + al menos un rechazo; identificadores/artefactos persistidos según ADR; callback entrante del canal si aplica. |
| **F5** | M | 1–2 semanas | Medio | Consulta de estado estable para integrador; **webhook saliente** con reintentos y **registro de entregas**; o cliente de prueba documentado que valide el contrato. |
| **F6** | L | 2–4 semanas | Medio | DLQ + **replay manual** operativo; panel interno mínimo; logging estructurado con correlación; **suite de regresión normativa** iniciada (casos reproducibles). |
| **F7** | L–XL | 4–10 semanas | Alto | Nuevo tipo documental **o** segundo canal con trazabilidad de intentos; regresión ampliada sin romper F4–F6. |
| **F8** | M | 2–6 semanas | Medio | Planes y contadores coherentes con uso real; pasarela de cobro en entorno de prueba **o** documentación explícita si se pospone; OpenAPI publicado para integradores. |

**Regla:** fase **L** o **XL** → partir en issues enlazados antes de abordarla en un solo bloque.

---

## Ejemplos concretos ejecutables por fase

Ejemplos **adicionales** a la columna “Prueba de cierre” del cuadro anterior; sirven para redactar el cuerpo de un issue o un checklist de sprint.

### F1

- Revisar checklist interno del ADR-001 (tabla sin celdas vacías salvo N/A explícito; alternativas descartadas en al menos un eje crítico).
- Comprobar que el README sigue marcando el stack como hipótesis hasta el cierre formal del ADR-001.

### F2

- `curl` o navegador al endpoint de health devuelve estado esperado según documentación del momento.
- Ejecutar pipeline CI en un PR de prueba y obtener verde con los jobs acordados.
- Encolar y procesar un job “ping” o equivalente que deje traza en logs o en DB según diseño.

### F3

- Crear dos tenants A y B; autenticado como B, solicitar recurso de A y obtener **403/404** o lista vacía según contrato.
- Crear empresa y tercero en tenant A; verificar persistencia y lectura solo bajo contexto A.

### F4

- En sandbox del canal: enviar documento que deba **aceptarse**; verificar estado final y persistencia de identificador fiscal / respuesta según ADR.
- Enviar documento que deba **rechazarse** (datos inválidos deliberados); verificar estado de rechazo y mensaje persistido.
- Si el canal usa callback entrante: simular o recibir callback y verificar actualización de estado.

### F5

- Llamar GET de documento/estado con API key de prueba y recibir payload acordado.
- Configurar URL de webhook de prueba; forzar cambio de estado; verificar recepción, firma/secreto y fila de **entregas** con resultado OK tras reintento simulado.

### F6

- Forzar fallo transitorio en envío; verificar entrada en DLQ; ejecutar **replay manual** y ver segundo intento registrado.
- Abrir panel (o endpoint interno) y localizar documento por ID; ver último evento de cola.
- Ejecutar al menos **un** caso de la suite de regresión normativa documentada y registrar resultado.

### F7

- Añadir tipo documental o segundo adaptador según issue; ejecutar regresión mínima F4 (feliz + rechazo) **más** un caso del nuevo alcance.
- Verificar en BD o logs que cada intento registra **qué canal** procesó el envío (si aplica multi-canal).

### F8

- Simular uso que supere umbral de plan y verificar bloqueo o aviso según reglas definidas.
- Publicar o actualizar OpenAPI y abrir la UI de documentación si existe; comprobar que un endpoint clave aparece y coincide con el despliegue.

---

## Relación con el ROADMAP (issues)

Los issues concretos deben acotar pruebas **más pequeñas** que, en conjunto, cumplan la fila de su fase en la tabla anterior. La talla por **bloque de producto** aparece también en [modules.md](./modules.md).
