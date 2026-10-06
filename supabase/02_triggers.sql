-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 02: TRIGGERS AUTOMÁTICOS DE INTEGRIDAD
-- ============================================================

-- 1. Actualizar fecha de actualización del inventario
CREATE OR REPLACE FUNCTION public.fn_fecha_inventario()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fecha_inventario ON public.inventario;
CREATE TRIGGER trg_fecha_inventario
BEFORE UPDATE ON public.inventario
FOR EACH ROW
EXECUTE FUNCTION public.fn_fecha_inventario();


-- 2. Crear inventario automáticamente en todas las ubicaciones activas al insertar un producto
CREATE OR REPLACE FUNCTION public.fn_crear_inventario_producto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.inventario (producto_id, ubicacion_id, cantidad, cantidad_reservada)
    SELECT
        NEW.id,
        u.id,
        0,
        0
    FROM public.ubicacion u
    WHERE u.activo = TRUE
    ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crear_inventario_producto ON public.producto;
CREATE TRIGGER trg_crear_inventario_producto
AFTER INSERT ON public.producto
FOR EACH ROW
EXECUTE FUNCTION public.fn_crear_inventario_producto();


-- 3. Crear inventario para todos los productos activos al añadir una nueva ubicación/sucursal
CREATE OR REPLACE FUNCTION public.fn_crear_inventario_ubicacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.inventario (producto_id, ubicacion_id, cantidad, cantidad_reservada)
    SELECT
        p.id,
        NEW.id,
        0,
        0
    FROM public.producto p
    WHERE p.activo = TRUE
    ON CONFLICT (producto_id, ubicacion_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crear_inventario_ubicacion ON public.ubicacion;
CREATE TRIGGER trg_crear_inventario_ubicacion
AFTER INSERT ON public.ubicacion
FOR EACH ROW
EXECUTE FUNCTION public.fn_crear_inventario_ubicacion();


-- 4. Recalcular subtotal y total de venta al alterar renglones de venta
CREATE OR REPLACE FUNCTION public.fn_total_venta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_id_venta := OLD.venta_id;
    ELSE
        v_id_venta := NEW.venta_id;
    END IF;

    UPDATE public.venta v
    SET
        subtotal = COALESCE(
            (SELECT SUM(dv.subtotal) FROM public.detalle_venta dv WHERE dv.venta_id = v_id_venta),
            0
        ),
        total = GREATEST(
            COALESCE(
                (SELECT SUM(dv.subtotal) FROM public.detalle_venta dv WHERE dv.venta_id = v_id_venta),
                0
            ) - v.descuento,
            0
        )
    WHERE v.id = v_id_venta;

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_total_venta ON public.detalle_venta;
CREATE TRIGGER trg_total_venta
AFTER INSERT OR UPDATE OR DELETE ON public.detalle_venta
FOR EACH ROW
EXECUTE FUNCTION public.fn_total_venta();


-- 5. Recalcular total de venta si se modifica el descuento
CREATE OR REPLACE FUNCTION public.fn_descuento_venta()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.total := GREATEST(NEW.subtotal - NEW.descuento, 0);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_descuento_venta ON public.venta;
CREATE TRIGGER trg_descuento_venta
BEFORE UPDATE OF descuento ON public.venta
FOR EACH ROW
EXECUTE FUNCTION public.fn_descuento_venta();


-- 6. Recalcular subtotal y total de pedido al alterar renglones
CREATE OR REPLACE FUNCTION public.fn_total_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_pedido UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_id_pedido := OLD.pedido_id;
    ELSE
        v_id_pedido := NEW.pedido_id;
    END IF;

    UPDATE public.pedido p
    SET
        subtotal = COALESCE(
            (SELECT SUM(dp.subtotal) FROM public.detalle_pedido dp WHERE dp.pedido_id = v_id_pedido),
            0
        ),
        total = GREATEST(
            COALESCE(
                (SELECT SUM(dp.subtotal) FROM public.detalle_pedido dp WHERE dp.pedido_id = v_id_pedido),
                0
            ) - p.descuento + p.envio,
            0
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE p.id = v_id_pedido;

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_total_pedido ON public.detalle_pedido;
CREATE TRIGGER trg_total_pedido
AFTER INSERT OR UPDATE OR DELETE ON public.detalle_pedido
FOR EACH ROW
EXECUTE FUNCTION public.fn_total_pedido();


-- 7. Actualizar historial de compras y total gastado por cliente tras cada venta
CREATE OR REPLACE FUNCTION public.fn_actualizar_estadisticas_cliente()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.cliente_id IS NOT NULL THEN
            UPDATE public.cliente
            SET
                cantidad_compras = cantidad_compras + 1,
                total_gastado = total_gastado + NEW.total,
                ultimo_contacto = CURRENT_TIMESTAMP,
                tipo_cliente = CASE WHEN (cantidad_compras + 1) >= 2 THEN 'HABITUAL' ELSE 'NUEVO' END
            WHERE id = NEW.cliente_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.cliente_id IS NOT NULL THEN
            UPDATE public.cliente
            SET
                cantidad_compras = GREATEST(cantidad_compras - 1, 0),
                total_gastado = GREATEST(total_gastado - OLD.total, 0)
            WHERE id = OLD.cliente_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_actualizar_estadisticas_cliente ON public.venta;
CREATE TRIGGER trg_actualizar_estadisticas_cliente
AFTER INSERT OR DELETE ON public.venta
FOR EACH ROW
EXECUTE FUNCTION public.fn_actualizar_estadisticas_cliente();
