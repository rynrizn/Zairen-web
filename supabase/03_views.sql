-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 03: VISTAS DEL SISTEMA (CATÁLOGO, INVENTARIO Y REPORTES)
-- ============================================================

-- Borrar vistas previas si existieran para evitar colisión de columnas
DROP VIEW IF EXISTS public.vw_reporte_ventas CASCADE;
DROP VIEW IF EXISTS public.vw_historial_cliente CASCADE;
DROP VIEW IF EXISTS public.vw_stock_bajo CASCADE;
DROP VIEW IF EXISTS public.vw_inventario CASCADE;
DROP VIEW IF EXISTS public.vw_catalogo_publico CASCADE;


-- ============================================================
-- 1. VISTA: vw_catalogo_publico
-- Consumo directo por la tienda web pública (Astro SSG / SSR)
-- ============================================================
CREATE VIEW public.vw_catalogo_publico AS
SELECT
    p.id AS id_producto,
    p.nombre,
    p.slug,
    p.descripcion,
    p.precio_venta,
    p.stock_minimo,
    p.destacado,
    p.es_prioritario,
    c.id AS id_coleccion,
    c.nombre AS coleccion,
    c.slug AS coleccion_slug,
    COALESCE(
        (SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id AND img.es_portada = TRUE LIMIT 1),
        (SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id ORDER BY img.orden ASC LIMIT 1),
        ''
    ) AS imagen_portada,
    COALESCE(
        (SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id AND img.es_portada = FALSE ORDER BY img.orden ASC LIMIT 1),
        ''
    ) AS imagen_dorsal,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0)::INT AS stock_disponible,
    COALESCE(SUM(inv.cantidad), 0)::INT AS stock_total,
    -- Agrupación de atributos clave-valor para renderizado instantáneo
    COALESCE(
        (SELECT jsonb_object_agg(ap.clave, ap.valor) 
         FROM (
             SELECT clave, string_agg(valor, ', ' ORDER BY orden) AS valor 
             FROM public.atributo_producto 
             WHERE producto_id = p.id 
             GROUP BY clave
         ) ap),
        '{}'::jsonb
    ) AS atributos,
    -- Lista de tallas ordenada si existen
    COALESCE(
        (SELECT array_agg(ap.valor ORDER BY ap.orden) 
         FROM public.atributo_producto ap 
         WHERE ap.producto_id = p.id AND LOWER(ap.clave) = 'talla'),
        '{}'::TEXT[]
    ) AS tallas
FROM public.producto p
INNER JOIN public.coleccion c ON c.id = p.coleccion_id
LEFT JOIN public.inventario inv ON inv.producto_id = p.id
WHERE p.activo = TRUE 
  AND p.publicado = TRUE 
  AND c.activa = TRUE
GROUP BY p.id, p.nombre, p.slug, p.descripcion, p.precio_venta, p.stock_minimo, p.destacado, p.es_prioritario, c.id, c.nombre, c.slug;


-- ============================================================
-- 2. VISTA: vw_inventario
-- Panel administrativo para control de existencias en tiempo real
-- ============================================================
CREATE VIEW public.vw_inventario AS
SELECT
    p.id AS id_producto,
    p.nombre,
    p.slug,
    p.precio_venta,
    p.stock_minimo,
    p.activo,
    p.publicado,
    p.destacado,
    p.es_prioritario,
    c.nombre AS coleccion,
    COALESCE(
        (SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id AND img.es_portada = TRUE LIMIT 1),
        (SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id LIMIT 1),
        ''
    ) AS imagen_portada,
    COALESCE(SUM(inv.cantidad), 0)::INT AS stock_total,
    COALESCE(SUM(inv.cantidad_reservada), 0)::INT AS stock_reservado,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0)::INT AS stock_disponible,
    CASE
        WHEN COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) <= 0 THEN 'AGOTADO'
        WHEN COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) <= p.stock_minimo THEN 'POCAS_UDS'
        ELSE 'DISPONIBLE'
    END AS estado_stock,
    COALESCE(
        (SELECT array_agg(ap.valor ORDER BY ap.orden) 
         FROM public.atributo_producto ap 
         WHERE ap.producto_id = p.id AND LOWER(ap.clave) = 'talla'),
        '{}'::TEXT[]
    ) AS tallas
