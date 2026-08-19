# F6 — Harness de contract tests del futuro adapter PT

**Corte:** 2026-08-19  
**Estado:** harness interno, independiente del PT  
**No selecciona proveedor ni implementa endpoints reales.**

## Objetivo

Dejar preparada una estructura de pruebas reutilizable para F5B/F6C sin convertir hipótesis sobre un proveedor en código.

El harness valida el contrato interno `FiscalProvider`:

```text
submit
reconcile
getStatus
fetchXml
fetchPdf
```

pero cada caso futuro debe estar respaldado por evidencia real obtenida en F4C.

## Regla de entrada

Un fixture ejecutable debe declarar:

- `fixture_version = 1`;
- `case_id` estable;
- tipo documental;
- `gate_conclusion = PASS`;
- al menos una referencia de evidencia sanitizada;
- fecha de observación;
- expectativa normalizada del contrato interno.

El harness **no acepta fixtures sin evidencia**.

## Evidencia permitida

Tipos de referencia:

- `SANDBOX_CAPTURE`;
- `PROVIDER_DOCUMENTATION`;
- `CONTRACT`;
- `PROVIDER_CONFIRMATION`.

`locator` identifica la evidencia dentro del sistema/repo seguro de trabajo. No debe contener secretos ni credenciales.

Cada captura que se comprometa al repositorio debe estar sanitizada. La evidencia cruda sensible debe vivir fuera de Git.

## Clasificaciones de alto riesgo

### `TRANSPORT_PROVEN_NOT_SENT`

No basta un timeout, reset o error de socket.

El fixture debe incluir `proof_of_no_remote_side_effect` con:

- explicación concreta de por qué el request no pudo producir efecto remoto;
- una o más referencias de evidencia existentes en el fixture.

Sin esa prueba, el harness rechaza el caso antes de invocar el adapter.

### `NOT_FOUND_CONCLUSIVE`

No basta un 404 o “no encontrado”.

El fixture debe incluir `proof_not_found_is_conclusive` con evidencia que justifique que, para ese tipo documental/consulta/ventana temporal, el resultado realmente descarta un side effect previo.

Sin esa prueba, el harness rechaza el caso.

Esto materializa la regla de `docs/f4-prueba-ambiguedad-pt-v1.md`.

## Artefactos

Los casos `fetchXml` / `fetchPdf` verifican:

- `content_type`;
- tamaño mínimo;
- SHA-256 de un artefacto sanitizado de prueba.

No se requiere guardar un XML/PDF fiscal real en el repositorio.

## Separación entre harness y adapter

El archivo:

```text
apps/api/test/provider-contract/provider-contract-harness.ts
```

no conoce:

- URL del PT;
- headers propios del PT;
- códigos HTTP esperados;
- códigos de negocio;
- formato wire de request/response;
- auth del proveedor;
- rate limits;
- ventanas de propagación.

Un adapter futuro deberá proporcionar un `ProviderContractTestDriver` que:

1. exponga la instancia real del adapter;
2. implemente `arrange(fixture)` para preparar un transporte stub/replay basado en evidencia sanitizada;
3. opcionalmente implemente `cleanup(fixture)`.

El harness solo invoca `FiscalProvider` y compara la salida normalizada.

## Matriz mínima que F4C debe producir

Por cada tipo documental aplicable:

1. submit aceptado concluyente;
2. submit rechazado concluyente;
3. mutación ambigua/timeout;
4. reconciliación que encuentra aceptado;
5. reconciliación que encuentra rechazado;
6. “not found” durante/tras la ventana de propagación;
7. caso que justifique o refute `NOT_FOUND_CONCLUSIVE`;
8. caso que justifique o refute `PROVEN_NOT_SENT`;
9. status read-only;
10. XML;
11. PDF;
12. duplicado deliberado de sandbox si el proveedor lo permite.

No todos los casos terminarán necesariamente en una clasificación favorable. `FAIL` o `INCONCLUSIVE` de F4C no se maquilla creando un fixture `PASS`.

## Ejecución actual

```bash
cd apps/api
npm run test:provider-contract-harness
```

Hoy esta suite solo prueba el propio harness y sus guardas de evidencia. Cuando exista un PT seleccionado, se añadirán fixtures/adapters reales sin cambiar las reglas de seguridad del harness.

## Gate para F6C

No empezar un adapter productivo hasta tener evidencia suficiente para llenar los fixtures relevantes sin placeholders.

Si una decisión peligrosa necesita texto como “suponemos que”, “probablemente” o “normalmente el PT…”, el fixture no está listo.
