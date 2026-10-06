-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2 (Fusión Moonstone + Zairen)
-- ARCHIVO 01: TABLAS, RELACIONES Y RESTRICCIONES (CONSTRAINTS)
-- ============================================================

-- Habilitar extensión para UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLA: configuracion (Singleton id=1)
-- Permite adaptar la tienda a cualquier rubro sin tocar código
-- ============================================================
CREATE TABLE IF NOT EXISTS public.configuracion (
    id INT PRIMARY KEY DEFAULT 1,
    marca TEXT NOT NULL DEFAULT 'ZAIREN LAB',
    slogan TEXT DEFAULT 'TOKYO EXPERIMENTAL APPAREL',
    logo_url TEXT DEFAULT '',
    favicon_url TEXT DEFAULT '',
    
    -- Moneda
    moneda_codigo VARCHAR(10) NOT NULL DEFAULT 'BOB',
    moneda_simbolo VARCHAR(5) NOT NULL DEFAULT 'Bs',
    
    -- WhatsApp y Pedidos
    whatsapp_numero VARCHAR(30) DEFAULT '+59170000000',
    whatsapp_mensaje_template TEXT DEFAULT 'Hola Zairen Lab, deseo confirmar mi pedido:\n\n{items}\n\n*Total a pagar: {moneda} {total}*\n\n¿Tienen disponibilidad para despacho inmediato?',
    
    -- SEO
    sitio_url TEXT DEFAULT 'https://zairenlab.com',
    seo_titulo TEXT DEFAULT 'ZAIREN LAB // Neo-Tokyo Zen Streetwear',
    seo_descripcion TEXT DEFAULT 'Indumentaria experimental streetwear fusionando minimalismo japonés, mecha cyberpunk y cortes oversized de alta confección.',
    seo_imagen_og TEXT DEFAULT '',
    
    -- Redes Sociales Dinámicas (JSONB: array de objetos con name, url, enabled, icon)
    -- Si solo se llena instagram, solo aparece instagram en la web.
    redes_sociales JSONB NOT NULL DEFAULT '[
        {"id": "instagram", "nombre": "Instagram", "url": "https://instagram.com/zairenlab", "activo": true},
        {"id": "tiktok", "nombre": "TikTok", "url": "", "activo": false},
        {"id": "facebook", "nombre": "Facebook", "url": "", "activo": false}
    ]'::jsonb,
    
    -- Canales de contacto adicionales
    canales_contacto JSONB NOT NULL DEFAULT '{
        "whatsapp": {"activo": true, "telefono": "+59170000000"},
        "instagram_dm": {"activo": false, "usuario": "@zairenlab"}
    }'::jsonb,
    
    -- Políticas de Despacho y Envío
    politicas_envio JSONB NOT NULL DEFAULT '{
        "envio_gratis_minimo": 250,
        "costo_envio_express": 15,
        "ciudades_cobertura": ["La Paz", "Cochabamba", "Santa Cruz"]
    }'::jsonb,
    
    -- Apariencia y Contenido Web editable
    apariencia JSONB NOT NULL DEFAULT '{
        "hero_titulo": "NEO-TOKYO ZEN // PROTOCOL 2026",
        "hero_subtitulo": "Experimentación textil inspirada en Shinjuku y subculturas mecha cyberpunk.",
        "badge_hero": "DROP 01 // LIMITADO A 50 PIEZAS",
        "color_acento": "#dc143c"
    }'::jsonb,
    
    -- Taxonomía de Estados de Producto
    estados_producto JSONB NOT NULL DEFAULT '{
        "disponible": {"texto": "DISPONIBLE", "color": "#10B981"},
        "pocas_uds": {"texto": "POCAS UDS", "color": "#F59E0B"},
        "agotado": {"texto": "SOLD OUT", "color": "#EF4444"},
        "preventa": {"texto": "PRE-ORDER", "color": "#8B5CF6"}
    }'::jsonb,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row_config CHECK (id = 1)
);

-- Insertar configuración inicial por defecto
INSERT INTO public.configuracion (id, marca)
VALUES (1, 'ZAIREN LAB')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. TABLA: coleccion (Drops o Categorías de producto)
-- ============================================================
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


-- ============================================================
-- 3. TABLA: producto (Entidad núcleo de catálogo)
-- ============================================================
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
    coleccion_id UUID NOT NULL REFERENCES public.coleccion(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_precio_producto CHECK (precio_venta >= 0),
    CONSTRAINT chk_stock_minimo CHECK (stock_minimo >= 0)
);


