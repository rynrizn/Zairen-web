-- ============================================================
-- ⛩️ ZAIREN LAB // SCRIPT MAESTRO INTEGRAL (ALL-IN-ONE SETUP)
-- ============================================================
-- Copia y pega TODO este archivo en el "SQL Editor" de Supabase
-- y presiona "RUN" para desplegar la base de datos completa.
-- Incluye: Tablas, Triggers, Vistas, Funciones RPC, RLS y Seed Data.
-- ============================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLAS BASE
CREATE TABLE IF NOT EXISTS public.configuracion (
    id INT PRIMARY KEY DEFAULT 1,
    marca TEXT NOT NULL DEFAULT 'ZAIREN LAB',
    slogan TEXT DEFAULT 'TOKYO EXPERIMENTAL APPAREL',
    logo_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '',
    moneda_codigo VARCHAR(10) NOT NULL DEFAULT 'BOB',
    moneda_simbolo VARCHAR(5) NOT NULL DEFAULT 'Bs',
    whatsapp_numero VARCHAR(30) DEFAULT '+59170000000',
    whatsapp_mensaje_template TEXT DEFAULT 'Hola Zairen Lab, deseo confirmar mi pedido:\n\n{items}\n\n*Total a pagar: {moneda} {total}*\n\n¿Tienen disponibilidad para despacho inmediato?',
    sitio_url TEXT DEFAULT 'https://zairenlab.com',
    seo_titulo TEXT DEFAULT 'ZAIREN LAB // Neo-Tokyo Zen Streetwear',
    seo_descripcion TEXT DEFAULT 'Indumentaria experimental streetwear fusionando minimalismo japonés, mecha cyberpunk y cortes oversized de alta confección.',
    seo_imagen_og TEXT DEFAULT '',
    redes_sociales JSONB NOT NULL DEFAULT '[
        {"id": "instagram", "nombre": "Instagram", "url": "https://instagram.com/zairenlab", "activo": true},
        {"id": "tiktok", "nombre": "TikTok", "url": "", "activo": false},
        {"id": "facebook", "nombre": "Facebook", "url": "", "activo": false}
    ]'::jsonb,
    canales_contacto JSONB NOT NULL DEFAULT '{
        "whatsapp": {"activo": true, "telefono": "+59170000000"},
        "instagram_dm": {"activo": false, "usuario": "@zairenlab"}
    }'::jsonb,
    politicas_envio JSONB NOT NULL DEFAULT '{
        "envio_gratis_minimo": 250,
        "costo_envio_express": 15,
        "ciudades_cobertura": ["La Paz", "Cochabamba", "Santa Cruz"]
    }'::jsonb,
    apariencia JSONB NOT NULL DEFAULT '{
        "hero_titulo": "NEO-TOKYO ZEN // PROTOCOL 2026",
        "hero_subtitulo": "Experimentación textil inspirada en Shinjuku y subculturas mecha cyberpunk.",
        "badge_hero": "DROP 01 // LIMITADO A 50 PIEZAS",
        "color_acento": "#dc143c"
    }'::jsonb,
    estados_producto JSONB NOT NULL DEFAULT '{
        "disponible": {"texto": "DISPONIBLE", "color": "#10B981"},
        "pocas_uds": {"texto": "POCAS UDS", "color": "#F59E0B"},
        "agotado": {"texto": "SOLD OUT", "color": "#EF4444"},
        "preventa": {"texto": "PRE-ORDER", "color": "#8B5CF6"}
    }'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row_config CHECK (id = 1)
);

INSERT INTO public.configuracion (id, marca) VALUES (1, 'ZAIREN LAB') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.coleccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    orden INT NOT NULL DEFAULT 0,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    precio_venta NUMERIC(12,2) NOT NULL,
    stock_minimo INT NOT NULL DEFAULT 4,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    publicado BOOLEAN NOT NULL DEFAULT FALSE,
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    es_prioritario BOOLEAN NOT NULL DEFAULT FALSE,
    estado_comercial VARCHAR(20) NOT NULL DEFAULT 'ninguno',
    coleccion_id UUID NOT NULL REFERENCES public.coleccion(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_precio_producto CHECK (precio_venta >= 0),
    CONSTRAINT chk_stock_minimo CHECK (stock_minimo >= 0),
    CONSTRAINT chk_estado_comercial CHECK (estado_comercial IN ('preventa', 'promocion', 'oferta', 'nuevo', 'ninguno'))
);

