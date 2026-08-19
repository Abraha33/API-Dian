# API-DIAN — Mapa de dependencias V1

**Estado:** FROZEN / baseline de dependencias  
**Fecha:** 2026-08-19  
**Fuente:** `docs/BACKLOG-V1.md`

## 1. Camino principal

```text
B0 planificación
 ↓
B1 baseline ejecutable
 ↓
B2 multiempresa/auth/perfil fiscal
 ↓
B3 contrato fiscal/validación
 ↓
B4 idempotencia/persistencia/estados
 ↓
B5 worker/trabajo durable/side-effect boundary
 ↓
B6 UNKNOWN/reconcile/fake/fault injection
 ↓
B7 evidencia/artefactos/operación
 ↓
B8 gate PT real
 ↓
B9 adapter PT real/contingencias
 ↓
B10 plataforma productiva/restore
 ↓
B11 integración POS
 ↓
B12 validación adversarial integral
 ↓
B13 piloto
 ↓
B14 cierre V1
```

Este es el **camino crítico conceptual**. Una fase puede preparar partes en paralelo, pero no puede declarar cerrado su gate si dependen de una fase anterior no demostrada.

---

## 2. Dependencias fuertes por fase

| Fase | Depende de | Razón |
|---|---|---|
| B1 | B0 | Debe existir arquitectura antes de preparar el baseline definitivo. |
| B2 | B1 | Aislamiento/auth necesitan runtime, DB y migraciones reproducibles. |
| B3 | B1 + decisiones de producto | El contrato puede diseñarse en paralelo parcial con B2, pero su integración real necesita tenant/perfil. |
| B4 | B2 + B3 | Idempotencia necesita identidad tenant y comando semántico estable. |
| B5 | B4 | El worker procesa operaciones durables ya definidas. |
| B6 | B5 | UNKNOWN/reconcile necesita frontera de side effect e attempts. |
| B7 | B4 + B5 + B6 | Evidencia y operación deben observar el ciclo completo. |
| B8 | producto/arquitectura; puede empezar administrativamente antes | Es externo; no necesita esperar todo B1–B7 para pedir acceso, pero sus pruebas técnicas aprovechan el harness B6/B7. |
| B9 | B6 + B7 + B8 PASS | No se construye adapter real sin puerto/harness y evidencia PT. |
| B10 | B7 + B9 | Plataforma productiva debe desplegar una integración real ya probada. |
| B11 | B3 + B4 + B9 + B10 | El POS necesita contrato estable, estados reales y endpoint productivo. |
| B12 | B10 + B11 | E2E adversarial requiere sistema completo integrado. |
| B13 | B12 PASS | No piloto con invariantes críticos sin demostrar. |
| B14 | B13 PASS | Readiness se basa en evidencia real del piloto. |

---

## 3. Paralelismo permitido

### Pista A — Núcleo interno

```text
B1 → B2 → B3 → B4 → B5 → B6 → B7
```

B2 y parte de B3 pueden solaparse en diseño/pruebas unitarias, pero B4 no se cierra hasta que ambos estén estables.

### Pista B — Proveedor externo

Puede comenzar durante B1–B7:

```text
solicitudes HKA/DATAICO
→ documentación
→ sandbox/credenciales
→ contrato/precio
```

Las pruebas de ambigüedad profundas de B8 son más eficientes cuando B6 ya tiene harness común.

### Pista C — Preparación operativa

Runbooks/documentación pueden escribirse progresivamente, pero solo se validan/cerran cuando existe el comportamiento real que describen.

---

## 4. Gates duros

### G1 — Aislamiento

B2 no pasa si tenant A puede leer, relacionar o mutar datos de B.

### G2 — Idempotencia

B4 no pasa si dos requests concurrentes pueden crear dos operaciones lógicas para la misma intención.

### G3 — Side effect único

B5 no pasa si controller/API u otra ruta puede mutar PT por fuera del worker.

### G4 — Incertidumbre segura

B6 no pasa si un timeout ambiguo puede terminar en submit automático sin reconciliación.

### G5 — PT compatible

B8 no pasa si el proveedor no permite resolver suficientemente la ambigüedad o si la práctica es “vuelva a enviar y mire qué pasa”.

### G6 — Adapter basado en evidencia

B9 no pasa con mappings inventados, semántica no documentada o criterios `PROVEN_NOT_SENT`/`NOT_FOUND_CONCLUSIVE` no demostrados.

### G7 — Restore seguro

B10 no pasa hasta ejecutar restore real y tratar la posible divergencia frente al PT.

### G8 — POS seguro ante UNKNOWN

B11 no pasa si el POS crea una intención nueva para resolver un estado desconocido de la misma venta.

### G9 — Adversarial

B12 no pasa con fallos críticos abiertos de duplicación, aislamiento, pérdida de evidencia, secretos o recuperación.

### G10 — Piloto sostenible

B13 no pasa si la operación exige intervención humana rutinaria o la incertidumbre no es manejable.

---

## 5. Dependencias internas de alto riesgo

```text
credential → tenant
        ↓
versioned fiscal profile
        ↓
semantic command
        ↓
semantic hash + idempotency
        ↓
fiscal operation
        ↓
durable work
        ↓
provider attempt
        ↓
remote submit
        ↓
definitive result OR UNKNOWN
        ↓
reconcile
        ↓
evidence + artifacts + POS state
```

Romper el orden anterior puede introducir duplicados, cruce de empresas o imposibilidad de auditoría.

---

## 6. Dependencias que NO deben crearse

Quedan prohibidas en V1 sin reabrir arquitectura:

- API fiscal → Redis como autoridad;
- dominio fiscal → SDK/códigos propietarios del PT;
- controller HTTP → submit PT;
- POS → endpoint directo PT;
- tenant → rama/fork de código propio;
- artifact retrieval → nueva emisión;
- restore DB → reemisión automática de faltantes;
- UNKNOWN → retry mutante automático;
- B9 adapter real → suposiciones de documentación pública no validada.

---

## 7. Hitos de construcción

### Hito H1 — Core local seguro

B1–B4 PASS.

El sistema puede recibir una intención, autenticarla, aislarla, validarla, persistirla e idempotentizarla sin PT.

### Hito H2 — Motor de side effects seguro con fake

B5–B7 PASS.

El sistema demuestra incertidumbre/reconciliación y evidencia usando fake, sin depender del proveedor real.

### Hito H3 — PT seleccionado e integrado

B8–B9 PASS.

Existe un único adapter real respaldado por sandbox/contrato/evidencia.

### Hito H4 — Servicio productivo integrado con POS

B10–B11 PASS.

Existe deployment recuperable y flujo POS real.

### Hito H5 — V1 demostrada

B12–B14 PASS.

El sistema sobrevivió pruebas adversariales, piloto y gate final.

---

## 8. Regla para el plan diario

El plan diario debe respetar este mapa. Una tarea puede adelantarse si no depende de comportamiento aún desconocido, pero **nunca se marca DONE una capacidad cuyo gate depende de evidencia que todavía no existe**.

El plan diario priorizará primero el camino crítico y utilizará tareas paralelas externas solo cuando reduzcan un bloqueo futuro real.
