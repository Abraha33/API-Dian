# F0 — Baseline validado de producto API-DIAN

**Fecha de corte:** 2026-08-18  
**Estado:** definición y validación de producto cerradas para continuar diseño.  
**Autoridad:** este documento consolida las decisiones derivadas de cinco rondas de investigación: producto/mercado, auditoría adversarial, regulación, competencia y operabilidad para una sola persona.

## 1. Decisión de producto

El producto inicial es una **API fiscal interna para comercio colombiano**, cuyo primer consumidor será el POS de venta rápida construido en paralelo.

Flujo inicial:

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

La API debe diseñarse como un componente reutilizable e independiente del POS, pero **no se lanzará inicialmente como producto comercial externo**. La apertura a desarrolladores, ERP, POS y software houses queda condicionada a evidencia de demanda pagada y capacidad operativa.

## 2. Prioridades cerradas

1. Mercado inicial: **comercio colombiano**.
2. Primer consumidor técnico: **POS propio de venta rápida**.
3. Segundo mercado futuro: desarrolladores, casas de software, ERP, POS y e-commerce.
4. Una sola persona desarrolla, mantiene y opera inicialmente.
5. No convertirse inicialmente en Proveedor Tecnológico.
6. Utilizar un PT habilitado como capa fiscal regulada.
7. Un solo PT en V1.
8. No custodiar certificados digitales de clientes en V1 si el PT permite delegar esa función de forma contractual y segura.
9. No integración directa con DIAN en V1.
10. No personalizaciones ni forks por cliente.

## 3. V1 fiscal cerrada

La V1 soportará únicamente:

1. Factura Electrónica de Venta (FEV).
2. Nota Crédito.
3. Nota Débito.
4. Documento Equivalente Electrónico POS.
5. Nota de ajuste del DEE POS.
6. Contingencias necesarias de FEV.
7. Contingencias necesarias de DEE POS.
8. Consulta y seguimiento de estado.
9. Recuperación del XML validado.
10. Recuperación de la representación gráfica/PDF entregada por el PT.

## 4. Capacidades técnicas obligatorias desde V1

Estas capacidades no son productos DIAN adicionales; son parte del núcleo seguro:

- autenticación y aislamiento por empresa/tenant;
- contrato fiscal interno uniforme;
- validaciones previas;
- idempotencia;
- máquina de estados con estado explícito de respuesta desconocida;
- auditoría y trazabilidad append-only donde corresponda;
- conservación de respuestas crudas del PT;
- reconciliación básica automática contra el PT;
- observabilidad y alertas;
- multiempresa;
- adaptador interno mínimo `FiscalProvider` para aislar el PT concreto.

Principio crítico:

```text
DESCONOCIDO != REEMITIR
```

Ante timeout o respuesta ambigua, se reconcilia antes de intentar una nueva emisión.

## 5. Qué hace nuestra API

Nuestra capa es responsable de:

- recibir el flujo del POS;
- autenticar y autorizar;
- separar tenants;
- normalizar el modelo de entrada;
- validar estructura y reglas conocidas;
- garantizar idempotencia;
- mantener estados y evidencia;
- transformar hacia el contrato del PT;
- conservar la respuesta original del PT;
- reconciliar estados ambiguos;
- devolver un contrato estable al POS.

No debe convertirse en un proxy ciego, pero tampoco duplicar funciones fiscales que el PT ya ejecuta de forma segura y regulada.

## 6. Qué se delega al Proveedor Tecnológico

En el modelo inicial, el PT ejecutará las funciones fiscales contratadas que correspondan, incluyendo generación/transmisión y, cuando el modelo contractual lo permita, firma y manejo del certificado.

La selección del PT debe verificar explícitamente:

- habilitación vigente;
- contrato permitido para nuestro modelo;
- operación multiempresa/NIT cuando aplique;
- API y sandbox;
- límites y rate limits;
- estados y reconciliación;
- contingencias;
- firma/certificados;
- SLA y soporte;
- precios y escalamiento;
- tratamiento y custodia de datos.

No asumir que todos los PT ofrecen la misma modalidad.

## 7. Fuera de V1

Quedan expresamente fuera:

- API pública para terceros;
- SDK público;
- webhooks públicos para integradores;
- Documento Soporte;
- recepción/eventos;
- nómina electrónica;
- RADIAN completo;
- salud/RIPS;
- transporte/RNDC;
- otros DEE sectoriales;
- segundo PT;
- failover multi-PT;
- integración directa con DIAN;
- custodia propia de certificados;
- generación propia de PDF;
- ERP;
- contabilidad;
- CRM;
- personalizaciones o forks por cliente.

## 8. V1.1 no se congela todavía

No se asume que agregar más documentos DIAN sea la mejor expansión.

Después de estabilizar V1 competirán por prioridad, según evidencia real:

- observabilidad/panel de estados;
- onboarding más automatizado;
- multi-NIT más robusto;
- SDKs;
- Documento Soporte;
- recepción/eventos;
- integraciones e-commerce;
- reconciliación más avanzada;
- apertura controlada a design-partners.

Se implementará primero aquello con mejor relación **valor real / mantenimiento / riesgo**.

## 9. Decisión comercial

La API **no es inicialmente un SKU externo**.

Durante la primera etapa:

```text
Producto comercial → POS de venta rápida
Infraestructura estratégica → API fiscal
```

Solo se evaluará apertura externa cuando exista pull de mercado verificable. La hipótesis de que desarrolladores pagarían por una capa adicional sobre un PT sigue sin demostrarse.

## 10. Límite para una sola persona

La investigación concluye que una persona puede desarrollar y operar este alcance con prudencia **solo si la arquitectura y la operación son deliberadamente austeras y automatizadas**.

Restricciones operativas:

- servicios administrados;
- monolito modular como opción de referencia, sujeto a ADR posterior;
- base de datos administrada;
- una única fuente transaccional;
- sin Kubernetes/microservicios prematuros;
- sin broker complejo si una cola transaccional simple resuelve el problema;
- reintentos y reconciliación automáticos;
- backups/PITR y restauración probada;
- observabilidad con pocas alertas accionables;
- firma/certificados delegados al PT siempre que sea viable;
- operación normal sin intervención humana cotidiana.

Abrir una API pública con SLA, múltiples PT o dominios adicionales cambia este veredicto y probablemente exige más de una persona.

## 11. Decisiones regulatorias conservadoras

- API no equivale a Proveedor Tecnológico; son conceptos distintos.
- No se debe asumir que una capa SaaS puede ejecutar cualquier función fiscal solo porque use el NIT del cliente.
- La arquitectura contractual real con el PT debe revisarse antes de producción.
- No custodiar certificados reduce significativamente el perfil de riesgo.
- Las contingencias deben modelarse según su causa; no todo fallo técnico es la misma contingencia fiscal.
- Hechos regulatorios deben mantenerse separados de recomendaciones de ingeniería.

## 12. Arquitectura conceptual congelada

```text
[POS]
   ↓
[API fiscal propia]
   ├─ autenticación / tenant
   ├─ validación
   ├─ idempotencia
   ├─ estados
   ├─ auditoría
   ├─ reconciliación
   └─ FiscalProvider
          ↓
[Proveedor Tecnológico habilitado]
          ↓
[DIAN]
```

`FiscalProvider` será inicialmente una interfaz mínima con **un solo adaptador concreto**. No se construye failover ni un motor genérico multi-PT.

## 13. Riesgos que gobiernan el diseño

1. Duplicar documentos fiscales.
2. Estados ambiguos después de timeout.
3. Caídas prolongadas de PT/DIAN.
4. Bus factor = 1.
5. Fuga de datos entre tenants.
6. Cambios regulatorios/anexos.
7. Cambios incompatibles de API del PT.
8. Pérdida o corrupción de datos.
9. Compromiso de credenciales.
10. Expandir el producto más rápido de lo que una persona puede operarlo responsablemente.

## 14. Próximo proceso

La fase de definición del producto termina aquí.

El orden recomendado para continuar es:

```text
1. Requisitos V1
2. Arquitectura formal / ADR
3. Modelo de datos
4. Modelo de seguridad y amenazas
5. Contratos internos/API
6. Evaluación y selección del PT inicial
7. Plan de pruebas y contingencia
8. Implementación incremental
```

Antes de construir lógica fiscal real, reconciliar este baseline con `ROADMAP.md` y los ADR existentes para evitar que documentación anterior contradiga las decisiones validadas.

## 15. Prompt de reanudación para otro chat

```text
Quiero continuar el proyecto API-DIAN desde el baseline validado del 18 de agosto de 2026.

Repositorio: Abraha33/API-Dian
Rama base: dev
Documento maestro de entrada: docs/f0-producto-v1-validado-2026-08-18.md

No reconstruyas la definición del producto desde cero ni vuelvas a debatir decisiones cerradas salvo evidencia nueva fuerte. Lee también README.md, ROADMAP.md, docs/session-context.md y los ADR vigentes para detectar contradicciones.

Estado: producto V1 definido y validado mediante cinco rondas independientes (producto/mercado, adversarial, jurídica, comercial y técnica/operativa). La API será inicialmente infraestructura interna del POS de comercio, usará un solo Proveedor Tecnológico habilitado y no será pública en V1.

Continúa con el siguiente proceso: reconciliar el roadmap existente con este baseline y después cerrar los requisitos V1 antes de diseñar la arquitectura formal. Mantén como restricción principal que una sola persona desarrollará, mantendrá y operará inicialmente el sistema, con seguridad e integridad fiscal por encima de velocidad.
```
