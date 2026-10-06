-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 06: DATOS INICIALES DE PRUEBA (SEED LOOKBOOK)
-- Colecciones, prendas oficiales, atributos y stock inicial
-- ============================================================

DO $$
DECLARE
    v_col_mecha UUID;
    v_col_zen UUID;
    v_col_cyber UUID;
    v_prod_samurai UUID;
    v_prod_spine UUID;
    v_prod_cargo UUID;
    v_prod_geisha UUID;
    v_prod_vanguard UUID;
    v_prod_zen UUID;
    v_ubicacion_central UUID;
BEGIN
    -- Obtener o crear ubicación central
    SELECT id INTO v_ubicacion_central FROM public.ubicacion WHERE nombre = 'CENTRAL' LIMIT 1;
    IF v_ubicacion_central IS NULL THEN
        INSERT INTO public.ubicacion (nombre, descripcion, activo)
        VALUES ('CENTRAL', 'Almacén Central / Despacho Principal', TRUE)
        RETURNING id INTO v_ubicacion_central;
    END IF;

    -- 1. Colecciones
    INSERT INTO public.coleccion (nombre, slug, descripcion, orden, activa)
    VALUES 
        ('Anime Mecha // Drop 01', 'anime-mecha-drop-01', 'Inspirado en estética de armaduras mecha de combate y kanjis distópicos.', 1, TRUE)
    ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_col_mecha;

    INSERT INTO public.coleccion (nombre, slug, descripcion, orden, activa)
    VALUES 
        ('Streetwear Zen // Core', 'streetwear-zen-core', 'Siluetas sobrias, espacio negativo y cortes japoneses tradicionales.', 2, TRUE)
    ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_col_zen;

    INSERT INTO public.coleccion (nombre, slug, descripcion, orden, activa)
    VALUES 
        ('Cyberpunk Tokyo // Spec', 'cyberpunk-tokyo-spec', 'Textiles técnicos, tipografía monospaciada y gráficos experimentales.', 3, TRUE)
    ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre
    RETURNING id INTO v_col_cyber;

    -- 2. Productos Principales

    -- 2.1 Samurai Mecha Kanji
    INSERT INTO public.producto (
        nombre, slug, descripcion, precio_venta, stock_minimo,
        activo, publicado, destacado, es_prioritario, coleccion_id
    )
    VALUES (
        'Samurai Mecha Kanji // Oversized Tee',
        'samurai-mecha-kanji-oversized-tee',
        'Polera boxy oversized confeccionada en algodón pesado 280 GSM con estampado frontal de mecha samurai en serigrafía neón de alto contraste y tipografía Shinjuku.',
        145.00, 4, TRUE, TRUE, TRUE, TRUE, v_col_mecha
    )
    ON CONFLICT (slug) DO UPDATE SET precio_venta = EXCLUDED.precio_venta
    RETURNING id INTO v_prod_samurai;

    -- Atributos Samurai
    INSERT INTO public.atributo_producto (producto_id, clave, valor, orden) VALUES
        (v_prod_samurai, 'talla', 'S', 1),
        (v_prod_samurai, 'talla', 'M', 2),
        (v_prod_samurai, 'talla', 'L', 3),
        (v_prod_samurai, 'talla', 'XL', 4),
        (v_prod_samurai, 'sku', 'ZRN-044', 0),
        (v_prod_samurai, 'tejido', 'Algodón Peinado 280 GSM', 5),
        (v_prod_samurai, 'construccion', 'Cuello Ribete 3.5cm // Doble Pespunte', 6),
        (v_prod_samurai, 'estampado', 'Serigrafía tacto cero 4 tintas Neón', 7)
    ON CONFLICT (producto_id, clave, valor) DO NOTHING;

    -- Imágenes Samurai
    INSERT INTO public.imagen (producto_id, url_imagen, tipo, es_portada, orden) VALUES
        (v_prod_samurai, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop', 'frontal', TRUE, 0),
        (v_prod_samurai, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop', 'dorsal', FALSE, 1)
    ON CONFLICT DO NOTHING;

    -- Stock Samurai en Central
    UPDATE public.inventario SET cantidad = 34 WHERE producto_id = v_prod_samurai AND ubicacion_id = v_ubicacion_central;

    -- 2.2 Cyber-Spine Heavy Hoodie
    INSERT INTO public.producto (
        nombre, slug, descripcion, precio_venta, stock_minimo,
        activo, publicado, destacado, es_prioritario, coleccion_id
    )
    VALUES (
        'Cyber-Spine 420GSM // Heavy Hoodie',
        'cyber-spine-heavy-hoodie',
        'Hoodie de gramaje pesado 420 GSM en algodón afelpado gris lavado con gráfico de columna vertebral biomecánica en serigrafía carmesí.',
        280.00, 4, TRUE, TRUE, TRUE, FALSE, v_col_cyber
    )
    ON CONFLICT (slug) DO UPDATE SET precio_venta = EXCLUDED.precio_venta
    RETURNING id INTO v_prod_spine;

    INSERT INTO public.atributo_producto (producto_id, clave, valor, orden) VALUES
        (v_prod_spine, 'talla', 'S', 1),
        (v_prod_spine, 'talla', 'M', 2),
        (v_prod_spine, 'talla', 'L', 3),
        (v_prod_spine, 'talla', 'XL', 4),
        (v_prod_spine, 'sku', 'ZRN-091', 0),
        (v_prod_spine, 'tejido', 'Heavyweight French Terry 420 GSM', 5),
        (v_prod_spine, 'construccion', 'Capucha estructurada doble capa', 6)
    ON CONFLICT (producto_id, clave, valor) DO NOTHING;

    INSERT INTO public.imagen (producto_id, url_imagen, tipo, es_portada, orden) VALUES
        (v_prod_spine, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop', 'frontal', TRUE, 0)
    ON CONFLICT DO NOTHING;

    UPDATE public.inventario SET cantidad = 62 WHERE producto_id = v_prod_spine AND ubicacion_id = v_ubicacion_central;

    -- 2.3 Cyber Geisha
    INSERT INTO public.producto (
        nombre, slug, descripcion, precio_venta, stock_minimo,
        activo, publicado, destacado, es_prioritario, coleccion_id
    )
    VALUES (
        'Cyber Geisha // Oversized Wireframe Tee',
        'cyber-geisha-oversized-wireframe-tee',
        'Polera negra con ilustración wireframe futurista y acentos tipográficos en rojo carmesí.',
        140.00, 4, TRUE, TRUE, FALSE, FALSE, v_col_mecha
    )
    ON CONFLICT (slug) DO UPDATE SET precio_venta = EXCLUDED.precio_venta
    RETURNING id INTO v_prod_geisha;

    INSERT INTO public.atributo_producto (producto_id, clave, valor, orden) VALUES
        (v_prod_geisha, 'talla', 'S', 1),
        (v_prod_geisha, 'talla', 'M', 2),
        (v_prod_geisha, 'talla', 'L', 3),
        (v_prod_geisha, 'sku', 'ZRN-CG04', 0)
    ON CONFLICT (producto_id, clave, valor) DO NOTHING;

    INSERT INTO public.imagen (producto_id, url_imagen, tipo, es_portada, orden) VALUES
        (v_prod_geisha, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop', 'frontal', TRUE, 0)
    ON CONFLICT DO NOTHING;

    UPDATE public.inventario SET cantidad = 22 WHERE producto_id = v_prod_geisha AND ubicacion_id = v_ubicacion_central;

    -- 2.4 Tokyo Vanguard
    INSERT INTO public.producto (
        nombre, slug, descripcion, precio_venta, stock_minimo,
        activo, publicado, destacado, es_prioritario, coleccion_id
    )
    VALUES (
        'Tokyo Vanguard // Boxy Tee',
        'tokyo-vanguard-boxy-tee',
        'Corte cuadrado minimalista con parche térmico kanji y costuras reforzadas.',
        130.00, 3, TRUE, TRUE, FALSE, FALSE, v_col_zen
    )
    ON CONFLICT (slug) DO UPDATE SET precio_venta = EXCLUDED.precio_venta
    RETURNING id INTO v_prod_vanguard;

    INSERT INTO public.atributo_producto (producto_id, clave, valor, orden) VALUES
        (v_prod_vanguard, 'talla', 'M', 1),
        (v_prod_vanguard, 'talla', 'L', 2),
        (v_prod_vanguard, 'sku', 'ZRN-TV09', 0)
    ON CONFLICT (producto_id, clave, valor) DO NOTHING;

    INSERT INTO public.imagen (producto_id, url_imagen, tipo, es_portada, orden) VALUES
        (v_prod_vanguard, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop', 'frontal', TRUE, 0)
    ON CONFLICT DO NOTHING;

    UPDATE public.inventario SET cantidad = 15 WHERE producto_id = v_prod_vanguard AND ubicacion_id = v_ubicacion_central;

END $$;
