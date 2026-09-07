# MP03 — Multitenancy e identidad organizacional

## Pregunta
¿Cómo sabemos a qué cliente, organización y ambiente pertenece cada operación?

## Fase 1 — Conceptualización
Definir relaciones entre:
- tenant;
- organization;
- application;
- environment;
- user administrador;
- contexto de request.

Casos:
- comercio directo: tenant + una organización;
- integrador: un tenant + múltiples organizaciones;
- sandbox y producción separados.

Invariantes:
- tenant A nunca lee/escribe tenant B;
- organization incorrecta no puede referenciarse aunque el UUID sea conocido;
- aislamiento debe existir en API, queries, RLS y constraints;
- el tenant se deriva de identidad autorizada, no de un campo confiado libremente al cliente.

Dependencias simulables: endpoints y documentos ficticios.

## Fase 2 — Testeo aislado
Crear tenants/orgs sintéticos y probar:
- A puede acceder a A;
- A no puede acceder a B;
- integrador puede acceder solo a sus organizaciones autorizadas;
- sandbox no accede a prod;
- UUID conocido de otro tenant sigue denegado;
- concurrencia no mezcla contexto.

**Gate:** `ISOLATED TEST READY` con cero cross-tenant en pruebas negativas.

## Integración posterior
Se conecta con MP02 schema, MP04 credenciales y todos los recursos públicos.
