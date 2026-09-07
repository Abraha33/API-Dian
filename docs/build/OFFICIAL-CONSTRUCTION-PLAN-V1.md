# API-DIAN — Plan oficial de construcción V1

> Estado: **OFICIAL**
> Fecha: 2026-09-07
> Restricción principal: primera etapa comercial operable por una sola persona.

## 1. Idea central

La construcción se divide en **8 fases funcionales**. Cada fase puede estudiarse de manera aislada cuando sea posible, pero la producción solo se autoriza después de integrarlas y validar el sistema completo.

No se considera que una fase está terminada porque exista código. Cada fase necesita evidencia de prueba.

## 2. Dos primeras etapas de trabajo por módulo

Cada módulo o fase comienza con estas dos etapas:

### Etapa A — Conceptualización

Antes de implementar se define:

- objetivo;
- contrato/interfaz;
- entradas y salidas;
- datos;
- invariantes;
- estados;
- errores;
- amenazas/fallos;
- dependencias;
- mocks/fakes requeridos;
- pruebas que demostrarán que funciona;
- criterio `PASS`.

### Etapa B — Implementación guiada por testeo local

Se construye solo lo necesario para ejecutar y superar:

- unit tests;
- integration tests locales;
- concurrencia cuando aplique;
- pruebas negativas;
- fault injection cuando aplique;
- pruebas de persistencia/recuperación cuando aplique.

Esta etapa ocurre primero en local. No necesita PT real, DIAN real ni nube productiva salvo que el gate lo requiera explícitamente.

## 3. Etapas posteriores

### Etapa C — Integración local

Conectar módulos ya validados usando PostgreSQL local, procesos API/worker y fakes/adapters locales.

### Etapa D — Automatización y runner

Solo cuando el comportamiento local sea estable:

- contenedores reproducibles;
- scripts de bootstrap;
- self-hosted/local runner;
- GitHub Actions;
- lint/build/test gates;
- artefactos de pruebas;
- automatización de migraciones de test;
- smoke tests.

No convertir GitHub Actions en una dependencia para aprender o validar conceptualmente un módulo.

### Etapa E — Integración externa

- seleccionar PT cuando el owner reactive la decisión;
- sandbox PT;
- habilitación/pruebas DIAN aplicables;
- adapter real;
- errores y contingencias reales;
- evidencia contractual/técnica de límites.

### Etapa F — Hardening

- carga;
- seguridad;
- restore;
- observabilidad;
- costos;
- fallos deliberados;
- operabilidad por una sola persona.

### Etapa G — Piloto y producción

- piloto pequeño;
- crecimiento gradual;
- regulatory diff final;
- autorización explícita del owner;
- producción.

---

# 4. Las 8 fases funcionales

## F1 — Fundación técnica y entorno local

### Objetivo

Tener un proyecto reproducible donde los demás módulos puedan ejecutarse y probarse localmente.

### Incluye

- Node.js/TypeScript/NestJS/Fastify;
- estructura modular;
- PostgreSQL local;
- migraciones;
- configuración local;
- API/worker como procesos separados;
- health/readiness básicos;
- scripts de arranque;
- fakes base.

### No exige todavía

- PT real;
- GitHub Actions definitivo;
- infraestructura Google Cloud;
- documentos fiscales completos.

### Gate

Un checkout limpio puede levantar el entorno local, aplicar migraciones y ejecutar la suite mínima reproduciblemente.

---

## F2 — Identidad, multitenancy y seguridad de acceso

### Objetivo

Saber inequívocamente quién llama, a qué tenant pertenece y qué organización fiscal puede operar.

### Incluye

- tenant;
- organization;
- application;
- environment;
- API credentials;
- scopes/grants;
- hash de secretos;
- rotación/revocación;
- RLS/aislamiento;
- FKs tenant-safe;
- pruebas tenant A → tenant B.

### Gate

Cero acceso cross-tenant/cross-organization en las pruebas definidas.

---

## F3 — Núcleo fiscal V1

### Objetivo

Representar y validar la intención fiscal sin depender del contrato de un PT específico.

### Incluye

- FEV;
- nota crédito;
- nota débito;
- relaciones entre documentos;
- validaciones locales;
- aritmética decimal exacta;
- canonicalización;
- estados fiscales;
- contrato interno provider-neutral;
- artifacts/evidence model.

### Estrategia independiente

Puede funcionar con `FakeProvider` y organizaciones sintéticas sin tener PT real.

### Gate

