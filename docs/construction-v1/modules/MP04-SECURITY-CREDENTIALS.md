# MP04 — Seguridad y credenciales

## Pregunta
¿Cómo autenticamos aplicaciones y limitamos exactamente lo que cada una puede hacer?

## Fase 1 — Conceptualización
Definir:
- API key por aplicación/ambiente;
- formato público + secreto;
- hash + pepper, secreto mostrado una sola vez;
- scopes/grants;
- expiración;
- revocación;
- rotación con solapamiento controlado;
- last-used/auditoría;
- MFA/IdP para administradores humanos;
- límites de payload, rate limits y cuotas como controles separados.

Invariantes:
- secretos prod nunca en repo/logs/DB plaintext;
- una credencial revocada deja de autorizar;
- una app no gana permisos por parámetros enviados en request;
- sandbox/prod usan credenciales distintas.

Dependencias simulables: recurso protegido ficticio, tenant/org sintéticos.

## Fase 2 — Testeo aislado
Probar:
- key válida/ inválida;
- secreto incorrecto;
- scope permitido/denegado;
- expiración;
- revocación;
- rotación;
- separación sandbox/prod;
- no exposición de secreto en logs/respuestas posteriores.

**Gate:** `ISOLATED TEST READY` cuando auth y autorización pueden demostrarse sin núcleo fiscal real.

## Integración posterior
Se conecta con MP03 para contexto tenant/org y MP01 para proteger endpoints públicos.
