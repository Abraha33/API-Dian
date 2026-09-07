# Necesidades fiscales por sector — pendiente de investigación

> **Estado:** PENDING RESEARCH
> **Branch canónica:** `draft/architecture-product-v1`
> **Decisión del owner:** 2026-09-07

## Decisión

El producto objetivo sigue siendo una plataforma/API fiscal pública multitenant capaz de servir a software comercial, POS, ERP, SaaS, integradores y, progresivamente, sistemas de sectores regulados como salud y transporte.

Sin embargo, **no se considera cerrado el alcance funcional/fiscal de los sectores distintos del núcleo comercial** hasta realizar investigación específica por sector con fuentes oficiales vigentes.

La existencia de módulos/verticales futuros en el roadmap **no significa que sus necesidades fiscales concretas estén completamente definidas**.

## Estado por dominio

### Núcleo comercial

Estado: **DEFINED / CANONICAL** para producto y arquitectura.

Incluye el alcance ya registrado en el catálogo maestro y roadmap: FEV, NC, ND, contingencia mínima, DEE POS y ajustes, documento soporte y ajustes, recepción/eventos según release, capacidades transversales, etc.

### Salud

Estado: **PENDING SECTOR RESEARCH**.

Antes de cerrar alcance deben investigarse, entre otros:

- actores y tipos de cliente;
- relación FEV ↔ RIPS/CUV;
- requisitos adicionales de datos y validación;
- flujos de recepción, radicación, glosas, respuestas y soportes cuando apliquen;
- autoridades/sistemas externos además de DIAN;
- retención, evidencia y trazabilidad;
- documentos/eventos realmente requeridos;
- responsabilidades de nuestra plataforma frente a PT y terceros;
- demanda comercial y orden de releases.

### Transporte

Estado: **PENDING SECTOR RESEARCH**.

Antes de cerrar alcance deben investigarse, entre otros:

- actores y tipos de operación;
- relación FEV ↔ RNDC y demás sistemas aplicables;
- manifiestos, remesas, referencias y soportes relevantes;
- datos adicionales y validaciones;
- autoridades/sistemas externos además de DIAN;
- documentos/eventos realmente requeridos;
- retención/evidencia;
- responsabilidades de plataforma frente a PT y terceros;
- demanda comercial y orden de releases.

### Otros sectores regulados

Estado: **PENDING DISCOVERY**.

No se incorporará un vertical como alcance cerrado solo porque exista una familia documental o una referencia de mercado. Cada vertical requiere investigación oficial propia.

## Regla arquitectónica

Esta decisión **no reabre la arquitectura base**. La arquitectura debe conservar un núcleo fiscal común y fronteras modulares/versionadas para agregar posteriormente reglas, perfiles, autoridades externas y flujos sectoriales sin reconstruir tenancy, identidad, API base, procesamiento, almacenamiento, auditoría, medición ni observabilidad.

## Gate para cerrar cada vertical

Un sector pasa de `PENDING` a `DEFINED` únicamente cuando exista evidencia suficiente de:

1. necesidades fiscales y operativas reales;
2. fuentes regulatorias oficiales vigentes;
3. actores y responsabilidades;
4. documentos, eventos y flujos;
5. autoridades/sistemas externos;
6. datos y reglas de validación;
7. dependencias PT;
8. requisitos de seguridad, evidencia y retención;
9. demanda/valor comercial;
10. propuesta de release y pruebas de conformidad.

Hasta entonces, salud, transporte y otros sectores son **capacidad futura prevista, no alcance funcional cerrado**.
