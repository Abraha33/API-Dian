# ADR-002: Estructura de módulos NestJS — API-Dian

- **Estado:** Aprobado
- **Fecha:** 2026-04-07
- **Relacionado:** [ADR-001](./ADR-001-stack-tecnologico.md)

## Contexto

La aplicación NestJS vive en **`apps/api/`** (monorepo: en la raíz siguen `docs/`, `ADR/`, `supabase/`, etc.). El código fuente de la API está bajo **`apps/api/src/`**.

## Estructura de carpetas (acordada)

```
apps/api/src/
├── main.ts                  # Bootstrap con FastifyAdapter
├── app.module.ts
├── common/                  # Guards, interceptors, decorators, pipes globales
│   ├── logger/
│   └── interceptors/
├── config/                  # ConfigModule, validación de env
└── modules/
    ├── health/              # Health/readiness (F1)
    ├── tenants/             # CRUD tenants, maestros fiscales (F3)
    ├── auth/                # API keys, JWT, guards (F3)
    ├── users/               # Usuarios y roles por tenant (F3)
    ├── documents/           # Modelo y ciclo de vida fiscal (F4)
    ├── emission/            # XML UBL, envío DIAN, respuesta (F4)
    ├── jobs/                # BullMQ workers y colas (F2)
    ├── webhooks/            # Suscripciones y entregas (F5)
    ├── storage/             # Abstracción R2/MinIO (F4)
    └── observability/       # Logs, métricas, auditoría (F6)
```

Los módulos aún no implementados se mantienen como carpetas con **`.gitkeep`** hasta su fase.

## Fase en la que se activa cada módulo

| Módulo | Fase | Rol |
|--------|------|-----|
| `health` | **F1** | Supervivencia del servicio y contrato mínimo de despliegue. |
| `jobs` | **F2** | Procesamiento asíncrono (BullMQ) y workers. |
| `tenants`, `auth`, `users` | **F3** | Multi-tenant, identidad y maestros. |
| `documents`, `emission`, `storage` | **F4** | Dominio fiscal y emisión DIAN. |
| `webhooks` | **F5** | Retorno al ERP / integradores. |
| `observability` | **F6** | Operación, auditoría y gobierno. |

## Por qué esta separación

- **Límites claros por bounded context:** fiscal (`documents` + `emission`), plataforma (`tenants`, `auth`, `users`), entrega (`webhooks`, `storage`), operación (`observability`, `jobs`).
- **Dependencias controladas:** módulos de dominio fiscal no deben importar implementaciones concretas de canales; usar interfaces y providers en el módulo que corresponda.
- **Despliegue incremental:** F1 entrega API ejecutable sin lógica fiscal; F2+ enciende colas y dominio.

## Inyección de dependencias entre módulos

- **Regla:** cada módulo expone solo lo necesario vía **`exports`** en su `@Module`; el resto consume con **`imports`**.
- **Interfaces:** contratos internos (p. ej. almacenamiento, repositorio de documentos) como **tokens de inyección** (`Symbol` o string) con implementaciones registradas en el módulo proveedor (`storage`, `emission`, etc.).
- **Evitar importaciones cruzadas** `A -> B -> A`; extraer contratos a `common` o a un módulo de puertos si hiciera falta en fases posteriores.

## Consecuencias

- **Positivas:** Roadmap y código alineados; onboarding más simple para nuevos desarrolladores.
- **Negativas / deuda:** Requiere disciplina al añadir rutas globales o singletons (usar `forRoot`/`forFeature` cuando aplique).
