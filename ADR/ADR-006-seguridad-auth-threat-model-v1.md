# ADR-006: Seguridad V1 — autenticación POS, secretos y trust boundaries

- **Estado:** Aprobado
- **Fecha:** 2026-08-18
- **Depende de:** ADR-003, ADR-004, ADR-005
- **Detalle:** `docs/f3-threat-model-v1.md`

## Contexto

El sistema puede producir efectos fiscales y procesa datos de múltiples empresas. Un compromiso de credencial o un error de autorización puede producir documentos no autorizados o exponer información entre tenants.

V1 debe ser operable por una persona sin construir una plataforma IAM empresarial.

## Decisión

### 1. Actor técnico V1: instalación POS

La autenticación de API será por **credencial propia por instalación/cliente POS**, scoped a exactamente un tenant.

No se crea OAuth server, SSO, mTLS PKI ni gestión de usuarios humanos para V1.

La identidad humana del cajero/operador, si el POS la conoce, puede viajar como metadata auditada, pero **no decide el tenant ni sustituye la identidad técnica autenticada**.

### 2. Credencial opaca de alta entropía

Formato lógico:

```text
credential_id + secret aleatorio de 32 bytes
```

- `credential_id` es identificador público de lookup;
- el secreto se muestra una sola vez;
- el servidor conserva solo un digest verificable, no el secreto original;
- comparación constante;
- estado `active/revoked` y rotación;
- nunca query string;
- transporte exclusivamente TLS.

Para endurecer una fuga aislada de DB, el digest puede ser HMAC-SHA-256 con pepper versionado guardado en secret manager. La implementación debe permitir rotar credenciales sin tocar registros fiscales históricos.

### 3. Authorization header

La credencial se transportará mediante `Authorization` y deberá ser redactada sistemáticamente de logs/traces.

No se incluye la credencial dentro del payload fiscal.

### 4. Autorización tenant

Tras autenticar:

```text
credential → tenant_id autorizado
```

Todos los IDs recibidos del POS se resuelven dentro de ese tenant. Conocer un UUID de otro tenant no concede acceso.

Esto se refuerza con RLS según ADR-005.

### 5. Separación de secretos por runtime

- `api`: no recibe credenciales PT;
- `worker`: recibe credencial PT y permisos mínimos necesarios;
- `migrator`: credencial DDL separada, no disponible al runtime;
- object storage: API idealmente read-only/stream; worker write/read;
- CI/deploy: preferir identidad federada/OIDC del proveedor cuando exista frente a secretos cloud estáticos.

### 6. Secret manager

PT credentials, peppers, DB passwords y claves de storage se almacenan en secret manager/configuración secreta de la plataforma, nunca Git, imágenes, fixtures o logs.

`.env` solo desarrollo local y con valores no productivos.

### 7. PT como destino fijo

URLs/hosts del PT no se reciben del usuario. El adapter usa configuración fija/allowlisted para reducir SSRF y redirecciones hacia destinos arbitrarios.

### 8. Object storage privado

Buckets/containers fiscales son privados.

Descarga de XML/PDF requiere autorización tenant y se entrega por streaming API o URL firmada de vida corta. No se guardan enlaces públicos permanentes.

### 9. Logs por minimización

Por defecto no registrar:

- Authorization;
- secretos;
- payload fiscal completo;
- XML/PDF completos;
- credenciales PT;
- datos personales innecesarios.

Sí registrar correlation ID, operation ID, tenant ID técnico, códigos normalizados, latencias, estado y referencias no secretas.

### 10. Rate/abuse controls

La API debe poder limitar por credencial/tenant y detectar patrones anómalos. Los números se calibran durante sandbox/piloto; no se inventa un límite fijo antes de conocer tráfico normal.

Idempotencia no reemplaza rate limiting, y rate limiting no reemplaza autorización.

### 11. Cambios administrativos

No se construye panel administrativo V1.

Revocar credenciales, desbloquear operación o ejecutar una reparación se hará mediante tooling/operator path autenticado y auditable. Ningún runbook debe recomendar editar estado fiscal directamente con SQL como procedimiento normal.

### 12. Dependencias/supply chain

- lockfile obligatorio;
- CI desde commits revisables;
- actualizaciones de dependencias separadas y testeadas;
- secretos no disponibles en jobs que no los necesitan;
- no ejecutar scripts/copias de paquetes desconocidos en producción;
- versión de runtime/imagen pinneada de forma reproducible.

### 13. Fail closed en aislamiento

Si no puede resolverse tenant/autorización de forma inequívoca, la operación falla antes de acceder al dominio fiscal.

Una falla de RLS/contexto no se convierte en fallback “sin filtro”.

## Riesgo aceptado V1

Una credencial POS válida es un bearer secret de larga vida rotatable. Si el endpoint POS está completamente comprometido, el atacante puede utilizarla hasta su revocación.

Se acepta temporalmente porque mTLS/OAuth/device attestation elevarían considerablemente la carga operativa. La mitigación V1 es secreto de alta entropía, almacenamiento seguro en el POS, TLS, scope de un tenant, rate/abuse monitoring, rotación/revocación e idempotencia.

Si la API se abre a terceros, este riesgo se reevalúa obligatoriamente.

## Gate

No hay piloto hasta probar:

- credential de tenant A no puede leer/mutar B;
- UUID conocido de B sigue denegado;
- credential revocada falla inmediatamente;
- rotación no afecta operaciones históricas;
- logs no contienen secreto;
- API runtime no posee secreto PT;
- worker no puede hacer DDL;
- buckets no son públicos;
- backup restore no requiere exponer credenciales de producción en scripts inseguros.
