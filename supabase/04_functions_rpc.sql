-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 04: FUNCIONES RPC TRANSACCIONALES (ATÓMICAS)
-- Patrón Staging de Moonstone con manejo de excepciones y rollback
-- ============================================================

-- ============================================================
-- 1. RPC: crear_producto_completo
-- Inserta producto, colección si no existe, atributos clave-valor,
-- imágenes frontal/dorsal y stock inicial en un solo viaje atómico.
-- ============================================================
CREATE OR REPLACE FUNCTION public.crear_producto_completo(
    p_nombre VARCHAR,
    p_slug VARCHAR,
    p_descripcion TEXT,
    p_precio NUMERIC,
    p_coleccion_nombre VARCHAR,
    p_stock_inicial INT DEFAULT 0,
    p_stock_minimo INT DEFAULT 4,
    p_publicado BOOLEAN DEFAULT TRUE,
    p_destacado BOOLEAN DEFAULT FALSE,
    p_es_prioritario BOOLEAN DEFAULT FALSE,
    p_atributos JSONB DEFAULT '[]'::jsonb, -- Array de {clave, valor}
    p_imagen_portada TEXT DEFAULT '',
    p_imagen_dorsal TEXT DEFAULT '',
    p_usuario_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_coleccion UUID;
    v_id_producto UUID;
    v_id_ubicacion UUID;
    v_item RECORD;
BEGIN
    -- Validaciones de entrada
    IF TRIM(p_nombre) = '' THEN
        RAISE EXCEPTION 'El nombre del producto no puede estar vacío';
    END IF;
    IF p_precio < 0 THEN
        RAISE EXCEPTION 'El precio no puede ser negativo';
    END IF;

    -- Buscar o crear colección
    SELECT id INTO v_id_coleccion 
    FROM public.coleccion 
    WHERE LOWER(nombre) = LOWER(TRIM(p_coleccion_nombre)) LIMIT 1;

    IF v_id_coleccion IS NULL THEN
        INSERT INTO public.coleccion (nombre, slug, activa)
        VALUES (
            TRIM(p_coleccion_nombre),
            LOWER(REGEXP_REPLACE(TRIM(p_coleccion_nombre), '[^a-zA-Z0-9]+', '-', 'g')),
            TRUE
        )
        RETURNING id INTO v_id_coleccion;
    END IF;

    -- Insertar Producto
    INSERT INTO public.producto (
        nombre, slug, descripcion, precio_venta, stock_minimo,
        activo, publicado, destacado, es_prioritario, coleccion_id
    )
    VALUES (
        TRIM(p_nombre),
        LOWER(TRIM(p_slug)),
        p_descripcion,
        p_precio,
        p_stock_minimo,
        TRUE,
        p_publicado,
        p_destacado,
        p_es_prioritario,
        v_id_coleccion
    )
    RETURNING id INTO v_id_producto;

    -- Insertar Atributos Clave-Valor (talla, tejido, etc.)
    IF p_atributos IS NOT NULL AND jsonb_array_length(p_atributos) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_to_recordset(p_atributos) AS x(clave TEXT, valor TEXT, orden INT)
        LOOP
            INSERT INTO public.atributo_producto (producto_id, clave, valor, orden)
            VALUES (v_id_producto, TRIM(v_item.clave), TRIM(v_item.valor), COALESCE(v_item.orden, 0))
            ON CONFLICT (producto_id, clave, valor) DO NOTHING;
        END LOOP;
    END IF;

    -- Insertar Imágenes
    IF p_imagen_portada IS NOT NULL AND TRIM(p_imagen_portada) <> '' THEN
        INSERT INTO public.imagen (producto_id, url_imagen, tipo, es_portada, orden)
        VALUES (v_id_producto, TRIM(p_imagen_portada), 'frontal', TRUE, 0);
    END IF;

    IF p_imagen_dorsal IS NOT NULL AND TRIM(p_imagen_dorsal) <> '' THEN
        INSERT INTO public.imagen (producto_id, url_imagen, tipo, es_portada, orden)
        VALUES (v_id_producto, TRIM(p_imagen_dorsal), 'dorsal', FALSE, 1);
    END IF;

    -- Obtener ubicación central
    SELECT id INTO v_id_ubicacion FROM public.ubicacion WHERE nombre = 'CENTRAL' LIMIT 1;
    IF v_id_ubicacion IS NOT NULL AND p_stock_inicial > 0 THEN
        UPDATE public.inventario
        SET cantidad = p_stock_inicial
        WHERE producto_id = v_id_producto AND ubicacion_id = v_id_ubicacion;

        -- Registrar movimiento kardex
        IF p_usuario_id IS NOT NULL THEN
            INSERT INTO public.movimiento_inventario (
                tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
                producto_id, usuario_id, ubicacion_destino_id, observacion
            )
            VALUES (
                'ENTRADA', p_stock_inicial, 0, p_stock_inicial,
                v_id_producto, p_usuario_id, v_id_ubicacion, 'Stock inicial al crear producto'
            );
        END IF;
    END IF;

    RETURN v_id_producto;
END;
$$;


-- ============================================================
-- 2. RPC: ingresar_stock (Kardex seguro con auditoría)
-- ============================================================
CREATE OR REPLACE FUNCTION public.ingresar_stock(
    p_producto_id UUID,
    p_ubicacion_id UUID,
    p_cantidad INT,
    p_usuario_id UUID,
    p_observacion TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_anterior INT;
    v_reservado INT;
    v_nuevo INT;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a cero';
    END IF;

    SELECT cantidad, cantidad_reservada
    INTO v_anterior, v_reservado
    FROM public.inventario
    WHERE producto_id = p_producto_id AND ubicacion_id = p_ubicacion_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe registro de inventario para el producto y ubicación indicados';
    END IF;

    v_nuevo := v_anterior + p_cantidad;

    UPDATE public.inventario
    SET cantidad = v_nuevo
    WHERE producto_id = p_producto_id AND ubicacion_id = p_ubicacion_id;

    INSERT INTO public.movimiento_inventario (
        tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
        reservado_anterior, reservado_nuevo, observacion,
        producto_id, usuario_id, ubicacion_destino_id
    )
    VALUES (
        'ENTRADA', p_cantidad, v_anterior, v_nuevo,
        v_reservado, v_reservado, p_observacion,
        p_producto_id, p_usuario_id, p_ubicacion_id
    );
END;
$$;


-- ============================================================
-- 3. RPC: ajustar_stock (Ajuste físico de inventario)
-- ============================================================
CREATE OR REPLACE FUNCTION public.ajustar_stock(
    p_producto_id UUID,
    p_ubicacion_id UUID,
    p_nueva_cantidad INT,
    p_usuario_id UUID,
    p_observacion TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_anterior INT;
    v_reservado INT;
BEGIN
    IF p_nueva_cantidad < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo';
    END IF;

    SELECT cantidad, cantidad_reservada
    INTO v_anterior, v_reservado
    FROM public.inventario
    WHERE producto_id = p_producto_id AND ubicacion_id = p_ubicacion_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventario inexistente';
    END IF;

    IF p_nueva_cantidad < v_reservado THEN
        RAISE EXCEPTION 'El nuevo stock no puede ser menor a las unidades actualmente reservadas (%)', v_reservado;
    END IF;

    UPDATE public.inventario
    SET cantidad = p_nueva_cantidad
    WHERE producto_id = p_producto_id AND ubicacion_id = p_ubicacion_id;

    INSERT INTO public.movimiento_inventario (
        tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
        reservado_anterior, reservado_nuevo, observacion,
        producto_id, usuario_id, ubicacion_origen_id
    )
    VALUES (
        'AJUSTE', ABS(p_nueva_cantidad - v_anterior), v_anterior, p_nueva_cantidad,
        v_reservado, v_reservado, p_observacion,
        p_producto_id, p_usuario_id, p_ubicacion_id
    );
END;
$$;


-- ============================================================
-- 4. RPC: mover_stock (Traslados entre sedes/almacenes)
-- ============================================================
CREATE OR REPLACE FUNCTION public.mover_stock(
    p_producto_id UUID,
    p_origen_id UUID,
    p_destino_id UUID,
    p_cantidad INT,
    p_usuario_id UUID,
    p_observacion TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stock_origen INT;
    v_res_origen INT;
    v_stock_dest INT;
    v_res_dest INT;
BEGIN
    IF p_origen_id = p_destino_id THEN
        RAISE EXCEPTION 'La ubicación de origen y destino no pueden ser iguales';
    END IF;
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a cero';
    END IF;

    SELECT cantidad, cantidad_reservada INTO v_stock_origen, v_res_origen
    FROM public.inventario WHERE producto_id = p_producto_id AND ubicacion_id = p_origen_id FOR UPDATE;

    SELECT cantidad, cantidad_reservada INTO v_stock_dest, v_res_dest
    FROM public.inventario WHERE producto_id = p_producto_id AND ubicacion_id = p_destino_id FOR UPDATE;

    IF (v_stock_origen - v_res_origen) < p_cantidad THEN
        RAISE EXCEPTION 'Stock disponible insuficiente en origen para trasladar. Disponible: %', (v_stock_origen - v_res_origen);
    END IF;

    UPDATE public.inventario SET cantidad = cantidad - p_cantidad
    WHERE producto_id = p_producto_id AND ubicacion_id = p_origen_id;

    UPDATE public.inventario SET cantidad = cantidad + p_cantidad
    WHERE producto_id = p_producto_id AND ubicacion_id = p_destino_id;

    INSERT INTO public.movimiento_inventario (
        tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
        reservado_anterior, reservado_nuevo, observacion,
        producto_id, usuario_id, ubicacion_origen_id, ubicacion_destino_id
    )
    VALUES (
        'TRASLADO_SALIDA', p_cantidad, v_stock_origen, v_stock_origen - p_cantidad,
        v_res_origen, v_res_origen, p_observacion,
        p_producto_id, p_usuario_id, p_origen_id, p_destino_id
    );

    INSERT INTO public.movimiento_inventario (
        tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
        reservado_anterior, reservado_nuevo, observacion,
        producto_id, usuario_id, ubicacion_origen_id, ubicacion_destino_id
    )
    VALUES (
        'TRASLADO_ENTRADA', p_cantidad, v_stock_dest, v_stock_dest + p_cantidad,
        v_res_dest, v_res_dest, p_observacion,
        p_producto_id, p_usuario_id, p_origen_id, p_destino_id
    );
END;
$$;


-- ============================================================
-- 5. RPC: crear_pedido_web (Checkout Catálogo con reserva opcional)
-- ============================================================
CREATE OR REPLACE FUNCTION public.crear_pedido_web(
    p_cliente_nombre VARCHAR,
    p_cliente_telefono VARCHAR,
    p_items JSONB, -- Array de {producto_id, cantidad, precio, snapshot_atributos}
    p_descuento NUMERIC DEFAULT 0,
    p_envio NUMERIC DEFAULT 0,
    p_observacion TEXT DEFAULT NULL,
    p_reservar_stock BOOLEAN DEFAULT TRUE,
    p_limite_horas INT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_cliente UUID;
    v_id_pedido UUID;
    v_item RECORD;
    v_fecha_limite TIMESTAMPTZ := NULL;
    v_id_central UUID;
BEGIN
    -- Registrar o recuperar cliente por teléfono
    IF p_cliente_telefono IS NOT NULL AND TRIM(p_cliente_telefono) <> '' THEN
        SELECT id INTO v_id_cliente FROM public.cliente WHERE telefono = TRIM(p_cliente_telefono) LIMIT 1;
        IF v_id_cliente IS NULL THEN
            INSERT INTO public.cliente (nombre, telefono, tipo_cliente)
            VALUES (TRIM(p_cliente_nombre), TRIM(p_cliente_telefono), 'NUEVO')
            RETURNING id INTO v_id_cliente;
        END IF;
    END IF;

    IF p_limite_horas IS NOT NULL AND p_limite_horas > 0 THEN
        v_fecha_limite := CURRENT_TIMESTAMP + (p_limite_horas || ' hours')::INTERVAL;
    END IF;

    -- Crear orden de pedido
    INSERT INTO public.pedido (
        cliente_id, cliente_nombre, cliente_telefono, origen, estado,
        estado_reserva, fecha_limite_reserva, descuento, envio, observacion
    )
    VALUES (
        v_id_cliente, TRIM(p_cliente_nombre), TRIM(p_cliente_telefono), 'CATALOGO_WEB', 'PENDIENTE',
        CASE WHEN p_reservar_stock THEN 'RESERVADO' ELSE 'SIN_RESERVA' END,
        v_fecha_limite, p_descuento, p_envio, p_observacion
    )
    RETURNING id INTO v_id_pedido;

    SELECT id INTO v_id_central FROM public.ubicacion WHERE nombre = 'CENTRAL' LIMIT 1;

    -- Procesar renglones de pedido
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) 
        AS x(producto_id UUID, nombre TEXT, cantidad INT, precio NUMERIC, atributos TEXT)
    LOOP
        INSERT INTO public.detalle_pedido (
            pedido_id, producto_id, producto_nombre, atributos_snapshot,
            cantidad, precio_unitario, subtotal
        )
        VALUES (
            v_id_pedido, v_item.producto_id, v_item.nombre, v_item.atributos,
            v_item.cantidad, v_item.precio, v_item.cantidad * v_item.precio
        );

        -- Reservar stock si está configurado
        IF p_reservar_stock AND v_id_central IS NOT NULL THEN
            UPDATE public.inventario
            SET cantidad_reservada = cantidad_reservada + v_item.cantidad
            WHERE producto_id = v_item.producto_id AND ubicacion_id = v_id_central;

            INSERT INTO public.movimiento_inventario (
                tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
                observacion, producto_id, pedido_id, ubicacion_origen_id
            )
            VALUES (
                'RESERVA', v_item.cantidad, 0, 0,
                'Reserva automática por pedido web', v_item.producto_id, v_id_pedido, v_id_central
            );
        END IF;
    END LOOP;

    RETURN v_id_pedido;
END;
$$;


-- ============================================================
-- 6. RPC: registrar_venta_pos (Punto de Venta Mostrador y Pagos Híbridos)
-- ============================================================
CREATE OR REPLACE FUNCTION public.registrar_venta_pos(
    p_usuario_id UUID,
    p_cliente_nombre VARCHAR,
    p_cliente_telefono VARCHAR,
    p_items JSONB, -- Array de {producto_id, cantidad, precio, snapshot_atributos}
    p_descuento NUMERIC DEFAULT 0,
    p_metodo_pago VARCHAR DEFAULT 'EFECTIVO',
    p_monto_efectivo NUMERIC DEFAULT 0,
    p_monto_transferencia NUMERIC DEFAULT 0,
    p_referencia VARCHAR DEFAULT NULL,
    p_observacion TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_cliente UUID := NULL;
    v_id_venta UUID;
    v_id_central UUID;
    v_item RECORD;
    v_subtotal NUMERIC := 0;
    v_total NUMERIC := 0;
BEGIN
    SELECT id INTO v_id_central FROM public.ubicacion WHERE nombre = 'CENTRAL' LIMIT 1;
    IF v_id_central IS NULL THEN
        SELECT id INTO v_id_central FROM public.ubicacion LIMIT 1;
    END IF;

    -- Registrar cliente si se proporciona teléfono
    IF p_cliente_telefono IS NOT NULL AND TRIM(p_cliente_telefono) <> '' THEN
        SELECT id INTO v_id_cliente FROM public.cliente WHERE telefono = TRIM(p_cliente_telefono) LIMIT 1;
        IF v_id_cliente IS NULL THEN
            INSERT INTO public.cliente (nombre, telefono, tipo_cliente)
            VALUES (COALESCE(TRIM(p_cliente_nombre), 'Cliente Mostrador'), TRIM(p_cliente_telefono), 'NUEVO')
            RETURNING id INTO v_id_cliente;
        END IF;
    END IF;

    -- Crear Venta
    INSERT INTO public.venta (
        tipo_venta, subtotal, descuento, total, observacion, cliente_id, usuario_id
    )
    VALUES (
        'POS', 0, p_descuento, 0, p_observacion, v_id_cliente, p_usuario_id
    )
    RETURNING id INTO v_id_venta;

    -- Renglones y deducción de stock físico
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) 
        AS x(producto_id UUID, nombre TEXT, cantidad INT, precio NUMERIC, atributos TEXT)
    LOOP
        INSERT INTO public.detalle_venta (
            venta_id, producto_id, ubicacion_id, producto_nombre, atributos_snapshot,
            cantidad, precio_unitario, subtotal
        )
        VALUES (
            v_id_venta, v_item.producto_id, v_id_central, v_item.nombre, v_item.atributos,
            v_item.cantidad, v_item.precio, v_item.cantidad * v_item.precio
        );

        -- Descontar inventario físico
        UPDATE public.inventario
        SET cantidad = GREATEST(0, cantidad - v_item.cantidad)
        WHERE producto_id = v_item.producto_id AND ubicacion_id = v_id_central;

        -- Registrar en Kardex
        INSERT INTO public.movimiento_inventario (
            tipo_movimiento, cantidad, stock_anterior, stock_nuevo,
            observacion, producto_id, usuario_id, venta_id, ubicacion_origen_id
        )
        VALUES (
            'VENTA', v_item.cantidad, 0, 0,
            'Venta en mostrador POS', v_item.producto_id, p_usuario_id, v_id_venta, v_id_central
        );
    END LOOP;

    -- Obtener total recalculado por trigger
    SELECT total INTO v_total FROM public.venta WHERE id = v_id_venta;

    -- Registrar Pago
    INSERT INTO public.pago (
        venta_id, monto, metodo_pago, tipo_pago, estado_pago,
        monto_efectivo, monto_transferencia, referencia
    )
    VALUES (
        v_id_venta, v_total, p_metodo_pago, 'COMPLETO', 'PAGADO',
        CASE WHEN p_metodo_pago = 'EFECTIVO' THEN v_total ELSE p_monto_efectivo END,
        CASE WHEN p_metodo_pago IN ('TRANSFERENCIA', 'QR_SIMPLE') THEN v_total ELSE p_monto_transferencia END,
        p_referencia
    );

    RETURN v_id_venta;
END;
$$;