-- ============================================================
-- 4. TABLA: atributo_producto (Clave/Valor para máxima adaptabilidad)
-- En ropa: talla, gramaje, tejido. En joyería: material, quilates.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.atributo_producto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE,
    clave VARCHAR(100) NOT NULL,    -- ej: 'talla', 'tejido', 'construccion', 'estampado'
    valor VARCHAR(255) NOT NULL,    -- ej: 'XL', 'Algodón Peinado 280 GSM', 'Doble Pespunte'
    orden INT NOT NULL DEFAULT 0,

    CONSTRAINT uq_atributo_producto UNIQUE (producto_id, clave, valor)
);


-- ============================================================
-- 5. TABLA: imagen (Galería con control estricto de portada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.imagen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    public_id VARCHAR(255),         -- Cloudinary public_id
    tipo VARCHAR(30) DEFAULT 'frontal',  -- frontal, dorsal, detalle, lookbook
    es_portada BOOLEAN NOT NULL DEFAULT FALSE,
    orden INT NOT NULL DEFAULT 0
);

-- Solo una imagen de portada permitida por producto
CREATE UNIQUE INDEX IF NOT EXISTS uq_imagen_portada 
ON public.imagen(producto_id) WHERE es_portada = TRUE;


-- ============================================================
-- 6. TABLA: ubicacion (Sedes, almacenes o tiendas físicas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ubicacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Insertar ubicación por defecto si no existe
INSERT INTO public.ubicacion (nombre, descripcion, activo)
VALUES ('CENTRAL', 'Almacén Central / Despacho Principal', TRUE)
ON CONFLICT (nombre) DO NOTHING;


-- ============================================================
-- 7. TABLA: inventario (Stock físico y reservas por ubicación)
-- ============================================================
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


-- ============================================================
-- 8. TABLA: perfil (Usuarios del sistema y roles RBAC)
-- Vinculado 1:1 con auth.users de Supabase
-- ============================================================
CREATE TABLE IF NOT EXISTS public.perfil (
    id UUID PRIMARY KEY,             -- Igual a auth.users.id
    nombre_completo VARCHAR(150) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'VENDEDOR',
    avatar_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_perfil_rol CHECK (
        rol IN ('SUPERADMIN', 'ADMIN', 'VENDEDOR', 'VISOR')
    )
);


-- ============================================================
-- 9. TABLA: cliente (Historial y fidelización de compradores)
-- ============================================================
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


-- ============================================================
-- 10. TABLA: pedido (Pedidos del catálogo web y WhatsApp)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden INT GENERATED ALWAYS AS IDENTITY,   -- Número secuencial amigable #0001
    cliente_id UUID REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE SET NULL,
    cliente_nombre VARCHAR(150),     -- snapshot de datos
    cliente_telefono VARCHAR(30),    -- snapshot de datos
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

    CONSTRAINT chk_pedido_origen CHECK (
        origen IN ('CATALOGO_WEB', 'WHATSAPP_DIRECTO', 'INSTAGRAM', 'PRESENCIAL')
    ),
    CONSTRAINT chk_pedido_estado CHECK (
        estado IN ('PENDIENTE', 'CONFIRMADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO')
    ),
    CONSTRAINT chk_pedido_reserva CHECK (
        estado_reserva IN ('SIN_RESERVA', 'RESERVADO', 'LIBERADO', 'CONFIRMADO')
    ),
    CONSTRAINT chk_pedido_montos CHECK (
        subtotal >= 0 AND descuento >= 0 AND envio >= 0 AND total >= 0
    ),
    CONSTRAINT chk_descuento_pedido CHECK (descuento <= subtotal)
);


-- ============================================================
-- 11. TABLA: detalle_pedido (Renglones de pedido)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.detalle_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    producto_nombre VARCHAR(200),       -- snapshot
    atributos_snapshot TEXT,            -- ej: "Talla: XL // Algodón Peinado"
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,

    CONSTRAINT chk_det_pedido_cant CHECK (cantidad > 0),
    CONSTRAINT chk_det_pedido_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_det_pedido_subtotal CHECK (subtotal >= 0)
);


-- ============================================================
-- 12. TABLA: venta (Ventas confirmadas en POS o pedidos web cerrados)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ticket INT GENERATED ALWAYS AS IDENTITY,  -- Ticket T-0001
    tipo_venta VARCHAR(30) NOT NULL DEFAULT 'DIRECTA',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    observacion TEXT,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cliente_id UUID REFERENCES public.cliente(id) ON UPDATE CASCADE ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES public.perfil(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    pedido_id UUID UNIQUE REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_tipo_venta CHECK (
        tipo_venta IN ('DIRECTA', 'POS', 'PEDIDO_WEB')
    ),
    CONSTRAINT chk_venta_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_venta_descuento CHECK (descuento >= 0),
    CONSTRAINT chk_venta_total CHECK (total >= 0),
    CONSTRAINT chk_venta_desc_valido CHECK (descuento <= subtotal)
);


