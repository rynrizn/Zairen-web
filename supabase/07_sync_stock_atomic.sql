-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 07: SINCRONIZACIÓN ATÓMICA DE STOCK POR TALLA Y PEDIDOS
-- Migración revisable: Sincroniza atributo_producto (stock_S/M/L/XL)
-- con public.inventario y registra pedidos web de forma transaccional.
-- ============================================================

-- 1. FUNCIÓN: revalidar_stock_carrito
-- Permite chequear en milisegundos si las tallas del carrito siguen disponibles
CREATE OR REPLACE FUNCTION public.revalidar_stock_carrito(
    p_items JSONB -- Array de { producto_id: UUID, talla: VARCHAR, cantidad: INT }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item RECORD;
    v_attr_stock INT;
    v_results JSONB := '[]'::jsonb;
    v_has_error BOOLEAN := FALSE;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) 
        AS x(producto_id UUID, talla TEXT, cantidad INT, nombre TEXT)
    LOOP
        -- Consultar el stock específico de la talla en atributo_producto
        SELECT COALESCE(NULLIF(TRIM(valor), '')::INT, 0)
        INTO v_attr_stock
        FROM public.atributo_producto
        WHERE producto_id = v_item.producto_id 
          AND LOWER(clave) = LOWER('stock_' || TRIM(v_item.talla))
        LIMIT 1;

        IF v_attr_stock IS NULL THEN
            -- Si no hay atributo de stock_TALLA, consultar el total en inventario
            SELECT COALESCE(SUM(cantidad - cantidad_reservada), 0)::INT
            INTO v_attr_stock
            FROM public.inventario
            WHERE producto_id = v_item.producto_id;
        END IF;

        v_attr_stock := COALESCE(v_attr_stock, 0);

        IF v_attr_stock < v_item.cantidad THEN
            v_has_error := TRUE;
            v_results := v_results || jsonb_build_object(
                'producto_id', v_item.producto_id,
                'nombre', v_item.nombre,
                'talla', v_item.talla,
                'solicitado', v_item.cantidad,
                'disponible', v_attr_stock,
                'agotado', (v_attr_stock <= 0)
            );
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'valido', NOT v_has_error,
        'conflictos', v_results
    );
END;
$$;


