# Arquitectura de seguridad

## Modelo de identidad

V1 usa API keys de aplicación por ambiente. Formato `ak_{env}_{public_id}.{secret}`; solo el hash con algoritmo resistente y pepper administrado se almacena. El secreto se muestra una vez. Cada key tiene scopes, expiración opcional, última utilización, red permitida opcional, rotación solapada y revocación inmediata.

Usuarios humanos usan un proveedor de identidad administrado, MFA obligatorio para operador y roles privilegiados. Sesiones humanas no se aceptan como credencial de emisión pública. OAuth 2.0 client credentials se añade cuando un cliente empresarial lo exija; no se construye un authorization server propio. mTLS queda opcional posterior.

## Autorización

La decisión exige simultáneamente:

`credential active ∧ environment match ∧ scope ∧ application→organization grant ∧ tenant active ∧ quota/policy`.

Un 404 opaco evita enumerar recursos ajenos. La autorización se repite en descarga de artefactos, jobs, webhooks, soporte y worker; no solo en controllers.

## Secretos y certificados

- Secret Manager/KMS administrado; nunca `.env` de producción, repo, logs o base en claro.
- Credenciales PT separadas por ambiente y, cuando corresponda, organización.
- V1 prefiere custodia de clave privada y firma en PT. La plataforma guarda metadata, vigencia, fingerprint y binding.
- Si un PT obliga custodia propia: envelope encryption con KMS, acceso exclusivo del signer, no exportación, rotación, auditoría y revisión de amenaza antes de habilitar.
- Alertas 60/30/15/7/1 días antes de vencimiento de certificados.

## Datos y PII

- TLS 1.2+ externo; TLS/identidad de servicio interno.
- Cifrado administrado en DB, backups y objetos; claves administradas por cliente solo si el riesgo/contrato lo exige.
- Logs allowlist: IDs, códigos y duraciones; se redactan payloads, documentos, tokens, firmas, contraseñas y PII.
- Objetos privados, signed URL de un uso/vida corta, checksum y retención.
- Acceso de soporte just-in-time, read-only por defecto, con ticket/razón y auditoría.

## Abuso y borde

- WAF y protección DDoS administrada;
- payload máximo por endpoint, parser estricto, timeouts y límites de profundidad/campos;
- rate limit por IP en borde y por credential/application/tenant en aplicación;
- cuotas de documentos aceptados/intentos conforme al plan; reservas atómicas evitan carrera;
- circuit breakers para PT/webhooks, backpressure y kill switch por tenant/familia/PT;
- URLs de webhook con defensa SSRF, bloqueo de redes privadas/link-local y DNS rebinding.

## Supply chain y despliegue

- branch protection, revisión, CI obligatorio y commits/deploys trazables;
- lockfile, dependencias escaneadas, SAST, secret scan, SBOM e imagen firmada;
- identidad federada GitHub→cloud, sin llaves cloud persistentes en CI;
- imagen por digest, despliegue gradual y rollback a digest anterior;
- migraciones expand/contract y backup previo para cambios riesgosos.

## Auditoría

Append-only para: login/MFA, crear/rotar/revocar key, cambios de grants/scopes, configuración fiscal, certificado, webhook, cuotas, acceso de soporte, kill switch, replay/reconciliación manual y deploy. Cada evento contiene actor, tenant, objetivo, acción, resultado, request/correlation ID, IP aproximada y timestamp; nunca el secreto.

## Pruebas obligatorias

- OWASP API/BOLA por endpoint y property-based tenant isolation;
- replay/idempotencia/concurrencia y quota race;
- webhook SSRF/firma/replay;
- credencial revocada/rotada/ambiente cruzado;
- roles DB/RLS y pool contamination;
- restore con permisos y secretos nuevos;
- dependencia comprometida e imagen no aprobada;
- pentest independiente antes de producción pública.

Referencias de diseño: [OWASP API Security Top 10](https://owasp.org/API-Security/), [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html) y [OpenTelemetry](https://opentelemetry.io/docs/).

