# GOAL — API-DIAN V1 LOCAL-FIRST BUILD

## MISIÓN

Continuar y completar de forma autónoma la construcción de API-DIAN V1 desde la documentación canónica existente, trabajando primero en local, cerrando cada módulo con evidencia reproducible y sin reabrir decisiones de producto/arquitectura ya aprobadas.

El objetivo no es solo producir código que compile. El objetivo es llegar, fase por fase, a un sistema fiscal V1 que pueda demostrar funcionalidad, integridad, aislamiento, recuperación, capacidad, seguridad y operación sostenible por una sola persona.

No detener el proceso para pedir aprobaciones intermedias salvo que exista un bloqueo externo real, una acción destructiva/productiva, un gasto real, una credencial/contrato faltante o una contradicción canónica imposible de resolver conservadoramente.

---

## REPOSITORIO

`Abraha33/API-Dian`

### Autoridad actual

La planificación oficial está definida por:

- `docs/build/README.md`
- `docs/build/OFFICIAL-CONSTRUCTION-PLAN-V1.md`
- `docs/build/INDEPENDENT-MODULES-V1.md`
- `docs/build/LOCAL-FIRST-EXECUTION-MODEL.md`
- `docs/build/PRODUCTION-READINESS-GATES-V1.md`
- `docs/architecture/final/`
- `docs/service-catalog/`
- `docs/HANDOFF-NEXT-CHAT.md`
- `AGENTS.md`

Los planes de build anteriores son históricos cuando contradicen estos documentos.

### Branching

- No modificar `dev` directamente.
- No hacer merge automático a ramas protegidas.
- Antes de implementar, verificar HEAD de la autoridad canónica y crear/usar una branch dedicada de build local, recomendada: `build/v1-local`.
- Mantener commits pequeños, descriptivos y reversibles.

---

# PRODUCTO CANÓNICO

API-DIAN V1 es una **API fiscal pública multitenant para Colombia**, consumida por:

- POS de terceros;
- ERP;
- software administrativo/contable;
- SaaS;
- integradores;
- plataformas verticales;
- nuestro propio POS como un cliente más.

La API pública es HTTP/REST-style + JSON + OpenAPI 3.1.

No exponer contratos propietarios del PT.

La arquitectura base es:

```text
Cliente tercero
      ↓
Public API
      ↓
validación + seguridad + idempotencia
      ↓
PostgreSQL + outbox
      ↓
Worker
      ↓
Provider Port
      ↓
Provider Adapter
      ↓
PT
      ↓
DIAN
```

`PostgreSQL` es autoridad.

`UNKNOWN != REEMITIR` es inmutable.

---

# V1 FUNCIONAL

Construir y validar como mínimo:

- FEV;
- nota crédito;
- nota débito;
- contingencia mínima aplicable;
- estados;
- XML/PDF/evidencias;
- idempotencia;
- reconciliación;
- tenant/organization/application/environment;
- API credentials;
- scopes/grants;
- sandbox;
- webhooks;
- quotas;
- usage metering;
- auditoría;
- contrato OpenAPI estable.

La recepción/eventos del adquirente y otras familias siguen el roadmap aprobado y no deben colarse en V1 si no corresponden.

---

# RESTRICCIÓN OPERATIVA

La primera etapa comercial debe poder ser mantenida y operada por **una sola persona**.

Toda decisión debe evaluarse también por carga operacional.

No introducir microservicios, Kubernetes, sharding, multi-region, brokers externos u otra complejidad sin evidencia de necesidad.

---

# CAPACIDAD

Objetivo inicial a demostrar, no promesa:

- hasta ~3 M documentos fiscales/mes;
- ~50 documentos/s como burst comercial objetivo;
- probar por encima del límite comercial cuando sea técnicamente viable;
- cero duplicados;
- cero cross-tenant;
- backlog recuperable;
- costo por volumen medido.

No declarar `CAPACITY READY: PASS` hasta ejecutar benchmark reproducible sobre una configuración exacta.

---

# MODELO DE TRABAJO OBLIGATORIO

Cada módulo/capacidad pasa por:

## ETAPA A — CONCEPTUALIZACIÓN

Antes de tocar implementación relevante:

1. definir problema;
2. contrato/interfaz;
3. entradas/salidas;
4. datos;
5. estados;
6. invariantes;
7. errores;
8. fallos esperados;
9. mocks/fakes;
10. tests;
11. criterio PASS.

Guardar la decisión relevante en documentación si no está ya definida.

## ETAPA B — IMPLEMENTACIÓN + TESTEO LOCAL

Implementar la menor capacidad correcta y demostrarla localmente mediante:

- unit tests;
- integration tests;
- negative tests;
- concurrency tests cuando aplique;
- fault injection cuando aplique;
- persistence/recovery tests cuando aplique.

No depender todavía de PT real, DIAN real ni Google Cloud si el comportamiento puede demostrarse localmente.

## ETAPA C — INTEGRACIÓN LOCAL

Conectar los módulos ya validados usando:

