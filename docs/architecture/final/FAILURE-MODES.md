# Failure modes y mitigaciones

| Falla | Riesgo | Detección | Mitigación / recuperación |
|---|---|---|---|
| DIAN caída | backlog/incumplimiento | latencia, error rate, comunicado/PT | circuit breaker, cola, contingencia solo si aplica, reconciliar al volver |
| Timeout DIAN/PT | duplicado por retry | intento sin resultado final | `unknown`, no resend, query/reconcile por correlación |
| Respuesta inconsistente | estado incorrecto | schema/invariant mismatch | guardar raw seguro, quarantine, adapter error, alerta y reconciliación |
| Documento duplicado cliente | doble emisión | idempotency key/hash/ref | devolver original o 409; unique constraints |
| Retry duplicado worker | side effect doble | lease/attempt/correlation | persist-before-send, idempotencia PT, single-flight y reconciliación |
| Certificado vencido | rechazo total tenant | vigencia/errores firma | alertas 60→1 día, bloquear antes de envío, rotación solapada |
| Certificado inválido | firma/rechazo | prueba previa/sandbox | desactivar binding, no retry ciego, corregir y nueva operación permitida |
| Error de firma | documento inválido | signer/PT code | terminal/configuration error, preservar evidencia, alerta tenant |
| DB caída | API/worker indisponible | readiness/managed alerts | 503 sin aceptar, worker detiene side effects, HA/failover/restore |
| Corrupción/pérdida DB | pérdida de autoridad | checks/invariants/backup | freeze writes, PITR, reconciliar PT/objetos, rotar credenciales |
| Cola atascada | documentos tardíos | oldest age/depth/leases | autoscale worker, liberar leases, kill switch por job, DLQ/replay |
| Object storage caído | artefacto faltante | write/read errors | estado fiscal separado; retry upload, checksum; no marcar artifact ready |
| Webhook fallido | cliente desactualizado | delivery status/age | retries con jitter, DLQ, consulta API y replay manual firmado |
| Credencial comprometida | emisión/lectura abusiva | anomalía/IP/volumen | revocar, kill switch app, rotar, preservar audit, notificar e investigar |
| Pérdida conectividad | fallos parciales | health/network telemetry | timeouts acotados, backoff, no asumir no-envío |
| Error cliente | rechazo/reintentos inútiles | 4xx por field/code | 422 estable, pointer, docs; 4xx no retry automático |
| Abuso API | coste/DoS | 429/WAF/anomalías | edge+app rate limits, quota, payload caps, suspend credential |
| Acceso cruzado tenant | brecha crítica | BOLA tests/audit/anomaly | grants+RLS+FK compuesta; deny, P0, freeze, investigación/notificación |
| Configuración fiscal incorrecta | rechazo o documento errado | validation/provider rejects | configuración versionada/effective dates, preflight, four-eyes opcional |
| Deploy defectuoso | caída/corrupción | canary/SLO/error rate | rollout gradual, rollback digest, feature flag; migración expand/contract |
| Región cloud caída | indisponibilidad | provider status/multi-signal | HA zonal; DR restaurable otra región según RTO, no active-active V1 |
| PT comprometido | evidencia/respuestas falsas | firmas, divergencia DIAN, anomalía | circuit breaker, conservar raw/hash, suspender, query independiente si existe |
| Cuota race | sobreuso/cobro erróneo | ledger vs counter | reserva atómica, ledger append-only y reconciliación de contador |

Principio: primero preservar integridad y evidencia; después disponibilidad. Cuando no se sabe si el side effect ocurrió, `unknown` es un estado correcto.

