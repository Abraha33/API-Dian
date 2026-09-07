# API-DIAN — Modelo de ejecución local-first

> Estado: OFICIAL
> Objetivo: construir y demostrar comportamiento localmente antes de introducir automatización o dependencias externas innecesarias.

## 1. Principio

La primera fuente de evidencia será el entorno local del owner siempre que sea técnicamente posible.

```text
conceptualización
      ↓
implementación mínima
      ↓
tests locales
      ↓
integración local
      ↓
automatización/runner
      ↓
PT/DIAN sandbox
      ↓
hardening
      ↓
piloto/producción
```

## 2. Entorno local esperado

La máquina local podrá ejecutar, según la fase:

- API NestJS/Fastify;
- worker separado;
- PostgreSQL;
- FakeFiscalProvider;
- simuladores de webhook;
- fixtures/datos sintéticos;
- harnesses de fault injection;
- herramientas de carga;
- contenedores cuando ayuden a reproducibilidad.

No se necesita Google Cloud para demostrar la lógica de negocio, idempotencia, RLS, colas, reconciliación o la mayor parte de las pruebas funcionales.

## 3. Contenedores

Los contenedores son una herramienta de reproducibilidad local, no una prueba de producción por sí mismos.

Uso permitido desde temprano:

- PostgreSQL local reproducible;
- fake provider;
- servicios auxiliares de test;
- API/worker cuando aporte consistencia.

No convertir Docker/Kubernetes en el objetivo del proyecto. La arquitectura productiva de referencia sigue siendo servicios administrados de Google Cloud; Kubernetes no es requisito V1.

## 4. Runner local / self-hosted

El owner dispone de runner local. Su uso canónico comienza en la **Etapa D — Automatización**.

Antes de esa etapa:

- los comandos deben poder ejecutarse manualmente;
- los tests deben ser reproducibles desde terminal;
- ningún módulo debe depender de que GitHub Actions funcione para poder estudiarse.

En Etapa D el runner automatizará los mismos comandos ya demostrados localmente.

## 5. GitHub Actions

El workflow existente `.github/workflows/ci.yml` es preexistente y no constituye por sí solo la estrategia definitiva de CI de este plan.

No modificarlo de forma especulativa durante conceptualización.

Cuando llegue Etapa D se debe:

1. auditar el workflow actual;
2. decidir qué jobs usan self-hosted/local runner;
3. reproducir exactamente los comandos locales;
4. separar tests rápidos de tests pesados;
5. evitar usar credenciales reales en CI;
6. generar evidencia/artefactos de los gates;
7. documentar timeouts y recuperación del runner.

## 6. Orden de evidencia

Para cada módulo:

### A. Manual local

El desarrollador puede ejecutar el test desde terminal.

### B. Repetible local

Un script/comando reproduce exactamente el resultado.

### C. Automatizado en runner

GitHub Actions ejecuta ese mismo script/comando.

### D. Integración externa

Solo cuando el módulo necesita PT/DIAN/cloud reales.

## 7. Frontera de nube

Google Cloud se introduce cuando necesitamos validar:

- comportamiento real de Cloud Run/Cloud SQL/object storage;
- networking/TLS/WAF;
- autoscaling;
- backup administrado;
- IAM/KMS/Secret Manager;
- costos de configuración real;
- load test representativo de producción.

No gastar dinero real ni crear infraestructura productiva sin autorización del owner.

## 8. Frontera PT/DIAN

Antes de seleccionar PT:

```text
core → FakeFiscalProvider
```

Después de selección/autorización:

```text
core → ProviderPort → AdapterReal → PT → DIAN
```

La identidad del PT nunca debe contaminar el contrato público.

## 9. Capacidad

El benchmark local permite encontrar errores y primeros límites, pero la capacidad comercial final debe medirse también sobre una configuración de infraestructura representativa.

Objetivo actual a demostrar, no promesa:

- ~3 M documentos/mes;
- ~50 docs/s burst comercial;
- prueba por encima del límite comercial cuando sea viable;
- cero duplicados;
- cero cross-tenant;
- backlog recuperable;
- costos medidos.

## 10. Regla one-person

Una automatización solo cuenta como mejora si reduce la carga de una sola persona. Si crea una nueva plataforma que exige administración continua sin necesidad demostrada, se considera complejidad negativa.