- API;
- worker;
- PostgreSQL;
- FakeFiscalProvider;
- mocks de webhook;
- datos sintéticos.

## ETAPA D — AUTOMATIZACIÓN

Solo después de que los comandos funcionen manual y reproduciblemente:

- auditar/adaptar contenedores;
- scripts de bootstrap;
- self-hosted/local runner;
- GitHub Actions;
- gates automáticos;
- artefactos de tests;
- separación de suites rápidas/pesadas.

El owner dispone de runner local.

El workflow actual `.github/workflows/ci.yml` es preexistente y debe auditarse antes de considerarlo canónico.

## ETAPA E — INTEGRACIÓN EXTERNA

Solo cuando el owner reactive PT y exista evidencia suficiente:

- seleccionar PT;
- sandbox;
- adapter real;
- pruebas DIAN/PT;
- reconciliación real;
- contingencias externas;
- límites/rate limits/SLA contractuales.

## ETAPA F — HARDENING

Demostrar:

- capacidad;
- seguridad;
- restore;
- rollback;
- observabilidad;
- costos;
- fallos deliberados;
- operación por una persona.

## ETAPA G — PILOTO/PRODUCCIÓN

No saltar directamente a escala.

Secuencia mínima:

```text
lab → 1 cliente → 3 → 5–10 → expansión gradual
```

Go-live requiere autorización explícita del owner.

---

# 8 FASES FUNCIONALES

Ejecutar siguiendo `docs/build/OFFICIAL-CONSTRUCTION-PLAN-V1.md`:

1. F1 Fundación técnica/local.
2. F2 Identidad, multitenancy y seguridad.
3. F3 Núcleo fiscal V1.
4. F4 Procesamiento durable, idempotencia y reconciliación.
5. F5 Provider boundary / ciclo PT-DIAN.
6. F6 Producto API comercial.
7. F7 Seguridad, capacidad, recuperación y operación.
8. F8 Piloto y producción.

Los módulos de `docs/build/INDEPENDENT-MODULES-V1.md` pueden explorarse/validarse aisladamente cuando ayude a reducir incertidumbre, pero el cierre de producción exige integración completa.

---

# PRIMERA EJECUCIÓN

Antes de escribir código nuevo:

1. leer todos los documentos autoritativos;
2. verificar estado real del código existente;
3. comparar código actual contra F1–F8 y M01–M12;
4. clasificar cada pieza como `KEEP`, `ADAPT`, `REWRITE` o `REMOVE`;
5. no borrar código útil solo porque sea anterior;
6. producir `docs/build/CURRENT-IMPLEMENTATION-MAP.md` con evidencia;
7. producir un backlog de implementación ordenado por dependencias;
8. identificar qué tests actuales siguen siendo válidos;
9. ejecutar baseline local sin cambiar comportamiento, si es posible;
10. comenzar F1 y cerrar su gate antes de declarar progreso a F2.

---

# REGLAS DE INTEGRIDAD

- Nunca retry ciego después de resultado ambiguo.
- Persistir intención/estado antes de side effect remoto.
- No mantener transacción DB abierta durante llamada PT.
- Un documento lógico debe tener una sola historia autoritativa.
- El scheduler/queue no define el estado fiscal.
- Los artifacts fiscales/evidencia no se regeneran si deben preservarse como recibidos/validados.
- La misma operación idempotente no se mide/cobra dos veces.
- No permitir acceso cross-tenant ni por UUID conocido.
- Sandbox y producción deben permanecer aislados.

---

# EVIDENCIA POR CIERRE DE FASE

Antes de marcar una fase `PASS`, registrar:

- commit SHA;
- archivos cambiados;
- comandos exactos ejecutados;
- tests PASS/FAIL;
- métricas relevantes;
- fallos simulados;
- limitaciones conocidas;
- gate actualizado;
- siguiente fase segura.

No usar frases como “debería soportar” como evidencia de capacidad.

---

# APROBACIONES EXTERNAS

Requieren owner:

- selección/contratación PT;
- gastos reales de nube/servicios;
- credenciales reales;
- piloto con clientes reales;
- precios/planes comerciales finales;
- producción/go-live;
- merge final a ramas protegidas;
- alcance final salud/transporte/otros verticales.

No detener trabajo local que no dependa de estas decisiones.

---

# CONDICIÓN DE TERMINACIÓN

La misión termina únicamente cuando:

1. todas las fases aplicables V1 están implementadas;
2. todos los gates internos aplicables están en PASS;
3. los gates externos pendientes están explícitamente identificados con evidencia faltante;
4. no existen contradicciones canónicas abiertas;
5. documentación y código están sincronizados;
6. el owner recibe un handoff exacto de qué está listo y qué acción externa falta.

`PRODUCTION READY: PASS` solo puede declararse cuando todos los gates de `docs/build/PRODUCTION-READINESS-GATES-V1.md`, incluyendo PT, capacidad, restore, seguridad, piloto, regulatory diff y autorización del owner, estén verdes.