FROM public.producto p
INNER JOIN public.coleccion c ON c.id = p.coleccion_id
LEFT JOIN public.inventario inv ON inv.producto_id = p.id
GROUP BY p.id, p.nombre, p.slug, p.precio_venta, p.stock_minimo, p.activo, p.publicado, p.destacado, p.es_prioritario, c.nombre;


-- ============================================================
-- 3. VISTA: vw_stock_bajo
-- Alertas críticas automáticas para el Dashboard de Administración
-- ============================================================
CREATE VIEW public.vw_stock_bajo AS
SELECT
    p.id AS id_producto,
    p.nombre,
    c.nombre AS coleccion,
    p.stock_minimo,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0)::INT AS stock_disponible,
    CASE
        WHEN COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) = 0 THEN 'CRITICO_AGOTADO'
        ELSE 'REABASTECER_PRONTO'
    END AS nivel_alerta
FROM public.producto p
INNER JOIN public.coleccion c ON c.id = p.coleccion_id
LEFT JOIN public.inventario inv ON inv.producto_id = p.id
WHERE p.activo = TRUE
GROUP BY p.id, p.nombre, c.nombre, p.stock_minimo
HAVING COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) <= p.stock_minimo;


-- ============================================================
-- 4. VISTA: vw_historial_cliente
-- Directorio de clientes con frecuencia de compra y LTV
-- ============================================================
CREATE VIEW public.vw_historial_cliente AS
SELECT
    c.id AS id_cliente,
    c.nombre,
    COALESCE(c.telefono, '') AS telefono,
    COALESCE(c.ci, '') AS ci,
    COALESCE(c.ciudad, '') AS ciudad,
    c.tipo_cliente,
    c.cantidad_compras,
    c.total_gastado,
    c.created_at AS fecha_registro,
    c.ultimo_contacto,
    COALESCE(
        (SELECT MAX(v.fecha_hora) FROM public.venta v WHERE v.cliente_id = c.id),
        c.ultimo_contacto
    ) AS ultima_compra
FROM public.cliente c;


-- ============================================================
-- 5. VISTA: vw_reporte_ventas
-- Consolidado de transacciones comerciales con desglose de items
-- ============================================================
CREATE VIEW public.vw_reporte_ventas AS
SELECT
    v.id AS id_venta,
    v.numero_ticket,
    v.fecha_hora,
    v.tipo_venta,
    v.subtotal,
    v.descuento,
    v.total,
    v.observacion,
    COALESCE(u.nombre_completo, 'Vendedor') AS vendedor,
    COALESCE(c.nombre, 'Cliente Mostrador') AS cliente,
    COALESCE(c.telefono, '') AS cliente_telefono,
    COALESCE(p.metodo_pago, 'EFECTIVO') AS metodo_pago,
    COALESCE(p.estado_pago, 'PAGADO') AS estado_pago,
    COALESCE(p.monto_efectivo, 0) AS monto_efectivo,
    COALESCE(p.monto_transferencia, 0) AS monto_transferencia,
    COALESCE(p.referencia, '') AS referencia_pago,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'producto_id', dv.producto_id,
            'nombre', dv.producto_nombre,
            'atributos', dv.atributos_snapshot,
            'cantidad', dv.cantidad,
            'precio_unitario', dv.precio_unitario,
            'subtotal', dv.subtotal
        )), '[]'::json)
        FROM public.detalle_venta dv
        WHERE dv.venta_id = v.id
    ) AS items,
    (SELECT COALESCE(SUM(dv.cantidad), 0)::INT FROM public.detalle_venta dv WHERE dv.venta_id = v.id) AS total_prendas
FROM public.venta v
LEFT JOIN public.perfil u ON u.id = v.usuario_id
LEFT JOIN public.cliente c ON c.id = v.cliente_id
LEFT JOIN public.pago p ON p.venta_id = v.id;
