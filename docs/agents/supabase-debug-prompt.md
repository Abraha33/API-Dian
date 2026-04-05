# Prompt base — depuración Supabase (CLI + migraciones)

Usar cuando algo falle en local, migraciones o enlace proyecto↔remoto. Sustituye los valores entre `<>`.

---

Contexto: proyecto **API-Dian**. Las migraciones canónicas están en `supabase/migrations/`. El stack exacto y el proveedor pueden estar pendientes en ADR-001; no asumas producto distinto sin que el usuario lo confirme.

**Síntoma:** (error literal o comportamiento)

**Entorno:**

- OS: (ej. Windows 10/11)
- ¿`supabase --version`?: (pegar salida)
- Comando que falló: (ej. `supabase start`, `supabase db push`, `supabase migration new ...`)

**Preguntas:**

1. ¿Qué revisar en orden (config, Docker, credenciales, orden de migraciones)?
2. ¿Comandos exactos para diagnosticar y corregir?
3. ¿Qué no debo commitear (secretos, artefactos locales)?

Responde en pasos numerados y breves.
