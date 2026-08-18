# F3 — Threat model V1 API-DIAN

**Estado:** cerrado para F4; revalidar antes del piloto  
**Fecha:** 2026-08-18

## 1. Activos críticos

Orden aproximado de criticidad:

1. capacidad de ejecutar mutaciones fiscales mediante el PT;
2. estado/idempotencia de operaciones;
3. credenciales PT;
4. aislamiento entre tenants;
5. evidencia/respuestas PT;
6. XML/PDF y datos fiscales/personales;
7. credenciales POS;
8. backups;
9. pipeline CI/deploy y credenciales de infraestructura.

## 2. Trust boundaries

```text
[POS / dispositivo potencialmente comprometible]
           │ TLS + credential
           ▼
[API runtime]
           │ DB role api
           ▼
[PostgreSQL]
           ▲
           │ DB role worker
[Worker runtime] ── TLS + PT secret ──▶ [Proveedor Tecnológico]
      │
      └── private credentials ──▶ [Object Storage]

[CI/operator] ── privileged deployment/migration boundary
```

El POS no es una zona de confianza alta solo por ser software propio. Un equipo del comercio puede tener malware, backups inseguros o acceso físico.

## 3. Identidad y autorización

### POS credential

Cada instalación usa una credencial opaca única asociada a un tenant.

Riesgos:

- robo de secreto;
- copia de configuración entre equipos;
- credencial abandonada no revocada;
- logging accidental.

Controles:

- 32 bytes aleatorios;
- digest server-side, no secreto plano;
- almacenamiento seguro del sistema operativo donde sea posible;
- TLS;
- redacción de `Authorization`;
- revocación/rotación;
- último uso/telemetría;
- rate/abuse monitoring;
- scope de un solo tenant.

### Tenant confusion / BOLA

Ataque: cambiar operation/document UUID para leer o mutar otro tenant.

Controles independientes:

1. tenant derivado de la credencial;
2. queries/repository con tenant context;
3. FK tenant-safe;
4. RLS PostgreSQL;
5. tests negativos A→B.

UUID aleatorio ayuda contra enumeración, pero no es autorización.

## 4. STRIDE resumido

| Amenaza | Ejemplo V1 | Controles |
|---|---|---|
| Spoofing | credencial POS robada | high entropy, secure storage, rotation, TLS, monitoring |
| Tampering | cambiar payload bajo misma key | semantic hash + unique idempotency + immutable snapshot |
| Repudiation | negar quién lanzó operación | correlation + credential/actor + audit append-only |
| Information disclosure | IDOR/cross-tenant | auth-derived tenant + RLS + tenant-safe FK + private storage |
| Denial of service | flood de emisión/consultas | limits por credential/tenant, bounded payload, backpressure/work queue |
| Elevation of privilege | API usando service_role | dedicated DB roles, no BYPASSRLS, least privilege |

## 5. Amenazas específicas fiscales

### T-FISC-01 — Duplicación por retry

Mitigación: ADR-004 completo; no retries HTTP transparentes de mutación.

### T-FISC-02 — Timeout interpretado como fallo

Mitigación: `UNKNOWN`, reconcile antes de repetir.

### T-FISC-03 — Worker doble

Mitigación: lease + unique active provider attempt + expected-state transaction.

### T-FISC-04 — Operador fuerza estado para “destrabar”

Mitigación: tooling auditado; no UPDATE manual rutinario; estado `NEEDS_ATTENTION` conserva evidencia.

### T-FISC-05 — PT comprometido/erróneo

Mitigación: TLS, host fijo, conservar raw response, normalización defensiva, checks de correlación, alertas por anomalías. V1 no puede eliminar riesgo de tercero; selección contractual/técnica F4 es control crítico.

## 6. Input/API threats

### Payload excesivo

- límites de body;
- arrays/strings acotados;
- timeouts;
- validación antes de persistir;
- no aceptar blobs/XML arbitrarios del POS cuando el contrato espera JSON normalizado.

### Mass assignment

DTO/contract allowlist; campos internos como `tenant_id`, `status`, provider IDs y audit actor nunca se toman del body.

### Injection

- ORM/queries parametrizadas;
- raw SQL solo parametrizado/revisado;
- no interpolar tenant, IDs o filtros;
- validar JSON/path data antes de usar en storage keys.

### SSRF

PT/storage endpoints son configuración fija, no URLs entregadas por el cliente. Deshabilitar/redirigir con criterio explícito si el cliente HTTP sigue redirects.

## 7. Datos y privacidad

Clasificación:

- **secreto:** PT credentials, POS secret, DB/storage credentials, peppers;
- **fiscal confidencial:** payloads, raw responses, XML/PDF;
- **operacional sensible:** tenant IDs, operation IDs, provider refs;
- **telemetría minimizada:** métricas/códigos/latencias.

