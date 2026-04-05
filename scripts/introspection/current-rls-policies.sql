-- Políticas RLS actuales (Postgres 15+ expone pg_policies).
-- Ejecutar en el proyecto Supabase y guardar salida si necesitas diff manual vs migraciones.

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname not in ('pg_catalog', 'information_schema')
order by schemaname, tablename, policyname;
