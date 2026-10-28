-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v3
-- ARCHIVO 10: VERSIÓN DEL CATÁLOGO E INVALIDACIÓN DE CACHÉ
-- ============================================================

-- 1. Agregar columna catalogo_version a la tabla public.configuracion
ALTER TABLE public.configuracion
ADD COLUMN IF NOT EXISTS catalogo_version BIGINT DEFAULT 1000000;

-- Asegurar al menos una fila con versión inicial
UPDATE public.configuracion
SET catalogo_version = COALESCE(catalogo_version, 1000000);


-- 2. Función RPC para incrementar y retornar la versión del catálogo
CREATE OR REPLACE FUNCTION public.incrementar_version_catalogo()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_nueva_version BIGINT;
BEGIN
    v_nueva_version := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

    UPDATE public.configuracion
    SET catalogo_version = v_nueva_version,
        updated_at = NOW()
    WHERE id = 1 OR id IS NOT NULL;

    RETURN jsonb_build_object(
        'success', true,
        'version', v_nueva_version,
        'message', 'Versión del catálogo incrementada exitosamente.'
    );
END;
$$;


-- 3. Función y triggers automáticos ante cambios en el catálogo
CREATE OR REPLACE FUNCTION public.trg_actualizar_version_catalogo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.configuracion
    SET catalogo_version = (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT,
        updated_at = NOW()
    WHERE id = 1 OR id IS NOT NULL;
    RETURN NULL;
END;
$$;

-- Triggers en tablas que afectan el catálogo público
DROP TRIGGER IF EXISTS trg_catalogo_bump_producto ON public.producto;
CREATE TRIGGER trg_catalogo_bump_producto
AFTER INSERT OR UPDATE OR DELETE ON public.producto
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_actualizar_version_catalogo();

DROP TRIGGER IF EXISTS trg_catalogo_bump_coleccion ON public.coleccion;
CREATE TRIGGER trg_catalogo_bump_coleccion
AFTER INSERT OR UPDATE OR DELETE ON public.coleccion
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_actualizar_version_catalogo();

DROP TRIGGER IF EXISTS trg_catalogo_bump_inventario ON public.inventario;
CREATE TRIGGER trg_catalogo_bump_inventario
AFTER INSERT OR UPDATE OR DELETE ON public.inventario
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_actualizar_version_catalogo();

DROP TRIGGER IF EXISTS trg_catalogo_bump_imagen ON public.imagen;
CREATE TRIGGER trg_catalogo_bump_imagen
AFTER INSERT OR UPDATE OR DELETE ON public.imagen
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_actualizar_version_catalogo();