Logs usan las dos últimas categorías en mínimo necesario. Payload/XML/PDF completos no se loguean por defecto.

## 8. Storage threats

Riesgos:

- bucket público;
- object key enumerable;
- URL firmada demasiado larga;
- mismatch DB↔objeto;
- sustitución/corrupción.

Controles:

- bucket privado;
- key opaca/interna;
- autorización vía DB antes de entrega;
- signed URL corta o streaming;
- SHA-256/size/content-type persistidos;
- no confiar solo en metadata del object store.

## 9. Database threats

### RLS bypass

Roles owner/superuser/BYPASSRLS pueden saltar políticas. Runtime no usa esos roles.

### Pool tenant bleed

Nunca usar tenant context persistente de sesión. Set local dentro de transaction y limpiar por commit/rollback.

### Worker cross-tenant

Worker necesita seleccionar trabajo global. Su acceso cross-tenant se limita a metadata de queue; dominio fiscal se procesa con tenant explícito. La credencial worker es más sensible que API DB credential y se rota por separado.

### Migration compromise

`app_migrator` no existe en runtime. DDL/grants/RLS versionados en Git y aplicados por proceso controlado.

## 10. Secrets

- Secret manager de plataforma;
- no repo;
- no Docker image layers;
- no stdout;
- no screenshots/documentación;
- permisos por runtime;
- rotación documentada;
- PT secret solo worker.

Si un secreto aparece en Git, se considera comprometido aunque se borre después: se rota.

## 11. CI/CD y supply chain

- lockfile;
- versiones de runtime reproducibles;
- branch/commit identificable en despliegue;
- tests antes de deploy;
- secretos limitados por job/environment;
- preferir OIDC/federación cloud cuando disponible;
- dependencias nuevas requieren justificación;
- alerts/updates de vulnerabilidades evaluadas, no auto-merge ciego.

## 12. Backups/DR

Amenazas:

- corrupción humana;
- migration defectuosa;
- borrado accidental;
- incidente del proveedor;
- backup existente pero irrestaurable.

Controles:

- backup administrado/PITR o equivalente;
- copia/exportación adicional cuando sea razonable;
- object storage con política de recuperación/versioning según proveedor;
- restore test real antes del piloto;
- runbook que documente qué ocurre con operaciones creadas después del punto restaurado: **una restauración puede reintroducir incertidumbre y obliga reconciliación, no reemisión masiva**.

Ese último punto es crítico: restaurar DB a un instante anterior puede olvidar side effects PT que sí ocurrieron después. Tras disaster recovery se debe reconciliar ventana afectada antes de emitir de nuevo.

## 13. Abuse por credencial válida

Un comercio/endpoint comprometido puede crear comandos fiscalmente válidos con una credencial legítima.

V1 no construye un motor antifraude. Controles mínimos:

- limits/anomalías;
- trazabilidad por credential;
- capacidad de suspensión tenant/credential;
- piloto de volumen limitado;
- kill switch que detenga nuevas mutaciones sin borrar operaciones existentes.

## 14. Pruebas de seguridad obligatorias

1. BOLA A→B para lectura y mutación;
2. tenant_id inyectado en body se ignora/rechaza;
3. credential revocada;
4. rotación credential;
5. credential incorrecta no filtra existencia de tenant/op;
6. idempotency race concurrente;
7. payload oversized;
8. campos internos por mass assignment;
9. SQL injection básicos sobre campos libres;
10. logs de error sin Authorization/secrets/payload completo;
11. bucket/object no accesible sin auth;
12. signed URL expira;
13. API runtime carece de PT secret;
14. runtime roles no hacen DDL/BYPASSRLS;
15. restore + reconciliación de ventana posterior al restore.

## 15. Riesgos aceptados/deferidos

- bearer credential larga por instalación en vez de mTLS/OAuth;
- un solo PT;
- un solo operador humano inicial;
- no SIEM/SOC 24x7;
- no WAF custom complejo;
- no HSM porque V1 no custodia certificados fiscales.

Estos riesgos son aceptables solo mientras V1 sea interna, de volumen/piloto controlado y con capacidad rápida de revocación/kill switch.

## 16. Evidencia de referencia

- OWASP API1:2023 identifica Broken Object Level Authorization como riesgo principal de APIs; IDs aleatorios no reemplazan checks de autorización.
- PostgreSQL RLS restringe filas pero owners/BYPASSRLS requieren tratamiento explícito.
- Supabase documenta que sus credenciales secret/service-role tienen privilegio elevado/bypass RLS; no deben ser la identidad normal de acceso tenant-scoped.
