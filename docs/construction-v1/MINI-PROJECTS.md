# API-DIAN V1 — Mapa oficial de mini-proyectos

Cada mini-proyecto puede explorarse en Fase 1 y probarse aisladamente en Fase 2 usando mocks/fakes. La integración real ocurre después.

| ID | Mini-proyecto | Pregunta que responde | Dependencias falsas permitidas |
|---|---|---|---|
| MP01 | Contrato de API pública | ¿Cómo consume un tercero nuestra API? | core fiscal falso, auth falsa |
| MP02 | Modelo de datos PostgreSQL | ¿Cómo representamos y protegemos datos? | servicios falsos |
| MP03 | Multitenancy e identidad organizacional | ¿Quién es tenant, organización y app? | endpoints ficticios |
| MP04 | Seguridad y credenciales | ¿Quién puede hacer qué y con qué secreto? | recursos ficticios |
| MP05 | Núcleo fiscal | ¿Cómo representamos FEV/NC/ND y reglas? | tenant falso, PT falso |
| MP06 | Idempotencia, estados y reconciliación | ¿Cómo evitamos duplicados y manejamos incertidumbre? | documento/provider falsos |
| MP07 | Outbox, cola y workers | ¿Cómo hacemos trabajo durable y recuperable? | work items y provider falsos |
| MP08 | Puerto/adaptador de Proveedor Tecnológico | ¿Cómo evitamos acoplarnos al PT? | `FakeFiscalProvider` |
| MP09 | Webhooks, artefactos y auditoría | ¿Cómo entregamos resultados/evidencias? | clientes receptores falsos |
| MP10 | Metering, cuotas y primitivas comerciales | ¿Cómo medimos consumo y aplicamos límites? | planes/tenants sintéticos |
| MP11 | Contingencias y observabilidad | ¿Cómo detectamos, explicamos y recuperamos fallos? | PT/DIAN/infra simulados |
| MP12 | Capacidad y performance | ¿Cuánto soporta realmente una configuración? | tráfico y datos sintéticos |

## Regla común de cada mini-proyecto

Cada módulo debe producir, como mínimo:

1. `CONCEPT.md` o sección equivalente: responsabilidades, contratos, invariantes y límites.
2. `TEST-PLAN.md` o sección equivalente: casos normales, negativos y de fallo.
3. evidencia ejecutable cuando corresponda;
4. criterio `PASS/FAIL` objetivo;
5. lista de dependencias reales que se conectarán en Fase 3+.

## Orden recomendado para aprender

No es obligatorio. Para un estudiante se recomienda:

`MP01 → MP02 → MP03 → MP04 → MP05 → MP06 → MP07 → MP08 → MP09 → MP10 → MP11 → MP12`.

## Orden mínimo de integración

Para integrar V1 de forma segura:

`MP02 + MP03 + MP04 → MP05 + MP06 → MP07 + MP08 → MP01 + MP09 + MP10 → MP11 → MP12`.

El contrato público MP01 puede diseñarse antes, pero su implementación productiva debe apoyarse en identidad, datos y núcleo fiscal reales.
