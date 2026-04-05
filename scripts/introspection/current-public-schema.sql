-- Snapshot operativo: esquema `public` (inventario, no sustituye migraciones).
-- Uso: ejecutar en SQL Editor (Supabase) o psql conectado al proyecto objetivo;
--      pegar o guardar el resultado en este archivo cuando quieras fijar un baseline.
-- Canónico para cambios versionados: supabase/migrations/

select
  c.relkind as kind, -- r=table, v=view, m=materialized view, etc.
  n.nspname as schema_name,
  c.relname as object_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'v', 'm', 'f', 'p')
order by c.relkind, c.relname;
