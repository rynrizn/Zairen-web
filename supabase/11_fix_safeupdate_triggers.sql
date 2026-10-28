-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v4
-- ARCHIVO 11: CORRECCIÓN DE TRIGGERS Y FUNCIONES PARA EXTENSIÓN SAFEUPDATE
-- ============================================================
-- En Supabase / PostgreSQL con safeupdate habilitado, todo UPDATE
-- requiere explícitamente una cláusula WHERE para evitar bloqueos
-- de transacción al insertar o editar productos.

-- 1. Redefinir la función de trigger con cláusula WHERE explícita
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

-- 2. Redefinir la función RPC incrementar_version_catalogo con cláusula WHERE explícita
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

-- 3. Confirmar que los triggers sigan activos en las tablas clave
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
