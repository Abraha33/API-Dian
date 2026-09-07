# API-DIAN — Experimento Astra Full Build

> Branch exclusiva: `experiment/astra-full-api-dian-v1`
> Base: `draft/official-construction-plan-v1`
> Tipo: experimento aislado
> No modifica `dev`, `draft/architecture-product-v1` ni el plan oficial.

## Objetivo

Comprobar hasta dónde puede llevar un agente avanzado (Astra/Codex) la construcción completa de API-DIAN V1 usando:

- spec-driven development;
- harness engineering;
- loops de implementar → ejecutar → verificar → corregir;
- revisores/agentes separados cuando aporte valor;
- tests automáticos;
- fault injection;
- CI y runner local;
- evidencia obligatoria por gate.

El experimento no puede alterar las decisiones canónicas de producto o arquitectura.

## Regla principal

**Una fase no está lista porque el agente diga que está lista. Está lista únicamente si el tablero enlaza evidencia reproducible que demuestra el gate.**

Estados permitidos:

- `NOT STARTED`
- `IN PROGRESS`
- `BLOCKED`
- `PASS`

No existe `PASS` sin evidencia.

## Artefactos de control

- `STUDENT-CONTROL-BOARD.md` — vista principal para el owner/estudiante.
- `EVIDENCE-RULES.md` — qué cuenta como prueba válida.
- `status.json` — estado estructurado para agentes/scripts.
- `EXPERIMENT-GOAL.md` — misión completa para Astra/Codex.

## Fases del experimento

0. Aislamiento + harness del experimento.
1. Conceptualización ejecutable de la V1 completa.
2. Testeo y criterios de aceptación antes de declarar funcionalidades cerradas.
3. Construcción local de la V1.
4. Integración local E2E completa con `FakeFiscalProvider`.
5. Runner local + contenedores + CI/Actions reproducibles.
6. Fallos, seguridad, recuperación y capacidad.
7. Gate `READY FOR PT INTEGRATION`.
8. Integración PT real — requiere intervención/autorización del owner.
9. Validación externa DIAN/PT + piloto.
10. Production readiness.

## PT

Supuesto actual del experimento: el owner probablemente se refiere a **The Factory HKA Colombia S.A.S.** cuando menciona “Khan Academy”.

Esto **no constituye selección contractual definitiva**. La integración real se mantiene bloqueada hasta que el owner confirme el PT y proporcione/autorice acceso al sandbox, credenciales, contrato y demás información necesaria.

El experimento debe llegar primero a:

`READY FOR PT INTEGRATION: PASS`

En ese momento debe detener cualquier integración externa automática y avisar al owner exactamente qué necesita para continuar.
