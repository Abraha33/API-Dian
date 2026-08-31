# API DIAN — Autonomous Research Control

**Modo:** supervisión por excepción  
**Objetivo actual:** completar y validar la investigación previa a requisitos/arquitectura con Codex + STORM + Deep Research.  
**Última actualización manual:** 2026-08-30

## Estado general

| Componente | Estado | Nota |
|---|---|---|
| Codex CLI | PASS | Coordinador local disponible |
| STORM + Firecrawl | PASS smoke test | Retriever Firecrawl adaptado; DuckDuckGo descartado por bloqueo HTTPS |
| Ollama qwen3:8b | PASS | Respuesta local verificada |
| Deep Research | BLOCKED | Smoke test excedió ventana de prueba; requiere ajuste/validación adicional |
| Runner secuencial | NOT READY | No ejecutar las 8 investigaciones hasta que Deep Research pase smoke test |
| Cruce de evidencia | WAITING | Codex vs STORM vs Deep Research se hace después de obtener los 8 informes |

## Meta de esta fase

Generar y validar 8 informes independientes:

### STORM
- [ ] 01 mercado
- [ ] 02 demanda
- [ ] 03 competencia
- [ ] 04 problemas

### Deep Research
- [ ] 01 mercado
- [ ] 02 demanda
- [ ] 03 competencia
- [ ] 04 problemas

Después:

- [ ] cruzar Codex vs STORM vs Deep Research
- [ ] clasificar afirmaciones como CONFIRMADA / PROBABLE / CONTRADICTORIA / SIN EVIDENCIA
- [ ] verificar afirmaciones críticas contra fuentes oficiales
- [ ] cerrar vacíos de investigación

## Política autónoma

El agente debe continuar ante errores reparables: diagnosticar → reparar → probar → continuar.

Solo debe marcar `NEEDS_USER_ACTION` cuando exista un bloqueo externo real, por ejemplo:

- credencial revocada o faltante;
- créditos externos agotados;
- pago o alta de servicio requerida;
- permiso administrativo que requiera intervención humana;
- decisión de producto irreversible o no inferible;
- servicio externo indisponible de forma comprobada.

## Señal de intervención

Cuando se necesite al usuario, actualizar este archivo con:

`NEEDS_USER_ACTION: true`

Y documentar:

- bloqueo exacto;
- evidencia/log;
- una sola acción concreta requerida del usuario.

Actualmente:

`NEEDS_USER_ACTION: false`
