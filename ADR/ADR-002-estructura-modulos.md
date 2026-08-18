# ADR-002: Estructura de módulos NestJS — API-DIAN

- **Estado:** Requiere revalidación en F2
- **Fecha original:** 2026-04-07
- **Reconciliado:** 2026-08-18
- **Relacionado:** `ADR-001-stack-tecnologico.md`
- **Autoridad superior de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

## Motivo de la revalidación

La estructura original fue diseñada para una API SaaS orientada a integradores y una secuencia F1–F6 que ya no corresponde al producto validado.

Tres contradicciones son materiales:

1. `emission` estaba descrito como generación XML UBL + envío directo a DIAN; V1 delega la capa regulada a un solo PT habilitado.
2. `webhooks` estaba previsto como módulo de retorno a ERP/integradores; API/webhooks públicos están fuera de V1.
3. `observability` aparecía en una fase tardía; el baseline la exige desde V1 porque bus factor = 1 y los estados fiscales ambiguos deben ser detectables y reconciliables.

## Disposición de los módulos históricos

| Módulo histórico | Disposición V1 |
|---|---|
| `health` | **Mantener.** Health/readiness son parte del mínimo operable. |
| `tenants` | **Obligatorio en capacidad.** Toda operación fiscal debe estar asociada a una empresa/tenant. |
| `auth` | **Obligatorio en capacidad.** Debe autenticar POS/servicios y autorizar por tenant; no presupone integradores públicos. |
| `users` | **Condicional.** No crear gestión de usuarios/roles si V1 no tiene actor humano o panel que la necesite. |
| `documents` | **Obligatorio.** Dueño del ciclo de vida del documento fiscal y sus invariantes. |
| `emission` | **Reencuadrar.** No debe significar “DIAN directa”. Debe coordinar el caso fiscal y delegar al puerto `FiscalProvider`. |
| `jobs` | **Condicional.** Async es necesario como capacidad para reconciliación/reintentos seguros, pero BullMQ/Redis no quedan aprobados por el nombre del módulo. |
| `webhooks` | **Fuera de V1** como superficie pública para terceros. |
| `storage` | **Necesario como capacidad** para artefactos/evidencia, con tecnología por decidir. |
| `observability` | **Obligatorio desde la espina dorsal**, junto con auditoría y correlación. |

## Límites conceptuales mínimos para la arquitectura siguiente

Sin congelar nombres de carpetas, F2 debe separar al menos estas responsabilidades:

```text
plataforma
  ├─ autenticación / autorización
  └─ tenant / contexto de empresa

fiscal
  ├─ documentos y validaciones
  ├─ idempotencia
  ├─ máquina de estados
  └─ contingencias / reconciliación

provider
  └─ FiscalProvider + 1 adaptador PT

evidencia
  ├─ auditoría
  ├─ respuestas crudas PT
  └─ XML/PDF y metadatos

operación
  ├─ health/readiness
  ├─ logs/métricas/alertas
  └─ tareas async estrictamente necesarias
```

Estos son **límites de responsabilidad**, no una orden de crear microservicios ni un módulo Nest por cada bloque. La referencia para V1 sigue siendo un despliegue austero, preferiblemente monolítico/modular salvo evidencia en contrario.

## Reglas de dependencia que sobreviven

- módulos de dominio no importan implementaciones concretas del PT;
- el PT se consume mediante un puerto interno pequeño (`FiscalProvider`);
- evitar ciclos de dependencia;
- exponer solo contratos necesarios;
- no crear una abstracción multi-PT más amplia que las operaciones realmente usadas en V1;
- auditoría/observabilidad no pueden depender de que la operación fiscal “termine bien” para registrar evidencia.

## Consecuencia sobre el árbol actual

No se renombra ni elimina código únicamente para hacer coincidir esta reconciliación. F2 decidirá el refactor mínimo necesario. El objetivo es evitar dos errores opuestos: conservar arquitectura obsoleta por inercia o generar churn antes de tener la arquitectura formal.

## Próxima decisión

F2 debe reemplazar este ADR por una estructura de módulos V1 explícitamente trazada contra `docs/v1-requisitos.md`.