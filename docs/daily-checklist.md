# Checklist diario (API-Dian)

Marca mentalmente o en el Project lo que aplique.

## Antes de construir algo técnico

- [ ] Confirmar si la tarea pertenece a documentación, hipótesis, prueba de mercado o diagnóstico.
- [ ] Confirmar que no se está saltando directo a XML, firma, envío DIAN o lógica fiscal real.
- [ ] Confirmar qué aprendizaje de mercado busca producir la tarea.
- [ ] Si se construye algo, debe ser mínimo y orientado a probar recepción real, no el producto final.

## Antes de codificar

- [ ] Una tarjeta en progreso (WIP = 1), alineada al roadmap
- [ ] Rama desde `dev`: `feature/...` (ver `docs/git-branches.md`)
- [ ] Contexto corto listo: `docs/session-context.md` o resumen en el chat

## Base de datos (cuando usemos Supabase)

- [ ] Cambios de esquema solo como migraciones en `supabase/migrations/`
- [ ] Revisar que local/remoto coincidan con lo documentado en el ticket

## Antes del PR

- [ ] CI verde (o justificar fallo conocido)
- [ ] Sin secretos en el diff (`.env` no va al repo)

## Cierre

- [ ] Project: mover tarjeta; **Status update** si hubo bloqueo
- [ ] Si cambió una decisión de arquitectura: actualizar ADR o README, no solo el chat
