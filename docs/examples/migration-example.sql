-- Plantilla de migración Supabase (referencia; no es migración real del repo).
-- Crear archivo real con: supabase migration new nombre_descriptivo
-- El historial canónico vive en: supabase/migrations/

-- Ejemplo comentado (descomentar y adaptar):

-- create extension if not exists "pgcrypto";

-- create table if not exists public.example (
--   id uuid primary key default gen_random_uuid(),
--   created_at timestamptz not null default now()
-- );

-- Las migraciones reversibles (down) no son obligatorias en todos los flujos;
-- si el equipo las usa, documentar el procedimiento en el ticket o README.
