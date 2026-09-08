# Solicitud de integración PT real — The Factory HKA Colombia S.A.S.

**Estado del gate:** Fase 7 (Ready for PT Integration) = **PASS**.
Este documento es el paquete concreto que el owner necesita para
autorizar y ejecutar Fase 8 (Integración PT real). No se conecta nada
real sin autorización explícita del owner (regla no negociable).

Sintetiza y prioriza `docs/f4c-cuestionario-solicitud-sandbox-pt.md`
(cuestionario completo, sigue vigente palabra por palabra) y
`docs/f4-matriz-seleccion-pt-v1.md` (evidencia pública ya recolectada
sobre HKA) en una lista de acción concreta, más la batería de pruebas
exacta que Fase 8 debe re-ejecutar contra el adapter real.

---

## 1. Documentación técnica requerida de HKA

- [ ] Manual de integración directa vigente (ya se referenció
      públicamente: `felcowiki.thefactoryhka.com.co` — confirmar versión
      vigente y pedir acceso completo, no solo el índice).
- [ ] Especificación de payload/schema exacto para: FEV, Documento
      Equivalente Electrónico POS, Nota Crédito, Nota Débito, Nota de
      Ajuste POS.
- [ ] Especificación de respuesta por cada operación (éxito, rechazo
      determinista, error de validación, error transitorio).
- [ ] Documentación de campos estables entre submit → consulta → XML →
      PDF (necesario para nuestra reconciliación — ver ADR-004).
- [ ] Documentación de límites de tamaño de payload, líneas por
      documento, adjuntos si aplica.
- [ ] Documentación de capability map por familia/versión de documento
      (quién ejecuta XML, firma, numeración, submit, status, PDF,
      entrega, contingencia, almacenamiento) — requerido por
      `docs/architecture/final/PROCESSING-QUEUES-WEBHOOKS.md` antes de
      dar cualquier capacidad por soportada.
- [ ] Documentación del protocolo de contingencia DIAN (qué hacer si
      DIAN está caída) y cómo HKA lo señala.

## 2. Acceso sandbox

Usar el cuestionario completo (`f4c-cuestionario-solicitud-sandbox-pt.md`
secciones 1–2) tal cual. Puntos que bloquean el arranque de Fase 8 si no
se responden:

- [ ] ¿Existe sandbox/DEMO aislado para integradores? ¿Cómo se solicita?
- [ ] ¿El sandbox conecta a un ambiente DIAN de habilitación real o a un
      simulador del propio PT? (determina si nuestras pruebas de
      contingencia DIAN son reales o simuladas).
- [ ] ¿Cuánto tarda el alta del sandbox una vez solicitado?
- [ ] ¿Asignan contacto técnico dedicado durante la integración?
- [ ] ¿El sandbox tiene los mismos límites de tasa que producción, o son
      distintos? (afecta directamente si el benchmark de Fase 6 —
      ~130 docs/s de intake sostenido — es representativo o no contra el
      PT real).

## 3. Credenciales y certificados

- [ ] Proceso exacto de emisión de credenciales de sandbox (¿API
      key/secret? ¿mTLS? ¿certificado de firma digital propio o
      gestionado por HKA?).
- [ ] ¿Las credenciales de prueba pertenecen al integrador, al
      contribuyente de prueba, o a ambos? (Nuestro modelo de tenant es
      tenant+organization+application+environment — ADR-011 — necesita
      saber dónde vive cada credencial de HKA en ese árbol).
- [ ] ¿Certificado de firma lo gestiona HKA o debemos aportar uno propio
      por contribuyente? Si es propio: formato exacto (.p12, vigencia,
      proceso de renovación).
- [ ] Confirmar que sandbox y producción de HKA usan credenciales/DB/
      certificados completamente separados (nuestro propio invariante,
      ADR-006 / GOAL.md — sandbox y producción no comparten nada).

## 4. Endpoints y contrato técnico

