# Prompt — Chat de mini-proyectos API-DIAN

Pega este prompt en un chat nuevo:

---

Quiero estudiar y explorar API-DIAN V1 como una colección de mini-proyectos independientes.

Repositorio: `Abraha33/API-Dian`

Autoridad de producto/arquitectura:
- `draft/architecture-product-v1`

Plan oficial de construcción:
- branch `draft/official-construction-plan-v1`
- `docs/construction-v1/README.md`
- `docs/construction-v1/OFFICIAL-CONSTRUCTION-PLAN.md`
- `docs/construction-v1/MINI-PROJECTS.md`
- `docs/construction-v1/STAGES-AND-GATES.md`
- `docs/construction-v1/modules/`

Soy estudiante. Explícame cada mini-proyecto en términos sencillos y visuales, pero técnicamente correctos.

REGLA PRINCIPAL:
Quiero poder estudiar cualquier mini-proyecto independientemente de que los demás estén listos. Si una dependencia falta, usa un mock/fake conceptual o ejecutable en lugar de bloquear el aprendizaje.

Para cada mini-proyecto trabaja primero SOLO en:

ETAPA 1 — CONCEPTUALIZACIÓN
1. Qué problema resuelve.
2. Por qué existe.
3. Qué entra y qué sale.
4. Componentes internos.
5. Estados importantes.
6. Datos importantes.
7. Contratos con otros módulos.
8. Invariantes/reglas que nunca se pueden romper.
9. Errores y fallos posibles.
10. Qué dependencias podemos simular.
11. Diagrama sencillo.
12. Criterio `CONCEPT READY: PASS/FAIL`.

Después, cuando la conceptualización esté completa, pasa a:

ETAPA 2 — TESTEO AISLADO
1. Casos normales.
2. Casos negativos.
3. Casos de concurrencia si aplican.
4. Casos de fallo.
5. Datos sintéticos necesarios.
6. Mocks/fakes necesarios.
7. Herramientas de prueba recomendadas.
8. Resultado esperado.
9. Evidencia que deberíamos guardar.
10. Criterio `ISOLATED TEST READY: PASS/FAIL`.

NO mezcles todavía:
- integración completa de todos los módulos;
- contenedores/CI/GitHub Actions salvo que sean estrictamente parte del aprendizaje del módulo;
- PT real;
- credenciales reales;
- cloud real;
- producción.

Esos temas pertenecen a fases posteriores del plan oficial.

Mini-proyectos oficiales:
MP01 Contrato API pública
MP02 Modelo de datos PostgreSQL
MP03 Multitenancy e identidad organizacional
MP04 Seguridad y credenciales
MP05 Núcleo fiscal
MP06 Idempotencia, estados y reconciliación
MP07 Outbox, cola y workers
MP08 Puerto/adaptador PT
MP09 Webhooks, artefactos y auditoría
MP10 Metering, cuotas y primitivas comerciales
MP11 Contingencias y observabilidad
MP12 Capacidad y performance

No reabras las decisiones canónicas: API pública multitenant, REST/JSON, PostgreSQL autoridad, provider-neutral y `UNKNOWN != REEMITIR`.

Empieza mostrándome el mapa de los 12 mini-proyectos en lenguaje sencillo y luego pregúntame cuál quiero explorar primero. Si yo selecciono uno, céntrate únicamente en ese mini-proyecto hasta completar Conceptualización y Testeo Aislado.

---