-- 2. FUNCIÓN RPC ATÓMICA: procesar_checkout_pedido
-- Valida stock con bloqueo pesimista (FOR UPDATE), crea el pedido PENDIENTE
-- con sus renglones y descuenta el stock específico de la talla en una sola transacción.
CREATE OR REPLACE FUNCTION public.procesar_checkout_pedido(
    p_cliente_nombre VARCHAR,
    p_cliente_telefono VARCHAR,
    p_items JSONB, -- Array de { producto_id, nombre, talla, cantidad, precio, sku }
    p_subtotal NUMERIC,
    p_envio NUMERIC,
    p_total NUMERIC,
    p_observacion TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_cliente UUID := NULL;
    v_id_pedido UUID;
    v_id_central UUID;
    v_item RECORD;
    v_attr_id UUID;
    v_stock_actual INT;
    v_stock_nuevo INT;
    v_total_prod_stock INT;
    v_prod_nombre VARCHAR;
BEGIN
    -- Obtener ubicación CENTRAL
    SELECT id INTO v_id_central FROM public.ubicacion WHERE nombre = 'CENTRAL' LIMIT 1;
    IF v_id_central IS NULL THEN
        SELECT id INTO v_id_central FROM public.ubicacion LIMIT 1;
    END IF;

    -- Validar cliente (registrar o recuperar)
    IF p_cliente_telefono IS NOT NULL AND TRIM(p_cliente_telefono) <> '' THEN
        SELECT id INTO v_id_cliente FROM public.cliente WHERE telefono = TRIM(p_cliente_telefono) LIMIT 1;
        IF v_id_cliente IS NULL THEN
            INSERT INTO public.cliente (nombre, telefono, tipo_cliente)
            VALUES (COALESCE(TRIM(p_cliente_nombre), 'Cliente Web'), TRIM(p_cliente_telefono), 'NUEVO')
            RETURNING id INTO v_id_cliente;
        END IF;
    END IF;

    -- Crear orden de pedido con estado PENDIENTE
    INSERT INTO public.pedido (
        cliente_id, cliente_nombre, cliente_telefono, origen, estado,
        estado_reserva, subtotal, envio, total, observacion
    )
    VALUES (
        v_id_cliente, TRIM(p_cliente_nombre), TRIM(p_cliente_telefono), 'CATALOGO_WEB', 'PENDIENTE',
        'RESERVADO', p_subtotal, p_envio, p_total, p_observacion
    )
    RETURNING id INTO v_id_pedido;

    -- Procesar cada prenda bloqueando las filas correspondientes
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) 
        AS x(producto_id UUID, nombre TEXT, talla TEXT, cantidad INT, precio NUMERIC, sku TEXT)
    LOOP
        -- 1. Bloqueo de producto
        SELECT nombre INTO v_prod_nombre
        FROM public.producto
        WHERE id = v_item.producto_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto no encontrado: %', v_item.producto_id;
        END IF;

        -- 2. Bloqueo y verificación de la talla en atributo_producto
        SELECT id, COALESCE(NULLIF(TRIM(valor), '')::INT, 0)
        INTO v_attr_id, v_stock_actual
        FROM public.atributo_producto
        WHERE producto_id = v_item.producto_id 
          AND LOWER(clave) = LOWER('stock_' || TRIM(v_item.talla))
        FOR UPDATE;

        IF v_attr_id IS NOT NULL THEN
            IF v_stock_actual < v_item.cantidad THEN
                RAISE EXCEPTION 'STOCK_INSUFICIENTE: La talla % de "%" solo tiene % unidad(es) disponible(s).',
                    v_item.talla, COALESCE(v_prod_nombre, v_item.nombre), v_stock_actual;
            END IF;

            v_stock_nuevo := v_stock_actual - v_item.cantidad;

            -- Descontar en atributo_producto
            UPDATE public.atributo_producto
            SET valor = v_stock_nuevo::TEXT
            WHERE id = v_attr_id;
        END IF;

        -- 3. Descontar en inventario general
        IF v_id_central IS NOT NULL THEN
            UPDATE public.inventario
            SET cantidad = GREATEST(0, cantidad - v_item.cantidad)
            WHERE producto_id = v_item.producto_id AND ubicacion_id = v_id_central;
        END IF;

        -- 4. Registrar en detalle_pedido
        INSERT INTO public.detalle_pedido (
            pedido_id, producto_id, producto_nombre, atributos_snapshot,
            cantidad, precio_unitario, subtotal
        )
        VALUES (
            v_id_pedido, v_item.producto_id, COALESCE(v_prod_nombre, v_item.nombre),
            'Talla: ' || UPPER(TRIM(v_item.talla)) || COALESCE(' // SKU: ' || v_item.sku, ''),
            v_item.cantidad, v_item.precio, v_item.cantidad * v_item.precio
        );

        -- 5. Registrar Kardex en movimiento_inventario
        INSERT INTO public.movimiento_inventario (
            tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
            observacion, producto_id, pedido_id, ubicacion_origen_id
        )
        VALUES (
            'RESERVA', v_item.cantidad, COALESCE(v_stock_actual, 0), COALESCE(v_stock_nuevo, 0),
            'Checkout Web WhatsApp - Talla ' || UPPER(TRIM(v_item.talla)),
            v_item.producto_id, v_id_pedido, v_id_central
        );

        -- 6. Verificar si todas las tallas llegaron a 0 para actualizar estado comercial a 'agotado'
        SELECT COALESCE(SUM(NULLIF(TRIM(valor), '')::INT), 0)
        INTO v_total_prod_stock
        FROM public.atributo_producto
        WHERE producto_id = v_item.producto_id AND clave ILIKE 'stock_%';

        IF v_total_prod_stock <= 0 THEN
            UPDATE public.producto
            SET estado_comercial = 'agotado'
            WHERE id = v_item.producto_id;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'pedido_id', v_id_pedido
    );
END;
$$;
