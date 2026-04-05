# Checklist diario (API-Dian)

Marca mentalmente o en el Project lo que aplique.

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