-- ============================================================
-- 13. TABLA: detalle_venta (Renglones de venta)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.detalle_venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES public.venta(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.producto(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    ubicacion_id UUID NOT NULL REFERENCES public.ubicacion(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    producto_nombre VARCHAR(200),    -- snapshot
    atributos_snapshot TEXT,         -- snapshot
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,

    CONSTRAINT chk_det_venta_cant CHECK (cantidad > 0),
    CONSTRAINT chk_det_venta_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_det_venta_subtotal CHECK (subtotal >= 0),
    CONSTRAINT uq_detalle_venta UNIQUE (venta_id, producto_id, ubicacion_id)
);


-- ============================================================
-- 14. TABLA: pago (Registro financiero y métodos híbridos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monto NUMERIC(12,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    tipo_pago VARCHAR(20) NOT NULL,
    estado_pago VARCHAR(20) NOT NULL,
    saldo_pendiente NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_efectivo NUMERIC(12,2) DEFAULT 0,
    monto_transferencia NUMERIC(12,2) DEFAULT 0,
    referencia VARCHAR(150),         -- Nro transferencia o ref QR Banco Bisa
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    venta_id UUID REFERENCES public.venta(id) ON UPDATE CASCADE ON DELETE CASCADE,
    pedido_id UUID REFERENCES public.pedido(id) ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT chk_pago_monto CHECK (monto > 0),
    CONSTRAINT chk_pago_saldo CHECK (saldo_pendiente >= 0),
    CONSTRAINT chk_metodo_pago CHECK (
        metodo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'QR_SIMPLE', 'HIBRIDO')
    ),
    CONSTRAINT chk_tipo_pago CHECK (tipo_pago IN ('COMPLETO', 'PARCIAL')),
    CONSTRAINT chk_estado_pago CHECK (estado_pago IN ('PENDIENTE', 'PAGADO')),
    CONSTRAINT chk_pago_origen CHECK (
        (venta_id IS NOT NULL AND pedido_id IS NULL) OR
        (venta_id IS NULL AND pedido_id IS NOT NULL)
    ),
    CONSTRAINT chk_pago_hibrido CHECK (
        (metodo_pago = 'EFECTIVO' AND monto_efectivo = monto) OR
        (metodo_pago IN ('TRANSFERENCIA', 'QR_SIMPLE') AND monto_transferencia = monto) OR
        (metodo_pago = 'HIBRIDO' AND monto_efectivo > 0 AND monto_transferencia > 0
         AND monto_efectivo + monto_transferencia = monto)
    )
);


-- ============================================================
-- 15. TABLA: movimiento_inventario (Kardex y auditoría inmutable)
-- ============================================================
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

    CONSTRAINT chk_movimiento_tipo CHECK (
        tipo_movimiento IN (
            'ENTRADA', 'AJUSTE', 'VENTA', 'RESERVA',
            'CANCELACION_RESERVA', 'LIBERACION_RESERVA',
            'TRASLADO_SALIDA', 'TRASLADO_ENTRADA',
            'PEDIDO_CONFIRMADO', 'PEDIDO_CANCELADO'
        )
    ),
    CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_mov_stock CHECK (
        stock_anterior >= 0 AND stock_nuevo >= 0
        AND reservado_anterior >= 0 AND reservado_nuevo >= 0
    )
);


-- ============================================================
-- 16. TABLA: log_actividad (Timeline administrativo del panel)
-- ============================================================
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

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_producto_coleccion ON public.producto(coleccion_id);
CREATE INDEX IF NOT EXISTS idx_producto_publicado ON public.producto(publicado) WHERE publicado = TRUE;
CREATE INDEX IF NOT EXISTS idx_producto_slug ON public.producto(slug);
CREATE INDEX IF NOT EXISTS idx_atributo_producto_id ON public.atributo_producto(producto_id);
CREATE INDEX IF NOT EXISTS idx_atributo_clave ON public.atributo_producto(clave);
CREATE INDEX IF NOT EXISTS idx_imagen_producto ON public.imagen(producto_id);
CREATE INDEX IF NOT EXISTS idx_inventario_producto ON public.inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_inventario_ubicacion ON public.inventario(ubicacion_id);
CREATE INDEX IF NOT EXISTS idx_pedido_estado ON public.pedido(estado);
CREATE INDEX IF NOT EXISTS idx_pedido_fecha ON public.pedido(created_at);
CREATE INDEX IF NOT EXISTS idx_pedido_cliente ON public.pedido(cliente_id);
CREATE INDEX IF NOT EXISTS idx_venta_fecha ON public.venta(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_venta_usuario ON public.venta(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mov_producto ON public.movimiento_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_mov_fecha ON public.movimiento_inventario(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_log_fecha ON public.log_actividad(created_at);
CREATE INDEX IF NOT EXISTS idx_cliente_telefono ON public.cliente(telefono);