Casos válidos e inválidos producen resultados deterministas y el modelo no filtra campos propietarios de un PT.

---

## F4 — Procesamiento durable y seguridad ante fallos

### Objetivo

Evitar pérdida y duplicación cuando existe concurrencia, crash o incertidumbre remota.

### Incluye

- `Idempotency-Key`;
- semantic hash;
- persistencia atómica;
- outbox;
- cola durable PostgreSQL;
- worker;
- leases/claim;
- máquina de estados;
- intentos de proveedor;
- reconciliación;
- `UNKNOWN != REEMITIR`;
- retry solo cuando se demuestra que es seguro.

### Gate

- misma key + misma intención = misma operación;
- misma key + intención diferente = conflicto;
- worker crash no pierde operación;
- timeout ambiguo no genera reenvío ciego;
- dos workers no generan dos side effects mutantes para la misma operación.

---

## F5 — Frontera de proveedor y ciclo DIAN

### Objetivo

Separar totalmente nuestra API pública del proveedor tecnológico concreto.

### Incluye

- puerto `FiscalProvider`;
- `FakeFiscalProvider`;
- adapter real cuando exista PT seleccionado;
- mapeo request/response;
- estado/evidencia;
- contingencias;
- reconciliación con PT/DIAN;
- capability map.

### Gate local

El fake debe poder producir aceptación, rechazo, 429, 5xx, timeout antes/después de aceptar, respuestas inconsistentes y recuperación.

### Gate externo

No existe `PASS EXTERNO` hasta tener sandbox/contrato/evidencia real del PT.

---

## F6 — Producto API comercial

### Objetivo

Convertir el motor fiscal en un producto consumible por POS, ERP, SaaS e integradores.

### Incluye

- OpenAPI 3.1;
- `POST /v1/documents`;
- consultas/estado;
- eventos;
- artifacts;
- webhooks;
- sandbox;
- quotas;
- usage metering;
- auditoría;
- errores públicos estables;
- versionado;
- documentación de integración.

### Gate

Un cliente de prueba puede integrarse usando solamente la documentación pública, sin conocer detalles internos del PT.

---

## F7 — Seguridad, capacidad, recuperación y operación

### Objetivo

Demostrar que el sistema no solo funciona, sino que puede operar de manera segura y sostenible.

### Incluye

- carga y stress;
- datos sintéticos a escala;
- benchmark de DB/API/worker;
- restore real;
- pentest/hardening;
- observabilidad;
- alertas;
- runbooks;
- rollback;
- costos;
- operación por una sola persona.

### Objetivo inicial de capacidad

- hasta ~3 M documentos/mes;
- burst comercial objetivo ~50 docs/s;
- prueba deseable por encima del objetivo antes de prometerlo;
- cero duplicados;
- cero cross-tenant;
- capacidad demostrada solo con benchmark reproducible.

### Gate

`CAPACITY READY`, `SECURITY READY`, `RESTORE READY`, `OBSERVABILITY READY` y `ONE-PERSON OPERATIONS READY` deben estar en PASS.

---

## F8 — Piloto, validación final y producción

### Objetivo

Exponer gradualmente el producto al mundo real sin saltar directamente a escala comercial.

### Secuencia

1. laboratorio;
2. 1 cliente piloto;
3. 3 clientes;
4. 5–10 clientes;
5. ampliar solo si métricas y operación siguen verdes;
6. regulatory diff final;
7. autorización del owner;
8. producción comercial.

### Gate final

`PRODUCTION READY: PASS` solo cuando todos los gates funcionales, regulatorios, de seguridad, capacidad, restore, PT, operación y piloto estén verdes.

---

# 5. Independencia vs integración

Durante aprendizaje y desarrollo:

```text
módulo real
   ↕
mock / fake / stub
```

En producción:

```text
F1 + F2 + F3 + F4 + F5 + F6 + F7
                 ↓
                F8
```

Un módulo puede ser `MODULE PASS` en aislamiento y aun así el producto seguir en `PRODUCTION READY: BLOCKED`.

# 6. Regla local-first

La primera evidencia debe producirse localmente siempre que sea técnicamente posible. Nube, PT real, DIAN, credenciales reales, gasto real y publicación se introducen únicamente cuando el gate correspondiente lo requiera y, cuando aplique, con autorización del owner.

# 7. Regla de complejidad

No introducir microservicios, brokers externos, multi-region, sharding u otra complejidad solo por anticipación. Se evoluciona cuando las mediciones demuestran que la arquitectura actual se acerca a un límite o una dependencia externa lo exige.
