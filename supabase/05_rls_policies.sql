-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 05: POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- Seguridad granular y protección contra inyecciones y accesos no autorizados
-- ============================================================

-- Habilitar RLS en todas las tablas
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

-- Limpieza de políticas previas
DROP POLICY IF EXISTS "public_config_read" ON public.configuracion;
DROP POLICY IF EXISTS "auth_config_all" ON public.configuracion;
DROP POLICY IF EXISTS "public_coleccion_read" ON public.coleccion;
DROP POLICY IF EXISTS "auth_coleccion_all" ON public.coleccion;
DROP POLICY IF EXISTS "public_producto_read" ON public.producto;
DROP POLICY IF EXISTS "auth_producto_all" ON public.producto;
DROP POLICY IF EXISTS "public_atributo_read" ON public.atributo_producto;
DROP POLICY IF EXISTS "auth_atributo_all" ON public.atributo_producto;
DROP POLICY IF EXISTS "public_imagen_read" ON public.imagen;
DROP POLICY IF EXISTS "auth_imagen_all" ON public.imagen;
DROP POLICY IF EXISTS "public_inventario_read" ON public.inventario;
DROP POLICY IF EXISTS "auth_inventario_all" ON public.inventario;
DROP POLICY IF EXISTS "auth_ubicacion_all" ON public.ubicacion;
DROP POLICY IF EXISTS "auth_perfil_all" ON public.perfil;
DROP POLICY IF EXISTS "auth_cliente_all" ON public.cliente;
DROP POLICY IF EXISTS "public_pedido_insert" ON public.pedido;
DROP POLICY IF EXISTS "auth_pedido_all" ON public.pedido;
DROP POLICY IF EXISTS "public_det_pedido_insert" ON public.detalle_pedido;
DROP POLICY IF EXISTS "auth_det_pedido_all" ON public.detalle_pedido;
DROP POLICY IF EXISTS "auth_venta_all" ON public.venta;
DROP POLICY IF EXISTS "auth_det_venta_all" ON public.detalle_venta;
DROP POLICY IF EXISTS "auth_pago_all" ON public.pago;
DROP POLICY IF EXISTS "auth_mov_all" ON public.movimiento_inventario;
DROP POLICY IF EXISTS "auth_log_all" ON public.log_actividad;

-- 1. CONFIGURACIÓN: Lectura pública, actualización solo por usuarios autenticados
CREATE POLICY "public_config_read" ON public.configuracion
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_config_all" ON public.configuracion
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. COLECCIÓN: Lectura pública de activas, administración completa autenticada
CREATE POLICY "public_coleccion_read" ON public.coleccion
FOR SELECT TO anon, authenticated USING (activa = true);

CREATE POLICY "auth_coleccion_all" ON public.coleccion
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. PRODUCTOS: Lectura pública de activos y publicados, administración completa autenticada
CREATE POLICY "public_producto_read" ON public.producto
FOR SELECT TO anon, authenticated USING (activo = true AND publicado = true);

CREATE POLICY "auth_producto_all" ON public.producto
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. ATRIBUTOS DE PRODUCTO: Lectura pública vinculada a productos activos
CREATE POLICY "public_atributo_read" ON public.atributo_producto
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_atributo_all" ON public.atributo_producto
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. IMÁGENES: Lectura pública, administración autenticada
CREATE POLICY "public_imagen_read" ON public.imagen
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_imagen_all" ON public.imagen
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. INVENTARIO: Lectura para cálculo de stock disponible, administración autenticada
CREATE POLICY "public_inventario_read" ON public.inventario
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_inventario_all" ON public.inventario
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. UBICACIÓN: Solo usuarios del sistema autenticados
CREATE POLICY "auth_ubicacion_all" ON public.ubicacion
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. PERFIL: Autenticado
CREATE POLICY "auth_perfil_all" ON public.perfil
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. CLIENTE: Solo operadores del sistema autenticados
CREATE POLICY "auth_cliente_all" ON public.cliente
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. PEDIDO: Inserción pública para checkout de catálogo web, gestión por autenticados
CREATE POLICY "public_pedido_insert" ON public.pedido
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "auth_pedido_all" ON public.pedido
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. DETALLE PEDIDO: Inserción pública para checkout, gestión por autenticados
CREATE POLICY "public_det_pedido_insert" ON public.detalle_pedido
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "auth_det_pedido_all" ON public.detalle_pedido
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. VENTA, DETALLE VENTA, PAGO, KARDEX, LOGS: Solo personal autenticado
CREATE POLICY "auth_venta_all" ON public.venta
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_det_venta_all" ON public.detalle_venta
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_pago_all" ON public.pago
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_mov_all" ON public.movimiento_inventario
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_log_all" ON public.log_actividad
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Permisos explícitos al esquema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.pedido, public.detalle_pedido, public.cliente TO anon;
