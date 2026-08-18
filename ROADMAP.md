# Roadmap API-DIAN

**Corte:** 2026-08-18  
**Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

Este roadmap reemplaza el orden experimental anterior. La API V1 ya no se trata como un SKU externo que deba validarse con publicidad antes de construirla: en V1 es infraestructura fiscal interna del POS propio.

## Modelo congelado para V1

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

Restricciones no negociables durante V1:

- una sola persona desarrolla, mantiene y opera inicialmente;
- un solo PT;
- sin integración directa con DIAN;
- sin custodia propia de certificados si el PT permite delegarla de forma contractual y segura;
- sin API pública, SDK ni webhooks públicos;
- sin segundo PT ni failover multi-PT;
- sin forks ni personalizaciones por cliente;
- seguridad, integridad fiscal y trazabilidad por encima de velocidad de entrega.

## Estado actual

```text
F0  Baseline de producto y validación        ✅ Cerrado
F1  Requisitos V1                            ✅ Cerrado para arquitectura
F2  Arquitectura formal y ADR                ▶ Siguiente
F3  Modelo de datos + seguridad/amenazas     ⏸ Pendiente
F4  Contratos internos + selección del PT    ⏸ Pendiente
F5  Pruebas, contingencia y operación        ⏸ Pendiente
F6  Implementación incremental               ⏸ Pendiente
F7  Readiness + piloto controlado con POS     ⏸ Pendiente
F8  Estabilización + decisión V1.1            ⏸ Pendiente
```

## F0 — Baseline de producto y validación

**Estado: ✅ Cerrado**

Salida autoritativa:

- `docs/f0-producto-v1-validado-2026-08-18.md`.

La validación de mercado, regulación, competencia y operabilidad ya produjo una decisión de producto suficiente para continuar. Los documentos anteriores de “modelo experimental” y “fogueo de mercado” se conservan como evidencia histórica, no como autoridad del alcance V1.

## F1 — Requisitos V1

**Estado: ✅ Cerrado para arquitectura**

Salida:

- `docs/v1-requisitos.md`.

Objetivo cumplido: fijar qué debe hacer V1, sus invariantes de seguridad y confiabilidad, lo que queda fuera y los gates previos a producción, sin decidir prematuramente tecnologías que corresponden a F2.

“Cerrado para arquitectura” no significa “autorizado para producción”. La salida a producción sigue condicionada a PT seleccionado, evidencia regulatoria vigente, threat model, pruebas de recuperación y pruebas de contingencia.

## F2 — Arquitectura formal y ADR

**Estado: ▶ Siguiente**

Objetivo:

- convertir los requisitos V1 en una arquitectura mínima operable por una sola persona;
- revalidar o reemplazar ADR-001 y ADR-002;
- decidir monolito modular, límites internos, despliegue, persistencia, async, storage y observabilidad;
- evitar componentes distribuidos sin necesidad demostrada;
- definir explícitamente los puntos de side effect fiscal y sus garantías de idempotencia/reconciliación.

Regla:

```text
No se introduce infraestructura adicional solo porque ya aparezca en un ADR histórico o en el código.
Cada componente debe justificar su coste operativo contra un requisito V1.
```

## F3 — Modelo de datos + seguridad y amenazas

**Estado: ⏸ Pendiente**

Objetivo:

- modelo transaccional y de evidencia fiscal;
- aislamiento multiempresa;
- modelo de idempotencia;
- máquina de estados persistida;
- auditoría append-only donde corresponda;
- retención de respuestas crudas y artefactos;
- threat model, secretos, credenciales del PT y privilegios mínimos;
- estrategia de backup/PITR y restauración.

## F4 — Contratos internos + evaluación y selección del PT

**Estado: ⏸ Pendiente**

Objetivo:

- contrato interno estable POS → API fiscal;
- interfaz mínima `FiscalProvider`;
- contrato de errores y estados;
- contrato de recuperación XML/PDF;
- matriz de evaluación del PT;
- validar sandbox, multiempresa/NIT, firma/certificados, estados, reconciliación, contingencias, SLA, límites, precio, soporte y tratamiento de datos.

No se implementa lógica fiscal productiva contra un PT hasta cerrar esta fase.

## F5 — Pruebas, contingencia y operación

**Estado: ⏸ Pendiente**

Objetivo:

- matriz de pruebas funcionales y adversariales;
- pruebas de timeout ambiguo;
- pruebas de duplicación/reintentos;
- contingencias FEV/DEE POS según causa;
- reconciliación automática;
- runbooks mínimos;
- restauración real desde backup/PITR;
- alertas accionables y criterios de escalamiento.

## F6 — Implementación incremental

**Estado: ⏸ Pendiente**

Orden recomendado:

1. espina dorsal: tenant/auth, idempotencia, estados, auditoría, observabilidad y `FiscalProvider`;
2. vertical slice FEV en sandbox;
3. Nota Crédito y Nota Débito;
4. DEE POS y nota de ajuste;
5. XML/PDF y consultas de estado;
6. contingencias y reconciliación completa de V1;
7. endurecimiento de seguridad y operación.

Cada incremento debe cerrar con pruebas automatizadas y evidencia. No se habilitan varias familias fiscales en paralelo si una sola persona no puede diagnosticar fallos de la anterior.

## F7 — Readiness y piloto controlado con el POS propio

**Estado: ⏸ Pendiente**

Objetivo:

- ejecutar gates de producción definidos en `docs/v1-requisitos.md`;
- activar un número pequeño y controlado de empresas propias/designadas;
- observar errores, latencia del PT, estados ambiguos y carga operativa;
- demostrar que la operación cotidiana no depende de intervención manual permanente.

No existe SLA público externo en esta fase.

## F8 — Estabilización y decisión V1.1

**Estado: ⏸ Pendiente**

Solo después de estabilidad real se decide la expansión.

Compiten por prioridad, según evidencia:

- panel/observabilidad mejorada;
- onboarding más automatizado;
- multi-NIT más robusto;
- Documento Soporte;
- recepción/eventos;
- SDKs;
- integraciones e-commerce;
- apertura controlada a terceros;
- segundo PT.

La antigua prueba de “fogueo de mercado” puede reutilizarse aquí si se evalúa abrir la API como producto externo. Ya no bloquea la construcción de la infraestructura fiscal necesaria para el POS propio.

## Regla de control de alcance

Una tarea entra en V1 solo si satisface al menos una de estas condiciones:

1. es necesaria para uno de los documentos fiscales V1;
2. evita pérdida, duplicación o ambigüedad fiscal;
3. es necesaria para aislamiento, seguridad, auditoría, recuperación u operación unipersonal;
4. es un requisito contractual/técnico indispensable del PT seleccionado.

Si no cumple una de ellas, se difiere.