## Epic padre

Parte del epic **F1-ARCH-00**.

## Objetivo

Dejar documentada la **estructura de módulos** bajo `src/modules/*` (o ruta equivalente acordada en ADR-001): responsabilidad de cada módulo y **en qué fase** se activa (F2, F3, F4…).

## Alcance

- Crear o **actualizar** `ADR/ADR-002-*.md` (si ya existe ADR-002, extenderlo o reemplazar contenido obsoleto según convención del repo).
- Diagrama o lista clara módulo → fase → dependencias.

## Fuera de alcance

- Implementar todos los módulos (solo diseño y carpetas vacías si el epic lo pide explícitamente en otro issue).

## Prueba de cierre

| Qué verificar | Resultado esperado | Tiempo |
|---------------|-------------------|--------|
| Abrir el ADR de módulos | Lista completa de módulos y fase de activación | S (< 5 min) |

## Rama sugerida

`feature/platform/<n>-f1-arch-02-adr002-modulos`
