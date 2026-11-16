-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 12: MIGRACIÓN DE SEGURIDAD PARA VISTAS (SECURITY INVOKER)
-- Resuelve las alertas 'Security Definer View' (CRITICAL) en Supabase Advisor
-- ============================================================

-- Contexto:
-- En PostgreSQL 15+, las vistas en el esquema public deben definirse
-- con la propiedad `security_invoker = true` para que respeten las políticas
-- Row Level Security (RLS) del usuario que consulta (anon o authenticated)
-- en vez de ejecutarse con los privilegios del rol creador (postgres).

-- Bloque PL/pgSQL dinámico y seguro:
-- Modifica ÚNICAMENTE las vistas que realmente existen en la base de datos
-- (evitando el error 42P01: relation does not exist).
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
    ) LOOP
        EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true);', r.table_name);
        EXECUTE format('GRANT SELECT ON public.%I TO authenticated;', r.table_name);
    END LOOP;
    
    -- Permiso de lectura pública al catálogo para visitantes anónimos
    IF EXISTS (
        SELECT 1 
        FROM information_schema.views 
        WHERE table_schema = 'public' AND table_name = 'vw_catalogo_publico'
    ) THEN
        GRANT SELECT ON public.vw_catalogo_publico TO anon;
    END IF;
END $$;