- [ ] Lista completa de endpoints sandbox (submit, status/consulta,
      descarga XML, descarga PDF, anulación/notas si aplica).
- [ ] Protocolo exacto: ¿SOAP/XML, REST/JSON, o ambos según operación?
      (GOAL.md exige que si el PT solo habla SOAP/XML, eso vive detrás
      del adapter — nunca se expone al cliente público de API-DIAN).
- [ ] ¿HKA soporta webhooks/callbacks push, o solo consulta activa
      (polling)? Si soporta push: formato del payload, mecanismo de
      firma/autenticación del callback, garantías de entrega (¿al menos
      una vez? ¿reintenta HKA si nuestro endpoint falla?). Esto determina
      si nuestro módulo de webhooks (ya implementado, Fase 6 PASS) actúa
      como única fuente de push hacia el cliente final, o si necesita un
      adapter adicional para traducir push-de-HKA → nuestro evento
      normalizado.

## 5. Rate limits a confirmar

- [ ] Límite de requests por segundo/minuto en sandbox.
- [ ] Límite de requests por segundo/minuto en producción.
- [ ] ¿El límite es por credencial, por contribuyente, o global de
      cuenta?
- [ ] Comportamiento exacto al exceder el límite (¿429? ¿qué header de
      retry-after?) — nuestro `WebhookSenderService`/fiscal worker ya
      tratan 429 como reintentable; confirmar que HKA usa el mismo
      código.
- [ ] ¿El rate limit de sandbox es representativo del de producción, o
      mucho más bajo? (si es mucho más bajo, el benchmark de Fase 6 no es
      transferible 1:1 y hay que volver a correrlo contra el sandbox real
      antes de comprometerse con una capacidad).

## 6. SLA

- [ ] SLA de disponibilidad del servicio HKA (uptime comprometido).
- [ ] SLA de tiempo de respuesta típico/máximo por operación (submit,
      consulta).
- [ ] Ventana típica/máxima de propagación cuando un resultado queda
      ambiguo (necesario para calibrar nuestro `WORKER_RECONCILE_RETRY_SECONDS`
      / `WORKER_RECONCILE_MAX_ATTEMPTS` reales, hoy calibrados solo contra
      `FakeFiscalProvider`).
- [ ] Proceso y tiempos de escalamiento/soporte ante incidente.
- [ ] Política de mantenimiento programado (¿avisan con anticipación?
      ¿ventanas conocidas?).

## 7. Preguntas contractuales

- [ ] Modelo de precio: por documento, por volumen, por contribuyente
      registrado, mixto.
- [ ] Costo de onboarding por contribuyente/empresa.
- [ ] ¿Soporta modelo integrador/multiempresa nativamente, o cada
      contribuyente final necesita su propio contrato directo con HKA?
      (Esto es central para nuestro modelo multitenant — necesitamos
      saber si HKA ve "un integrador con N contribuyentes" o si cada
      tenant nuestro necesita gestión contractual separada con HKA).
- [ ] Condiciones de salida/portabilidad (¿podemos migrar contribuyentes
      a otro PT sin penalidad? ¿HKA retiene datos/certificados de forma
      que dificulte la salida?).
- [ ] Mínimos contractuales (volumen mínimo, plazo mínimo).
- [ ] ¿Quién es responsable frente a DIAN si HKA tiene un incidente que
      causa una obligación fiscal incumplida del contribuyente?

## 8. Preguntas técnicas específicas de ambigüedad (críticas)

Usar el cuestionario completo, sección 4 completa
(`f4c-cuestionario-solicitud-sandbox-pt.md`, secciones 3 y 4) — es el
núcleo que protege el invariante `UNKNOWN != REEMITIR` que este
experimento probó exhaustivamente contra `FakeFiscalProvider`. Sin
respuesta verificada de HKA para las 3 sub-preguntas de la sección 4
(timeout antes de recibir / recibido pero no enviado a DIAN / enviado
pero sin respuesta concluyente), **no se debe implementar el adapter
real**, sin importar cuánta presión de negocio exista — es exactamente el
tipo de decisión que ADR-004 y ADR-009 protegen.

