# Auditoría integral de contexto — API-DIAN

**Fecha de corte:** 2026-10-18 (Colombia)  
**Repositorio auditado:** `Abraha33/API-Dian`  
**Rama de esta auditoría:** `audit/context-alignment-2026-10-18`  
**Limitación:** las conversaciones referenciadas como “Validación de demanda API DIAN” y “Resumen API DIAN” no pudieron abrirse desde esta sesión porque no está disponible el lector de hilos. Sus afirmaciones quedan **NO VERIFICADAS** hasta importar su contenido.

## Veredicto ejecutivo

El proyecto tiene un núcleo técnico real, probado y bien orientado para integridad fiscal: PostgreSQL, multitenencia, RLS, idempotencia, cola durable, worker, estados ambiguos, reconciliación simulada y pruebas de concurrencia.

El principal problema no es el código. Es una decisión de producto sin una única autoridad vigente:

| Fuente | Producto que define |
|---|---|
| `README.md`, `ROADMAP.md`, `docs/PRODUCT-DEFINITION-V1-FINAL.md` | API fiscal interna para nuestro POS; no API pública inicial |
| `docs/research/market/*` | API comercial para casas de software, ERP, POS y SaaS |
| Contexto conversacional visible | Se ha hablado de API comercial, investigación completa y eventualmente todos los servicios |

Esto debe resolverse antes de ampliar contratos, precios, onboarding, webhooks, dashboard o módulos fiscales.

## Lo que sí está comprobado

- El repositorio existe y tiene documentación extensa, ADR, migraciones y código ejecutable.
- La rama `fix/security-dependencies` pasó localmente build, unitarias, E2E, concurrencia, provider harness y lint.
- El núcleo fake vertical slice está implementado; el proveedor real todavía no.
- La selección HKA/DATAICO/Facture-ESTELA sigue siendo provisional; no hay contrato, sandbox ni comportamiento productivo confirmado en el repositorio.
- La investigación de mercado distingue correctamente entre evidencia pública, cotización privada, demanda propia y capacidad técnica.
- La investigación completa **no demuestra todavía** que existan 100 clientes pagadores ni que COP 5.000.000 de beneficio mensual sea alcanzable.

## Hallazgos críticos

### C1 — Producto ambiguo: severidad alta

El baseline vigente dice “POS propio” y excluye API pública, SDK, webhooks públicos y los servicios ampliados. La investigación posterior recomienda como beachhead casas de software con 5–30 NIT y una primera entrega comercial con FEV, NC, ND, DEE POS, webhooks y reconciliación.

**Impacto:** no se pueden considerar simultáneamente terminados el producto interno y el producto SaaS comercial. Cambian el contrato, autenticación, onboarding, soporte, precios, SLA, aislamiento, documentación y economía unitaria.

**Decisión recomendada:** mantener dos capas explícitas:

1. **Core técnico V1:** motor fiscal interno, independiente de quién lo consuma.
2. **Producto comercial futuro:** API multiempresa para terceros, sujeto a entrevistas, cotizaciones y piloto pagado.

No llamar “MVP comercial listo” al estado actual.

### C2 — Proveedor real bloqueado: severidad alta

El código usa `FakeFiscalProvider`. F4C/F6C siguen bloqueados por sandbox, contrato, credenciales, reconciliación, XML/PDF, soporte y precio del PT.

**Impacto:** todavía no existe una primera factura real verificable ante el proveedor seleccionado.

### C3 — CI de seguridad bloquea los PR: severidad alta

El PR #69 mejora dependencias, pero el CI sigue fallando porque NestJS 11 fija `fastify@5.11.3`. `npm audit` deja 1 vulnerabilidad alta y 1 moderada en producción. La corrección automática propone NestJS 12, que es un cambio mayor y no debe aplicarse a ciegas.

**Estado:** documentado en Issue #68. Requiere una decisión técnica separada: actualizar el stack mayor, obtener una versión compatible de NestJS 11 o aceptar formalmente el riesgo con controles compensatorios.

### C4 — Documentación e issues históricos desalineados: severidad media

Hay issues abiertos que describen Redis/MinIO, Prisma y arquitectura inicial, aunque el baseline actual los retiró del camino fiscal V1. No deben ejecutarse por estar abiertos.

**Acción recomendada:** cerrar, marcar obsoletos o vincular explícitamente los issues históricos al baseline actual.

### C5 — Acceso incompleto a conversaciones referenciadas: severidad media

No se pudo auditar literalmente el contenido de los dos chats referenciados. Sus decisiones no deben tratarse como autoridad hasta incorporarlas al repositorio o proporcionar el texto exportado.

## Qué no debe confundirse

- Investigación de oferta ≠ demanda pagada propia.
- API pública documentada ≠ contrato de reventa con un PT.
- Sandbox ≠ disponibilidad productiva ni SLA.
- Eventos RADIAN mencionados ≠ RADIAN completo.
- Suite comercial amplia ≠ alcance razonable de un MVP.
- Fake provider aprobado ≠ integración DIAN/PT real aprobada.
- Pruebas locales aprobadas ≠ CI aprobado si el gate de seguridad falla.

## Estado por dimensión

| Dimensión | Estado | Evidencia |
|---|---|---|
| Definición técnica del core | PASS | ADR, migraciones, código y pruebas |
| Modelo multitenant | PASS local / requiere vigilancia | RLS, FK tenant-safe, E2E |
| Flujo fake completo | PASS | E2E y worker |
| Idempotencia/concurrencia | PASS local | pruebas 4/4 |
| Proveedor real | BLOQUEADO | F4C/F6C pendientes |
| Investigación de mercado | PRELIMINAR ÚTIL | fuentes y gaps documentados |
| Demanda pagada propia | NO VERIFICADA | faltan entrevistas/pilotos |
| Economía de 100 clientes | HIPÓTESIS | faltan costos partner y soporte real |
| Seguridad CI | FAIL ACTUAL | audit high bloquea PR #69 |
| Producción | NOT READY | sin adapter real ni deployment productivo |

## Orden correcto de continuación

1. Decidir y registrar si el siguiente objetivo es **core interno POS** o **producto comercial externo**.
2. No ampliar servicios fiscales todavía por la sola existencia de oferta competitiva.
3. Cerrar F4C con un PT real: sandbox, contrato, precios, reconsulta, ambigüedad y soportes.
4. Resolver el bloqueo de dependencias sin aceptar una actualización mayor sin pruebas.
5. Ejecutar entrevistas, cotizaciones y al menos un piloto pagado.
6. Solo después definir el alcance comercial, precio y módulos de expansión.

## Conclusión

**Decisión recomendada: GO condicionado.** Hay base suficiente para continuar con el core técnico y discovery. No hay base suficiente para declarar listo un producto comercial completo ni para iniciar simultáneamente nómina, RADIAN avanzado, salud, transporte y todos los documentos equivalentes.

La mayor corrección necesaria es de gobierno del producto: una sola definición vigente, una sola hoja de ruta y una lista explícita de hipótesis todavía no demostradas.
