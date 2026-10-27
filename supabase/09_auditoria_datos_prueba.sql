-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v3
-- ARCHIVO 09: SCRIPT DE AUDITORÍA Y LISTADO DE DATOS DE PRUEBA (SOLO LECTURA)
-- ============================================================
-- Este script es de inspección pasiva. No modifica ni elimina ninguna fila.

-- 1. Listado de Colecciones con métricas de prendas y stock
SELECT
    c.id AS coleccion_id,
    c.nombre AS coleccion_nombre,
    c.slug AS coleccion_slug,
    c.activa,
    c.orden,
    COUNT(p.id) AS total_productos,
    COALESCE(SUM(CASE WHEN COALESCE(inv_agg.stock_disponible, 0) > 0 THEN 1 ELSE 0 END), 0) AS productos_con_stock,
    COALESCE(SUM(inv_agg.stock_disponible), 0) AS unidades_totales_disponibles,
    CASE
        WHEN COUNT(p.id) = 0 THEN 'VACÍA (Eliminación segura directa)'
        WHEN COALESCE(SUM(inv_agg.stock_disponible), 0) = 0 THEN 'AGOTADA (Eliminable: prendas pasarán a Sin Colección)'
        ELSE 'BLOQUEADA (Tiene prendas con stock activo)'
    END AS estado_evaluacion
FROM public.coleccion c
LEFT JOIN public.producto p ON p.coleccion_id = c.id
LEFT JOIN (
    SELECT producto_id, SUM(cantidad - cantidad_reservada) AS stock_disponible
    FROM public.inventario
    GROUP BY producto_id
) inv_agg ON inv_agg.producto_id = p.id
GROUP BY c.id, c.nombre, c.slug, c.activa, c.orden
ORDER BY c.orden ASC, c.nombre ASC;


-- 2. Listado de Productos candidatos a prueba / revisión
SELECT
    p.id AS producto_id,
    p.nombre,
    p.slug,
    c.nombre AS coleccion,
    p.precio_venta,
    p.activo,
    p.publicado,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) AS stock_disponible,
    COALESCE(pedidos_agg.total_pedidos, 0) AS pedidos_historicos,
    CASE
        WHEN COALESCE(pedidos_agg.total_pedidos, 0) > 0 THEN 'REQUIERE ARCHIVO (Tiene pedidos en historial)'
        ELSE 'ELIMINABLE FÍSICAMENTE (Sin historial de pedidos)'
    END AS accion_permitida,
    p.created_at
FROM public.producto p
LEFT JOIN public.coleccion c ON c.id = p.coleccion_id
LEFT JOIN public.inventario inv ON inv.producto_id = p.id
LEFT JOIN (
    SELECT producto_id, COUNT(*) AS total_pedidos
    FROM public.detalle_pedido
    GROUP BY producto_id
) pedidos_agg ON pedidos_agg.producto_id = p.id
GROUP BY p.id, p.nombre, p.slug, c.nombre, p.precio_venta, p.activo, p.publicado, p.created_at, pedidos_agg.total_pedidos
ORDER BY p.created_at DESC;