---

## 9. Batería de pruebas exacta que Fase 8 debe re-ejecutar

Todo lo que Fase 6 probó contra `FakeFiscalProvider` y contra el sender
HTTP local de webhooks debe volver a probarse contra HKA real en sandbox,
adaptando solo el transporte (nunca el invariante):

### Fiscal (equivalente a `app.e2e-spec.ts` / `fault-injection.e2e-spec.ts`)
1. Submit exitoso → `ACCEPTED`, evidencia (CUFE/CUDE, XML, PDF) recuperable.
2. Rechazo determinista de DIAN → `REJECTED_REMOTE`, sin reintento
   automático.
3. Timeout antes de que HKA reciba el request → clasificado
   `TRANSPORT_PROVEN_NOT_SENT` si es demostrable, o `UNKNOWN` si no.
4. Timeout/ambigüedad después de un posible envío → `UNKNOWN`, jamás
   reintento automático de submit (`UNKNOWN != REEMITIR`), solo
   reconciliación vía consulta.
5. Reconciliación exitosa tras `UNKNOWN` → resuelve a estado final sin
   generar un segundo `provider_attempt`.
6. Reconciliación agotada (HKA no resuelve en la ventana esperada) →
   `NEEDS_ATTENTION`, alertable, no perdido.
7. Rate limit de HKA (429 real) → reintento con backoff, no error fatal.
8. Caída real de HKA (no simulada) → circuit breaker / backoff, cola no
   pierde orden ni duplica.
9. Idempotency-Key concurrente contra el submit real de HKA — mismo
   comportamiento que la prueba local (exactamente 1 operación, 1
   intento).
10. UUID/referencia ajena rechazada sin fuga de información (ya cubierto
    a nivel API-DIAN; confirmar que HKA tampoco filtra existencia cruzada
    en sus propias consultas).

### Webhooks (equivalente a `webhooks.e2e-spec.ts`)
11. Si HKA empuja notificaciones propias: verificar que nuestro adapter
    las traduce al envelope normalizado (`document.accepted`, etc.) antes
    de que lleguen a `app.webhook_deliveries` — nunca reenviar el
    payload crudo de HKA al cliente final (GOAL.md: no exponer contratos
    propietarios de PT).
12. Repetir los 11 escenarios de fault injection de webhooks de Fase 6
    (200/400/500/timeout/connection-refused/retries/backoff/dead-letter/
    dos-endpoints/recuperación/aislamiento-multitenant) contra un
    endpoint de cliente real de prueba, con el evento real disparado por
    un documento fiscal real de sandbox — no hace falta reinventar la
    prueba, solo cambiar el origen del evento de `FakeFiscalProvider` a
    HKA sandbox.

### Capacidad
13. Repetir el benchmark extendido (`fiscal-throughput-bench.mjs`) contra
    el sandbox de HKA, respetando su rate limit real (sección 5) — el
    punto de saturación de Fase 6 (~75 de concurrencia, agotamiento del
    pool de conexiones local) es válido para nuestra infraestructura,
    pero el techo real de throughput hacia HKA depende de SU rate limit,
    no del nuestro, y debe medirse de nuevo.

---

## 10. Regla de cierre

Fase 8 no empieza sin: (a) autorización explícita y por escrito del owner
para conectar HKA real, (b) respuestas verificadas a las secciones 1–8 de
este documento, (c) sandbox HKA accesible y probado con al menos los
puntos 1–6 de la sección 9. No se declara ninguna sub-fase de integración
PT en PASS basándose en documentación pública o en promesas comerciales —
solo con sandbox real y evidencia reproducible, exactamente el mismo
estándar que este experimento aplicó a sí mismo en Fases 0–6.