CREATE TABLE IF NOT EXISTS public.atributo_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE,
    clave VARCHAR(100) NOT NULL,
    valor VARCHAR(255) NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_atributo_producto UNIQUE (producto_id, clave, valor)
);

CREATE TABLE IF NOT EXISTS public.imagen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    public_id VARCHAR(255),
    tipo VARCHAR(30) DEFAULT 'frontal',
    es_portada BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_imagen_portada ON public.imagen(producto_id) WHERE es_portada = TRUE;

CREATE TABLE IF NOT EXISTS public.ubicacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO public.ubicacion (nombre, descripcion, activo)
VALUES ('CENTRAL', 'Almacén Central / Despacho Principal', TRUE)
ON CONFLICT (nombre) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE,
    ubicacion_id UUID NOT NULL REFERENCES public.ubicacion(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad INT NOT NULL DEFAULT 0,
    cantidad_reservada INT NOT NULL DEFAULT 0,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_inventario_producto_ubicacion UNIQUE (producto_id, ubicacion_id),
    CONSTRAINT chk_inventario_cantidad CHECK (cantidad >= 0),
    CONSTRAINT chk_inventario_reservado CHECK (cantidad_reservada >= 0),
    CONSTRAINT chk_reservado_no_supera_stock CHECK (cantidad_reservada <= cantidad)
);

CREATE TABLE IF NOT EXISTS public.perfil (
    id UUID PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'VENDEDOR',
    avatar_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_perfil_rol CHECK (rol IN ('SUPERADMIN', 'ADMIN', 'VENDEDOR', 'VISOR'))
);

CREATE TABLE IF NOT EXISTS public.cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    ci VARCHAR(30),
    email VARCHAR(150),
    ciudad VARCHAR(100),
    direccion TEXT,
    notas TEXT,
    tipo_cliente VARCHAR(20) NOT NULL DEFAULT 'NUEVO',
    cantidad_compras INT NOT NULL DEFAULT 0,
    total_gastado NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_contacto TIMESTAMPTZ,
    CONSTRAINT chk_tipo_cliente CHECK (tipo_cliente IN ('NUEVO', 'HABITUAL'))
);

CREATE TABLE IF NOT EXISTS public.pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden INT GENERATED ALWAYS AS IDENTITY,
    cliente_id UUID REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE SET NULL,
    cliente_nombre VARCHAR(150),
    cliente_telefono VARCHAR(30),
    origen VARCHAR(30) NOT NULL DEFAULT 'CATALOGO_WEB',
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    estado_reserva VARCHAR(20) NOT NULL DEFAULT 'SIN_RESERVA',
    fecha_limite_reserva TIMESTAMPTZ,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
    envio NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    observacion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_pedido_origen CHECK (origen IN ('CATALOGO_WEB', 'WHATSAPP_DIRECTO', 'INSTAGRAM', 'PRESENCIAL')),
    CONSTRAINT chk_pedido_estado CHECK (estado IN ('PENDIENTE', 'CONFIRMADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO')),
    CONSTRAINT chk_pedido_reserva CHECK (estado_reserva IN ('SIN_RESERVA', 'RESERVADO', 'LIBERADO', 'CONFIRMADO')),
    CONSTRAINT chk_pedido_montos CHECK (subtotal >= 0 AND descuento >= 0 AND envio >= 0 AND total >= 0),
    CONSTRAINT chk_descuento_pedido CHECK (descuento <= subtotal)
);

