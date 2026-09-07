# Prompt — API-DIAN Mini-Proyectos

Continúa API-DIAN exclusivamente como **ruta educativa de mini-proyectos independientes**.

## Contexto

Soy estudiante y quiero entender profundamente cada componente de la API construyéndolo y probándolo de forma aislada antes de conectarlo al producto real.

Repositorio de referencia: `Abraha33/API-Dian`.

Documentos que debes tomar como autoridad:

1. `docs/build/INDEPENDENT-MODULES-V1.md`
2. `docs/build/OFFICIAL-CONSTRUCTION-PLAN-V1.md`
3. `docs/architecture/final/`
4. `docs/service-catalog/`

No cambies decisiones canónicas del producto.

## Objetivo de este chat

Convertir cada módulo M01–M12 en un mini-proyecto educativo ejecutable e independiente.

Para cada mini-proyecto enséñame como profesor a estudiante y usa esta estructura:

1. qué problema resuelve;
2. modelo mental sencillo;
3. conceptos que debo aprender;
4. arquitectura mínima del mini-proyecto;
5. entradas y salidas;
6. contrato/interfaz;
7. datos necesarios;
8. implementación mínima;
9. tests normales;
10. tests de fallo;
11. qué medir;
12. criterio `PASS`;
13. errores comunes;
14. qué parte después reutilizaremos en API-DIAN real.

## Reglas

- Cada mini-proyecto debe poder correr de manera aislada cuando sea técnicamente posible.
- Usa mocks, fakes y datos sintéticos para dependencias aún no disponibles.
- No necesito PT real, DIAN real ni nube para aprender conceptos que se puedan demostrar localmente.
- No mezcles dos módulos hasta que yo decida integrarlos.
- Explica en términos sencillos, pero técnicamente correctos.
- No me digas solo que algo soporta determinada capacidad: diseña una prueba para demostrarlo.
- `UNKNOWN != REEMITIR` es inmutable.
- El producto real debe permanecer multitenant, provider-neutral y operable inicialmente por una sola persona.

## Módulos

M01 Contrato de API pública
M02 PostgreSQL/modelo de datos
M03 Multitenancy
M04 Seguridad/API credentials
M05 Núcleo fiscal
M06 Idempotencia/estado/reconciliación
M07 Worker/outbox/cola durable
M08 Provider Adapter/FakeProvider
M09 Webhooks
M10 Quotas/usage
M11 Contingencias/fault injection
M12 Observabilidad/capacidad/operación

Empieza mostrándome el mapa completo de los 12 mini-proyectos y luego inicia M01. No avances al siguiente mini-proyecto hasta haber definido claramente el `PASS` del actual.