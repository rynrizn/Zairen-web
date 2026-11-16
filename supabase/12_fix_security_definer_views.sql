-- ============================================================
-- ZAIREN LAB // SUPABASE SQL SCHEMA v2
-- ARCHIVO 12: MIGRACIÓN DE SEGURIDAD PARA VISTAS (SECURITY INVOKER)
-- Resuelve las alertas 'Security Definer View' (CRITICAL) en Supabase Advisor
-- ============================================================

-- Contexto:
-- En PostgreSQL 15+, las vistas en esquemas expuestos a la API (como public)
-- deben definirse con la propiedad `security_invoker = true`.
-- Esto garantiza que las vistas ejecuten las consultas respetando los permisos
-- y las políticas Row Level Security (RLS) del usuario que realiza la consulta
-- (anon o authenticated) en lugar de usar los permisos del creador (postgres).

-- 1. Modificar las vistas existentes en caliente sin alterar dependencias:
ALTER VIEW public.vw_catalogo_publico SET (security_invoker = true);
ALTER VIEW public.vw_inventario SET (security_invoker = true);
ALTER VIEW public.vw_stock_bajo SET (security_invoker = true);
ALTER VIEW public.vw_historial_cliente SET (security_invoker = true);
ALTER VIEW public.vw_reporte_ventas SET (security_invoker = true);

-- 2. Asegurar permisos de lectura en las vistas:
GRANT SELECT ON public.vw_catalogo_publico TO anon, authenticated;
GRANT SELECT ON public.vw_inventario TO authenticated;
GRANT SELECT ON public.vw_stock_bajo TO authenticated;
GRANT SELECT ON public.vw_historial_cliente TO authenticated;
GRANT SELECT ON public.vw_reporte_ventas TO authenticated;
