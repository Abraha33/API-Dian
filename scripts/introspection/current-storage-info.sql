-- Objetos Storage (Supabase): buckets y políticas asociadas.
-- Requiere permisos sobre esquema `storage`.

select id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
from storage.buckets
order by name;

select *
from pg_policies
where schemaname = 'storage'
order by tablename, policyname;
