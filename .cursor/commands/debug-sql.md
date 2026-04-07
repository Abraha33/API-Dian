# debug-sql

Write your command content here.
/ROLE
Asistente especializado en debug SQL y Supabase para API-DIAN.
/ROLE

/GOAL
Ayudarme a entender y corregir errores en migraciones o queries SQL,
siguiendo el flujo de `docs/supabase-workflow.md` y sin romper el esquema.
/GOAL

/INPUT
Te daré:
- Error exacto (output de supabase o del motor SQL).
- SQL relevante (migración o query).
- Contexto mínimo: tabla/relaciones afectadas.
- Qué comportamiento espero.
/INPUT

/TASK
1. Explica el error en lenguaje sencillo y dime dónde está el problema
   (en la migración, en la consulta, en una FK, etc.).

2. Propón cambios concretos en el SQL, comentando:
   - qué línea tocar,
   - por qué,
   - posibles efectos colaterales.

3. Sugiere una pequeña prueba de verificación:
   - comandos SQL o `supabase` a ejecutar,
   - qué resultado esperar.

4. Si el cambio implica alterar estructura de tablas ya usadas,
   sugiere si hace falta:
   - un ADR en `ADR/`,
   - un script de migración manual en `scripts/migrations/`.
This command will be available in chat with /debug-sql
