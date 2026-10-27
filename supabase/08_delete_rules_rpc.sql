-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v3
-- ARCHIVO 08: REGLAS DE ELIMINACIÓN SEGURA DE COLECCIONES Y PRODUCTOS
-- ============================================================

-- 0. Asegurar que las prendas puedan quedar huérfanas en "Sin colección" al eliminar un drop
ALTER TABLE public.producto ALTER COLUMN coleccion_id DROP NOT NULL;

-- 1. Función RPC para eliminar colección con validación de stock de prendas
CREATE OR REPLACE FUNCTION public.eliminar_coleccion_segura(p_coleccion_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_col_nombre TEXT;
    v_total_prods INT := 0;
    v_prods_con_stock INT := 0;
    v_detalles_con_stock JSONB := '[]'::JSONB;
    v_prods_desvinculados INT := 0;
BEGIN
    -- Verificar existencia de la colección
    SELECT nombre INTO v_col_nombre
    FROM public.coleccion
    WHERE id = p_coleccion_id;

    IF v_col_nombre IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'COLECCION_NO_EXISTE',
            'message', 'La colección especificada no existe.'
        );
    END IF;

    -- Evaluar productos asociados y su stock disponible
    SELECT 
        COUNT(*),
        COALESCE(SUM(CASE WHEN stock_disp > 0 THEN 1 ELSE 0 END), 0),
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'nombre', p.nombre,
                'stock', stock_disp
            )
        ) FILTER (WHERE stock_disp > 0), '[]'::JSONB)
    INTO v_total_prods, v_prods_con_stock, v_detalles_con_stock
    FROM (
        SELECT 
            p.id, 
            p.nombre,
            COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) AS stock_disp
        FROM public.producto p
        LEFT JOIN public.inventario inv ON inv.producto_id = p.id
        WHERE p.coleccion_id = p_coleccion_id
        GROUP BY p.id, p.nombre
    ) p;

    -- REGLA 1: Si tiene al menos 1 producto con stock disponible > 0 -> BLOQUEAR
    IF v_prods_con_stock > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'TIENE_PRODUCTOS_DISPONIBLES',
            'coleccion', v_col_nombre,
            'productos_con_stock', v_prods_con_stock,
            'detalles', v_detalles_con_stock,
            'message', format('No se puede eliminar la colección "%s" porque contiene %s producto(s) con existencias disponibles. Mueve estos productos a otra colección antes de eliminarla.', v_col_nombre, v_prods_con_stock)
        );
    END IF;

    -- REGLA 2: Si tiene productos pero todos están sin unidades (stock = 0)
    -- Los productos pasan a "Sin colección" (coleccion_id = NULL)
    IF v_total_prods > 0 THEN
        UPDATE public.producto
        SET coleccion_id = NULL
        WHERE coleccion_id = p_coleccion_id;
        
        GET DIAGNOSTICS v_prods_desvinculados = ROW_COUNT;
    END IF;

    -- REGLA 3: Eliminar la colección de la base de datos
    DELETE FROM public.coleccion
    WHERE id = p_coleccion_id;

    RETURN jsonb_build_object(
        'success', true,
        'coleccion', v_col_nombre,
        'productos_desvinculados', v_prods_desvinculados,
        'message', format('La colección "%s" ha sido eliminada con éxito. %s prenda(s) sin unidades pasaron a "Sin colección".', v_col_nombre, v_prods_desvinculados)
    );
END;
$$;


-- 2. Función RPC para eliminar o archivar producto protegiendo historial de pedidos
CREATE OR REPLACE FUNCTION public.eliminar_o_archivar_producto(
    p_producto_id UUID,
    p_forzar_archivo BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prod_nombre TEXT;
    v_pedidos_count INT := 0;
BEGIN
    SELECT nombre INTO v_prod_nombre
    FROM public.producto
    WHERE id = p_producto_id;

    IF v_prod_nombre IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'PRODUCTO_NO_EXISTE',
            'message', 'El producto especificado no existe.'
        );
    END IF;

    -- Verificar si el producto tiene historial en pedidos
    SELECT COUNT(*) INTO v_pedidos_count
    FROM public.detalle_pedido
    WHERE producto_id = p_producto_id;

    -- REGLA 1: Si aparece en pedidos anteriores -> NO borrar físicamente
    IF v_pedidos_count > 0 THEN
        IF p_forzar_archivo THEN
            UPDATE public.producto
            SET activo = FALSE,
                publicado = FALSE
            WHERE id = p_producto_id;

            RETURN jsonb_build_object(
                'success', true,
                'accion', 'ARCHIVADO',
                'nombre', v_prod_nombre,
                'pedidos_asociados', v_pedidos_count,
                'message', format('La prenda "%s" fue archivada con éxito para preservar el historial de sus %s pedido(s) asociados.', v_prod_nombre, v_pedidos_count)
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error', 'REQUIERE_ARCHIVO',
                'nombre', v_prod_nombre,
                'pedidos_asociados', v_pedidos_count,
                'message', format('La prenda "%s" aparece en %s pedido(s) anteriores. Para proteger el historial contable de ventas, debe ser Archivada en lugar de eliminada físicamente.', v_prod_nombre, v_pedidos_count)
            );
        END IF;
    END IF;

    -- REGLA 2: Si no tiene pedidos asociados -> Borrado físico de dependencias y producto
    DELETE FROM public.atributo_producto WHERE producto_id = p_producto_id;
    DELETE FROM public.inventario WHERE producto_id = p_producto_id;
    DELETE FROM public.imagen WHERE producto_id = p_producto_id;
    DELETE FROM public.producto WHERE id = p_producto_id;

    RETURN jsonb_build_object(
        'success', true,
        'accion', 'ELIMINADO',
        'nombre', v_prod_nombre,
        'message', format('La prenda "%s" y sus dependencias de inventario/atributos fueron eliminadas definitivamente.', v_prod_nombre)
    );
END;
$$;
