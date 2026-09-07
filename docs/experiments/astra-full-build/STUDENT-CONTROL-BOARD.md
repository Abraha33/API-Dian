# Tablero de control — API-DIAN Astra Full Build

Este es el artefacto principal para supervisar el experimento en lenguaje sencillo.

## Cómo leerlo

Cada fase responde tres preguntas:

1. **¿Qué estamos intentando lograr?**
2. **¿Cómo sé que sí se hizo?**
3. **¿Dónde está la evidencia?**

Una fase solo puede estar en `PASS` si tiene evidencia reproducible enlazada.

---

| Fase | En palabras simples | Qué tiene que quedar demostrado | Estado | Evidencia |
|---|---|---|---|---|
| 0. Aislamiento + harness | Crear el “laboratorio” donde Astra puede trabajar sin tocar lo estable | branch aislada, reglas, límites, plan de loops, evidencia y seguimiento | PASS | `README.md`, `EVIDENCE-RULES.md`, `EXPERIMENT-GOAL.md`, `status.json`, branch experimental |
| 1. Conceptualización ejecutable | Convertir arquitectura en contratos trazables | matriz requisito → implementación → prueba | PASS | `PHASE-1-TRACEABILITY.md` |
| 2. Testeo/aceptación | Demostrar comportamientos e invariantes | suites unitarias, provider, E2E y concurrencia | PASS | `PHASE-2-ACCEPTANCE-PLAN.md`, `LOCAL-EVIDENCE-2026-09-07.md` |
| 3. Construcción local | Construir la API V1 local | API, DB, worker y FakeFiscalProvider ejecutados | PASS | `LOCAL-EVIDENCE-2026-09-07.md`, `test/app.e2e-spec.ts` |
| 4. Integración E2E local | Conectar el flujo completo sin PT real | 11 pruebas E2E PASS con FakeFiscalProvider | PASS | `LOCAL-EVIDENCE-2026-09-07.md` |
| 5. Runner + containers + CI | Reproducir checkout, DB, migraciones y tests | Docker, migraciones, checkout limpio, build y suites locales PASS; runner/CI pendiente | IN PROGRESS | `LOCAL-EVIDENCE-2026-09-07.md`, `PHASE-5-6-FAULT-CAPACITY-2026-09-07.md`, `.github/workflows/ci.yml` |
| 6. Fallos + seguridad + capacidad | Atacar, recuperar y medir el sistema | concurrencia, crash, DB outage, restore y benchmark cubiertos; webhook/rollback y límites del PT pendientes | IN PROGRESS | `PHASE-2-ACCEPTANCE-PLAN.md`, `LOCAL-EVIDENCE-2026-09-07.md`, `PHASE-5-6-FAULT-CAPACITY-2026-09-07.md` |
| 7. Ready for PT Integration | Cerrar solo con Fases 0–6 PASS | bloqueada por Fases 5–6 | BLOCKED | depende de Fases 5–6 |
| 8. Integración PT real | Reemplazar el PT falso por el proveedor real sin cambiar la API pública | adapter real, sandbox, errores reales, reconciliación y contingencias PT | BLOCKED | requiere owner/PT |
| 9. Validación externa | Demostrar comportamiento con sistemas y condiciones reales | pruebas aplicables PT/DIAN, habilitación, piloto controlado | BLOCKED | requiere mundo externo |
| 10. Production readiness | Decidir responsablemente si se puede usar con documentos reales de clientes | todos los gates finales PASS + autorización del owner | BLOCKED | requiere fases previas |

---

## Semáforo del estudiante

### Verde — PASS

Significa:

> “No solo existe. Lo ejecutamos, intentamos romperlo y tenemos evidencia de que cumple lo que pedimos.”

### Amarillo — IN PROGRESS

Significa:

> “Hay trabajo real hecho, pero todavía falta alguna prueba o evidencia.”

### Rojo — BLOCKED

Significa:

> “No podemos continuar sin algo externo o sin cerrar una fase anterior.”

### Gris — NOT STARTED

Significa:

> “Todavía no se ha trabajado formalmente esa fase.”

---

# Reglas que el agente NO puede saltarse

1. No marcar `PASS` basándose en una explicación textual.
2. No marcar `PASS` porque compile solamente.
3. No marcar `PASS` porque los tests unitarios pasen si el gate exige E2E/fallos/carga.
4. Todo `PASS` debe citar commit, comando y resultado o artefacto equivalente.
5. Si una prueba falla, el tablero vuelve a `IN PROGRESS` o `BLOCKED`.
6. No ocultar tests fallidos.
7. No modificar `dev`.
8. No mezclar cambios del experimento con ramas canónicas.
9. No conectar PT real hasta `READY FOR PT INTEGRATION: PASS` y autorización del owner.
10. No declarar `PRODUCTION READY` sin evidencia externa, seguridad, restore, capacidad y piloto.

---

# Qué quiero ver yo como estudiante al cerrar cada fase

Cada cierre debe terminar con un resumen máximo de una pantalla:

```text
FASE: 3 — Construcción local
ESTADO: PASS

¿Qué significa?
La API completa ya puede levantarse localmente.

¿Qué probamos?
- API arranca
- DB migra
- worker procesa
- documento cambia de estado
- webhook fake recibe resultado

¿Qué salió mal y se corrigió?
- ...

Evidencia:
- commit: ...
- comando: ...
- tests: ...
- reporte: ...

Siguiente fase:
4 — Integración E2E local
```

Este formato es obligatorio para los cierres de fase.