CREATE TABLE IF NOT EXISTS public.detalle_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    producto_nombre VARCHAR(200),
    atributos_snapshot TEXT,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_det_pedido_cant CHECK (cantidad > 0),
    CONSTRAINT chk_det_pedido_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_det_pedido_subtotal CHECK (subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS public.venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ticket INT GENERATED ALWAYS AS IDENTITY,
    tipo_venta VARCHAR(30) NOT NULL DEFAULT 'DIRECTA',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    observacion TEXT,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cliente_id UUID REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES public.perfil(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    pedido_id UUID UNIQUE REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_tipo_venta CHECK (tipo_venta IN ('DIRECTA', 'POS', 'PEDIDO_WEB')),
    CONSTRAINT chk_venta_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_venta_descuento CHECK (descuento >= 0),
    CONSTRAINT chk_venta_total CHECK (total >= 0),
    CONSTRAINT chk_venta_desc_valido CHECK (descuento <= subtotal)
);

CREATE TABLE IF NOT EXISTS public.detalle_venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES public.venta(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ubicacion_id UUID NOT NULL REFERENCES public.ubicacion(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    producto_nombre VARCHAR(200),
    atributos_snapshot TEXT,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_det_venta_cant CHECK (cantidad > 0),
    CONSTRAINT chk_det_venta_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_det_venta_subtotal CHECK (subtotal >= 0),
    CONSTRAINT uq_detalle_venta UNIQUE (venta_id, producto_id, ubicacion_id)
);

CREATE TABLE IF NOT EXISTS public.pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monto NUMERIC(12,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    tipo_pago VARCHAR(20) NOT NULL,
    estado_pago VARCHAR(20) NOT NULL,
    saldo_pendiente NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_efectivo NUMERIC(12,2) DEFAULT 0,
    monto_transferencia NUMERIC(12,2) DEFAULT 0,
    referencia VARCHAR(150),
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    venta_id UUID REFERENCES public.venta(id) ON UPDATE CASCADE ON DELETE CASCADE,
    pedido_id UUID REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_pago_monto CHECK (monto > 0),
    CONSTRAINT chk_pago_saldo CHECK (saldo_pendiente >= 0),
    CONSTRAINT chk_metodo_pago CHECK (metodo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'QR_SIMPLE', 'HIBRIDO')),
    CONSTRAINT chk_tipo_pago CHECK (tipo_pago IN ('COMPLETO', 'PARCIAL')),
    CONSTRAINT chk_estado_pago CHECK (estado_pago IN ('PENDIENTE', 'PAGADO')),
    CONSTRAINT chk_pago_origen CHECK ((venta_id IS NOT NULL AND pedido_id IS NULL) OR (venta_id IS NULL AND pedido_id IS NOT NULL)),
    CONSTRAINT chk_pago_hibrido CHECK (
        (metodo_pago = 'EFECTIVO' AND monto_efectivo = monto) OR
        (metodo_pago IN ('TRANSFERENCIA', 'QR_SIMPLE') AND monto_transferencia = monto) OR
        (metodo_pago = 'HIBRIDO' AND monto_efectivo > 0 AND monto_transferencia > 0 AND monto_efectivo + monto_transferencia = monto)
    )
);

CREATE TABLE IF NOT EXISTS public.movimiento_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_movimiento VARCHAR(40) NOT NULL,
    cantidad INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    reservado_anterior INT NOT NULL DEFAULT 0,
    reservado_nuevo INT NOT NULL DEFAULT 0,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT,
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    usuario_id UUID REFERENCES public.perfil(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ubicacion_origen_id UUID REFERENCES public.ubicacion(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ubicacion_destino_id UUID REFERENCES public.ubicacion(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    venta_id UUID REFERENCES public.venta(id) ON UPDATE CASCADE ON DELETE SET NULL,
    pedido_id UUID REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_movimiento_tipo CHECK (tipo_movimiento IN ('ENTRADA', 'AJUSTE', 'VENTA', 'RESERVA', 'CANCELACION_RESERVA', 'LIBERACION_RESERVA', 'TRASLADO_SALIDA', 'TRASLADO_ENTRADA', 'PEDIDO_CONFIRMADO', 'PEDIDO_CANCELADO')),
    CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_mov_stock CHECK (stock_anterior >= 0 AND stock_nuevo >= 0 AND reservado_anterior >= 0 AND reservado_nuevo >= 0)
);

CREATE TABLE IF NOT EXISTS public.log_actividad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.perfil(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    accion VARCHAR(60) NOT NULL,
    detalle TEXT,
    entidad_tipo VARCHAR(30),
    entidad_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRIGGERS
CREATE OR REPLACE FUNCTION public.fn_fecha_inventario() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.fecha_actualizacion := CURRENT_TIMESTAMP; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_fecha_inventario ON public.inventario;
CREATE TRIGGER trg_fecha_inventario BEFORE UPDATE ON public.inventario FOR EACH ROW EXECUTE FUNCTION public.fn_fecha_inventario();

CREATE OR REPLACE FUNCTION public.fn_crear_inventario_producto() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.inventario (producto_id, ubicacion_id, cantidad, cantidad_reservada)
    SELECT NEW.id, u.id, 0, 0 FROM public.ubicacion u WHERE u.activo = TRUE ON CONFLICT DO NOTHING;
    RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_crear_inventario_producto ON public.producto;
CREATE TRIGGER trg_crear_inventario_producto AFTER INSERT ON public.producto FOR EACH ROW EXECUTE FUNCTION public.fn_crear_inventario_producto();

CREATE OR REPLACE FUNCTION public.fn_crear_inventario_ubicacion() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.inventario (producto_id, ubicacion_id, cantidad, cantidad_reservada)
    SELECT p.id, NEW.id, 0, 0 FROM public.producto p WHERE p.activo = TRUE ON CONFLICT DO NOTHING;
    RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_crear_inventario_ubicacion ON public.ubicacion;
CREATE TRIGGER trg_crear_inventario_ubicacion AFTER INSERT ON public.ubicacion FOR EACH ROW EXECUTE FUNCTION public.fn_crear_inventario_ubicacion();

CREATE OR REPLACE FUNCTION public.fn_total_venta() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN v_id := OLD.venta_id; ELSE v_id := NEW.venta_id; END IF;
    UPDATE public.venta v SET
        subtotal = COALESCE((SELECT SUM(dv.subtotal) FROM public.detalle_venta dv WHERE dv.venta_id = v_id), 0),
        total = GREATEST(COALESCE((SELECT SUM(dv.subtotal) FROM public.detalle_venta dv WHERE dv.venta_id = v_id), 0) - v.descuento, 0)
    WHERE v.id = v_id;
    RETURN COALESCE(NEW, OLD);
END; $$;
DROP TRIGGER IF EXISTS trg_total_venta ON public.detalle_venta;
CREATE TRIGGER trg_total_venta AFTER INSERT OR UPDATE OR DELETE ON public.detalle_venta FOR EACH ROW EXECUTE FUNCTION public.fn_total_venta();

CREATE OR REPLACE FUNCTION public.fn_total_pedido() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN v_id := OLD.pedido_id; ELSE v_id := NEW.pedido_id; END IF;
    UPDATE public.pedido p SET
        subtotal = COALESCE((SELECT SUM(dp.subtotal) FROM public.detalle_pedido dp WHERE dp.pedido_id = v_id), 0),
        total = GREATEST(COALESCE((SELECT SUM(dp.subtotal) FROM public.detalle_pedido dp WHERE dp.pedido_id = v_id), 0) - p.descuento + p.envio, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE p.id = v_id;
    RETURN COALESCE(NEW, OLD);
END; $$;
DROP TRIGGER IF EXISTS trg_total_pedido ON public.detalle_pedido;
CREATE TRIGGER trg_total_pedido AFTER INSERT OR UPDATE OR DELETE ON public.detalle_pedido FOR EACH ROW EXECUTE FUNCTION public.fn_total_pedido();

CREATE OR REPLACE FUNCTION public.fn_actualizar_estadisticas_cliente() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.cliente_id IS NOT NULL THEN
        UPDATE public.cliente SET
            cantidad_compras = cantidad_compras + 1,
            total_gastado = total_gastado + NEW.total,
            ultimo_contacto = CURRENT_TIMESTAMP,
            tipo_cliente = CASE WHEN (cantidad_compras + 1) >= 2 THEN 'HABITUAL' ELSE 'NUEVO' END
        WHERE id = NEW.cliente_id;
    ELSIF TG_OP = 'DELETE' AND OLD.cliente_id IS NOT NULL THEN
        UPDATE public.cliente SET
            cantidad_compras = GREATEST(cantidad_compras - 1, 0),
            total_gastado = GREATEST(total_gastado - OLD.total, 0)
        WHERE id = OLD.cliente_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END; $$;
DROP TRIGGER IF EXISTS trg_actualizar_estadisticas_cliente ON public.venta;
CREATE TRIGGER trg_actualizar_estadisticas_cliente AFTER INSERT OR DELETE ON public.venta FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_estadisticas_cliente();

-- 4. VISTAS
CREATE OR REPLACE VIEW public.vw_catalogo_publico AS
SELECT
    p.id AS id_producto, p.nombre, p.slug, p.descripcion, p.precio_venta, p.stock_minimo, p.destacado, p.es_prioritario, p.estado_comercial,
    c.id AS id_coleccion, c.nombre AS coleccion, c.slug AS coleccion_slug,
    COALESCE((SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id AND img.es_portada = TRUE LIMIT 1), (SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id ORDER BY img.orden ASC LIMIT 1), '') AS imagen_portada,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0)::INT AS stock_disponible,
    COALESCE((SELECT array_agg(ap.valor ORDER BY ap.orden) FROM public.atributo_producto ap WHERE ap.producto_id = p.id AND LOWER(ap.clave) = 'talla'), '{}'::TEXT[]) AS tallas
FROM public.producto p
INNER JOIN public.coleccion c ON c.id = p.coleccion_id
LEFT JOIN public.inventario inv ON inv.producto_id = p.id
WHERE p.activo = TRUE AND p.publicado = TRUE AND c.activa = TRUE
GROUP BY p.id, p.nombre, p.slug, p.descripcion, p.precio_venta, p.stock_minimo, p.destacado, p.es_prioritario, p.estado_comercial, c.id, c.nombre, c.slug;

CREATE OR REPLACE VIEW public.vw_inventario AS
SELECT
    p.id AS id_producto, p.nombre, p.slug, p.precio_venta, p.stock_minimo, p.activo, p.publicado, p.destacado, p.es_prioritario, c.nombre AS coleccion,
    COALESCE((SELECT img.url_imagen FROM public.imagen img WHERE img.producto_id = p.id AND img.es_portada = TRUE LIMIT 1), '') AS imagen_portada,
    COALESCE(SUM(inv.cantidad), 0)::INT AS stock_total,
    COALESCE(SUM(inv.cantidad_reservada), 0)::INT AS stock_reservado,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0)::INT AS stock_disponible,
    CASE WHEN COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) <= 0 THEN 'AGOTADO' WHEN COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0) <= p.stock_minimo THEN 'POCAS_UDS' ELSE 'DISPONIBLE' END AS estado_stock
FROM public.producto p
INNER JOIN public.coleccion c ON c.id = p.coleccion_id
LEFT JOIN public.inventario inv ON inv.producto_id = p.id
GROUP BY p.id, p.nombre, p.slug, p.precio_venta, p.stock_minimo, p.activo, p.publicado, p.destacado, p.es_prioritario, c.nombre;

-- 5. RLS
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coleccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atributo_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimiento_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_actividad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_cfg" ON public.configuracion FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_all_cfg" ON public.configuracion FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_col" ON public.coleccion FOR SELECT TO anon, authenticated USING (activa = true);
CREATE POLICY "auth_all_col" ON public.coleccion FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_prd" ON public.producto FOR SELECT TO anon, authenticated USING (activo = true AND publicado = true);
CREATE POLICY "auth_all_prd" ON public.producto FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_atr" ON public.atributo_producto FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_all_atr" ON public.atributo_producto FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_img" ON public.imagen FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_all_img" ON public.imagen FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_inv" ON public.inventario FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_all_inv" ON public.inventario FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_ubc" ON public.ubicacion FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_prf" ON public.perfil FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_clt" ON public.cliente FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_ins_ped" ON public.pedido FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_all_ped" ON public.pedido FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_ins_dtp" ON public.detalle_pedido FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_all_dtp" ON public.detalle_pedido FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_vnt" ON public.venta FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_dtv" ON public.detalle_venta FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_pag" ON public.pago FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_mov" ON public.movimiento_inventario FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_log" ON public.log_actividad FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.pedido, public.detalle_pedido, public.cliente TO anon;

-- FIN DEL SCRIPT MAESTRO INTEGRAL
